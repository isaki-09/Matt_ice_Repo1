login.js

const API = "http://localhost:5000/api";


const form = document.getElementById("loginForm");
form.addEventListener("submit", async (e) => {
e.preventDefault();



const email = document.getElementById("email").value;
const password = document.getElementById("password").value;


const res = await fetch(`${API}/auth/login`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ email, password }),
});


const data = await res.json();
document.getElementById("msg").textContent = data.message || "";


if (res.ok) {
localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));


if (data.user.role === "admin") {
window.location.href = "../admin.html";
}
}
});