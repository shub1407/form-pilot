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
        ?.querySelectorAll(".aDTYNe")
        ?.forEach((option) => {
          obj.options.push(option.innerText)
        })

      array.push(obj)
    })
    const titleOfForm = document.querySelector(".F9yp7e").innerText
    console.log(array)

    return [array, titleOfForm]
  }

  async function generateAnswerWithAI(titleOfForm, questions) {
    let API_KEY = apiKey
    if (!apiKey) {
      return { error: true, message: "API key not found!! Save it to use" }
    }
    let SYSTEM_PROMPT = `
        You are helpful assistance. You are given with an array of questions with options.
        These questions are of ${titleOfForm}.So, prepare yoour answer on this basis only. 
        You have to find the correct option from these given options.
        
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
        --IMPORTANT
        
        1.You have to return an array of correct answers like:["Narendra Modi", "New Delhi"]
        2. If particular option is correct you have to give complete option like "Narendra Modi" not only option number like a
 
        3.Strictly give answer for each question, if question or option is blank just give the blank answer
        4.if no of questions is n then no of answer in the arraay must be n & in that order only.
  
        Don't give any explanation. Just return plain array of answers.
      `

    let questionsString = JSON.stringify(questions)

    let errorMessage = null
    let models = [
      "gemma2-9b-it",
      "llama-3.3-70b-versatile",
      "deepseek-r1-distill-llama-70b",
    ]
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
            model: models[1],
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
        console.log(response)

        errorMessage =
          response.status === 429
            ? "Too many request, try after some time!!"
            : `Unexpected Error: ${response.statusText}`

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
    const [questions, titleOfForm] = extractQuestion()
    console.log(titleOfForm)
    let response = await generateAnswerWithAI(titleOfForm, questions)

    if (response.error) {
      //sending to poup to display the error message
      chrome.runtime.sendMessage({
        action: "formFillFailed",
        message: response.message,
      })
      return
    }
    let answers = response.data
    console.log(answers)

    let questionsExtracted = document.querySelectorAll(".M7eMe")

    questionsExtracted.forEach((ques, index) => {
      let ans = answers[index]

      if (!ans) {
        console.error(`Answer at index ${index} is undefined.`)
        return // Skip this question if no answer is found
      }

      // Remove parentheses, letters like "(b)", and trailing periods
      let formattedAns = removeOptionLabel(ans)
      console.log(formattedAns)

      let node = ques.closest(".geS5n")?.querySelectorAll(".aDTYNe")
      if (!node) return
      allOptions = Array.from(node)

      // Normalize options: remove letters like "a)", "b)", etc.
      let formattedOptions = allOptions.map((option) => ({
        element: option,
        text: removeOptionLabel(option.innerText),
      }))

      let correctOption = formattedOptions.find(
        (option) =>
          formattedAns === option.text ||
          option.text.includes(formattedAns) ||
          formattedAns.includes(option.text)
      )?.element

      if (correctOption) {
        correctOption.click()
      } else {
        console.log("------- ERROR ----------")
        console.log("Searching for:", formattedAns)
        console.log("Available options:")
        formattedOptions.forEach((option) => console.log(option.text))
        console.log("----------- ERROR END -------------")
      }
    })

    chrome.runtime.sendMessage({ action: "formFilledSuccess" })
  }
  autoSelector()
}
function removeOptionLabel(text) {
  return text.replace(/^\(?[a-dA-D]\)?[.)]?\s*/, "").toLowerCase()
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fillForm") {
    const apiKey = message.apiKey

    main(apiKey)
  }
})
