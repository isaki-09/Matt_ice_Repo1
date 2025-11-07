const API = "http://localhost:5000/api";
const token = localStorage.getItem("token");


if (!token) window.location.href = "login.html";


const form = document.getElementById("addForm");
form.addEventListener("submit", async (e) => {
e.preventDefault();


const name = document.getElementById("name").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;


const res = await fetch(`${API}/admin/users`, {
method: "POST",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${token}`,
},
body: JSON.stringify({ name, email, password }),
});


const data = await res.json();
document.getElementById("msg").textContent = data.message;
});