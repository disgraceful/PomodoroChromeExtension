chrome.runtime.onInstalled.addListener(function(request, sender, sendResponse) {
  console.log("Hello from the background");

  chrome.tabs.executeScript({
    file: "content-script.js",
  });
});
