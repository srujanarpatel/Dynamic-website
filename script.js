// Main application entry point
document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});

// Global functions for HTML onclick handlers
function showHome() {
    if (typeof UI !== 'undefined' && UI.showHome) {
        UI.showHome();
    }
}

function showCart() {
    if (typeof UI !== 'undefined' && UI.showCart) {
        UI.showCart();
    }
}

function scrollToProducts() {
    const productsSection = document.querySelector('.products-section');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}
