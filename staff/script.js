document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://bilge.caligo.asia:40005/api/staff-list';
    const staffContainer = document.getElementById('staff-container');
    const loader = document.getElementById('loader');

    fetch(API_URL)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(json => {
            loader.style.display = 'none';
            staffContainer.classList.remove('hidden');

            const { user, metadata } = json.data;

            metadata.categories.forEach(cat => {
                const section = document.createElement('section');
                section.className = 'staff-section';

                const title = document.createElement('h2');
                title.className = 'category-title';
                title.textContent = `${cat.displayName} (${cat.count})`;
                section.appendChild(title);

                const grid = document.createElement('div');
                grid.className = 'staff-grid';

                (user[cat.name] || []).forEach(staff => {
                    grid.appendChild(createStaffCard(staff));
                });

                section.appendChild(grid);
                staffContainer.appendChild(section);
            });
        })
        .catch(err => {
            console.error('Error fetching staff list:', err);
            loader.innerHTML = '<p class="text-danger">Gagal memuat daftar staff. Silakan coba lagi nanti.</p>';
        });

    function createStaffCard(staff) {
        const card = document.createElement('div');
        card.className = 'staff-card';

        const avatar = document.createElement('img');
        avatar.src = staff.avatar;
        avatar.alt = `Avatar ${staff.displayName || staff.username}`;
        avatar.className = 'staff-avatar';
        card.appendChild(avatar);

        const nameEl = document.createElement('h4');
        nameEl.className = 'staff-name text-white';
        const nameLink = document.createElement('a');
        nameLink.href = `https://discord.com/users/${staff.id}`;
        nameLink.target = '_blank';
        nameLink.rel = 'noopener noreferrer';
        nameLink.textContent = staff.displayName || staff.username;
        nameEl.appendChild(nameLink);
        card.appendChild(nameEl);

        if (staff.nickname) {
            const nick = document.createElement('p');
            nick.className = 'staff-nickname';
            nick.textContent = `"${staff.nickname}"`;
            card.appendChild(nick);
        }

        const userName = document.createElement('p');
        userName.className = 'staff-username';
        userName.textContent = `@${staff.username}`;
        card.appendChild(userName);

        const joined = document.createElement('p');
        joined.className = 'staff-joined';
        joined.textContent = `Joined: ${new Date(staff.joinedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`;
        card.appendChild(joined);

        const rolesDiv = document.createElement('div');
        rolesDiv.className = 'staff-roles';
        if (Array.isArray(staff.roles)) {
            staff.roles.forEach(role => {
                const span = document.createElement('span');
                span.className = 'role-badge';
                span.textContent = role.name;
                span.style.backgroundColor = role.color;
                span.style.color = getContrastColor(role.color);
                rolesDiv.appendChild(span);
            });
        }
        card.appendChild(rolesDiv);

        return card;
    }

    function getContrastColor(hex) {
        const r = parseInt(hex.substr(1, 2), 16);
        const g = parseInt(hex.substr(3, 2), 16);
        const b = parseInt(hex.substr(5, 2), 16);
        const yiq = (r * 299 + g * 587 + b * 114) / 1000;
        return yiq >= 128 ? '#000' : '#fff';
    }
});
