/* =============================================
   HealthUP — main.js
   ============================================= */

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

// ── AUTH MODAL ─────────────────────────────────
function initAuthModal() {
  const overlay   = document.getElementById('authModal');
  const closeBtn  = overlay.querySelector('.modal__close');
  const tabs      = overlay.querySelectorAll('.modal__tab');
  const panels    = overlay.querySelectorAll('.modal__panel');

  function openModal(tab = 'login') {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', false);
    document.body.style.overflow = 'hidden';
    switchTab(tab);
  }

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

  // Abrir modal desde dropdown
  document.querySelectorAll('[data-auth]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.dataset.auth;
      document.querySelector('.auth-dropdown__menu').classList.remove('is-open');
      document.querySelector('.auth-dropdown__trigger').setAttribute('aria-expanded', false);
      openModal(tab);
    });
  });

  // Tabs dentro del modal
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Links de switch dentro de los forms
  overlay.querySelectorAll('[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(link.dataset.tab);
    });
  });

  // Cerrar con X
  closeBtn.addEventListener('click', closeModal);

  // Cerrar clickeando el overlay
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // ── VALIDACIÓN LOGIN ──
  document.getElementById('loginSubmit').addEventListener('click', () => {
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email) return showError('login-error', 'Ingresa tu correo electrónico.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('login-error', 'El correo no es válido.');
    if (!password) return showError('login-error', 'Ingresa tu contraseña.');

    // TODO: conectar con backend/auth
    console.log('Login:', { email, password });
  });

  // ── VALIDACIÓN REGISTRO ──
  document.getElementById('registerSubmit').addEventListener('click', () => {
    const username = document.getElementById('reg-username').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm  = document.getElementById('reg-confirm').value;

    if (!username) return showError('register-error', 'Elige un nombre de usuario.');
    if (username.length < 3) return showError('register-error', 'El usuario debe tener al menos 3 caracteres.');
    if (!email) return showError('register-error', 'Ingresa tu correo electrónico.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('register-error', 'El correo no es válido.');
    if (!password) return showError('register-error', 'Elige una contraseña.');
    if (password.length < 6) return showError('register-error', 'La contraseña debe tener al menos 6 caracteres.');
    if (password !== confirm) return showError('register-error', 'Las contraseñas no coinciden.');

    // TODO: conectar con backend/auth
    console.log('Registro:', { username, email, password });
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

// ── INIT ───────────────────────────────────────
initAuthDropdown();
initAuthModal();
initHamburger();
initNavbarScroll();