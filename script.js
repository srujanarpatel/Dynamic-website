// Main application entry point
document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});

// Global functions for HTML onclick handlers
function showHome() {
    UI.showHome();
}

function showCart() {
    UI.showCart();
}

function scrollToProducts() {
    document.querySelector('.products-section').scrollIntoView({ behavior: 'smooth' });
}

    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
            product.title.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }

    displayProducts(filteredProducts);
}

// Show notification
function showNotification(message) {
    // Simple notification - you could enhance this
    alert(message);
}

// Checkout (placeholder)
function checkout() {
    alert('Checkout functionality would be implemented here!');
}

// Navigation functions
function showHome() {
    showSection('home');
}

function showCart() {
    showSection('cart');
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionId).classList.add('active');
}

// Scroll to products
function scrollToProducts() {
    document.querySelector('.products-section').scrollIntoView({ behavior: 'smooth' });
}