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

  function asArray(v) { return Array.isArray(v) ? v : [v]; }

  // The portion of a change path that applies *within* one record — i.e.
  // with a leading array-item selector (e.g. "[id=1]." or "[3].") stripped
  // off, since that selector identifies *which* record, not a field
  // within it. "[id=1].address.zip" -> "address.zip"; a top-level "name"
  // with no array wrapper is returned unchanged.
  function perRecordFieldPath(changePath) {
    const m = changePath.match(/^\[[^\]]+\]\.?(.*)$/);
    return m ? m[1] : changePath;
  }

  function pathExistsIn(record, dotPath) {
    if (!dotPath) return false;
    const parts = dotPath.split('.');
    let cur = record;
    for (const p of parts) {
      if (cur === null || typeof cur !== 'object' || Array.isArray(cur)) return false;
      if (!Object.prototype.hasOwnProperty.call(cur, p)) return false;
      cur = cur[p];
    }
    return true;
  }

  // The actual evidence a "field removed" verdict is based on: was this
  // field present on every record of beforeData, some, or is there not
  // enough to go on? A single (non-array) beforeData object is treated as
  // one record — since the field must have existed on it for deepDiff to
  // report a removal, that counts as 100% presence, i.e. true.
  //
  // Returns true (every record had it — strong evidence), false (some but
  // not all — the exact case this fix targets), or null (not enough
  // evidence either way, e.g. beforeData isn't a usable array of plain
  // objects). true and only true justifies "breaking"; false and null are
  // both "uncertain" — the distinction is kept separate in case a caller
  // wants to explain *why* later, not to treat them differently now.
  function presenceEvidence(beforeData, changePath) {
    if (beforeData === null || beforeData === undefined) return null;
    const records = asArray(beforeData);
    if (!records.length) return null;
    if (!records.every((r) => r !== null && typeof r === 'object' && !Array.isArray(r))) return null;
    const fieldPath = perRecordFieldPath(changePath);
    if (!fieldPath) return null;
    const presentCount = records.filter((r) => pathExistsIn(r, fieldPath)).length;
    if (presentCount === records.length) return true;
    if (presentCount === 0) return null; // shouldn't normally happen for a genuine removal, but stay conservative rather than assume
    return false;
  }

  function classifyOne(change, beforeData, options) {
    options = options || {};
    const isArrayItem = ARRAY_ITEM_RE.test(change.path);

    if (change.type === 'removed') {
      if (isArrayItem) {
        return Object.assign({}, change, { category: 'structural', severity: 'non-breaking', label: 'Array item removed', detail: 'Arrays are expected to vary in length; a shorter array on its own is not treated as breaking.' });
      }

      // Explicit schema evidence, when supplied, wins outright — it's
      // stronger evidence than statistical presence across records. No
      // caller currently supplies this (Structural Analysis has no schema
      // input yet), but the hook is here and tested for when one does.
      const fieldPath = perRecordFieldPath(change.path);
      if (options.requiredFields && options.requiredFields.has(fieldPath)) {
        return Object.assign({}, change, { category: 'structural', severity: 'breaking', label: 'Required field removed', detail: 'Marked required by the supplied schema.' });
      }

      const evidence = presenceEvidence(beforeData, change.path);
      if (evidence === true) {
        return Object.assign({}, change, { category: 'structural', severity: 'breaking', label: 'Required field removed', detail: 'Present on every record before this change.' });
      }
      if (evidence === false) {
        return Object.assign({}, change, { category: 'structural', severity: 'uncertain', label: 'Field removed', detail: 'Present on some but not all records before this change \u2014 not confidently classified as breaking.' });
      }
      return Object.assign({}, change, { category: 'structural', severity: 'uncertain', label: 'Field removed', detail: 'Not enough evidence to tell whether this field was consistently present.' });
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
   * `options.requiredFields` (optional) is a Set of per-record dot-paths
   * (e.g. "address.zip") known from an external schema to be required —
   * see classifyOne for how it's used.
   * Returns { changes: [...enriched], summary: {breaking, nonBreaking, uncertain, value} }.
   */
  function analyzeStructure(changes, beforeData, options) {
    const enriched = changes.map((c) => classifyOne(c, beforeData, options));
    const summary = {
      breaking: enriched.filter((c) => c.severity === 'breaking').length,
      nonBreaking: enriched.filter((c) => c.severity === 'non-breaking').length,
      uncertain: enriched.filter((c) => c.severity === 'uncertain').length,
      value: enriched.filter((c) => c.category === 'value').length,
    };
    return { changes: enriched, summary };
  }

  const api = { analyzeStructure };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RecastStructuralAnalysis = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
