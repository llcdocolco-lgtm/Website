/* ═══════════════════════════════════════════
   DOCOLCO LLC — assets/js/main.js
   Carrito + Stripe Seguro (backend) + UI
   ═══════════════════════════════════════════ */

const STRIPE_PUBLIC_KEY  = 'pk_test_51Tbp7zAbTZyD8rvRd4d0L2LtdnO2rYtZSRycTvO8SgWRJPx23ciEPT2smuCeddCI3JT1aTHshVzhR2hVh6Tiak3T00WZDLthTn';
const PAYMENT_INTENT_URL = '/.netlify/functions/create-payment-intent';

// Filled by products-loader.js before initProductCards is called
window.PRODUCTS = window.PRODUCTS || [];

let cart = [];


document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. SCROLL PROGRESS ── */
  const line = document.getElementById('scroll-line');
  window.addEventListener('scroll', () => {
    const total = document.body.scrollHeight - window.innerHeight;
    if (line) line.style.width = (window.scrollY / total * 100) + '%';
  }, { passive: true });

  /* ── 2. NAV SCROLL + ACTIVE ── */
  const navbar   = document.querySelector('nav');
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
      const spans  = ham.querySelectorAll('span');
      spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px,5px)' : '';
      spans[1].style.opacity   = isOpen ? '0' : '1';
      spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px,-5px)' : '';
    });
    nl.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nl.classList.remove('open')));
  }

  /* ── 4. REVEAL (non-product elements) ── */
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal:not(.product-card)').forEach(el => revObs.observe(el));

  /* ── MODAL CLOSE HANDLERS ── */
  const overlay = document.getElementById('modalOverlay');
  const mClose  = document.getElementById('modalClose');
  const mAddBtn = document.getElementById('mAddBtn');

  function closeModal() { overlay?.classList.remove('open'); document.body.style.overflow = ''; }
  mClose?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  mAddBtn?.addEventListener('click', () => {
    addToCart(mAddBtn.dataset.id);
    closeModal();
  });

  /* ── ADD TO CART ── */
  function addToCart(productId) {
    const p = window.PRODUCTS.find(p => p.id === String(productId));
    if (!p) return;
    const existing = cart.find(i => i.id === p.id);
    if (existing) { existing.qty++; }
    else { cart.push({ ...p, qty: 1 }); }
    updateCartUI();
    showCartToast(p.name);
  }

  /* ── CART UI ── */
  function updateCartUI() {
    const total     = cart.reduce((s, i) => s + i.qty, 0);
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
        <span class="cart-item-qty">${item.qty} box${item.qty > 1 ? 'es' : ''} × $${item.price.toFixed(2)} = $${(item.price * item.qty).toFixed(2)}</span>
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
        cart = cart.filter(i => i.id !== btn.dataset.id);
        updateCartUI();
      });
    });
  }

  /* ── TOAST ── */
  function showCartToast(name) {
    let toast = document.getElementById('cartToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id            = 'cartToast';
      toast.style.cssText = `
        position:fixed;bottom:2rem;right:2rem;z-index:500;
        background:#1A3FA8;color:white;padding:.8rem 1.4rem;
        border-radius:4px;font-size:.85rem;font-weight:600;
        box-shadow:0 4px 20px rgba(0,0,0,.2);
        transform:translateY(100px);opacity:0;
        transition:transform .3s,opacity .3s;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent       = `+ ${name} added to cart`;
    toast.style.transform   = 'translateY(0)';
    toast.style.opacity     = '1';
    setTimeout(() => {
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity   = '0';
    }, 2500);
  }

  /* ══════════════════════════════════════════════════════════════
     GLOBAL FUNCTIONS — called by products-loader.js after render
     and also called here on DOMContentLoaded for any static cards
  ══════════════════════════════════════════════════════════════ */

  window.initProductCards = function () {
    const cards = document.querySelectorAll('.product-card');
    if (!cards.length) return;

    const mImg      = document.getElementById('mImg');
    const mCat      = document.getElementById('mCat');
    const mName     = document.getElementById('mName');
    const mDesc     = document.getElementById('mDesc');
    const mAvail    = document.getElementById('mAvail');
    const mPrice    = document.getElementById('mPrice');
    const mBoxPrice = document.getElementById('mBoxPrice');
    const mBoxLabel = document.getElementById('mBoxLabel');

    cards.forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('.product-add-btn')) return;
        const id = card.dataset.id;
        const p  = window.PRODUCTS.find(p => p.id === String(id));
        if (!p) return;
        if (mImg)      { mImg.src = card.querySelector('.product-img-wrap img')?.src || ''; mImg.alt = p.name; }
        if (mCat)      mCat.textContent   = p.categoryLabel || p.category;
        if (mName)     mName.textContent  = p.name;
        if (mDesc)     mDesc.textContent  = p.boxContents   || '';
        if (mAvail)    mAvail.textContent = p.boxContents   || '';
        if (mPrice)    mPrice.textContent = '$' + p.boxPrice.toFixed(2) + ' / box';
        if (mBoxPrice) mBoxPrice.textContent = '$' + p.unitPrice.toFixed(2) + ' per unit';
        if (mBoxLabel) mBoxLabel.textContent = p.boxContents;
        if (mAddBtn)   mAddBtn.dataset.id = id;
        overlay?.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    document.querySelectorAll('.product-add-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        addToCart(btn.dataset.id);
      });
    });
  };

  window.initFilterBtns = function () {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards      = document.querySelectorAll('.product-card');
    if (!filterBtns.length) return;

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
  };

  window.initReveal = function () {
    const cards = document.querySelectorAll('.product-card');
    if (!cards.length) return;

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

    cards.forEach(c => stObs.observe(c));
  };

  // Call once for any static cards already in the DOM (usually none)
  window.initProductCards();
  window.initFilterBtns();
  window.initReveal();

  /* ── CHECKOUT ── */
  const checkoutBtn = document.getElementById('goToCheckout');
  const checkoutSec = document.getElementById('checkout');
  const backBtn     = document.getElementById('backToShop');

  checkoutBtn?.addEventListener('click', () => {
    if (cart.length === 0) { alert('Your cart is empty. Please add products first.'); return; }
    checkoutSec?.classList.add('active');
    checkoutSec?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    renderCartSummary();
  });

  backBtn?.addEventListener('click', () => {
    checkoutSec?.classList.remove('active');
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  });

  /* ── PAYMENT SUBMIT ── */
  const payBtn  = document.getElementById('payBtn');
  const payForm = document.getElementById('paymentForm');

  payForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (cart.length === 0) { alert('Your cart is empty.'); return; }

    payBtn?.classList.add('loading');
    payBtn.disabled = true;

    const name  = document.getElementById('billingName')?.value?.trim();
    const email = document.getElementById('billingEmail')?.value?.trim();
    const phone = document.getElementById('billingPhone')?.value?.trim();

    if (!name || !email || !phone) {
      payBtn?.classList.remove('loading');
      payBtn.disabled = false;
      alert('Please complete all required fields including phone number.');
      return;
    }

    try {
      const cartPayload = cart.map(item => ({ id: item.id, qty: item.qty }));
      const response = await fetch(PAYMENT_INTENT_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ cart: cartPayload, customerEmail: email, customerPhone: phone, customerName: name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server error');

      sessionStorage.setItem('customerName',  name);
      sessionStorage.setItem('customerEmail', email);
      window.location.href = data.url;

    } catch (error) {
      console.error('Payment error:', error);
      const errEl = document.getElementById('card-errors');
      if (errEl) errEl.textContent = 'Could not initiate payment. Please try again.';
      payBtn?.classList.remove('loading');
      payBtn.disabled = false;
    }
  });

  /* ── PAYMENT SUCCESS ── */
  function showPaymentSuccess(name, email, orderId) {
    const form    = document.getElementById('paymentForm');
    const success = document.getElementById('paySuccess');
    if (form)    form.style.display = 'none';
    if (success) success.classList.add('show');
    const nameEl  = document.getElementById('successName');
    const emailEl = document.getElementById('successEmail');
    const orderEl = document.getElementById('successOrderId');
    if (nameEl)  nameEl.textContent  = name;
    if (emailEl) emailEl.textContent = email;
    if (orderEl) orderEl.textContent = orderId || '';
    cart = [];
    updateCartUI();
  }

  document.getElementById('continueShopping')?.addEventListener('click', (e) => {
    e.preventDefault();
    const form    = document.getElementById('paymentForm');
    const success = document.getElementById('paySuccess');
    if (success) success.classList.remove('show');
    if (form)    form.style.display = '';
    checkoutSec?.classList.remove('active');
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  });

  /* ── STRIPE RETURN ── */
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('success') === 'true') {
    const orderId = urlParams.get('order_id') || '';
    const name    = sessionStorage.getItem('customerName')  || '';
    const email   = sessionStorage.getItem('customerEmail') || '';
    sessionStorage.removeItem('customerName');
    sessionStorage.removeItem('customerEmail');
    history.replaceState({}, document.title, '/');
    checkoutSec?.classList.add('active');
    setTimeout(() => {
      checkoutSec?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showPaymentSuccess(name, email, orderId);
    }, 300);
  }
  if (urlParams.get('canceled') === 'true') {
    history.replaceState({}, document.title, '/');
  }

  /* ── CONTACT FORM ── */
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

  /* ── SMOOTH SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) window.scrollTo({
        top: target.getBoundingClientRect().top + scrollY - 70,
        behavior: 'smooth',
      });
    });
  });

  /* ── CART ICON ── */
  document.getElementById('cartIcon')?.addEventListener('click', () => {
    if (cart.length === 0) {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      checkoutSec?.classList.add('active');
      checkoutSec?.scrollIntoView({ behavior: 'smooth' });
      renderCartSummary();
    }
  });

});
