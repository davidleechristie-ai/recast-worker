/*!
 * Recast Compare — Structural Analysis. Takes the existing deepDiff()
 * output (an array of {path, type, oldVal, newVal}) and classifies each
 * entry, rather than re-walking the two datasets a second time. Every
 * classification is conservative by design: a change is only ever labeled
 * "breaking" when it matches one of the specific, named rules below —
 * anything else that changes shape but doesn't match a rule is labeled
 * "uncertain", never guessed at as breaking or safe.
 */
(function (root) {
  'use strict';

  const ARRAY_ITEM_RE = /\[[^\]]+\]$/; // path ends in [idx] or [key=value] — an array element, not a named field

  function kindOf(v) {
    if (v === undefined) return 'undefined';
    if (v === null) return 'null';
    if (Array.isArray(v)) return 'array';
    return typeof v; // 'object' | 'string' | 'number' | 'boolean'
  }

  function fieldNameFromPath(path) {
    const m = path.match(/([^.\[\]]+)$/);
    return m ? m[1] : path;
  }

  // For a removed object field, checks whether it was present on every
  // record of `beforeData` (when beforeData is an array) as weak evidence
  // it was effectively required — used only to add an extra, clearly-
  // labeled detail, never to change the underlying breaking/non-breaking
  // verdict, which is already decided by "was a field removed at all".
  function wasPresentOnEveryRecord(beforeData, fieldName) {
    if (!Array.isArray(beforeData) || !beforeData.length) return null; // not enough evidence either way
    if (!beforeData.every((r) => r !== null && typeof r === 'object' && !Array.isArray(r))) return null;
    return beforeData.every((r) => Object.prototype.hasOwnProperty.call(r, fieldName));
  }

  function classifyOne(change, beforeData) {
    const isArrayItem = ARRAY_ITEM_RE.test(change.path);

    if (change.type === 'removed') {
      if (isArrayItem) {
        return Object.assign({}, change, { category: 'structural', severity: 'non-breaking', label: 'Array item removed', detail: 'Arrays are expected to vary in length; a shorter array on its own is not treated as breaking.' });
      }
      const fieldName = fieldNameFromPath(change.path);
      const everyRecord = wasPresentOnEveryRecord(beforeData, fieldName);
      const label = everyRecord === true ? 'Required field removed' : 'Field removed';
      return Object.assign({}, change, { category: 'structural', severity: 'breaking', label, detail: everyRecord === true ? 'Present on every record before this change.' : null });
    }

    if (change.type === 'added') {
      if (isArrayItem) {
        return Object.assign({}, change, { category: 'structural', severity: 'non-breaking', label: 'Array item added', detail: null });
      }
      return Object.assign({}, change, { category: 'structural', severity: 'non-breaking', label: 'Field added', detail: 'New fields don\u2019t affect consumers that weren\u2019t already reading them.' });
    }

    // type === 'changed'
    const oldKind = kindOf(change.oldVal), newKind = kindOf(change.newVal);
    if (oldKind === newKind) {
      // same primitive type, different value — including array/object
      // "changed" entries that reach here only via the root-level
      // fallback in deepDiff (array<->array or object<->object handled
      // recursively already, never surfaced as a single 'changed' entry)
      return Object.assign({}, change, { category: 'value', severity: null, label: 'Value changed', detail: null });
    }

    if (oldKind === 'array' && newKind !== 'array') {
      return Object.assign({}, change, { category: 'structural', severity: 'breaking', label: 'Array changed to non-array', detail: `${oldKind} \u2192 ${newKind}` });
    }
    if (oldKind === 'object' && newKind !== 'object' && newKind !== 'array') {
      return Object.assign({}, change, { category: 'structural', severity: 'breaking', label: 'Object changed to primitive', detail: `${oldKind} \u2192 ${newKind}` });
    }
    const primitiveKinds = ['string', 'number', 'boolean'];
    if (primitiveKinds.includes(oldKind) && primitiveKinds.includes(newKind)) {
      return Object.assign({}, change, { category: 'structural', severity: 'breaking', label: 'Primitive type changed', detail: `${oldKind} \u2192 ${newKind}` });
    }

    // Any other shape transition (primitive<->object, primitive<->array,
    // object<->array, or anything touching null) genuinely isn't covered
    // by a named rule above — labeled, counted as structural, but never
    // asserted as breaking or safe.
    return Object.assign({}, change, { category: 'structural', severity: 'uncertain', label: 'Type changed', detail: `${oldKind} \u2192 ${newKind} \u2014 Recast can't confidently say whether this is breaking.` });
  }

  /**
   * Classifies the output of RecastEngine.deepDiff(before, after).
   * Returns { changes: [...enriched], summary: {breaking, structural, value, uncertain} }.
   */
  function analyzeStructure(changes, beforeData) {
    const enriched = changes.map((c) => classifyOne(c, beforeData));
    const summary = {
      breaking: enriched.filter((c) => c.severity === 'breaking').length,
      structural: enriched.filter((c) => c.category === 'structural').length,
      value: enriched.filter((c) => c.category === 'value').length,
      uncertain: enriched.filter((c) => c.severity === 'uncertain').length,
    };
    return { changes: enriched, summary };
  }

  const api = { analyzeStructure };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RecastStructuralAnalysis = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
