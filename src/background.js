chrome.runtime.onInstalled.addListener(function(request, sender, sendResponse) {
  console.log("Hello from the background");
});
let timerId = null;
let initTime = new Date();
let remainingTime = 0;
let defaultTime = 0;
let interval = 1000;
let port = null;
let portConnected = false;
let defaultTimes = [25, 5, 10];
let autoResume = true;
let permissionStatus = false;

const messenger = {
  set: function(target, property, value) {
    target[property] = value;
    if (portConnected) {
      const msg = {
        time: timer.time,
        state: timer.state,
        status: timer.pomodoroStatus,
        cycle: timer.workCycle,
      };
      port.postMessage(msg);
    }
    return true;
  },
};

const timer = new Proxy(
  {
    time: 0,
    state: 0, //0 = init, 1 = running, 2 = paused,
    pomodoroStatus: 0, // 0=work, 1= break, 2 = longbreak;
    workCycle: 0,
  },
  messenger
);

requestNotification();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.event === "start" && !timerId) {
    console.log("Starting timer");
    startTimer(getDefaultTimeinSeconds());
  } else if (request.event === "start") {
    console.log("Continuing timer");
    resumeTimer();
  } else if (request.event === "pause") {
    console.log("Pauseing timer");
    pauseTimer();
  } else if (request.event === "reopen") {
    console.log("Reopening connection");
    openConnection();
  } else if (request.event === "reset") {
    console.log("Resetting timer");
    resetTimer();
  } else if (request.event === "set") {
    console.log("Finishing timer");
    timer.time = 2;
  } else if (request.event === "get") {
    const time = timer.state === 0 ? getDefaultTimeinSeconds() : timer.time | 0;
    sendResponse({ time: time, state: timer.state });
  } else if (request.event === "status" && !isNaN(request.status)) {
    timer.pomodoroStatus = request.status;
    timer.workCycle = 0;
    defaultTime = getDefaultTimeinSeconds();
    timer.time = getDefaultTimeinSeconds();
    resetTimer();
  }
});

function timerCycle() {
  timer.time--;
  if (timer.time < 0) {
    console.log("time's up");
    resetTimer();
    if (autoResume) {
      finishCycle();
    }
  }
  console.log("time ", timer.time);
}

function pauseTimer() {
  if (timer.state != 1) return;
  remainingTime = interval - (new Date() - initTime);
  window.clearInterval(timerId);
  timer.state = 2;
}

function resumeTimer() {
  if (timer.state != 2) return;
  window.setTimeout(function() {
    timerCycle();
    initTime = new Date();
    timerId = window.setInterval(timerCycle, interval);
    timer.state = 1;
  }, remainingTime);
}

function startTimer(time) {
  defaultTime = time;
  timer.time = time;
  openConnection();
  timerId = window.setInterval(timerCycle, interval);
  timer.state = 1;
}

function resetTimer() {
  window.clearInterval(timerId);
  timerId = null;
  timer.state = 0;
  timer.time = defaultTime;
}

function openConnection() {
  port = chrome.runtime.connect({ name: "timer" });
  if (port) portConnected = true;
  port.onDisconnect.addListener(() => (portConnected = false));
}

function getDefaultTimeinSeconds() {
  return defaultTimes[timer.pomodoroStatus] * 60;
}

function finishCycle() {
  if (timer.pomodoroStatus === 0) {
    timer.workCycle++;
    if (timer.workCycle >= 4) {
      createNotification();
      timer.workCycle = 0;
      timer.pomodoroStatus = 2;
    } else {
      createNotification();
      timer.pomodoroStatus = 1;
    }
  } else {
    createNotification();
    timer.pomodoroStatus = 0;
  }
  startTimer(getDefaultTimeinSeconds());
}

function requestNotification() {
  chrome.notifications.getPermissionLevel(function(permission) {
    console.log(permission);
    permissionStatus = permission === "granted";
  });
}

function createNotification() {
  if (permissionStatus) {
    chrome.notifications.create({
      type: "basic",
      title: "Pomodoro Timer",
      message:
        timer.pomodoroStatus === 0
          ? `Work session ${timer.workCycle} is over, take a break!`
          : "Break is over, get to work!",
      iconUrl: "./icons/128.png",
    });
  }
}
