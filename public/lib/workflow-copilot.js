/*!
 * Recast Workflow Copilot (MVP)
 * Turns common natural-language data tasks into definitions understood by
 * Recipe Builder 2.0. It is deliberately local: no user data or prompt is
 * sent anywhere. The interface is designed so a hosted model can be added
 * later without changing the workflow definition format.
 */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const CONVERSIONS = [
    ['json','csv','json2csv','JSON → CSV'], ['csv','json','csv2json','CSV → JSON'],
    ['json','xml','json2xml','JSON → XML'], ['xml','json','xml2json','XML → JSON'],
    ['json','yaml','json2yaml','JSON → YAML'], ['yaml','json','yaml2json','YAML → JSON'],
    ['json','markdown','json2markdown','JSON → Markdown'], ['markdown','json','markdown2json','Markdown → JSON']
  ];

  function findConversion(t) {
    for (const [from,to,mode,label] of CONVERSIONS) {
      if ((new RegExp('\\b'+from+'\\b')).test(t) && (new RegExp('\\b(?:to|into|as|->|→)\\s*'+to+'\\b')).test(t)) return {mode,label};
    }
    if (/\b(json|api)\b/.test(t) && /\b(?:csv|spreadsheet|excel)\b/.test(t)) return {mode:'json2csv',label:'JSON → CSV'};
    return null;
  }

  function parseFields(t, verb) {
    const m = t.match(new RegExp('\\b'+verb+'\\b(?:\\s+the)?\\s+([^,.]+)', 'i'));
    if (!m) return [];
    return m[1].split(/\s*(?:,| and )\s*/).map(x => x.trim().replace(/^['"`]|['"`]$/g,'')).filter(Boolean);
  }

  function build(prompt) {
    const t = prompt.toLowerCase().replace(/[’]/g,"'");
    const steps = [];
    const notes = [];
    const conversion = findConversion(t);

    // Preserve the user's natural ordering where practical. Common data
    // workflows intentionally clean/reshape before their final conversion.
    if (/\b(unflatten)\b/.test(t)) steps.push({mode:'unflatten',params:{}});
    if (/\b(flatten|flattened|nested)\b/.test(t) && !/\bunflatten\b/.test(t)) {
      steps.push({mode:'flatten',params:{}});
    }

    const remove = parseFields(t, 'remove');
    if (remove.length) steps.push({mode:'transformRemove',params:{paths:remove}});

    const renameMatch = t.match(/\brename\s+(?:the\s+)?(?:field\s+)?([a-zA-Z0-9_.$-]+)\s+(?:to|as)\s+([a-zA-Z0-9_.$-]+)/i);
    if (renameMatch) steps.push({mode:'transformRename',params:{from:renameMatch[1],to:renameMatch[2]}});

    const select = parseFields(t, 'select');
    if (select.length) steps.push({mode:'transformSelect',params:{paths:select}});

    const pathMatch = prompt.match(/(?:jsonpath|extract)\s+(?:at\s+)?[`"']?(\$[A-Za-z0-9_$.\[\]*_-]+)[`"']?/i);
    if (pathMatch) steps.push({mode:'jsonPath',params:{path:pathMatch[1]}});

    if (/\b(validate|check|schema validation)\b/.test(t)) {
      steps.push({mode:'validateJsonStep',params:{}});
    }
    if (/\b(sort|order)\b/.test(t) && !/\b(?:sort keys|alphabetical)\b/.test(t)) {
      const sortField = (t.match(/\bby\s+([a-zA-Z0-9_.$-]+)/) || [])[1];
      if (sortField) steps.push({mode:'transformSort',params:{field:sortField,direction:/\bdesc(?:ending)?\b/.test(t)?'desc':'asc'}});
      else notes.push('Sort needs a field, so it was left out. You can add it in the builder.');
    }
    if (/\bformat\b/.test(t) && !conversion) steps.push({mode:'formatJson',params:{}});

    if (conversion) steps.push({mode:conversion.mode,params:{}});

    if (!steps.length) {
      // Useful default rather than pretending an ambiguous request was
      // understood. The user can then add steps manually.
      notes.push('I could not confidently map that request to a supported step yet. Start with a conversion, transform, validation or extraction.');
    }

    const unique = [];
    const seen = new Set();
    steps.forEach(s => {
      const key = s.mode + JSON.stringify(s.params || {});
      if (!seen.has(key)) { seen.add(key); unique.push(s); }
    });

    return {
      name: conversion ? conversion.label + ' workflow' : 'Recast workflow',
      steps: unique,
      notes,
      automation: /\b(every|daily|weekly|schedule|automate|automation|each morning|each day)\b/.test(t)
    };
  }

  function render(def) {
    const wrap = $('wcPipeline');
    if (!wrap) return;
    if (!def.steps.length) {
      wrap.innerHTML = '<div class="wc-empty">No steps generated yet.</div>';
      return;
    }
    wrap.innerHTML = def.steps.map((s,i) => {
      const labels = {
        json2csv:'JSON → CSV',csv2json:'CSV → JSON',json2xml:'JSON → XML',xml2json:'XML → JSON',
        json2yaml:'JSON → YAML',yaml2json:'YAML → JSON',json2markdown:'JSON → Markdown',markdown2json:'Markdown → JSON',
        flatten:'Flatten nested objects',unflatten:'Unflatten fields',transformRemove:'Remove fields',
        transformRename:'Rename field',transformSelect:'Select fields',jsonPath:'Extract with JSONPath',
        validateJsonStep:'Validate JSON',formatJson:'Format JSON',transformSort:'Sort records'
      };
      const detail = s.params && s.params.paths ? s.params.paths.join(', ') :
        s.params && s.params.from ? `${s.params.from} → ${s.params.to}` :
        s.params && s.params.path ? s.params.path :
        s.params && s.params.field ? `${s.params.field} (${s.params.direction || 'asc'})` : '';
      return `<div class="wc-step"><span class="wc-step-num">${i+1}</span><div><strong>${esc(labels[s.mode] || s.mode)}</strong>${detail?`<small>${esc(detail)}</small>`:''}</div></div>`;
    }).join('<span class="wc-arrow">↓</span>');
  }

  function init() {
    if (!$('wcBuildBtn')) return;
    let definition = null;
    function buildNow() {
      const prompt = $('wcPrompt').value.trim();
      if (!prompt) { $('wcPrompt').focus(); return; }
      definition = build(prompt);
      render(definition);
      $('wcResultTitle').textContent = definition.steps.length ? 'Workflow ready' : 'Let’s refine that request';
      $('wcResultMeta').textContent = definition.steps.length + ' step' + (definition.steps.length===1?'':'s');
      $('wcNote').textContent = definition.automation
        ? 'Automation detected. This MVP builds the workflow locally; scheduling/API deployment is the next paid workflow layer.'
        : (definition.notes.join(' ') || 'Nothing leaves this browser. Review the pipeline before saving it.');
      $('wcResult').hidden = false;
      $('wcResult').scrollIntoView({behavior:'smooth',block:'nearest'});
    }
    $('wcBuildBtn').addEventListener('click', buildNow);
    $('wcPrompt').addEventListener('keydown', e => { if ((e.metaKey||e.ctrlKey) && e.key === 'Enter') buildNow(); });
    document.querySelectorAll('[data-wc-example]').forEach(b => b.addEventListener('click', () => {
      $('wcPrompt').value = b.getAttribute('data-wc-example');
      buildNow();
    }));
    $('wcEditPromptBtn').addEventListener('click', () => { $('wcResult').hidden=true; $('wcPrompt').focus(); });
    $('wcSaveBtn')?.addEventListener('click', () => {
      if (!definition || !definition.steps.length) return;
      if (window.RecastWorkflowLibrary) {
        const saved = window.RecastWorkflowLibrary.save(definition);
        if (window.showToastSafe) window.showToastSafe(`Saved workflow \"${saved.name}\"`);
      }
    });
    $('wcOpenBtn').addEventListener('click', () => {
      if (!definition || !definition.steps.length) return;
      if (window.RecastRecipeBuilder2 && window.RecastRecipeBuilder2.openWithDefinition) {
        window.RecastRecipeBuilder2.openWithDefinition(definition);
        const panel = $('recipeBuilder2Panel');
        if (panel) panel.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
    $('wcRunBtn').addEventListener('click', () => {
      if (!definition || !definition.steps.length || !window.RecastRecipeBuilder2) return;
      window.RecastRecipeBuilder2.openWithDefinition(definition);
      const run = $('rb2RunBtn'); if (run) setTimeout(() => run.click(), 100);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.RecastWorkflowCopilot = { build };
})();
