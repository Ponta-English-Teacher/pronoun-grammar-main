let questions = [];
let currentQuestion = 0;
let score = 0;
let studentId = '';
let hints = {};

document.getElementById('startBtn').addEventListener('click', async () => {
  studentId = document.getElementById('studentIdInput').value.trim();
  if (!studentId) return alert('Please enter your Student ID.');

  try {
    const res = await fetch('questions.json');
    questions = await res.json();

    const hintRes = await fetch('hints.json');
    hints = await hintRes.json();

    document.getElementById('studentEntry').style.display = 'none';
    document.getElementById('quizContent').style.display = 'block';
    showQuestion();
  } catch (e) {
    document.getElementById('questionText').textContent = 'Failed to load questions.';
    console.error(e);
  }
});

function showQuestion() {
  const q = questions[currentQuestion];
  document.getElementById('questionNumber').textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
  document.getElementById('questionText').textContent = q.questionText;

  const choicesDiv = document.getElementById('choices');
  choicesDiv.innerHTML = '';
  q.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = choice;
    btn.onclick = () => handleAnswer(choice, q);
    choicesDiv.appendChild(btn);
  });

  document.getElementById('feedback').textContent = '';
  document.getElementById('hintText').textContent = '';
}

function handleAnswer(choice, question) {
  const feedbackDiv = document.getElementById('feedback');
  const hintDiv = document.getElementById('hintText');
  const isCorrect = choice === question.answer;

  feedbackDiv.textContent = isCorrect ? `✅ ${question.feedback_correct}` : `❌ ${question.feedback_wrong}`;
  feedbackDiv.className = isCorrect ? 'correct' : 'incorrect';

  const hintMessage = hints[question.hintId] || `Hint: ${question.hintId}`;
  hintDiv.textContent = hintMessage;

  document.getElementById('nextBtn').classList.remove('hidden');
}

document.getElementById('nextBtn').addEventListener('click', () => {
  currentQuestion++;
  document.getElementById('nextBtn').classList.add('hidden');

  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    document.getElementById('questionText').textContent = '🎉 Quiz complete!';
    document.getElementById('choices').innerHTML = '';
    document.getElementById('feedback').textContent = `You scored ${score} out of ${questions.length}.`;
    document.getElementById('hintText').textContent = '';
    document.querySelector('.nav-buttons').innerHTML = '';
  }
});
