// Admin Functions

        // Simple client-side admin UI. Data persisted in localStorage under "admin_users".
        const STORAGE_KEY = 'admin_users_v1';
        const sampleUsers = [
            { id: genId(), name: 'Alice Johnson', email: 'alice@example.com', role: 'user', approved: true },
            { id: genId(), name: 'Bob Smith', email: 'bob@example.com', role: 'manager', approved: false },
            { id: genId(), name: 'Cara Lee', email: 'cara@example.com', role: 'user', approved: true }
        ];

        const el = id => document.getElementById(id);
        const usersTbody = el('usersTbody');
        const usersTable = el('usersTable');
        const emptyDiv = el('empty');
        const countEl = el('count');
        const searchInput = el('search');

        let users = load();
        render();

        // Event listeners
        el('userForm').addEventListener('submit', onSave);
        el('cancelBtn').addEventListener('click', resetForm);
        el('reset').addEventListener('click', () => { searchInput.value=''; render(); });
        el('bulkDelete').addEventListener('click', deleteUnapproved);
        searchInput.addEventListener('input', render);

        function genId(){
            return 'u_' + Math.random().toString(36).slice(2,10);
        }

        function load(){
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (!raw) {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleUsers));
                    return sampleUsers.slice();
                }
                return JSON.parse(raw);
            } catch(e){
                console.error(e);
                return sampleUsers.slice();
            }
        }

        function save(){
            localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
            render();
        }

        function onSave(evt){
            evt.preventDefault();
            const id = el('userId').value || genId();
            const name = el('name').value.trim();
            const email = el('email').value.trim().toLowerCase();
            const role = el('role').value;
            const approved = el('approved').value === 'true';

            if(!name || !validateEmail(email)){
                alert('Provide a valid name and email.');
                return;
            }

            const exists = users.find(u => u.email === email && u.id !== id);
            if(exists){
                alert('A user with this email already exists.');
                return;
            }

            const record = { id, name, email, role, approved };

            const idx = users.findIndex(u => u.id === id);
            if(idx >= 0){
                users[idx] = record;
            } else {
                users.unshift(record);
            }

            save();
            resetForm();
        }

        function validateEmail(e){
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
        }

        function render(){
            const q = searchInput.value.trim().toLowerCase();
            const list = q
                ? users.filter(u => (u.name + ' ' + u.email + ' ' + u.role).toLowerCase().includes(q))
                : users;

            usersTbody.innerHTML = '';
            if(!list.length){
                usersTable.style.display = 'table';
                emptyDiv.style.display = users.length ? 'none' : 'block';
                if(!users.length) usersTable.style.display = 'none';
            } else {
                emptyDiv.style.display = 'none';
                usersTable.style.display = 'table';
            }

            list.forEach(u => {
                const tr = document.createElement('tr');

                const nameTd = document.createElement('td');
                nameTd.textContent = u.name;
                const emailTd = document.createElement('td');
                emailTd.textContent = u.email;
                const roleTd = document.createElement('td');
                roleTd.textContent = u.role;

                const statusTd = document.createElement('td');
                const badge = document.createElement('span');
                badge.className = 'badge ' + (u.approved ? 'ok' : 'no');
                badge.textContent = u.approved ? 'Approved' : 'Pending';
                statusTd.appendChild(badge);

                const actionsTd = document.createElement('td');
                actionsTd.className = 'row-actions';
                // layout buttons horizontally (landscape)
                actionsTd.style.display = 'flex';
                actionsTd.style.gap = '8px';
                actionsTd.style.justifyContent = 'flex-end';
                actionsTd.style.alignItems = 'center';

                // Approve toggle
                const aproBtn = document.createElement('button');
                aproBtn.className = 'ghost';
                aproBtn.textContent = u.approved ? 'Unapprove' : 'Approve';
                aproBtn.title = u.approved ? 'Click to unapprove' : 'Click to approve';
                aproBtn.addEventListener('click', () => toggleApprove(u.id));

                // Edit
                const editBtn = document.createElement('button');
                editBtn.className = 'ghost';
                editBtn.textContent = 'Edit';
                editBtn.title = 'Edit user';
                editBtn.addEventListener('click', () => populateForm(u.id));

                // Delete
                const delBtn = document.createElement('button');
                delBtn.className = '';
                delBtn.textContent = 'Delete';
                delBtn.title = 'Delete user';
                delBtn.style.borderColor = '#f3c6c6';
                delBtn.addEventListener('click', () => deleteUser(u.id));

                actionsTd.appendChild(aproBtn);
                actionsTd.appendChild(editBtn);
                actionsTd.appendChild(delBtn);

                tr.appendChild(nameTd);
                tr.appendChild(emailTd);
                tr.appendChild(roleTd);
                tr.appendChild(statusTd);
                tr.appendChild(actionsTd);
                usersTbody.appendChild(tr);
            });

            countEl.textContent = users.length + (users.length === 1 ? ' user' : ' users');
        }

        function populateForm(id){
            const u = users.find(x=>x.id===id);
            if(!u) return;
            el('userId').value = u.id;
            el('name').value = u.name;
            el('email').value = u.email;
            el('role').value = u.role;
            el('approved').value = u.approved ? 'true' : 'false';
            el('formTitle').textContent = 'Edit Client';
            el('saveBtn').textContent = 'Save';
            el('name').focus();
        }

        function resetForm(){
            el('userId').value = '';
            el('name').value = '';
            el('email').value = '';
            el('role').value = 'user';
            el('approved').value = 'false';
            el('formTitle').textContent = 'Add Client';
            el('saveBtn').textContent = 'Add';
        }

        function toggleApprove(id){
            const u = users.find(x=>x.id===id);
            if(!u) return;
            u.approved = !u.approved;
            save();
        }

        function deleteUser(id){
            if(!confirm('Delete this client? This action cannot be undone.')) return;
            users = users.filter(x=>x.id!==id);
            save();
        }

        function deleteUnapproved(){
            if(!confirm('Delete all unapproved clients?')) return;
            users = users.filter(u=>u.approved);
            save();
        }

        // Provide global helper for debugging in console (optional)
        window.__admin_users = {
            list: () => users.slice(),
            reload: () => { users = load(); render(); },
            clear: () => { users = []; save(); }
        };
