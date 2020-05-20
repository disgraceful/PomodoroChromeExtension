chrome.runtime.onInstalled.addListener(function(request, sender, sendResponse) {
  console.log("Hello from the background");
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(request.event);
  if (request.event === "start" && !timerId) {
    console.log("Start recieved");
    startTimer();
  } else if (request.event === "start") {
    console.log("Continue");
    resumeTimer();
  } else if (request.event === "pause") {
    console.log("Pause recieved");
    pauseTimer();
  } else if (request.event === "reopen") {
    console.log("Reopening connection");
    startConnection();
  }
});

let timerId = null;
let initTime = new Date();
let remainingTime = 0;
let activeTime = 0;
let state = 0; //0 = init, 1 = running, 2 = paused
let interval = 1000;
let port = null;

let portConnected = false;

function timerCycle() {
  activeTime++;
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

function startConnection() {
  port = chrome.runtime.connect({ name: "timer" });
  if (port) portConnected = true;
  port.onDisconnect.addListener(() => {
    portConnected = false;
    const paused = state === 2 ? true : false;
    chrome.storage.local.set({ time: activeTime, paused }, () =>
      console.log("set", activeTime)
    );
  });
}
