(function () {
  'use strict';

  var HANDOFF_KEY = 'recast_tool_workflow_handoff_v1';
  var AUTOMATION_KEY = 'recast_workflow_automation_handoff_v1';
  var USE_COUNT_KEY = 'recast_release3_success_count_v1';
  var SUPPORTED_MODES = new Set([
    'json2csv', 'csv2json', 'json2xml', 'xml2json',
    'json2yaml', 'yaml2json', 'flatten', 'unflatten', 'jsonSchema', 'jsonPath'
  ]);
  var API_MODES = new Set([
    'json2csv', 'csv2json', 'json2xml', 'xml2json', 'json2yaml', 'yaml2json',
    'flatten', 'unflatten', 'validateJson', 'validateXml', 'validateSchema',
    'jsonSchema', 'diffJson', 'diffCsv', 'diffXml'
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

  function activeMode(allowed) {
    if (window.RECAST_DEFAULT_MODE && allowed.has(window.RECAST_DEFAULT_MODE)) return window.RECAST_DEFAULT_MODE;
    var active = document.querySelector('.mode-chip.active[data-mode]');
    var mode = active && active.getAttribute('data-mode');
    return allowed.has(mode) ? mode : null;
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
    var jsonPath = document.getElementById('jsonPathInput');
    if (jsonPath) out.path = String(jsonPath.value || '').slice(0, 500);
    return out;
  }

  function currentWork() {
    return {
      input: (document.getElementById('input') || {}).value || '',
      inputA: (document.getElementById('inputA') || {}).value || '',
      inputB: (document.getElementById('inputB') || {}).value || '',
      output: (document.getElementById('output') || {}).value || ''
    };
  }

  function toolSlug() {
    var match = location.pathname.match(/^\/tools\/([^/]+?)(?:\.html)?$/);
    return match ? match[1] : '';
  }

  function successfulUseCount() {
    try {
      var next = Math.min(99, parseInt(sessionStorage.getItem(USE_COUNT_KEY) || '0', 10) + 1);
      sessionStorage.setItem(USE_COUNT_KEY, String(next));
      return next;
    } catch (_) { return 1; }
  }

  function renderToolNudge(mode, count) {
    if (document.getElementById('release3WorkflowNudge')) return;
    var status = document.getElementById('status');
    if (!status) return;

    var canWorkflow = SUPPORTED_MODES.has(mode);
    var canApi = API_MODES.has(mode);
    if (!canWorkflow && !canApi) return;

    var box = document.createElement('div');
    box.id = 'release3WorkflowNudge';
    box.style.cssText = 'margin-top:12px;padding:14px 16px;border:1px solid rgba(168,85,247,.35);border-radius:12px;background:rgba(168,85,247,.08);display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap';
    var repeatCopy = count >= 3 ? 'You have used Recast several times this session. Save repeat work as a workflow or move recurring execution to a paid plan.' : 'Start a reusable workflow with this operation and its current settings.';
    var actions = '';
    if (canWorkflow) actions += '<button type="button" id="release3WorkflowBtn" class="btn primary">Create workflow</button>';
    if (mode === 'jsonPath') actions += '<button type="button" id="release3JsonPathCsvBtn" class="btn primary">Export matches to CSV</button>';
    if (mode === 'jsonSchema') actions += '<button type="button" id="release3SchemaValidateBtn" class="btn primary">Validate with this schema</button>';
    if (mode === 'diffJson') actions += '<a id="release3RecurringCompareBtn" class="btn primary" href="/automation/?source=json-diff">Run this comparison regularly</a>';
    if (canApi) actions += '<a id="release3ApiBtn" class="btn" href="/api/index.html?source=tool&mode=' + encodeURIComponent(mode) + '">Use via API</a>';
    if (count >= 3) actions += '<a id="release3ProBtn" class="btn" href="/#pricing">Compare plans</a>';
    box.innerHTML = '<div><strong>Need to repeat this?</strong><div style="margin-top:3px;color:var(--text-muted,#94a3b8);font-size:.92rem">' + repeatCopy + '</div></div><div style="display:flex;gap:8px;flex-wrap:wrap">' + actions + '</div>';
    status.insertAdjacentElement('afterend', box);

    var workflowBtn = document.getElementById('release3WorkflowBtn');
    if (workflowBtn) workflowBtn.addEventListener('click', function () {
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

    var jsonPathCsvBtn = document.getElementById('release3JsonPathCsvBtn');
    if (jsonPathCsvBtn) jsonPathCsvBtn.addEventListener('click', function () {
      var work = currentWork();
      var csvChip = document.querySelector('.mode-chip[data-mode="json2csv"]');
      if (!csvChip || !work.output) return;
      csvChip.click();
      var input = document.getElementById('input');
      input.value = work.output;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      track('jsonpath_to_csv_started', { source_path: location.pathname, path: safeOptions().path || '' });
      document.getElementById('release3WorkflowNudge')?.remove();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    var schemaValidateBtn = document.getElementById('release3SchemaValidateBtn');
    if (schemaValidateBtn) schemaValidateBtn.addEventListener('click', function () {
      var work = currentWork();
      var validateChip = document.querySelector('.mode-chip[data-mode="validateSchema"]');
      if (!validateChip || !work.output) return;
      validateChip.click();
      var schema = document.getElementById('inputA');
      var data = document.getElementById('inputB');
      schema.value = work.output;
      data.value = work.input;
      schema.dispatchEvent(new Event('input', { bubbles: true }));
      data.dispatchEvent(new Event('input', { bubbles: true }));
      track('schema_to_validation_started', { source_path: location.pathname });
      document.getElementById('release3WorkflowNudge')?.remove();
      schema.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    var apiBtn = document.getElementById('release3ApiBtn');
    if (apiBtn) apiBtn.addEventListener('click', function () {
      track('api_documentation_viewed', { mode: mode, tool: toolSlug(), source_path: location.pathname });
    });

    var proBtn = document.getElementById('release3ProBtn');
    if (proBtn) proBtn.addEventListener('click', function () {
      track('pricing_viewed', { reason: 'repeat_success', success_count: count, mode: mode });
    });
  }

  function setupToolSuccessJourney() {
    if (!/^\/tools\//.test(location.pathname)) return;
    var runBtn = document.getElementById('convertBtn');
    var status = document.getElementById('status');
    if (!runBtn || !status) return;

    var awaitingResult = false;
    runBtn.addEventListener('click', function () { awaitingResult = true; });

    var observer = new MutationObserver(function () {
      if (!awaitingResult || !status.querySelector('.status-ok')) return;
      awaitingResult = false;
      var mode = activeMode(new Set(Array.from(SUPPORTED_MODES).concat(Array.from(API_MODES))));
      if (!mode) return;
      var count = successfulUseCount();
      track('successful_tool_use', { mode: mode, tool: toolSlug(), source_path: location.pathname });
      renderToolNudge(mode, count);
    });
    observer.observe(status, { childList: true, subtree: true, characterData: true });

    var upgrade = document.querySelector('#upgradeNudge a[href="#pricing"]');
    if (upgrade) upgrade.addEventListener('click', function () {
      track('pricing_viewed', { reason: 'product_limit', mode: activeMode(new Set(Array.from(SUPPORTED_MODES).concat(Array.from(API_MODES)))) || 'unknown' });
    });
  }

  function applyOption(id, value) {
    var el = document.getElementById(id);
    if (!el || value === undefined) return;
    if (el.type === 'checkbox') el.checked = !!value;
    else el.value = String(value);
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function renderAutomationNudge() {
    if (document.getElementById('release3AutomationNudge')) return;
    var panel = document.getElementById('recipePanel') || document.querySelector('main');
    if (!panel) return;
    var box = document.createElement('div');
    box.id = 'release3AutomationNudge';
    box.style.cssText = 'margin:14px 0;padding:14px 16px;border:1px solid rgba(56,189,248,.3);border-radius:12px;background:rgba(56,189,248,.07)';
    box.innerHTML = '<strong>Run this workflow without keeping the browser open</strong><p style="margin:6px 0 10px;color:var(--text-muted,#94a3b8);font-size:.92rem">Automation uses hosted execution for schedules and webhooks. Data for a hosted run is sent to Recast for server-side processing only after you explicitly configure and start that hosted workflow.</p><a id="release3AutomationBtn" class="btn primary" href="/automation/?source=workflow">Configure Automation</a>';
    panel.appendChild(box);
    document.getElementById('release3AutomationBtn').addEventListener('click', function () {
      var payload = { version: 1, source: 'saved_workflow', mode: activeMode(SUPPORTED_MODES) || '', createdAt: Date.now() };
      try { sessionStorage.setItem(AUTOMATION_KEY, JSON.stringify(payload)); } catch (_) {}
      track('automation_configuration_started', { source: 'workflow', mode: payload.mode, processing: 'hosted' });
    });
  }

  function setupWorkbenchHandoff() {
    if (!(location.pathname === '/app' || location.pathname === '/app/' || location.pathname === '/app/index.html')) return;
    var raw = null;
    try { raw = sessionStorage.getItem(HANDOFF_KEY); } catch (_) {}
    if (raw) {
      var handoff;
      try { handoff = JSON.parse(raw); } catch (_) { handoff = null; }
      if (handoff && handoff.version === 1 && SUPPORTED_MODES.has(handoff.mode)) {
        var chip = document.querySelector('.mode-chip[data-mode="' + handoff.mode + '"]');
        if (chip) chip.click();
        applyOption('delimiter', handoff.options && handoff.options.delimiter);
        applyOption('excelBom', handoff.options && handoff.options.excelBom);
        applyOption('prettyPrint', handoff.options && handoff.options.pretty);
        applyOption('inferTypes', handoff.options && handoff.options.inferTypes);
        applyOption('jsonPathInput', handoff.options && handoff.options.path);

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
    }

    var toast = document.getElementById('shareToast');
    if (toast) {
      new MutationObserver(function () {
        if (/Saved recipe/i.test(toast.textContent || '')) {
          track('workflow_saved', { source: 'workbench' });
          renderAutomationNudge();
        }
      }).observe(toast, { childList: true, subtree: true, characterData: true });
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
