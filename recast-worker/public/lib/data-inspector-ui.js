/*!
 * Recast Data Inspector UI — profiles whatever is currently in the main
 * input (reusing the existing JSON/CSV/XML parsers via the profiler's
 * format-aware worker task) and renders a summary, quality warnings, and
 * a per-field table with "Transform this field" / "Query this field" /
 * "Copy path" actions.
 */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);

  function detectFormat(text) {
    const trimmed = text.trim();
    if (!trimmed) return 'json';
    try { JSON.parse(trimmed); return 'json'; } catch (e) { /* fall through */ }
    if (trimmed.startsWith('<')) return 'xml';
    return 'csv'; // the only other format the profiler supports; a reasonable default once JSON/XML are ruled out
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function fmtBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / (1024 * 1024)).toFixed(2) + ' MB';
  }
  function fmtSample(v) {
    if (typeof v === 'string') return v.length > 40 ? v.slice(0, 40) + '\u2026' : v;
    return JSON.stringify(v);
  }

  const SEVERITY_ORDER = { error: 0, warning: 1, info: 2 };

  function renderSummary(summary) {
    $('diSummary').innerHTML = `
      <div class="di-summary-stat"><div class="di-summary-num">${summary.recordCount.toLocaleString()}</div><div class="di-summary-label">Records</div></div>
      <div class="di-summary-stat"><div class="di-summary-num">${summary.fieldCount.toLocaleString()}</div><div class="di-summary-label">Fields</div></div>
      <div class="di-summary-stat"><div class="di-summary-num">${fmtBytes(summary.estimatedSizeBytes)}</div><div class="di-summary-label">Estimated size</div></div>
      <div class="di-summary-stat"><div class="di-summary-num">${summary.nestingDepth}</div><div class="di-summary-label">Nesting depth</div></div>
    `;
  }

  function renderWarnings(warnings) {
    const el = $('diWarnings');
    if (!warnings.length) { el.innerHTML = ''; return; }
    const sorted = warnings.slice().sort((a, b) => SEVERITY_ORDER[a.level] - SEVERITY_ORDER[b.level]);
    el.innerHTML = sorted.map((w) => `
      <div class="di-warning-row">
        <span class="di-warning-badge ${w.level}">${w.level}</span>
        <span><span class="di-warning-field">${escapeHtml(w.field)}</span> \u2014 ${escapeHtml(w.message)}</span>
      </div>
    `).join('');
  }

  function rangeText(f) {
    if (f.type === 'number' && f.min !== null) return `${f.min} \u2013 ${f.max}`;
    if (f.type === 'string' && f.minLength !== null) return `${f.minLength} \u2013 ${f.maxLength} chars`;
    return '\u2014';
  }

  function renderFields(fields) {
    const body = $('diFieldsBody');
    if (!fields.length) { $('diFieldsWrap')?.classList.add('di-empty'); body.innerHTML = ''; return; }
    body.innerHTML = fields.map((f) => `
      <tr>
        <td class="di-field-path">${escapeHtml(f.path)}</td>
        <td class="di-field-type">${escapeHtml(f.type)}</td>
        <td>${f.nullCount} <span style="color:var(--text-muted);">(${f.nullPercent}%)</span></td>
        <td>${f.uniqueCount}</td>
        <td class="di-field-samples" title="${escapeHtml(f.samples.map(fmtSample).join(', '))}">${escapeHtml(f.samples.map(fmtSample).join(', ') || '\u2014')}</td>
        <td>${rangeText(f)}</td>
        <td class="di-field-actions">
          <button data-transform="${escapeHtml(f.path)}" title="Open this field in Transform Builder">Transform</button>
          <button data-query="${escapeHtml(f.path)}" title="Open this field in JSONPath">Query</button>
          <button data-copy="${escapeHtml(f.path)}" title="Copy field path">Copy</button>
        </td>
      </tr>
    `).join('');

    body.querySelectorAll('[data-transform]').forEach((btn) => btn.addEventListener('click', () => transformField(btn.dataset.transform)));
    body.querySelectorAll('[data-query]').forEach((btn) => btn.addEventListener('click', () => queryField(btn.dataset.query)));
    body.querySelectorAll('[data-copy]').forEach((btn) => btn.addEventListener('click', () => copyPath(btn.dataset.copy)));
  }

  // Transform/Query operate on JSON; if the current input is CSV/XML,
  // convert it to its JSON equivalent first (via the same existing engine
  // parsers the profiler itself uses) so those tools receive data they can
  // actually work with, rather than leaving raw CSV/XML sitting in a
  // JSON-only tool.
  function ensureJsonInput() {
    const text = document.getElementById('input').value;
    const format = detectFormat(text);
    if (format === 'json') return true;
    try {
      const data = format === 'csv' ? window.RecastEngine.csvToJson(text, {}) : window.RecastEngine.xmlToJson(text);
      document.getElementById('input').value = JSON.stringify(data, null, 2);
      window.updateCounts?.();
      window.updateHighlightLayers?.();
      return true;
    } catch (e) {
      window.showToast?.('Could not convert the current input to JSON for this action.');
      return false;
    }
  }

  function transformField(path) {
    if (!ensureJsonInput()) return;
    window.RecastTransformUI.openWithSelectField(path);
  }
  function queryField(path) {
    if (!ensureJsonInput()) return;
    window.setMode('jsonPath');
    const pathInput = $('jsonPathInput');
    if (pathInput) { pathInput.value = path; pathInput.dispatchEvent(new Event('input', { bubbles: true })); }
    document.querySelector('.workbench')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
  function copyPath(path) {
    navigator.clipboard?.writeText(path);
    window.showToast?.(`Copied "${path}"`);
  }

  // ---------------- Run the profile ----------------
  let running = false;
  async function runProfile() {
    if (running) return;
    const text = document.getElementById('input')?.value || '';
    if (!text.trim()) {
      $('diSummary').innerHTML = '';
      $('diWarnings').innerHTML = '';
      $('diFieldsBody').innerHTML = '<tr><td colspan="7" class="di-empty">Paste or load some data to see its profile here.</td></tr>';
      return;
    }
    running = true;
    try {
      const format = detectFormat(text);
      const profile = await window.RecastWorkerClient.runTask('profileDataset', { text, format });
      renderSummary(profile.summary);
      renderWarnings(profile.warnings);
      renderFields(profile.fields);
    } catch (e) {
      $('diFieldsBody').innerHTML = `<tr><td colspan="7" class="di-empty">Could not profile this input: ${escapeHtml(e.message || String(e))}</td></tr>`;
      $('diSummary').innerHTML = '';
      $('diWarnings').innerHTML = '';
    } finally {
      running = false;
    }
  }

  function openInspector() {
    $('dataInspectorPanel').classList.add('show');
    runProfile();
  }
  function closeInspector() {
    $('dataInspectorPanel').classList.remove('show');
  }

  $('dataInspectorToggleBtn')?.addEventListener('click', () => {
    const open = $('dataInspectorPanel').classList.contains('show');
    if (open) closeInspector(); else openInspector();
  });
  $('diCloseBtn')?.addEventListener('click', closeInspector);
  $('diRefreshBtn')?.addEventListener('click', runProfile);

  let debounceTimer;
  document.getElementById('input')?.addEventListener('input', () => {
    if (!$('dataInspectorPanel').classList.contains('show')) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runProfile, 400);
  });
})();
