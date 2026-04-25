// ARNiya Smart Hub Shared Storefront Logic

// Example JavaScript code for shared storefront functionality

class SharedStorefront {
    constructor(storeName) {
        this.storeName = storeName;
    }

    displayStoreInfo() {
        console.log(`Welcome to ${this.storeName}!`);
    }

    calculateDiscount(price, discountPercentage) {
        return price - (price * (discountPercentage / 100));
    }

    addToCart(item) {
        console.log(`${item} has been added to the cart.`);
    }
}

// Example usage
const myStore = new SharedStorefront('ARNiya Store');
myStore.displayStoreInfo();