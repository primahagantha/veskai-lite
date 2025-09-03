document.addEventListener('DOMContentLoaded', () => {
    const staffGrid = document.getElementById('staff-grid');
    const loader = document.getElementById('loader');
    // If server has already rendered staff contents, do nothing
    if (staffGrid && staffGrid.dataset && staffGrid.dataset.rendered === '1') {
        if (loader) loader.style.display = 'none';
        return;
    }

    // Try remote API first; if it fails (CORS/network), fallback to server proxy
    const remoteUrl = 'http://bilge.caligo.asia:40005/api/staff-list';
    const proxyUrl = 'api.php';

    function doFetch(url) {
        return fetch(url, { mode: 'cors' }).then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        });
    }

    doFetch(remoteUrl)
        .catch(err => doFetch(proxyUrl))
        .then(apiData => {
            if (loader) loader.style.display = 'none';
            if (!staffGrid) return;
            staffGrid.classList.remove('hidden');
            staffGrid.innerHTML = '';
            const categories = apiData.data.metadata.categories;
            const staffData = apiData.data.user;
            categories.forEach(category => {
                const staffList = staffData[category.name];
                if (!staffList || staffList.length === 0) return;
                const catHeader = document.createElement('div');
                catHeader.className = 'staff-category';
                catHeader.textContent = category.displayName;
                staffGrid.appendChild(catHeader);
                staffList.forEach(staff => {
                    const card = document.createElement('div');
                    card.className = 'staff-card';
                    let rolesHtml = '';
                    if (staff.roles && staff.roles.length > 0) rolesHtml = staff.roles.map(role => `<span class="staff-role-badge" style="background:${role.color};">${role.name}</span>`).join(' ');
                    card.innerHTML = `
                        <img src="${staff.avatar}" alt="Avatar ${staff.displayName}" class="staff-avatar" loading="lazy">
                        <h4 class="staff-name text-white">${staff.displayName}</h4>
                        <div class="staff-nick">${staff.nickname ? staff.nickname : ''}</div>
                        <div class="staff-roles">${rolesHtml}</div>
                        <div class="staff-joined">Bergabung: ${new Date(staff.joinedAt).toLocaleDateString('id-ID')}</div>
                    `;
                    staffGrid.appendChild(card);
                });
            });
        })
        .catch(error => {
            if (loader) loader.innerHTML = '<p class="text-danger">Gagal memuat daftar staff. Silakan coba lagi nanti.</p>';
            console.error('Error fetching staff list:', error);
        });
});

// Avatar easter-egg: click the avatar 10 times quickly to rickroll
document.addEventListener('click', function(e){
    var el = e.target;
    if (!el.classList || !el.classList.contains('staff-avatar')) return;
    el.dataset.count = (parseInt(el.dataset.count||'0') + 1).toString();
    if (parseInt(el.dataset.count) === 10) {
        // open rickroll in new tab
        window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
        el.dataset.count = '0';
    }
    // reset count after 3s of inactivity
    setTimeout(function(){ el.dataset.count = '0'; }, 3000);
});

// Reverse role badges order so API bottom-most role appears on top visually
document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.staff-roles').forEach(function(container){
        var children = Array.prototype.slice.call(container.children);
        children.reverse().forEach(function(c){ container.appendChild(c); });
    });
});
