/* ==========================================================================
   7KY STREETWEAR - INTERACTIVE STORE LOGIC
   ========================================================================== */
// 1. Catálogo de Gorros (Base de datos local)
const products = [
  {
    id: "cap-trucker-black",
    title: "Trucker Cap Negra",
    price: 18000,
    category: "trucker",
    image: "./assets/cap_trucker_black.png",
    inStock: true,
    badge: "Hot Drop",
    description: "Gorra trucker clásica con frente de espuma acolchada negra y parte trasera de malla de poliéster blanca. Bordado frontal de alta definición en color blanco con el logo '7KY'. Cierre snapback ajustable trasero. Estilo urbano crudo y atemporal.",
    variants: ["OSFA / Blanco y Negro"]
  },
  {
    id: "cap-dad-beige",
    title: "Classic Dad Hat Beige",
    price: 16500,
    category: "dadhat",
    image: "./assets/cap_dad_beige.png",
    inStock: true,
    badge: "Premium Wash",
    description: "Gorra de béisbol de perfil bajo fabricada en gabardina de algodón lavado de alta densidad, lo que le da un aspecto vintage sutil. Logotipo minimalista de 7ky bordado con precisión en el panel frontal. Visera curva y hebilla de metal ajustable trasera en tono bronce.",
    variants: ["OSFA / Beige Vintage"]
  },
  {
    id: "cap-beanie-grey",
    title: "Ribbed Beanie Gris",
    price: 14000,
    category: "beanie",
    image: "./assets/cap_beanie_grey.png",
    inStock: true,
    badge: "Winter Ready",
    description: "Gorro de lana acrílica premium con tejido de punto acanalado grueso para máxima protección contra el frío. Etiqueta tejida rectangular 7KY cosida con precisión en el dobladillo frontal. Flexibilidad óptima para un ajuste cómodo y duradero.",
    variants: ["OSFA / Gris Melange"]
  },
  {
    id: "cap-distressed-black",
    title: "Distressed Cap Negra",
    price: 19000,
    category: "dadhat",
    image: "./assets/cap_distressed_black.png",
    inStock: false,
    badge: "Agotado",
    description: "Gorra de algodón lavado pesado de color negro carbón con detalles desgastados y deshilachados sutiles en la visera y los paneles frontales. Look crudo, industrial e informal que combina perfecto con siluetas oversized y fits de calle.",
    variants: ["OSFA / Negro Gastado"]
  }
];
// 2. Estado Global de la Tienda
let cart = [];
const WHATSAPP_PHONE = "5493825000000"; // Reemplazar con el número del vendedor (código de país + área + celular)
// 3. Inicialización del DOM y Variables de Elementos
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});
function initApp() {
  // Cargar carrito del localStorage si existe
  const savedCart = localStorage.getItem("7ky-cart");
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
      updateCartUI();
    } catch (e) {
      console.error("Error cargando carrito", e);
      cart = [];
    }
  }
  // Renderizar catálogo
  renderProducts("all");
  // Configurar event listeners
  setupEventListeners();
}
// 4. Configuración de Event Listeners
function setupEventListeners() {
  // Filtros del catálogo
  const filterGroup = document.getElementById("catalog-filter-group");
  if (filterGroup) {
    filterGroup.addEventListener("click", (e) => {
      if (e.target.classList.contains("filter-btn")) {
        // Quitar active de los otros botones
        filterGroup.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
        e.target.classList.add("active");
        
        // Renderizar filtrados
        const filterValue = e.target.getAttribute("data-filter");
        renderProducts(filterValue);
      }
    });
  }
  // Panel lateral de Carrito (Drawer)
  const cartToggle = document.getElementById("cart-toggle-btn");
  const cartClose = document.getElementById("cart-close-btn");
  const cartOverlay = document.getElementById("cart-overlay");
  
  if (cartToggle) cartToggle.addEventListener("click", openCart);
  if (cartClose) cartClose.addEventListener("click", closeCart);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);
  // Botón checkout
  const checkoutBtn = document.getElementById("cart-checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", sendWhatsAppOrder);
  }
  // Botones de grid de productos (Añadir rápido / Vista rápida)
  const productsGrid = document.getElementById("products-grid-container");
  if (productsGrid) {
    productsGrid.addEventListener("click", (e) => {
      const target = e.target;
      if (target.classList.contains("quick-add-btn")) {
        const id = target.getAttribute("data-id");
        quickAddToCart(id);
      } else if (target.classList.contains("quick-view-btn")) {
        const id = target.getAttribute("data-id");
        openQuickView(id);
      }
    });
  }
  // Vista Rápida Modal (Cerrar)
  const modalClose = document.getElementById("modal-close-btn");
  const modalOverlay = document.getElementById("quick-view-overlay");
  if (modalClose) modalClose.addEventListener("click", closeQuickView);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        closeQuickView();
      }
    });
  }
  // Carrito cantidad y remover (Event delegation)
  const cartContainer = document.getElementById("cart-items-container");
  if (cartContainer) {
    cartContainer.addEventListener("click", (e) => {
      const target = e.target;
      const index = parseInt(target.getAttribute("data-index"));
      
      if (target.classList.contains("qty-minus")) {
        changeCartQty(index, -1);
      } else if (target.classList.contains("qty-plus")) {
        changeCartQty(index, 1);
      } else if (target.classList.contains("cart-item-remove-btn")) {
        removeCartItem(index);
      }
    });
  }
  // Suscripción a alertas de drops (Sección Coming Soon)
  const notifyBtn = document.getElementById("notify-submit-btn");
  if (notifyBtn) {
    notifyBtn.addEventListener("click", () => {
      handleAlertSignup("notify-email-input", "notify-feedback");
    });
  }
  // Suscripción footer
  const footerNotifyBtn = document.getElementById("footer-newsletter-btn");
  if (footerNotifyBtn) {
    footerNotifyBtn.addEventListener("click", () => {
      handleAlertSignup("footer-newsletter-input", "footer-newsletter-feedback");
    });
  }
}
// ==========================================================================
// 5. Funciones del Catálogo
// ==========================================================================
function renderProducts(filter = "all") {
  const container = document.getElementById("products-grid-container");
  if (!container) return;
  container.innerHTML = "";
  const filteredProducts = products.filter(p => filter === "all" || p.category === filter);
  if (filteredProducts.length === 0) {
    container.innerHTML = `<p class="no-products-msg">No hay productos en esta categoría.</p>`;
    return;
  }
  filteredProducts.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card animate-fade-in";
    card.setAttribute("data-category", product.category);
    const badgeHTML = product.badge 
      ? `<span class="product-card-badge ${!product.inStock ? 'sold-out' : ''}">${product.badge}</span>` 
      : "";
    const overlayActionsHTML = product.inStock 
      ? `<button class="product-card-btn quick-add-btn" data-id="${product.id}">AÑADIR AL CARRITO</button>
         <button class="product-card-btn product-card-btn-secondary quick-view-btn" data-id="${product.id}">VISTA RÁPIDA</button>`
      : `<button class="product-card-btn product-card-btn-secondary quick-view-btn" data-id="${product.id}" style="width: 80%;">DETALLES</button>`;
    card.innerHTML = `
      <div class="product-card-img-wrapper">
        ${badgeHTML}
        <img src="${product.image}" alt="${product.title}" class="product-card-img" loading="lazy">
        <div class="product-card-overlay">
          ${overlayActionsHTML}
        </div>
      </div>
      <div class="product-card-info">
        <h3 class="product-card-title">${product.title}</h3>
        <div class="product-card-meta">
          <span class="product-card-price">$${product.price.toLocaleString("es-AR")}</span>
          ${product.inStock 
            ? `<span class="badge-stock">En Stock</span>` 
            : `<span class="badge-soldout">Agotado</span>`
          }
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}
// ==========================================================================
// 6. Funciones del Carrito (Drawer)
// ==========================================================================
function openCart() {
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("cart-overlay");
  
  if (drawer) {
    drawer.classList.add("active");
    drawer.setAttribute("aria-hidden", "false");
  }
  if (overlay) overlay.classList.add("active");
  document.body.style.overflow = "hidden"; // Desactivar scroll fondo
}
function closeCart() {
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("cart-overlay");
  
  if (drawer) {
    drawer.classList.remove("active");
    drawer.setAttribute("aria-hidden", "true");
  }
  if (overlay) overlay.classList.remove("active");
  document.body.style.overflow = ""; // Reactivar scroll fondo
}
function quickAddToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product || !product.inStock) return;
  const defaultVariant = product.variants[0] || "OSFA";
  addToCart(productId, defaultVariant, 1);
}
function addToCart(productId, variant, quantity) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  // Comprobar si ya existe con la misma variante
  const existingItemIndex = cart.findIndex(item => item.id === productId && item.variant === variant);
  if (existingItemIndex > -1) {
    cart[existingItemIndex].qty += quantity;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      variant: variant,
      qty: quantity
    });
  }
  // Guardar y actualizar
  saveCart();
  updateCartUI();
  
  // Efecto visual: abrir carrito
  openCart();
}
function changeCartQty(index, change) {
  if (index < 0 || index >= cart.length) return;
  cart[index].qty += change;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
  updateCartUI();
}
function removeCartItem(index) {
  if (index < 0 || index >= cart.length) return;
  
  cart.splice(index, 1);
  
  saveCart();
  updateCartUI();
}
function saveCart() {
  localStorage.setItem("7ky-cart", JSON.stringify(cart));
}
function updateCartUI() {
  const cartCountBadge = document.getElementById("cart-count");
  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartEmptyMsg = document.getElementById("cart-empty-msg");
  const cartFooter = document.getElementById("cart-footer");
  const cartTotalValue = document.getElementById("cart-total-value");
  // Calcular cantidad total de artículos
  const totalItemsQty = cart.reduce((total, item) => total + item.qty, 0);
  if (cartCountBadge) {
    cartCountBadge.textContent = totalItemsQty;
    // Animación del badge al cambiar
    cartCountBadge.style.transform = "scale(1.2)";
    setTimeout(() => {
      cartCountBadge.style.transform = "scale(1)";
    }, 150);
  }
  if (cart.length === 0) {
    // Carrito vacío
    if (cartEmptyMsg) cartEmptyMsg.style.display = "flex";
    if (cartFooter) cartFooter.classList.remove("active");
    // Limpiar contenido dinámico (manteniendo el empty message)
    if (cartItemsContainer) {
      const items = cartItemsContainer.querySelectorAll(".cart-item");
      items.forEach(item => item.remove());
    }
    return;
  }
  // Carrito con artículos
  if (cartEmptyMsg) cartEmptyMsg.style.display = "none";
  if (cartFooter) cartFooter.classList.add("active");
  // Renderizar los elementos en el drawer
  if (cartItemsContainer) {
    // Eliminar ítems anteriores
    const items = cartItemsContainer.querySelectorAll(".cart-item");
    items.forEach(item => item.remove());
    // Inyectar nuevos ítems
    cart.forEach((item, index) => {
      const itemEl = document.createElement("div");
      itemEl.className = "cart-item animate-fade-in";
      itemEl.innerHTML = `
        <div class="cart-item-img-wrapper">
          <img src="${item.image}" alt="${item.title}" class="cart-item-img">
        </div>
        <div class="cart-item-info">
          <h4 class="cart-item-title">${item.title}</h4>
          <span class="cart-item-variant">${item.variant}</span>
          <span class="cart-item-price">$${(item.price * item.qty).toLocaleString("es-AR")}</span>
          <div class="cart-item-actions">
            <div class="qty-selector">
              <button class="qty-btn qty-minus" data-index="${index}">-</button>
              <input type="text" value="${item.qty}" class="qty-input" readonly>
              <button class="qty-btn qty-plus" data-index="${index}">+</button>
            </div>
            <button class="cart-item-remove-btn" data-index="${index}">Quitar</button>
          </div>
        </div>
      `;
      cartItemsContainer.insertBefore(itemEl, cartEmptyMsg);
    });
  }
  // Calcular precio total
  const subtotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
  if (cartTotalValue) {
    cartTotalValue.textContent = `$${subtotal.toLocaleString("es-AR")}`;
  }
}
// ==========================================================================
// 7. WhatsApp Checkout Integration
// ==========================================================================
function sendWhatsAppOrder() {
  if (cart.length === 0) return;
  const subtotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
  
  // Construir mensaje estructurado
  let message = `🔥 *NUEVO PEDIDO - 7KY* 🔥\n\n`;
  message += `Hola, me interesa encargar los siguientes productos de la colección inicial:\n\n`;
  cart.forEach(item => {
    message += `• *${item.title}*\n`;
    message += `  Talle/Variante: _${item.variant}_\n`;
    message += `  Cantidad: ${item.qty} x $${item.price.toLocaleString("es-AR")}\n`;
    message += `  Subtotal: *$${(item.price * item.qty).toLocaleString("es-AR")}*\n\n`;
  });
  message += `💰 *TOTAL A PAGAR: $${subtotal.toLocaleString("es-AR")}*\n\n`;
  message += `📍 _Por favor, indícame los pasos para el pago y coordinar el envío._`;
  // Codificar URI para el enlace
  const encodedText = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedText}`;
  // Redirigir a WhatsApp
  window.open(whatsappUrl, "_blank");
}
// ==========================================================================
// 8. Quick View Modal
// ==========================================================================
function openQuickView(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const overlay = document.getElementById("quick-view-overlay");
  const modalContent = document.getElementById("modal-content-container");
  if (!overlay || !modalContent) return;
  // Configurar contenido dinámico del modal
  const buyBtnHTML = product.inStock 
    ? `<button class="btn btn-primary modal-add-to-cart-btn" id="modal-add-to-cart" data-id="${product.id}">AÑADIR AL CARRITO</button>`
    : `<button class="btn btn-secondary modal-add-to-cart-btn" disabled style="opacity: 0.5;">AGOTADO</button>`;
  const variantsHTML = product.variants.map((v, i) => `
    <button class="variant-btn ${i === 0 ? 'active' : ''}" data-variant="${v}">${v}</button>
  `).join("");
  modalContent.innerHTML = `
    <div class="modal-gallery-box">
      <img src="${product.image}" alt="${product.title}" class="modal-product-img">
    </div>
    <div class="modal-details-box">
      <div class="badge-container">
        ${product.inStock 
          ? `<span class="badge-stock">En Stock</span>` 
          : `<span class="badge-soldout">Agotado</span>`
        }
      </div>
      <h3 class="modal-product-title">${product.title}</h3>
      <span class="modal-product-price">$${product.price.toLocaleString("es-AR")}</span>
      <p class="modal-product-desc">${product.description}</p>
      
      <div class="modal-product-options">
        <h4 class="modal-option-title">Variante</h4>
        <div class="variant-picker-buttons" id="modal-variants-picker">
          ${variantsHTML}
        </div>
      </div>
      
      <div class="modal-action-box">
        ${buyBtnHTML}
      </div>
    </div>
  `;
  // Añadir eventos a los botones del modal dinámico
  const modalVariants = document.getElementById("modal-variants-picker");
  let selectedVariant = product.variants[0] || "OSFA";
  if (modalVariants) {
    modalVariants.addEventListener("click", (e) => {
      if (e.target.classList.contains("variant-btn")) {
        modalVariants.querySelectorAll(".variant-btn").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        selectedVariant = e.target.getAttribute("data-variant");
      }
    });
  }
  const addToCartBtn = modalContent.querySelector(".modal-add-to-cart-btn");
  if (addToCartBtn && product.inStock) {
    addToCartBtn.addEventListener("click", () => {
      addToCart(product.id, selectedVariant, 1);
      closeQuickView();
    });
  }
  // Activar modal
  overlay.classList.add("active");
  document.body.style.overflow = "hidden"; // Desactivar scroll fondo
}
function closeQuickView() {
  const overlay = document.getElementById("quick-view-overlay");
  if (overlay) overlay.classList.remove("active");
  
  // Reactivar scroll si el carrito no está abierto
  const drawer = document.getElementById("cart-drawer");
  if (drawer && !drawer.classList.contains("active")) {
    document.body.style.overflow = "";
  }
}
// ==========================================================================
// 9. Fake Email Registration Alert
// ==========================================================================
function handleAlertSignup(inputId, feedbackId) {
  const emailInput = document.getElementById(inputId);
  const feedbackEl = document.getElementById(feedbackId);
  if (!emailInput || !feedbackEl) return;
  const email = emailInput.value.trim();
  // Validar email simple
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    feedbackEl.textContent = "Por favor, ingresa un email válido.";
    feedbackEl.className = "notify-feedback error";
    return;
  }
  // Simular envío
  feedbackEl.textContent = "¡Registrado! Te avisaremos apenas tengamos el drop.";
  feedbackEl.className = "notify-feedback success";
  emailInput.value = "";
  // Desvanecer el feedback en 5 segundos
  setTimeout(() => {
    feedbackEl.textContent = "";
    feedbackEl.className = "notify-feedback";
  }, 5000);
}