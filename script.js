// ✅ script.js — Full Quiz Logic (40 Questions Supported)

let currentQuestionIndex = 0;
let studentId = "";
let questions = [];

const studentEntry = document.getElementById("studentEntry");
const quizContent = document.getElementById("quizContent");
const studentIdInput = document.getElementById("studentIdInput");
const startBtn = document.getElementById("startBtn");
const questionText = document.getElementById("questionText");
const questionNumber = document.getElementById("questionNumber");
const choicesContainer = document.getElementById("choices");
const feedbackBox = document.getElementById("feedback");
const hintText = document.getElementById("hintText");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");

startBtn.addEventListener("click", () => {
  studentId = studentIdInput.value.trim();
  if (studentId === "") {
    alert("Please enter your Student ID.");
    return;
  }
  studentEntry.style.display = "none";
  quizContent.style.display = "block";
  loadQuestions();
});

async function loadQuestions() {
  try {
    const res = await fetch("questions.json");
    questions = await res.json();
    renderQuestion();
  } catch (err) {
    console.error("❌ Failed to load questions:", err);
    questionText.textContent = "Failed to load questions.";
  }
}

function renderQuestion() {
  const q = questions[currentQuestionIndex];
  questionText.textContent = q.questionText;
  questionNumber.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  choicesContainer.innerHTML = "";
  feedbackBox.textContent = "";
  hintText.classList.add("hidden");

  q.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.className = "btn choice-btn";
    btn.addEventListener("click", () => checkAnswer(choice));
    choicesContainer.appendChild(btn);
  });

  prevBtn.style.display = currentQuestionIndex > 0 ? "inline-block" : "none";
  nextBtn.style.display = currentQuestionIndex < questions.length - 1 ? "inline-block" : "none";
  submitBtn.style.display = currentQuestionIndex === questions.length - 1 ? "inline-block" : "none";
}

function checkAnswer(selected) {
  const q = questions[currentQuestionIndex];
  const correct = q.answer;
  if (selected === correct) {
    feedbackBox.textContent = q.feedback_correct;
    feedbackBox.className = "feedback correct";
  } else {
    feedbackBox.textContent = q.feedback_wrong;
    feedbackBox.className = "feedback wrong";
  }

  if (q.hintId) {
    hintText.textContent = `Hint: ${q.hintId}`;
    hintText.classList.remove("hidden");
  }
}

prevBtn.addEventListener("click", () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  }
});

submitBtn.addEventListener("click", () => {
  alert("🎉 Quiz complete! Thank you for participating.");
  // Optional: Send data to spreadsheet
  // sendQuizData();
});
