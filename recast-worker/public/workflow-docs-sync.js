(function () {
  'use strict';

  const path = location.pathname;
  const isHowTo = path === '/how-to/' || path === '/how-to/index.html' || path === '/how-to/automate.html';
  const isDemo = path === '/demo/' || path === '/demo/index.html' || path === '/demo/workflows.html';
  if (!isHowTo && !isDemo) return;

  function replaceText(root, replacements) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      let value = node.nodeValue;
      replacements.forEach(([from, to]) => { value = value.split(from).join(to); });
      node.nodeValue = value;
    });
  }

  function addStyles() {
    if (document.getElementById('workflowDocsSyncStyles')) return;
    const style = document.createElement('style');
    style.id = 'workflowDocsSyncStyles';
    style.textContent = `
      .workflow-model-callout{margin:24px 0 30px;padding:18px 20px;border:1px solid rgba(139,92,246,.28);border-radius:14px;background:rgba(139,92,246,.055)}
      .workflow-model-callout h2,.workflow-model-callout h3{margin:0 0 8px;font-size:1rem}.workflow-model-callout p{margin:0 0 14px;line-height:1.6;color:var(--text-muted,#94a3b8)}
      .workflow-model-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.workflow-model-grid>div{min-width:0;padding:12px;border:1px solid rgba(148,163,184,.14);border-radius:10px;background:rgba(255,255,255,.025)}
      .workflow-model-grid strong{display:block;margin-bottom:4px;font-size:.78rem}.workflow-model-grid span{display:block;color:var(--text-muted,#94a3b8);font-size:.72rem;line-height:1.45}
      .workflow-path-strip{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:20px 0 26px}.workflow-path-strip span{padding:8px 11px;border:1px solid rgba(148,163,184,.16);border-radius:999px;font-size:.72rem}.workflow-path-strip b{opacity:.45}
      .workflow-current-note{margin:14px 0;padding:12px 14px;border-left:3px solid #8b5cf6;background:rgba(139,92,246,.06);font-size:.8rem;line-height:1.55}
      @media(max-width:760px){.workflow-model-grid{grid-template-columns:1fr 1fr}.workflow-path-strip{align-items:flex-start}}
      @media(max-width:460px){.workflow-model-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function modelCallout() {
    const wrap = document.createElement('section');
    wrap.className = 'workflow-model-callout';
    wrap.setAttribute('aria-label', 'How Recast workflows fit together');
    wrap.innerHTML = `
      <h2>One simple model: Tool → Workflow → Automation</h2>
      <p>Use a tool for a one-off job. Use Workflow Builder when the job has several steps or needs repeating. Recipes are ready-made workflow starting points. Automation is the hosted layer you choose only after the workflow works.</p>
      <div class="workflow-model-grid">
        <div><strong>Tools</strong><span>One-off operations such as convert, validate, compare or extract.</span></div>
        <div><strong>Workflows</strong><span>Several operations chained together in Workflow Builder.</span></div>
        <div><strong>Recipes</strong><span>Ready-made workflow templates that open pre-populated.</span></div>
        <div><strong>Automations</strong><span>Saved workflows run repeatedly using hosted execution.</span></div>
      </div>`;
    return wrap;
  }

  function syncHowToOverview() {
    const article = document.querySelector('article');
    if (!article || document.getElementById('workflowHowToModel')) return;
    const callout = modelCallout();
    callout.id = 'workflowHowToModel';
    const firstH1 = article.querySelector('h1');
    if (firstH1) firstH1.insertAdjacentElement('afterend', callout);
  }

  function syncAutomateHowTo() {
    const article = document.querySelector('article');
    if (!article) return;
    replaceText(article, [
      ['Recipe Builder 2.0', 'Workflow Builder'],
      ['Recipe Builder', 'Workflow Builder'],
      ['Recipe panel', 'legacy Recipe panel'],
      ['recipe can be run again', 'workflow can be run again'],
      ['recipes, batch, the visual builder', 'workflows, recipes, batch and Workflow Builder']
    ]);

    const recipesHeading = document.getElementById('recipes');
    if (recipesHeading) recipesHeading.textContent = '2. Workflows and recipes';

    const lists = article.querySelectorAll('ul');
    lists.forEach((list) => {
      const legacy = Array.from(list.children).find((li) => /legacy Recipe panel/i.test(li.textContent));
      if (legacy) legacy.remove();
    });

    if (!document.getElementById('workflowAutomateModel')) {
      const callout = modelCallout();
      callout.id = 'workflowAutomateModel';
      const lede = article.querySelector('.tour-lede');
      if (lede) lede.insertAdjacentElement('afterend', callout);
    }

    if (recipesHeading && !document.getElementById('workflowRecipeClarifier')) {
      const note = document.createElement('div');
      note.id = 'workflowRecipeClarifier';
      note.className = 'workflow-current-note';
      note.innerHTML = '<strong>Current UI:</strong> build and edit the sequence in <strong>Workflow Builder</strong>. Choose <strong>Start from scratch</strong> for a new sequence, or start with a <strong>Recipe</strong> to open a ready-made workflow. After a successful run you can save it, copy or download the result, and then choose Automation if repeated hosted execution is useful.';
      recipesHeading.insertAdjacentElement('afterend', note);
    }

    article.querySelectorAll('a').forEach((a) => {
      if (/Open Workflow Builder/i.test(a.textContent) || /Open Recipe Builder/i.test(a.textContent)) {
        a.textContent = 'Open Workflow Builder';
        a.href = '/app/#workflowBuilder';
      }
    });
  }

  function syncDemoIndex() {
    const gallery = document.getElementById('demoGallery');
    if (!gallery) return;
    replaceText(gallery, [
      ['Transform Builder above', 'Workflow Builder'],
      ['visual builder', 'Workflow Builder'],
      ['saved as a visual workflow', 'saved as a reusable workflow']
    ]);
    const reusable = gallery.querySelector('[data-demo="orders_recipe"]');
    if (reusable) {
      const badge = reusable.querySelector('.demo-format');
      if (badge) badge.textContent = 'WORKFLOW';
      const desc = reusable.querySelector('p');
      if (desc) desc.textContent = 'Opens Workflow Builder with the orders data ready to go. Start from scratch or a recipe, add and reorder steps, preview the result, save the workflow, then choose Automation only when the job needs repeated hosted execution.';
    }
    if (!document.getElementById('demoWorkflowPath')) {
      const strip = document.createElement('div');
      strip.id = 'demoWorkflowPath';
      strip.className = 'workflow-path-strip';
      strip.setAttribute('aria-label', 'Recast workflow progression');
      strip.innerHTML = '<span>1 · Solve once with a Tool</span><b>→</b><span>2 · Build or reuse a Workflow</span><b>→</b><span>3 · Save and repeat</span><b>→</b><span>4 · Automate when useful</span>';
      const hero = document.querySelector('.hero');
      if (hero) hero.appendChild(strip);
    }
  }

  function syncWorkflowDemo() {
    const main = document.querySelector('main');
    if (!main) return;
    replaceText(main, [
      ['chain them visually', 'chain them in Workflow Builder'],
      ['Start from a real job', 'Start from a tool or recipe'],
      ['A saved local workflow can stay local', 'A saved workflow stays local by default']
    ]);
    const hero = main.querySelector('.hero');
    if (hero && !document.getElementById('workflowDemoCurrent')) {
      const note = document.createElement('div');
      note.id = 'workflowDemoCurrent';
      note.className = 'workflow-current-note';
      note.innerHTML = '<strong>Current Workflow Builder:</strong> paste or carry in your data, choose <strong>Start from scratch</strong> or a <strong>Recipe</strong>, add steps, configure and reorder them, preview the data flow, run the full workflow, then copy/download or save the result. Automation is offered after a successful run.';
      hero.appendChild(note);
    }
    main.querySelectorAll('a.cta').forEach((a) => {
      if (/Try the workflow template/i.test(a.textContent)) {
        a.textContent = 'Open this in Workflow Builder →';
        a.href = '/app/?template=api-json-csv#workflowBuilder';
      }
    });
  }

  addStyles();
  if (path === '/how-to/' || path === '/how-to/index.html') syncHowToOverview();
  if (path === '/how-to/automate.html') syncAutomateHowTo();
  if (path === '/demo/' || path === '/demo/index.html') syncDemoIndex();
  if (path === '/demo/workflows.html') syncWorkflowDemo();
})();
