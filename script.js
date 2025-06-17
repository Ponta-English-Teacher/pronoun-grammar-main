let questions = [];
let hints = {};
let currentIndex = 0;
let score = 0;
let studentId = "";
let responses = [];

const startBtn = document.getElementById("startBtn");
const quizContent = document.getElementById("quizContent");
const studentEntry = document.getElementById("studentEntry");
const studentIdInput = document.getElementById("studentIdInput");
const questionCounter = document.getElementById("questionCounter");
const questionText = document.getElementById("questionText");
const choicesDiv = document.getElementById("choices");
const feedbackDiv = document.getElementById("feedback");
const hintBox = document.getElementById("hintText");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const finalScreen = document.getElementById("finalScreen");
const scoreSummary = document.getElementById("scoreSummary");
const finalSubmitBtn = document.getElementById("finalSubmitBtn");

startBtn.addEventListener("click", () => {
  const id = studentIdInput.value.trim();
  if (!id) {
    alert("Please enter your Student ID.");
    return;
  }
  studentId = id;
  studentEntry.style.display = "none";
  quizContent.style.display = "block";
  loadQuestion();
});

async function fetchData() {
  const qRes = await fetch("questions.json");
  questions = await qRes.json();
  const hRes = await fetch("hints.json");
  const hintsData = await hRes.json();
  hintsData.forEach((h) => (hints[h.id] = h.text));
}

function loadQuestion() {
  const q = questions[currentIndex];
  questionCounter.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
  questionText.textContent = q.questionText;
  choicesDiv.innerHTML = "";
  feedbackDiv.innerText = "";
  hintBox.innerText = "";

  q.choices.forEach((choice) => {
    const label = document.createElement("label");
    label.className = "choice-label";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "choice";
    input.value = choice;
    label.appendChild(input);
    label.append(` ${choice}`);
    choicesDiv.appendChild(label);
    choicesDiv.appendChild(document.createElement("br"));
  });

  nextBtn.style.display = "block";
  submitBtn.style.display = "none";
}

nextBtn.addEventListener("click", () => {
  const selected = document.querySelector("input[name='choice']:checked");
  if (!selected) {
    alert("Please select an answer.");
    return;
  }

  const userAnswer = selected.value;
  const q = questions[currentIndex];
  const isCorrect = userAnswer === q.answer;
  const point = isCorrect ? 2 : 0;
  score += point;

  feedbackDiv.textContent = isCorrect ? q.feedback_correct : q.feedback_wrong;
  hintBox.textContent = hints[q.hintId] || "";

  responses.push({
    studentId,
    questionId: q.id,
    userAnswer,
    score: point,
    attempt: 1,
  });

  currentIndex++;
  if (currentIndex < questions.length) {
    setTimeout(() => {
      loadQuestion();
    }, 1200);
  } else {
    showFinalScreen();
  }
});

function showFinalScreen() {
  quizContent.style.display = "none";
  finalScreen.style.display = "block";
  scoreSummary.textContent = `You scored ${score} out of ${questions.length * 2}`;
}

finalSubmitBtn.addEventListener("click", async () => {
  try {
    const res = await fetch("/api/sheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(responses),
    });
    const result = await res.json();
    alert(result.result || "Submitted successfully!");
    finalSubmitBtn.disabled = true;
  } catch (err) {
    alert("Submission failed.");
    console.error(err);
  }
});

window.addEventListener("DOMContentLoaded", fetchData);
