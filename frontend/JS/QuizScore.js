const questions = document.querySelectorAll('.question');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const resultDiv = document.getElementById('result');
let current = 0;

showQuestion(current);

nextBtn.addEventListener('click', () => {
    if (current < questions.length - 1) {
        questions[current].classList.remove('active');
        current++;
        showQuestion(current);
    } else {
        calculateResult();
    }
});

prevBtn.addEventListener('click', () => {
    if (current > 0) {
        questions[current].classList.remove('active');
        current--;
        showQuestion(current);
    }
});

function showQuestion(n) {
    questions[n].classList.add('active');
    prevBtn.style.display = n === 0 ? 'none' : 'inline-block';
    nextBtn.innerText = n === questions.length - 1 ? 'Submit' : 'Next';
}

// Calculate result
function calculateResult() {
    const form = document.getElementById('quizForm');
    const formData = new FormData(form);
    let scores = { "Science":0, "Arts":0, "Commerce":0, "Vocational":0 };

    // Loop through all answers
    for (let [key,value] of formData.entries()) {
        scores[value] +=1;
    }

    // Question 1 checkboxes
    let q1 = formData.getAll('q1');
    q1.forEach(value => { scores[value] +=1; });

    let maxScore = 0;
    let recommended = '';
    for (let stream in scores) {
        if (scores[stream] > maxScore) {
            maxScore = scores[stream];
            recommended = stream;
        }
    }

    resultDiv.innerText = "Recommended Stream for You: " + recommended;
}
