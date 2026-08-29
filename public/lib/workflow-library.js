/* Recast Workflow Library — local-first saved workflow management. */
(function () {
  'use strict';
  const KEY = 'recast_workflow_library_v1';
  const MAX = 50;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (_) { return []; } }
  function persist(items) { try { localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX))); } catch (_) {} }
  function save(definition) {
    const now = Date.now();
    const item = Object.assign({}, definition, { id: 'wf-' + now + '-' + Math.random().toString(36).slice(2,7), updatedAt: now });
    const items = [item].concat(load().filter(w => w.name !== item.name));
    persist(items);
    render();
    window.RecastFunnel?.track('workflow_saved',{workflow_name:item.name||'Untitled',step_count:(item.steps||[]).length});
    return item;
  }
  function remove(id) { persist(load().filter(w => w.id !== id)); render(); }
  function update(id, patch) {
    const items = load(); const idx = items.findIndex(w => w.id === id);
    if (idx === -1) return null;
    items[idx] = Object.assign({}, items[idx], patch || {}, { updatedAt: Date.now() });
    persist(items); render();
    if (window.RecastWorkflowAutomation && window.RecastWorkflowAutomation.render) window.RecastWorkflowAutomation.render();
    return items[idx];
  }
  function copyDefinition(definition) {
    const text = JSON.stringify(definition, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text);
    else { const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    if (window.showToastSafe) window.showToastSafe('Workflow definition copied');
  }
  function open(item) {
    if (!item || !window.RecastRecipeBuilder2) return;
    window.RecastHomeDepth?.activate('builder',false);
    window.RecastRecipeBuilder2.openWithDefinition(item);
    document.getElementById('exploreRecast')?.scrollIntoView({ behavior:'smooth', block:'start' });
  }
  function render() {
    const wrap = $('workflowLibraryList');
    const count = $('workflowLibraryCount');
    if (!wrap) return;
    const items = load();
    if (count) count.textContent = items.length ? `${items.length} saved` : 'Nothing saved yet';
    if (!items.length) {
      wrap.innerHTML = '<div class="wf-empty wf-empty-action"><div><small>NOTHING SAVED YET</small><strong>Start with a workflow that already works.</strong><span>Try a sample with real data, change the steps, then save it here. Nothing is hosted until you explicitly deploy it.</span></div><button class="btn primary" data-empty-templates type="button">Try a workflow →</button></div>';
      wrap.querySelector('[data-empty-templates]')?.addEventListener('click',()=>window.RecastHomeDepth?.activate('templates',false));
      return;
    }
    wrap.innerHTML = items.map(item => {
      const steps = (item.steps || []).map(s => s.mode).join(' → ');
      return `<div class="wf-card"><div class="wf-card-main"><strong>${esc(item.name || 'Untitled workflow')}</strong><span>${esc((item.steps || []).length + ' step' + ((item.steps || []).length === 1 ? '' : 's'))}</span><small>${esc(steps)}</small></div><div class="wf-card-actions"><button class="icon-btn" data-wf-open="${esc(item.id)}">Open</button><button class="icon-btn" data-wf-copy="${esc(item.id)}">Copy</button><button class="icon-btn" data-wf-deploy="${esc(item.id)}">${item.deploymentId ? 'Deployed' : 'Deploy'}</button><button class="icon-btn" data-wf-delete="${esc(item.id)}" title="Delete saved workflow">✕</button></div></div>`;
    }).join('');
    wrap.querySelectorAll('[data-wf-open]').forEach(b => b.addEventListener('click', () => open(load().find(w => w.id === b.dataset.wfOpen))));
    wrap.querySelectorAll('[data-wf-copy]').forEach(b => b.addEventListener('click', () => { const w=load().find(x=>x.id===b.dataset.wfCopy); if(w) copyDefinition({schemaVersion:w.schemaVersion||2,name:w.name,steps:w.steps}); }));
    wrap.querySelectorAll('[data-wf-deploy]').forEach(b => b.addEventListener('click', () => { const w=load().find(x=>x.id===b.dataset.wfDeploy); if(w && window.RecastWorkflowAutomation) window.RecastWorkflowAutomation.deploy(w); }));
    wrap.querySelectorAll('[data-wf-delete]').forEach(b => b.addEventListener('click', () => remove(b.dataset.wfDelete)));
  }
  window.RecastWorkflowLibrary = { load, save, update, remove, render, copyDefinition };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();
