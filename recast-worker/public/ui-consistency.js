(() => {
  function setButtonLabel(button, label) {
    if (!button) return;
    const textNode = [...button.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (textNode) textNode.textContent = label;
    else button.insertBefore(document.createTextNode(label), button.firstChild);
  }

  function normalizeBranding() {
    document.querySelectorAll('.site-header .brand').forEach(brand => {
      const text = brand.querySelector('span:last-child');
      if (text && text.textContent.trim().toLowerCase() === 'recast') text.textContent = 'Recast';
    });
    document.querySelectorAll('.uc-brand').forEach(brand => { brand.textContent = 'Recast'; });
    document.querySelectorAll('.titleblock .brand').forEach(brand => {
      [...brand.childNodes].forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().toUpperCase() === 'RECAST') node.textContent = 'Recast';
      });
    });
  }

  function normalizeUseCaseNav() {
    document.querySelectorAll('.uc-nav nav').forEach(nav => {
      nav.innerHTML = [
        ['Tools', '/tools/'],
        ['Workflows', '/app/#workflowBuilder'],
        ['Automation', '/automation/'],
        ['API', '/api/'],
        ['Guides', '/how-to/'],
        ['Pricing', '/#pricing']
      ].map(([label, href]) => `<a href="${href}">${label}</a>`).join('');
    });
  }

  function normalizeTechnicalNav() {
    document.querySelectorAll('.tb-nav').forEach(nav => {
      setButtonLabel(nav.querySelector('[data-nav-group="automate"] .nav-group-btn'), 'Automation');
      setButtonLabel(nav.querySelector('[data-nav-group="resources"] .nav-group-btn'), 'Guides');

      if (!nav.querySelector('[data-ui-consistency="workflows"]')) {
        const workflows = document.createElement('a');
        workflows.href = '/app/#workflowBuilder';
        workflows.className = 'nav-plain-link';
        workflows.dataset.uiConsistency = 'workflows';
        workflows.textContent = 'Workflows';
        const automation = nav.querySelector('[data-nav-group="automate"]');
        if (automation) nav.insertBefore(workflows, automation);
      }

      if (!nav.querySelector('[data-ui-consistency="api"]')) {
        const api = document.createElement('a');
        api.href = '/api/';
        api.className = 'nav-plain-link';
        api.dataset.uiConsistency = 'api';
        api.textContent = 'API';
        const guides = nav.querySelector('[data-nav-group="resources"]');
        if (guides) nav.insertBefore(api, guides);
      }

      nav.querySelectorAll('[data-nav-group="automate"] .nav-dropdown-item').forEach(item => {
        const label = item.textContent.trim().toLowerCase();
        if (label === 'api') item.hidden = true;
      });
    });
  }

  function normalizeMarketingNav() {
    document.querySelectorAll('.site-header nav').forEach(nav => {
      const expected = ['Tools', 'Workflows', 'Automation', 'API', 'Guides', 'Pricing'];
      [...nav.querySelectorAll(':scope > a')].forEach((a, index) => {
        if (expected[index]) a.textContent = expected[index];
      });
    });
  }

  function markCurrentPage() {
    const path = location.pathname;
    document.querySelectorAll('.site-header nav a,.uc-nav nav a,.tb-nav a.nav-plain-link').forEach(a => {
      const href = a.getAttribute('href') || '';
      if ((href.startsWith('/tools') && path.startsWith('/tools')) ||
          (href.startsWith('/automation') && path.startsWith('/automation')) ||
          (href.startsWith('/api') && path.startsWith('/api')) ||
          (href.startsWith('/how-to') && path.startsWith('/how-to')) ||
          (href.startsWith('/app') && path.startsWith('/app'))) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  function run() {
    document.body.classList.add('recast-ui-consistent');
    normalizeBranding();
    normalizeMarketingNav();
    normalizeUseCaseNav();
    normalizeTechnicalNav();
    markCurrentPage();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
})();
