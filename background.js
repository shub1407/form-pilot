chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"],
  })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "executeContentScript") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ["content.js"],
      })
    })
  }
  if (message.action === "formFilledSuccess") {
    chrome.runtime.sendMessage({ action: "showSuccessMessage" })
  }
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    if (tab.url.includes("docs.google.com/forms")) {
      chrome.action.setPopup({ popup: "index.html" })
    } else {
      chrome.action.setPopup({ popup: "not-supported.html" })
    }
  }
})

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url.includes("docs.google.com/forms")) {
      chrome.action.setPopup({ popup: "index.html" })
    } else {
      chrome.action.setPopup({ popup: "not-supported.html" })
    }
  })
})
