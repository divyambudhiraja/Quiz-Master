const API_BASE = "http://localhost:8080/api/auth";

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (!res.ok) throw new Error("Invalid credentials");
        const data = await res.json();
        localStorage.setItem("token", data.token);
        // Prefer values from backend when available
        localStorage.setItem("username", data.username || username);
        localStorage.setItem("role", data.role || "USER");
        window.location.href = "dashboard.html";
    } catch (err) {
        document.getElementById("error").textContent = err.message;
    }
});

document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;

    try {
        const res = await fetch(`${API_BASE}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (!res.ok) throw new Error("Registration failed");
        alert("Registration successful! Please log in.");
        localStorage.setItem("username", username);
        showLogin();
    } catch (err) {
        document.getElementById("error").textContent = err.message;
    }
});

function showLogin() {
    document.getElementById("login-form").style.display = "block";
    document.getElementById("register-form").style.display = "none";
    document.getElementById("error").textContent = "";
}

function showRegister() {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("register-form").style.display = "block";
    document.getElementById("error").textContent = "";
}
