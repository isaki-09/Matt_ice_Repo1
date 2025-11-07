const API = "http://localhost:5000/api";
const form = document.getElementById("clientRegForm");


form.addEventListener("submit", async (e) => {
e.preventDefault();


const name = document.getElementById("name").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;


const res = await fetch(`${API}/admin/users`, {
method: "POST",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${localStorage.getItem("token")}`
},
body: JSON.stringify({ name, email, password }),
});


const data = await res.json();
document.getElementById("msg").textContent = data.message;
});