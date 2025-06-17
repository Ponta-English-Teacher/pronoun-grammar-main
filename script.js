let currentQuestionIndex = 0;
let questions = [];
let hints = {};
let studentId = "";
let score = 0;
let attempt = 1;

const endpoint = import.meta.env.VITE_GAS_ENDPOINT;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startBtn").addEventListener("click", startQuiz);
  document.getElementById("prevBtn").addEventListener("click", showPreviousQuestion);
  document.getElementById("nextBtn").addEventListener("click", showNextQuestion);
  document.getElementById("submitBtn").addEventListener("click", submitQuiz);
  loadQuestionsAndHints();
});

function startQuiz() {
  const input = document.getElementById("studentIdInput").value.trim();
  if (!input) {
    alert("Please enter your student ID.");
    return;
  }
  studentId = input;
  document.getElementById("studentEntry").style.display = "none";
  document.getElementById("quizContent").style.display = "block";
  loadQuestion();
}

async function loadQuestionsAndHints() {
  try {
    const qRes = await fetch("questions.json");
    const hRes = await fetch("hints.json");
    questions = await qRes.json();
    const hintArray = await hRes.json();
    hintArray.forEach(h => hints[h.id] = h.text);
  } catch (err) {
    alert("Failed to load quiz data.");
    console.error(err);
  }
}

function loadQuestion() {
  const q = questions[currentQuestionIndex];
  document.getElementById("questionNumber").textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  document.getElementById("questionText").textContent = q.questionText;
  document.getElementById("choices").innerHTML = "";

  q.choices.forEach((choice, idx) => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.className = "btn m-1";
    btn.onclick = () => checkAnswer(choice);
    document.getElementById("choices").appendChild(btn);
  });

  document.getElementById("feedback").textContent = "";
  document.getElementById("hintText").style.display = "none";
  updateNavButtons();
}

function checkAnswer(selected) {
  const q = questions[currentQuestionIndex];
  const isCorrect = selected === q.answer;

  const feedback = isCorrect ? q.feedback_correct : q.feedback_wrong;
  document.getElementById("feedback").textContent = feedback;

  if (!isCorrect && q.hintId && hints[q.hintId]) {
    document.getElementById("hintText").textContent = hints[q.hintId];
    document.getElementById("hintText").style.display = "block";
  } else {
    document.getElementById("hintText").style.display = "none";
  }

  if (isCorrect) {
    score += 2;
  }

  // Save response to Google Sheet
  sendToGoogleSheets({
    studentId,
    questionId: q.id,
    userAnswer: selected,
    score: isCorrect ? 2 : 0,
    attempt
  });
}

function sendToGoogleSheets(data) {
  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => res.text())
    .then(res => console.log("✅ Saved to Google Sheets:", res))
    .catch(err => console.error("❌ Error saving to Google Sheets:", err));
}

function showPreviousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    loadQuestion();
  }
}

function showNextQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    loadQuestion();
  }
}

function submitQuiz() {
  document.getElementById("questionBox").innerHTML = `<h2>All done!</h2><p>Your score: ${score} / ${questions.length * 2}</p>`;
  document.getElementById("feedback").textContent = "";
  document.getElementById("hintText").style.display = "none";
  document.querySelector(".nav-buttons").style.display = "none";
}

function updateNavButtons() {
  document.getElementById("prevBtn").style.display = currentQuestionIndex === 0 ? "none" : "inline-block";
  document.getElementById("nextBtn").style.display = currentQuestionIndex === questions.length - 1 ? "none" : "inline-block";
  document.getElementById("submitBtn").style.display = currentQuestionIndex === questions.length - 1 ? "inline-block" : "none";
}
