// ======================================
// Circuitry — store.js
// ======================================

const PRODUCTS = [
  {
    id: "EB-04",
    name: "Trace Buds Pro",
    category: "audio",
    price: 4999,
    salePrice: null,
    img: "images/earbuds.svg",
    desc: "ANC earbuds with a swappable driver module.",
  },
  {
    id: "SW-11",
    name: "Node Watch S1",
    category: "wearable",
    price: 8499,
    salePrice: 6999,
    img: "images/smartwatch.svg",
    desc: "7-day battery, AMOLED, open firmware.",
  },
  {
    id: "KB-77",
    name: "Solder Board 87",
    category: "input",
    price: 6299,
    salePrice: null,
    img: "images/keyboard.svg",
    desc: "Hot-swap mechanical keyboard, PCB-mount stabilizers.",
  },
  {
    id: "DR-02",
    name: "Quadframe Mini",
    category: "capture",
    price: 15999,
    salePrice: 13499,
    img: "images/drone.svg",
    desc: "Folding frame drone with 4K gimbal camera.",
  },
  {
    id: "PB-30",
    name: "Cell Brick 20K",
    category: "power",
    price: 2199,
    salePrice: null,
    img: "images/powerbank.svg",
    desc: "20,000mAh, 65W PD pass-through fast charging.",
  },
  {
    id: "VR-09",
    name: "Field Lens VR",
    category: "capture",
    price: 24999,
    salePrice: null,
    img: "images/vrheadset.svg",
    desc: "Standalone headset, 120Hz panel, hand tracking.",
  },
  {
    id: "SP-05",
    name: "Resonant Puck",
    category: "audio",
    price: 3499,
    salePrice: 2799,
    img: "images/speaker.svg",
    desc: "Dual-driver smart speaker with open API.",
  },
  {
    id: "CM-14",
    name: "Bench Cam X",
    category: "capture",
    price: 5799,
    salePrice: null,
    img: "images/camera.svg",
    desc: "Rugged action camera, waterproof to 30m.",
  },
];

const SHIPPING_FLAT = 199;

// ---------- Cart state (persisted) ----------
let cart = JSON.parse(localStorage.getItem("circuitry_cart") || "{}");

function saveCart() {
  localStorage.setItem("circuitry_cart", JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

function formatPrice(n) {
  return "₹" + n.toLocaleString("en-IN");
}

// ---------- Render product grid ----------
const grid = document.getElementById("productGrid");

function renderGrid(filter = "all") {
  grid.innerHTML = "";
  const items = filter === "all" ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  items.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <span class="pin pin-tl"></span>
      <span class="pin pin-tr"></span>
      <span class="pin pin-bl"></span>
      <span class="pin pin-br"></span>
      ${p.salePrice ? `<span class="card-badge">SALE</span>` : ""}
      <div class="card-media"><img src="${p.img}" alt="${p.name}"></div>
      <h3>${p.name}</h3>
      <span class="sku mono">SKU · ${p.id}</span>
      <p class="desc">${p.desc}</p>
      <div class="card-foot">
        <span class="price">
          ${p.salePrice ? `<span class="strike">${formatPrice(p.price)}</span>${formatPrice(p.salePrice)}` : formatPrice(p.price)}
        </span>
        <button class="add-btn" data-id="${p.id}">+ Add</button>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.id);
      btn.textContent = "Added ✓";
      btn.classList.add("added");
      setTimeout(() => {
        btn.textContent = "+ Add";
        btn.classList.remove("added");
      }, 900);
    });
  });
}

// ---------- Filters ----------
document.getElementById("filters").addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");
  renderGrid(btn.dataset.filter);
});

// ---------- Cart logic ----------
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
}

function removeFromCart(id) {
  delete cart[id];
  saveCart();
}

function cartEntries() {
  return Object.entries(cart)
    .map(([id, qty]) => ({ product: PRODUCTS.find(p => p.id === id), qty }))
    .filter(e => e.product);
}

function cartSubtotal() {
  return cartEntries().reduce((sum, e) => {
    const unit = e.product.salePrice || e.product.price;
    return sum + unit * e.qty;
  }, 0);
}

function updateCartCount() {
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  document.getElementById("cartCount").textContent = count;
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const entries = cartEntries();

  if (entries.length === 0) {
    container.innerHTML = `<p class="empty-cart">Your cart is empty.<br>Go find something worth soldering in.</p>`;
  } else {
    container.innerHTML = entries.map(e => {
      const unit = e.product.salePrice || e.product.price;
      return `
        <div class="cart-item">
          <img src="${e.product.img}" alt="${e.product.name}">
          <div class="cart-item-info">
            <h4>${e.product.name}</h4>
            <span class="mono">${formatPrice(unit)} × ${e.qty}</span>
            <div class="qty-controls">
              <button data-action="dec" data-id="${e.product.id}">−</button>
              <span>${e.qty}</span>
              <button data-action="inc" data-id="${e.product.id}">+</button>
              <button class="remove-btn" data-action="remove" data-id="${e.product.id}">Remove</button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  const subtotal = cartSubtotal();
  const shipping = entries.length ? SHIPPING_FLAT : 0;
  document.getElementById("cartSubtotal").textContent = formatPrice(subtotal);
  document.getElementById("cartShipping").textContent = formatPrice(shipping);
  document.getElementById("cartTotal").textContent = formatPrice(subtotal + shipping);

  container.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if (action === "inc") changeQty(id, 1);
      if (action === "dec") changeQty(id, -1);
      if (action === "remove") removeFromCart(id);
    });
  });
}

// ---------- Drawer open/close ----------
const cartDrawer = document.getElementById("cartDrawer");
const drawerOverlay = document.getElementById("drawerOverlay");

function openDrawer() {
  cartDrawer.classList.add("open");
  drawerOverlay.classList.add("open");
}
function closeDrawer() {
  cartDrawer.classList.remove("open");
  drawerOverlay.classList.remove("open");
}

document.getElementById("cartBtn").addEventListener("click", openDrawer);
document.getElementById("closeCart").addEventListener("click", closeDrawer);
drawerOverlay.addEventListener("click", closeDrawer);

// ---------- Checkout ----------
const modalOverlay = document.getElementById("modalOverlay");

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (cartEntries().length === 0) {
    alert("Your cart is empty — add something first.");
    return;
  }
  const orderId = "CTY-" + Math.floor(100000 + Math.random() * 900000);
  document.getElementById("modalOrderId").textContent = "Order ref: " + orderId;
  cart = {};
  saveCart();
  closeDrawer();
  modalOverlay.classList.add("open");
});

document.getElementById("modalClose").addEventListener("click", () => {
  modalOverlay.classList.remove("open");
});

// ---------- Init ----------
renderGrid();
renderCart();
updateCartCount();
