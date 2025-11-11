const API = "http://localhost:5000/api";
const token = localStorage.getItem("token");
if (!token) window.location.href = "../Index.html";


async function loadClients() {
const res = await fetch(`${API}/admin/users`, {
headers: { Authorization: `Bearer ${token}` },
});


const data = await res.json();
const tbody = document.querySelector("#clientTable tbody");
tbody.innerHTML = "";


data.forEach((c) => {
const row = document.createElement("tr");
row.innerHTML = `
<td>${c.name}</td>
<td>${c.email}</td>
<td>${c.approved}</td>
<td>
<button onclick="approve('${c._id}')">Approve</button>
<button onclick="unapprove('${c._id}')">Unapprove</button>
<button onclick="removeUser('${c._id}')">Delete</button>
</td>
`;
tbody.appendChild(row);
});
}


async function approve(id) {
await fetch(`${API}/admin/users/${id}/approve`, {
method: "POST",
headers: { Authorization: `Bearer ${token}` },
});
loadClients();
}


async function unapprove(id) {
await fetch(`${API}/admin/users/${id}/unapprove`, {
method: "POST",
headers: { Authorization: `Bearer ${token}` },
});
loadClients();
}


async function removeUser(id) {
await fetch(`${API}/admin/users/${id}`, {
method: "DELETE",
headers: { Authorization: `Bearer ${token}` },
});
loadClients();
}


function logout() {
localStorage.clear();
window.location.href = "login.html";
}


loadClients();