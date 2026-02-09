// Host Quiz and Join Quiz button handlers

// Hide quiz list by default
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("join-quiz-section").style.display = "none";

    const role = localStorage.getItem("role") || "USER";
    const hostBtn = document.getElementById("host-quiz-btn");
    const publishedBtn = document.getElementById("published-quizzes-btn");
    const reportBtn = document.getElementById("report-card-btn");
    const reportPanel = document.getElementById("report-panel");
    const reportCloseBtn = document.getElementById("report-close-btn");
    const reportSummary = document.getElementById("report-summary");
    const reportList = document.getElementById("report-list");

    // Only admins can host quizzes or open the admin panel
    if (role !== "ADMIN") {
        if (hostBtn) hostBtn.style.display = "none";
        if (publishedBtn) publishedBtn.style.display = "none";
    } else {
        if (hostBtn) {
            hostBtn.onclick = function () {
                window.location.href = "host.html";
            };
        }
        if (publishedBtn) {
            publishedBtn.onclick = function () {
                window.location.href = "admin.html";
            };
        }
    }

    document.getElementById("join-quiz-btn").onclick = function () {
        document.getElementById("join-quiz-section").style.display = "block";
    };

    if (reportBtn && reportPanel) {
        reportBtn.onclick = async function () {
            reportPanel.style.display = "flex";
            if (reportSummary) reportSummary.textContent = "Loading...";
            if (reportList) reportList.innerHTML = "";
            const uname = getUsernameFromToken() || localStorage.getItem("username");
            if (!uname) {
                if (reportSummary) reportSummary.textContent = "Unable to find your username.";
                return;
            }
            try {
                const res = await fetch(`http://localhost:8082/api/results/report/${encodeURIComponent(uname)}`, { headers });
                if (!res.ok) {
                    if (reportSummary) reportSummary.textContent = "No report found yet.";
                    return;
                }
                const data = await res.json();
                if (reportSummary) {
                    reportSummary.innerHTML =
                        `User: <strong>${data.studentUsername}</strong><br>` +
                        `Total Quizzes Attempted: <strong>${data.totalQuizzes}</strong><br>` +
                        `Total Score: <strong>${data.totalScore}</strong><br>` +
                        `Correct Answers: <strong>${data.totalCorrectAnswers}/${data.totalQuestions}</strong>`;
                }
                if (reportList) {
                    const results = Array.isArray(data.results) ? data.results : [];
                    if (results.length === 0) {
                        reportList.innerHTML = "<li class='report-item'><span>No quizzes attempted yet.</span></li>";
                    } else {
                        reportList.innerHTML = "";
                        results.forEach(r => {
                            const li = document.createElement("li");
                            li.className = "report-item";
                            const total = r.totalQuestions ?? "?";
                            const correct = r.correctAnswers ?? "?";
                            li.innerHTML = `<span>Quiz: <strong>${r.quizId}</strong></span><span>Score: ${r.score} (Correct: ${correct}/${total})</span>`;
                            reportList.appendChild(li);
                        });
                    }
                }
            } catch (e) {
                if (reportSummary) reportSummary.textContent = "Error fetching report.";
            }
        };
    }

    if (reportCloseBtn && reportPanel) {
        reportCloseBtn.onclick = function () {
            reportPanel.style.display = "none";
        };
    }

    // Enter quiz by pressing Enter or clicking button
    document.getElementById("quiz-id-input").addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            joinQuizById();
        }
    });
    document.getElementById("enter-quiz-btn").onclick = joinQuizById;
});

function joinQuizById() {
    const quizId = document.getElementById("quiz-id-input").value.trim();
    if (!quizId) {
        alert("Please enter a Quiz ID.");
        return;
    }
    localStorage.setItem("currentQuizId", quizId);
    window.location.href = "quiz.html";
}
const API_BASE = "http://localhost:8081/api/questions"; // Assuming port 8081

const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "index.html";
}

const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
};

function getUsernameFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub || payload.username || null;
    } catch (e) {
        return null;
    }
}

async function fetchQuizzes() {
    try {
        const res = await fetch(`${API_BASE}/quiz/all`, { headers });
        if (!res.ok) throw new Error("Failed to fetch quizzes");

        const quizzes = await res.json();
        renderQuizzes(quizzes);
    } catch (err) {
        document.getElementById("quiz-list").innerHTML = `<p>${err.message}</p>`;
    }
}

function renderQuizzes(quizzes) {
    const container = document.getElementById("published-quizzes-list");
    container.innerHTML = "";
    if (!quizzes || quizzes.length === 0) {
        container.innerHTML = "<li style='color:#ffe066;padding:12px 0;'>No quizzes available.</li>";
        return;
    }
    quizzes.forEach((quiz) => {
        const quizName = quiz.name || quiz.title || quiz.quizName || quiz || 'Quiz';
        const quizId = quiz.id || quiz.quizId || quiz._id || quizName;
        const li = document.createElement("li");
        li.style = "background:rgba(34,40,49,0.92);border-radius:12px;padding:18px 22px;margin-bottom:14px;box-shadow:0 2px 12px #00f2fe22;display:flex;align-items:center;justify-content:space-between;gap:12px;";
        li.innerHTML = `
            <span style='font-weight:700;'>${quizName}</span>
            <span>
                <button class='dashboard-btn' style='padding:8px 18px;width:auto;font-size:1rem;margin-right:8px;' onclick="viewQuizAdmin('${quizId}')">View</button>
                <button class='dashboard-btn' style='padding:8px 18px;width:auto;font-size:1rem;' onclick="joinQuizByIdFromList('${quizId}')">Start Quiz</button>
            </span>
        `;
        container.appendChild(li);
    });
}

function joinQuizByIdFromList(quizId) {
    document.getElementById('quiz-id-input').value = quizId;
    joinQuizById();
}

function viewQuizAdmin(quizId) {
    window.location.href = `admin.html?quizId=${encodeURIComponent(quizId)}`;
}

function startQuiz(quizId) {
    localStorage.setItem("currentQuizId", quizId);
    window.location.href = "quiz.html";
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

// On page load, fetch quizzes
if (document.getElementById('published-quizzes-list')) fetchQuizzes();


