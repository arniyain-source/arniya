// Mock Product Data
const products = [
    {
        id: 1,
        name: "Product A",
        price: 29.99,
        description: "Description of Product A",
    },
    {
        id: 2,
        name: "Product B",
        price: 39.99,
        description: "Description of Product B",
    },
    {
        id: 3,
        name: "Product C",
        price: 19.99,
        description: "Description of Product C",
    },
];

// Utility Function to Format Price
const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
};

// Utility Function to Retrieve a Product by ID
const getProductById = (id: number) => {
    return products.find(product => product.id === id);
};

// Exporting the mock data and utility functions
export { products, formatPrice, getProductById };