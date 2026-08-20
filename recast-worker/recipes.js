/*!
 * Recast recipes — chain several single-input transforms into one named,
 * reusable, shareable pipeline (e.g. flatten -> sort keys -> JSON to CSV).
 * Reuses the exact same per-mode `run(text, opts)` functions that already
 * power batch processing, so a recipe step behaves identically to running
 * that mode by hand. Stored client-side only (localStorage) — no server
 * round-trip, consistent with the rest of the toolkit.
 */
(function (root) {
  'use strict';
  const KEY = 'recast_recipes_v1';
  const MAX_RECIPES = 20;
  const MAX_STEPS = 8;

  function load() {
    try {
      const raw = root.localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function save(recipes) {
    try { root.localStorage.setItem(KEY, JSON.stringify(recipes)); } catch (e) { /* fail silently */ }
  }

  /** Adds or overwrites (by name) a recipe: { name, steps: [{mode}] } */
  function upsert(recipe) {
    const recipes = load().filter(r => r.name !== recipe.name);
    recipes.unshift(Object.assign({}, recipe, { ts: Date.now() }));
    save(recipes.slice(0, MAX_RECIPES));
    return recipes.slice(0, MAX_RECIPES);
  }

  function remove(name) {
    const recipes = load().filter(r => r.name !== name);
    save(recipes);
    return recipes;
  }

  function isStepSupported(mode) {
    return !!(root.RecastBatch && root.RecastBatch.BATCH_OPS[mode]);
  }

  /**
   * Runs `steps` (array of {mode}) against `text` in sequence, feeding each
   * step's output into the next step's input. Stops at the first failing
   * step. Returns { ok, finalOutput, stepResults: [{mode, ok, output, error}] }.
   */
  function runRecipe(text, steps, opts) {
    const ops = root.RecastBatch.BATCH_OPS;
    const stepResults = [];
    let current = text;
    for (let i = 0; i < steps.length; i++) {
      const mode = steps[i].mode;
      const op = ops[mode];
      if (!op) {
        stepResults.push({ mode, ok: false, output: null, error: 'Not a supported recipe step' });
        return { ok: false, finalOutput: null, stepResults };
      }
      try {
        current = op.run(current, opts || {});
        stepResults.push({ mode, ok: true, output: current, error: null });
      } catch (e) {
        stepResults.push({ mode, ok: false, output: null, error: e.message || String(e) });
        return { ok: false, finalOutput: null, stepResults };
      }
    }
    return { ok: true, finalOutput: current, stepResults };
  }

  const api = { load, save, upsert, remove, runRecipe, isStepSupported, MAX_STEPS, MAX_RECIPES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RecastRecipes = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
