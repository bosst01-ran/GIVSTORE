function getCart() {
    try {
        return JSON.parse(localStorage.getItem("givstoreCart")) || [];
    } catch {
        return [];
    }
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);

    document.querySelectorAll(".cart-count").forEach(badge => {
        badge.textContent = totalItems;
    });
}

function getPrice(text) {
    return Number(String(text).replace(/[₱,\s]/g, "")) || 0;
}

function addProductToCart(name, price, image = "") {
    const cart = getCart();
    const existing = cart.find(item => item.name === name);

    if (existing) {
        existing.quantity += 1;
        if (!existing.image && image) existing.image = image;
    } else {
        cart.push({ name, price, quantity: 1, image });
    }

    localStorage.setItem("givstoreCart", JSON.stringify(cart));
    updateCartCount();
}

function filterProducts() {
    const searchInput = document.getElementById("productSearch") || document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const productCards = document.querySelectorAll(".product-card");
    const search = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const category = categoryFilter ? categoryFilter.value : "all";

    productCards.forEach(card => {
        const name = card.querySelector("h3")?.textContent.toLowerCase() || "";
        const cardCategory = card.dataset.category || card.querySelector(".category")?.textContent.trim() || "";
        const matchesSearch = !search || name.includes(search) || cardCategory.toLowerCase().includes(search);
        const matchesCategory = category === "all" || cardCategory === category;

        card.hidden = !(matchesSearch && matchesCategory);
    });
}

document.querySelectorAll("#productSearch, #searchInput").forEach(input => {
    input.addEventListener("input", filterProducts);
});

const categoryFilter = document.getElementById("categoryFilter");
if (categoryFilter) categoryFilter.addEventListener("change", filterProducts);

document.querySelectorAll(".add-cart").forEach(button => {
    button.addEventListener("click", () => {
        const card = button.closest(".product-card");
        if (!card) return;

        const name = card.querySelector("h3")?.textContent.trim() || "Product";
        const price = getPrice(card.querySelector(".product-info p")?.textContent);
        const image = card.querySelector(".product-image img")?.getAttribute("src") || "";

        addProductToCart(name, price, image);

        const originalText = button.dataset.originalText || button.textContent;
        button.dataset.originalText = originalText;
        button.textContent = "Added to Cart";

        setTimeout(() => {
            button.textContent = originalText;
        }, 1200);
    });
});

const contactForm = document.getElementById("contactForm");
if (contactForm) {
    contactForm.addEventListener("submit", event => {
        event.preventDefault();
        alert("Your message has been sent successfully.");
        contactForm.reset();
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
            mobileMenuToggle.setAttribute("aria-label", "Open menu");
        });
    });
}

updateCartCount();
