/* ═══════════════════════════════════════════
   DOCOLCO LLC — assets/js/products-loader.js
   Reads data/products.json and renders the catalog.
   Calls initProductCards(), initFilterBtns(), initReveal()
   from main.js after rendering.
   ═══════════════════════════════════════════ */

(async function () {
  const grid = document.getElementById('productsGrid');

  try {
    const resp = await fetch('data/products.json');
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();

    // ── Update global PRODUCTS for cart ──────────────────────
    window.PRODUCTS = data.products.map(p => ({
      id:            String(p.id),
      name:          p.name,
      price:         p.boxPrice,
      img:           p.image,
      cat:           p.category,
      categoryLabel: p.categoryLabel,
      unitPrice:     p.unitPrice,
      boxPrice:      p.boxPrice,
      boxContents:   p.boxContents,
    }));

    // ── Render category filter buttons ────────────────────────
    const filterBar = document.getElementById('filterBar');
    if (filterBar) {
      data.categories.forEach(cat => {
        const btn          = document.createElement('button');
        btn.className      = 'filter-btn';
        btn.dataset.filter = cat.toLowerCase();
        btn.textContent    = cat;
        filterBar.appendChild(btn);
      });
    }

    // ── Render product cards ──────────────────────────────────
    if (grid) {
      grid.innerHTML = data.products.map(p => `
        <div class="product-card reveal" data-id="${p.id}" data-cat="${p.category}">
          <div class="product-img-wrap">
            <span class="product-cat-badge">${p.categoryLabel}</span>
            <img src="${p.image}" alt="${p.name}"
                 onerror="this.src='img/placeholder.svg'">
          </div>
          <div class="product-info">
            <div class="product-name">${p.name}</div>
            <p class="product-desc">${p.boxContents}</p>
            <div class="product-avail">${p.boxContents}</div>
            <div class="product-price">
              $${p.boxPrice.toFixed(2)} <span style="font-size:.75rem;font-weight:400;color:var(--muted)">/box</span>
            </div>
            <div style="font-size:.78rem;color:var(--muted);margin-top:.2rem">
              $${p.unitPrice.toFixed(2)} per unit
            </div>
            <button class="product-add-btn" data-id="${p.id}">
              + Add to Cart
            </button>
          </div>
        </div>`).join('');
    }

    // ── Init UI functions defined in main.js ──────────────────
    if (typeof window.initProductCards === 'function') window.initProductCards();
    if (typeof window.initFilterBtns   === 'function') window.initFilterBtns();
    if (typeof window.initReveal        === 'function') window.initReveal();

  } catch (err) {
    console.error('products-loader:', err);
    if (grid) grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;
                  padding:3rem;color:var(--muted)">
        Products temporarily unavailable.<br>
        Please contact us at
        <a href="mailto:info@docolco.com" style="color:var(--blue);">info@docolco.com</a>
      </div>`;
  }
})();
