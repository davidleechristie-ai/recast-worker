(() => {
  const globalNavItems = [
    ['Tools', '/tools/'],
    ['Workflows', '/app/#workflowBuilder'],
    ['Automation', '/automation/'],
    ['API', '/api/'],
    ['Guides', '/how-to/'],
    ['Demo', '/demo/'],
    ['Pricing', '/#pricing']
  ];

  function isCurrentSection(href) {
    const path = location.pathname;
    return (href.startsWith('/tools') && path.startsWith('/tools')) ||
      (href.startsWith('/automation') && path.startsWith('/automation')) ||
      (href.startsWith('/api') && path.startsWith('/api')) ||
      (href.startsWith('/how-to') && path.startsWith('/how-to')) ||
      (href.startsWith('/demo') && path.startsWith('/demo')) ||
      (href.startsWith('/app') && path.startsWith('/app'));
  }

  function globalNavLinks() {
    return globalNavItems.map(([label, href]) => `<a href="${href}"${isCurrentSection(href) ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  }

  const marketingSubmenus = {
    tools: [
      ['JSON → CSV', '/tools/json-to-csv.html'],
      ['CSV → JSON', '/tools/csv-to-json.html'],
      ['JSON Diff', '/tools/json-diff.html'],
      ['CSV Diff', '/tools/csv-diff.html'],
      ['Validate JSON', '/tools/json-validator.html'],
      ['All tools', '/tools/']
    ],
    automation: [
      ['Automation overview', '/automation/'],
      ['Workflow builder', '/app/#workflowBuilder'],
      ['API', '/api/']
    ],
    guides: [
      ['How Recast works', '/how-to/'],
      ['Examples', '/how-to/examples.html'],
      ['Blog', '/blog/'],
      ['Contact', '/contact.html']
    ]
  };

  function marketingNavGroup(label, key) {
    return `<div class="recast-nav-group" data-recast-nav-group="${key}"><button type="button" class="recast-nav-group-button" aria-expanded="false" aria-controls="recast-nav-${key}">${label}<span class="recast-nav-chevron" aria-hidden="true"></span></button><div class="recast-nav-submenu" id="recast-nav-${key}">${marketingSubmenus[key].map(([itemLabel, href]) => `<a href="${href}"${isCurrentSection(href) ? ' aria-current="page"' : ''}>${itemLabel}</a>`).join('')}</div></div>`;
  }

  function marketingNavMarkup() {
    return marketingNavGroup('Tools', 'tools') +
      '<a href="/app/#workflowBuilder">Workflows</a>' +
      marketingNavGroup('Automation', 'automation') +
      '<a href="/api/">API</a>' +
      marketingNavGroup('Guides', 'guides') +
      '<a href="/demo/">Demo</a>' +
      '<a href="/#pricing">Pricing</a>';
  }

  function bindMarketingSubmenus(nav) {
    const groups = [...nav.querySelectorAll('.recast-nav-group')];
    const closeGroups = except => groups.forEach(group => {
      if (group === except) return;
      group.classList.remove('is-open');
      group.querySelector('.recast-nav-group-button')?.setAttribute('aria-expanded', 'false');
    });
    groups.forEach(group => {
      const button = group.querySelector('.recast-nav-group-button');
      button?.addEventListener('click', event => {
        event.stopPropagation();
        const open = button.getAttribute('aria-expanded') !== 'true';
        closeGroups(group);
        group.classList.toggle('is-open', open);
        button.setAttribute('aria-expanded', String(open));
      });
    });
    document.addEventListener('click', event => {
      if (!nav.contains(event.target)) closeGroups();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeGroups();
    });
  }

  const canonicalLogo = '/assets/brand/recast-logo.png';
  const brandMarkup = '<img class="recast-brand-logo" src="' + canonicalLogo + '" alt="" width="32" height="32"><span class="recast-brand-wordmark">Recast</span>';

  function normalizeThemeDefault() {
    try {
      const savedTheme = localStorage.getItem('recast_theme');
      if (savedTheme === 'light') document.documentElement.setAttribute('data-theme', 'light');
      else document.documentElement.removeAttribute('data-theme');
    } catch (_) {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  function removeLiveExamplePanels() {
    document.querySelectorAll('.hero-preview').forEach(panel => panel.remove());
  }

  const dedicatedToolGroups = {
    compare: [
      ['JSON Diff', '/tools/json-diff.html'],
      ['XML Diff', '/tools/xml-diff.html'],
      ['CSV Diff', '/tools/csv-diff.html']
    ],
    convert: [
      ['JSON → CSV', '/tools/json-to-csv.html'],
      ['CSV → JSON', '/tools/csv-to-json.html'],
      ['JSON → XML', '/tools/json-to-xml.html'],
      ['XML → JSON', '/tools/xml-to-json.html'],
      ['JSON → YAML', '/tools/json-to-yaml.html'],
      ['YAML → JSON', '/tools/yaml-to-json.html']
    ],
    validate: [
      ['Validate JSON', '/tools/json-validator.html'],
      ['Format JSON', '/tools/json-formatter.html'],
      ['Validate Schema', '/tools/validate-json-schema.html']
    ],
    transform: [
      ['Flatten JSON', '/tools/flatten-json.html'],
      ['Unflatten JSON', '/tools/unflatten-json.html'],
      ['JSONPath Tester', '/tools/jsonpath-tester.html']
    ],
    schema: [
      ['JSON → Schema', '/tools/json-schema-generator.html'],
      ['JSON → TypeScript', '/tools/json-to-typescript.html'],
      ['JSON → Python', '/tools/json-to-python.html'],
      ['JSON → Zod', '/tools/json-to-zod.html']
    ]
  };

  function dedicatedToolGroup(slug) {
    if (/(?:^|-)(?:diff|compare)(?:-|$)/.test(slug)) return 'compare';
    if (/validator|validate|formatter|format/.test(slug)) return 'validate';
    if (/flatten|unflatten|jsonpath/.test(slug)) return 'transform';
    if (/schema|typescript|pydantic|python|kotlin|rust|swift|csharp|java|zod|sql|go$/.test(slug)) return 'schema';
    return 'convert';
  }

  function focusDedicatedToolPage() {
    const match = location.pathname.match(/^\/tools\/([^/]+?)(?:\.html)?$/);
    const hero = document.querySelector('main .hero');
    const workbench = hero?.querySelector('#diffFullscreenWrap');
    if (!match || !hero || !workbench) return;

    const slug = match[1].replace(/\.html$/, '');
    const group = dedicatedToolGroup(slug);
    const heading = hero.querySelector('h1');
    const shortTitle = (dedicatedToolGroups[group].find(([, href]) => href.includes('/' + slug + '.html'))?.[0] || heading?.textContent || 'Selected tool').trim();
    document.body.classList.add('recast-dedicated-tool');

    hero.querySelector('.quick-start')?.remove();
    hero.querySelector('.mode-nav')?.remove();
    hero.querySelector('.related-groups')?.remove();

    const oldToolkitLink = [...hero.querySelectorAll('a')].find(link => /full toolkit/i.test(link.textContent || ''));
    oldToolkitLink?.closest('p')?.remove();
    if (heading && !hero.querySelector('.dedicated-breadcrumb')) {
      const breadcrumb = document.createElement('nav');
      breadcrumb.className = 'dedicated-breadcrumb';
      breadcrumb.setAttribute('aria-label', 'Breadcrumb');
      breadcrumb.innerHTML = `<a href="/tools/">Tools</a><span>/</span><a href="/tools/">${group[0].toUpperCase() + group.slice(1)}</a><span>/</span><strong>${shortTitle}</strong>`;
      hero.insertBefore(breadcrumb, heading);
    }

    if (!workbench.querySelector('.dedicated-tool-label')) {
      const label = document.createElement('div');
      label.className = 'dedicated-tool-label';
      label.innerHTML = `<span>Selected tool</span><strong>${shortTitle}</strong>`;
      workbench.insertBefore(label, workbench.firstChild);
    }
    (hero.querySelector('.sub') || heading)?.insertAdjacentElement('afterend', workbench);

    if (!hero.querySelector('.dedicated-related')) {
      const related = document.createElement('nav');
      related.className = 'dedicated-related';
      related.setAttribute('aria-label', 'Related tools');
      const alternatives = dedicatedToolGroups[group].filter(([, href]) => !href.includes('/' + slug + '.html')).slice(0, 2);
      related.innerHTML = `<span>Need a different ${group} tool?</span>${alternatives.map(([label, href]) => `<a href="${href}">${label} →</a>`).join('')}<a href="/tools/">All tools →</a>`;
      workbench.insertAdjacentElement('afterend', related);
    }
  }

  function buildGlobalHeader() {
    const header = document.createElement('header');
    header.className = 'recast-global-header';
    header.dataset.recastShell = 'header';
    header.innerHTML = `<a class="recast-global-brand" href="/" aria-label="Recast home">${brandMarkup}</a><button class="recast-menu-toggle" type="button" aria-expanded="false" aria-controls="recast-global-nav" aria-label="Open navigation"><span></span></button><nav class="recast-global-nav" id="recast-global-nav" aria-label="Primary navigation">${globalNavLinks()}</nav><a class="recast-global-cta" href="/app/">Open Recast</a>`;
    return header;
  }

  function buildGlobalFooter() {
    const footer = document.createElement('footer');
    footer.className = 'recast-global-footer';
    footer.dataset.recastShell = 'footer';
    footer.innerHTML = `<div class="recast-global-footer-inner"><div><a class="recast-global-footer-brand" href="/" aria-label="Recast home">${brandMarkup}</a><small>Private browser tools. Repeatable workflows.</small></div><nav aria-label="Footer navigation">${globalNavLinks()}<a href="/contact.html">Contact</a></nav><small>© 2026 Recast</small></div>`;
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
    document.querySelectorAll('.brand,.uc-brand,.recast-global-brand,.recast-global-footer-brand').forEach(brand => {
      if (brand.tagName === 'A') {
        brand.href = '/';
        brand.setAttribute('aria-label', 'Recast home');
      }
      brand.innerHTML = brandMarkup;
    });
  }

  function normalizeUseCaseNav() {
    document.querySelectorAll('.uc-nav nav').forEach(nav => {
      nav.innerHTML = globalNavItems.map(([label, href]) => `<a href="${href}">${label}</a>`).join('');
    });
  }

  function normalizeTechnicalNav() {
    document.querySelectorAll('.tb-nav').forEach(nav => {
      setButtonLabel(nav.querySelector('[data-nav-group="automate"] .nav-group-btn'), 'Automation');
      setButtonLabel(nav.querySelector('[data-nav-group="resources"] .nav-group-btn'), 'Guides');
      const insertPlain = (key, label, href, before) => {
        if (nav.querySelector(`[data-ui-consistency="${key}"]`)) return;
        const link = document.createElement('a');
        link.href = href;
        link.className = 'nav-plain-link';
        link.dataset.uiConsistency = key;
        link.textContent = label;
        const anchor = nav.querySelector(before);
        if (anchor) nav.insertBefore(link, anchor);
        else nav.appendChild(link);
      };
      insertPlain('workflows', 'Workflows', '/app/#workflowBuilder', '[data-nav-group="automate"]');
      insertPlain('api', 'API', '/api/', '[data-nav-group="resources"]');
      insertPlain('demo', 'Demo', '/demo/', '[data-nav-group="resources"]');
      nav.querySelectorAll('[data-nav-group="automate"] .nav-dropdown-item').forEach(item => {
        if (item.textContent.trim().toLowerCase() === 'api') item.hidden = true;
      });
      nav.querySelectorAll('[data-nav-group="resources"] .nav-dropdown-item').forEach(item => {
        if (item.textContent.trim().toLowerCase() === 'demo') item.hidden = true;
      });
    });
  }

  function normalizeMarketingNav() {
    document.querySelectorAll('.site-header nav').forEach(nav => {
      if (nav.dataset.recastGrouped === 'true') return;
      nav.innerHTML = marketingNavMarkup();
      nav.dataset.recastGrouped = 'true';
      bindMarketingSubmenus(nav);
    });
  }

  function markCurrentPage() {
    document.querySelectorAll('.site-header nav a,.uc-nav nav a,.tb-nav a.nav-plain-link,.recast-global-nav a,.recast-global-footer nav a').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (isCurrentSection(href)) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function run() {
    normalizeThemeDefault();
    removeLiveExamplePanels();
    focusDedicatedToolPage();
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
