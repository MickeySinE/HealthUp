/* =============================================
   HealthUP — main.js
   ============================================= */

const API_URL = 'http://localhost:3000/api';

// ── SESSION ────────────────────────────────────
function saveSession(user) {
  localStorage.setItem('healthup_user', JSON.stringify(user));
}

function getSession() {
  const data = localStorage.getItem('healthup_user');
  return data ? JSON.parse(data) : null;
}

function clearSession() {
  localStorage.removeItem('healthup_user');
}

// ── NAVEGACIÓN SPA ─────────────────────────────
function initNavigation() {
  const pages    = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('[data-page]');

  function showPage(pageId) {
    pages.forEach(p => {
      p.id === `page-${pageId}`
        ? p.removeAttribute('hidden')
        : p.setAttribute('hidden', '');
    });
    navLinks.forEach(l => {
      l.classList.toggle('is-active', l.dataset.page === pageId);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (pageId === 'perfil') {
      const session = getSession();
      if (session) loadPerfil(session.id);
    }
    // AGREGA ESTO:
    if (pageId === 'blog') {
      initForo();
      initNuevoPost();
    }
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showPage(link.dataset.page);
    });
  });

  showPage('inicio');
}

// ── NAVBAR USER STATE ──────────────────────────
function updateNavbarAuth(user) {
  const actions = document.querySelector('.navbar__actions');

  if (user) {
    actions.innerHTML = `
      <div class="auth-dropdown">
        <button class="btn btn--primary auth-dropdown__trigger" aria-haspopup="true" aria-expanded="false">
          ${user.username}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="auth-dropdown__menu" role="menu">
          <div class="auth-dropdown__header"><p>Hola, ${user.username}</p></div>
          <a href="#" class="auth-dropdown__item" role="menuitem" data-page="perfil" id="perfilNavBtn">
            <span class="auth-dropdown__item-icon">👤</span>
            Mi perfil
          </a>
          <div class="auth-dropdown__divider"></div>
          <a href="#" class="auth-dropdown__item auth-dropdown__item--primary" id="logoutBtn" role="menuitem">
            <span class="auth-dropdown__item-icon">→</span>
            Cerrar sesión
          </a>
        </div>
      </div>
    `;
    initAuthDropdown();

    // Ir al perfil desde el dropdown
    document.getElementById('perfilNavBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector('.auth-dropdown__menu').classList.remove('is-open');
      document.querySelectorAll('.page').forEach(p => p.setAttribute('hidden', ''));
      document.getElementById('page-perfil')?.removeAttribute('hidden');
      loadPerfil(user.id);
    });

    document.getElementById('logoutBtn').addEventListener('click', (e) => {
      e.preventDefault();
      clearSession();
      location.reload();
    });
  } else {
    actions.innerHTML = `
      <div class="auth-dropdown">
        <button class="btn btn--primary auth-dropdown__trigger" aria-haspopup="true" aria-expanded="false">
          Iniciar sesión
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="auth-dropdown__menu" role="menu">
          <div class="auth-dropdown__header"><p>¿Ya tienes cuenta?</p></div>
          <a href="#" class="auth-dropdown__item auth-dropdown__item--primary" role="menuitem" data-auth="login">
            <span class="auth-dropdown__item-icon">→</span>
            Iniciar sesión
          </a>
          <div class="auth-dropdown__divider"></div>
          <div class="auth-dropdown__header"><p>¿Nuevo por aquí?</p></div>
          <a href="#" class="auth-dropdown__item" role="menuitem" data-auth="register">
            <span class="auth-dropdown__item-icon">✦</span>
            Crear cuenta gratis
          </a>
        </div>
      </div>
    `;
    initAuthDropdown();
    initAuthModalTriggers();
  }
}

// ── AUTH DROPDOWN ──────────────────────────────
function initAuthDropdown() {
  const trigger = document.querySelector('.auth-dropdown__trigger');
  const menu    = document.querySelector('.auth-dropdown__menu');
  if (!trigger || !menu) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', () => {
    menu.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', false);
  });
}

// ── AUTH MODAL TRIGGERS ────────────────────────
function initAuthModalTriggers() {
  document.querySelectorAll('[data-auth]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.dataset.auth;
      document.querySelector('.auth-dropdown__menu').classList.remove('is-open');
      document.querySelector('.auth-dropdown__trigger').setAttribute('aria-expanded', false);
      openModal(tab);
    });
  });
}

// ── AUTH MODAL ─────────────────────────────────
let openModal = null;

function initAuthModal() {
  const overlay  = document.getElementById('authModal');
  const closeBtn = overlay.querySelector('.modal__close');
  const tabs     = overlay.querySelectorAll('.modal__tab');
  const panels   = overlay.querySelectorAll('.modal__panel');

  openModal = function(tab = 'login') {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', false);
    document.body.style.overflow = 'hidden';
    switchTab(tab);
  };

  function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', true);
    document.body.style.overflow = '';
    clearErrors();
  }

  function switchTab(tabName) {
    tabs.forEach(t => t.classList.toggle('is-active', t.dataset.tab === tabName));
    panels.forEach(p => p.classList.toggle('is-active', p.id === `panel-${tabName}`));
    clearErrors();
  }

  function clearErrors() {
    overlay.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  }

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
  }

  function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? 'Cargando...' : btn.dataset.label;
  }

  document.getElementById('loginSubmit').dataset.label    = 'Entrar';
  document.getElementById('registerSubmit').dataset.label = 'Crear cuenta';

  tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));

  overlay.querySelectorAll('[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); switchTab(link.dataset.tab); });
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // LOGIN
  document.getElementById('loginSubmit').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim();
    const pwd   = document.getElementById('login-password').value;

    if (!email) return showError('login-error', 'Ingresa tu correo electrónico.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('login-error', 'El correo no es válido.');
    if (!pwd) return showError('login-error', 'Ingresa tu contraseña.');

    setLoading('loginSubmit', true);
    try {
      const res  = await fetch(`${API_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pwd })
      });
      const data = await res.json();
      if (!res.ok) return showError('login-error', data.error || 'Error al iniciar sesión.');
      saveSession(data.user);
      closeModal();
      updateNavbarAuth(data.user);
    } catch {
      showError('login-error', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading('loginSubmit', false);
    }
  });

  // REGISTRO
  document.getElementById('registerSubmit').addEventListener('click', async () => {
    const username = document.getElementById('reg-username').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const pwd      = document.getElementById('reg-password').value;
    const confirm  = document.getElementById('reg-confirm').value;

    if (!username) return showError('register-error', 'Elige un nombre de usuario.');
    if (username.length < 3) return showError('register-error', 'El usuario debe tener al menos 3 caracteres.');
    if (!email) return showError('register-error', 'Ingresa tu correo electrónico.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('register-error', 'El correo no es válido.');
    if (!pwd) return showError('register-error', 'Elige una contraseña.');
    if (pwd.length < 6) return showError('register-error', 'La contraseña debe tener al menos 6 caracteres.');
    if (pwd !== confirm) return showError('register-error', 'Las contraseñas no coinciden.');

    setLoading('registerSubmit', true);
    try {
      const res  = await fetch(`${API_URL}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, pwd })
      });
      const data = await res.json();
      if (!res.ok) return showError('register-error', data.error || 'Error al crear la cuenta.');
      showError('register-error', 'Revisa tu correo para confirmar tu cuenta.');
    } catch {
      showError('register-error', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading('registerSubmit', false);
    }
  });
}

// ── HAMBURGER MENU ─────────────────────────────
function initHamburger() {
  const btn     = document.querySelector('.navbar__hamburger');
  const links   = document.querySelector('.navbar__links');
  const actions = document.querySelector('.navbar__actions');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const isOpen = btn.classList.toggle('is-active');
    links?.classList.toggle('is-open');
    actions?.classList.toggle('is-open');
    btn.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });
}
// ── NAVBAR SCROLL SHADOW ───────────────────────
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 10);
  }, { passive: true });
}

// ── BUSCADOR ──────────────────────────────────
function initBuscador() {
  const input = document.getElementById('buscador');
  if (!input) return;

  function irARecetasYFiltrar(query) {
    const recetasPage = document.getElementById('page-recetas');
    const allPages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('[data-page]');

    allPages.forEach(p => p.setAttribute('hidden', ''));
    recetasPage?.removeAttribute('hidden');

    navLinks.forEach(l => {
      l.classList.toggle('is-active', l.dataset.page === 'recetas');
    });

    const cards = document.querySelectorAll('#recetas-grid .recipe-card');

    cards.forEach(card => {
      const texto = card.textContent.toLowerCase();
      const visible = texto.includes(query.toLowerCase());
      card.style.display = visible ? '' : 'none';
    });
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = input.value.trim();
      if (q.length >= 1) irARecetasYFiltrar(q);
    }
  });

  input.addEventListener('input', () => {
    const q = input.value.trim();
    if (!q) {
      document.querySelectorAll('#recetas-grid .recipe-card').forEach(card => {
        card.style.display = '';
      });
      return;
    }
    irARecetasYFiltrar(q);
  });
}

// ── LIKES — TOGGLE (foro y recetas) ───────────
// ── LIKES ──────────────────────────────────────
// Likes de recetas se guardan en localStorage (recetas hardcodeadas)
// Likes de posts se mandan al backend

function getLikedRecetas() {
  return JSON.parse(localStorage.getItem('healthup_liked_recetas') || '[]');
}

function setLikedRecetas(ids) {
  localStorage.setItem('healthup_liked_recetas', JSON.stringify(ids));
}

async function toggleLike(tipo, itemId, btnEl) {
  const user = getSession();
  if (!user) {
    openModal('login');
    return;
  }

  const url = tipo === 'post'
    ? `${API_URL}/foro/posts/${itemId}/like`
    : `${API_URL}/recetas/${itemId}/like`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar like');

    btnEl.classList.toggle('is-liked', !!data.liked);
    btnEl.setAttribute('aria-pressed', String(!!data.liked));

    const svg = btnEl.querySelector('svg');
    if (svg) {
      svg.setAttribute('fill', data.liked ? 'currentColor' : 'none');
    }

    const countEl = btnEl.querySelector('.like-count');
    if (countEl) {
      countEl.textContent = String(data.count ?? 0);
    }
  } catch (err) {
    console.error('toggleLike error:', err);
  }
}

// ── RECETAS ────────────────────────────────────
const recetas = [
  { id: "r01", titulo: "Avena con plátano y miel", categoria: "Desayuno", tiempo: "10 min", calorias: 320, descripcion: "Avena cremosa con rodajas de plátano, miel y canela. Fácil, nutritiva y lista en minutos.", ingredientes: ["Avena","Plátano","Miel","Leche","Canela"], foto: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&q=80" },
  { id: "r02", titulo: "Huevos revueltos con espinaca", categoria: "Desayuno", tiempo: "10 min", calorias: 210, descripcion: "Huevos revueltos suaves con espinacas salteadas y un toque de sal de ajo.", ingredientes: ["Huevos","Espinaca","Ajo","Aceite de oliva","Sal"], foto: "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&q=80" },
  { id: "r03", titulo: "Tostadas con aguacate", categoria: "Desayuno", tiempo: "5 min", calorias: 280, descripcion: "Pan integral tostado con aguacate machacado, limón y chile en polvo.", ingredientes: ["Pan integral","Aguacate","Limón","Chile en polvo","Sal"], foto: "https://images.unsplash.com/photo-1603046891744-1f057a4e1b2d?w=400&q=80" },
  { id: "r04", titulo: "Ensalada de atún", categoria: "Comida", tiempo: "10 min", calorias: 250, descripcion: "Atún en agua con lechuga, jitomate, pepino y aderezo de limón.", ingredientes: ["Atún en agua","Lechuga","Jitomate","Pepino","Limón"], foto: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80" },
  { id: "r05", titulo: "Pechuga de pollo a la plancha", categoria: "Comida", tiempo: "20 min", calorias: 300, descripcion: "Pechuga marinada con ajo, limón y hierbas, cocinada a la plancha.", ingredientes: ["Pechuga de pollo","Ajo","Limón","Orégano","Aceite de oliva"], foto: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&q=80" },
  { id: "r06", titulo: "Arroz con verduras", categoria: "Comida", tiempo: "25 min", calorias: 350, descripcion: "Arroz integral salteado con zanahoria, chícharo, elote y salsa de soya.", ingredientes: ["Arroz integral","Zanahoria","Chícharo","Elote","Salsa de soya"], foto: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80" },
  { id: "r07", titulo: "Sopa de lentejas", categoria: "Comida", tiempo: "30 min", calorias: 290, descripcion: "Sopa espesa de lentejas con jitomate, cebolla y comino.", ingredientes: ["Lentejas","Jitomate","Cebolla","Ajo","Comino"], foto: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80" },
  { id: "r08", titulo: "Quesadillas de frijol", categoria: "Comida", tiempo: "15 min", calorias: 380, descripcion: "Tortillas de maíz con frijoles refritos y queso gratinado.", ingredientes: ["Tortillas de maíz","Frijoles refritos","Queso","Sal"], foto: "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400&q=80" },
  { id: "r09", titulo: "Pasta con jitomate y albahaca", categoria: "Cena", tiempo: "20 min", calorias: 400, descripcion: "Pasta con salsa de jitomate fresco, ajo y albahaca.", ingredientes: ["Pasta","Jitomate","Ajo","Albahaca","Aceite de oliva"], foto: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=80" },
  { id: "r10", titulo: "Crema de zanahoria", categoria: "Cena", tiempo: "25 min", calorias: 180, descripcion: "Crema suave de zanahoria con jengibre y caldo de verduras.", ingredientes: ["Zanahoria","Cebolla","Jengibre","Caldo de verduras","Aceite"], foto: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&q=80" },
  { id: "r11", titulo: "Tacos de huevo con nopales", categoria: "Cena", tiempo: "15 min", calorias: 260, descripcion: "Huevo revuelto con nopales en cubos y tortillas de maíz.", ingredientes: ["Huevos","Nopales","Cebolla","Chile serrano","Tortillas"], foto: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80" },
  { id: "r12", titulo: "Yogur con granola y fresas", categoria: "Snack", tiempo: "5 min", calorias: 200, descripcion: "Yogur griego con granola crujiente y fresas frescas.", ingredientes: ["Yogur griego","Granola","Fresas","Miel"], foto: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80" },
  { id: "r13", titulo: "Manzana con mantequilla de cacahuate", categoria: "Snack", tiempo: "3 min", calorias: 190, descripcion: "Rodajas de manzana con mantequilla de cacahuate natural.", ingredientes: ["Manzana","Mantequilla de cacahuate"], foto: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80" },
  { id: "r14", titulo: "Licuado verde", categoria: "Snack", tiempo: "5 min", calorias: 150, descripcion: "Espinaca, pepino, piña y agua de coco licuados.", ingredientes: ["Espinaca","Pepino","Piña","Agua de coco","Limón"], foto: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&q=80" },
  { id: "r15", titulo: "Bowl de frutas con chía", categoria: "Snack", tiempo: "5 min", calorias: 170, descripcion: "Frutas de temporada con semillas de chía y jugo de naranja.", ingredientes: ["Frutas de temporada","Semillas de chía","Jugo de naranja","Miel"], foto: "https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?w=400&q=80" },
  { id: "r16", titulo: "Wrap de pollo con verduras", categoria: "Comida", tiempo: "15 min", calorias: 340, descripcion: "Tortilla integral rellena de pollo deshebrado, lechuga, zanahoria y yogur.", ingredientes: ["Tortilla integral","Pollo","Lechuga","Zanahoria","Yogur natural"], foto: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&q=80" },
  { id: "r17", titulo: "Ensalada griega ligera", categoria: "Comida", tiempo: "12 min", calorias: 260, descripcion: "Pepino, jitomate, queso fresco y aceitunas con aderezo ligero.", ingredientes: ["Pepino","Jitomate","Queso fresco","Aceitunas","Aceite de oliva"], foto: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80" },
  { id: "r18", titulo: "Sándwich de pavo", categoria: "Cena", tiempo: "8 min", calorias: 290, descripcion: "Pan integral con pavo, tomate, espinaca y mostaza.", ingredientes: ["Pan integral","Pavo","Tomate","Espinaca","Mostaza"], foto: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80" },
  { id: "r19", titulo: "Bowl de quinoa", categoria: "Comida", tiempo: "20 min", calorias: 360, descripcion: "Quinoa con aguacate, garbanzos, pepino y limón.", ingredientes: ["Quinoa","Garbanzos","Aguacate","Pepino","Limón"], foto: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80" },
  { id: "r20", titulo: "Pan francés saludable", categoria: "Desayuno", tiempo: "10 min", calorias: 240, descripcion: "Pan integral remojado en huevo con canela y fruta fresca.", ingredientes: ["Pan integral","Huevo","Canela","Leche","Fruta"], foto: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80" },
  { id: "r21", titulo: "Smoothie de frutos rojos", categoria: "Snack", tiempo: "5 min", calorias: 180, descripcion: "Licuado cremoso con frutos rojos, yogur y avena.", ingredientes: ["Frutos rojos","Yogur","Avena","Leche"], foto: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400&q=80" }
];
async function initRecetas() {
  const grid = document.getElementById('recetas-grid');
  if (!grid) return;

  const user = getSession();
  let lista = recetas;

  try {
    const res = await fetch(`${API_URL}/recetas`);
    if (res.ok) {
      const data = await res.json();
      if (data.length) lista = data.map(r => ({
        id:           r.id,
        titulo:       r.titulo,
        categoria:    r.categoria,
        tiempo:       r.tiempo_min ? `${r.tiempo_min} min` : '—',
        calorias:     r.calorias ?? '—',
        descripcion:  r.descripcion || '',
        ingredientes: Array.isArray(r.ingredientes) ? r.ingredientes : [],
        foto:         r.imagen_url || ''
      }));
    }
  } catch { /* usa fallback local */ }

  // Likes desde el backend, no localStorage
  let likedIds = new Set();
  if (user) {
    try {
      const res  = await fetch(`${API_URL}/perfil/${user.id}`);
      const data = await res.json();
      likedIds   = new Set((data.likes_recetas || []).map(r => r?.id ?? r));
    } catch { }
  }

  grid.innerHTML = lista.map((r, idx) => {
    const itemId  = r.id ?? `local-${idx}`;
    const isLiked = r.id && likedIds.has(r.id);
    return `
    <div class="recipe-card" data-id="${itemId}">
      <div class="recipe-card__img">
        <img src="${r.foto}" alt="${r.titulo}" loading="lazy" onerror="this.parentElement.innerHTML='🍽️'" />
        ${r.id ? `
        <button
          class="like-btn ${isLiked ? 'is-liked' : ''}"
          aria-label="Me gusta ${r.titulo}"
          aria-pressed="${isLiked}"
          data-tipo="receta"
          data-id="${r.id}"
        >
          <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>` : ''}
      </div>
      <div class="recipe-card__body">
        <div class="recipe-card__meta">
          <span class="blog-card__tag">${r.categoria}</span>
          <span class="recipe-card__time">⏱ ${r.tiempo}</span>
          <span class="recipe-card__kcal">🔥 ${r.calorias} kcal</span>
        </div>
        <h3>${r.titulo}</h3>
        <p>${r.descripcion}</p>
        <div class="recipe-card__ingredients">
          ${(r.ingredientes || []).map(i => `<span class="ingredient-tag">${i}</span>`).join('')}
        </div>
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.like-btn[data-tipo="receta"]').forEach(btn => {
    btn.addEventListener('click', () => toggleLike('receta', btn.dataset.id, btn));
  });
}

// ── FORO ───────────────────────────────────────
async function initForo() {
  const grid = document.getElementById('foro-grid');
  if (!grid) return;

  const user = getSession();
  grid.innerHTML = '<p class="foro-loading">Cargando posts...</p>';

  try {
    const url = user
      ? `${API_URL}/foro/posts?user_id=${encodeURIComponent(user.id)}`
      : `${API_URL}/foro/posts`;

    const res = await fetch(url);
    const data = await res.json();

    if (!Array.isArray(data) || !data.length) {
      grid.innerHTML = '<p class="foro-empty">No hay publicaciones aún. ¡Sé el primero!</p>';
      return;
    }

    grid.innerHTML = data.map(post => {
      const isLiked = !!post.liked;
      const autor = post.users?.username || 'Anónimo';
      const avatarSrc = post.users?.foto_url;
      const fecha = new Date(post.created_at).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      return `
      <article class="foro-card" data-id="${post.id}">
        <header class="foro-card__header">
          <div class="foro-card__avatar perfil-link" data-user-id="${post.user_id}" style="cursor:pointer;overflow:hidden;">
            ${avatarSrc
              ? `<img src="${avatarSrc}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />`
              : autor.charAt(0).toUpperCase()
            }
          </div>
          <div>
            <p class="foro-card__autor perfil-link" data-user-id="${post.user_id}" style="cursor:pointer">${autor}</p>
            <time class="foro-card__fecha">${fecha}</time>
          </div>
          ${post.categoria ? `<span class="blog-card__tag foro-card__tag">${post.categoria}</span>` : ''}
        </header>

        <h3 class="foro-card__titulo">${post.titulo}</h3>
        <p class="foro-card__contenido">${post.contenido}</p>
        ${post.imagen_url ? `<img src="${post.imagen_url}" alt="Imagen del post" class="foro-card__imagen" loading="lazy" />` : ''}

        <footer class="foro-card__footer">
          <button
            class="like-btn ${isLiked ? 'is-liked' : ''}"
            aria-label="Me gusta este post"
            aria-pressed="${isLiked}"
            data-tipo="post"
            data-id="${post.id}"
          >
            <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span class="like-count">${post.likes_count ?? 0}</span>
          </button>

          <button class="btn btn--ghost btn--sm comentarios-toggle" data-id="${post.id}">
            💬 Comentarios
          </button>

          ${user && String(user.id) === String(post.user_id) ? `
            <button class="btn btn--ghost btn--sm eliminar-post" data-id="${post.id}" style="color:#d04040;margin-left:auto">
              🗑 Eliminar
            </button>` : ''}
        </footer>

        <div class="foro-comentarios" id="comentarios-${post.id}" hidden>
          <div class="foro-comentarios__lista" id="lista-comentarios-${post.id}"></div>
          ${user ? `
            <div class="foro-comentarios__form">
              <textarea id="input-comentario-${post.id}" placeholder="Escribe un comentario..." rows="2"></textarea>
              <button class="btn btn--primary btn--sm enviar-comentario" data-id="${post.id}">Enviar</button>
            </div>
          ` : `<p class="foro-login-hint"><a href="#" data-auth="login">Inicia sesión</a> para comentar.</p>`}
        </div>
      </article>`;
    }).join('');

    grid.querySelectorAll('.like-btn[data-tipo="post"]').forEach(btn => {
      btn.addEventListener('click', () => toggleLike('post', btn.dataset.id, btn));
    });

    grid.querySelectorAll('.comentarios-toggle').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const container = document.getElementById(`comentarios-${id}`);
        const lista = document.getElementById(`lista-comentarios-${id}`);
        const hidden = container.hasAttribute('hidden');

        if (hidden) {
          container.removeAttribute('hidden');
          lista.innerHTML = '<p class="cargando-comentarios">Cargando...</p>';
          try {
            const res = await fetch(`${API_URL}/foro/posts/${id}/comentarios`);
            const data = await res.json();
            lista.innerHTML = data.length
              ? data.map(c => `
                <div class="comentario">
                  <strong>${c.users?.username || 'Anónimo'}</strong>
                  <p>${c.contenido}</p>
                </div>`).join('')
              : '<p class="sin-comentarios">Sé el primero en comentar.</p>';
          } catch {
            lista.innerHTML = '<p class="sin-comentarios">Error al cargar comentarios.</p>';
          }
        } else {
          container.setAttribute('hidden', '');
        }
      });
    });

    grid.querySelectorAll('.enviar-comentario').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const input = document.getElementById(`input-comentario-${id}`);
        const lista = document.getElementById(`lista-comentarios-${id}`);
        const texto = input.value.trim();
        if (!texto || !user) return;

        btn.disabled = true;
        btn.textContent = 'Enviando...';
        try {
          const res = await fetch(`${API_URL}/foro/posts/${id}/comentarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, contenido: texto })
          });

          if (res.ok) {
            input.value = '';
            const div = document.createElement('div');
            div.className = 'comentario';
            div.innerHTML = `<strong>${user.username}</strong><p>${texto}</p>`;
            lista.querySelector('.sin-comentarios')?.remove();
            lista.appendChild(div);
          }
        } finally {
          btn.disabled = false;
          btn.textContent = 'Enviar';
        }
      });
    });

    grid.querySelectorAll('.eliminar-post').forEach(btn => {
      let confirmando = false;

      btn.addEventListener('click', async () => {
        if (!confirmando) {
          confirmando = true;
          btn.textContent = '¿Seguro? (confirmar)';
          btn.style.background = '#d04040';
          btn.style.color = '#fff';

          setTimeout(() => {
            if (confirmando) {
              confirmando = false;
              btn.textContent = '🗑 Eliminar';
              btn.style.background = '';
              btn.style.color = '#d04040';
            }
          }, 3000);
          return;
        }

        const id = btn.dataset.id;
        try {
          const res = await fetch(`${API_URL}/foro/posts/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id })
          });
          if (res.ok) btn.closest('.foro-card')?.remove();
        } catch {
          alert('Error al eliminar.');
        }
      });
    });

    grid.querySelectorAll('.perfil-link').forEach(el => {
      el.addEventListener('click', () => {
        const uid = el.dataset.userId;
        if (!uid) return;

        document.querySelectorAll('.page').forEach(p => p.setAttribute('hidden', ''));
        document.getElementById('page-perfil')?.removeAttribute('hidden');
        document.querySelectorAll('[data-page]').forEach(l => {
          l.classList.toggle('is-active', l.dataset.page === 'perfil');
        });

        loadPerfil(uid);
      });
    });

    grid.querySelectorAll('[data-auth]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(item.dataset.auth);
      });
    });

  } catch (err) {
    console.error('initForo error:', err);
    grid.innerHTML = '<p class="foro-empty">Error al cargar el foro. ¿Está corriendo el servidor?</p>';
  }
}

async function initNuevoPost() {
  const form = document.getElementById('nuevo-post-form');
  if (!form) return;

  if (form.dataset.bound === 'true') return;
  form.dataset.bound = 'true';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = getSession();
    if (!user) { openModal('login'); return; }

    const titulo    = document.getElementById('post-titulo')?.value.trim();
    const contenido = document.getElementById('post-contenido')?.value.trim();
    const categoria = document.getElementById('post-categoria')?.value || '';

    if (!titulo || !contenido) return;

    const btn = form.querySelector('button[type="submit"]');
    if (btn.disabled) return;

    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = 'Publicando...';

    try {
      let imagen_url = '';
      const fileInput = document.getElementById('post-imagen-file');
      if (fileInput?.files[0]) {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('bucket', 'posts');
        const upRes  = await fetch('http://localhost:3000/api/upload', { method: 'POST', body: formData });
        const upData = await upRes.json();
        imagen_url   = upData.url || '';
      }

      const res  = await fetch(`${API_URL}/foro/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, titulo, contenido, categoria, imagen_url })
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) { alert(data?.error || 'No se pudo publicar el post.'); return; }

      form.reset();
      await initForo();
    } catch {
      alert('Error al conectar con el servidor.');
    } finally {
      btn.disabled    = false;
      btn.textContent = originalText;
    }
  });
}
// ── PERFIL ─────────────────────────────────────
async function loadPerfil(userId) {
  const user = getSession();
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('perfil-nombre', 'Cargando...');
  setEl('perfil-email',  '');
  setEl('perfil-bio',    '');

  const likesPostsEl   = document.getElementById('perfil-likes-posts');
  const likesRecetasEl = document.getElementById('perfil-likes-recetas');
  const misPostsEl     = document.getElementById('perfil-mis-posts');

  if (likesPostsEl)   likesPostsEl.innerHTML   = '<p class="perfil-cargando">Cargando...</p>';
  if (likesRecetasEl) likesRecetasEl.innerHTML = '<p class="perfil-cargando">Cargando...</p>';
  if (misPostsEl)     misPostsEl.innerHTML     = '<p class="perfil-cargando">Cargando...</p>';

  try {
    const res  = await fetch(`${API_URL}/perfil/${userId}`);
    if (!res.ok) throw new Error('No encontrado');
    const data = await res.json();
    console.log('perfil data:', data);
    console.log('likes_posts:', data.likes_posts);
    console.log('likes_recetas:', data.likes_recetas);
    const avatarEl = document.getElementById('perfil-avatar');
    const fotoEl   = document.getElementById('perfil-foto');
    if (data.foto_url && fotoEl) {
      fotoEl.src          = data.foto_url;
      fotoEl.style.display = '';
      if (avatarEl) avatarEl.style.display = 'none';
    } else {
      if (fotoEl)    fotoEl.style.display    = 'none';
      if (avatarEl) { avatarEl.style.display = ''; avatarEl.textContent = data.username?.charAt(0).toUpperCase() || '?'; }
    }

    
    if (avatarEl) avatarEl.textContent = data.username?.charAt(0).toUpperCase() || '?';
    setEl('perfil-nombre', data.username || '—');
    setEl('perfil-email',  data.email    || '—');
    setEl('perfil-bio',    data.bio      || 'Sin bio aún.');

    if (misPostsEl) {
      misPostsEl.innerHTML = (data.posts || []).length
          ? data.posts.map(p => `
              <div class="perfil-item" data-post-id="${p.id}" style="cursor:pointer">
                <div class="perfil-item__info">
                  ${p.categoria ? `<span class="blog-card__tag">${p.categoria}</span>` : ''}
                  <p class="perfil-item__title">${p.titulo}</p>
                  <time class="perfil-item__date">${new Date(p.created_at).toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric'})}</time>
                </div>
              </div>`).join('')
        : '<p class="perfil-empty">Aún no has publicado nada en el foro.</p>';
    }

    if (likesPostsEl) {
      likesPostsEl.innerHTML = (data.likes_posts || []).length
        ? data.likes_posts.map(p => `
            <div class="perfil-item perfil-post-like" data-post-id="${p.id}" style="cursor:pointer">
              <div class="perfil-item__info">
                ${p?.categoria ? `<span class="blog-card__tag">${p.categoria}</span>` : ''}
                <p class="perfil-item__title">${p?.titulo || '—'}</p>
              </div>
              <svg class="perfil-item__heart" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
          `).join('')
        : '<p class="perfil-empty">Aún no has dado like a ningún post.</p>';
    }
    if (likesPostsEl) {
      likesPostsEl.querySelectorAll('[data-post-id]').forEach(el => {
        el.addEventListener('click', async () => {
          const postId = el.dataset.postId;

          document.querySelectorAll('.page').forEach(p => p.setAttribute('hidden', ''));
          document.getElementById('page-blog')?.removeAttribute('hidden');

          document.querySelectorAll('[data-page]').forEach(l => {
            l.classList.toggle('is-active', l.dataset.page === 'blog');
          });

          window.scrollTo({ top: 0, behavior: 'smooth' });

          await initForo();
          await initNuevoPost();

          setTimeout(() => {
            const card = document.querySelector(`.foro-card[data-id="${postId}"]`);
            if (card) {
              card.style.outline = '2px solid var(--green-400)';
              card.scrollIntoView({ behavior: 'smooth', block: 'center' });
              setTimeout(() => {
                card.style.outline = '';
              }, 2000);
            }
          }, 300);
        });
      });
    }
    // REEMPLAZA el bloque de likesRecetasEl en loadPerfil con esto:
// ─────────────────────────────────────────────
    if (likesRecetasEl) {
      const likedIds     = (data.likes_recetas || []);
      const likedRecetas = recetas.filter(r => likedIds.includes(r.id));

      likesRecetasEl.innerHTML = likedRecetas.length
        ? likedRecetas.map(r => `
            <div class="perfil-item perfil-item--receta" data-receta-id="${r.id}" style="cursor:pointer">
              <div class="perfil-item__img" style="background:var(--green-50);display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:8px;width:56px;height:56px;flex-shrink:0">
                ${r.foto
                  ? `<img src="${r.foto}" alt="${r.titulo}" style="width:100%;height:100%;object-fit:cover" loading="lazy" onerror="this.parentElement.innerHTML='🍽️'">`
                  : '🍽️'}
              </div>
              <div class="perfil-item__info">
                ${r.categoria ? `<span class="blog-card__tag">${r.categoria}</span>` : ''}
                <p class="perfil-item__title">${r.titulo}</p>
              </div>
              <svg class="perfil-item__heart" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>`).join('')
        : '<p class="perfil-empty">Aún no has dado like a ninguna receta.</p>';

      likesRecetasEl.querySelectorAll('[data-receta-id]').forEach(el => {
        el.addEventListener('click', () => {
          const rid = el.dataset.recetaId;
          document.querySelectorAll('.page').forEach(p => p.setAttribute('hidden', ''));
          document.getElementById('page-recetas').removeAttribute('hidden');
          document.querySelectorAll('[data-page]').forEach(l => l.classList.toggle('is-active', l.dataset.page === 'recetas'));
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => {
            const card = document.querySelector(`.recipe-card[data-id="${rid}"]`);
            if (card) {
              card.style.outline = '2px solid var(--green-400)';
              card.scrollIntoView({ behavior: 'smooth', block: 'center' });
              setTimeout(() => card.style.outline = '', 2000);
            }
          }, 300);
        });
      });
    }
    const editBioBtn = document.getElementById('perfil-edit-bio-btn');
    if (editBioBtn && user && user.id == userId) {
      editBioBtn.hidden = false;
      editBioBtn.addEventListener('click', () => abrirEditBio(data));
    }

    // ── FOTO DE PERFIL ── AGREGA ESTO AQUÍ ──
    const subirFotoBtn  = document.getElementById('perfil-subir-foto-btn');
    const fotoFileInput = document.getElementById('foto-file-input');
    if (subirFotoBtn && user && user.id == userId) {
      subirFotoBtn.hidden = false;
      subirFotoBtn.onclick = () => fotoFileInput.click();
      fotoFileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'avatars');
        subirFotoBtn.textContent = 'Subiendo...';
        subirFotoBtn.disabled    = true;
        try {
          const res  = await fetch('http://localhost:3000/api/upload', { method: 'POST', body: formData });
          const upData = await res.json();
          if (upData.url) {
            await fetch(`${API_URL}/perfil/${user.id}`, {
              method: 'PUT', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ foto_url: upData.url })
            });
            if (fotoEl) { fotoEl.src = upData.url; fotoEl.style.display = ''; }
            if (avatarEl) avatarEl.style.display = 'none';
          }
        } finally {
          subirFotoBtn.textContent = '📷 Cambiar foto';
          subirFotoBtn.disabled    = false;
        }
      };
    }
    // Clicks en posts del perfil → ir al foro
    document.querySelectorAll('[data-post-id]').forEach(el => {
      el.addEventListener('click', async () => {
        const postId = el.dataset.postId;
        document.querySelectorAll('.page').forEach(p => p.setAttribute('hidden', ''));
        document.getElementById('page-blog').removeAttribute('hidden');
        document.querySelectorAll('[data-page]').forEach(l => l.classList.toggle('is-active', l.dataset.page === 'blog'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        await initForo();
        await initNuevoPost();
        const card = document.querySelector(`.foro-card[data-id="${postId}"]`);
        if (card) {
          card.style.outline = '2px solid var(--green-400)';
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => card.style.outline = '', 2000);
        }
      });
    });

  } catch {
    setEl('perfil-nombre', 'Error al cargar el perfil');
  }
}

function abrirEditBio(data) {
  const bioEl = document.getElementById('perfil-bio');
  if (!bioEl) return;

  const textoActual = bioEl.textContent === 'Sin bio aún.' ? '' : bioEl.textContent;
  bioEl.innerHTML = `
    <textarea id="bio-edit-input" style="width:100%;resize:vertical;min-height:80px;">${textoActual}</textarea>
    <div style="margin-top:0.5rem;display:flex;gap:0.5rem;">
      <button class="btn btn--primary btn--sm" id="bio-save-btn">Guardar</button>
      <button class="btn btn--ghost btn--sm" id="bio-cancel-btn">Cancelar</button>
    </div>`;

  document.getElementById('bio-cancel-btn').addEventListener('click', () => {
    bioEl.textContent = textoActual || 'Sin bio aún.';
  });

  document.getElementById('bio-save-btn').addEventListener('click', async () => {
    const nuevaBio = document.getElementById('bio-edit-input').value.trim();
    const user     = getSession();
    try {
      const res = await fetch(`${API_URL}/perfil/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: nuevaBio })
      });
      if (res.ok) bioEl.textContent = nuevaBio || 'Sin bio aún.';
    } catch {
      bioEl.textContent = textoActual || 'Sin bio aún.';
    }
  });
}

// ── TABS DEL PERFIL ────────────────────────────
document.addEventListener('click', (e) => {
  const tab = e.target.closest('.perfil-tab');
  if (!tab) return;

  const target    = tab.dataset.target;
  const allTabs   = document.querySelectorAll('.perfil-tab');
  const allPanels = document.querySelectorAll('.perfil-panel');

  allTabs.forEach(t => t.classList.remove('is-active'));
  allPanels.forEach(p => { p.classList.remove('is-active'); p.hidden = true; });

  tab.classList.add('is-active');
  const panel = document.getElementById(target);
  if (panel) { panel.hidden = false; panel.classList.add('is-active'); }
});

// ── INIT ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const session = getSession();

  initNavigation();
  initAuthDropdown();
  initAuthModal();
  initAuthModalTriggers();
  initHamburger();
  initNavbarScroll();
  initBuscador();
  initRecetas();
  initForo();
  initNuevoPost();

  if (session) updateNavbarAuth(session);
});