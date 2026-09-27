/**
 * 琉璃商店 · 前端交互逻辑
 * - 直接加载 data/products.json（纯静态，无需后端）
 * - 渲染分类、搜索、网格、详情模态
 */
(function () {
  'use strict';

  const DATA_URL = 'data/products.json';
  const grid = document.getElementById('productGrid');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const categoriesEl = document.getElementById('categories');
  const totalCountEl = document.getElementById('totalCount');
  const modal = document.getElementById('modal');
  const modalCard = document.getElementById('modalCard');

  let currentCategory = '全部';
  let currentKeyword = '';
  let allProducts = [];

  // ====== 工具函数 ======
  const fmtPrice = (n) => Number(n).toLocaleString('zh-CN');
  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

  // ====== 渲染商品卡片 ======
  function renderCard(p) {
    const badge = p.badge
      ? `<span class="badge badge-${escapeHtml(p.badge)}">${escapeHtml(p.badge)}</span>`
      : '';
    const origin = p.originalPrice
      ? `<span class="price-origin">¥${fmtPrice(p.originalPrice)}</span>`
      : '';
    return `
      <article class="card" data-id="${p.id}" tabindex="0" role="button" aria-label="${escapeHtml(p.name)} 详情">
        <div class="card-img-wrap">
          <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy"
               onerror="this.style.background='linear-gradient(135deg,#a78bfa,#f472b6)';this.removeAttribute('src');" />
          ${badge}
        </div>
        <div class="card-body">
          <span class="card-category">${escapeHtml(p.category)} · ${escapeHtml(p.subCategory || '')}</span>
          <h3 class="card-title">${escapeHtml(p.name)}</h3>
          <p class="card-desc">${escapeHtml(p.description)}</p>
          <div class="card-footer">
            <span class="price-now">${fmtPrice(p.price)}</span>
            ${origin}
          </div>
        </div>
      </article>`;
  }

  function renderList(list) {
    if (!list.length) {
      grid.innerHTML = '';
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;
    grid.innerHTML = list.map(renderCard).join('');
    totalCountEl.textContent = list.length;
  }

  // ====== 分类筛选 ======
  function renderCategories(cats) {
    const existing = categoriesEl.querySelector('[data-category="全部"]');
    cats.filter(c => c !== '全部').forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'chip';
      btn.dataset.category = c;
      btn.textContent = c;
      categoriesEl.appendChild(btn);
    });
  }

  function applyFilter() {
    let list = allProducts;
    if (currentCategory !== '全部') {
      list = list.filter(p => p.category === currentCategory);
    }
    if (currentKeyword) {
      const kw = currentKeyword.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(kw) ||
        p.description.toLowerCase().includes(kw)
      );
    }
    renderList(list);
  }

  // ====== 事件绑定 ======
  categoriesEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('chip-active'));
    btn.classList.add('chip-active');
    currentCategory = btn.dataset.category;
    applyFilter();
  });

  let searchTimer = null;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentKeyword = e.target.value.trim();
      applyFilter();
    }, 220);
  });

  // 卡片点击 → 详情
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    const id = parseInt(card.dataset.id, 10);
    openModal(id);
  });
  grid.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.card');
    if (!card) return;
    e.preventDefault();
    openModal(parseInt(card.dataset.id, 10));
  });

  // ====== 详情模态 ======
  function openModal(id) {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;
    const modalImg = document.getElementById('modalImg');
    modalImg.src = p.image;
    modalImg.alt = p.name;
    const thumbs = document.getElementById('modalThumbs');
    thumbs.innerHTML = (p.images || [p.image]).map((src, i) => `
      <button class="thumb ${i === 0 ? 'thumb-active' : ''}" data-src="${escapeHtml(src)}" aria-label="第 ${i + 1} 张图">
        <img src="${escapeHtml(src)}" alt="" loading="lazy" />
      </button>`).join('');
    thumbs.onclick = (e) => {
      const btn = e.target.closest('.thumb');
      if (!btn) return;
      modalImg.src = btn.dataset.src;
      thumbs.querySelectorAll('.thumb').forEach(t => t.classList.remove('thumb-active'));
      btn.classList.add('thumb-active');
    };
    const badgeEl = document.getElementById('modalBadge');
    badgeEl.textContent = p.badge || '';
    badgeEl.className = 'badge ' + (p.badge ? `badge-${p.badge}` : '');
    badgeEl.style.display = p.badge ? '' : 'none';
    document.getElementById('modalTitle').textContent = p.name;
    document.getElementById('modalCategory').textContent = p.subCategory
      ? `${p.category} · ${p.subCategory}` : p.category;
    document.getElementById('modalDesc').textContent = p.description;
    document.getElementById('modalPrice').textContent = fmtPrice(p.price);
    document.getElementById('modalOrigin').textContent =
      p.originalPrice ? `原价 ¥${fmtPrice(p.originalPrice)}` : '';
    document.getElementById('modalOrigin').style.display = p.originalPrice ? '' : 'none';
    document.getElementById('modalStock').textContent = '仅展示 · 非交易';
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modalCard.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }
  modal.addEventListener('click', (e) => {
    if (e.target.hasAttribute('data-close')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  // ====== 数据加载 ======
  async function bootstrap() {
    try {
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      if (!Array.isArray(raw)) throw new Error('数据格式异常');

      // 字段映射：源数据 → 前端渲染结构
      allProducts = raw.map((p, i) => ({
        id: i + 1,
        name: p.name || '未命名商品',
        category: p.mainCategory || '未分类',
        subCategory: p.subCategory || '',
        image: (p.images && p.images[0]) || '',
        images: p.images || [],
        badge: p.badge || '',
        description: p.description || '暂无描述',
        price: p.price || 0,
        originalPrice: p.originalPrice || null
      }));

      // 从数据推导分类（原 /api/categories 逻辑改为本地计算）
      const cats = [...new Set(allProducts.map(p => p.category))];
      renderCategories(['全部', ...cats]);
      renderList(allProducts);
    } catch (err) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <p>加载失败：${escapeHtml(err.message)}</p>
          <p style="margin-top:8px;font-size:13px;opacity:.8">请确认 data/products.json 存在且格式正确</p>
        </div>`;
      console.error('[Bootstrap Error]', err);
    }
  }

  bootstrap();
})();
