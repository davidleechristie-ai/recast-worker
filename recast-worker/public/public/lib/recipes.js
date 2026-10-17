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
  const KEY = 'recast_recipes_v1'; // storage key stays the same — only the stored shape gains a `version` field
  const MAX_RECIPES = 20;
  const MAX_STEPS = 16; // raised from 8 now that finer-grained transform steps make richer pipelines common
  const RECIPE_SCHEMA_VERSION = 2; // bumped for Recipe Builder 2.0 (adds per-step params + step ids); v1 recipes still load and run unchanged

  function load() {
    try {
      const raw = root.localStorage.getItem(KEY);
      const recipes = raw ? JSON.parse(raw) : [];
      // Old recipes were saved with no `version` field at all — treat that
      // as version 1 for display purposes, without rewriting anything on
      // disk just from reading it.
      return recipes.map(r => Object.assign({ version: 1 }, r));
    } catch (e) { return []; }
  }

  function save(recipes) {
    try { root.localStorage.setItem(KEY, JSON.stringify(recipes)); } catch (e) { /* fail silently */ }
  }

  /**
   * Adds or overwrites (by name) a recipe. Accepts either the original
   * shape ({ name, steps: [{mode}] }) or the v2 shape ({ name, steps:
   * [{mode, params, id}] }) — always stamps the current schema version on
   * write, so anything saved from now on is unambiguous, while anything
   * already on disk in the old shape is left exactly as it was until the
   * user actively re-saves it.
   */
  function upsert(recipe) {
    const recipes = load().filter(r => r.name !== recipe.name);
    recipes.unshift(Object.assign({}, recipe, { version: RECIPE_SCHEMA_VERSION, ts: Date.now() }));
    save(recipes.slice(0, MAX_RECIPES));
    return recipes.slice(0, MAX_RECIPES);
  }

  /** Copies an existing recipe under a new name (defaults to "<name> copy"). */
  function duplicate(name, newName) {
    const existing = load().find(r => r.name === name);
    if (!existing) return null;
    const copyName = newName || uniqueCopyName(existing.name);
    const copy = Object.assign({}, existing, { name: copyName });
    delete copy.ts;
    upsert(copy);
    return copyName;
  }
  function uniqueCopyName(baseName) {
    const existingNames = new Set(load().map(r => r.name));
    let candidate = baseName + ' copy';
    let n = 2;
    while (existingNames.has(candidate)) { candidate = baseName + ' copy ' + n; n++; }
    return candidate;
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
   * Runs `steps` (array of {mode} or {mode, params}) against `text` in
   * sequence, feeding each step's output into the next step's input.
   * Stops at the first failing step. Returns
   * { ok, finalOutput, stepResults: [{mode, ok, output, error}] }.
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
        const stepOpts = steps[i].params ? Object.assign({}, opts, steps[i].params) : (opts || {});
        current = op.run(current, stepOpts);
        stepResults.push({ mode, ok: true, output: current, error: null });
      } catch (e) {
        stepResults.push({ mode, ok: false, output: null, error: e.message || String(e) });
        return { ok: false, finalOutput: null, stepResults };
      }
    }
    return { ok: true, finalOutput: current, stepResults };
  }

  /**
   * Produces the canonical, stable JSON definition for a recipe — the
   * shape a future API/CLI executor would consume. Deterministic: the same
   * steps always serialize to the same JSON (stable key order, no
   * timestamps or other non-execution metadata mixed into the definition).
   */
  function toDefinition(recipe) {
    return {
      schemaVersion: RECIPE_SCHEMA_VERSION,
      name: recipe.name,
      steps: (recipe.steps || []).map(s => ({ mode: s.mode, params: s.params || {} })),
    };
  }

  const api = {
    load, save, upsert, remove, duplicate, runRecipe, isStepSupported, toDefinition,
    MAX_STEPS, MAX_RECIPES, RECIPE_SCHEMA_VERSION,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RecastRecipes = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
