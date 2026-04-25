let currentProduct = null;
let currentRating = 0;
let currentReviewIndex = 0;
let reviewSliderTimer = null;
let selectedSize = "";
let selectedFinish = "";

function getProductFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return getProductById(params.get("id") || 1);
}

function calculateDiscount(price, oldPrice) {
    if (!oldPrice || oldPrice <= price) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function setText(selector, value) {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
}

function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach((node) => {
        node.textContent = value;
    });
}

function updateMainImage(url) {
    const mainImage = document.getElementById("main-product-img");
    if (!mainImage) return;
    mainImage.style.backgroundImage = `url('${url}?auto=format&fit=crop&w=900&q=80')`;
    mainImage.classList.add("flash-anim");
    setTimeout(() => mainImage.classList.remove("flash-anim"), 300);
}

function renderGallery(product) {
    const thumbnailColumn = document.querySelector(".thumbnail-column");
    const mainImage = document.getElementById("main-product-img");
    const galleryImages = product.images?.length ? product.images : [product.img];
    if (mainImage) {
        mainImage.style.backgroundImage = `url('${galleryImages[0]}?auto=format&fit=crop&w=900&q=80')`;
    }
    if (!thumbnailColumn) return;
    thumbnailColumn.innerHTML = galleryImages.map((image, index) => `<button type=\"button\" class=\"thumb \\${index === 0 ? "active" : ""}\" data-image=\"${image}\" aria-label=\"View product image \\${index + 1}\" style=\"background-image:url('${image}?w=120&q=80')\"></button>`).join("");
    thumbnailColumn.querySelectorAll(".thumb").forEach((thumb) => {
        thumb.addEventListener("click", () => {
            thumbnailColumn.querySelectorAll(".thumb").forEach((item) => item.classList.remove("active"));
            thumb.classList.add("active");
            updateMainImage(thumb.dataset.image);
        });
    });
}

function renderSizes(product) {
    const sizeContainer = document.querySelector(".size-options");
    if (!sizeContainer) return;
    selectedSize = product.sizes?.[0] || "";
    sizeContainer.innerHTML = (product.sizes || []).map((size, index) => `<button type=\"button\" class=\"s-pill \\${index === 0 ? "active" : ""}\" data-size=\"${size}\">${size}</button>`).join("");
    sizeContainer.querySelectorAll(".s-pill").forEach((pill) => {
        pill.addEventListener("click", () => {
            sizeContainer.querySelectorAll(".s-pill").forEach((item) => item.classList.remove("active"));
            pill.classList.add("active");
            selectedSize = pill.dataset.size;
            showToast(`Size updated to ${selectedSize}`);
        });
    });
}

function renderFinishes(product) {
    const colorContainer = document.querySelector(".colors");
    if (!colorContainer) return;
    selectedFinish = product.finishes?.[0]?.name || product.finishes?.[0] || "";
    colorContainer.innerHTML = (product.finishes || []).map((finish, index) => {
        const name = typeof finish === "string" ? finish : finish.name;
        const hex = typeof finish === "string" ? "#d4af37" : finish.hex;
        return `<button type=\"button\" class=\"v-color \\${index === 0 ? "active" : ""}\" data-finish=\"${name}\" style=\"background:${hex}\" title=\"${name}\" aria-label=\"${name}\"></button>`;
    }).join("");
    colorContainer.querySelectorAll(".v-color").forEach((button, index) => {
        button.addEventListener("click", () => {
            colorContainer.querySelectorAll(".v-color").forEach((item) => item.classList.remove("active"));
            button.classList.add("active");
            selectedFinish = button.dataset.finish;
            const nextImage = currentProduct.images?.[index] || currentProduct.images?.[0] || currentProduct.img;
            updateMainImage(nextImage);
            showToast(`Finish switched to ${selectedFinish}`);
        });
    });
}

function renderFeatures(product) {
    const grid = document.querySelector(".features-grid");
    if (!grid || !product.features?.length) return;
    grid.innerHTML = product.features.map((feature) => `<div class=\"feat\"><i class=\"${feature.icon}\"></i><span class=\"feat-text\">${feature.label}</span></div>`).join("");
}

function renderRelatedProducts(productId) {
    const relatedGrid = document.querySelector(".related-grid");
    if (!relatedGrid) return;
    const relatedProducts = getRelatedProducts(productId, 4);
    relatedGrid.innerHTML = relatedProducts.map((product, index) => `<a href=\"product.html?id=${product.id}\" class=\"related-card\"><div class=\"r-card-img bg-img\" style=\"background-image:url('${product.img}?w=500&q=80')\"><span class=\"r-badge\">${index === 0 ? "Premium" : index === 1 ? "Hot" : index === 2 ? "New" : "Curated"}</span></div><div class=\"r-card-info\"><h4 class=\"r-name\">${product.name}</h4><div class=\"r-row\"><span class=\"r-price\">${formatMoney(product.price)}</span><span class=\"r-rating\">${product.rating.toFixed(1)} <i class=\"fa-solid fa-star\"></i></span></div></div></a>`).join("");
}

function wireProductButtons() {
    const addButtons = [document.querySelector(".m-flow-btn.gold"), document.querySelector(".bb-action-btn.gold")].filter(Boolean);
    const buyButtons = [document.querySelector(".m-flow-btn.orange"), document.querySelector(".bb-action-btn.white"), document.querySelector(".m-cta-btn.m-cta-add")].filter(Boolean);
    addButtons.forEach((button) => {
        button.onclick = () => addCurrentProductToCart(false);
    });
    buyButtons.forEach((button) => {
        button.onclick = () => addCurrentProductToCart(true);
    });
}

function syncProductWishlistButtons() {
    document.querySelectorAll(".product-wishlist-btn").forEach((button) => {
        button.dataset.productId = String(currentProduct.id);
    });
    if (typeof syncWishlistButtons === "function") {
        syncWishlistButtons();
    }
}

function toggleProductWishlist(button) {
    if (!currentProduct || !button) return;
    button.dataset.productId = String(currentProduct.id);
    toggleWishlistButton(button);
    syncProductWishlistButtons();
}

function addCurrentProductToCart(openCart) {
    if (!currentProduct) return;
    addToCartGlobal({ id: currentProduct.id, qty: 1, size: selectedSize, finish: selectedFinish });
    if (openCart) {
        setTimeout(() => openRightDrawer("cart"), 200);
    }
}

function shareProduct() {
    if (!currentProduct) return;
    const shareUrl = window.location.href;
    const shareText = `${currentProduct.name} · ${formatMoney(currentProduct.price)} · ${shareUrl}`;
    if (navigator.share) {
        navigator.share({ title: currentProduct.name, text: shareText, url: shareUrl }).catch(() => {});
        return;
    }
    if (navigator.clipboard?.copyText) {
        navigator.clipboard.writeText(shareText)
            .then(() => showToast("Product link copied to clipboard"))
            .catch(() => showToast("Unable to copy right now"));
        return;
    }
    showToast("Sharing is not available on this browser");
}

function openReview() {
    document.getElementById("review-drawer")?.classList.add("active");
    document.getElementById("right-overlay")?.classList.add("active");
}

function closeReview() {
    document.getElementById("review-drawer")?.classList.remove("active");
    document.getElementById("right-overlay")?.classList.remove("active");
    setTimeout(() => {
        currentRating = 0;
        document.querySelectorAll(".star-rating-select i").forEach((star) => star.classList.remove("active"));
        const reviewText = document.getElementById("review-text");
        if (reviewText) reviewText.value = "";
        const ratingLabel = document.querySelector(".rating-label");
        if (ratingLabel) ratingLabel.innerText = "Share your satisfaction level";
        document.getElementById("review-input-step").style.display = "block";
        document.getElementById("review-success-step").style.display = "none";
        const button = document.querySelector(".submit-review-premium");
        if (button) {
            button.disabled = false;
            button.style.opacity = "1";
            button.innerHTML = "<span>Submit Review</span><i class=\"fa-solid fa-arrow-right\"></i>";
        }
    }, 200);
}

function setRating(value) {
    currentRating = value;
    const labels = ["", "Hated it", "Disliked it", "It was okay", "Liked it", "Loved it"];
    document.querySelectorAll(".star-rating-select i").forEach((star, index) => {
        star.classList.toggle("active", index < value);
    });
    const ratingLabel = document.querySelector(".rating-label");
    if (ratingLabel) ratingLabel.innerText = labels[value];
}

function getStoredReviews() {
    const allReviews = safeParse("arniyaReviews", {});
    return allReviews[currentProduct.id] || [];
}

function saveStoredReview(review) {
    const allReviews = safeParse("arniyaReviews", {});
    const existing = allReviews[currentProduct.id] || [];
    allReviews[currentProduct.id] = [review, ...existing].slice(0, 6);
    localStorage.setItem("arniyaReviews", JSON.stringify(allReviews));
}

function getReviewCards() {
    const baseReviews = currentProduct.testimonials || [];
    const userReviews = getStoredReviews();
    return [...userReviews, ...baseReviews];
}

function renderReviews() {
    const track = document.getElementById("reviewsTrack");
    if (!track) return;
    track.innerHTML = getReviewCards().map((review) => `<div class=\"review-card-premium\"><div class=\"rev-header\"><div class=\"rev-top-row\"><div class=\"stars-pill mini\">${review.rating} <i class=\"fa-solid fa-star\"></i></div><div class=\"verified-badge\"><i class=\"fa-solid fa-circle-check\"></i> VERIFIED</div></div><span class=\"rev-name\">${review.name}</span></div><p class=\"rev-text\">