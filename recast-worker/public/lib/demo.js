/*!
 * Recast demo page — click-to-load and drag-and-drop for the demo dataset
 * gallery. Click works everywhere (including touch, where native HTML5
 * drag-and-drop simply doesn't exist) and is the primary interaction; drag
 * is an enhancement for desktop mouse users, dropped onto the same visual
 * drop-zone overlays the real file-upload path already uses, so it feels
 * like the same feature rather than a separate one.
 */
(function () {
  'use strict';

  const DEMO_FILES = {
    orders: { url: 'data/orders.json', mode: 'json2csv' },
    employees: { url: 'data/employees.csv', mode: 'csv2json' },
    events: { url: 'data/events.xml', mode: 'xml2json' },
    services: { url: 'data/services.yaml', mode: 'yaml2json' },
    orders_diff: { urlA: 'data/orders_before.json', urlB: 'data/orders_after.json', mode: 'diffJson' },
  };

  const cache = {};
  async function fetchDemo(url) {
    if (cache[url]) return cache[url];
    const res = await fetch(url);
    if (!res.ok) throw new Error('Could not load ' + url);
    const text = await res.text();
    cache[url] = text;
    return text;
  }

  function $(id) { return document.getElementById(id); }

  async function loadDemo(key, card) {
    const def = DEMO_FILES[key];
    if (!def) return;
    if (card) card.classList.add('loading');
    try {
      if (window.setMode) window.setMode(def.mode);
      if (def.urlA) {
        const [textA, textB] = await Promise.all([fetchDemo(def.urlA), fetchDemo(def.urlB)]);
        const inputA = $('inputA'), inputB = $('inputB');
        if (inputA) { inputA.value = textA; inputA.dispatchEvent(new Event('input', { bubbles: true })); }
        if (inputB) { inputB.value = textB; inputB.dispatchEvent(new Event('input', { bubbles: true })); }
      } else {
        const text = await fetchDemo(def.url);
        const input = document.getElementById('input');
        if (input) { input.value = text; input.dispatchEvent(new Event('input', { bubbles: true })); }
      }
      const workbench = document.querySelector('.workbench');
      if (workbench) workbench.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.track) window.track('demo_dataset_load', { dataset: key, mode: def.mode });
    } catch (e) {
      if (window.showToast) window.showToast('Could not load that demo file \u2014 try again in a moment.');
    } finally {
      if (card) card.classList.remove('loading');
    }
  }

  document.querySelectorAll('.demo-card[data-demo]').forEach((card) => {
    const key = card.dataset.demo;

    card.addEventListener('click', () => loadDemo(key, card));

    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('application/x-recast-demo', key);
      e.dataTransfer.setData('text/plain', 'recast-demo:' + key); // fallback so some browsers still register the drag as valid
      e.dataTransfer.effectAllowed = 'copy';
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
  });

  // Drop targets: the same visual drop-zone overlays the real file-upload
  // flow already uses, so dropping a demo card looks and feels identical
  // to dropping a real OS file.
  function wireDemoDropTarget(containerEl, zoneEl, onDrop) {
    if (!containerEl || !zoneEl) return;
    ['dragenter', 'dragover'].forEach((evt) => containerEl.addEventListener(evt, (e) => {
      if (!e.dataTransfer?.types?.includes('application/x-recast-demo')) return;
      e.preventDefault();
      zoneEl.classList.add('active');
    }));
    ['dragleave'].forEach((evt) => containerEl.addEventListener(evt, () => zoneEl.classList.remove('active')));
    containerEl.addEventListener('drop', (e) => {
      if (!e.dataTransfer?.types?.includes('application/x-recast-demo')) return;
      e.preventDefault();
      zoneEl.classList.remove('active');
      const key = e.dataTransfer.getData('application/x-recast-demo');
      (onDrop || loadDemo)(key);
    });
  }

  wireDemoDropTarget(document.getElementById('inputPanel'), document.getElementById('dropZone'));
  const inputAWrap = document.getElementById('inputA')?.closest('.ta-wrap');
  const inputBWrap = document.getElementById('inputB')?.closest('.ta-wrap');
  wireDemoDropTarget(inputAWrap, document.getElementById('dropZoneA'));
  wireDemoDropTarget(inputBWrap, document.getElementById('dropZoneB'));

  // API playground: same drag source, a different destination and a
  // narrower set of supported modes (the playground only demos the plain
  // /v1/convert modes, not diff or codegen) — the diff pair specifically
  // has no playground equivalent, so it falls back to loading just the
  // "before" file rather than doing nothing.
  const PLAYGROUND_MODES = ['json2csv', 'csv2json', 'json2xml', 'xml2json', 'flatten', 'unflatten', 'json2yaml', 'yaml2json', 'json2markdown', 'markdown2json'];
  async function loadDemoIntoPlayground(key) {
    const def = DEMO_FILES[key];
    if (!def) return;
    try {
      const url = def.url || def.urlA;
      const text = await fetchDemo(url);
      const input = document.getElementById('playgroundInput');
      const modeSelect = document.getElementById('playgroundMode');
      if (input) input.value = text;
      if (modeSelect && PLAYGROUND_MODES.includes(def.mode)) modeSelect.value = def.mode;
      if (window.track) window.track('demo_dataset_load', { dataset: key, mode: def.mode, target: 'playground' });
    } catch (e) {
      if (window.showToast) window.showToast('Could not load that demo file \u2014 try again in a moment.');
    }
  }
  wireDemoDropTarget(document.getElementById('playgroundInput')?.closest('.playground-col'), document.getElementById('playgroundDropZone'), loadDemoIntoPlayground);
})();
