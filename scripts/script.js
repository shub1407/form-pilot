document.getElementById("myButton").addEventListener("click", () => {
  const btn = document.getElementById("myButton")
  const loader = document.getElementById("loader")
  btn.style.display = "none"
  loader.style.display = "block"
  chrome.runtime.sendMessage({ action: "executeContentScript" })
})

chrome.runtime.onMessage.addListener((message) => {
  const loader = document.getElementById("loader")

  loader.style.display = "none"
  if (message.action === "showSuccessMessage") {
    const btn = document.getElementById("myButton")
    const apiKeyLink = document.getElementById("api-key")
    apiKeyLink.style.display = "none"
    btn.style.display = "none"
    const msg = document.getElementById("message")
    msg.style.display = "block"
    msg.textContent = "✅ Form Filled Successfully!"
    msg.style.color = "green"

    setTimeout(() => {
      window.close()
    }, 3000)
  }

  if (message.action === "formFillFailed") {
    const btn = document.getElementById("myButton")
    btn.style.display = "none"
    const msg = document.getElementById("message")
    msg.style.display = "block"
    msg.textContent = message.message
    msg.style.color = "red"
  }
})
