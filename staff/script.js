document.addEventListener('DOMContentLoaded', () => {
    const staffGrid = document.getElementById('staff-grid');
    const loader = document.getElementById('loader');
    // If server has already rendered staff contents, do nothing
    if (staffGrid && staffGrid.dataset && staffGrid.dataset.rendered === '1') {
        if (loader) loader.style.display = 'none';
        return;
    }

    const apiUrl = 'https://corsproxy.io/?' + encodeURIComponent('http://bilge.caligo.asia:40005/api/staff-list');

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
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
                    card.dataset.username = staff.username || (staff.displayName || 'unknown');

                    const display = staff.displayName || staff.username;
                    const nick = staff.nickname || '';
                    const talent = staff.talent || null;
                    const absent = staff.absence || null;

                    let rolesHtml = '';
                    if (staff.roles && Array.isArray(staff.roles)) {
                        const reversedRoles = [...staff.roles].reverse();
                        rolesHtml = reversedRoles.map(role => {
                            const rname = role.name || role.roleName || 'Role';
                            const rcolor = role.color || '#3a3a3a';
                            const isArchon = rname.toLowerCase().includes('archon');
                            const textColor = '#fff'; // Assuming white text is always fine for contrast.
                            // The PHP had a simple lighten effect which is harder to replicate, so we'll just use the color for the gradient.
                            const background = `linear-gradient(135deg, ${rcolor}, ${rcolor})`;
                            return `<span class="staff-role-badge${isArchon ? ' archon' : ''}" style="background: ${background}; color: ${textColor}">${rname}</span>`;
                        }).join('');
                    }

                    let metaHtml = '';
                    if (talent) {
                        metaHtml += `<span class="badge badge-talent">Talent</span>`;
                    }
                    if (absent) {
                        metaHtml += `<span class="badge badge-absent">Absent</span>`;
                    }

                    card.innerHTML = `
                        <div class="staff-avatar-wrap">
                            <img src="${staff.avatar || ''}" alt="${display}" class="staff-avatar">
                            <div class="staff-online-indicator"></div>
                        </div>
                        <div class="staff-body">
                            <div class="staff-names">
                                <div class="staff-display">${display}</div>
                                <div class="staff-username">@${staff.username}</div>
                                ${nick ? `<div class="staff-nick">"${nick}"</div>` : ''}
                            </div>
                            <div class="staff-roles">${rolesHtml}</div>
                            <div class="staff-meta">${metaHtml}</div>
                        </div>
                    `;
                    staffGrid.appendChild(card);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching staff list:', error);
            const mainContainer = document.querySelector('.container-main');
            renderMaintenancePage(mainContainer);
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
