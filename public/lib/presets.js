/*!
 * Recast presets — named, reusable option sets (delimiter, Excel BOM, type
 * inference, pretty-print) so a recurring conversion job doesn't need its
 * settings re-entered every time. Stored client-side only (localStorage).
 */
(function (root) {
  'use strict';
  const KEY = 'recast_presets_v1';
  const MAX_PRESETS = 20;

  function load() {
    try {
      const raw = root.localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function save(presets) {
    try { root.localStorage.setItem(KEY, JSON.stringify(presets)); } catch (e) { /* fail silently */ }
  }

  /** Adds or overwrites (by name) a preset: { name, mode, options } */
  function upsert(preset) {
    const presets = load().filter(p => p.name !== preset.name);
    presets.unshift(Object.assign({}, preset, { ts: Date.now() }));
    save(presets.slice(0, MAX_PRESETS));
    return presets.slice(0, MAX_PRESETS);
  }

  function remove(name) {
    const presets = load().filter(p => p.name !== name);
    save(presets);
    return presets;
  }

  function get(name) {
    return load().find(p => p.name === name) || null;
  }

  const api = { load, upsert, remove, get, MAX_PRESETS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RecastPresets = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
