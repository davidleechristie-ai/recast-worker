(function () {
  'use strict';

  var HANDOFF_KEY = 'recast_tool_workflow_handoff_v1';
  var SUPPORTED_MODES = new Set([
    'json2csv', 'csv2json', 'json2xml', 'xml2json',
    'json2yaml', 'yaml2json', 'flatten', 'unflatten'
  ]);

  function track(name, params) {
    try {
      if (typeof window.RecastFunnel === 'object' && typeof window.RecastFunnel.track === 'function') {
        window.RecastFunnel.track(name, params || {});
        return;
      }
      if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
    } catch (_) {}
  }

  function currentMode() {
    if (window.RECAST_DEFAULT_MODE && SUPPORTED_MODES.has(window.RECAST_DEFAULT_MODE)) return window.RECAST_DEFAULT_MODE;
    var active = document.querySelector('.mode-chip.active[data-mode]');
    var mode = active && active.getAttribute('data-mode');
    return SUPPORTED_MODES.has(mode) ? mode : null;
  }

  function safeOptions() {
    var out = {};
    var delimiter = document.getElementById('delimiter');
    var excelBom = document.getElementById('excelBom');
    var pretty = document.getElementById('prettyPrint');
    var infer = document.getElementById('inferTypes');
    if (delimiter && delimiter.tagName === 'SELECT') out.delimiter = String(delimiter.value || '').slice(0, 8);
    if (excelBom) out.excelBom = !!excelBom.checked;
    if (pretty) out.pretty = !!pretty.checked;
    if (infer) out.inferTypes = !!infer.checked;
    return out;
  }

  function toolSlug() {
    var match = location.pathname.match(/^\/tools\/([^/]+?)(?:\.html)?$/);
    return match ? match[1] : '';
  }

  function renderNudge(mode) {
    if (document.getElementById('release3WorkflowNudge')) return;
    var status = document.getElementById('status');
    if (!status) return;

    var box = document.createElement('div');
    box.id = 'release3WorkflowNudge';
    box.style.cssText = 'margin-top:12px;padding:14px 16px;border:1px solid rgba(168,85,247,.35);border-radius:12px;background:rgba(168,85,247,.08);display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap';
    box.innerHTML = '<div><strong>Need to repeat this?</strong><div style="margin-top:3px;color:var(--text-muted,#94a3b8);font-size:.92rem">Start a reusable workflow with this operation and its current settings.</div></div><button type="button" id="release3WorkflowBtn" class="btn primary">Create workflow</button>';
    status.insertAdjacentElement('afterend', box);

    var btn = document.getElementById('release3WorkflowBtn');
    btn.addEventListener('click', function () {
      var payload = {
        version: 1,
        mode: mode,
        options: safeOptions(),
        sourcePath: location.pathname,
        tool: toolSlug(),
        createdAt: Date.now()
      };
      try { sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(payload)); } catch (_) {}
      track('workflow_handoff_started', { mode: mode, tool: payload.tool, source_path: payload.sourcePath });
      location.href = '/app/?from_tool=' + encodeURIComponent(payload.tool) + '#workflowBuilder';
    });
  }

  function setupToolSuccessJourney() {
    if (!/^\/tools\//.test(location.pathname)) return;
    var mode = currentMode();
    if (!mode) return;
    var runBtn = document.getElementById('convertBtn');
    var status = document.getElementById('status');
    if (!runBtn || !status) return;

    var awaitingResult = false;
    runBtn.addEventListener('click', function () { awaitingResult = true; });

    var observer = new MutationObserver(function () {
      if (!awaitingResult) return;
      if (!status.querySelector('.status-ok')) return;
      awaitingResult = false;
      track('successful_tool_use', { mode: mode, tool: toolSlug(), source_path: location.pathname });
      renderNudge(mode);
    });
    observer.observe(status, { childList: true, subtree: true, characterData: true });
  }

  function applyOption(id, value) {
    var el = document.getElementById(id);
    if (!el || value === undefined) return;
    if (el.type === 'checkbox') el.checked = !!value;
    else el.value = String(value);
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function setupWorkbenchHandoff() {
    if (!(location.pathname === '/app' || location.pathname === '/app/' || location.pathname === '/app/index.html')) return;
    var raw = null;
    try { raw = sessionStorage.getItem(HANDOFF_KEY); } catch (_) {}
    if (!raw) return;

    var handoff;
    try { handoff = JSON.parse(raw); } catch (_) { return; }
    if (!handoff || handoff.version !== 1 || !SUPPORTED_MODES.has(handoff.mode)) return;

    var chip = document.querySelector('.mode-chip[data-mode="' + handoff.mode + '"]');
    if (chip) chip.click();
    applyOption('delimiter', handoff.options && handoff.options.delimiter);
    applyOption('excelBom', handoff.options && handoff.options.excelBom);
    applyOption('prettyPrint', handoff.options && handoff.options.pretty);
    applyOption('inferTypes', handoff.options && handoff.options.inferTypes);

    var toggle = document.getElementById('recipeToggleBtn');
    var panel = document.getElementById('recipePanel');
    if (toggle && panel && !panel.classList.contains('show')) toggle.click();

    var add = document.getElementById('recipeAddStep');
    if (add && Array.prototype.some.call(add.options || [], function (o) { return o.value === handoff.mode; })) {
      add.value = handoff.mode;
      add.dispatchEvent(new Event('change', { bubbles: true }));
      track('workflow_created_from_tool', {
        mode: handoff.mode,
        tool: handoff.tool || '',
        source_path: handoff.sourcePath || '',
        transfer: 'operation_and_categorical_settings'
      });
      try { sessionStorage.removeItem(HANDOFF_KEY); } catch (_) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setupToolSuccessJourney();
      setupWorkbenchHandoff();
    });
  } else {
    setupToolSuccessJourney();
    setupWorkbenchHandoff();
  }
})();
