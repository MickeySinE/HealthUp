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
          <a href="#" class="auth-dropdown__item auth-dropdown__item--primary" id="logoutBtn" role="menuitem">
            <span class="auth-dropdown__item-icon">→</span>
            Cerrar sesión
          </a>
        </div>
      </div>
    `;
    initAuthDropdown();
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
      switchTab('login');
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

  let ultimaBusqueda = 0;
  let timeout = null;

  async function buscar(query) {
    if (!query) return;
    const idBusqueda = ++ultimaBusqueda;

    // Navegar a page-search
    document.querySelectorAll('.page').forEach(p => p.setAttribute('hidden', ''));
    const pageSearch = document.getElementById('page-search');
    if (pageSearch) pageSearch.removeAttribute('hidden');

    // Actualizar título
    const title   = document.getElementById('search-title');
    const sub     = document.getElementById('search-sub');
    const loading = document.getElementById('search-state-loading');
    const empty   = document.getElementById('search-state-empty');
    const grid    = document.getElementById('searchResults');

    if (title) title.textContent = `"${query}"`;
    if (sub) sub.textContent = 'Información nutricional por cada 100g de porción.';
    if (loading) loading.hidden = false;
    if (empty) empty.hidden = true;
    if (grid) grid.innerHTML = '';

    try {
      const res  = await fetch(`${API_URL}/buscar?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (idBusqueda !== ultimaBusqueda) return;
      if (loading) loading.hidden = true;

      if (!data.length) {
        if (empty) empty.hidden = false;
        return;
      }

      if (grid) {
        grid.innerHTML = data.map(a => `
          <div class="nutrition-card">
            <div class="nutrition-card__header">
              <p class="nutrition-card__name">${a.nombre}</p>
              <p class="nutrition-card__portion">Por cada 100g</p>
              <div class="nutrition-card__calories">
                <span class="nutrition-card__calories-num">${a.calorias ?? '—'}</span>
                <span class="nutrition-card__calories-label">kcal</span>
              </div>
            </div>
            <div class="nutrition-card__macros">
              <div class="nutrition-card__macro">
                <span class="nutrition-card__macro-val">${a.proteinas ?? '—'}g</span>
                <span class="nutrition-card__macro-label">Proteína</span>
              </div>
              <div class="nutrition-card__macro">
                <span class="nutrition-card__macro-val">${a.carbohidratos ?? '—'}g</span>
                <span class="nutrition-card__macro-label">Carbos</span>
              </div>
              <div class="nutrition-card__macro">
                <span class="nutrition-card__macro-val">${a.grasas ?? '—'}g</span>
                <span class="nutrition-card__macro-label">Grasas</span>
              </div>
            </div>
          </div>
        `).join('');
      }

    } catch {
      if (idBusqueda !== ultimaBusqueda) return;
      if (loading) loading.hidden = true;
      if (empty) empty.hidden = false;
      if (sub) sub.textContent = 'Error al conectar con el servidor. ¿Está corriendo?';
    }
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim().length >= 2) buscar(input.value.trim());
  });

  input.addEventListener('input', () => {
    clearTimeout(timeout);
    const q = input.value.trim();
    if (q.length >= 3) timeout = setTimeout(() => buscar(q), 600);
  });
}

// ── RECETAS ────────────────────────────────────
const recetas = [
  { titulo: "Avena con plátano y miel", categoria: "Desayuno", tiempo: "10 min", calorias: 320, descripcion: "Avena cremosa con rodajas de plátano, miel y canela. Fácil, nutritiva y lista en minutos.", ingredientes: ["Avena","Plátano","Miel","Leche","Canela"], foto: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&q=80" },
  { titulo: "Huevos revueltos con espinaca", categoria: "Desayuno", tiempo: "10 min", calorias: 210, descripcion: "Huevos revueltos suaves con espinacas salteadas y un toque de sal de ajo.", ingredientes: ["Huevos","Espinaca","Ajo","Aceite de oliva","Sal"], foto: "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&q=80" },
  { titulo: "Tostadas con aguacate", categoria: "Desayuno", tiempo: "5 min", calorias: 280, descripcion: "Pan integral tostado con aguacate machacado, limón y chile en polvo.", ingredientes: ["Pan integral","Aguacate","Limón","Chile en polvo","Sal"], foto: "https://images.unsplash.com/photo-1603046891744-1f057a4e1b2d?w=400&q=80" },
  { titulo: "Ensalada de atún", categoria: "Comida", tiempo: "10 min", calorias: 250, descripcion: "Atún en agua con lechuga, jitomate, pepino y aderezo de limón. Fresca y alta en proteína.", ingredientes: ["Atún en agua","Lechuga","Jitomate","Pepino","Limón"], foto: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80" },
  { titulo: "Pechuga de pollo a la plancha", categoria: "Comida", tiempo: "20 min", calorias: 300, descripcion: "Pechuga marinada con ajo, limón y hierbas, cocinada a la plancha.", ingredientes: ["Pechuga de pollo","Ajo","Limón","Orégano","Aceite de oliva"], foto: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&q=80" },
  { titulo: "Arroz con verduras", categoria: "Comida", tiempo: "25 min", calorias: 350, descripcion: "Arroz integral salteado con zanahoria, chícharo, elote y salsa de soya.", ingredientes: ["Arroz integral","Zanahoria","Chícharo","Elote","Salsa de soya"], foto: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80" },
  { titulo: "Sopa de lentejas", categoria: "Comida", tiempo: "30 min", calorias: 290, descripcion: "Sopa espesa de lentejas con jitomate, cebolla y comino. Reconfortante y llena de fibra.", ingredientes: ["Lentejas","Jitomate","Cebolla","Ajo","Comino"], foto: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80" },
  { titulo: "Quesadillas de frijol", categoria: "Comida", tiempo: "15 min", calorias: 380, descripcion: "Tortillas de maíz con frijoles refritos y queso gratinado. Sencillas y sabrosas.", ingredientes: ["Tortillas de maíz","Frijoles refritos","Queso","Sal"], foto: "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400&q=80" },
  { titulo: "Pasta con jitomate y albahaca", categoria: "Cena", tiempo: "20 min", calorias: 400, descripcion: "Pasta con salsa de jitomate fresco, ajo y albahaca. Simple, clásica e irresistible.", ingredientes: ["Pasta","Jitomate","Ajo","Albahaca","Aceite de oliva"], foto: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=80" },
  { titulo: "Crema de zanahoria", categoria: "Cena", tiempo: "25 min", calorias: 180, descripcion: "Crema suave de zanahoria con jengibre y caldo de verduras. Ligera y reconfortante.", ingredientes: ["Zanahoria","Cebolla","Jengibre","Caldo de verduras","Aceite"], foto: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&q=80" },
  { titulo: "Tacos de huevo con nopales", categoria: "Cena", tiempo: "15 min", calorias: 260, descripcion: "Huevo revuelto con nopales en cubos y tortillas de maíz. Típico y nutritivo.", ingredientes: ["Huevos","Nopales","Cebolla","Chile serrano","Tortillas"], foto: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80" },
  { titulo: "Yogur con granola y fresas", categoria: "Snack", tiempo: "5 min", calorias: 200, descripcion: "Yogur griego con granola crujiente y fresas frescas. Perfecto entre comidas.", ingredientes: ["Yogur griego","Granola","Fresas","Miel"], foto: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80" },
  { titulo: "Manzana con mantequilla de cacahuate", categoria: "Snack", tiempo: "3 min", calorias: 190, descripcion: "Rodajas de manzana con mantequilla de cacahuate natural. Dulce, crujiente y satisfactorio.", ingredientes: ["Manzana","Mantequilla de cacahuate"], foto: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80" },
  { titulo: "Licuado verde", categoria: "Snack", tiempo: "5 min", calorias: 150, descripcion: "Espinaca, pepino, piña y agua de coco licuados. Refrescante y lleno de nutrientes.", ingredientes: ["Espinaca","Pepino","Piña","Agua de coco","Limón"], foto: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&q=80" },
  { titulo: "Bowl de frutas con chía", categoria: "Snack", tiempo: "5 min", calorias: 170, descripcion: "Frutas de temporada con semillas de chía y jugo de naranja. Antioxidante y energizante.", ingredientes: ["Frutas de temporada","Semillas de chía","Jugo de naranja","Miel"], foto: "https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?w=400&q=80" }
];

function initRecetas() {
  const grid = document.getElementById('recetas-grid');
  if (!grid) return;

  grid.innerHTML = recetas.map(r => `
    <div class="recipe-card">
      <div class="recipe-card__img">
        <img src="${r.foto}" alt="${r.titulo}" loading="lazy" onerror="this.parentElement.innerHTML='🍽️'" />
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
          ${r.ingredientes.map(i => `<span class="ingredient-tag">${i}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

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

  if (session) updateNavbarAuth(session);
});