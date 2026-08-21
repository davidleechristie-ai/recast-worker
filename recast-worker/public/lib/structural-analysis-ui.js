/*!
 * Recast Structural Analysis UI. Reads the same #inputA / #inputB the
 * existing Compare (diffJson) mode already uses, runs the classification
 * independently through the Worker, and renders its own panel — the
 * existing raw diff output (#output) is never read or modified by any of
 * this.
 */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);

  let currentFilter = 'all';
  let lastResult = null;

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' }[c])); }
  function fmtVal(v) {
    if (v === undefined) return '(absent)';
    if (v === null) return 'null';
    if (typeof v === 'object') return Array.isArray(v) ? `Array(${v.length})` : 'Object';
    if (typeof v === 'string') return v.length > 60 ? JSON.stringify(v.slice(0, 60) + '\u2026') : JSON.stringify(v);
    return String(v);
  }

  function renderSummary(summary) {
    $('saSummary').innerHTML = `
      <div class="sa-summary-stat"><div class="sa-summary-num breaking">${summary.breaking}</div><div class="sa-summary-label">Breaking changes</div></div>
      <div class="sa-summary-stat"><div class="sa-summary-num structural">${summary.structural}</div><div class="sa-summary-label">Structural changes</div></div>
      <div class="sa-summary-stat"><div class="sa-summary-num value">${summary.value}</div><div class="sa-summary-label">Value changes</div></div>
    `;
  }

  function badgeFor(c) {
    if (c.category === 'value') return { cls: 'value', label: 'Value' };
    if (c.severity === 'breaking') return { cls: 'breaking', label: 'Breaking' };
    if (c.severity === 'uncertain') return { cls: 'uncertain', label: 'Uncertain' };
    return { cls: 'non-breaking', label: 'Non-breaking' };
  }

  function matchesFilter(c, filter) {
    if (filter === 'all') return true;
    if (filter === 'breaking') return c.severity === 'breaking';
    if (filter === 'structural') return c.category === 'structural';
    if (filter === 'value') return c.category === 'value';
    return true;
  }

  function renderList() {
    if (!lastResult) return;
    const filtered = lastResult.changes.filter((c) => matchesFilter(c, currentFilter));
    const listEl = $('saList');
    if (!filtered.length) {
      listEl.innerHTML = '<div class="di-empty">No changes in this category.</div>';
      return;
    }
    listEl.innerHTML = filtered.map((c) => {
      const badge = badgeFor(c);
      const showVals = c.type === 'changed';
      return `
        <div class="sa-change-row">
          <span class="sa-badge ${badge.cls}">${badge.label}</span>
          <div class="sa-change-body">
            <div class="sa-change-path">${escapeHtml(c.path)}</div>
            <div class="sa-change-label">${escapeHtml(c.label)}</div>
            ${showVals ? `<div class="sa-change-vals"><span class="sa-change-old">was: ${escapeHtml(fmtVal(c.oldVal))}</span><span class="sa-change-new">now: ${escapeHtml(fmtVal(c.newVal))}</span></div>` : ''}
            ${c.detail ? `<div class="sa-change-detail">${escapeHtml(c.detail)}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  document.querySelectorAll('.sa-filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      document.querySelectorAll('.sa-filter').forEach((b) => b.classList.toggle('active', b === btn));
      renderList();
    });
  });

  async function runAnalysis() {
    const activeChip = document.querySelector('.mode-chip.active');
    const mode = activeChip ? activeChip.dataset.mode : null;
    const inputA = $('inputA'), inputB = $('inputB');
    if (mode !== 'diffJson' || !inputA || !inputB) {
      $('saSummary').innerHTML = '';
      $('saList').innerHTML = '<div class="di-empty">Structural Analysis works on JSON comparisons \u2014 switch to Compare &rarr; Diff JSON, paste your two versions, then come back here.</div>';
      return;
    }
    const textA = inputA.value, textB = inputB.value;
    if (!textA.trim() || !textB.trim()) {
      $('saSummary').innerHTML = '';
      $('saList').innerHTML = '<div class="di-empty">Add both the original and modified JSON in the Compare panel above, then click Analyze.</div>';
      return;
    }
    try {
      lastResult = await window.RecastWorkerClient.runTask('structuralAnalysis', { textA, textB });
      renderSummary(lastResult.summary);
      renderList();
    } catch (e) {
      $('saSummary').innerHTML = '';
      $('saList').innerHTML = `<div class="di-empty">Could not analyze: ${escapeHtml(e.message || String(e))} \u2014 make sure both sides are valid JSON.</div>`;
    }
  }

  function openPanel() {
    $('structuralAnalysisPanel').classList.add('show');
    runAnalysis();
  }
  function closePanel() {
    $('structuralAnalysisPanel').classList.remove('show');
  }

  $('structuralAnalysisToggleBtn')?.addEventListener('click', () => {
    const open = $('structuralAnalysisPanel').classList.contains('show');
    if (open) closePanel(); else openPanel();
  });
  $('saCloseBtn')?.addEventListener('click', closePanel);
  $('saRefreshBtn')?.addEventListener('click', runAnalysis);
})();
