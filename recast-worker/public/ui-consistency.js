(() => {
  const globalNavItems = [
    ['Tools', '/tools/'],
    ['Workflows', '/app/#workflowBuilder'],
    ['Automation', '/automation/'],
    ['API', '/api/'],
    ['Guides', '/how-to/'],
    ['Pricing', '/#pricing']
  ];

  function isCurrentSection(href) {
    const path = location.pathname;
    return (href.startsWith('/tools') && path.startsWith('/tools')) ||
      (href.startsWith('/automation') && path.startsWith('/automation')) ||
      (href.startsWith('/api') && path.startsWith('/api')) ||
      (href.startsWith('/how-to') && path.startsWith('/how-to')) ||
      (href.startsWith('/app') && path.startsWith('/app'));
  }

  function globalNavLinks() {
    return globalNavItems.map(([label, href]) => `<a href="${href}"${isCurrentSection(href) ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  }

  function buildGlobalHeader() {
    const header = document.createElement('header');
    header.className = 'recast-global-header';
    header.dataset.recastShell = 'header';
    header.innerHTML = `<a class="recast-global-brand" href="/" aria-label="Recast home"><span class="recast-global-mark" aria-hidden="true">R</span><span>Recast</span></a><button class="recast-menu-toggle" type="button" aria-expanded="false" aria-controls="recast-global-nav" aria-label="Open navigation"><span></span></button><nav class="recast-global-nav" id="recast-global-nav" aria-label="Primary navigation">${globalNavLinks()}</nav><a class="recast-global-cta" href="/app/">Open Recast</a>`;
    return header;
  }

  function buildGlobalFooter() {
    const footer = document.createElement('footer');
    footer.className = 'recast-global-footer';
    footer.dataset.recastShell = 'footer';
    footer.innerHTML = `<div class="recast-global-footer-inner"><div><span class="recast-global-footer-brand"><span class="recast-global-mark" aria-hidden="true">R</span>Recast</span><small>Private browser tools. Repeatable workflows.</small></div><nav aria-label="Footer navigation"><a href="/tools/">Tools</a><a href="/automation/">Automation</a><a href="/api/">API</a><a href="/how-to/">Guides</a><a href="/contact.html">Contact</a></nav><small>© 2026 Recast</small></div>`;
    return footer;
  }

  function bindGlobalMenu(header) {
    const button = header.querySelector('.recast-menu-toggle');
    const nav = header.querySelector('.recast-global-nav');
    if (!button || !nav) return;
    const close = () => {
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Open navigation');
      nav.dataset.open = 'false';
    };
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      nav.dataset.open = String(open);
      if (open) nav.querySelector('a')?.focus();
    });
    nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { close(); button.focus(); }
    });
    document.addEventListener('click', event => { if (!header.contains(event.target)) close(); });
  }

  function ensureGlobalShell() {
    if (location.pathname.startsWith('/embed/')) return;
    if (!document.querySelector('.site-header,.titleblock,[data-recast-shell="header"]')) {
      const header = buildGlobalHeader();
      document.body.insertBefore(header, document.body.firstChild);
      bindGlobalMenu(header);
    }
    if (!document.querySelector('footer,[data-recast-shell="footer"]')) document.body.appendChild(buildGlobalFooter());
  }

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
        if (item.textContent.trim().toLowerCase() === 'api') item.hidden = true;
      });
    });
  }

  function normalizeMarketingNav() {
    document.querySelectorAll('.site-header nav').forEach(nav => {
      const expected = ['Tools', 'Workflows', 'Automation', 'API', 'Guides', 'Pricing'];
      [...nav.querySelectorAll(':scope > a')].forEach((a, index) => { if (expected[index]) a.textContent = expected[index]; });
    });
  }

  function markCurrentPage() {
    const path = location.pathname;
    document.querySelectorAll('.site-header nav a,.uc-nav nav a,.tb-nav a.nav-plain-link,.recast-global-nav a').forEach(a => {
      const href = a.getAttribute('href') || '';
      if ((href.startsWith('/tools') && path.startsWith('/tools')) ||
          (href.startsWith('/automation') && path.startsWith('/automation')) ||
          (href.startsWith('/api') && path.startsWith('/api')) ||
          (href.startsWith('/how-to') && path.startsWith('/how-to')) ||
          (href.startsWith('/app') && path.startsWith('/app'))) a.setAttribute('aria-current', 'page');
    });
  }

  function run() {
    document.body.classList.add('recast-ui-consistent');
    ensureGlobalShell();
    normalizeBranding();
    normalizeMarketingNav();
    normalizeUseCaseNav();
    normalizeTechnicalNav();
    markCurrentPage();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
})();
