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

  // Runs `fn` once it's safe to measure layout for a scroll target — either
  // right away (desktop, or the mobile menu wasn't open), or after the
  // mobile menu's own collapse transition genuinely finishes. Without this,
  // scrolling right after closeMobileNav() measures a layout that's still
  // mid-collapse, undershooting badly once the transition finishes on its
  // own a moment later. `wasMobileNavOpen` must be captured *before*
  // closeMobileNav() runs, since that call removes the class this would
  // otherwise be checking for.
  function afterLayoutSettles(wasMobileNavOpen, fn) {
    if (!wasMobileNavOpen) {
      requestAnimationFrame(fn);
      return;
    }
    let done = false;
    const finish = () => { if (done) return; done = true; fn(); };
    nav.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 300); // fallback in case transitionend doesn't fire for any reason
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

  function goToWorkspace(params, includeToolHash) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    // The #tool suffix is right for a generic "land on the workspace"
    // navigation, but actively fights a more specific scroll target (e.g.
    // recipes/history/presets each scroll to their own panel once loaded)
    // — the browser's own native hash-scroll can otherwise land after that
    // more specific scroll and silently override it back to #tool.
    const suffix = includeToolHash === false ? '' : '#tool';
    window.location.href = toWorkspace + qs + suffix;
  }

  // Wire every dropdown action to the existing implementation — never a
  // duplicate. On a workbench page, act in place; otherwise navigate to the
  // workspace and let its own loader (in app.js) pick up the param.
  document.querySelectorAll('[data-nav-action]').forEach((el) => {
    el.addEventListener('click', (evt) => {
      const action = el.dataset.navAction;
      const wasMobileNavOpen = nav.classList.contains('nav-open');
      closeAllGroups();
      closeMobileNav();

      if (action === 'group') {
        const group = el.dataset.group;
        if (hasWorkbench && window.setGroup) {
          window.setGroup(group);
          // Switching the mode group only updates state — if the user is
          // scrolled elsewhere on the page (e.g. down at #api), nothing
          // visibly happens unless we also bring the tool back into view.
          // Targets .workbench specifically (not the #tool hero further
          // up) since the user is already on this page and wants to see
          // the tool they just picked, not scroll back through the hero
          // copy again first. afterLayoutSettles accounts for both: mode
          // groups that change the workbench's height (dual-input Compare,
          // Schema's extra options row), and — on mobile — the menu's own
          // collapse transition, which otherwise leaves this measuring a
          // layout that's still mid-animation.
          afterLayoutSettles(wasMobileNavOpen, () => {
            // Clearing the hash first stops the page's own delayed
            // scroll-to-hash re-triggers (queued whenever the page loaded
            // with a #fragment, to defend against mobile Safari's address
            // bar and font-loading shifts) from firing later and dragging
            // the page back to wherever that old hash pointed — that
            // function explicitly no-ops once location.hash is empty.
            if (location.hash) history.replaceState(null, '', location.pathname + location.search);
            document.querySelector('.workbench')?.scrollIntoView({ behavior: 'instant', block: 'start' });
          });
        } else {
          goToWorkspace({ group: group });
        }
      } else if (action === 'recipes') {
        // Points at Recipe Builder 2.0 (the fuller visual workflow builder,
        // the same one showcased on the Demo page's Automate card) rather
        // than the older, simpler Recipe panel — that panel is still
        // reachable from its own button in the workbench, just no longer
        // this menu item's target.
        if (hasWorkbench) {
          evt.stopPropagation();
          if (!document.getElementById('recipeBuilder2Panel')?.classList.contains('show')) {
            document.getElementById('recipeBuilder2ToggleBtn')?.click();
          }
          document.getElementById('recipeBuilder2Panel')?.scrollIntoView({ behavior: 'instant', block: 'start' });
        } else {
          goToWorkspace({ open: 'recipes' }, false);
        }
      } else if (action === 'history') {
        if (hasWorkbench) {
          evt.stopPropagation();
          if (!document.getElementById('historyPanel')?.classList.contains('show')) {
            document.getElementById('historyBtn')?.click();
          }
        } else {
          goToWorkspace({ open: 'history' });
        }
      } else if (action === 'presets') {
        if (hasWorkbench) {
          evt.stopPropagation();
          if (!document.getElementById('presetsPanel')?.classList.contains('show')) {
            document.getElementById('presetsBtn')?.click();
          }
        } else {
          goToWorkspace({ open: 'presets' });
        }
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
