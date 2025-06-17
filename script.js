function submitAnswer() {
  fetch('/api/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId: 'test01',
      questionId: 'Q1',
      userAnswer: 'he',
      score: 2,
      attempt: 1
    })
  })
  .then(res => res.json())
  .then(data => {
    alert('✅ Sent: ' + JSON.stringify(data));
  })
  .catch(err => alert('❌ Error: ' + err));
}
