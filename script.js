let currentQuestionIndex = 0;
let questions = [];
let hints = {};
let studentId = "";
let userAnswers = [];

const quizContent = document.getElementById("quizContent");
const questionText = document.getElementById("questionText");
const questionNumber = document.getElementById("questionNumber");
const choicesDiv = document.getElementById("choices");
const feedbackDiv = document.getElementById("feedback");
const hintText = document.getElementById("hintText");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const studentEntry = document.getElementById("studentEntry");
const studentIdInput = document.getElementById("studentIdInput");
const startBtn = document.getElementById("startBtn");
const scoreDiv = document.getElementById("score");

startBtn.addEventListener("click", () => {
  studentId = studentIdInput.value.trim();
  if (studentId === "") {
    alert("Please enter your Student ID.");
    return;
  }
  studentEntry.style.display = "none";
  quizContent.style.display = "block";
  loadQuestion();
});

function loadQuestion() {
  const question = questions[currentQuestionIndex];
  questionText.textContent = question.questionText;
  questionNumber.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

  choicesDiv.innerHTML = "";
  question.choices.forEach(choice => {
    const label = document.createElement("label");
    label.className = "choice-label";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "choice";
    input.value = choice;
    label.appendChild(input);
    label.appendChild(document.createTextNode(" " + choice));
    choicesDiv.appendChild(label);
  });

  feedbackDiv.textContent = "";
  hintText.classList.add("hidden");
  nextBtn.classList.remove("hidden");
  submitBtn.classList.add("hidden");
}

nextBtn.addEventListener("click", () => {
  const selected = document.querySelector("input[name='choice']:checked");
  if (!selected) {
    alert("Please select an answer.");
    return;
  }

  const question = questions[currentQuestionIndex];
  const isCorrect = selected.value === question.answer;
  const score = isCorrect ? 2 : 0;
  const feedback = isCorrect ? question.feedback_correct : question.feedback_wrong;

  feedbackDiv.innerHTML = isCorrect
    ? `✅✅ ${feedback}`
    : `❌ ${feedback}`;

  if (question.hintId && hints[question.hintId]) {
    hintText.textContent = "💡 " + hints[question.hintId];
    hintText.classList.remove("hidden");
  }

  userAnswers.push({
    questionId: question.id,
    selected: selected.value,
    correct: isCorrect,
  });

  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    nextBtn.textContent = "Next";
    nextBtn.removeEventListener("click", loadQuestion);
    nextBtn.addEventListener("click", loadQuestionAndReset);
  } else {
    nextBtn.classList.add("hidden");
    submitBtn.classList.remove("hidden");
    showScore();
  }
});

function loadQuestionAndReset() {
  nextBtn.removeEventListener("click", loadQuestionAndReset);
  loadQuestion();
}

submitBtn.addEventListener("click", submitToSpreadsheet);

function showScore() {
  const correctCount = userAnswers.filter(ans => ans.correct).length;
  scoreDiv.innerHTML = `<div class="score-banner">🎉 Quiz complete!</div><div class="score-result">You scored ${correctCount} out of ${questions.length}.</div>`;
  scoreDiv.style.display = "block";
}

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
      }),
    });
  });
  alert("✅ Your answers have been submitted. Thank you!");
}

// Load questions and hints
Promise.all([
  fetch("questions.json").then(res => res.json()),
  fetch("hints.json").then(res => res.json())
]).then(([loadedQuestions, loadedHints]) => {
  questions = loadedQuestions;
  hints = loadedHints;
}).catch(error => {
  console.error("Failed to load data:", error);
  questionText.textContent = "⚠️ Failed to load quiz.";
});
