chrome.runtime.onInstalled.addListener(() => {
  let a = b()
  chrome.storage.local.set({ apiKey: a, count: 0 }, () => {
    console.log("default API key is set")
  })
})

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "executeContentScript") {
    // Get the active tab and send the message to content.js
    let { apiKey, count } = await chrome.storage.local.get(["apiKey", "count"])

    if (count !== "activated" && count >= 10) {
      chrome.runtime.sendMessage({
        action: "formFillFailed",
        message:
          "You have used your limit of free API. Now use your own API key by creating account on groq cloud..",
      })
      return
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs[0].url.includes("docs.google.com/forms")) {
        chrome.runtime.sendMessage({
          action: "formFillFailed",
          message: "!!This is not a google form!!!",
        })
        return
      }
      try {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "fillForm",
          apiKey: apiKey,
        })
      } catch (error) {
        chrome.runtime.sendMessage({
          action: "formFillFailed",
          message: "Some error occured!!! Refresh the page & try again.",
        })
      }
    })
  }
  if (message.action === "formFilledSuccess") {
    let { count } = await chrome.storage.local.get(["count"])
    if (count !== "activated")
      chrome.storage.local.set({ count: count + 1 }, () => {
        console.log("Count increased")
      })
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
function b() {
  let c = [
    [103, 115, 107, 95, 118],
    [81, 52, 75, 108, 83],
    [113, 108, 56, 83, 70],
    [100, 98, 66, 112, 81],
    [115, 86, 71, 104, 87],
    [71, 100, 121, 98, 51],
    [70, 89, 69, 99, 49],
    [121, 106, 65, 90, 83],
    [70, 73, 116, 72, 67],
    [75, 90, 100, 82, 49],
    [67, 56, 113, 57, 113],
    [68],
  ]

  let a = ""
  c.forEach((part) => {
    part.forEach((num) => (a += String.fromCharCode(num)))
  })

  return a
}
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
