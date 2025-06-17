// script.js

let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let hints = {};
let userAnswers = [];
let studentId = "";

async function loadQuestions() {
  const questionsResponse = await fetch("questions.json");
  questions = await questionsResponse.json();
  const hintsResponse = await fetch("hints.json");
  const hintData = await hintsResponse.json();
  hintData.forEach(h => hints[h.id] = h.text);
  document.getElementById("start-page").style.display = "block";
}

function startQuiz() {
  studentId = document.getElementById("student-id").value.trim();
  if (!studentId) {
    alert("Please enter your Student ID");
    return;
  }
  document.getElementById("start-page").style.display = "none";
  document.getElementById("quiz-container").style.display = "block";
  showQuestion(currentQuestionIndex);
}

function showQuestion(index) {
  const q = questions[index];
  document.getElementById("question-number").textContent = `${index + 1}/${questions.length}`;
  document.getElementById("question-text").textContent = q.questionText;
  const choicesContainer = document.getElementById("choices");
  choicesContainer.innerHTML = "";
  q.choices.forEach((choice, i) => {
    const btn = document.createElement("button");
    btn.textContent = `⚪️ ${choice}`;
    btn.className = "choice-btn";
    btn.onclick = () => handleAnswer(choice);
    choicesContainer.appendChild(btn);
  });
  document.getElementById("feedback").textContent = "";
  document.getElementById("hint").textContent = "";
  document.getElementById("next-btn").style.display = "none";
}

function handleAnswer(selected) {
  const q = questions[currentQuestionIndex];
  const correct = selected === q.answer;
  if (correct) {
    score += 2;
    document.getElementById("feedback").textContent = q.feedback_correct;
  } else {
    document.getElementById("feedback").textContent = q.feedback_wrong;
  }
  const hintText = hints[q.hintId] || "";
  document.getElementById("hint").textContent = hintText;
  userAnswers.push({ questionId: q.id, selected, correct, attempt: 1 });
  document.getElementById("next-btn").style.display = "block";
  const buttons = document.querySelectorAll(".choice-btn");
  buttons.forEach(btn => btn.disabled = true);
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion(currentQuestionIndex);
  } else {
    endQuiz();
  }
}

function endQuiz() {
  document.getElementById("quiz-container").style.display = "none";
  document.getElementById("result").style.display = "block";
  document.getElementById("score").textContent = `${score}/${questions.length * 2}`;
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
        attempt: ans.attempt
      })
    });
  });
  alert("✅ Your answers have been submitted. Thank you!");
}

document.getElementById("start-btn").onclick = startQuiz;
document.getElementById("next-btn").onclick = nextQuestion;
document.getElementById("submit-btn").onclick = submitToSpreadsheet;

loadQuestions();
