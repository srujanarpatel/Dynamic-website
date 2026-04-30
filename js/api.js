// API Module - Handles all API interactions
class API {
    static BASE_URL = 'https://dummyjson.com';

    // Fetch all products
    static async fetchProducts() {
        try {
            const response = await fetch(`${this.BASE_URL}/products`);
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            return data.products;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    // Fetch single product by ID
    static async fetchProduct(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/products/${id}`);
            if (!response.ok) throw new Error('Failed to fetch product');
            return await response.json();
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    }

    // Search products
    static async searchProducts(query) {
        try {
            const response = await fetch(`${this.BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Failed to search products');
            const data = await response.json();
            return data.products;
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }

    // Get products by category
    static async fetchProductsByCategory(category) {
        try {
            const response = await fetch(`${this.BASE_URL}/products/category/${category}`);
            if (!response.ok) throw new Error('Failed to fetch products by category');
            const data = await response.json();
            return data.products;
        } catch (error) {
            console.error('Error fetching products by category:', error);
            throw error;
        }
    }
}