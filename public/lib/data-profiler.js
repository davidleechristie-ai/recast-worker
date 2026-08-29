/*!
 * Recast Data Inspector — profiles an already-parsed dataset (the same
 * JS values every other tool works with) into a summary, a per-field
 * profile, and a set of heuristic quality warnings. Pure functions only:
 * no DOM, no mutation of the input. Field-path discovery reuses
 * transform-builder.js's discoverFieldTree rather than re-walking the
 * object graph a second time with different code.
 */
(function (root) {
  'use strict';

  const ID_CANDIDATES = ['id', 'uuid', '_id', 'key', 'slug', 'code']; // same convention as engine.js's pickArrayKey
  const MAX_SAMPLES = 5;
  const LONG_VALUE_THRESHOLD = 500; // chars — flagged as informational, not an error
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function asArray(data) { return Array.isArray(data) ? data : [data]; }

  function getPath(obj, path) {
    if (!path) return obj;
    const parts = path.split('.');
    let cur = obj;
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = cur[p];
    }
    return cur;
  }

  function jsType(v) {
    if (v === null) return 'null';
    if (Array.isArray(v)) return 'array';
    return typeof v; // 'object' | 'string' | 'number' | 'boolean' | 'undefined'
  }

  function nestingDepth(v, current) {
    current = current || 0;
    if (v === null || typeof v !== 'object') return current;
    const values = Array.isArray(v) ? v : Object.values(v);
    let max = current;
    for (const child of values) {
      const d = nestingDepth(child, current + 1);
      if (d > max) max = d;
    }
    return max;
  }

  // Loose "does this look like a date" check — only used to decide whether
  // a field is date-shaped enough to bother validating; never asserts a
  // field must be a date on its own name alone.
  function looksDateShaped(v) {
    if (typeof v !== 'string') return false;
    return /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2})?/.test(v) || /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(v);
  }
  function isValidDate(v) {
    if (typeof v !== 'string') return false;
    const d = new Date(v);
    return !isNaN(d.getTime());
  }
  function looksEmailShaped(v) {
    return typeof v === 'string' && v.includes('@');
  }

  /**
   * Profiles `data` (already-parsed JSON — from JSON.parse, E.csvToJson,
   * or E.xmlToJson, all of which produce the same plain JS shapes) into
   * { summary, fields, warnings }.
   */
  function profileDataset(data, opts) {
    opts = opts || {};
    const records = asArray(data);
    const tree = root.RecastTransformBuilder.discoverFieldTree(data, opts.sampleSize || 200);
    const paths = root.RecastTransformBuilder.flattenFieldTree(tree);

    const summary = {
      recordCount: records.length,
      fieldCount: paths.length,
      estimatedSizeBytes: estimateSize(data),
      nestingDepth: nestingDepth(data),
    };

    const fields = paths.map((p) => profileField(records, p.path));
    const warnings = [];
    fields.forEach((f) => warnings.push(...fieldWarnings(f, records.length)));
    warnings.push(...datasetWarnings(records));

    return { summary, fields, warnings };
  }

  function estimateSize(data) {
    try { return new Blob ? new Blob([JSON.stringify(data)]).size : JSON.stringify(data).length; }
    catch (e) { return JSON.stringify(data).length; }
  }

  function profileField(records, path) {
    const values = [];
    let nullCount = 0;
    let missingCount = 0; // present-in-schema but absent on this particular record
    const typeCounts = {};
    const samples = [];
    const seen = new Set();
    let numMin = null, numMax = null;
    let lenMin = null, lenMax = null;
    let dateShapedCount = 0;
    let emailShapedCount = 0;
    let arrayCount = 0, objectCount = 0;
    let longValueExample = null;
    const stringValues = []; // retained only transiently, for the post-hoc date/email pass below

    records.forEach((rec) => {
      const has = pathExists(rec, path);
      if (!has) { missingCount++; return; }
      const v = getPath(rec, path);
      values.push(v);
      const t = jsType(v);
      typeCounts[t] = (typeCounts[t] || 0) + 1;
      if (v === null) { nullCount++; return; }

      if (samples.length < MAX_SAMPLES && !seen.has(JSON.stringify(v))) { samples.push(v); seen.add(JSON.stringify(v)); }

      if (t === 'number') {
        if (numMin === null || v < numMin) numMin = v;
        if (numMax === null || v > numMax) numMax = v;
      }
      if (t === 'string') {
        stringValues.push(v);
        if (lenMin === null || v.length < lenMin) lenMin = v.length;
        if (lenMax === null || v.length > lenMax) lenMax = v.length;
        if (v.length > LONG_VALUE_THRESHOLD && !longValueExample) longValueExample = v.slice(0, 80) + '\u2026';
        if (looksDateShaped(v)) dateShapedCount++;
        if (looksEmailShaped(v)) emailShapedCount++;
      }
      if (t === 'array') arrayCount++;
      if (t === 'object') objectCount++;
    });

    // Confidence-gated validity pass: only once a field has established
    // (by its own data, not its name) that it's mostly dates/emails do we
    // go back and flag every non-null string that fails full validation —
    // including ones that don't even superficially look like the shape,
    // which is the actual "malformed" case worth surfacing.
    let invalidDateCount = 0, invalidDateExample = null;
    let invalidEmailCount = 0, invalidEmailExample = null;
    if (stringValues.length && dateShapedCount / stringValues.length > 0.5 && dateShapedCount >= 3) {
      stringValues.forEach((v) => { if (!isValidDate(v)) { invalidDateCount++; if (!invalidDateExample) invalidDateExample = v; } });
    }
    if (stringValues.length && emailShapedCount / stringValues.length > 0.5 && emailShapedCount >= 3) {
      stringValues.forEach((v) => { if (!EMAIL_RE.test(v)) { invalidEmailCount++; if (!invalidEmailExample) invalidEmailExample = v; } });
    }

    const uniqueValues = new Set(values.filter((v) => v !== null && typeof v !== 'object').map((v) => JSON.stringify(v)));
    const total = records.length;
    const presentCount = total - missingCount;
    const dominantType = Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a])[0] || 'undefined';

    return {
      path,
      type: dominantType,
      typeCounts,
      presentCount, missingCount,
      nullCount,
      nullPercent: total ? Math.round((nullCount / total) * 1000) / 10 : 0,
      uniqueCount: uniqueValues.size,
      samples,
      min: numMin, max: numMax,
      minLength: lenMin, maxLength: lenMax,
      invalidDateCount, invalidDateExample,
      invalidEmailCount, invalidEmailExample,
      arrayCount, objectCount,
      longValueExample,
      total,
    };
  }

  function pathExists(rec, path) {
    const parts = path.split('.');
    let cur = rec;
    for (const p of parts) {
      if (cur == null || typeof cur !== 'object' || !(p in cur)) return false;
      cur = cur[p];
    }
    return true;
  }

  // ---------------- Quality checks -> labelled warnings ----------------
  // Every check here only fires when the data itself gives real evidence
  // (a field that's mostly non-date values never gets flagged for a
  // malformed date; a field with zero @ characters never gets flagged for
  // email format) — never a blanket assumption from a field's name alone.
  function fieldWarnings(f, totalRecords) {
    const out = [];
    const push = (level, message) => out.push({ level, field: f.path, message });

    // inconsistent primitive types (ignoring null, which has its own check)
    const typesSeen = Object.keys(f.typeCounts).filter((t) => t !== 'null');
    if (typesSeen.length > 1) {
      const isArrayObjectMix = typesSeen.every((t) => t === 'array' || t === 'object') && typesSeen.length > 1;
      if (isArrayObjectMix) push('warning', `Mixed array/object values (${typesSeen.join(', ')}) \u2014 records don't share the same shape for this field.`);
      else push('warning', `Inconsistent types: ${typesSeen.map((t) => `${t} (${f.typeCounts[t]})`).join(', ')}.`);
    }

    // null-heavy
    if (f.total > 0) {
      if (f.nullPercent >= 70) push('warning', `${f.nullPercent}% of records have a null value here.`);
      else if (f.nullPercent >= 30) push('info', `${f.nullPercent}% of records have a null value here.`);
    }

    // malformed dates — only checked once a field has established, from
    // its own data, that it's mostly dates
    if (f.invalidDateCount > 0) {
      push('warning', `${f.invalidDateCount} value${f.invalidDateCount === 1 ? '' : 's'} don't look like a valid date in a field that's mostly dates (e.g. "${f.invalidDateExample}").`);
    }

    // invalid emails — same evidence-first approach
    if (f.invalidEmailCount > 0) {
      push('warning', `${f.invalidEmailCount} value${f.invalidEmailCount === 1 ? '' : 's'} don't look like a valid email in a field that's mostly emails (e.g. "${f.invalidEmailExample}").`);
    }

    // unusually long values
    if (f.longValueExample) push('info', `Contains at least one unusually long value (over ${LONG_VALUE_THRESHOLD} characters): "${f.longValueExample}"`);

    return out;
  }

  function datasetWarnings(records) {
    const out = [];
    if (!records.every((r) => r !== null && typeof r === 'object' && !Array.isArray(r))) return out;
    ID_CANDIDATES.forEach((cand) => {
      const withField = records.filter((r) => Object.prototype.hasOwnProperty.call(r, cand));
      if (withField.length < records.length * 0.9 || withField.length < 2) return; // not a confident id-like field for this dataset
      const values = withField.map((r) => r[cand]);
      const seen = new Map();
      values.forEach((v) => seen.set(JSON.stringify(v), (seen.get(JSON.stringify(v)) || 0) + 1));
      const duplicates = Array.from(seen.entries()).filter(([, count]) => count > 1);
      if (duplicates.length) {
        const dupCount = duplicates.reduce((sum, [, c]) => sum + c, 0);
        out.push({ level: 'error', field: cand, message: `${duplicates.length} duplicate value${duplicates.length === 1 ? '' : 's'} in "${cand}" (${dupCount} records affected) \u2014 this field looks like it should be a unique identifier.` });
      }
    });
    return out;
  }

  const api = { profileDataset };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RecastDataProfiler = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
