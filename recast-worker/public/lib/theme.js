/*!
 * Recast theme toggle — light/dark, persisted in localStorage, applied
 * before first paint via an inline script in <head> to avoid a flash of
 * the wrong theme. This file wires up the actual toggle button; the
 * early-apply snippet lives inline in each page's <head>.
 */
(function () {
  'use strict';
  const KEY = 'recast_theme';

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#F4F7FA' : '#0E2338');
    const use = document.getElementById('themeIconUse');
    if (use) use.setAttribute('href', theme === 'light' ? '#ico-moon' : '#ico-sun');
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.title = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';
  }

  function toggleTheme() {
    const next = currentTheme() === 'light' ? 'dark' : 'light';
    try { localStorage.setItem(KEY, next); } catch (e) { /* private browsing — theme just won't persist */ }
    applyTheme(next);
    if (window.track) window.track('theme_toggle', { theme: next });
  }

  applyTheme(currentTheme()); // sync icon/meta state with whatever the inline early-apply snippet already set
  document.getElementById('themeToggleBtn')?.addEventListener('click', toggleTheme);
})();
