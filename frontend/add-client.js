const API = "http://localhost:5000/api";
const token = localStorage.getItem("token");

// Redirect to login if no token
if (!token) {
  window.location.href = "Index.html";
}

// DOM references
const form = document.getElementById("addForm");
const msg = document.getElementById("msg");
const tableBody = document.getElementById("usersTbody");
const countLabel = document.getElementById("count");
const emptyNotice = document.getElementById("empty");

// ✅ 1. Load all users from backend
async function loadUsers() {
  try {
    const res = await fetch(`${API}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const users = await res.json();

    tableBody.innerHTML = "";

    if (users.length === 0) {
      emptyNotice.style.display = "block";
      countLabel.textContent = "0 users";
      return;
    }

    emptyNotice.style.display = "none";
    countLabel.textContent = `${users.length} users`;

    users.forEach((u) => {
      const row = `
        <tr>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.role || "N/A"}</td>
          <td>
            <span class="badge ${u.status === "approved" ? "approved" : "pending"}">
              ${u.status || "pending"}
            </span>
          </td>
          <td>
            <button class="editBtn" data-id="${u.id}">Edit</button>
            <button class="deleteBtn" data-id="${u.id}">Delete</button>
          </td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });
  } catch (err) {
    console.error("Error loading users:", err);
  }
}

// ✅ 2. Add new user
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  if (!name || !email || !password || !role) {
    msg.textContent = "Please fill in all fields.";
    msg.style.color = "red";
    return;
  }

  try {
    const res = await fetch(`${API}/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();
    msg.textContent = data.message || "User added successfully!";
    form.reset();

    // Refresh user list
    loadUsers();
  } catch (err) {
    console.error(err);
    msg.textContent = "Error adding user.";
  }
});

// ✅ 3. Load users when the page starts
window.onload = loadUsers;
