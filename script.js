document.getElementById("myButton").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "executeContentScript" })
})

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "showSuccessMessage") {
    const msg = document.getElementById("message")
    msg.style.display = "block"
    msg.textContent = "✅ Form Filled Successfully!"
    msg.style.color = "green"

    // ✅ Auto-close the popup after 3 seconds (Optional)
    setTimeout(() => {
      window.close()
    }, 3000)
  }
})
