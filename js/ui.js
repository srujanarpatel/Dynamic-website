// UI Module - Handles all UI interactions and rendering
class UI {
    static currentPage = 'home';
    static products = [];
    static filteredProducts = [];

    // Initialize the application
    static async init() {
        this.setupEventListeners();
        this.updateActiveNav();
        Cart.updateCartCount();

        if (this.currentPage === 'home') {
            await this.loadProducts();
        }
    }

    // Setup event listeners
    static setupEventListeners() {
        // Event listeners are handled directly in HTML for better performance
        // This function is kept for any additional dynamic event listeners
    }

    // Load products from API
    static async loadProducts() {
        try {
            this.showLoading();
            this.products = await API.fetchProducts();
            this.filteredProducts = [...this.products];
            this.populateCategories();
            this.displayProducts(this.products);
        } catch (error) {
            this.showError('Failed to load products. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    // Show loading skeleton
    static showLoading() {
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            productsGrid.innerHTML = '';
            for (let i = 0; i < 8; i++) {
                productsGrid.innerHTML += `
                    <div class="product-card skeleton">
                        <div class="skeleton-image"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-title"></div>
                            <div class="skeleton-price"></div>
                            <div class="skeleton-rating"></div>
                        </div>
                    </div>
                `;
            }
        }
    }

    // Hide loading
    static hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
    }

    // Show error message
    static showError(message) {
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            productsGrid.innerHTML = `<div class="error-message">${message}</div>`;
        }
    }

    // Populate category filter
    static populateCategories() {
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            const categories = [...new Set(this.products.map(product => product.category))];
            categoryFilter.innerHTML = '<option value="">All Categories</option>';
            categories.forEach(category => {
                categoryFilter.innerHTML += `<option value="${category}">${this.capitalizeFirst(category)}</option>`;
            });
        }
    }

    // Display products
    static displayProducts(productsToDisplay) {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;

        if (productsToDisplay.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = '';
        productsToDisplay.forEach(product => {
            const productCard = this.createProductCard(product);
            productsGrid.appendChild(productCard);
        });
    }

    // Create product card
    static createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => this.showProductDetails(product.id);

        const isInWishlist = Cart.isInWishlist(product.id);
        const discountPrice = product.price - (product.price * product.discountPercentage / 100);

        card.innerHTML = `
            <div class="product-image-container">
                <img src="${product.thumbnail}" alt="${product.title}" class="product-image" loading="lazy">
                <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" onclick="event.stopPropagation(); UI.toggleWishlist(${product.id})">
                    ❤️
                </button>
                ${product.discountPercentage > 0 ? `<div class="discount-badge">-${product.discountPercentage}%</div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">
                    ${product.discountPercentage > 0 ?
                        `<span class="original-price">$${product.price}</span> <span class="discount-price">$${discountPrice.toFixed(2)}</span>` :
                        `$${product.price}`
                    }
                </div>
                <div class="product-rating">
                    <div class="stars">${this.generateStars(product.rating)}</div>
                    <span class="rating-text">(${product.rating})</span>
                </div>
                <div class="product-actions">
                    <button class="btn-secondary" onclick="event.stopPropagation(); UI.addToCart(${product.id})">Add to Cart</button>
                    <button class="btn-outline" onclick="event.stopPropagation(); UI.showProductDetails(${product.id})">View Details</button>
                </div>
            </div>
        `;

        return card;
    }

    // Generate star rating
    static generateStars(rating) {
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

    // Filter products by search
    static filterProducts(query = '') {
        const searchInput = document.getElementById('search-input');
        const searchQuery = query || (searchInput ? searchInput.value : '');

        if (!searchQuery.trim()) {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product =>
                product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        this.displayProducts(this.filteredProducts);
    }

    // Filter by category
    static filterByCategory(category = '') {
        const categoryFilter = document.getElementById('category-filter');
        const selectedCategory = category || (categoryFilter ? categoryFilter.value : '');

        if (!selectedCategory) {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product => product.category === selectedCategory);
        }
        this.displayProducts(this.filteredProducts);
    }

    // Sort products
    static sortProducts(sortBy = '') {
        const sortSelect = document.getElementById('sort-select');
        const selectedSort = sortBy || (sortSelect ? sortSelect.value : '');

        switch (selectedSort) {
            case 'price-low':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                this.filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
            default:
                this.filteredProducts = [...this.products];
        }
        this.displayProducts(this.filteredProducts);
    }

    // Show product details
    static async showProductDetails(productId) {
        try {
            const product = await API.fetchProduct(productId);
            this.renderProductDetails(product);
            this.showSection('product-details');
            this.updateBreadcrumb(['Home', 'Products', product.title]);
        } catch (error) {
            this.showToast('Failed to load product details', 'error');
        }
    }

    // Render product details
    static renderProductDetails(product) {
        const productDetail = document.getElementById('product-detail');
        if (!productDetail) return;

        const discountPrice = product.price - (product.price * product.discountPercentage / 100);
        const isInWishlist = Cart.isInWishlist(product.id);

        productDetail.innerHTML = `
            <div class="product-detail-content">
                <div class="product-gallery">
                    <img src="${product.thumbnail}" alt="${product.title}" class="detail-image">
                </div>
                <div class="detail-info">
                    <h1>${product.title}</h1>
                    <p class="detail-description">${product.description}</p>
                    <div class="detail-price">
                        ${product.discountPercentage > 0 ?
                            `<span class="original-price">$${product.price}</span> <span class="discount-price">$${discountPrice.toFixed(2)}</span>` :
                            `$${product.price}`
                        }
                        ${product.discountPercentage > 0 ? `<span class="discount-badge">Save ${product.discountPercentage}%</span>` : ''}
                    </div>
                    <div class="detail-rating">
                        <div class="stars">${this.generateStars(product.rating)}</div>
                        <span class="rating-text">(${product.rating}) • ${product.stock} in stock</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-primary" onclick="UI.addToCart(${product.id})">
                            <span class="cart-icon">🛒</span> Add to Cart
                        </button>
                        <button class="btn-outline wishlist-btn-large ${isInWishlist ? 'active' : ''}" onclick="UI.toggleWishlist(${product.id})">
                            ❤️ ${isInWishlist ? 'Remove from' : 'Add to'} Wishlist
                        </button>
                    </div>
                    <div class="product-meta">
                        <div class="meta-item">
                            <span class="meta-label">Category:</span>
                            <span class="meta-value">${this.capitalizeFirst(product.category)}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Brand:</span>
                            <span class="meta-value">${product.brand || 'N/A'}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">SKU:</span>
                            <span class="meta-value">${product.sku || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Add to cart
    static addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            Cart.addItem(product);
            this.showToast('Product added to cart!', 'success');
            this.animateCartIcon();
        }
    }

    // Toggle wishlist
    static toggleWishlist(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        if (Cart.isInWishlist(productId)) {
            Cart.removeFromWishlist(productId);
            this.showToast('Removed from wishlist', 'info');
        } else {
            Cart.addToWishlist(product);
            this.showToast('Added to wishlist!', 'success');
        }

        // Update UI
        this.displayProducts(this.filteredProducts);
        if (this.currentPage === 'product-details') {
            this.renderProductDetails(product);
        }
    }

    // Show cart page
    static showCart() {
        this.renderCartPage();
        this.showSection('cart');
        this.updateBreadcrumb(['Home', 'Cart']);
    }

    // Render cart page
    static renderCartPage() {
        const cartItems = Cart.getCart();
        const cartTotal = Cart.getCartTotal();

        const cartContainer = document.getElementById('cart-container');
        if (!cartContainer) return;

        if (cartItems.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Add some products to get started!</p>
                    <button class="btn-primary" onclick="UI.showHome()">Continue Shopping</button>
                </div>
            `;
            return;
        }

        cartContainer.innerHTML = `
            <div class="cart-content">
                <div class="cart-items">
                    ${cartItems.map(item => this.createCartItem(item)).join('')}
                </div>
                <div class="cart-summary">
                    <div class="summary-card">
                        <h3>Order Summary</h3>
                        <div class="summary-row">
                            <span>Subtotal (${cartTotal.itemCount} items)</span>
                            <span>$${cartTotal.subtotal.toFixed(2)}</span>
                        </div>
                        ${cartTotal.discount > 0 ? `
                            <div class="summary-row discount">
                                <span>Discount</span>
                                <span>-$${cartTotal.discount.toFixed(2)}</span>
                            </div>
                        ` : ''}
                        <div class="summary-row">
                            <span>Shipping</span>
                            <span>${cartTotal.shipping === 0 ? 'FREE' : '$' + cartTotal.shipping}</span>
                        </div>
                        <div class="summary-divider"></div>
                        <div class="summary-row total">
                            <span>Total</span>
                            <span>$${cartTotal.total.toFixed(2)}</span>
                        </div>
                        ${cartTotal.discount > 0 ? `
                            <div class="savings-message">
                                🎉 You saved $${cartTotal.discount.toFixed(2)}!
                            </div>
                        ` : ''}
                        ${cartTotal.shipping === 0 ? `
                            <div class="free-shipping-message">
                                🚚 Free shipping applied!
                            </div>
                        ` : ''}
                        <div class="delivery-info">
                            📦 Estimated delivery: 3-5 business days
                        </div>
                    </div>
                    <button class="btn-primary checkout-btn" onclick="UI.showCheckout()">
                        Proceed to Checkout
                    </button>
                </div>
            </div>
            <div class="checkout-section" id="checkout-section" style="display: none;">
                ${this.createCheckoutForm()}
            </div>
        `;
    }

    // Create cart item
    static createCartItem(item) {
        const itemTotal = (item.price * item.quantity).toFixed(2);
        const discountAmount = (item.price * item.discountPercentage / 100 * item.quantity).toFixed(2);

        return `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.thumbnail}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <div class="cart-item-price">
                        $${item.price}
                        ${item.discountPercentage > 0 ? `<span class="item-discount">Save ${item.discountPercentage}%</span>` : ''}
                    </div>
                    <div class="cart-item-stock">
                        ${item.stock > 5 ? '✅ In Stock' : item.stock > 0 ? '⚠️ Low Stock' : '❌ Out of Stock'}
                    </div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="UI.updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="UI.updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-total">
                    <div class="item-total-price">$${itemTotal}</div>
                    ${discountAmount > 0 ? `<div class="item-savings">Saved $${discountAmount}</div>` : ''}
                </div>
                <button class="remove-btn" onclick="UI.confirmRemove(${item.id})">
                    🗑️
                </button>
            </div>
        `;
    }

    // Update cart quantity
    static updateCartQuantity(productId, newQuantity) {
        Cart.updateQuantity(productId, newQuantity);
        this.renderCartPage();
    }

    // Confirm remove item
    static confirmRemove(productId) {
        if (confirm('Are you sure you want to remove this item from your cart?')) {
            Cart.removeItem(productId);
            this.renderCartPage();
            this.showToast('Item removed from cart', 'info');
        }
    }

    // Show checkout
    static showCheckout() {
        const checkoutSection = document.getElementById('checkout-section');
        if (checkoutSection) {
            checkoutSection.style.display = 'block';
            checkoutSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Create checkout form
    static createCheckoutForm() {
        return `
            <div class="checkout-form">
                <h3>Checkout Information</h3>
                <form id="checkout-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="full-name">Full Name *</label>
                            <input type="text" id="full-name" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email *</label>
                            <input type="email" id="email" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="address">Address *</label>
                        <textarea id="address" rows="3" required></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="city">City *</label>
                            <input type="text" id="city" required>
                        </div>
                        <div class="form-group">
                            <label for="zipcode">ZIP Code *</label>
                            <input type="text" id="zipcode" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="phone">Phone Number *</label>
                        <input type="tel" id="phone" required>
                    </div>
                    <div class="form-group">
                        <label>Payment Method</label>
                        <div class="payment-methods">
                            <label class="payment-option">
                                <input type="radio" name="payment" value="cod" checked>
                                <span>Cash on Delivery</span>
                            </label>
                            <label class="payment-option">
                                <input type="radio" name="payment" value="card">
                                <span>Credit/Debit Card</span>
                            </label>
                        </div>
                    </div>
                    <div class="card-details" style="display: none;">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="card-number">Card Number</label>
                                <input type="text" id="card-number" placeholder="1234 5678 9012 3456">
                            </div>
                            <div class="form-group">
                                <label for="expiry">Expiry Date</label>
                                <input type="text" id="expiry" placeholder="MM/YY">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="cvv">CVV</label>
                                <input type="text" id="cvv" placeholder="123">
                            </div>
                            <div class="form-group">
                                <label for="card-name">Name on Card</label>
                                <input type="text" id="card-name">
                            </div>
                        </div>
                    </div>
                    <button type="submit" class="btn-primary place-order-btn">
                        Place Order - $${Cart.getCartTotal().total.toFixed(2)}
                    </button>
                </form>
            </div>
        `;
    }

    // Show home page
    static showHome() {
        this.showSection('home');
        this.updateBreadcrumb(['Home']);
    }

    // Show section
    static showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('active');
            this.currentPage = sectionId;
            this.updateActiveNav();
        }
    }

    // Update active navigation
    static updateActiveNav() {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
        });

        const homeLink = document.querySelector('.nav-links a');
        if (homeLink && this.currentPage === 'home') {
            homeLink.classList.add('active');
        }
    }

    // Update breadcrumb
    static updateBreadcrumb(items) {
        const breadcrumb = document.getElementById('breadcrumb');
        if (breadcrumb) {
            breadcrumb.innerHTML = items.map((item, index) => {
                if (index === items.length - 1) {
                    return `<span class="breadcrumb-current">${item}</span>`;
                } else {
                    return `<a href="#" onclick="UI.showHome()">${item}</a>`;
                }
            }).join(' <span class="breadcrumb-separator">></span> ');
        }
    }

    // Show toast notification
    static showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        document.body.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 3000);
    }

    // Animate cart icon
    static animateCartIcon() {
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.classList.add('bounce');
            setTimeout(() => cartIcon.classList.remove('bounce'), 600);
        }
    }

    // Utility functions
    static capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}