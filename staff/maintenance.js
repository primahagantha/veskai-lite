function renderMaintenancePage(container) {
    if (!container) {
        console.error('Maintenance page container not found.');
        return;
    }
    container.innerHTML = `
        <div class="maintenance-container">
            <h1>Halaman Sedang Dalam Perbaikan</h1>
            <p>Halaman staff sedang tidak dapat diakses saat ini. Kami sedang berusaha memperbaikinya.</p>
            <p>Silakan coba lagi nanti.</p>
        </div>
    `;
}
