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

async function fetchMyQuizzes() {
    const username = getUsernameFromToken();
    if (!username) {
        document.getElementById("admin-quiz-list").innerHTML = "<p>Could not determine user.</p>";
        return;
    }
    const res = await fetch(`${API_BASE}/host/${username}`, { headers });
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
        const div = document.createElement("div");
        div.className = "quiz-card";
        div.innerHTML = `
            <b>Quiz ID:</b> ${quizId}
            <div class="quiz-card-options">
                <button onclick="editQuiz('${quizId}')">Edit</button>
                <button onclick="deleteQuiz('${quizId}')">Delete</button>
                <button onclick="viewParticipants('${quizId}')">View Participants</button>
            </div>
        `;
        container.appendChild(div);
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
    document.getElementById("admin-quizzes-section").style.display = "none";
    document.getElementById("participants-section").style.display = "block";
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
        li.innerHTML = `${p.studentUsername} (Score: ${p.score}) <button class="delete-user-result-btn">Delete</button>`;
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
    document.getElementById("participants-section").style.display = "none";
    document.getElementById("admin-quizzes-section").style.display = "block";
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
    document.getElementById("admin-quizzes-section").querySelector("h3").textContent = "";
    fetchQuizQuestions(quizIdParam);
} else {
    fetchMyQuizzes();
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

function fetchUserQuizzes() {
    const username = getUsernameFromToken();
    if (!username) return;
    fetch(`http://localhost:8081/api/questions/host/${username}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
        .then(res => res.json())
        .then(quizzes => {
            // Render only these quizzes in the admin panel
            renderAdminQuizzes(quizzes);
        });
}

// Call fetchUserQuizzes() when loading the admin panel or previously published quizzes
fetchUserQuizzes();
