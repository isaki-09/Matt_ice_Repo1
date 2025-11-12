// Minimal auth demo using localStorage. Do NOT use for production.
const qs = sel => document.querySelector(sel);

const tabLogin = qs('#tab-login'),
      tabRegister = qs('#tab-register');
const loginSection = qs('#login-section'),
      registerSection = qs('#register-section');
const loginForm = qs('#login-form'),
      registerForm = qs('#register-form');
const loginMsg = qs('#login-message'),
      registerMsg = qs('#register-message');

// API endpoint
const API = "http://localhost:5000/api";

// --- TAB SWITCHING ---
function showTab(tab) {
    if(tab === 'login'){
        tabLogin.classList.add('active'); tabRegister.classList.remove('active');
        loginSection.style.display = ''; registerSection.style.display = 'none';
        loginSection.setAttribute('aria-hidden','false'); registerSection.setAttribute('aria-hidden','true');
    } else {
        tabRegister.classList.add('active'); tabLogin.classList.remove('active');
        registerSection.style.display = ''; loginSection.style.display = 'none';
        registerSection.setAttribute('aria-hidden','false'); loginSection.setAttribute('aria-hidden','true');
    }
    clearMessages();
}
tabLogin.addEventListener('click', ()=> showTab('login'));
tabRegister.addEventListener('click', ()=> showTab('register'));

// --- SHOW/HIDE PASSWORD ---
document.querySelectorAll('.show-pass').forEach(btn=>{
    btn.addEventListener('click', ()=>{
        const id = btn.dataset.toggle;
        const input = qs('#' + id);
        if(!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
        btn.textContent = input.type === 'password' ? 'Show' : 'Hide';
    })
});

function clearMessages(){
    loginMsg.textContent = ''; loginMsg.className = '';
    registerMsg.textContent = ''; registerMsg.className = '';
}

// --- SHA-256 HELPER ---
async function sha256hex(text){
    const enc = new TextEncoder();
    const data = enc.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(hashBuffer);
    return Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// --- LOCAL STORAGE USERS ---
function loadUsers(){
    try{
        const raw = localStorage.getItem('auth_demo_users') || '{}';
        return JSON.parse(raw);
    }catch(e){
        return {};
    }
}
function saveUsers(obj){
    localStorage.setItem('auth_demo_users', JSON.stringify(obj));
}

// --- REGISTER ---
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();
    const email = qs('#reg-email').value.trim().toLowerCase();
    const pw = qs('#reg-password').value;
    const pwc = qs('#reg-password-confirm').value;
    if(!email || !pw || !pwc){
        registerMsg.textContent = 'Please fill all fields.'; registerMsg.className = 'message error'; return;
    }
    if(pw.length < 6){
        registerMsg.textContent = 'Password must be at least 6 characters.'; registerMsg.className = 'message error'; return;
    }
    if(pw !== pwc){
        registerMsg.textContent = 'Passwords do not match.'; registerMsg.className = 'message error'; return;
    }

    const users = loadUsers();
    if(users[email]){
        registerMsg.textContent = 'An account with that email already exists.'; registerMsg.className = 'message error'; return;
    }

    const hashed = await sha256hex(pw);
    users[email] = { password: hashed, created: Date.now() };
    saveUsers(users);
    registerMsg.textContent = 'Registration successful. You can now sign in.'; registerMsg.className = 'message success';
    registerForm.reset();
    setTimeout(()=> showTab('login'), 800);
});

// --- LOCAL + API LOGIN ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();
    const email = qs('#login-email').value.trim().toLowerCase();
    const pw = qs('#login-password').value;

    if(!email || !pw){
        loginMsg.textContent = 'Please enter email and password.'; loginMsg.className = 'message error'; return;
    }

    // 1️⃣ First, try local storage login
    const users = loadUsers();
    if(users[email]){
        const hashed = await sha256hex(pw);
        if(hashed === users[email].password){
            loginMsg.textContent = 'Signed in locally.'; loginMsg.className = 'message success';
            if(qs('#remember').checked){
                localStorage.setItem('auth_demo_session', JSON.stringify({ email, ts: Date.now() }));
            } else {
                sessionStorage.setItem('auth_demo_session', JSON.stringify({ email, ts: Date.now() }));
            }
        } else {
            loginMsg.textContent = 'Incorrect password.'; loginMsg.className = 'message error';
            return;
        }
    }

    // 2️⃣ Then, try API login
    try {
        const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: pw }),
        });
        const data = await res.json();
        loginMsg.textContent = data.message || '';

        if(res.ok){
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            loginMsg.textContent = 'Signed in via API.'; loginMsg.className = 'message success';

            if(data.user.role === "admin"){
                window.location.href = "admin.html";
            }
        }
    } catch(err){
        console.error("API login failed:", err);
    }

    loginForm.reset();
});

// --- INIT SESSION CHECK ---
(function init(){
    const session = JSON.parse(sessionStorage.getItem('auth_demo_session') || localStorage.getItem('auth_demo_session') || 'null');
    if(session && session.email){
        loginMsg.textContent = 'Signed in as ' + session.email + '.'; loginMsg.className = 'message success';
    }
})();

console.log("Website loaded successfully!");
