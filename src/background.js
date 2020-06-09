chrome.runtime.onInstalled.addListener(function(request, sender, sendResponse) {
  requestNotification();
});
let timerId = null;
let initTime = new Date();
let remainingTime = 0;
let interval = 1000;
let port = null;
let portConnected = false;

let times = [];
let workCycleLimit = 0;
let autoResume = true;
let permissionStatus = false;
let notificationTurned = false;

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

retrieveUserSettings();
requestNotification();
console.log(notif);

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
  } else if (request.event === "get") {
    const time = timer.state === 0 ? getDefaultTimeinSeconds() : timer.time | 0;
    sendResponse({
      time: time,
      state: timer.state,
      status: timer.pomodoroStatus,
    });
  } else if (request.event === "status" && !isNaN(request.status)) {
    timer.pomodoroStatus = request.status;
    timer.workCycle = 0;
    timer.time = getDefaultTimeinSeconds();
    resetTimer();
  } else if (request.event === "saved") {
    retrieveUserSettings();
  }
});

function startTimer(time) {
  timer.time = time;
  openConnection();
  timerId = window.setInterval(timerCycle, interval);
  timer.state = 1;
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

function resetTimer() {
  window.clearInterval(timerId);
  timerId = null;
  timer.state = 0;
  timer.time = getDefaultTimeinSeconds();
}

function timerCycle() {
  timer.time--;
  if (timer.time < 0) {
    resetTimer();
    if (autoResume) {
      finishCycle();
    }
  }
}

function finishCycle() {
  if (timer.pomodoroStatus === 0) {
    timer.workCycle++;
    if (timer.workCycle >= workCycleLimit) {
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

function getDefaultTimeinSeconds() {
  return times[timer.pomodoroStatus];
}

function openConnection() {
  port = chrome.runtime.connect({ name: "timer" });
  if (port) portConnected = true;
  port.onDisconnect.addListener(() => (portConnected = false));
}

function requestNotification() {
  chrome.notifications.getPermissionLevel(function(permission) {
    permissionStatus = permission === "granted" && notificationTurned;
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

function retrieveUserSettings() {
  chrome.storage.sync.get("settings", function(result) {
    console.log(result);
    const settings = result.settings;
    times = settings
      ? [settings.work, settings.rest, settings.long]
      : [25 * 60, 5 * 60, 10 * 60];
    workCycleLimit = settings ? settings.workCycle : 4;
    autoResume = settings ? settings.autoResume : true;
    notificationTurned = settings ? settings.notifications : true;
  });
}
