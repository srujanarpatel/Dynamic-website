// Global variables
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentProduct = null;

// DOM elements
const homeSection = document.getElementById('home');
const productDetailsSection = document.getElementById('product-details');
const cartSection = document.getElementById('cart');
const productsGrid = document.getElementById('products-grid');
const productDetail = document.getElementById('product-detail');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const loading = document.getElementById('loading');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updateCartUI();
});

// Fetch products from API
async function fetchProducts() {
    try {
        loading.style.display = 'block';
        const response = await fetch('https://dummyjson.com/products');
        const data = await response.json();
        products = data.products;
        populateCategories();
        displayProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        loading.textContent = 'Error loading products. Please try again.';
    } finally {
        loading.style.display = 'none';
    }
}

// Populate category filter
function populateCategories() {
    const categories = [...new Set(products.map(product => product.category))];
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });
}

// Display products in grid
function displayProducts(productsToDisplay) {
    productsGrid.innerHTML = '';
    productsToDisplay.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => showProductDetails(product.id);

    card.innerHTML = `
        <img src="${product.thumbnail}" alt="${product.title}" class="product-image">
        <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <div class="product-price">$${product.price}</div>
            <div class="product-rating">
                <div class="stars">${generateStars(product.rating)}</div>
                <span class="rating-text">(${product.rating})</span>
            </div>
            <button class="btn-secondary" onclick="event.stopPropagation(); addToCart(${product.id})">Add to Cart</button>
        </div>
    `;

    return card;
}

// Generate star rating display
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '★';
    }

    if (hasHalfStar) {
        stars += '☆';
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '☆';
    }

    return stars;
}

// Show product details
async function showProductDetails(productId) {
    try {
        const response = await fetch(`https://dummyjson.com/products/${productId}`);
        const product = await response.json();
        currentProduct = product;

        productDetail.innerHTML = `
            <div class="product-detail-content">
                <img src="${product.thumbnail}" alt="${product.title}" class="detail-image">
                <div class="detail-info">
                    <h1>${product.title}</h1>
                    <p class="detail-description">${product.description}</p>
                    <div class="detail-price">$${product.price}</div>
                    <div class="detail-discount">${product.discountPercentage}% off</div>
                    <div class="detail-rating">
                        <div class="stars">${generateStars(product.rating)}</div>
                        <span class="rating-text">(${product.rating})</span>
                    </div>
                    <button class="btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
                </div>
            </div>
        `;

        showSection('product-details');
    } catch (error) {
        console.error('Error fetching product details:', error);
    }
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showNotification('Product added to cart!');
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

// Update item quantity
function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartUI();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart UI
function updateCartUI() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items display
    cartItems.innerHTML = '';
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty.</p>';
    } else {
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.thumbnail}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-info">
                    <h3 class="cart-item-title">${item.title}</h3>
                    <div class="cart-item-price">$${item.price}</div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            `;
            cartItems.appendChild(cartItem);
        });
    }

    // Update cart total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.innerHTML = `
        <div class="total-text">Total: <span class="total-price">$${total.toFixed(2)}</span></div>
    `;
}

// Filter products
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    let filteredProducts = products;

    if (selectedCategory) {
        filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
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