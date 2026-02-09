const API_BASE = "http://localhost:8081/api/questions";
const token = localStorage.getItem("token");
const quizId = localStorage.getItem("currentQuizId");

if (!token || !quizId) {
    window.location.href = "index.html";
}

let questions = [];
let currentQuestion = 0;
const userAnswers = {};

const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
};


async function loadQuestions() {
    // Try to extract username from JWT (if present)
    let studentUsername = "anonymous";
    try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        if (tokenPayload && tokenPayload.sub) {
            studentUsername = tokenPayload.sub;
        }
    } catch (e) { }

    // Check if user has already attempted this quiz
    try {
        const attemptRes = await fetch(`http://localhost:8082/api/results/attempted/${quizId}/${studentUsername}`, { headers });
        if (attemptRes.ok) {
            const attempted = await attemptRes.json();
            if (attempted) {
                document.getElementById("question-container").innerHTML = `<p>You have already attempted this quiz. Re-attempt is not allowed.</p>`;
                document.getElementById("prev-btn").style.display = "none";
                document.getElementById("next-btn").style.display = "none";
                document.getElementById("submit-btn").style.display = "none";
                return;
            }
        }
    } catch (e) { /* ignore, allow attempt if check fails */ }

    try {
        const res = await fetch(`${API_BASE}/quiz/${quizId}`, { headers });
        if (!res.ok) throw new Error("Failed to load questions");
        questions = await res.json();
        if (!questions || questions.length === 0) {
            document.getElementById("question-container").innerHTML = `<p>No questions available for this quiz.</p>`;
            document.getElementById("prev-btn").style.display = "none";
            document.getElementById("next-btn").style.display = "none";
            document.getElementById("submit-btn").style.display = "none";
            return;
        }
        showQuestion(currentQuestion);
    } catch (err) {
        document.getElementById("question-container").innerHTML = `<p>${err.message}</p>`;
    }
}

function showQuestion(index) {
    const q = questions[index];
    const container = document.getElementById("question-container");
    container.innerHTML = `
        <div style="width: 100%; display: flex; flex-direction: column; align-items: center;">
            <div style="font-weight: bold; font-size: 1.4rem; color: #2d3a4a; margin-bottom: 14px; text-align: center;">Question ${index + 1}</div>
            <div style="margin-bottom: 24px; padding: 24px 28px; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(44, 62, 80, 0.18); max-width: 700px; width: 90vw; min-width: 340px; display: flex; flex-direction: column; align-items: center;">
                <h3 style="margin-bottom: 22px; font-size: 1.7rem; color: #2d3a4a; text-align: center;">${q.questionText}</h3>
                <div style="display: flex; flex-direction: column; gap: 22px; width: 100%; max-width: 520px;">
                    ${[
            { key: "optionA", label: q.optionA },
            { key: "optionB", label: q.optionB },
            { key: "optionC", label: q.optionC },
            { key: "optionD", label: q.optionD }
        ].map(opt => `
                        <label class="quiz-option-popout" style="display: flex; align-items: center; background: #f6f8fa; border-radius: 8px; padding: 14px 20px; cursor: pointer; transition: background 0.2s; width: 100%; font-size: 1.25rem;">
                            <input type="radio" name="option" value="${opt.label}" style="margin-right: 16px; transform: scale(1.35);" ${userAnswers[q.id] === opt.label ? 'checked' : ''}>
                            <span style="font-size: 1.22rem; color: #34495e;">${opt.label}</span>
                        </label>
                    `).join("")}
                </div>
            </div>
            <div class="quiz-nav-row">
                <button id="prev-btn" class="quiz-nav-btn" style="display:${index > 0 ? 'inline-block' : 'none'};">Previous</button>
                <button id="next-btn" class="quiz-nav-btn" style="display:${index < questions.length - 1 ? 'inline-block' : 'none'};">Next</button>
            </div>
            <button id="submit-btn" style="display:${index === questions.length - 1 ? 'inline-block' : 'none'};" class="result-btn">Submit</button>
        </div>
    `;

    // Event listener to capture selection
    document.querySelectorAll('input[name="option"]').forEach((radio) => {
        radio.addEventListener("change", (e) => {
            userAnswers[q.id] = e.target.value;
        });
    });

    // Attach navigation button listeners after rendering
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const submitBtn = document.getElementById("submit-btn");

    if (prevBtn) {
        prevBtn.onclick = () => {
            if (currentQuestion > 0) {
                currentQuestion--;
                showQuestion(currentQuestion);
            }
        };
    }
    if (nextBtn) {
        nextBtn.onclick = () => {
            if (currentQuestion < questions.length - 1) {
                currentQuestion++;
                showQuestion(currentQuestion);
            }
        };
    }
    if (submitBtn) {
        submitBtn.onclick = async () => {
            try {
                const answersArray = Object.keys(userAnswers).map((questionId) => ({
                    questionId,
                    selectedAnswer: userAnswers[questionId],
                }));
                // Try to extract username from JWT (if present)
                let studentUsername = "anonymous";
                try {
                    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                    if (tokenPayload && tokenPayload.sub) {
                        studentUsername = tokenPayload.sub;
                    }
                } catch (e) { }
                const resultRes = await fetch("http://localhost:8082/api/results/submit", {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        quizId,
                        answers: answersArray,
                        studentUsername
                    }),
                });
                if (!resultRes.ok) throw new Error("Failed to submit quiz");

                const result = await resultRes.json();
                localStorage.setItem("lastResult", JSON.stringify(result));
                window.location.href = "result.html";
            } catch (err) {
                alert(err.message);
            }
        };
    }

    document.getElementById("prev-btn").style.display = index > 0 ? "inline-block" : "none";
    document.getElementById("next-btn").style.display = index < questions.length - 1 ? "inline-block" : "none";
    document.getElementById("submit-btn").style.display = index === questions.length - 1 ? "inline-block" : "none";
}

loadQuestions();
