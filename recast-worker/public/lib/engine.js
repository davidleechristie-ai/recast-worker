/*!
 * Recast Engine — isomorphic conversion, diff & schema logic.
 * No DOM dependency (hand-written XML parser) so this file runs
 * unmodified in the browser (as a plain <script>) and in Node (CLI).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api; // Node / CLI
  } else {
    root.RecastEngine = api; // Browser global
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------------- Flatten / Unflatten ----------------
  function flattenObj(obj, prefix, res) {
    prefix = prefix || '';
    res = res || {};
    if (obj === null || typeof obj !== 'object') { res[prefix] = obj; return res; }
    if (Array.isArray(obj)) {
      if (obj.length === 0) { res[prefix || '[]'] = []; return res; }
      obj.forEach(function (v, i) { flattenObj(v, prefix ? prefix + '[' + i + ']' : '[' + i + ']', res); });
      return res;
    }
    const keys = Object.keys(obj);
    if (keys.length === 0) { res[prefix || '{}'] = {}; return res; }
    keys.forEach(function (k) { flattenObj(obj[k], prefix ? prefix + '.' + k : k, res); });
    return res;
  }

  function unflattenObj(flat) {
    const result = {};
    for (const flatKey in flat) {
      if (!Object.prototype.hasOwnProperty.call(flat, flatKey)) continue;
      const value = flat[flatKey];
      const parts = flatKey.match(/[^.\[\]]+|\[\d+\]/g) || [flatKey];
      let cur = result;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isArrayIdx = /^\[\d+\]$/.test(part);
        const key = isArrayIdx ? parseInt(part.slice(1, -1), 10) : part;
        const isLast = i === parts.length - 1;
        if (isLast) {
          cur[key] = value;
        } else {
          const nextIsArray = /^\[\d+\]$/.test(parts[i + 1]);
          if (cur[key] === undefined) cur[key] = nextIsArray ? [] : {};
          cur = cur[key];
        }
      }
    }
    return result;
  }

  // ---------------- CSV <-> JSON (with type inference) ----------------
  function csvEscape(val, delim) {
    if (val === null || val === undefined) return '';
    const s = String(val);
    if (s.indexOf('"') !== -1 || s.indexOf(delim) !== -1 || s.indexOf('\n') !== -1 || s.indexOf('\r') !== -1) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  function jsonToCsv(jsonArray, opts) {
    opts = opts || {};
    const delim = opts.delimiter || ',';
    if (!Array.isArray(jsonArray)) jsonArray = [jsonArray];
    const flatRows = jsonArray.map(function (row) { return flattenObj(row); });
    const headerSet = new Set();
    flatRows.forEach(function (r) { Object.keys(r).forEach(function (k) { headerSet.add(k); }); });
    const headers = Array.from(headerSet);
    const lines = [headers.map(function (h) { return csvEscape(h, delim); }).join(delim)];
    flatRows.forEach(function (r) {
      lines.push(headers.map(function (h) { return csvEscape(r[h], delim); }).join(delim));
    });
    let out = lines.join('\n');
    if (opts.excelBom) out = '\uFEFF' + out;
    return out;
  }

  function parseCsvLine(line, delim) {
    const out = []; let cur = ''; let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQuotes) {
        if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQuotes = false; }
        else cur += c;
      } else {
        if (c === '"') inQuotes = true;
        else if (c === delim) { out.push(cur); cur = ''; }
        else cur += c;
      }
    }
    out.push(cur);
    return out;
  }

  // Coerce a raw CSV cell string into a typed JS value.
  function inferCell(raw) {
    if (raw === '') return null;
    if (/^-?\d+$/.test(raw)) {
      const n = parseInt(raw, 10);
      if (String(n) === raw || (raw[0] === '-' && String(n) === raw)) return n;
      return raw; // preserves leading-zero strings like "007"
    }
    if (/^-?\d*\.\d+$/.test(raw) || /^-?\d+\.\d*$/.test(raw)) {
      const n = parseFloat(raw);
      if (!isNaN(n)) return n;
    }
    if (/^(true|false)$/i.test(raw)) return raw.toLowerCase() === 'true';
    return raw;
  }

  function csvToJson(csvText, opts) {
    opts = opts || {};
    const delim = opts.delimiter || ',';
    const inferTypes = opts.inferTypes !== false; // default true
    const unflatten = opts.unflatten !== false;   // default true
    const rawLines = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(function (l) { return l.length > 0; });
    if (rawLines.length === 0) return [];
    const headers = parseCsvLine(rawLines[0], delim);
    return rawLines.slice(1).map(function (line) {
      const cells = parseCsvLine(line, delim);
      const flatObj = {};
      headers.forEach(function (h, i) {
        const raw = cells[i] !== undefined ? cells[i] : '';
        flatObj[h] = inferTypes ? inferCell(raw) : raw;
      });
      return unflatten ? unflattenObj(flatObj) : flatObj;
    });
  }

  // ---------------- XML <-> JSON (hand-written, no DOM) ----------------
  function xmlEscape(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function jsonToXml(obj, rootName) {
    rootName = rootName || 'root';
    function build(key, val, depth) {
      const p = '  '.repeat(depth);
      if (val === null || val === undefined) return p + '<' + key + '/>';
      if (Array.isArray(val)) return val.map(function (v) { return build(key, v, depth); }).join('\n');
      if (typeof val === 'object') {
        const inner = Object.keys(val).map(function (k) { return build(k, val[k], depth + 1); }).join('\n');
        return p + '<' + key + '>\n' + inner + '\n' + p + '</' + key + '>';
      }
      return p + '<' + key + '>' + xmlEscape(val) + '</' + key + '>';
    }
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + build(rootName, obj, 0);
  }

  // Minimal recursive-descent XML parser -> { tagName: '', attrs: {}, children: [...], text: '' }
  function parseXmlToTree(xml) {
    let i = 0;
    const n = xml.length;

    function skipProlog() {
      xml = xml.replace(/^\uFEFF/, '');
      const m = /^\s*<\?xml[^>]*\?>/i.exec(xml);
      if (m) i = m[0].length;
      // skip comments/whitespace before root
      while (true) {
        const rest = xml.slice(i);
        const ws = /^\s+/.exec(rest);
        if (ws) { i += ws[0].length; continue; }
        const cm = /^<!--[\s\S]*?-->/.exec(rest);
        if (cm) { i += cm[0].length; continue; }
        const dt = /^<!DOCTYPE[^>]*>/i.exec(rest);
        if (dt) { i += dt[0].length; continue; }
        break;
      }
    }

    function parseAttrs(str) {
      const attrs = {};
      const re = /([a-zA-Z_:][\w:.-]*)\s*=\s*"([^"]*)"|([a-zA-Z_:][\w:.-]*)\s*=\s*'([^']*)'/g;
      let m;
      while ((m = re.exec(str))) {
        const name = m[1] || m[3];
        const val = m[2] !== undefined ? m[2] : m[4];
        attrs[name] = val.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
      }
      return attrs;
    }

    function parseElement() {
      if (xml[i] !== '<') throw new Error('Malformed XML near position ' + i);
      const openMatch = /^<([a-zA-Z_:][\w:.-]*)((?:\s+[^<>]*?)?)(\/)?>/.exec(xml.slice(i));
      if (!openMatch) throw new Error('Malformed start tag near position ' + i);
      const tagName = openMatch[1];
      const attrs = parseAttrs(openMatch[2] || '');
      i += openMatch[0].length;
      const node = { tagName: tagName, attrs: attrs, children: [], text: '' };
      if (openMatch[3]) return node; // self-closing

      let textBuf = '';
      while (i < n) {
        if (xml.slice(i, i + 4) === '<!--') {
          const end = xml.indexOf('-->', i);
          i = end === -1 ? n : end + 3;
          continue;
        }
        if (xml[i] === '<') {
          if (xml.slice(i, i + 2) === '</') {
            const closeMatch = /^<\/([a-zA-Z_:][\w:.-]*)\s*>/.exec(xml.slice(i));
            if (!closeMatch) throw new Error('Malformed end tag near position ' + i);
            if (closeMatch[1] !== tagName) {
              throw new Error('Mismatched closing tag: expected </' + tagName + '> but found </' + closeMatch[1] + '>');
            }
            i += closeMatch[0].length;
            node.text = textBuf.trim();
            return node;
          }
          if (textBuf.trim()) { node.children.push({ tagName: '#text', attrs: {}, children: [], text: textBuf.trim() }); }
          textBuf = '';
          node.children.push(parseElement());
        } else {
          textBuf += xml[i];
          i++;
        }
      }
      throw new Error('Unexpected end of input — missing closing tag for <' + tagName + '>');
    }

    skipProlog();
    while (i < n && /\s/.test(xml[i])) i++;
    if (i >= n || xml[i] !== '<') throw new Error('No root element found');
    const root = parseElement();
    // trailing content check (ignore whitespace/comments)
    return root;
  }

  function treeToObj(node) {
    const realChildren = node.children.filter(function (c) { return c.tagName !== '#text'; });
    const hasAttrs = Object.keys(node.attrs).length > 0;
    if (realChildren.length === 0) {
      const textVal = node.text || '';
      if (!hasAttrs) return textVal;
      const obj = {};
      Object.keys(node.attrs).forEach(function (a) { obj['@' + a] = node.attrs[a]; });
      if (textVal) obj['#text'] = textVal;
      return obj;
    }
    const obj = {};
    if (hasAttrs) Object.keys(node.attrs).forEach(function (a) { obj['@' + a] = node.attrs[a]; });
    realChildren.forEach(function (child) {
      const val = treeToObj(child);
      if (Object.prototype.hasOwnProperty.call(obj, child.tagName)) {
        if (!Array.isArray(obj[child.tagName])) obj[child.tagName] = [obj[child.tagName]];
        obj[child.tagName].push(val);
      } else {
        obj[child.tagName] = val;
      }
    });
    return obj;
  }

  function xmlToJson(xmlText) {
    const tree = parseXmlToTree(xmlText);
    const out = {};
    out[tree.tagName] = treeToObj(tree);
    return out;
  }

  // ---------------- Deep diff (key-aware for arrays of objects) ----------------
  function isPlainObj(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }

  function pickArrayKey(arrA, arrB) {
    if (!arrA.length || !arrB.length) return null;
    if (!arrA.every(isPlainObj) || !arrB.every(isPlainObj)) return null;
    const candidates = ['id', 'uuid', '_id', 'key', 'slug', 'code', 'name'];
    for (let ci = 0; ci < candidates.length; ci++) {
      const cand = candidates[ci];
      const inAllA = arrA.every(function (v) { return Object.prototype.hasOwnProperty.call(v, cand); });
      const inAllB = arrB.every(function (v) { return Object.prototype.hasOwnProperty.call(v, cand); });
      if (!inAllA || !inAllB) continue;
      const valsA = arrA.map(function (v) { return v[cand]; });
      const valsB = arrB.map(function (v) { return v[cand]; });
      if (new Set(valsA).size === valsA.length && new Set(valsB).size === valsB.length) return cand;
    }
    return null;
  }

  function deepDiff(a, b, path) {
    path = path || '';
    const changes = [];
    const aObj = isPlainObj(a) || Array.isArray(a);
    const bObj = isPlainObj(b) || Array.isArray(b);

    if (!aObj && !bObj) {
      if (a !== b) changes.push({ path: path || '(root)', type: 'changed', oldVal: a, newVal: b });
      return changes;
    }
    if (aObj !== bObj) { changes.push({ path: path || '(root)', type: 'changed', oldVal: a, newVal: b }); return changes; }

    const aIsArr = Array.isArray(a), bIsArr = Array.isArray(b);
    if (aIsArr !== bIsArr) { changes.push({ path: path || '(root)', type: 'changed', oldVal: a, newVal: b }); return changes; }

    if (aIsArr) {
      const key = pickArrayKey(a, b);
      if (key) {
        const mapA = new Map(a.map(function (v) { return [v[key], v]; }));
        const mapB = new Map(b.map(function (v) { return [v[key], v]; }));
        const allKeys = Array.from(new Set([].concat(Array.from(mapA.keys()), Array.from(mapB.keys()))));
        allKeys.forEach(function (k) {
          const p = path + '[' + key + '=' + JSON.stringify(k) + ']';
          const inA = mapA.has(k), inB = mapB.has(k);
          if (inA && !inB) changes.push({ path: p, type: 'removed', oldVal: mapA.get(k), newVal: undefined });
          else if (!inA && inB) changes.push({ path: p, type: 'added', oldVal: undefined, newVal: mapB.get(k) });
          else changes.push.apply(changes, deepDiff(mapA.get(k), mapB.get(k), p));
        });
        return changes;
      }
      const maxLen = Math.max(a.length, b.length);
      for (let idx = 0; idx < maxLen; idx++) {
        const p = path + '[' + idx + ']';
        if (idx >= a.length) changes.push({ path: p, type: 'added', oldVal: undefined, newVal: b[idx] });
        else if (idx >= b.length) changes.push({ path: p, type: 'removed', oldVal: a[idx], newVal: undefined });
        else changes.push.apply(changes, deepDiff(a[idx], b[idx], p));
      }
      return changes;
    }

    const aKeys = Object.keys(a), bKeys = Object.keys(b);
    const allKeys = Array.from(new Set(aKeys.concat(bKeys)));
    allKeys.forEach(function (k) {
      const p = path ? path + '.' + k : k;
      const inA = Object.prototype.hasOwnProperty.call(a, k);
      const inB = Object.prototype.hasOwnProperty.call(b, k);
      if (inA && !inB) changes.push({ path: p, type: 'removed', oldVal: a[k], newVal: undefined });
      else if (!inA && inB) changes.push({ path: p, type: 'added', oldVal: undefined, newVal: b[k] });
      else changes.push.apply(changes, deepDiff(a[k], b[k], p));
    });
    return changes;
  }

  // ---------------- CSV diff (key-column aware) ----------------
  function csvToRows(text, delim) {
    delim = delim || ',';
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(function (l) { return l.length > 0; });
    if (!lines.length) return { headers: [], rows: [] };
    const headers = parseCsvLine(lines[0], delim);
    const rows = lines.slice(1).map(function (l) {
      const cells = parseCsvLine(l, delim);
      const obj = {};
      headers.forEach(function (h, idx) { obj[h] = cells[idx] !== undefined ? cells[idx] : ''; });
      return obj;
    });
    return { headers: headers, rows: rows };
  }

  // Normalizes a value for comparison purposes only (display/output values
  // stay untouched). ignoreWhitespace collapses leading/trailing and runs
  // of internal whitespace, so "Ada  Lovelace " and "Ada Lovelace" count as
  // equal — a very common source of false-positive diffs in real CSVs
  // exported from different tools.
  function normalizeForCompare(val, opts) {
    if (val === undefined || val === null) return val;
    if (!opts || !opts.ignoreWhitespace) return val;
    return String(val).trim().replace(/\s+/g, ' ');
  }

  function csvDiff(csvA, csvB, opts) {
    opts = opts || {};
    const delim = opts.delimiter || ',';
    const A = csvToRows(csvA, delim), B = csvToRows(csvB, delim);
    const key = opts.keyColumn || A.headers[0];
    const mapA = new Map(A.rows.map(function (r) { return [r[key], r]; }));
    const mapB = new Map(B.rows.map(function (r) { return [r[key], r]; }));
    const added = [], removed = [], changed = [];

    const headerSet = new Set(A.headers);
    B.headers.forEach(function (h) { headerSet.add(h); });
    const headers = Array.from(headerSet);

    // Full aligned view (Beyond-Compare-style): every row from both files,
    // in A's original order first, then any B-only rows appended in B's
    // order. Each entry carries its full data plus a status, so the UI can
    // render one unified table instead of three separate lists.
    const rows = [];
    const seenKeys = new Set();

    A.rows.forEach(function (rowA) {
      const k = rowA[key];
      seenKeys.add(k);
      if (!mapB.has(k)) {
        removed.push(rowA);
        rows.push({ key: k, status: 'removed', a: rowA, b: null, changedCols: [] });
        return;
      }
      const rowB = mapB.get(k);
      const changedCols = [];
      const cellChanges = [];
      headers.forEach(function (col) {
        if (normalizeForCompare(rowA[col], opts) !== normalizeForCompare(rowB[col], opts)) {
          changedCols.push(col);
          cellChanges.push({ col: col, from: rowA[col], to: rowB[col] });
        }
      });
      if (cellChanges.length) {
        changed.push({ key: k, cellChanges: cellChanges });
        rows.push({ key: k, status: 'changed', a: rowA, b: rowB, changedCols: changedCols });
      } else {
        rows.push({ key: k, status: 'unchanged', a: rowA, b: rowB, changedCols: [] });
      }
    });

    B.rows.forEach(function (rowB) {
      const k = rowB[key];
      if (!seenKeys.has(k)) {
        added.push(rowB);
        rows.push({ key: k, status: 'added', a: null, b: rowB, changedCols: [] });
      }
    });

    return { added: added, removed: removed, changed: changed, keyColumn: key, headers: headers, rows: rows };
  }

  // ---------------- JSON Schema inference (draft-07-ish) ----------------
  function typeOf(v) {
    if (v === null) return 'null';
    if (Array.isArray(v)) return 'array';
    if (typeof v === 'number') return Number.isInteger(v) ? 'integer' : 'number';
    return typeof v; // 'string' | 'boolean' | 'object'
  }

  function mergeSchemas(schemas) {
    const types = Array.from(new Set(schemas.map(function (s) { return s.type; })));
    if (types.length === 1 && types[0] === 'object') {
      const propSets = schemas.map(function (s) { return s.properties || {}; });
      const allKeys = Array.from(new Set(propSets.reduce(function (acc, p) { return acc.concat(Object.keys(p)); }, [])));
      const properties = {};
      allKeys.forEach(function (k) {
        const variants = propSets.filter(function (p) { return p[k]; }).map(function (p) { return p[k]; });
        properties[k] = mergeSchemas(variants);
      });
      const required = allKeys.filter(function (k) { return propSets.every(function (p) { return Object.prototype.hasOwnProperty.call(p, k); }); });
      const out = { type: 'object', properties: properties };
      if (required.length) out.required = required;
      return out;
    }
    if (types.length === 1) return schemas[0];
    return { anyOf: schemas.filter(function (s, idx) { return schemas.findIndex(function (t) { return JSON.stringify(t) === JSON.stringify(s); }) === idx; }) };
  }

  function inferSchema(value) {
    const t = typeOf(value);
    if (t === 'null') return { type: 'null' };
    if (t === 'boolean' || t === 'integer' || t === 'number' || t === 'string') return { type: t };
    if (t === 'array') {
      if (!value.length) return { type: 'array', items: {} };
      const itemSchemas = value.map(inferSchema);
      return { type: 'array', items: mergeSchemas(itemSchemas) };
    }
    // object
    const properties = {};
    Object.keys(value).forEach(function (k) { properties[k] = inferSchema(value[k]); });
    const out = { type: 'object', properties: properties };
    const keys = Object.keys(value);
    if (keys.length) out.required = keys;
    return out;
  }

  function jsonSchemaFromSample(value, opts) {
    opts = opts || {};
    const schema = inferSchema(value);
    schema['$schema'] = 'http://json-schema.org/draft-07/schema#';
    if (opts.title) schema.title = opts.title;
    // re-order so $schema/title appear first when stringified
    const ordered = {};
    if (schema['$schema']) ordered['$schema'] = schema['$schema'];
    if (schema.title) ordered.title = schema.title;
    Object.keys(schema).forEach(function (k) { if (k !== '$schema' && k !== 'title') ordered[k] = schema[k]; });
    return ordered;
  }

  // ---------------- JSON Schema validation (draft-07 subset) ----------------
  // Supports: type (string or array), enum, const, properties/required/
  // additionalProperties, items, minItems/maxItems, minimum/maximum/
  // exclusiveMinimum/exclusiveMaximum, minLength/maxLength, pattern,
  // anyOf/oneOf/allOf. Enough for real API-contract checking without
  // pulling in a full ajv dependency.
  function matchesType(value, type) {
    if (type === 'null') return value === null;
    if (type === 'array') return Array.isArray(value);
    if (type === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
    if (type === 'integer') return typeof value === 'number' && Number.isInteger(value);
    if (type === 'number') return typeof value === 'number';
    if (type === 'string') return typeof value === 'string';
    if (type === 'boolean') return typeof value === 'boolean';
    return true;
  }

  function validateNode(value, schema, path, errors) {
    if (schema === true) return;
    if (schema === false) { errors.push({ path: path || '(root)', message: 'schema disallows any value here' }); return; }
    if (typeof schema !== 'object' || schema === null) return;

    if (schema.type !== undefined) {
      const types = Array.isArray(schema.type) ? schema.type : [schema.type];
      if (!types.some(function (t) { return matchesType(value, t); })) {
        errors.push({ path: path || '(root)', message: 'expected type ' + types.join(' or ') + ', got ' + typeOf(value) });
        return;
      }
    }

    if (schema.enum !== undefined) {
      const ok = schema.enum.some(function (v) { return JSON.stringify(v) === JSON.stringify(value); });
      if (!ok) errors.push({ path: path || '(root)', message: 'value not in enum: ' + JSON.stringify(schema.enum) });
    }
    if (schema.const !== undefined) {
      if (JSON.stringify(value) !== JSON.stringify(schema.const)) {
        errors.push({ path: path || '(root)', message: 'expected const ' + JSON.stringify(schema.const) });
      }
    }

    if (typeof value === 'number') {
      if (schema.minimum !== undefined && value < schema.minimum) errors.push({ path: path, message: 'must be >= ' + schema.minimum });
      if (schema.maximum !== undefined && value > schema.maximum) errors.push({ path: path, message: 'must be <= ' + schema.maximum });
      if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) errors.push({ path: path, message: 'must be > ' + schema.exclusiveMinimum });
      if (schema.exclusiveMaximum !== undefined && value >= schema.exclusiveMaximum) errors.push({ path: path, message: 'must be < ' + schema.exclusiveMaximum });
    }

    if (typeof value === 'string') {
      if (schema.minLength !== undefined && value.length < schema.minLength) errors.push({ path: path, message: 'must have length >= ' + schema.minLength });
      if (schema.maxLength !== undefined && value.length > schema.maxLength) errors.push({ path: path, message: 'must have length <= ' + schema.maxLength });
      if (schema.pattern !== undefined) {
        try { if (!new RegExp(schema.pattern).test(value)) errors.push({ path: path, message: 'does not match pattern ' + schema.pattern }); }
        catch (e) { errors.push({ path: path, message: 'invalid pattern in schema: ' + schema.pattern }); }
      }
    }

    if (Array.isArray(value)) {
      if (schema.minItems !== undefined && value.length < schema.minItems) errors.push({ path: path, message: 'must have >= ' + schema.minItems + ' items' });
      if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push({ path: path, message: 'must have <= ' + schema.maxItems + ' items' });
      if (schema.items !== undefined) {
        value.forEach(function (item, i) { validateNode(item, schema.items, path + '[' + i + ']', errors); });
      }
    }

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      if (Array.isArray(schema.required)) {
        schema.required.forEach(function (k) {
          if (!Object.prototype.hasOwnProperty.call(value, k)) errors.push({ path: (path ? path + '.' : '') + k, message: 'required property missing' });
        });
      }
      if (schema.properties) {
        Object.keys(schema.properties).forEach(function (k) {
          if (Object.prototype.hasOwnProperty.call(value, k)) {
            validateNode(value[k], schema.properties[k], (path ? path + '.' : '') + k, errors);
          }
        });
      }
      if (schema.additionalProperties === false && schema.properties) {
        Object.keys(value).forEach(function (k) {
          if (!Object.prototype.hasOwnProperty.call(schema.properties, k)) {
            errors.push({ path: (path ? path + '.' : '') + k, message: 'additional property not allowed' });
          }
        });
      }
    }

    if (Array.isArray(schema.allOf)) schema.allOf.forEach(function (s) { validateNode(value, s, path, errors); });
    if (Array.isArray(schema.anyOf)) {
      const anyErrors = schema.anyOf.map(function (s) { const e = []; validateNode(value, s, path, e); return e; });
      if (!anyErrors.some(function (e) { return e.length === 0; })) {
        errors.push({ path: path || '(root)', message: 'does not match any schema in anyOf' });
      }
    }
    if (Array.isArray(schema.oneOf)) {
      const oneErrors = schema.oneOf.map(function (s) { const e = []; validateNode(value, s, path, e); return e; });
      const matchCount = oneErrors.filter(function (e) { return e.length === 0; }).length;
      if (matchCount !== 1) errors.push({ path: path || '(root)', message: 'must match exactly one schema in oneOf (matched ' + matchCount + ')' });
    }
  }

  function validateAgainstSchema(data, schema) {
    const errors = [];
    validateNode(data, schema, '', errors);
    return { valid: errors.length === 0, errors: errors };
  }

  return {
    flattenObj: flattenObj,
    unflattenObj: unflattenObj,
    jsonToCsv: jsonToCsv,
    csvToJson: csvToJson,
    jsonToXml: jsonToXml,
    xmlToJson: xmlToJson,
    parseXmlToTree: parseXmlToTree,
    deepDiff: deepDiff,
    pickArrayKey: pickArrayKey,
    csvDiff: csvDiff,
    jsonSchemaFromSample: jsonSchemaFromSample,
    validateAgainstSchema: validateAgainstSchema,
    inferCell: inferCell
  };
});
