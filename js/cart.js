function readCart() {
    try {
        return JSON.parse(localStorage.getItem("givstoreCart")) || [];
    } catch {
        return [];
    }
}

let cart = readCart();

function saveCart() {
    localStorage.setItem("givstoreCart", JSON.stringify(cart));
}

function formatPrice(price) {
    return `₱${Number(price || 0).toLocaleString()}`;
}

function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
    document.querySelectorAll(".cart-count").forEach(badge => {
        badge.textContent = totalItems;
    });
}

function addToCart(name, price, quantity = 1, image = "") {
    quantity = Math.max(1, Number(quantity) || 1);
    const existing = cart.find(item => item.name === name);

    if (existing) {
        existing.quantity += quantity;
        if (!existing.image && image) existing.image = image;
    } else {
        cart.push({ name, price: Number(price), quantity, image });
    }

    saveCart();
    updateCartCount();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
    updateCartCount();
}

function updateQuantity(index, quantity) {
    quantity = Number(quantity);
    if (quantity < 1 || !Number.isFinite(quantity)) {
        removeFromCart(index);
        return;
    }

    cart[index].quantity = Math.floor(quantity);
    saveCart();
    renderCart();
    updateCartCount();
}

window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;

function renderCart() {
    const cartItems = document.getElementById("cartItems");
    const subtotalElement = document.getElementById("subtotal");
    const totalElement = document.getElementById("total");
    const checkoutButton = document.querySelector(".checkout-btn");

    if (!cartItems) return;

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <h2>Your cart is empty</h2>
                <p>Add some products to your cart to continue.</p>
                <a href="products.html" class="btn">Browse Products</a>
            </div>
        `;
        if (subtotalElement) subtotalElement.textContent = "₱0";
        if (totalElement) totalElement.textContent = "₱0";
        if (checkoutButton) {
            checkoutButton.setAttribute("aria-disabled", "true");
            checkoutButton.classList.add("disabled");
            checkoutButton.href = "products.html";
        }
        return;
    }

    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = Number(item.price) * Number(item.quantity);
        subtotal += itemTotal;

        cartItems.insertAdjacentHTML("beforeend", `
            <div class="cart-item">
                <div class="cart-item-image">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}">` : "Product Image"}
                </div>
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>${formatPrice(item.price)}</p>
                </div>
                <div class="cart-quantity" aria-label="Quantity for ${item.name}">
                    <button type="button" onclick="updateQuantity(${index}, ${item.quantity - 1})" aria-label="Decrease quantity">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" onclick="updateQuantity(${index}, ${item.quantity + 1})" aria-label="Increase quantity">+</button>
                </div>
                <strong>${formatPrice(itemTotal)}</strong>
                <button type="button" class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
            </div>
        `);
    });

    const shipping = 100;
    const total = subtotal + shipping;

    if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
    if (totalElement) totalElement.textContent = formatPrice(total);

    if (checkoutButton) {
        checkoutButton.removeAttribute("aria-disabled");
        checkoutButton.classList.remove("disabled");
        checkoutButton.href = "checkout.html";
    }
}

function renderCheckout() {
    const checkoutItems = document.getElementById("checkoutItems");
    const subtotalElement = document.getElementById("checkoutSubtotal");
    const totalElement = document.getElementById("checkoutTotal");
    const checkoutForm = document.getElementById("checkoutForm");

    if (!checkoutItems) return;

    if (cart.length === 0) {
        checkoutItems.innerHTML = `
            <div class="empty-checkout">
                <p>Your cart is empty.</p>
                <a href="products.html" class="btn btn-small">Browse Products</a>
            </div>
        `;
        if (subtotalElement) subtotalElement.textContent = "₱0";
        if (totalElement) totalElement.textContent = "₱0";
        if (checkoutForm) {
            const submit = checkoutForm.querySelector('[type="submit"]');
            if (submit) submit.disabled = true;
        }
        return;
    }

    let subtotal = 0;
    checkoutItems.innerHTML = "";

    cart.forEach(item => {
        const itemTotal = Number(item.price) * Number(item.quantity);
        subtotal += itemTotal;

        checkoutItems.insertAdjacentHTML("beforeend", `
            <div class="checkout-item">
                <span>${item.name} × ${item.quantity}</span>
                <strong>${formatPrice(itemTotal)}</strong>
            </div>
        `);
    });

    if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
    if (totalElement) totalElement.textContent = formatPrice(subtotal + 100);
}

const addProduct = document.getElementById("addProduct");

if (addProduct) {
    addProduct.addEventListener("click", () => {
        const quantityInput = document.getElementById("quantity");
        const quantity = Math.max(1, Number(quantityInput?.value) || 1);
        const image = document.querySelector(".detail-image img")?.getAttribute("src") || "";

        addToCart("Classic Sneakers", 2499, quantity, image);

        const originalText = addProduct.dataset.originalText || addProduct.textContent;
        addProduct.dataset.originalText = originalText;
        addProduct.textContent = "Added to Cart";

        setTimeout(() => {
            addProduct.textContent = originalText;
        }, 1200);
    });
}

const plus = document.getElementById("plus");
const minus = document.getElementById("minus");
const quantityInput = document.getElementById("quantity");

if (plus && quantityInput) {
    plus.addEventListener("click", () => {
        quantityInput.value = Math.max(1, Number(quantityInput.value) || 1) + 1;
    });
}

if (minus && quantityInput) {
    minus.addEventListener("click", () => {
        quantityInput.value = Math.max(1, Number(quantityInput.value) || 1) - 1;
    });
}

if (quantityInput) {
    quantityInput.addEventListener("change", () => {
        quantityInput.value = Math.max(1, Math.floor(Number(quantityInput.value) || 1));
    });
}

const buyNow = document.querySelector(".btn-outline");
if (buyNow && buyNow.getAttribute("href") === "cart.html") {
    buyNow.addEventListener("click", event => {
        event.preventDefault();
        const quantity = Math.max(1, Number(quantityInput?.value) || 1);
        const image = document.querySelector(".detail-image img")?.getAttribute("src") || "";
        addToCart("Classic Sneakers", 2499, quantity, image);
        window.location.href = "cart.html";
    });
}

const checkoutForm = document.getElementById("checkoutForm");

if (checkoutForm) {
    checkoutForm.addEventListener("submit", event => {
        event.preventDefault();

        if (cart.length === 0) {
            alert("Your cart is empty.");
            window.location.href = "products.html";
            return;
        }

        const orderNumber = "GIV-" + Math.floor(100000 + Math.random() * 900000);
        localStorage.setItem("givstoreOrder", orderNumber);
        localStorage.removeItem("givstoreCart");
        cart = [];

        window.location.href = "confirmation.html";
    });
}

const orderNumber = document.getElementById("orderNumber");
if (orderNumber) {
    orderNumber.textContent = localStorage.getItem("givstoreOrder") || "GIV-000000";
}

document.querySelectorAll(".size-option").forEach(option => {
    option.addEventListener("click", () => {
        document.querySelectorAll(".size-option").forEach(o => o.classList.remove("active"));
        option.classList.add("active");
    });
});

const wishlistBtn = document.getElementById("wishlistBtn");
if (wishlistBtn) {
    wishlistBtn.addEventListener("click", () => {
        wishlistBtn.classList.toggle("active");
        wishlistBtn.setAttribute("aria-pressed", String(wishlistBtn.classList.contains("active")));
    });
}

const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
const mobileNav = document.querySelector(".nav-links");

if (mobileMenuToggle && mobileNav) {
    mobileMenuToggle.addEventListener("click", () => {
        const open = mobileNav.classList.toggle("open");
        mobileMenuToggle.classList.toggle("active", open);
        mobileMenuToggle.setAttribute("aria-expanded", String(open));
        mobileMenuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    mobileNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            mobileNav.classList.remove("open");
            mobileMenuToggle.classList.remove("active");
            mobileMenuToggle.setAttribute("aria-expanded", "false");
        });
    });
}

updateCartCount();
renderCart();
renderCheckout();
