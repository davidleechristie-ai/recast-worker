/*!
 * Recast Transform Builder — the engine behind the visual transformation
 * workspace. Every function here is pure: (data, params) in, transformed
 * data out, no DOM, no I/O. Flatten/Unflatten delegate straight to the
 * existing engine.js implementations rather than reimplementing them, so
 * behavior for those two operations is identical everywhere they appear.
 */
(function (root) {
  'use strict';

  function asArray(data) { return Array.isArray(data) ? data : [data]; }
  function wrapLike(original, result) { return Array.isArray(original) ? result : (result[0] !== undefined ? result[0] : result); }

  function getPath(obj, path) {
    if (!path) return undefined;
    const parts = path.split('.');
    let cur = obj;
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = cur[p];
    }
    return cur;
  }
  function setPath(obj, path, value) {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (typeof cur[parts[i]] !== 'object' || cur[parts[i]] === null) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
  }
  function deletePath(obj, path) {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (cur == null || typeof cur !== 'object') return;
      cur = cur[parts[i]];
    }
    if (cur && typeof cur === 'object') delete cur[parts[parts.length - 1]];
  }

  // ---------------- Field path discovery (drives the UI's field tree) ----------------
  // Walks up to `sampleSize` records and unions every path seen, so a field
  // that's only present on some records still shows up as a pickable option.
  function discoverFieldTree(data, sampleSize) {
    const records = asArray(data).slice(0, sampleSize || 25);
    const root = { children: {} };
    function walk(node, obj, prefix) {
      if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return;
      Object.keys(obj).forEach((k) => {
        const path = prefix ? prefix + '.' + k : k;
        const val = obj[k];
        if (!node.children[k]) {
          node.children[k] = {
            path: path,
            type: val === null ? 'null' : Array.isArray(val) ? 'array' : typeof val,
            children: {},
          };
        }
        const val2 = Array.isArray(val) ? val[0] : val;
        if (val2 !== null && typeof val2 === 'object' && !Array.isArray(val2)) {
          walk(node.children[k], val2, path);
        }
      });
    }
    records.forEach((r) => walk(root, r, ''));
    return root.children;
  }
  function flattenFieldTree(tree, out) {
    out = out || [];
    Object.keys(tree).forEach((k) => {
      out.push({ path: tree[k].path, type: tree[k].type });
      if (Object.keys(tree[k].children).length) flattenFieldTree(tree[k].children, out);
    });
    return out;
  }

  // ---------------- Operations ----------------
  function selectFields(data, paths) {
    if (!paths || !paths.length) return data;
    const arr = asArray(data).map((rec) => {
      const out = {};
      paths.forEach((p) => {
        const v = getPath(rec, p);
        if (v !== undefined) setPath(out, p, v);
      });
      return out;
    });
    return wrapLike(data, arr);
  }

  function removeFields(data, paths) {
    if (!paths || !paths.length) return data;
    const arr = asArray(data).map((rec) => {
      const out = JSON.parse(JSON.stringify(rec));
      paths.forEach((p) => deletePath(out, p));
      return out;
    });
    return wrapLike(data, arr);
  }

  // "source.path -> new field name" — moves the value to a new top-level
  // field and removes the original path (a plain rename, not a copy).
  function renameField(data, fromPath, toName) {
    if (!fromPath || !toName) return data;
    const arr = asArray(data).map((rec) => {
      const out = JSON.parse(JSON.stringify(rec));
      const v = getPath(out, fromPath);
      deletePath(out, fromPath);
      if (v !== undefined) out[toName] = v;
      return out;
    });
    return wrapLike(data, arr);
  }

  const FILTER_OPS = {
    equals: (a, b) => String(a) === String(b),
    notEquals: (a, b) => String(a) !== String(b),
    contains: (a, b) => String(a ?? '').includes(String(b)),
    startsWith: (a, b) => String(a ?? '').startsWith(String(b)),
    endsWith: (a, b) => String(a ?? '').endsWith(String(b)),
    greaterThan: (a, b) => Number(a) > Number(b),
    lessThan: (a, b) => Number(a) < Number(b),
    exists: (a) => a !== undefined,
    isNull: (a) => a === null || a === undefined,
  };
  function filterRecords(data, field, op, value) {
    const fn = FILTER_OPS[op];
    if (!fn || !field) return data;
    const arr = asArray(data).filter((rec) => fn(getPath(rec, field), value));
    return wrapLike(data, arr);
  }

  function sortRecords(data, field, direction) {
    if (!field) return data;
    const arr = asArray(data).slice();
    const dir = direction === 'desc' ? -1 : 1;
    arr.sort((a, b) => {
      const av = getPath(a, field), bv = getPath(b, field);
      if (av === undefined && bv === undefined) return 0;
      if (av === undefined) return 1;
      if (bv === undefined) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return wrapLike(data, arr);
  }

  const TYPE_CONVERTERS = {
    string: (v) => (v === null || v === undefined) ? v : String(v),
    number: (v) => { const n = parseFloat(v); return isNaN(n) ? null : n; },
    integer: (v) => { const n = parseInt(v, 10); return isNaN(n) ? null : n; },
    boolean: (v) => {
      if (typeof v === 'boolean') return v;
      const s = String(v).trim().toLowerCase();
      if (['true', '1', 'yes'].includes(s)) return true;
      if (['false', '0', 'no', ''].includes(s)) return false;
      return !!v;
    },
    date: (v) => { const d = new Date(v); return isNaN(d.getTime()) ? null : d.toISOString(); },
  };
  function convertType(data, field, type) {
    const fn = TYPE_CONVERTERS[type];
    if (!fn || !field) return data;
    const arr = asArray(data).map((rec) => {
      const out = JSON.parse(JSON.stringify(rec));
      const v = getPath(out, field);
      if (v !== undefined) setPath(out, field, fn(v));
      return out;
    });
    return wrapLike(data, arr);
  }

  function addField(data, field, defaultValue) {
    if (!field) return data;
    const arr = asArray(data).map((rec) => {
      const out = JSON.parse(JSON.stringify(rec));
      if (getPath(out, field) === undefined) setPath(out, field, defaultValue);
      return out;
    });
    return wrapLike(data, arr);
  }

  // Combine fields via a simple {field} template, e.g. "{firstName} {lastName}"
  function combineFields(data, template, newField) {
    if (!template || !newField) return data;
    const arr = asArray(data).map((rec) => {
      const out = JSON.parse(JSON.stringify(rec));
      const combined = template.replace(/\{([^}]+)\}/g, (m, path) => {
        const v = getPath(out, path.trim());
        return v === undefined || v === null ? '' : String(v);
      });
      out[newField] = combined;
      return out;
    });
    return wrapLike(data, arr);
  }

  // ---------------- Pipeline runner (used by the live preview) ----------------
  function runStep(data, step) {
    const p = step.params || {};
    switch (step.op) {
      case 'select': return selectFields(data, p.paths);
      case 'remove': return removeFields(data, p.paths);
      case 'rename': return renameField(data, p.from, p.to);
      case 'filter': return filterRecords(data, p.field, p.condition, p.value);
      case 'sort': return sortRecords(data, p.field, p.direction);
      case 'convertType': return convertType(data, p.field, p.type);
      case 'addField': return addField(data, p.field, p.value);
      case 'combine': return combineFields(data, p.template, p.newField);
      case 'flatten': return root.RecastEngine.flattenObj(data);
      case 'unflatten': return root.RecastEngine.unflattenObj(data);
      case 'sortKeys': {
        function sk(o) {
          if (Array.isArray(o)) return o.map(sk);
          if (o && typeof o === 'object') return Object.keys(o).sort().reduce((acc, k) => { acc[k] = sk(o[k]); return acc; }, {});
          return o;
        }
        return sk(data);
      }
      default: return data;
    }
  }
  function runPipeline(data, steps) {
    let current = data;
    const errors = [];
    for (let i = 0; i < (steps || []).length; i++) {
      try { current = runStep(current, steps[i]); }
      catch (e) { errors.push({ index: i, message: e.message || String(e) }); break; }
    }
    return { result: current, errors: errors };
  }

  function recordCount(data) { return Array.isArray(data) ? data.length : (data === undefined ? 0 : 1); }

  const api = {
    discoverFieldTree, flattenFieldTree,
    selectFields, removeFields, renameField, filterRecords, sortRecords,
    convertType, addField, combineFields,
    runStep, runPipeline, recordCount,
    getPath, FILTER_OPS: Object.keys(FILTER_OPS), TYPE_CONVERTERS: Object.keys(TYPE_CONVERTERS),
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RecastTransformBuilder = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
