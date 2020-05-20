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

const messenger = {
  set: function(target, property, value) {
    console.log("setter");
    console.log(target, property, value);
    target[property] = value;
    if (portConnected) {
      const msg = { time: timer.time, state: timer.state };
      console.log(msg);
      port.postMessage(msg);
    }
    return true;
  },
};
const timer = new Proxy(
  {
    time: 0,
    state: 0, //0 = init, 1 = running, 2 = paused
  },
  messenger
);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.event === "start" && !timerId) {
    console.log("Starting timer");
    defaultTime = request.time;
    timer.time = defaultTime;
    startTimer();
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
    sendResponse({ time: timer.time, state: timer.state });
  }
});

function timerCycle() {
  timer.time--;
  if (timer.time < 0) {
    console.log("time's up");
    resetTimer();
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

function startTimer() {
  openConnection();
  timerId = setInterval(timerCycle, interval);
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
