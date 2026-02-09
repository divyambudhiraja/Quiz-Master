// admin.js
const API_BASE = "http://localhost:8081/api/questions";
const RESULT_API = "http://localhost:8082/api/results";
const token = localStorage.getItem("token");
let username = "";

// Try to extract username from JWT
try {
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    if (tokenPayload && tokenPayload.sub) {
        username = tokenPayload.sub;
    }
} catch (e) { }

if (!token) {
    window.location.href = "index.html";
}

const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
};


function getUsernameFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || payload.username;
    } catch (e) {
        return null;
    }
}

async function fetchAllQuizzes() {
    const res = await fetch(`${API_BASE}/quiz/all`, { headers });
    const quizzes = await res.json();
    renderAdminQuizzes(quizzes);
}

function renderAdminQuizzes(quizzes) {
    const container = document.getElementById("admin-quiz-list");
    container.innerHTML = "";
    if (!quizzes.length) {
        container.innerHTML = "<p>No quizzes found.</p>";
        return;
    }
    quizzes.forEach((quizId) => {
        const btn = document.createElement("button");
        btn.className = "admin-primary-btn";
        btn.style.marginBottom = "16px";
        btn.textContent = `Quiz ID: ${quizId}`;
        btn.onclick = () => viewParticipants(quizId);
        container.appendChild(btn);
    });
}

window.editQuiz = function (quizId) {
    window.location.href = `admin.html?quizId=${encodeURIComponent(quizId)}`;
};

window.deleteQuiz = async function (quizId) {
    if (!confirm("Are you sure you want to delete this quiz and all its questions?")) return;
    // Fetch all questions for this quiz and delete them one by one
    const res = await fetch(`${API_BASE}/quiz/${quizId}`, { headers });
    const questions = await res.json();
    let success = true;
    for (const q of questions) {
        const delRes = await fetch(`${API_BASE}/${q.id}`, { method: "DELETE", headers });
        if (!delRes.ok) success = false;
    }
    // Delete all results for this quiz
    const resultRes = await fetch(`http://localhost:8082/api/results/quiz/${quizId}`, { method: "DELETE", headers });
    if (success && resultRes.ok) {
        alert("Quiz and all its results deleted.");
        fetchMyQuizzes();
    } else {
        alert("Some questions or results could not be deleted.");
    }
};

window.viewParticipants = async function (quizId) {
    document.getElementById("participants-quiz-id").textContent = quizId;
    // Fetch all results for this quiz
    const res = await fetch(`${RESULT_API}/quiz/${quizId}`, { headers });
    const participants = await res.json();
    const list = document.getElementById("participants-list");
    list.innerHTML = "";
    if (!participants.length) {
        list.innerHTML = "<li>No participants yet.</li>";
        return;
    }
    participants.forEach((p) => {
        const li = document.createElement('li');
        const total = p.totalQuestions ?? "?";
        const correct = p.correctAnswers ?? "?";
        li.innerHTML = `${p.studentUsername} &mdash; Score: ${p.score} (Correct: ${correct}/${total}) <button class="delete-user-result-btn">Delete</button>`;
        li.querySelector('.delete-user-result-btn').onclick = async function () {
            if (!confirm(`Delete result for user ${p.studentUsername}?`)) return;
            const delRes = await fetch(`${RESULT_API}/quiz/${quizId}/user/${p.studentUsername}`, { method: "DELETE", headers });
            if (delRes.ok) {
                li.remove();
                alert("User's result deleted.");
            } else {
                alert("Failed to delete user's result.");
            }
        };
        list.appendChild(li);
    });
};

window.hideParticipants = function () {
    document.getElementById("participants-quiz-id").textContent = "Select a quiz";
    document.getElementById("participants-list").innerHTML = "";
};


// Utility to get query param
function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

async function fetchQuizQuestions(quizId) {
    const res = await fetch(`${API_BASE}/quiz/${quizId}`, { headers });
    const questions = await res.json();
    renderQuizQuestions(quizId, questions);
}

function renderQuizQuestions(quizId, questions) {
    const container = document.getElementById("admin-quiz-list");
    container.innerHTML = `<h3>Questions for Quiz: ${quizId}</h3>`;
    const addBtn = document.getElementById("add-question-btn");
    addBtn.style.display = "inline-block";
    const deleteQuizBtn = document.getElementById("delete-entire-quiz-btn");
    deleteQuizBtn.style.display = "inline-block";
    deleteQuizBtn.onclick = async function () {
        if (!confirm("Are you sure you want to delete the entire quiz, all its questions, and all its results?")) return;
        // Delete all questions for this quiz
        const res = await fetch(`${API_BASE}/quiz/${quizId}`);
        const questions = await res.json();
        let success = true;
        for (const q of questions) {
            const delRes = await fetch(`${API_BASE}/${q.id}`, { method: "DELETE", headers });
            if (!delRes.ok) success = false;
        }
        // Delete all results for this quiz
        const resultRes = await fetch(`http://localhost:8082/api/results/quiz/${quizId}`, { method: "DELETE", headers });
        if (success && resultRes.ok) {
            alert("Quiz and all its results deleted.");
            window.location.href = "admin.html";
        } else {
            alert("Some questions or results could not be deleted.");
        }
    };
    addBtn.onclick = function () {
        // Add a new question block for this quiz
        const idx = container.querySelectorAll('.question-block').length + 1;
        container.insertAdjacentHTML('beforeend', createQuestionBlockWithData(idx, {}));
        // Add a save button for the new question
        const newBlock = container.querySelector('.question-block:last-child');
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.onclick = async function () {
            const questionText = newBlock.querySelector('.question-text').value.trim();
            const optionA = newBlock.querySelector('.optionA').value.trim();
            const optionB = newBlock.querySelector('.optionB').value.trim();
            const optionC = newBlock.querySelector('.optionC').value.trim();
            const optionD = newBlock.querySelector('.optionD').value.trim();
            const correct = newBlock.querySelector('.correct-answer').value;
            if (!questionText || !optionA || !optionB || !optionC || !optionD) {
                alert("All fields are required for each question.");
                return;
            }
            const payload = {
                questionText,
                optionA,
                optionB,
                optionC,
                optionD,
                correctAnswer: { A: optionA, B: optionB, C: optionC, D: optionD }[correct],
                quizId
            };
            const res = await fetch(`${API_BASE}/add`, {
                method: "POST",
                headers,
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert("Question added!");
                fetchQuizQuestions(quizId);
            } else {
                alert("Failed to add question.");
            }
        };
        newBlock.appendChild(saveBtn);
    };

    // Add event listener for remove button (for all question blocks, including new ones)
    container.addEventListener('click', function (e) {
        if (e.target.classList.contains('remove-question-btn')) {
            e.target.closest('.question-block').remove();
        }
    });
    if (!questions.length) {
        container.innerHTML += "<p>No questions found.</p>";
        return;
    }
    questions.forEach((q) => {
        const div = document.createElement("div");
        div.className = "quiz-card";
        div.innerHTML = `
            <b>Q:</b> <input type="text" value="${q.questionText}" data-qid="${q.id}" class="edit-question-text">
            <br><b>A:</b> <input type="text" value="${q.optionA}" class="edit-optionA">
            <b>B:</b> <input type="text" value="${q.optionB}" class="edit-optionB">
            <b>C:</b> <input type="text" value="${q.optionC}" class="edit-optionC">
            <b>D:</b> <input type="text" value="${q.optionD}" class="edit-optionD">
            <br><b>Correct:</b> <input type="text" value="${q.correctAnswer}" class="edit-correctAnswer">
            <button onclick="saveQuestion(${q.id}, this)">Save</button>
            <button onclick="deleteQuestion(${q.id}, this)">Delete</button>
        `;
        container.appendChild(div);
    });
}

window.saveQuestion = async function (qid, btn) {
    const card = btn.closest('.quiz-card');
    const payload = {
        questionText: card.querySelector('.edit-question-text').value,
        optionA: card.querySelector('.edit-optionA').value,
        optionB: card.querySelector('.edit-optionB').value,
        optionC: card.querySelector('.edit-optionC').value,
        optionD: card.querySelector('.edit-optionD').value,
        correctAnswer: card.querySelector('.edit-correctAnswer').value
    };
    const res = await fetch(`${API_BASE}/${qid}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload)
    });
    if (res.ok) {
        alert("Saved!");
    } else {
        alert("Failed to save.");
    }
};

window.deleteQuestion = async function (qid, btn) {
    if (!confirm("Delete this question?")) return;
    const res = await fetch(`${API_BASE}/${qid}`, { method: "DELETE", headers });
    if (res.ok) {
        btn.closest('.quiz-card').remove();
    } else {
        alert("Failed to delete.");
    }
};

const quizIdParam = getQueryParam('quizId');
if (quizIdParam) {
    fetchQuizQuestions(quizIdParam);
} else {
    fetchAllQuizzes();
}

// Utility to extract username from JWT token
function getUsernameFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || payload.username;
    } catch (e) {
        return null;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Left-side navigation
    const navQuizzes = document.getElementById("nav-quizzes");
    const navPromote = document.getElementById("nav-promote");
    const navReport = document.getElementById("nav-report");
    const sectionQuizzes = document.getElementById("section-quizzes");
    const sectionPromote = document.getElementById("section-promote");
    const sectionReport = document.getElementById("section-report");
    const sectionParticipants = document.getElementById("section-participants");

    function showSection(section) {
        [sectionQuizzes, sectionPromote, sectionReport].forEach(s => {
            if (s) s.style.display = "none";
        });
        if (section) section.style.display = "block";
        [navQuizzes, navPromote, navReport].forEach(b => {
            if (b) b.classList.remove("active");
        });
        // Show participants only when in "Previously Made Quizzes"
        if (sectionParticipants) {
            sectionParticipants.style.display = (section === sectionQuizzes) ? "block" : "none";
        }
    }

    if (navQuizzes) {
        navQuizzes.onclick = function () {
            showSection(sectionQuizzes);
            navQuizzes.classList.add("active");
        };
    }
    if (navPromote) {
        navPromote.onclick = function () {
            showSection(sectionPromote);
            navPromote.classList.add("active");
        };
    }
    if (navReport) {
        navReport.onclick = function () {
            showSection(sectionReport);
            navReport.classList.add("active");
        };
    }

    // Default: no section selected until user clicks a button

    // Promote a user to admin
    const promoteBtn = document.getElementById("promote-btn");
    const promoteInput = document.getElementById("promote-username");
    const promoteMsg = document.getElementById("promote-message");
    const userListEl = document.getElementById("user-list");
    const reportUserListEl = document.getElementById("report-user-list");
    const reportInput = document.getElementById("report-username");
    const reportBtn = document.getElementById("report-btn");
    const reportDetails = document.getElementById("report-details");

    async function loadUsers() {
        if (!userListEl && !reportUserListEl) return;
        if (userListEl) userListEl.innerHTML = "Loading users...";
        if (reportUserListEl) reportUserListEl.innerHTML = "Loading users...";
        try {
            const res = await fetch("http://localhost:8080/api/auth/users", { headers });
            const users = await res.json();
            if (userListEl) {
                userListEl.innerHTML = "";
                users.forEach(u => {
                    const div = document.createElement("div");
                    div.className = "user-list-item";
                    div.innerHTML = `<span>${u.username}</span><span style="font-size:0.8rem;opacity:0.8;">${u.role}</span>`;
                    div.onclick = () => {
                        promoteInput.value = u.username;
                    };
                    userListEl.appendChild(div);
                });
            }
            if (reportUserListEl) {
                reportUserListEl.innerHTML = "";
                users.forEach(u => {
                    const div = document.createElement("div");
                    div.className = "user-list-item";
                    div.innerHTML = `<span>${u.username}</span><span style="font-size:0.8rem;opacity:0.8;">${u.role}</span>`;
                    div.onclick = () => {
                        reportInput.value = u.username;
                    };
                    reportUserListEl.appendChild(div);
                });
            }
        } catch (e) {
            if (userListEl) userListEl.innerHTML = "Failed to load users.";
            if (reportUserListEl) reportUserListEl.innerHTML = "Failed to load users.";
        }
    }

    loadUsers();

    if (promoteBtn && promoteInput) {
        promoteBtn.onclick = async function () {
            const usernameToPromote = promoteInput.value.trim();
            promoteMsg.textContent = "";
            if (!usernameToPromote) {
                promoteMsg.textContent = "Please enter a username.";
                return;
            }
            try {
                const res = await fetch("http://localhost:8080/api/auth/make-admin", {
                    method: "POST",
                    headers,
                    body: JSON.stringify({ username: usernameToPromote })
                });
                const raw = await res.text().catch(() => "");
                let data = {};
                try { data = raw ? JSON.parse(raw) : {}; } catch (e) { }
                if (res.ok) {
                    promoteMsg.style.color = "#baffc9";
                    promoteMsg.textContent = data.message || "User promoted to admin.";
                    loadUsers();
                } else {
                    promoteMsg.style.color = "#ff4d4f";
                    promoteMsg.textContent = data.error || raw || `Failed to promote user (HTTP ${res.status}).`;
                }
            } catch (e) {
                promoteMsg.style.color = "#ff4d4f";
                promoteMsg.textContent = `Error promoting user: ${e.message || e}`;
            }
        };
    }

    // Report card: aggregate score for a username
    if (reportBtn && reportInput && reportDetails) {
        reportBtn.onclick = async function () {
            const uname = reportInput.value.trim();
            reportDetails.textContent = "";
            if (!uname) {
                reportDetails.textContent = "Please enter a username.";
                return;
            }
            try {
                const res = await fetch(`http://localhost:8082/api/results/report/${encodeURIComponent(uname)}`, {
                    headers
                });
                if (!res.ok) {
                    reportDetails.textContent = "No report found or error fetching report.";
                    return;
                }
                const data = await res.json();
                reportDetails.innerHTML =
                    `User: <strong>${data.studentUsername}</strong><br>` +
                    `Total Quizzes Attempted: <strong>${data.totalQuizzes}</strong><br>` +
                    `Total Score: <strong>${data.totalScore}</strong><br>` +
                    `Correct Answers: <strong>${data.totalCorrectAnswers}/${data.totalQuestions}</strong>`;
            } catch (e) {
                reportDetails.textContent = "Error fetching report.";
            }
        };
    }
});
