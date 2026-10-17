/*!
 * Recast pipeline-aware field discovery. The bug this fixes: field
 * pickers used to always discover fields from the original #input, so a
 * field renamed or created by an earlier step was invisible to later
 * steps. This module computes the *actual* intermediate dataset a step
 * would see — the result of running every step before it — and discovers
 * fields from that instead.
 *
 * Reuses existing infrastructure only: RecastTransformBuilder's pure
 * discoverFieldTree/flattenFieldTree for the actual field walk, and the
 * existing transformPipeline Worker task (the same one Transform Builder's
 * live preview already uses) for running the intermediate steps — so this
 * never introduces a second execution path, and never blocks the main
 * thread on a large dataset.
 */
(function (root) {
  'use strict';

  // Cache is intentionally scoped to "since the last invalidation", not
  // persisted indefinitely — see invalidate() below. Keyed on the exact
  // (input text, step sequence) pair, so two different steps that happen
  // to share the same prefix share one computation and one Worker call.
  const cache = new Map();

  function cacheKey(text, steps) {
    return JSON.stringify({ t: text, s: steps });
  }

  /**
   * Resolves the fields available *before* a given point in a pipeline.
   * `steps` should be the steps that already ran (i.e. steps.slice(0, N)
   * for "what step N will see") — this module doesn't know about step
   * indices itself, only about "text + the steps that already applied".
   *
   * `format` selects which step shape and execution path to use:
   *  - 'transform' (default): Transform Builder's {op, params} steps, run
   *    via the existing transformPipeline Worker task.
   *  - 'recipe': Recipe Builder 2.0's {mode, params} steps (ordinary
   *    BATCH_OPS mode names), run via the existing recipe runner.
   *
   * Returns { paths: [{path, type}], error: string|null }. On any failure
   * (invalid input JSON, or an earlier step erroring), paths is empty and
   * error explains why — callers must show this, never silently fall back
   * to the original input's fields.
   */
  async function resolveFields(text, steps, format) {
    steps = steps || [];
    format = format || 'transform';
    if (!text || !text.trim()) return { paths: [], error: null };

    const key = cacheKey(text, steps) + '|' + format;
    if (cache.has(key)) return cache.get(key);

    const promise = compute(text, steps, format);
    cache.set(key, promise);
    return promise;
  }

  async function compute(text, steps, format) {
    const TB = root.RecastTransformBuilder;
    if (!steps.length) {
      // The first step in either format sees the original input directly
      // — no pipeline to run.
      try {
        const data = JSON.parse(text);
        return { paths: TB.flattenFieldTree(TB.discoverFieldTree(data)), error: null };
      } catch (e) {
        return { paths: [], error: 'Input is not valid JSON.' };
      }
    }
    try {
      if (format === 'recipe') {
        const res = await root.RecastWorkerClient.runTask('recipeStepsPartial', { text, steps });
        if (!res.ok) {
          const failed = res.stepResults[res.stepResults.length - 1];
          return { paths: [], error: `Step ${res.stepResults.length} isn\u2019t valid yet (${failed.error}), so later fields can\u2019t be resolved.` };
        }
        const data = JSON.parse(res.finalOutput);
        return { paths: TB.flattenFieldTree(TB.discoverFieldTree(data)), error: null };
      }
      const res = await root.RecastWorkerClient.runTask('transformPipeline', { text, steps });
      if (res.errors && res.errors.length) {
        const failed = res.errors[0];
        return { paths: [], error: `Step ${failed.index + 1} isn\u2019t valid yet (${failed.message}), so later fields can\u2019t be resolved.` };
      }
      const data = JSON.parse(res.output);
      return { paths: TB.flattenFieldTree(TB.discoverFieldTree(data)), error: null };
    } catch (e) {
      return { paths: [], error: 'Could not resolve fields at this step.' };
    }
  }

  /** Clears the cache. Call this whenever the input or any step changes — every downstream field lookup depends on both. */
  function invalidate() {
    cache.clear();
  }

  const api = { resolveFields, invalidate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RecastPipelineFields = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
