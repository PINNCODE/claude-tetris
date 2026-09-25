'use strict';

// === PLUGINS ===

// === BEGIN THEME === */
(function() {
  const STORAGE_KEY = 'tetris.theme.v1';
  const LIGHT = 'light';
  const DARK = 'dark';

  // This plugin only toggles a class on <body> and reads/writes localStorage —
  // it never touches game.js globals, so it's unaffected by plugin load order.

  function loadStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) === LIGHT ? LIGHT : DARK;
    } catch (e) {
      return DARK;
    }
  }

  function saveStoredTheme(theme) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* non-fatal */ }
  }

  function applyTheme(theme, toggleBtn) {
    document.body.classList.toggle('light-mode', theme === LIGHT);
    const isLight = theme === LIGHT;
    toggleBtn.setAttribute('aria-pressed', String(isLight));
    toggleBtn.setAttribute('aria-label', isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
    toggleBtn.querySelector('.theme-toggle-label').textContent = isLight ? 'LIGHT' : 'DARK';
  }

  function buildToggle() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'theme-toggle';
    btn.className = 'theme-toggle';

    const track = document.createElement('span');
    track.className = 'theme-toggle-track';
    const thumb = document.createElement('span');
    thumb.className = 'theme-toggle-thumb';
    track.appendChild(thumb);

    const label = document.createElement('span');
    label.className = 'theme-toggle-label';

    btn.appendChild(track);
    btn.appendChild(label);
    document.body.appendChild(btn);
    return btn;
  }

  function initTheme() {
    const toggleBtn = buildToggle();
    let theme = loadStoredTheme();
    applyTheme(theme, toggleBtn);
    toggleBtn.addEventListener('click', () => {
      theme = theme === LIGHT ? DARK : LIGHT;
      applyTheme(theme, toggleBtn);
      saveStoredTheme(theme);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
})();
// === END THEME === */
