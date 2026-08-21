/*!
 * Recast Recipe Builder 2.0 — a vertical Input -> Step -> ... -> Output
 * workflow. Every step ultimately runs through the existing BATCH_OPS /
 * RecastTransformBuilder functions (the same ones Transform Builder and
 * the original Recipe panel use), and recipes are saved through the same
 * RecastRecipes storage — this is a new view onto existing machinery, not
 * a parallel system.
 */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);

  // Step "type" as shown in the Add-step dropdown -> the underlying
  // BATCH_OPS mode(s) it can produce. Some types (Convert, Validate) need a
  // secondary choice of exactly which mode; others map 1:1.
  const STEP_TYPES = {
    apiRequest: { label: 'API Request', modes: ['apiRequestStep'] },
    convert: { label: 'Convert', modes: ['json2csv', 'csv2json', 'json2xml', 'xml2json', 'json2yaml', 'yaml2json', 'json2markdown', 'markdown2json'] },
    jsonPath: { label: 'JSONPath', modes: ['jsonPath'] },
    transform: { label: 'Transform (combine fields)', modes: ['transformCombine'] },
    flatten: { label: 'Flatten nested objects', modes: ['flatten'] },
    unflatten: { label: 'Unflatten fields', modes: ['unflatten'] },
    sort: { label: 'Sort', modes: ['sortJson', 'transformSort'] },
    select: { label: 'Select fields', modes: ['transformSelect'] },
    remove: { label: 'Remove fields', modes: ['transformRemove'] },
    rename: { label: 'Rename fields', modes: ['transformRename'] },
    filter: { label: 'Filter', modes: ['transformFilter'] },
    typeConversion: { label: 'Type conversion', modes: ['transformConvertType'] },
    addField: { label: 'Add / default fields', modes: ['transformAddField'] },
    compare: { label: 'Compare', modes: ['compareStep'] },
    validate: { label: 'Validate', modes: ['validateJsonStep', 'validateXmlStep'] },
  };
  const MODE_LABELS = {
    json2csv: 'JSON \u2192 CSV', csv2json: 'CSV \u2192 JSON', json2xml: 'JSON \u2192 XML', xml2json: 'XML \u2192 JSON',
    json2yaml: 'JSON \u2192 YAML', yaml2json: 'YAML \u2192 JSON', json2markdown: 'JSON \u2192 Markdown', markdown2json: 'Markdown \u2192 JSON',
    sortJson: 'Sort object keys', transformSort: 'Sort records by field',
    validateJsonStep: 'Validate JSON', validateXmlStep: 'Validate XML',
    apiRequestStep: 'API Request',
  };

  let steps = []; // { id, type, mode, params }
  let selectedId = null;
  let nextId = 1;
  let dragSrcIndex = null;

  function newStepId() { return 'step-' + (nextId++); }

  function currentInputData() {
    const inputEl = $('input');
    if (!inputEl || !inputEl.value.trim()) return null;
    try { return JSON.parse(inputEl.value); } catch (e) { return null; }
  }
  function fieldPaths() {
    const data = currentInputData();
    return data ? window.RecastTransformBuilder.flattenFieldTree(window.RecastTransformBuilder.discoverFieldTree(data)) : [];
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  // ---------------- Step summaries ----------------
  function stepSummary(step) {
    const p = step.params || {};
    switch (step.mode) {
      case 'transformSelect': return 'Select: ' + (p.paths || []).join(', ');
      case 'transformRemove': return 'Remove: ' + (p.paths || []).join(', ');
      case 'transformRename': return `${p.from} \u2192 ${p.to}`;
      case 'transformFilter': return `${p.field} ${p.condition} ${p.value ?? ''}`.trim();
      case 'transformSort': return `${p.field} (${p.direction})`;
      case 'sortJson': return 'alphabetical, all levels';
      case 'transformConvertType': return `${p.field} \u2192 ${p.type}`;
      case 'transformAddField': return `${p.field} = ${p.value}`;
      case 'transformCombine': return `${p.template} \u2192 ${p.newField}`;
      case 'jsonPath': return p.path || '';
      case 'compareStep': return `vs. reference (${p.format || 'json'})`;
      case 'validateJsonStep': case 'validateXmlStep': return 'must pass to continue';
      case 'apiRequestStep': return `${p.method || 'POST'} ${p.url || ''}`;
      default: return MODE_LABELS[step.mode] || step.mode;
    }
  }
  function stepDisplayName(step) {
    const type = STEP_TYPES[step.type];
    if (type && type.modes.length > 1) return MODE_LABELS[step.mode] || type.label;
    return type ? type.label : step.mode;
  }

  // ---------------- Config forms (mirrors Transform Builder's form patterns) ----------------
  function fieldOptions(selected) {
    return fieldPaths().map((p) => `<option value="${escapeHtml(p.path)}" ${p.path === selected ? 'selected' : ''}>${escapeHtml(p.path)}</option>`).join('');
  }
  function checkboxList(selectedPaths) {
    const sel = new Set(selectedPaths || []);
    return '<div class="tb-checkbox-list">' + fieldPaths().map((p) => `
      <label class="tb-checkbox-row"><input type="checkbox" value="${escapeHtml(p.path)}" ${sel.has(p.path) ? 'checked' : ''}> ${escapeHtml(p.path)}</label>
    `).join('') + '</div>';
  }

  function renderConfigForm(step) {
    const type = STEP_TYPES[step.type];
    const p = step.params || {};
    let html = '';

    if (type.modes.length > 1 && step.type !== 'sort') {
      html += `<label>${step.type === 'validate' ? 'Format' : 'Direction'}</label>
        <select id="rb2Mode">${type.modes.map((m) => `<option value="${m}" ${m === step.mode ? 'selected' : ''}>${escapeHtml(MODE_LABELS[m] || m)}</option>`).join('')}</select>`;
    }

    if (step.type === 'sort') {
      html += `<label>Sort by</label>
        <select id="rb2Mode">${type.modes.map((m) => `<option value="${m}" ${m === step.mode ? 'selected' : ''}>${escapeHtml(MODE_LABELS[m])}</option>`).join('')}</select>`;
      html += `<div id="rb2SortFieldWrap" style="${step.mode === 'transformSort' ? '' : 'display:none;'}">
        <label>Field</label><select id="rb2Field">${fieldOptions(p.field)}</select>
        <label>Direction</label><select id="rb2Direction"><option value="asc" ${p.direction === 'asc' ? 'selected' : ''}>Ascending</option><option value="desc" ${p.direction === 'desc' ? 'selected' : ''}>Descending</option></select>
      </div>`;
    } else if (step.type === 'select' || step.type === 'remove') {
      html += `<label>Fields</label>${checkboxList(p.paths)}`;
    } else if (step.type === 'rename') {
      html += `<label>From field</label><select id="rb2Field">${fieldOptions(p.from)}</select>
        <label>New field name</label><input type="text" id="rb2To" value="${escapeHtml(p.to || '')}">`;
    } else if (step.type === 'filter') {
      html += `<label>Field</label><select id="rb2Field">${fieldOptions(p.field)}</select>
        <label>Condition</label><select id="rb2Condition">${window.RecastTransformBuilder.FILTER_OPS.map((o) => `<option value="${o}" ${o === p.condition ? 'selected' : ''}>${o}</option>`).join('')}</select>
        <label>Value</label><input type="text" id="rb2Value" value="${escapeHtml(p.value ?? '')}">`;
    } else if (step.type === 'typeConversion') {
      html += `<label>Field</label><select id="rb2Field">${fieldOptions(p.field)}</select>
        <label>Convert to</label><select id="rb2Type">${window.RecastTransformBuilder.TYPE_CONVERTERS.map((t) => `<option value="${t}" ${t === p.type ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
    } else if (step.type === 'addField') {
      html += `<label>Field name</label><input type="text" id="rb2FieldName" value="${escapeHtml(p.field || '')}">
        <label>Default value</label><input type="text" id="rb2Value" value="${escapeHtml(p.value ?? '')}">`;
    } else if (step.type === 'transform') {
      html += `<label>Fields (click to insert)</label>${checkboxList([])}
        <label>Template</label><input type="text" id="rb2Template" data-template-input value="${escapeHtml(p.template || '')}" placeholder="e.g. {firstName} {lastName}">
        <label>New field name</label><input type="text" id="rb2NewField" value="${escapeHtml(p.newField || '')}">`;
    } else if (step.type === 'jsonPath') {
      html += `<label>Path</label><input type="text" id="rb2Path" value="${escapeHtml(p.path || '')}" placeholder="e.g. users[*].name">`;
    } else if (step.type === 'compare') {
      html += `<label>Format</label><select id="rb2Format"><option value="json" ${(!p.format || p.format === 'json') ? 'selected' : ''}>JSON</option><option value="xml" ${p.format === 'xml' ? 'selected' : ''}>XML</option><option value="csv" ${p.format === 'csv' ? 'selected' : ''}>CSV</option></select>
        <label>Reference (paste the "before" version)</label><input type="text" id="rb2Reference" value="${escapeHtml(p.reference ? '(reference set \u2014 re-type to change)' : '')}" placeholder="Paste reference data">`;
    } else if (step.type === 'apiRequest') {
      html += `<label>Method</label><select id="rb2Method">${['GET','POST','PUT','PATCH','DELETE'].map((m) => `<option value="${m}" ${m === (p.method || 'POST') ? 'selected' : ''}>${m}</option>`).join('')}</select>
        <label>URL</label><input type="text" id="rb2Url" value="${escapeHtml(p.url || '')}" placeholder="https://tryrecast.app/v1/convert">
        <label>Body / parameters (JSON)</label><input type="text" id="rb2Body" value="${escapeHtml(p.body || '')}" placeholder='{"mode":"json2csv","input":"..."}'>
        <label>Authentication</label>
        <p class="tb-step-summary" style="white-space:normal;">Uses your configured Recast API key at execution time \u2014 the actual key is never stored in this recipe, only this reference: <code>${escapeHtml(p.authRef || 'RECAST_API_KEY')}</code>.</p>`;
    }
    // flatten / unflatten / validate need no per-step fields beyond the mode picker (already added above for validate)

    html += `<div class="tb-form-actions" style="margin-top:12px;"><button class="icon-btn" id="rb2ApplyBtn">Apply</button></div>`;
    return html;
  }

  function readConfigForm(step) {
    const modeSelect = $('rb2Mode');
    if (modeSelect) step.mode = modeSelect.value;
    const params = {};
    if (step.type === 'sort') {
      if (step.mode === 'transformSort') { params.field = $('rb2Field').value; params.direction = $('rb2Direction').value; }
    } else if (step.type === 'select' || step.type === 'remove') {
      params.paths = Array.from(document.querySelectorAll('#rb2Config .tb-checkbox-row input:checked')).map((c) => c.value);
    } else if (step.type === 'rename') {
      params.from = $('rb2Field').value; params.to = $('rb2To').value.trim();
    } else if (step.type === 'filter') {
      params.field = $('rb2Field').value; params.condition = $('rb2Condition').value; params.value = $('rb2Value').value;
    } else if (step.type === 'typeConversion') {
      params.field = $('rb2Field').value; params.type = $('rb2Type').value;
    } else if (step.type === 'addField') {
      params.field = $('rb2FieldName').value.trim(); params.value = $('rb2Value').value;
    } else if (step.type === 'transform') {
      params.template = $('rb2Template').value; params.newField = $('rb2NewField').value.trim();
    } else if (step.type === 'jsonPath') {
      params.path = $('rb2Path').value;
    } else if (step.type === 'compare') {
      params.format = $('rb2Format').value;
      const refInput = $('rb2Reference').value;
      params.reference = (refInput && !refInput.startsWith('(reference set')) ? refInput : (step.params.reference || '');
    } else if (step.type === 'apiRequest') {
      params.method = $('rb2Method').value;
      params.url = $('rb2Url').value.trim();
      params.body = $('rb2Body').value;
      params.authRef = step.params.authRef || 'RECAST_API_KEY'; // fixed symbolic reference, never a real key — not user-editable
    }
    step.params = params;
  }

  // ---------------- Flow rendering ----------------
  function renderFlow() {
    const container = $('rb2StepNodes');
    if (!steps.length) {
      container.innerHTML = '<div class="batch-empty">No steps yet \u2014 add one below.</div>';
    } else {
      container.innerHTML = steps.map((s, i) => `
        <div class="rb2-step ${s.id === selectedId ? 'selected' : ''}" data-id="${s.id}" data-idx="${i}" draggable="true">
          <span class="rb2-step-drag" title="Drag to reorder">\u2630</span>
          <div class="rb2-step-body">
            <div class="rb2-step-name">${i + 1}. ${escapeHtml(stepDisplayName(s))}</div>
            <div class="rb2-step-summary">${escapeHtml(stepSummary(s))}</div>
          </div>
          <div class="rb2-step-btns">
            <button data-edit="${s.id}" title="Edit">\u270e</button>
            <button data-dup="${s.id}" title="Duplicate step">\u2398</button>
            <button data-del="${s.id}" title="Delete">\u2715</button>
          </div>
        </div>
        ${i < steps.length - 1 ? '<div class="rb2-arrow">\u2193</div>' : ''}
      `).join('');
      wireStepRowEvents(container);
    }
    populateAddStepDropdown();
  }

  function wireStepRowEvents(container) {
    container.querySelectorAll('.rb2-step').forEach((row) => {
      row.addEventListener('click', (e) => { if (!e.target.closest('.rb2-step-btns')) selectStep(row.dataset.id); });
      row.addEventListener('dragstart', (e) => { dragSrcIndex = parseInt(row.dataset.idx, 10); row.classList.add('dragging'); });
      row.addEventListener('dragend', () => row.classList.remove('dragging'));
      row.addEventListener('dragover', (e) => e.preventDefault());
      row.addEventListener('drop', (e) => {
        e.preventDefault();
        const destIndex = parseInt(row.dataset.idx, 10);
        if (dragSrcIndex === null || dragSrcIndex === destIndex) return;
        const [moved] = steps.splice(dragSrcIndex, 1);
        steps.splice(destIndex, 0, moved);
        dragSrcIndex = null;
        renderFlow();
        runFullPreview();
      });
    });
    container.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => selectStep(b.dataset.edit)));
    container.querySelectorAll('[data-dup]').forEach((b) => b.addEventListener('click', () => {
      const idx = steps.findIndex((s) => s.id === b.dataset.dup);
      const copy = JSON.parse(JSON.stringify(steps[idx]));
      copy.id = newStepId();
      steps.splice(idx + 1, 0, copy);
      renderFlow();
      runFullPreview();
    }));
    container.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
      steps = steps.filter((s) => s.id !== b.dataset.del);
      if (selectedId === b.dataset.del) { selectedId = null; renderSidePanel(); }
      renderFlow();
      runFullPreview();
    }));
  }

  function populateAddStepDropdown() {
    const sel = $('rb2AddStep');
    sel.innerHTML = '<option value="">+ Add step\u2026</option>' +
      Object.keys(STEP_TYPES).map((t) => `<option value="${t}">${escapeHtml(STEP_TYPES[t].label)}</option>`).join('');
  }

  function selectStep(id) {
    selectedId = id;
    renderFlow();
    renderSidePanel();
    runPreviewUpToSelected();
  }

  // ---------------- Side panel (config + preview) ----------------
  function renderSidePanel() {
    const step = steps.find((s) => s.id === selectedId);
    if (!step) {
      $('rb2SideHead').textContent = 'Select a step to configure it, or click Run to see the full result.';
      $('rb2Config').innerHTML = '';
      return;
    }
    $('rb2SideHead').textContent = 'Configuring: ' + stepDisplayName(step);
    $('rb2Config').innerHTML = renderConfigForm(step);
    const applyBtn = $('rb2ApplyBtn');
    applyBtn.addEventListener('click', () => {
      readConfigForm(step);
      renderFlow();
      renderSidePanel();
      runPreviewUpToSelected();
    });
    const modeSelect = $('rb2Mode');
    if (modeSelect && step.type === 'sort') {
      modeSelect.addEventListener('change', () => {
        $('rb2SortFieldWrap').style.display = modeSelect.value === 'transformSort' ? '' : 'none';
      });
    }
    // Click-to-insert-path into a template input, same convenience as Transform Builder
    document.querySelectorAll('#rb2Config .tb-checkbox-row input').forEach((cb) => {
      cb.addEventListener('click', (e) => {
        const templateInput = document.querySelector('#rb2Config input[data-template-input]');
        if (templateInput && step.type === 'transform') {
          e.preventDefault();
          const path = cb.value;
          const start = templateInput.selectionStart ?? templateInput.value.length;
          templateInput.value = templateInput.value.slice(0, start) + '{' + path + '}' + templateInput.value.slice(start);
          templateInput.focus();
        }
      });
    });
  }

  // ---------------- Preview execution (off the main thread) ----------------
  let previewTimer;
  function debouncedPreview(fn) { clearTimeout(previewTimer); previewTimer = setTimeout(fn, 150); }

  async function runPreviewUpToSelected() {
    const idx = steps.findIndex((s) => s.id === selectedId);
    if (idx === -1) { runFullPreview(); return; }
    debouncedPreview(async () => {
      const inputEl = $('input');
      const text = inputEl ? inputEl.value : '';
      $('rb2PreviewLabel').textContent = 'through step ' + (idx + 1);
      $('rb2Errors').style.display = 'none';
      if (!text.trim()) { $('rb2Preview').value = ''; return; }
      const partialSteps = steps.slice(0, idx + 1);
      try {
        const result = await window.RecastRecipes.runRecipe(text, partialSteps, {});
        if (result.ok) {
          $('rb2Preview').value = result.finalOutput;
        } else {
          const failed = result.stepResults[result.stepResults.length - 1];
          $('rb2Errors').style.display = 'block';
          $('rb2Errors').textContent = 'Step ' + result.stepResults.length + ' failed: ' + failed.error;
          $('rb2Preview').value = result.stepResults.length > 1 ? (result.stepResults[result.stepResults.length - 2].output || '') : text;
        }
        updateEndpointCounts(text, result);
      } catch (e) {
        $('rb2Errors').style.display = 'block';
        $('rb2Errors').textContent = e.message || String(e);
      }
    });
  }

  function runFullPreview() {
    $('rb2PreviewLabel').textContent = steps.length ? '(full recipe)' : '';
    debouncedPreview(async () => {
      const inputEl = $('input');
      const text = inputEl ? inputEl.value : '';
      $('rb2Errors').style.display = 'none';
      if (!text.trim() || !steps.length) { $('rb2Preview').value = ''; updateEndpointCounts(text, null); return; }
      try {
        const result = window.RecastRecipes.runRecipe(text, steps, {});
        $('rb2Preview').value = result.ok ? result.finalOutput : '';
        if (!result.ok) {
          const failed = result.stepResults[result.stepResults.length - 1];
          $('rb2Errors').style.display = 'block';
          $('rb2Errors').textContent = 'Step ' + result.stepResults.length + ' (' + stepDisplayName(steps[result.stepResults.length - 1]) + ') failed: ' + failed.error;
        }
        updateEndpointCounts(text, result);
      } catch (e) {
        $('rb2Errors').style.display = 'block';
        $('rb2Errors').textContent = e.message || String(e);
      }
    });
  }

  function recordCountOf(text) {
    try { return window.RecastTransformBuilder.recordCount(JSON.parse(text)); } catch (e) { return text ? 1 : 0; }
  }
  function updateEndpointCounts(inputText, result) {
    $('rb2InputSummary').textContent = recordCountOf(inputText) + ' records';
    if (result && result.ok) $('rb2OutputSummary').textContent = recordCountOf(result.finalOutput) + ' records (or non-JSON result)';
    else if (result === null) $('rb2OutputSummary').textContent = '\u2014';
  }

  // ---------------- Save / Duplicate / Reset / Run ----------------
  function currentRecipeSteps() {
    return steps.map((s) => ({ mode: s.mode, params: s.params || {} }));
  }

  function renderSavedRecipes() {
    const recipes = window.RecastRecipes.load();
    const wrap = $('rb2SavedWrap');
    if (!recipes.length) { wrap.style.display = 'none'; return; }
    wrap.style.display = '';
    $('rb2SavedList').innerHTML = recipes.map((r) => `
      <div class="recipe-saved-row" data-name="${escapeHtml(r.name)}">
        <span class="rname" data-load="${escapeHtml(r.name)}">${escapeHtml(r.name)}</span>
        <span class="rsteps">v${r.version || 1} \u00b7 ${(r.steps || []).length} step${(r.steps || []).length === 1 ? '' : 's'}</span>
        <button class="fremove" data-delete="${escapeHtml(r.name)}" title="Delete">\u2715</button>
      </div>
    `).join('');
    $('rb2SavedList').querySelectorAll('[data-load]').forEach((el) => el.addEventListener('click', () => loadRecipeIntoBuilder(el.dataset.load)));
    $('rb2SavedList').querySelectorAll('[data-delete]').forEach((el) => el.addEventListener('click', () => { window.RecastRecipes.remove(el.dataset.delete); renderSavedRecipes(); }));
  }

  function typeForMode(mode) {
    for (const t in STEP_TYPES) if (STEP_TYPES[t].modes.includes(mode)) return t;
    return 'convert'; // fallback for any BATCH_OPS mode not explicitly categorized (e.g. a plain codegen step)
  }
  function loadRecipeIntoBuilder(name) {
    const recipe = window.RecastRecipes.load().find((r) => r.name === name);
    if (!recipe) return;
    steps = (recipe.steps || []).map((s) => ({ id: newStepId(), type: typeForMode(s.mode), mode: s.mode, params: s.params || {} }));
    $('rb2NameInput').value = recipe.name;
    selectedId = null;
    renderFlow();
    renderSidePanel();
    runFullPreview();
    showToastSafe(`Loaded recipe "${name}"`);
  }
  function showToastSafe(msg) { if (window.showToast) window.showToast(msg); else alert(msg); }

  // ---------------- Wiring ----------------
  function openBuilder() {
    $('recipeBuilder2Panel').classList.add('show');
    renderFlow();
    renderSidePanel();
    renderSavedRecipes();
    runFullPreview();
  }
  function closeBuilder() { $('recipeBuilder2Panel').classList.remove('show'); }

  $('recipeBuilder2ToggleBtn')?.addEventListener('click', () => {
    const open = $('recipeBuilder2Panel').classList.contains('show');
    if (open) closeBuilder(); else openBuilder();
  });
  $('rb2CloseBtn')?.addEventListener('click', closeBuilder);
  $('rb2ResetBtn')?.addEventListener('click', () => {
    steps = []; selectedId = null;
    renderFlow(); renderSidePanel(); runFullPreview();
  });
  $('rb2RunBtn')?.addEventListener('click', () => { selectedId = null; renderFlow(); renderSidePanel(); runFullPreview(); });
  $('rb2AddStep')?.addEventListener('change', (e) => {
    const type = e.target.value;
    if (!type) return;
    if (steps.length >= window.RecastRecipes.MAX_STEPS) { showToastSafe('Recipes are capped at ' + window.RecastRecipes.MAX_STEPS + ' steps'); e.target.value = ''; return; }
    const mode = STEP_TYPES[type].modes[0];
    const id = newStepId();
    steps.push({ id, type, mode, params: {} });
    e.target.value = '';
    renderFlow();
    selectStep(id);
  });
  $('rb2SaveBtn')?.addEventListener('click', () => {
    const name = $('rb2NameInput').value.trim();
    if (!name) { showToastSafe('Give the recipe a name first'); return; }
    if (!steps.length) { showToastSafe('Add at least one step first'); return; }
    window.RecastRecipes.upsert({ name, steps: currentRecipeSteps() });
    renderSavedRecipes();
    showToastSafe(`Saved recipe "${name}"`);
  });
  $('rb2DuplicateBtn')?.addEventListener('click', () => {
    const name = $('rb2NameInput').value.trim();
    if (!name) { showToastSafe('Save the recipe first, then duplicate it'); return; }
    const copyName = window.RecastRecipes.duplicate(name);
    if (copyName) { renderSavedRecipes(); showToastSafe(`Duplicated as "${copyName}"`); }
    else showToastSafe('Save the recipe first, then duplicate it');
  });

  $('input')?.addEventListener('input', () => {
    if ($('recipeBuilder2Panel').classList.contains('show')) {
      if (selectedId) runPreviewUpToSelected(); else runFullPreview();
    }
  });

  // ---------------- Public API (used by the API playground's "Create
  // Recipe" / "Save request as recipe" actions) ----------------
  function openWithApiRequestStep(apiParams) {
    steps = [{ id: newStepId(), type: 'apiRequest', mode: 'apiRequestStep', params: apiParams }];
    selectedId = steps[0].id;
    $('recipeBuilder2Panel').classList.add('show');
    renderFlow();
    renderSidePanel();
    renderSavedRecipes();
    runFullPreview();
  }
  window.RecastRecipeBuilder2 = { openWithApiRequestStep: openWithApiRequestStep };
})();
