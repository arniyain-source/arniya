// shop.js

// Initial state for the shop
let state = {
    products: [],
    filteredProducts: [],
    searchQuery: '',
    sortOption: 'price', // Options: 'price', 'name'
};

// Function to fetch products
async function fetchProducts() {
    try {
        const response = await fetch('https://api.example.com/products');
        state.products = await response.json();
        state.filteredProducts = state.products;
        renderProducts();
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Function to render products on the page
function renderProducts() {
    const productContainer = document.getElementById('product-list');
    productContainer.innerHTML = '';
    const productsToRender = state.filteredProducts.sort((a, b) => {
        if (state.sortOption === 'price') {
            return a.price - b.price;
        } else {
            return a.name.localeCompare(b.name);
        }
    });
    productsToRender.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-item';
        productElement.innerHTML = `<h3>${product.name}</h3><p>Price: $${product.price}</p>`;
        productContainer.appendChild(productElement);
    });
}

// Function to handle search input
function handleSearch(event) {
    state.searchQuery = event.target.value;
    applyFilters();
}

// Function to apply filtering based on search query
function applyFilters() {
    state.filteredProducts = state.products.filter(product =>
        product.name.toLowerCase().includes(state.searchQuery.toLowerCase())
    );
    renderProducts();
}

// Function to handle sorting option change
function handleSortChange(event) {
    state.sortOption = event.target.value;
    renderProducts();
}

// Add event listeners
document.getElementById('search-input').addEventListener('input', handleSearch);
document.getElementById('sort-select').addEventListener('change', handleSortChange);

// Initialize the shop
fetchProducts();