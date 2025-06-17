// 🌐 Global Variables
let currentQuestionIndex = 0;
let questions = [];
let hints = {};
let userAnswers = [];
let studentId = "";

// 📥 Load Questions and Hints
Promise.all([
  fetch("questions.json").then(res => res.json()),
  fetch("hints.json").then(res => res.json())
]).then(([q, h]) => {
  questions = q;
  h.forEach(item => hints[item.id] = item.text);
  document.getElementById("startBtn").addEventListener("click", startQuiz);
});

// 🚀 Start Quiz
function startQuiz() {
  studentId = document.getElementById("studentIdInput").value.trim();
  if (!studentId) {
    alert("Please enter your Student ID.");
    return;
  }
  document.getElementById("studentEntry").style.display = "none";
  document.getElementById("quizContainer").style.display = "block";
  showQuestion();
}

// 🔄 Show Current Question
function showQuestion() {
  const question = questions[currentQuestionIndex];
  document.getElementById("questionNumber").textContent = `${currentQuestionIndex + 1}/${questions.length}`;
  document.getElementById("questionText").textContent = question.questionText;

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";
  question.choices.forEach(choice => {
    const label = document.createElement("label");
    label.className = "choice-label";
    label.innerHTML = `<input type="radio" name="choice" value="${choice}" /> ${choice}`;
    choicesDiv.appendChild(label);
  });

  document.getElementById("hintText").textContent = "";
  document.getElementById("feedbackText").textContent = "";
  document.getElementById("submitBtn").style.display = "inline-block";
  document.getElementById("nextBtn").style.display = "none";
}

// ✅ Submit Answer
function submitAnswer() {
  const selected = document.querySelector("input[name='choice']:checked");
  if (!selected) {
    alert("Please select an answer.");
    return;
  }
  const answer = selected.value;
  const question = questions[currentQuestionIndex];
  const isCorrect = answer === question.answer;
  userAnswers[currentQuestionIndex] = {
    questionId: question.id,
    selected: answer,
    correct: isCorrect
  };

  // Display feedback
  const feedback = isCorrect ? question.feedback_correct : question.feedback_wrong;
  document.getElementById("feedbackText").textContent = feedback;

  // Display hint
  const hint = hints[question.hintId] || "";
  document.getElementById("hintText").textContent = `Hint: ${hint}`;

  document.getElementById("submitBtn").style.display = "none";
  document.getElementById("nextBtn").style.display = "inline-block";
}

// ⏭ Next Question
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
}

// 📊 Show Results
function showResults() {
  document.getElementById("quizContainer").style.display = "none";
  document.getElementById("resultContainer").style.display = "block";

  const correctCount = userAnswers.filter(a => a.correct).length;
  document.getElementById("score").textContent = `You got ${correctCount} out of ${questions.length} questions right.`;

  // Submit to spreadsheet
  submitToSpreadsheet();
}

// 📤 Submit Data to Spreadsheet
function submitToSpreadsheet() {
  userAnswers.forEach(ans => {
    fetch("https://relative-clause-quiz-vercel.vercel.app/api/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        questionId: ans.questionId,
        userAnswer: ans.selected,
        score: ans.correct ? 2 : 0,
        attempt: 1
      })
    }).then(res => res.json()).then(data => {
      console.log("✅ Sent:", data);
    }).catch(err => console.error("❌ Error:", err));
  });
}

// 🧠 Event Listeners
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("submitBtn").addEventListener("click", submitAnswer);
  document.getElementById("nextBtn").addEventListener("click", nextQuestion);
});
