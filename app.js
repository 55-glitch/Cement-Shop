// Main application logic

document.addEventListener('DOMContentLoaded', () => {
    // Initialize storage
    Storage.initPrices();

    // Initialize based on current page
    const pathname = window.location.pathname;
    const currentPage = pathname.split('/').pop() || pathname || 'index.html';

    if (currentPage === 'index.html' || currentPage === '' || currentPage.endsWith('index.html') || !currentPage.includes('.')) {
        // Initialize home page
        PriceManager.init();
        CartManager.init();
    } else if (currentPage === 'report.html' || currentPage.endsWith('report.html')) {
        // Initialize report page
        ReportManager.init();
    }

    // Setup mobile menu toggle
    setupMobileMenu();
});

// Setup mobile navigation menu
function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }
}

