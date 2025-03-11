const apiValue = document.querySelector("#api-key")
const saveBtn = document.querySelector("#save-btn")
const getBtn = document.querySelector("#get-btn")
const msg = document.getElementById("message")
const label = document.getElementById("label")
const inputContainer = document.querySelector(".input-container")
saveBtn.addEventListener("click", () => {
  let value = apiValue.value
  saveAPIKey(value)
  inputContainer.style.display = "none"
  saveBtn.style.display = "none"
  getBtn.style.display = "none"
  let status
  if (value === "") status = "removed"
  else status = "saved"
  msg.textContent = `✅ Your api key ${status}   Succcessfully..`
  msg.style.display = "block"

  setTimeout(() => {
    window.close()
  }, 2000)
})

getBtn.addEventListener("click", async () => {
  const { apiKey } = await chrome.storage.local.get(["apiKey"])
  if (apiKey) msg.textContent = "Your api key is " + apiKey
  else msg.textContent = "You dont have any API key saved"
  saveBtn.style.display = "none"
  inputContainer.style.display = "none"
  getBtn.style.display = "none"

  msg.style.display = "block"
  msg.style.color = "green"
  //location.replace("popup/index.html")
  setTimeout(() => {
    window.close()
  }, 2000)
})

function saveAPIKey(apiKey) {
  if (apiKey === "") {
    chrome.storage.local.remove("apiKey", () => {
      console.log("APi key removed successfully")
    })
    return
  }
  chrome.storage.local.set({ apiKey }, () => {
    console.log("API key saved sucessfully")
    chrome.runtime.sendMessage({ action: "apiKeySaved" })
  })
}
