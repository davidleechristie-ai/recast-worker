/*!
 * Recast working dataset. The problem this solves: Transform Builder and
 * JSONPath are JSON-native, but the user's input might be CSV or XML — and
 * silently overwriting #input with a converted JSON copy destroys their
 * original source data the moment they click "Transform" or "Query" from
 * Data Inspector.
 *
 * This is a small, single piece of shared state: at most one "derived JSON
 * view" of the current input, kept completely separate from #input itself.
 * #input is never written to by anything that uses this module. Consumers
 * (transform-ui.js, JSONPath in app.js) check isActive() and use getJson()
 * in place of reading #input.value directly when it's set.
 */
(function (root) {
  'use strict';

  let state = null; // { json, sourceFormat, sourceText, label } | null
  const listeners = [];

  function setDerived(sourceText, sourceFormat, json, label) {
    state = {
      sourceText: sourceText,
      sourceFormat: sourceFormat,
      json: json,
      label: label || `Converted from ${sourceFormat.toUpperCase()} \u2014 your original ${sourceFormat.toUpperCase()} input is unchanged.`,
    };
    notify();
  }

  function clear() {
    if (!state) return;
    state = null;
    notify();
  }

  function isActive() { return state !== null; }
  function getJson() { return state ? state.json : null; }
  function getState() { return state; }

  /** Called whenever the working dataset is set or cleared, so UI can render/hide a banner. */
  function onChange(fn) { listeners.push(fn); }
  function notify() { listeners.forEach((fn) => { try { fn(state); } catch (e) { /* a listener's own bug shouldn't break the others */ } }); }

  const api = { setDerived, clear, isActive, getJson, getState, onChange };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RecastWorkingDataset = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
