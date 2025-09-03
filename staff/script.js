document.addEventListener('DOMContentLoaded', () => {
    const staffGrid = document.getElementById('staff-grid');
    const loader = document.getElementById('loader');
    const metaEl = document.getElementById('staff-meta');

    // API runs on plain HTTP which browsers block when this page is served
    // over HTTPS. Use a public CORS proxy (allorigins) to access it safely.
    const apiBase = 'http://bilge.caligo.asia:40005/api/staff-list';
    const remoteUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(apiBase);
    const proxyUrl = '/api/staff-list';

    const fetchJson = url => fetch(url).then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
    });

    const lighten = (hex, amt = 0.2) => {
        let c = hex.replace('#', '');
        if (c.length === 3) c = c.split('').map(s => s + s).join('');
        const num = parseInt(c, 16);
        let r = (num >> 16) & 255;
        let g = (num >> 8) & 255;
        let b = num & 255;
        r = Math.min(255, Math.floor(r + (255 - r) * amt));
        g = Math.min(255, Math.floor(g + (255 - g) * amt));
        b = Math.min(255, Math.floor(b + (255 - b) * amt));
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    };

    const createCard = staff => {
        const card = document.createElement('div');
        card.className = 'staff-card';

        const avatarWrap = document.createElement('div');
        avatarWrap.className = 'staff-avatar-wrap';
        const avatar = document.createElement('img');
        avatar.src = staff.avatar;
        avatar.alt = staff.displayName || staff.username;
        avatar.className = 'staff-avatar';
        avatarWrap.appendChild(avatar);
        const indicator = document.createElement('div');
        indicator.className = 'staff-online-indicator';
        avatarWrap.appendChild(indicator);
        card.appendChild(avatarWrap);

        const body = document.createElement('div');
        body.className = 'staff-body';

        const names = document.createElement('div');
        names.className = 'staff-names';
        const displayEl = document.createElement('div');
        displayEl.className = 'staff-display';
        displayEl.textContent = staff.displayName || staff.username;
        names.appendChild(displayEl);
        const usernameEl = document.createElement('div');
        usernameEl.className = 'staff-username';
        usernameEl.textContent = '@' + staff.username;
        names.appendChild(usernameEl);
        if (staff.nickname) {
            const nickEl = document.createElement('div');
            nickEl.className = 'staff-nick';
            nickEl.textContent = `"${staff.nickname}"`;
            names.appendChild(nickEl);
        }
        body.appendChild(names);

        const rolesDiv = document.createElement('div');
        rolesDiv.className = 'staff-roles';
        const roles = Array.isArray(staff.roles) ? staff.roles.slice().reverse() : [];
        roles.forEach(role => {
            const badge = document.createElement('span');
            const bg = role.color || '#3a3a3a';
            const gradEnd = lighten(bg, 0.3);
            const isArchon = role.name && role.name.toLowerCase().includes('archon');
            badge.className = 'staff-role-badge' + (isArchon ? ' archon' : '');
            badge.style.background = `linear-gradient(135deg, ${bg}, ${gradEnd})`;
            badge.style.color = '#fff';
            badge.textContent = role.name || '';
            rolesDiv.appendChild(badge);
        });
        body.appendChild(rolesDiv);

        const joinedEl = document.createElement('div');
        joinedEl.className = 'staff-joined';
        joinedEl.textContent = 'Bergabung: ' + new Date(staff.joinedAt).toLocaleDateString('id-ID');
        body.appendChild(joinedEl);

        const metaDiv = document.createElement('div');
        metaDiv.className = 'staff-meta';
        if (staff.talent) {
            const t = document.createElement('span');
            t.className = 'badge badge-talent';
            t.textContent = 'Talent';
            metaDiv.appendChild(t);
        }
        if (staff.absence) {
            const a = document.createElement('span');
            a.className = 'badge badge-absent';
            a.textContent = 'Absent';
            metaDiv.appendChild(a);
        }
        if (metaDiv.children.length > 0) body.appendChild(metaDiv);

        card.appendChild(body);
        return card;
    };

    const render = data => {
        const categories = data.data.metadata.categories;
        const staffData = data.data.user;
        staffGrid.innerHTML = '';
        categories.forEach(cat => {
            const list = staffData[cat.name] || [];
            const catDiv = document.createElement('div');
            catDiv.className = 'staff-category';
            catDiv.textContent = cat.displayName;
            staffGrid.appendChild(catDiv);

            const grid = document.createElement('div');
            grid.className = 'staff-grid';
            if (list.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'text-muted';
                empty.textContent = 'Belum ada staff.';
                grid.appendChild(empty);
            } else {
                list.forEach(staff => {
                    grid.appendChild(createCard(staff));
                });
            }
            staffGrid.appendChild(grid);
        });
    };

    fetchJson(remoteUrl)
        .catch(() => fetchJson(proxyUrl))
        .then(data => {
            loader.style.display = 'none';
            staffGrid.classList.remove('hidden');
            if (metaEl) {
                const total = data.data.metadata.totalStaff;
                const updated = new Date(data.data.metadata.lastUpdated).toLocaleDateString('id-ID');
                metaEl.textContent = `Total Staff: ${total} • Update terakhir: ${updated}`;
            }
            render(data);
        })
        .catch(err => {
            console.error('Error fetching staff list:', err);
            loader.innerHTML = '<p class="text-danger">Gagal memuat daftar staff. Silakan coba lagi nanti.</p>';
        });

    document.addEventListener('click', e => {
        const el = e.target;
        if (!el.classList.contains('staff-avatar')) return;
        el.dataset.count = (parseInt(el.dataset.count || '0', 10) + 1).toString();
        if (parseInt(el.dataset.count, 10) === 10) {
            window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
            el.dataset.count = '0';
        }
        setTimeout(() => {
            el.dataset.count = '0';
        }, 3000);
    });
});

