const products = window.GIV_PRODUCTS || [];
const params = new URLSearchParams(window.location.search);
const productId = params.get("product") || "classic-sneakers";
const product = products.find(item => item.id === productId) || products[0];

const formatPrice = value => `₱${Number(value).toLocaleString()}`;
const byId = id => document.getElementById(id);

if (product) {
    document.title = `GIVSTORE - ${product.name}`;

    const image = byId("detailProductImage");
    const category = byId("detailCategory");
    const name = byId("detailName");
    const rating = byId("detailRating");
    const price = byId("detailPrice");
    const description = byId("detailDescription");
    const sizeOptions = byId("sizeOptions");

    if (image) {
        image.src = product.image;
        image.alt = product.name;
    }
    if (category) category.textContent = product.category;
    if (name) name.textContent = product.name;
    if (rating) rating.innerHTML = `★★★★★ <span>${product.rating}</span>`;
    if (price) price.textContent = formatPrice(product.price);
    if (description) description.textContent = product.description;

    if (sizeOptions) {
        sizeOptions.innerHTML = product.sizes.map((size, index) =>
            `<button type="button" class="size-option${index === 0 ? " active" : ""}">${size}</button>`
        ).join("");

        sizeOptions.querySelectorAll(".size-option").forEach(option => {
            option.addEventListener("click", () => {
                sizeOptions.querySelectorAll(".size-option").forEach(item => item.classList.remove("active"));
                option.classList.add("active");
            });
        });
    }

    const relatedGrid = byId("relatedProducts");
    if (relatedGrid) {
        relatedGrid.innerHTML = products
            .filter(item => item.id !== product.id)
            .slice(0, 4)
            .map(item => `
                <article class="product-card">
                    <a href="product-details.html?product=${item.id}" class="product-image">
                        <img src="${item.image}" alt="${item.name}" loading="lazy">
                    </a>
                    <div class="product-info">
                        <span class="category">${item.category}</span>
                        <h3>${item.name}</h3>
                        <p>${formatPrice(item.price)}</p>
                        <a href="product-details.html?product=${item.id}" class="btn-small">View Details</a>
                    </div>
                </article>
            `).join("");
    }

    const quantityInput = byId("quantity");
    const plus = byId("plus");
    const minus = byId("minus");

    plus?.addEventListener("click", () => {
        quantityInput.value = Math.max(1, Number(quantityInput.value) || 1) + 1;
    });

    minus?.addEventListener("click", () => {
        quantityInput.value = Math.max(1, Number(quantityInput.value) || 1) - 1;
    });

    quantityInput?.addEventListener("change", () => {
        quantityInput.value = Math.max(1, Math.floor(Number(quantityInput.value) || 1));
    });

    const addButton = byId("addProduct");
    const buyButton = byId("buyNow");

    const addCurrentProduct = () => {
        const quantity = Math.max(1, Number(quantityInput?.value) || 1);
        const cart = JSON.parse(localStorage.getItem("givstoreCart") || "[]");
        const existing = cart.find(item => item.name === product.name);

        if (existing) {
            existing.quantity += quantity;
            existing.image = product.image;
        } else {
            cart.push({ name: product.name, price: product.price, quantity, image: product.image });
        }

        localStorage.setItem("givstoreCart", JSON.stringify(cart));
        document.querySelectorAll(".cart-count").forEach(badge => {
            badge.textContent = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
        });
    };

    addButton?.addEventListener("click", () => {
        addCurrentProduct();
        const oldText = addButton.textContent;
        addButton.textContent = "Added to Cart";
        setTimeout(() => addButton.textContent = oldText, 1200);
    });

    buyButton?.addEventListener("click", () => {
        addCurrentProduct();
        window.location.href = "cart.html";
    });
}
