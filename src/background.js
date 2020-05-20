chrome.runtime.onInstalled.addListener(function(request, sender, sendResponse) {
  console.log("Hello from the background");
});
let timerId = null;
let initTime = new Date();
let remainingTime = 0;
let defaultTime = 0;
let activeTime = 0;
let state = 0; //0 = init, 1 = running, 2 = paused
let interval = 1000;
let port = null;
let portConnected = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.event === "start" && !timerId) {
    console.log("Starting timer");
    defaultTime = request.time;
    activeTime = defaultTime;
    startTimer();
  } else if (request.event === "start") {
    console.log("Continuing timer");
    resumeTimer();
  } else if (request.event === "pause") {
    console.log("Pauseing timer");
    pauseTimer();
  } else if (request.event === "reopen") {
    console.log("Reopening connection");
    startConnection();
  } else if (request.event === "reset") {
    console.log("Resetting timer");
    resetTimer();
  } else if (request.event === "set") {
    console.log("Finishing timer");
    activeTime = 2;
  }
});

function timerCycle() {
  activeTime--;
  if (activeTime < 0) {
    console.log("time's up");
    resetTimer();
  }
  console.log("time ", activeTime);
  if (portConnected) {
    port.postMessage(activeTime);
  }
}

function pauseTimer() {
  if (state != 1) return;
  remainingTime = interval - (new Date() - initTime);
  window.clearInterval(timerId);
  state = 2;
}

function resumeTimer() {
  if (state != 2) return;
  window.setTimeout(function() {
    timerCycle();
    initTime = new Date();
    timerId = window.setInterval(timerCycle, interval);
    state = 1;
  }, remainingTime);
}

function startTimer() {
  startConnection();
  timerId = setInterval(timerCycle, interval);
  state = 1;
}

function resetTimer() {
  window.clearInterval(timerId);
  timerId = null;
  state = 0;
  activeTime = defaultTime;
}

function startConnection() {
  port = chrome.runtime.connect({ name: "timer" });
  if (port) portConnected = true;
  port.onDisconnect.addListener(() => {
    portConnected = false;
    chrome.storage.local.set({ time: activeTime, state }, () =>
      console.log("set", activeTime, state)
    );
  });
}
