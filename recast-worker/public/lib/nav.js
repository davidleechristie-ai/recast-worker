/*!
 * Recast primary navigation (Work / Automate / Data).
 * Reuses existing functionality — setGroup(), the recipe/history/presets
 * panel toggles — rather than duplicating any of it. On pages without the
 * workbench (blog, how-to), actions instead navigate to the workspace with
 * a URL param the workbench reads on load (see the loader block below).
 */
(function () {
  'use strict';

  const nav = document.getElementById('primaryNav');
  const hamburger = document.getElementById('navHamburger');
  if (!nav) return;

  const hasWorkbench = !!document.getElementById('input') && !!document.querySelector('.mode-group-btn');
  // How deep this page sits relative to the site root, so cross-page nav
  // targets resolve correctly from /tools/, /blog/, /demo/, or /how-to/.
  const toWorkspace = document.querySelector('a.brand')?.getAttribute('href') || 'index.html';

  function closeAllGroups(except) {
    document.querySelectorAll('.nav-group.open').forEach((g) => {
      if (g !== except) {
        g.classList.remove('open');
        g.querySelector('.nav-group-btn')?.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function closeMobileNav() {
    nav.classList.remove('nav-open');
    hamburger?.setAttribute('aria-expanded', 'false');
    closeAllGroups();
  }

  // Dropdown toggle (desktop click, or mobile accordion within the open panel)
  document.querySelectorAll('.nav-group-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const group = btn.closest('.nav-group');
      const isOpen = group.classList.contains('open');
      closeAllGroups(isOpen ? null : group);
      group.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-group')) closeAllGroups();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeAllGroups(); closeMobileNav(); }
  });

  // Mobile hamburger
  hamburger?.addEventListener('click', () => {
    const opening = !nav.classList.contains('nav-open');
    nav.classList.toggle('nav-open', opening);
    hamburger.setAttribute('aria-expanded', String(opening));
    if (!opening) closeAllGroups();
  });

  function goToWorkspace(params) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    window.location.href = toWorkspace + qs + '#tool';
  }

  // Wire every dropdown action to the existing implementation — never a
  // duplicate. On a workbench page, act in place; otherwise navigate to the
  // workspace and let its own loader (in app.js) pick up the param.
  document.querySelectorAll('[data-nav-action]').forEach((el) => {
    el.addEventListener('click', (evt) => {
      const action = el.dataset.navAction;
      closeAllGroups();
      closeMobileNav();

      if (action === 'group') {
        const group = el.dataset.group;
        if (hasWorkbench && window.setGroup) window.setGroup(group);
        else goToWorkspace({ group: group });
      } else if (action === 'recipes') {
        if (hasWorkbench) { evt.stopPropagation(); document.getElementById('recipeToggleBtn')?.click(); }
        else goToWorkspace({ open: 'recipes' });
      } else if (action === 'history') {
        if (hasWorkbench) { evt.stopPropagation(); document.getElementById('historyBtn')?.click(); }
        else goToWorkspace({ open: 'history' });
      } else if (action === 'presets') {
        if (hasWorkbench) { evt.stopPropagation(); document.getElementById('presetsBtn')?.click(); }
        else goToWorkspace({ open: 'presets' });
      } else if (action === 'anchor') {
        const id = el.dataset.anchor;
        const target = document.getElementById(id);
        if (target) {
          history.pushState(null, '', '#' + id);
          target.scrollIntoView({ behavior: 'instant', block: 'start' });
        } else {
          goToWorkspace({});
        }
      }
    });
  });
})();
