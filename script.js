let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let hints = {};
let studentId = '';
let userAnswers = [];

async function loadData() {
  const qResponse = await fetch('questions.json');
  const hResponse = await fetch('hints.json');
  questions = await qResponse.json();
  const hintArray = await hResponse.json();
  hints = Object.fromEntries(hintArray.map(h => [h.id, h.text]));
  showQuestion();
}

function startQuiz() {
  studentId = document.getElementById('student-id').value.trim();
  if (!studentId) {
    alert("Please enter your student ID.");
    return;
  }
  document.getElementById('start-container').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';
  loadData();
}

function showQuestion() {
  const question = questions[currentQuestionIndex];
  document.getElementById('question-number').textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  document.getElementById('question-text').textContent = question.questionText;

  const choicesEl = document.getElementById('choices');
  choicesEl.innerHTML = '';
  question.choices.forEach(choice => {
    const label = document.createElement('label');
    label.className = 'choice';
    label.innerHTML = `
      <input type="radio" name="choice" value="${choice}"> ${choice}
    `;
    choicesEl.appendChild(label);
  });

  document.getElementById('feedback').textContent = '';
  document.getElementById('hint').textContent = '';
  document.getElementById('next-button').style.display = 'none';
}

function checkAnswer() {
  const selected = document.querySelector('input[name="choice"]:checked');
  if (!selected) return;

  const answer = selected.value;
  const question = questions[currentQuestionIndex];
  const isCorrect = answer === question.answer;

  userAnswers.push({
    studentId,
    questionId: question.id,
    userAnswer: answer,
    score: isCorrect ? 2 : 0,
    attempt: 1
  });

  if (isCorrect) {
    document.getElementById('feedback').textContent = question.feedback_correct;
    score += 2;
  } else {
    document.getElementById('feedback').textContent = question.feedback_wrong;
  }

  const hintText = hints[question.hintId] || '';
  document.getElementById('hint').textContent = `💡 Hint: ${hintText}`;
  document.getElementById('next-button').style.display = 'inline-block';
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showFinalScore();
  }
}

function showFinalScore() {
  document.getElementById('quiz-container').style.display = 'none';
  document.getElementById('score-container').style.display = 'block';
  document.getElementById('final-score').textContent = `✅ Your total score: ${score} / ${questions.length * 2}`;
  document.getElementById('submit-button').style.display = 'inline-block';
}

async function submitAnswers() {
  for (let entry of userAnswers) {
    try {
      await fetch('/api/sheet', {
        method: 'POST',
        body: JSON.stringify(entry),
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      console.error('❌ Submission failed:', e);
    }
  }

  alert("✅ Your answers were submitted!");
  document.getElementById('submit-button').disabled = true;
}

// Attach event listeners
document.getElementById('start-button').addEventListener('click', startQuiz);
document.getElementById('choices').addEventListener('change', checkAnswer);
document.getElementById('next-button').addEventListener('click', nextQuestion);
document.getElementById('submit-button').addEventListener('click', submitAnswers);
