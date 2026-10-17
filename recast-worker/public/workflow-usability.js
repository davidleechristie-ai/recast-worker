(function () {
  'use strict';

  var HANDOFF_KEY = 'recast_workflow_input_handoff_v1';
  var MAX_LOCAL_HANDOFF = 750000;
  var APP_PATHS = new Set(['/app', '/app/', '/app/index.html']);
  var STARTERS = [
    { label: 'JSON → CSV', name: 'JSON to CSV workflow', steps: [{ mode: 'json2csv', params: {} }] },
    { label: 'CSV → JSON', name: 'CSV to JSON workflow', steps: [{ mode: 'csv2json', params: {} }] },
    { label: 'Flatten JSON → CSV', name: 'Flatten API data to CSV', steps: [{ mode: 'flatten', params: {} }, { mode: 'json2csv', params: {} }] },
    { label: 'Validate JSON', name: 'Validate JSON workflow', steps: [{ mode: 'validateJsonStep', params: {} }] }
  ];

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  function track(name, params) {
    try {
      if (window.RecastFunnel && typeof window.RecastFunnel.track === 'function') window.RecastFunnel.track(name, params || {});
      else if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
    } catch (_) {}
  }

  function currentMode() {
    if (window.RECAST_DEFAULT_MODE) return window.RECAST_DEFAULT_MODE;
    var active = document.querySelector('.mode-chip.active[data-mode]');
    return active ? active.getAttribute('data-mode') : '';
  }

  function currentOptions() {
    var out = {};
    function read(id, key) {
      var el = document.getElementById(id);
      if (!el) return;
      out[key || id] = el.type === 'checkbox' ? !!el.checked : el.value;
    }
    read('delimiter', 'delimiter');
    read('csvDelimiter', 'delimiter');
    read('excelBom', 'excelBom');
    read('prettyPrint', 'pretty');
    read('inferTypes', 'inferTypes');
    read('jsonPathInput', 'path');
    return out;
  }

  function captureToolHandoff() {
    if (!/^\/tools\//.test(location.pathname)) return;
    document.addEventListener('click', function (event) {
      var button = event.target.closest && event.target.closest('#release3WorkflowBtn');
      if (!button) return;
      var input = (document.getElementById('input') || {}).value || '';
      var payload = {
        version: 1,
        mode: currentMode(),
        options: currentOptions(),
        sourcePath: location.pathname,
        createdAt: Date.now(),
        input: input.length <= MAX_LOCAL_HANDOFF ? input : '',
        inputTooLarge: input.length > MAX_LOCAL_HANDOFF
      };
      try { sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(payload)); } catch (_) {}
    }, true);
  }

  function labelMode(mode) {
    var labels = {
      json2csv: 'JSON to CSV', csv2json: 'CSV to JSON', json2xml: 'JSON to XML', xml2json: 'XML to JSON',
      json2yaml: 'JSON to YAML', yaml2json: 'YAML to JSON', flatten: 'Flatten JSON', unflatten: 'Unflatten JSON',
      jsonPath: 'JSONPath extraction', validateJsonStep: 'Validate JSON'
    };
    return labels[mode] || 'Imported workflow';
  }

  function supportedModernMode(mode) {
    return ['json2csv','csv2json','json2xml','xml2json','json2yaml','yaml2json','flatten','unflatten','jsonPath','validateJsonStep'].indexOf(mode) !== -1;
  }

  function starterMarkup() {
    return '<div class="workflow-empty-state"><strong>Start with a useful workflow</strong>' +
      '<p>Choose a common starting point or use “Add step” below to build from scratch.</p>' +
      '<div class="workflow-starters">' + STARTERS.map(function (s, i) {
        return '<button type="button" class="workflow-starter" data-workflow-starter="' + i + '">' + s.label + '</button>';
      }).join('') + '</div></div>';
  }

  function groupStepOptions(select) {
    if (!select || select.dataset.groupingBusy === '1') return;
    var values = Array.from(select.options || []).map(function (o) { return o.value; }).filter(Boolean);
    if (!values.length) return;
    select.dataset.groupingBusy = '1';
    var selected = select.value;
    var labels = {};
    Array.from(select.options).forEach(function (o) { if (o.value) labels[o.value] = o.textContent; });
    var groups = [
      ['Input & extract', ['apiRequest', 'jsonPath', 'select']],
      ['Clean & transform', ['remove', 'rename', 'filter', 'sort', 'typeConversion', 'addField', 'transform', 'flatten', 'unflatten']],
      ['Validate & compare', ['validate', 'compare']],
      ['Convert', ['convert']]
    ];
    select.innerHTML = '<option value="">+ Add step…</option>';
    groups.forEach(function (group) {
      var available = group[1].filter(function (v) { return values.indexOf(v) !== -1; });
      if (!available.length) return;
      var optgroup = document.createElement('optgroup');
      optgroup.label = group[0];
      available.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = labels[value] || value;
        optgroup.appendChild(option);
      });
      select.appendChild(optgroup);
    });
    select.value = values.indexOf(selected) !== -1 ? selected : '';
    select.removeAttribute('data-grouping-busy');
  }

  function inferDownload(preview) {
    var text = preview.value || '';
    var trimmed = text.trim();
    if (/^[\[{]/.test(trimmed)) return { ext: 'json', type: 'application/json' };
    if (/^[^\n,]+,[^\n]+/.test(trimmed) || /\n[^\n,]+,[^\n]+/.test(trimmed)) return { ext: 'csv', type: 'text/csv' };
    if (/^<[^>]+>/.test(trimmed)) return { ext: 'xml', type: 'application/xml' };
    return { ext: 'txt', type: 'text/plain' };
  }

  function enhanceBuilder() {
    var panel = document.getElementById('recipeBuilder2Panel');
    if (!panel || panel.classList.contains('workflow-usability-enhanced')) return false;

    document.body.classList.add('workflow-usability-ready');
    panel.classList.add('workflow-usability-enhanced');

    var toggle = document.getElementById('recipeBuilder2ToggleBtn');
    if (toggle) {
      toggle.textContent = 'Workflow Builder';
      toggle.title = 'Chain multiple operations into a reusable workflow';
      toggle.setAttribute('aria-controls', 'recipeBuilder2Panel');
    }

    var legacyRecipe = document.getElementById('recipeToggleBtn');
    var legacyTransform = document.getElementById('transformBuilderToggleBtn');
    if (legacyRecipe) legacyRecipe.setAttribute('aria-hidden', 'true');
    if (legacyTransform) legacyTransform.setAttribute('aria-hidden', 'true');

    var anchor = document.createElement('span');
    anchor.id = 'workflowBuilder';
    anchor.className = 'workflow-builder-anchor';
    panel.parentNode.insertBefore(anchor, panel);

    var title = panel.querySelector('.rb2-head .title');
    if (title) title.textContent = 'Workflow Builder — Input → steps → output';

    var nameInput = document.getElementById('rb2NameInput');
    if (nameInput) {
      nameInput.placeholder = 'Workflow name';
      nameInput.setAttribute('aria-label', 'Workflow name');
    }

    var run = document.getElementById('rb2RunBtn');
    var save = document.getElementById('rb2SaveBtn');
    var duplicate = document.getElementById('rb2DuplicateBtn');
    var automate = document.getElementById('rb2AutomateBtn');
    if (run) { run.textContent = 'Run workflow'; run.title = 'Run the full workflow against the current input'; }
    if (save) { save.textContent = 'Save workflow'; save.title = 'Save this workflow on this device'; }
    if (duplicate) { duplicate.textContent = 'Duplicate'; duplicate.title = 'Duplicate this saved workflow'; }
    if (automate) {
      automate.textContent = 'Automate →';
      automate.disabled = true;
      automate.setAttribute('aria-disabled', 'true');
      automate.title = 'Run a successful workflow first';
    }

    var head = panel.querySelector('.rb2-head');
    var context = document.createElement('div');
    context.className = 'workflow-builder-context';
    context.innerHTML = '<div><strong>Tools</strong><span>One-off operations for a single job.</span></div>' +
      '<div><strong>Workflows</strong><span>Operations chained together and saved for reuse.</span></div>' +
      '<div><strong>Recipes</strong><span>Ready-made workflow templates you can customise.</span></div>' +
      '<div class="workflow-builder-privacy">Runs stay in this browser by default. Data is only sent to Recast when you explicitly choose hosted API or Automation execution.</div>';
    head.insertAdjacentElement('afterend', context);

    var inputNode = document.getElementById('rb2InputNode');
    if (inputNode) {
      var editInput = document.createElement('button');
      editInput.type = 'button';
      editInput.className = 'workflow-endpoint-action';
      editInput.textContent = 'Edit input';
      editInput.addEventListener('click', function () {
        var input = document.getElementById('input');
        if (!input) return;
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input.focus({ preventScroll: true });
      });
      inputNode.appendChild(editInput);
    }

    var add = document.getElementById('rb2AddStep');
    if (add) {
      add.setAttribute('aria-label', 'Add a workflow step');
      var help = document.createElement('p');
      help.className = 'workflow-add-help';
      help.textContent = 'Add one operation at a time. Configure the selected step on the right; each step receives the previous step’s output.';
      add.parentNode.appendChild(help);
      groupStepOptions(add);
      new MutationObserver(function () { groupStepOptions(add); }).observe(add, { childList: true, subtree: true });
    }

    var errors = document.getElementById('rb2Errors');
    if (errors) {
      errors.setAttribute('role', 'alert');
      errors.setAttribute('aria-live', 'assertive');
    }
    var sideHead = document.getElementById('rb2SideHead');
    if (sideHead) sideHead.setAttribute('aria-live', 'polite');

    var preview = document.getElementById('rb2Preview');
    var previewHead = panel.querySelector('.rb2-preview-head');
    if (preview && previewHead) {
      preview.setAttribute('aria-label', 'Workflow output preview');
      var actions = document.createElement('div');
      actions.className = 'workflow-preview-actions';
      actions.innerHTML = '<button type="button" class="icon-btn" id="workflowCopyOutput">Copy output</button>' +
        '<button type="button" class="icon-btn" id="workflowDownloadOutput">Download output</button>';
      previewHead.insertAdjacentElement('afterend', actions);
      var status = document.createElement('div');
      status.id = 'workflowUtilityStatus';
      status.className = 'workflow-utility-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      actions.insertAdjacentElement('afterend', status);

      document.getElementById('workflowCopyOutput').addEventListener('click', async function () {
        if (!preview.value) return;
        try {
          await navigator.clipboard.writeText(preview.value);
          status.textContent = 'Output copied.';
        } catch (_) {
          preview.focus();
          preview.select();
          try { document.execCommand('copy'); status.textContent = 'Output copied.'; } catch (e) { status.textContent = 'Copy failed — select the output manually.'; }
        }
      });
      document.getElementById('workflowDownloadOutput').addEventListener('click', function () {
        if (!preview.value) return;
        var meta = inferDownload(preview);
        var blob = new Blob([preview.value], { type: meta.type + ';charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        var safeName = ((nameInput && nameInput.value) || 'recast-workflow-output').replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '') || 'recast-workflow-output';
        a.href = url;
        a.download = safeName + '.' + meta.ext;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 0);
        status.textContent = 'Output downloaded.';
      });
    }

    var stepNodes = document.getElementById('rb2StepNodes');
    function improveStepRows() {
      if (!stepNodes) return;
      if (/No steps yet/i.test(stepNodes.textContent || '')) {
        stepNodes.innerHTML = starterMarkup();
        stepNodes.querySelectorAll('[data-workflow-starter]').forEach(function (button) {
          button.addEventListener('click', function () {
            var starter = STARTERS[Number(button.getAttribute('data-workflow-starter'))];
            if (!starter || !window.RecastRecipeBuilder2) return;
            window.RecastRecipeBuilder2.openWithDefinition({ name: starter.name, steps: starter.steps });
            track('workflow_starter_selected', { starter: starter.label });
          });
        });
        return;
      }
      stepNodes.querySelectorAll('.rb2-step').forEach(function (row) {
        row.tabIndex = 0;
        row.setAttribute('role', 'group');
        row.setAttribute('aria-label', (row.querySelector('.rb2-step-name') || {}).textContent || 'Workflow step');
        row.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); row.click(); }
        }, { once: true });
      });
      stepNodes.querySelectorAll('.rb2-step-btns button').forEach(function (button) {
        if (!button.getAttribute('aria-label')) button.setAttribute('aria-label', button.title || 'Step action');
      });
    }
    if (stepNodes) {
      new MutationObserver(improveStepRows).observe(stepNodes, { childList: true, subtree: true });
      improveStepRows();
    }

    var openObserver = new MutationObserver(function () {
      var open = panel.classList.contains('show');
      document.body.classList.toggle('workflow-builder-open', open);
      if (open) {
        var legacyPanel = document.getElementById('recipePanel');
        var transformPanel = document.getElementById('transformBuilderPanel');
        if (legacyPanel) legacyPanel.classList.remove('show');
        if (transformPanel) transformPanel.classList.remove('show');
        var heading = document.getElementById('homeWorkbenchHeading');
        if (heading) heading.textContent = 'Workflow input';
        setTimeout(function () { panel.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 0);
      } else {
        var heading2 = document.getElementById('homeWorkbenchHeading');
        if (heading2) heading2.textContent = 'Workbench';
      }
    });
    openObserver.observe(panel, { attributes: true, attributeFilter: ['class'] });

    setInterval(function () {
      if (!panel.classList.contains('show')) return;
      var hasSteps = !!panel.querySelector('.rb2-step');
      var hasOutput = !!(preview && preview.value.trim());
      var hasError = !!(errors && errors.style.display !== 'none' && errors.textContent.trim());
      var successful = hasSteps && hasOutput && !hasError;
      if (automate) {
        automate.disabled = !successful;
        automate.setAttribute('aria-disabled', successful ? 'false' : 'true');
        automate.title = successful ? 'Save this workflow and continue to hosted Automation' : 'Run a successful workflow first';
      }
    }, 400);

    return true;
  }

  function restoreToolHandoff() {
    if (!APP_PATHS.has(location.pathname)) return;
    var raw = null;
    try { raw = sessionStorage.getItem(HANDOFF_KEY); } catch (_) {}
    if (!raw) return;
    var payload;
    try { payload = JSON.parse(raw); } catch (_) { payload = null; }
    try { sessionStorage.removeItem(HANDOFF_KEY); } catch (_) {}
    if (!payload || payload.version !== 1) return;

    var input = document.getElementById('input');
    if (input && payload.input) {
      input.value = payload.input;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    var attempts = 0;
    (function openModernBuilderWhenReady() {
      attempts++;
      if (window.RecastRecipeBuilder2 && supportedModernMode(payload.mode)) {
        var params = Object.assign({}, payload.options || {});
        if (payload.mode === 'jsonPath' && params.path) params.path = params.path;
        window.RecastRecipeBuilder2.openWithDefinition({
          name: labelMode(payload.mode) + ' workflow',
          steps: [{ mode: payload.mode, params: params }]
        });
        var legacyPanel = document.getElementById('recipePanel');
        if (legacyPanel) legacyPanel.classList.remove('show');
        var status = document.getElementById('workflowUtilityStatus');
        if (status) status.textContent = payload.inputTooLarge ? 'Workflow step restored. The input was too large for session handoff; paste or drop it again.' : 'Input and tool settings restored from the previous tool.';
        track('workflow_handoff_restored', { mode: payload.mode, input_restored: !!payload.input, source_path: payload.sourcePath || '' });
        return;
      }
      if (attempts < 30) setTimeout(openModernBuilderWhenReady, 100);
    })();
  }

  ready(function () {
    captureToolHandoff();
    if (!APP_PATHS.has(location.pathname)) return;
    var attempts = 0;
    (function waitForBuilder() {
      attempts++;
      if (enhanceBuilder()) {
        restoreToolHandoff();
        return;
      }
      if (attempts < 30) setTimeout(waitForBuilder, 100);
    })();
  });
})();
