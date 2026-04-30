// Cart Module - Handles cart functionality and localStorage
class Cart {
    static CART_KEY = 'ecommerce_cart';
    static WISHLIST_KEY = 'ecommerce_wishlist';

    // Get cart from localStorage
    static getCart() {
        return JSON.parse(localStorage.getItem(this.CART_KEY)) || [];
    }

    // Save cart to localStorage
    static saveCart(cart) {
        localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
    }

    // Add item to cart
    static addItem(product, quantity = 1) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                thumbnail: product.thumbnail,
                quantity: quantity,
                discountPercentage: product.discountPercentage || 0,
                stock: product.stock || 10
            });
        }

        this.saveCart(cart);
        this.updateCartCount();
        return cart;
    }

    // Remove item from cart
    static removeItem(productId) {
        const cart = this.getCart().filter(item => item.id !== productId);
        this.saveCart(cart);
        this.updateCartCount();
        return cart;
    }

    // Update item quantity
    static updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            return this.removeItem(productId);
        }

        const cart = this.getCart();
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart(cart);
        }
        return cart;
    }

    // Get cart total
    static getCartTotal() {
        const cart = this.getCart();
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = cart.reduce((sum, item) => sum + ((item.price * item.discountPercentage / 100) * item.quantity), 0);
        const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500

        return {
            subtotal: subtotal,
            discount: discount,
            shipping: shipping,
            total: subtotal - discount + shipping,
            itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
        };
    }

    // Update cart count in navbar
    static updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const total = this.getCartTotal();
            cartCount.textContent = total.itemCount;
        }
    }

    // Clear cart
    static clearCart() {
        this.saveCart([]);
        this.updateCartCount();
    }

    // Wishlist functions
    static getWishlist() {
        return JSON.parse(localStorage.getItem(this.WISHLIST_KEY)) || [];
    }

    static saveWishlist(wishlist) {
        localStorage.setItem(this.WISHLIST_KEY, JSON.stringify(wishlist));
    }

    static addToWishlist(product) {
        const wishlist = this.getWishlist();
        if (!wishlist.find(item => item.id === product.id)) {
            wishlist.push({
                id: product.id,
                title: product.title,
                price: product.price,
                thumbnail: product.thumbnail,
                rating: product.rating
            });
            this.saveWishlist(wishlist);
        }
        return wishlist;
    }

    static removeFromWishlist(productId) {
        const wishlist = this.getWishlist().filter(item => item.id !== productId);
        this.saveWishlist(wishlist);
        return wishlist;
    }

    static isInWishlist(productId) {
        return this.getWishlist().some(item => item.id === productId);
    }
}