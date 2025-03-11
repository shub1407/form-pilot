chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "executeContentScript") {
    // Get the active tab and send the message to content.js
    const { apiKey } = await chrome.storage.local.get(["apiKey"])

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "fillForm",
        apiKey: apiKey,
      })
    })
  }
  if (message.action === "formFilledSuccess") {
    chrome.runtime.sendMessage({ action: "showSuccessMessage" })
  }
  if (message.action === "apiKeySaved") {
    chrome.action.setPopup({ popup: "/popup/index.html" })
  }
})

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    setPopup(tab)
  }
})

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    setPopup(tab)
  })
})

function setPopup(tab) {
  if (tab.url.includes("docs.google.com/forms")) {
    chrome.storage.local.get(["apiKey"], (result) => {
      if (result.apiKey) {
        chrome.action.setPopup({ popup: "/popup/index.html" })
      } else {
        chrome.action.setPopup({ popup: "/popup/api-key.html" })
      }
    })
  } else {
    chrome.action.setPopup({ popup: "/popup/not-supported.html" })
  }
}
