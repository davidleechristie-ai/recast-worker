/*!
 * Recast history — last N conversions, stored client-side only (localStorage).
 * Never sent anywhere; purely a convenience so a refresh doesn't lose your work.
 */
(function (root) {
  'use strict';
  const KEY = 'recast_history_v1';
  const MAX_ITEMS = 10;
  const MAX_SNIPPET = 4000; // cap what we store per entry so localStorage doesn't bloat

  function load() {
    try {
      const raw = root.localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function save(items) {
    try { root.localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* quota or disabled — fail silently */ }
  }

  function add(entry) {
    const items = load();
    const clipped = {
      mode: entry.mode,
      input: (entry.input || '').slice(0, MAX_SNIPPET),
      inputA: entry.inputA ? entry.inputA.slice(0, MAX_SNIPPET) : undefined,
      inputB: entry.inputB ? entry.inputB.slice(0, MAX_SNIPPET) : undefined,
      ts: Date.now()
    };
    items.unshift(clipped);
    save(items.slice(0, MAX_ITEMS));
  }

  function clear() { save([]); }

  function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return m + 'm ago';
    const h = Math.floor(m / 60);
    if (h < 24) return h + 'h ago';
    return Math.floor(h / 24) + 'd ago';
  }

  root.RecastHistory = { load: load, add: add, clear: clear, timeAgo: timeAgo, MAX_ITEMS: MAX_ITEMS };
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
