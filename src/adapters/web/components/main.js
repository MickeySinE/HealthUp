const API_URL = 'http://localhost:3000/api';

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

function initNavigation() {
  const pages   = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('[data-page]');

  function showPage(pageId) {
    pages.forEach(p => {
      if (p.id === `page-${pageId}`) {
        p.removeAttribute('hidden');
      } else {
        p.setAttribute('hidden', '');
      }
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

  // Mostrar inicio por defecto
  showPage('inicio');
}

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

  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  overlay.querySelectorAll('[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(link.dataset.tab);
    });
  });

  closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // ── LOGIN ──────────────────────────────────────
  document.getElementById('loginSubmit').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim();
    const pwd   = document.getElementById('login-password').value;

    if (!email) return showError('login-error', 'Ingresa tu correo electrónico.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('login-error', 'El correo no es válido.');
    if (!pwd) return showError('login-error', 'Ingresa tu contraseña.');

    setLoading('loginSubmit', true);

    try {
      const res  = await fetch(`${API_URL}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, pwd })
      });

      const data = await res.json();

      if (!res.ok) {
        showError('login-error', data.error || 'Error al iniciar sesión.');
        return;
      }

      saveSession(data.user);
      closeModal();
      updateNavbarAuth(data.user);

    } catch (err) {
      showError('login-error', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading('loginSubmit', false);
    }
  });

  // ── REGISTRO ───────────────────────────────────
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
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, email, pwd })
      });

      const data = await res.json();

      if (!res.ok) {
        showError('register-error', data.error || 'Error al crear la cuenta.');
        return;
      }

      switchTab('login');

    } catch (err) {
      showError('register-error', 'No se pudo conectar con el servidor.');
    } finally {
      setLoading('registerSubmit', false);
    }
  });
}

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

function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 10);
  }, { passive: true });
}

const session = getSession();

initNavigation();
initAuthDropdown();
initAuthModal();
initAuthModalTriggers();
initHamburger();
initNavbarScroll();

if (session) updateNavbarAuth(session);