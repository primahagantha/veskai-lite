document.addEventListener('DOMContentLoaded', () => {
    const staffGrid = document.getElementById('staff-grid');
    const loader = document.getElementById('loader');

    // Panggil API Vercel Anda untuk mendapatkan daftar staff
    fetch('/api/getStaffList')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(staffList => {
            // Sembunyikan loader
            loader.style.display = 'none';

            // Buat kartu untuk setiap staff
            staffList.forEach(staff => {
                const card = document.createElement('div');
                card.className = 'staff-card';

                // Buat link sosial media
                let socialLinks = '';
                if (staff.socials) {
                    staff.socials.forEach(social => {
                        socialLinks += `<a href="${social.url}" target="_blank" rel="noopener noreferrer"><i class="bi ${social.icon}"></i></a>`;
                    });
                }
                
                // Masukkan semua data ke dalam HTML kartu
                card.innerHTML = `
                    <img src="${staff.avatarUrl}" alt="Avatar ${staff.name}" class="staff-avatar">
                    <h4 class="staff-name text-white">${staff.name}</h4>
                    <p class="staff-role">${staff.role}</p>
                    <div class="staff-socials">
                        ${socialLinks}
                    </div>
                `;
                staffGrid.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching staff list:', error);
            loader.innerHTML = '<p class="text-danger">Gagal memuat daftar staff. Silakan coba lagi nanti.</p>';
        });
});