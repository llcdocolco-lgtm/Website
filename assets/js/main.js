/* ═══════════════════════════════════════════
   DOCOLCO LLC — assets/js/main.js
   Carrito + Stripe + UI
   ═══════════════════════════════════════════ */

// ══════════════════════════════
// CONFIGURACIÓN STRIPE
// ══════════════════════════════
// ⚠️ IMPORTANTE: Reemplaza con tu clave pública real de Stripe
// Encuéntrala en: dashboard.stripe.com → Developers → API keys
const STRIPE_PUBLIC_KEY = 'pk_test_REEMPLAZA_CON_TU_CLAVE_PUBLICA';

// ══════════════════════════════
// PRODUCTOS (sincronizado con el HTML)
// ══════════════════════════════
const PRODUCTS = [
  { id: 1, name: 'Liquid Detergent',       price: 8.99,  img: 'img/productos/liquid-detergent.jpg',   cat: 'cleaning' },
  { id: 2, name: 'Cloth Softener',         price: 7.99,  img: 'img/productos/cloth-softener.jpg',     cat: 'cleaning' },
  { id: 3, name: 'Floor Cleaner',          price: 9.99,  img: 'img/productos/floor-cleaner.jpg',      cat: 'cleaning' },
  { id: 4, name: 'Dishwashing Liquid',     price: 5.99,  img: 'img/productos/dishwashing-liquid.jpg', cat: 'cleaning' },
  { id: 5, name: 'Soft Gloves',            price: 4.99,  img: 'img/productos/soft-gloves.jpg',        cat: 'protection' },
  { id: 6, name: 'Cling Wrap',             price: 6.49,  img: 'img/productos/cling-wrap.jpg',         cat: 'packaging' },
  { id: 7, name: 'Stretch Film',           price: 14.99, img: 'img/productos/stretch-film.jpg',       cat: 'packaging' },
  { id: 8, name: 'Garbage Bags',           price: 8.49,  img: 'img/productos/garbage-bag.jpg',        cat: 'waste' },
  { id: 9, name: 'Bright Steel Spiral',    price: 3.99,  img: 'img/productos/bright-steel-spiral.jpg',cat: 'cleaning' },
];

// ══════════════════════════════
// ESTADO DEL CARRITO
// ══════════════════════════════
let cart = [];

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. SCROLL PROGRESS ── */
  const line = document.getElementById('scroll-line');
  window.addEventListener('scroll', () => {
    const total = document.body.scrollHeight - window.innerHeight;
    if (line) line.style.width = (window.scrollY / total * 100) + '%';
  }, { passive: true });

  /* ── 2. NAV SCROLL + ACTIVE ── */
  const navbar = document.querySelector('nav');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 80) cur = s.id; });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  }, { passive: true });

  /* ── 3. HAMBURGER ── */
  const ham = document.getElementById('hamburger');
  const nl  = document.getElementById('navLinks');
  if (ham && nl) {
    ham.addEventListener('click', () => {
      nl.classList.toggle('open');
      const isOpen = nl.classList.contains('open');
      const spans = ham.querySelectorAll('span');
      spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px,5px)' : '';
      spans[1].style.opacity   = isOpen ? '0' : '1';
      spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px,-5px)' : '';
    });
    nl.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nl.classList.remove('open')));
  }

  /* ── 4. REVEAL ── */
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

  /* ── 5. STAGGER PRODUCTS ── */
  const cards = document.querySelectorAll('.product-card');
  const stObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const i = [...cards].indexOf(e.target);
        e.target.style.transitionDelay = (i * 0.06) + 's';
        e.target.classList.add('in');
        stObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  cards.forEach(c => { c.classList.add('reveal'); stObs.observe(c); });

  /* ── 6. FILTER PRODUCTOS ── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(c => {
        c.dataset.hidden = (f !== 'all' && c.dataset.cat !== f) ? 'true' : 'false';
      });
    });
  });

  /* ── 7. MODAL PRODUCTO ── */
  const overlay   = document.getElementById('modalOverlay');
  const mImg      = document.getElementById('mImg');
  const mCat      = document.getElementById('mCat');
  const mName     = document.getElementById('mName');
  const mDesc     = document.getElementById('mDesc');
  const mAvail    = document.getElementById('mAvail');
  const mPrice    = document.getElementById('mPrice');
  const mAddBtn   = document.getElementById('mAddBtn');
  const mClose    = document.getElementById('modalClose');

  cards.forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.product-add-btn')) return;
      const id = parseInt(card.dataset.id);
      const p  = PRODUCTS.find(p => p.id === id);
      if (!p) return;
      if (mImg)   { mImg.src = card.querySelector('.product-img-wrap img')?.src || ''; mImg.alt = p.name; }
      if (mCat)   mCat.textContent  = card.dataset.cat;
      if (mName)  mName.textContent = card.querySelector('.product-name')?.textContent || p.name;
      if (mDesc)  mDesc.textContent = card.querySelector('.product-desc')?.textContent || '';
      if (mAvail) mAvail.textContent= card.querySelector('.product-avail')?.textContent || '';
      if (mPrice) mPrice.textContent= '$' + p.price.toFixed(2);
      if (mAddBtn) mAddBtn.dataset.id = id;
      overlay?.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() { overlay?.classList.remove('open'); document.body.style.overflow = ''; }
  mClose?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ── 8. AÑADIR AL CARRITO ── */
  function addToCart(productId) {
    const p = PRODUCTS.find(p => p.id === parseInt(productId));
    if (!p) return;
    const existing = cart.find(i => i.id === p.id);
    if (existing) { existing.qty++; }
    else { cart.push({ ...p, qty: 1 }); }
    updateCartUI();
    showCartToast(p.name);
  }

  // Botones "Add to cart" en las cards
  document.querySelectorAll('.product-add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      addToCart(btn.dataset.id);
    });
  });

  // Botón del modal
  mAddBtn?.addEventListener('click', () => {
    addToCart(mAddBtn.dataset.id);
    closeModal();
  });

  /* ── 9. ACTUALIZAR UI DEL CARRITO ── */
  function updateCartUI() {
    const total = cart.reduce((s, i) => s + i.qty, 0);
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
      cartCount.textContent = total;
      cartCount.classList.toggle('show', total > 0);
    }
    renderCartSummary();
  }

  function renderCartSummary() {
    const container = document.getElementById('cartItems');
    const totalEl   = document.getElementById('cartTotal');
    if (!container) return;

    if (cart.length === 0) {
      container.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
      if (totalEl) totalEl.innerHTML = '';
      return;
    }

    container.innerHTML = cart.map(item => `
      <div class="cart-item">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-qty">x${item.qty}</span>
        <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
        <button class="cart-item-remove" data-id="${item.id}" title="Remove">✕</button>
      </div>
    `).join('');

    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    if (totalEl) totalEl.innerHTML = `
      <span>Total</span>
      <span>$${subtotal.toFixed(2)} USD</span>
    `;

    container.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        cart = cart.filter(i => i.id !== parseInt(btn.dataset.id));
        updateCartUI();
      });
    });
  }

  /* ── 10. TOAST NOTIFICACIÓN ── */
  function showCartToast(name) {
    let toast = document.getElementById('cartToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cartToast';
      toast.style.cssText = `
        position:fixed; bottom:2rem; right:2rem; z-index:500;
        background:#1A3FA8; color:white; padding:.8rem 1.4rem;
        border-radius:4px; font-size:.85rem; font-weight:600;
        box-shadow:0 4px 20px rgba(0,0,0,.2);
        transform:translateY(100px); opacity:0;
        transition:transform .3s, opacity .3s;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = `✓ ${name} added to cart`;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity   = '1';
    setTimeout(() => {
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity   = '0';
    }, 2500);
  }

  /* ── 11. IR AL CHECKOUT ── */
  const checkoutBtn = document.getElementById('goToCheckout');
  const checkoutSec = document.getElementById('checkout');
  const backBtn     = document.getElementById('backToShop');

  checkoutBtn?.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Your cart is empty. Please add products first.');
      return;
    }
    checkoutSec?.classList.add('active');
    checkoutSec?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    renderCartSummary();
    initStripe();
  });

  backBtn?.addEventListener('click', () => {
    checkoutSec?.classList.remove('active');
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  });

  /* ── 12. STRIPE INTEGRATION ── */
  let stripe, cardElement;

  function initStripe() {
    if (stripe) return; // Ya inicializado

    // Carga el script de Stripe si no está
    if (!window.Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = setupStripe;
      document.head.appendChild(script);
    } else {
      setupStripe();
    }
  }

  function setupStripe() {
    stripe      = Stripe(STRIPE_PUBLIC_KEY);
    const elements = stripe.elements();

    cardElement = elements.create('card', {
      style: {
        base: {
          fontFamily: "'Outfit', sans-serif",
          fontSize: '16px',
          color: '#1A1A1A',
          '::placeholder': { color: '#999999' }
        },
        invalid: { color: '#C8202A' }
      }
    });
    cardElement.mount('#stripe-card-element');

    cardElement.on('change', ({ error }) => {
      const errEl = document.getElementById('card-errors');
      if (errEl) errEl.textContent = error ? error.message : '';
    });
  }

  /* ── 13. SUBMIT PAGO ── */
  const payBtn  = document.getElementById('payBtn');
  const payForm = document.getElementById('paymentForm');

  payForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!stripe || !cardElement) { alert('Payment system loading. Please wait.'); return; }
    if (cart.length === 0) { alert('Your cart is empty.'); return; }

    payBtn?.classList.add('loading');
    payBtn.disabled = true;

    const name  = document.getElementById('billingName')?.value;
    const email = document.getElementById('billingEmail')?.value;

    // ─────────────────────────────────────────────────────────────
    // NOTA IMPORTANTE PARA PRODUCCIÓN:
    // En producción debes crear un PaymentIntent en tu backend y
    // recibir el client_secret. El flujo es:
    // 1. Tu backend recibe el monto y crea PaymentIntent via API Stripe
    // 2. Tu backend devuelve el client_secret
    // 3. Aquí confirmas con confirmCardPayment(clientSecret, ...)
    //
    // Para testing con tarjeta de prueba usa: 4242 4242 4242 4242
    // ─────────────────────────────────────────────────────────────

    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: { name, email }
    });

    if (error) {
      const errEl = document.getElementById('card-errors');
      if (errEl) errEl.textContent = error.message;
      payBtn?.classList.remove('loading');
      payBtn.disabled = false;
    } else {
      // paymentMethod.id lo envías a tu backend para procesar
      console.log('PaymentMethod creado:', paymentMethod.id);
      showPaymentSuccess(name, email);
    }
  });

  function showPaymentSuccess(name, email) {
    const form    = document.getElementById('paymentForm');
    const success = document.getElementById('paySuccess');
    if (form)    form.style.display    = 'none';
    if (success) success.classList.add('show');
    const nameEl = document.getElementById('successName');
    const emailEl= document.getElementById('successEmail');
    if (nameEl)  nameEl.textContent  = name;
    if (emailEl) emailEl.textContent = email;
    cart = [];
    updateCartUI();
  }

  /* ── 14. FORMULARIO CONTACTO ── */
  const contactBtn = document.getElementById('contactBtn');
  const contactOk  = document.getElementById('contactOk');
  contactBtn?.addEventListener('click', () => {
    const email = document.getElementById('cEmail')?.value?.trim();
    if (!email) { document.getElementById('cEmail')?.focus(); return; }
    contactBtn.textContent = 'Sending...';
    contactBtn.disabled    = true;
    setTimeout(() => {
      contactBtn.style.display = 'none';
      contactOk?.classList.add('show');
    }, 900);
  });

  /* ── 15. SMOOTH SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - 70, behavior: 'smooth' });
    });
  });

  /* ── 16. CART ICON CLICK → CHECKOUT ── */
  document.getElementById('cartIcon')?.addEventListener('click', () => {
    if (cart.length === 0) {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      checkoutSec?.classList.add('active');
      checkoutSec?.scrollIntoView({ behavior: 'smooth' });
      renderCartSummary();
      initStripe();
    }
  });

});
