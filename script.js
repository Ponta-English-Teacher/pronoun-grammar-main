let currentQuestionIndex = 0;
let questions = [];
let hints = {};
let studentId = "";
let userAnswers = [];
let showingFeedback = false; // New state flag

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

// Ensure quizContent is initially hidden and studentEntry is visible
document.addEventListener('DOMContentLoaded', () => {
    quizContent.style.display = "none";
    scoreDiv.style.display = "none";
    // studentEntry.style.display is likely block by default, or set in CSS
    // Also, disable start button until data is loaded
    startBtn.disabled = true;
});


startBtn.addEventListener("click", () => {
    studentId = studentIdInput.value.trim();
    if (studentId === "") {
        alert("Please enter your Student ID.");
        return;
    }

    // This check is good to prevent starting if data isn't loaded yet
    if (questions.length === 0) {
        alert("Quiz data is still loading. Please wait a moment and try again.");
        return;
    }

    studentEntry.style.display = "none";
    quizContent.style.display = "block";
    loadQuestion(); // Now it's safe to call loadQuestion() as data is loaded
});

function loadQuestion() {
    showingFeedback = false; // Reset the flag when loading a new question
    feedbackDiv.textContent = ""; // Clear previous feedback
    hintText.classList.add("hidden"); // Hide hint
    nextBtn.textContent = "Check Answer"; // Set button text for checking answer

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

    // Enable choice selection for the new question
    enableChoices();

    // Ensure next/submit button visibility
    nextBtn.classList.remove("hidden");
    submitBtn.classList.add("hidden");
}

function disableChoices() {
    const radioButtons = choicesDiv.querySelectorAll("input[type='radio']");
    radioButtons.forEach(radio => radio.disabled = true);
}

function enableChoices() {
    const radioButtons = choicesDiv.querySelectorAll("input[type='radio']");
    radioButtons.forEach(radio => radio.disabled = false);
}


nextBtn.addEventListener("click", () => {
    if (!showingFeedback) {
        // User has selected an answer and wants to see feedback
        const selected = document.querySelector("input[name='choice']:checked");
        if (!selected) {
            alert("Please select an answer before checking.");
            return;
        }

        disableChoices(); // Disable choices after selection for feedback phase

        const question = questions[currentQuestionIndex];
        const isCorrect = selected.value === question.answer;
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

        nextBtn.textContent = "Next Question"; // Change button text
        showingFeedback = true; // Set flag to indicate feedback is showing

    } else {
        // User has seen feedback and wants to move to the next question
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            loadQuestion(); // Load the next question
        } else {
            // Quiz is finished
            nextBtn.classList.add("hidden");
            submitBtn.classList.remove("hidden");
            showScore(); // Display the score
        }
    }
});


submitBtn.addEventListener("click", submitToSpreadsheet);

function showScore() {
    const correctCount = userAnswers.filter(ans => ans.correct).length;
    scoreDiv.innerHTML = `<div class="score-banner">🎉 Quiz complete!</div><div class="score-result">You scored ${correctCount} out of ${questions.length}.</div>`;
    scoreDiv.style.display = "block";
    quizContent.style.display = "none"; // Hide quiz content when score is shown
}

function submitToSpreadsheet() {
    // Prevent multiple submissions
    submitBtn.disabled = true;

    // Collect all fetch promises
    const submissionPromises = userAnswers.map(ans => {
        return fetch("https://relative-clause-quiz-vercel.vercel.app/api/record", {
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

    // Wait for all submissions to complete
    Promise.all(submissionPromises)
        .then(() => {
            alert("✅ Your answers have been submitted. Thank you!");
        })
        .catch(error => {
            console.error("Error submitting answers:", error);
            alert("⚠️ There was an error submitting your answers. Please try again or contact support.");
            submitBtn.disabled = false; // Re-enable if submission failed for some reason
        });
}

// Load questions and hints
Promise.all([
    fetch("questions.json").then(res => res.json()),
    fetch("hints.json").then(res => res.json())
]).then(([loadedQuestions, loadedHints]) => {
    questions = loadedQuestions;
    hints = loadedHints;
    console.log("Quiz data loaded successfully!");
    startBtn.disabled = false; // Enable start button once data is ready
}).catch(error => {
    console.error("Failed to load data:", error);
    questionText.textContent = "⚠️ Failed to load quiz. Please check console for details.";
    startBtn.disabled = true; // Disable start button if data loading fails
});
