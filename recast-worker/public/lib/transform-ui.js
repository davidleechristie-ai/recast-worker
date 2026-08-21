/*!
 * Recast Transform Builder UI — the visual workspace: field tree, step
 * list (add/edit/delete/reorder), live preview, undo/redo, and saving the
 * result as an ordinary recipe. All actual transformation logic lives in
 * transform-builder.js; this file is wiring only.
 */
(function () {
  'use strict';
  const TB = window.RecastTransformBuilder;
  const $ = (id) => document.getElementById(id);

  let steps = [];
  let history = [[]];
  let historyIndex = 0;
  let editingIndex = null; // index of the step currently being edited, or null when adding new

  // Maps a builder op to the recipe-compatible BATCH_OPS mode name that
  // performs the identical operation, so "Save as Recipe" produces a
  // completely ordinary recipe the existing runner already knows how to run.
  const OP_TO_RECIPE_MODE = {
    select: 'transformSelect', remove: 'transformRemove', rename: 'transformRename',
    filter: 'transformFilter', sort: 'transformSort', convertType: 'transformConvertType',
    addField: 'transformAddField', combine: 'transformCombine',
    flatten: 'flatten', unflatten: 'unflatten', sortKeys: 'sortJson',
  };
  const OP_LABELS = {
    select: 'Select fields', remove: 'Remove fields', rename: 'Rename field',
    filter: 'Filter records', sort: 'Sort records', convertType: 'Convert type',
    addField: 'Add / default field', combine: 'Combine fields',
    flatten: 'Flatten nested objects', unflatten: 'Unflatten fields', sortKeys: 'Sort keys',
  };

  function currentInputData() {
    const inputEl = $('input');
    if (!inputEl || !inputEl.value.trim()) return null;
    try { return JSON.parse(inputEl.value); } catch (e) { return null; }
  }

  function pushHistory() {
    history = history.slice(0, historyIndex + 1);
    history.push(JSON.parse(JSON.stringify(steps)));
    historyIndex = history.length - 1;
    updateUndoRedoButtons();
  }
  function updateUndoRedoButtons() {
    $('tbUndoBtn').disabled = historyIndex <= 0;
    $('tbRedoBtn').disabled = historyIndex >= history.length - 1;
  }

  // ---------------- Field tree ----------------
  function renderFieldTree() {
    const data = currentInputData();
    const el = $('tbFieldTree');
    if (!data) { el.innerHTML = '<div class="batch-empty">Paste valid JSON in the input to see its fields here.</div>'; return; }
    const tree = TB.discoverFieldTree(data);
    const paths = TB.flattenFieldTree(tree);
    if (!paths.length) { el.innerHTML = '<div class="batch-empty">No object fields found \u2014 the top level isn\u2019t an object or array of objects.</div>'; return; }
    el.innerHTML = paths.map((p) => {
      const depth = p.path.split('.').length - 1;
      return `<div class="tb-field-row" data-path="${escapeHtml(p.path)}" style="padding-left:${depth * 14 + 4}px;">${escapeHtml(p.path.split('.').pop())}<span class="tb-field-type">${p.type}</span></div>`;
    }).join('');
    el.querySelectorAll('.tb-field-row').forEach((row) => {
      row.addEventListener('click', () => handleFieldClick(row.dataset.path));
    });
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  function handleFieldClick(path) {
    const form = $('tbStepForm');
    if (form.style.display === 'none') return;
    // Multi-select checkbox list (select/remove/combine forms)
    const cb = form.querySelector(`.tb-checkbox-row input[value="${cssEscape(path)}"]`);
    if (cb) { cb.checked = !cb.checked; return; }
    // Single-field dropdown (filter/sort/rename/convertType/addField target)
    const singleSelect = form.querySelector('select[data-field-picker]');
    if (singleSelect) { singleSelect.value = path; return; }
    // Combine template textarea: insert {path} at cursor
    const templateInput = form.querySelector('input[data-template-input]');
    if (templateInput) {
      const insertion = '{' + path + '}';
      const start = templateInput.selectionStart ?? templateInput.value.length;
      const end = templateInput.selectionEnd ?? templateInput.value.length;
      templateInput.value = templateInput.value.slice(0, start) + insertion + templateInput.value.slice(end);
      templateInput.focus();
    }
  }
  function cssEscape(s) { return String(s).replace(/["\\]/g, '\\$&'); }

  // ---------------- Step forms ----------------
  function fieldOptions(selectedValue) {
    const data = currentInputData();
    const paths = data ? TB.flattenFieldTree(TB.discoverFieldTree(data)) : [];
    return paths.map((p) => `<option value="${escapeHtml(p.path)}" ${p.path === selectedValue ? 'selected' : ''}>${escapeHtml(p.path)}</option>`).join('');
  }
  function checkboxList(selectedPaths) {
    const data = currentInputData();
    const paths = data ? TB.flattenFieldTree(TB.discoverFieldTree(data)) : [];
    const sel = new Set(selectedPaths || []);
    return '<div class="tb-checkbox-list">' + paths.map((p) => `
      <label class="tb-checkbox-row"><input type="checkbox" value="${escapeHtml(p.path)}" ${sel.has(p.path) ? 'checked' : ''}> ${escapeHtml(p.path)}</label>
    `).join('') + '</div>';
  }

  function showStepForm(op, existingParams, editIdx) {
    editingIndex = editIdx ?? null;
    const p = existingParams || {};
    const form = $('tbStepForm');
    let html = '';
    if (op === 'select' || op === 'remove') {
      html = `<label>Fields</label>${checkboxList(p.paths)}`;
    } else if (op === 'rename') {
      html = `<label>From field</label><select data-field-picker>${fieldOptions(p.from)}</select>
              <label>New field name</label><input type="text" id="tbInputTo" value="${escapeHtml(p.to || '')}" placeholder="e.g. city">`;
    } else if (op === 'filter') {
      html = `<label>Field</label><select data-field-picker>${fieldOptions(p.field)}</select>
              <label>Condition</label>
              <select id="tbInputCondition">${TB.FILTER_OPS.map((o) => `<option value="${o}" ${o === p.condition ? 'selected' : ''}>${o}</option>`).join('')}</select>
              <label>Value</label><input type="text" id="tbInputValue" value="${escapeHtml(p.value ?? '')}" placeholder="(not needed for exists / is null)">`;
    } else if (op === 'sort') {
      html = `<label>Field</label><select data-field-picker>${fieldOptions(p.field)}</select>
              <label>Direction</label><select id="tbInputDirection"><option value="asc" ${p.direction === 'asc' ? 'selected' : ''}>Ascending</option><option value="desc" ${p.direction === 'desc' ? 'selected' : ''}>Descending</option></select>`;
    } else if (op === 'convertType') {
      html = `<label>Field</label><select data-field-picker>${fieldOptions(p.field)}</select>
              <label>Convert to</label><select id="tbInputType">${TB.TYPE_CONVERTERS.map((t) => `<option value="${t}" ${t === p.type ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
    } else if (op === 'addField') {
      html = `<label>Field name</label><input type="text" id="tbInputField" value="${escapeHtml(p.field || '')}" placeholder="e.g. status">
              <label>Default value</label><input type="text" id="tbInputValue" value="${escapeHtml(p.value ?? '')}" placeholder="e.g. pending">`;
    } else if (op === 'combine') {
      html = `<label>Fields (click to insert into template)</label>${checkboxList([])}
              <label>Template</label><input type="text" data-template-input id="tbInputTemplate" value="${escapeHtml(p.template || '')}" placeholder="e.g. {firstName} {lastName}">
              <label>New field name</label><input type="text" id="tbInputNewField" value="${escapeHtml(p.newField || '')}" placeholder="e.g. fullName">`;
    } else {
      // flatten / unflatten / sortKeys — no configuration needed
      html = `<p class="tb-step-summary">No configuration needed \u2014 uses the existing ${escapeHtml(OP_LABELS[op] || op)} behavior.</p>`;
    }
    html += `<div class="tb-form-actions">
      <button class="icon-btn" id="tbFormSubmit">${editIdx != null ? 'Update step' : 'Add step'}</button>
      <button class="icon-btn" id="tbFormCancel">Cancel</button>
    </div>`;
    form.innerHTML = html;
    form.style.display = 'block';
    form.dataset.op = op;
    $('tbFormSubmit').addEventListener('click', () => submitStepForm(op));
    $('tbFormCancel').addEventListener('click', closeStepForm);
  }

  function closeStepForm() {
    $('tbStepForm').style.display = 'none';
    $('tbStepForm').innerHTML = '';
    $('tbAddStep').value = '';
    editingIndex = null;
  }

  function submitStepForm(op) {
    const form = $('tbStepForm');
    let params = {};
    if (op === 'select' || op === 'remove') {
      params.paths = Array.from(form.querySelectorAll('.tb-checkbox-row input:checked')).map((c) => c.value);
      if (!params.paths.length) { showToastSafe('Pick at least one field'); return; }
    } else if (op === 'rename') {
      params.from = form.querySelector('select[data-field-picker]').value;
      params.to = $('tbInputTo').value.trim();
      if (!params.from || !params.to) { showToastSafe('Both fields are required'); return; }
    } else if (op === 'filter') {
      params.field = form.querySelector('select[data-field-picker]').value;
      params.condition = $('tbInputCondition').value;
      params.value = $('tbInputValue').value;
      if (!params.field) { showToastSafe('Pick a field'); return; }
    } else if (op === 'sort') {
      params.field = form.querySelector('select[data-field-picker]').value;
      params.direction = $('tbInputDirection').value;
      if (!params.field) { showToastSafe('Pick a field'); return; }
    } else if (op === 'convertType') {
      params.field = form.querySelector('select[data-field-picker]').value;
      params.type = $('tbInputType').value;
      if (!params.field) { showToastSafe('Pick a field'); return; }
    } else if (op === 'addField') {
      params.field = $('tbInputField').value.trim();
      params.value = $('tbInputValue').value;
      if (!params.field) { showToastSafe('Give the field a name'); return; }
    } else if (op === 'combine') {
      params.template = $('tbInputTemplate').value;
      params.newField = $('tbInputNewField').value.trim();
      if (!params.template || !params.newField) { showToastSafe('Both a template and a new field name are required'); return; }
    }
    if (editingIndex != null) steps[editingIndex] = { op, params };
    else steps.push({ op, params });
    pushHistory();
    closeStepForm();
    renderStepList();
    runPipelinePreview();
  }
  function showToastSafe(msg) { if (window.showToast) window.showToast(msg); else alert(msg); }

  // ---------------- Step list (mirrors the existing Recipe step list pattern) ----------------
  function stepSummary(step) {
    const p = step.params || {};
    switch (step.op) {
      case 'select': return 'Select: ' + p.paths.join(', ');
      case 'remove': return 'Remove: ' + p.paths.join(', ');
      case 'rename': return `${p.from} \u2192 ${p.to}`;
      case 'filter': return `${p.field} ${p.condition} ${p.value ?? ''}`.trim();
      case 'sort': return `${p.field} (${p.direction})`;
      case 'convertType': return `${p.field} \u2192 ${p.type}`;
      case 'addField': return `${p.field} = ${p.value}`;
      case 'combine': return `${p.template} \u2192 ${p.newField}`;
      default: return OP_LABELS[step.op] || step.op;
    }
  }

  function renderStepList() {
    const listEl = $('tbStepList');
    if (!steps.length) {
      listEl.innerHTML = '<div class="batch-empty">No steps yet \u2014 pick an operation above to add one. Each step\u2019s output feeds into the next.</div>';
      return;
    }
    listEl.innerHTML = steps.map((s, i) => `
      <div class="batch-file-row" data-idx="${i}">
        <span class="recipe-step-num">${i + 1}</span>
        <span class="fname">${escapeHtml(OP_LABELS[s.op] || s.op)}</span>
        <span class="tb-step-summary">${escapeHtml(stepSummary(s))}</span>
        <div class="recipe-step-btns">
          <button data-up="${i}" ${i === 0 ? 'disabled' : ''} title="Move up">\u2191</button>
          <button data-down="${i}" ${i === steps.length - 1 ? 'disabled' : ''} title="Move down">\u2193</button>
          <button data-edit="${i}" title="Edit">\u270e</button>
          <button data-remove="${i}" title="Remove">\u2715</button>
        </div>
      </div>
    `).join('');
    listEl.querySelectorAll('[data-remove]').forEach((btn) => btn.addEventListener('click', () => {
      steps.splice(parseInt(btn.dataset.remove, 10), 1);
      pushHistory(); renderStepList(); runPipelinePreview();
    }));
    listEl.querySelectorAll('[data-up]').forEach((btn) => btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.up, 10);
      [steps[i - 1], steps[i]] = [steps[i], steps[i - 1]];
      pushHistory(); renderStepList(); runPipelinePreview();
    }));
    listEl.querySelectorAll('[data-down]').forEach((btn) => btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.down, 10);
      [steps[i + 1], steps[i]] = [steps[i], steps[i + 1]];
      pushHistory(); renderStepList(); runPipelinePreview();
    }));
    listEl.querySelectorAll('[data-edit]').forEach((btn) => btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.edit, 10);
      showStepForm(steps[i].op, steps[i].params, i);
    }));
  }

  // ---------------- Preview execution (off the main thread via the existing worker) ----------------
  let previewTimer;
  function runPipelinePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(doRunPipeline, 150); // debounced so rapid edits don't queue up redundant runs
  }
  async function doRunPipeline() {
    const inputEl = $('input');
    const text = inputEl ? inputEl.value : '';
    $('tbErrors').style.display = 'none';
    if (!text.trim()) { $('tbOutput').value = ''; $('tbCounts').textContent = '0 in \u2192 0 out'; return; }
    try {
      const res = await window.RecastWorkerClient.runTask('transformPipeline', { text: text, steps: steps });
      $('tbOutput').value = res.output;
      $('tbCounts').textContent = `${res.inputCount} in \u2192 ${res.outputCount} out`;
      if (res.errors && res.errors.length) {
        $('tbErrors').style.display = 'block';
        $('tbErrors').textContent = 'Step ' + (res.errors[0].index + 1) + ' failed: ' + res.errors[0].message + ' \u2014 showing the result up to that point.';
      }
    } catch (e) {
      $('tbErrors').style.display = 'block';
      $('tbErrors').textContent = 'Could not parse the input as JSON.';
    }
  }

  // ---------------- Undo / redo / reset ----------------
  function restoreFromHistory() {
    steps = JSON.parse(JSON.stringify(history[historyIndex]));
    closeStepForm();
    renderStepList();
    runPipelinePreview();
    updateUndoRedoButtons();
  }

  // ---------------- Open / close / wiring ----------------
  function openBuilder() {
    $('transformBuilderPanel').classList.add('show');
    renderFieldTree();
    renderStepList();
    runPipelinePreview();
  }
  function closeBuilder() {
    $('transformBuilderPanel').classList.remove('show');
  }

  $('transformBuilderToggleBtn')?.addEventListener('click', () => {
    const open = $('transformBuilderPanel').classList.contains('show');
    if (open) closeBuilder(); else openBuilder();
  });
  $('tbCloseBtn')?.addEventListener('click', closeBuilder);
  $('tbResetBtn')?.addEventListener('click', () => {
    steps = [];
    pushHistory();
    closeStepForm();
    renderStepList();
    runPipelinePreview();
  });
  $('tbRunBtn')?.addEventListener('click', () => { renderFieldTree(); runPipelinePreview(); });
  $('tbUndoBtn')?.addEventListener('click', () => { if (historyIndex > 0) { historyIndex--; restoreFromHistory(); } });
  $('tbRedoBtn')?.addEventListener('click', () => { if (historyIndex < history.length - 1) { historyIndex++; restoreFromHistory(); } });
  $('tbAddStep')?.addEventListener('change', (e) => {
    const op = e.target.value;
    if (op) showStepForm(op, null, null);
    else closeStepForm();
  });
  $('tbSaveRecipeBtn')?.addEventListener('click', () => {
    if (!steps.length) { showToastSafe('Add at least one step first'); return; }
    const name = prompt('Save this transformation as a recipe named:');
    if (!name) return;
    const recipeSteps = steps.map((s) => ({ mode: OP_TO_RECIPE_MODE[s.op], params: s.params }));
    window.RecastRecipes.upsert({ name: name, steps: recipeSteps });
    showToastSafe(`Saved as recipe "${name}"`);
  });

  // Re-discover fields whenever the underlying input changes, so the tree
  // and dropdowns stay in sync with whatever the user pastes.
  $('input')?.addEventListener('input', () => {
    if ($('transformBuilderPanel').classList.contains('show')) {
      renderFieldTree();
      runPipelinePreview();
    }
  });

  updateUndoRedoButtons();

  // ---------------- Public API (used by the Data Inspector's "Transform
  // this field" action) ----------------
  function openWithSelectField(path) {
    steps = [{ op: 'select', params: { paths: [path] } }];
    pushHistory();
    openBuilder();
  }
  window.RecastTransformUI = { openWithSelectField: openWithSelectField };
})();
