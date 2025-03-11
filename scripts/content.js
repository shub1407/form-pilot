function main(apiKey) {
  function extractQuestion() {
    const questions = document.querySelectorAll(".M7eMe")
    let array = []

    questions.forEach((question) => {
      let obj = {
        question: question.innerText,
        options: [],
      }

      question
        .closest(".geS5n")
        .querySelectorAll(".aDTYNe")
        .forEach((option) => {
          obj.options.push(option.innerText)
        })

      array.push(obj)
    })

    return array
  }

  async function generateAnswerWithAI(questions) {
    let API_KEY = apiKey
    if (!apiKey) {
      return { error: true, message: "API key not found!! Save it to use" }
    }
    let SYSTEM_PROMPT = `
        You are helpful assistance. You are given with an array of questions with options. You have to find the correct option from these given options.
        
        EXAMPLE: 
        [
            {
                "question": "Prime minister of india",
                "options": [
                    "Narendra Modi",
                    "Vladimir Putin",
                    "Arvind Kejriwal",
                    "Donald Trump"
                ]
            },
            {
                "question": "Capital of india",
                "options": [
                    "New Delhi",
                    "Kolkata",
                    "Mumbai",
                    "Jharkhand"
                ]
            }
        ]
        
        You have to return an array of correct answers like:
        ["Narendra Modi", "New Delhi"]
  
        Don't give any explanation. Just return plain array of answers.
      `

    let questionsString = JSON.stringify(questions)

    let errorMessage = null

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: questionsString },
            ],
            temperature: 0.7,
          }),
        }
      )

      if (response.status === 401) {
        errorMessage = "❌ Api Key Not Valid: Please check your API Key."

        return { error: true, message: errorMessage, data: null }
      }

      if (!response.ok) {
        const errorData = response

        errorMessage =
          errorData.error?.message || `Unexpected Error: ${response.statusText}`

        return { error: true, message: errorMessage, data: null }
      }

      const data = await response.json()
      let answer = JSON.parse(data?.choices[0]?.message?.content)
      return { error: false, data: answer }
    } catch (error) {
      return { error: true, message: errorMessage, data: null }
    }
  }

  async function autoSelector() {
    const questions = extractQuestion()
    let response = await generateAnswerWithAI(questions)

    if (response.error) {
      //sending to poup to display the error message
      chrome.runtime.sendMessage({
        action: "formFillFailed",
        message: response.message,
      })
      return
    }
    let answers = response.data

    let questionsExtracted = document.querySelectorAll(".M7eMe")

    questionsExtracted.forEach((ques, index) => {
      let ans = answers[index]

      let allOptions = Array.from(
        ques.closest(".geS5n").querySelectorAll(".aDTYNe")
      )

      let correctOption = allOptions.find((option) =>
        option.innerText.includes(ans)
      )

      if (correctOption) {
        correctOption.click()
      }
    })

    chrome.runtime.sendMessage({ action: "formFilledSuccess" })
  }
  autoSelector()
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fillForm") {
    const apiKey = message.apiKey

    main(apiKey)
  }
})
