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

  // Raw header/row split for the table-preview UI reuses the internal
  // csvToRows(text, delim) helper defined below (used by csvDiff) — same
  // shape (headers + row objects keyed by header) is exactly what the
  // table view needs, so no separate parser required.

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

  // ---------------- JSON <-> YAML ----------------
  function yamlIndent(n) { return '  '.repeat(n); }

  function yamlScalar(val) {
    if (val === null || val === undefined) return 'null';
    if (typeof val === 'boolean' || typeof val === 'number') return String(val);
    const s = String(val);
    if (s === '') return "''";
    const looksSpecial = /^(true|false|null|~|-?\d+(\.\d+)?)$/i.test(s);
    const needsQuote = looksSpecial ||
      /^[\s\-?:,\[\]{}#&*!|>'"%@`]/.test(s) ||
      /: |:$| #|\n/.test(s) ||
      s !== s.trim();
    if (needsQuote) {
      return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
    }
    return s;
  }

  function yamlIsContainer(v) {
    if (v === null || typeof v !== 'object') return false;
    return Array.isArray(v) ? v.length > 0 : Object.keys(v).length > 0;
  }

  function yamlObjectBody(obj, indent) {
    const keys = Object.keys(obj);
    if (!keys.length) return yamlIndent(indent) + '{}';
    const pad = yamlIndent(indent);
    return keys.map(function (k) {
      const v = obj[k];
      const key = /^[A-Za-z_][\w-]*$/.test(k) ? k : yamlScalar(k);
      if (yamlIsContainer(v)) return pad + key + ':\n' + yamlNode(v, indent + 1);
      return pad + key + ': ' + yamlScalar(v);
    }).join('\n');
  }

  function yamlArrayBody(arr, indent) {
    if (!arr.length) return yamlIndent(indent) + '[]';
    const pad = yamlIndent(indent);
    return arr.map(function (item) {
      if (yamlIsContainer(item)) {
        const childPad = yamlIndent(indent + 1);
        const body = yamlNode(item, indent + 1);
        const lines = body.split('\n').map(function (l, idx) { return idx === 0 ? l.slice(childPad.length) : l; });
        return pad + '- ' + lines[0] + (lines.length > 1 ? '\n' + lines.slice(1).join('\n') : '');
      }
      return pad + '- ' + yamlScalar(item);
    }).join('\n');
  }

  function yamlNode(value, indent) {
    if (value === null || typeof value !== 'object') return yamlScalar(value);
    return Array.isArray(value) ? yamlArrayBody(value, indent) : yamlObjectBody(value, indent);
  }

  // Dependency-free block-style YAML emitter (covers the mappings/sequences/
  // scalars that a JSON document actually needs — not the full YAML spec).
  function jsonToYaml(value) {
    if (value === null || typeof value !== 'object') return yamlScalar(value) + '\n';
    return yamlNode(value, 0) + '\n';
  }

  function yamlUnquote(raw) {
    const s = raw.trim();
    if (s.length >= 2 && s[0] === '"' && s[s.length - 1] === '"') {
      return s.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    if (s.length >= 2 && s[0] === "'" && s[s.length - 1] === "'") {
      return s.slice(1, -1).replace(/''/g, "'");
    }
    return s;
  }

  function yamlParseScalar(raw) {
    let s = raw.trim();
    if (s[0] !== '"' && s[0] !== "'") {
      const commentMatch = /^(.*?)\s+#.*$/.exec(s);
      if (commentMatch) s = commentMatch[1].trim();
    }
    if (s === '' || s === '~' || /^null$/i.test(s)) return null;
    if (/^true$/i.test(s)) return true;
    if (/^false$/i.test(s)) return false;
    if (s[0] === '"' || s[0] === "'") return yamlUnquote(s);
    if (/^-?\d+$/.test(s)) return parseInt(s, 10);
    if (/^-?\d*\.\d+$/.test(s) || /^-?\d+\.\d*$/.test(s)) return parseFloat(s);
    return s;
  }

  const YAML_KV_RE = /^("(?:[^"\\]|\\.)*"|'(?:[^']|'')*'|[^:]+):(\s*(.*))?$/;

  function yamlTokenize(text) {
    const rawLines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const lines = [];
    rawLines.forEach(function (line) {
      if (/^\s*#/.test(line) || /^\s*$/.test(line) || /^---\s*$/.test(line) || /^\.\.\.\s*$/.test(line)) return;
      const m = /^(\s*)/.exec(line);
      lines.push({ indent: m[1].length, text: line.slice(m[1].length) });
    });
    return lines;
  }

  function yamlParseMappingLine(text) {
    const m = YAML_KV_RE.exec(text);
    if (!m) return null;
    const rawKey = m[1];
    return { key: /^["']/.test(rawKey) ? yamlUnquote(rawKey) : rawKey.trim(), rawVal: m[3] !== undefined ? m[3] : '' };
  }

  function yamlParseBlock(lines, pos, indent) {
    if (pos.i >= lines.length || lines[pos.i].indent < indent) return null;
    const isSeq = /^-(\s|$)/.test(lines[pos.i].text);
    if (isSeq) {
      const arr = [];
      while (pos.i < lines.length && lines[pos.i].indent === indent && /^-(\s|$)/.test(lines[pos.i].text)) {
        const line = lines[pos.i];
        const rest = line.text.slice(1).replace(/^\s+/, '');
        const dashPrefixLen = line.text.length - rest.length;
        if (rest === '') {
          pos.i++;
          arr.push(pos.i < lines.length && lines[pos.i].indent > indent ? yamlParseBlock(lines, pos, lines[pos.i].indent) : null);
        } else if (YAML_KV_RE.test(rest)) {
          // "- key: value" — rewrite as a plain mapping line at the deeper
          // indent so the mapping branch below can parse it (and any
          // sibling keys on the following lines) without duplicating logic.
          lines[pos.i] = { indent: indent + dashPrefixLen, text: rest };
          arr.push(yamlParseBlock(lines, pos, indent + dashPrefixLen));
        } else {
          arr.push(yamlParseScalar(rest));
          pos.i++;
        }
      }
      return arr;
    }
    const obj = {};
    while (pos.i < lines.length && lines[pos.i].indent === indent && !/^-(\s|$)/.test(lines[pos.i].text)) {
      const parsed = yamlParseMappingLine(lines[pos.i].text);
      if (!parsed) { pos.i++; continue; }
      pos.i++;
      if (parsed.rawVal === '') {
        if (pos.i < lines.length && lines[pos.i].indent > indent) {
          obj[parsed.key] = yamlParseBlock(lines, pos, lines[pos.i].indent);
        } else if (pos.i < lines.length && lines[pos.i].indent === indent && /^-(\s|$)/.test(lines[pos.i].text)) {
          obj[parsed.key] = yamlParseBlock(lines, pos, indent);
        } else {
          obj[parsed.key] = null;
        }
      } else if (parsed.rawVal === '[]') {
        obj[parsed.key] = [];
      } else if (parsed.rawVal === '{}') {
        obj[parsed.key] = {};
      } else {
        obj[parsed.key] = yamlParseScalar(parsed.rawVal);
      }
    }
    return obj;
  }

  // Dependency-free block-style YAML parser. Covers mappings, sequences,
  // nesting via indentation, and quoted/plain/numeric/boolean/null scalars.
  // Does NOT support flow style ({}/[] inline), anchors/aliases, multi-line
  // block scalars (| or >), or multi-document files — a documented subset
  // that covers the config-file and API-response YAML people actually paste.
  function yamlToJson(yamlText) {
    const lines = yamlTokenize(yamlText);
    if (!lines.length) return null;
    if (lines.length === 1 && !/^-(\s|$)/.test(lines[0].text) && !YAML_KV_RE.test(lines[0].text)) {
      return yamlParseScalar(lines[0].text);
    }
    const pos = { i: 0 };
    return yamlParseBlock(lines, pos, lines[0].indent);
  }

  // ---------------- JSON <-> Markdown table (GFM pipe tables) ----------------
  function mdEscapeCell(val) {
    if (val === null || val === undefined) return '';
    return String(val).replace(/\|/g, '\\|').replace(/\n/g, '<br>');
  }

  function jsonToMarkdownTable(jsonArray) {
    if (!Array.isArray(jsonArray)) jsonArray = [jsonArray];
    const flatRows = jsonArray.map(function (row) { return flattenObj(row); });
    const headerSet = new Set();
    flatRows.forEach(function (r) { Object.keys(r).forEach(function (k) { headerSet.add(k); }); });
    const headers = Array.from(headerSet);
    if (!headers.length) return '';
    const headerLine = '| ' + headers.join(' | ') + ' |';
    const sepLine = '| ' + headers.map(function () { return '---'; }).join(' | ') + ' |';
    const rowLines = flatRows.map(function (r) {
      return '| ' + headers.map(function (h) { return mdEscapeCell(r[h]); }).join(' | ') + ' |';
    });
    return [headerLine, sepLine].concat(rowLines).join('\n');
  }

  function splitMdRow(line) {
    let s = line.trim();
    if (s[0] === '|') s = s.slice(1);
    if (s[s.length - 1] === '|') s = s.slice(0, -1);
    const cells = []; let cur = '';
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '\\' && s[i + 1] === '|') { cur += '|'; i++; }
      else if (s[i] === '|') { cells.push(cur.trim()); cur = ''; }
      else cur += s[i];
    }
    cells.push(cur.trim());
    return cells;
  }

  function markdownTableToJson(mdText, opts) {
    opts = opts || {};
    const inferTypes = opts.inferTypes !== false;
    const unflatten = opts.unflatten !== false;
    const lines = mdText.replace(/\r\n/g, '\n').split('\n')
      .map(function (l) { return l.trim(); })
      .filter(function (l) { return l.length > 0 && l.indexOf('|') !== -1; });
    if (lines.length < 2) return [];
    const headers = splitMdRow(lines[0]);
    const dataLines = lines.slice(2); // lines[1] is the |---|---| separator row
    return dataLines.map(function (line) {
      const cells = splitMdRow(line);
      const flatObj = {};
      headers.forEach(function (h, i) {
        const raw = (cells[i] !== undefined ? cells[i] : '').replace(/<br>/gi, '\n');
        flatObj[h] = inferTypes ? inferCell(raw) : raw;
      });
      return unflatten ? unflattenObj(flatObj) : flatObj;
    });
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

  // ---------------- JSONPath (subset: dotted keys, [n] index, [*] wildcard) ----------------
  // Pure query logic, reused by both the standalone JSONPath tool and the
  // jsonPath recipe/batch step — same algorithm either way.
  function jsonPathQuery(obj, path) {
    path = (path || '').trim();
    if (!path) throw new Error('Enter a JSONPath expression');
    if (path.startsWith('$.')) path = path.slice(2);
    else if (path.startsWith('$')) path = path.slice(1);
    if (path.startsWith('.')) path = path.slice(1);
    const parts = [];
    path.replace(/([^.\[\]]+)|\[(\d+)\]|\[\*\]/g, (_, key, idx) => {
      if (key !== undefined) parts.push(key);
      else if (idx !== undefined) parts.push(Number(idx));
      else parts.push('*');
    });
    let current = [obj];
    for (const part of parts) {
      const next = [];
      for (const node of current) {
        if (part === '*') {
          if (Array.isArray(node)) node.forEach(v => next.push(v));
          else if (node && typeof node === 'object') Object.values(node).forEach(v => next.push(v));
        } else if (node != null && typeof node === 'object') {
          next.push(node[part]);
        }
      }
      current = next.filter(v => v !== undefined);
    }
    return current.length === 1 ? current[0] : current;
  }

  // ---------------- Lightweight syntax validation (structured, for recipe/batch use) ----------------
  // Deliberately simple pass/fail — the rich, human-readable validation
  // report is a presentation concern that stays in the standalone tool;
  // a recipe step needs a clean, deterministic {valid, error} to act on.
  function validateJsonSyntax(text) {
    if (text == null || !String(text).trim()) return { valid: false, error: 'Input is empty' };
    try { const obj = JSON.parse(text); JSON.stringify(obj); return { valid: true, error: null }; }
    catch (e) { return { valid: false, error: e.message || String(e) }; }
  }
  function validateXmlSyntax(text) {
    if (text == null || !String(text).trim()) return { valid: false, error: 'Input is empty' };
    if (!text.trim().startsWith('<')) return { valid: false, error: 'Does not look like XML' };
    if (typeof DOMParser === 'undefined') return { valid: false, error: 'XML validation is not available in this context' };
    const doc = new DOMParser().parseFromString(text, 'text/xml');
    const err = doc.querySelector('parsererror');
    return err ? { valid: false, error: err.textContent.replace(/\s+/g, ' ').trim().slice(0, 240) } : { valid: true, error: null };
  }

  function validateAgainstSchema(data, schema) {
    const errors = [];
    validateNode(data, schema, '', errors);
    return { valid: errors.length === 0, errors: errors };
  }

  // ---------------- JSON Schema -> TypeScript / Zod ----------------
  // Both renderers walk the SAME schema produced by jsonSchemaFromSample,
  // so a "JSON to TypeScript" and "JSON to Zod" result always agree with
  // what the JSON Schema Generator tool shows for the same input — one
  // inference pass, multiple output syntaxes, rather than two separate
  // (and potentially diverging) type-inference implementations.

  function isValidIdentifier(key) {
    return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
  }
  function tsKey(key) {
    return isValidIdentifier(key) ? key : JSON.stringify(key);
  }

  function schemaToTsType(s, indent) {
    if (!s || (s.type === undefined && !s.anyOf)) return 'any';
    if (s.anyOf) {
      const parts = s.anyOf.map(function (sub) { return schemaToTsType(sub, indent); });
      return Array.from(new Set(parts)).join(' | ');
    }
    if (s.type === 'string') return 'string';
    if (s.type === 'integer' || s.type === 'number') return 'number';
    if (s.type === 'boolean') return 'boolean';
    if (s.type === 'null') return 'null';
    if (s.type === 'array') {
      const itemType = schemaToTsType(s.items, indent);
      return itemType.indexOf('|') !== -1 ? '(' + itemType + ')[]' : itemType + '[]';
    }
    if (s.type === 'object') return tsObjectBody(s, indent);
    return 'any';
  }

  function tsObjectBody(s, indent) {
    const pad = '  '.repeat(indent + 1);
    const closePad = '  '.repeat(indent);
    const props = s.properties || {};
    const required = {};
    (s.required || []).forEach(function (k) { required[k] = true; });
    const keys = Object.keys(props);
    if (!keys.length) return '{}';
    const lines = keys.map(function (key) {
      const optional = required[key] ? '' : '?';
      return pad + tsKey(key) + optional + ': ' + schemaToTsType(props[key], indent + 1) + ';';
    });
    return '{\n' + lines.join('\n') + '\n' + closePad + '}';
  }

  // ---------------- Structural summary — "explain this JSON" without AI ----------------
  // A privacy-preserving alternative to a full visual graph: reuses the same
  // schema inference already powering the Schema generator (so it's
  // guaranteed consistent with it) and renders it as a readable indented
  // tree instead of raw JSON Schema syntax. Everything computed client-side,
  // nothing sent anywhere — same promise as the rest of the toolkit.
  function schemaTypeLabel(s) {
    if (!s || (s.type === undefined && !s.anyOf)) return 'any';
    if (s.anyOf) return Array.from(new Set(s.anyOf.map(schemaTypeLabel))).join(' | ');
    return s.type;
  }

  function renderSchemaTree(s, prefix, lines) {
    if (!s || s.type !== 'object' || !s.properties) return;
    const keys = Object.keys(s.properties);
    const req = {};
    (s.required || []).forEach(function (k) { req[k] = true; });
    keys.forEach(function (k, idx) {
      const isLast = idx === keys.length - 1;
      const branch = isLast ? '\u2514\u2500 ' : '\u251c\u2500 ';
      const cont = isLast ? '   ' : '\u2502  ';
      const child = s.properties[k];
      const optional = req[k] ? '' : ' (optional)';
      if (child.type === 'object' && child.properties) {
        const n = Object.keys(child.properties).length;
        lines.push(prefix + branch + k + ': object (' + n + ' key' + (n === 1 ? '' : 's') + ')' + optional);
        renderSchemaTree(child, prefix + cont, lines);
      } else if (child.type === 'array') {
        lines.push(prefix + branch + k + ': array of ' + schemaTypeLabel(child.items) + optional);
        if (child.items && child.items.type === 'object' && child.items.properties) {
          renderSchemaTree(child.items, prefix + cont, lines);
        }
      } else {
        lines.push(prefix + branch + k + ': ' + schemaTypeLabel(child) + optional);
      }
    });
  }

  function jsonStructureSummary(data) {
    const schema = inferSchema(data);
    const lines = [];
    let rootLabel;
    if (schema.type === 'array') {
      rootLabel = 'array of ' + schemaTypeLabel(schema.items);
      if (schema.items && schema.items.type === 'object' && schema.items.properties) {
        renderSchemaTree(schema.items, '', lines);
      }
    } else if (schema.type === 'object') {
      const n = schema.properties ? Object.keys(schema.properties).length : 0;
      rootLabel = 'object (' + n + ' key' + (n === 1 ? '' : 's') + ')';
      renderSchemaTree(schema, '', lines);
    } else {
      rootLabel = schemaTypeLabel(schema);
    }
    let maxDepth = 1;
    lines.forEach(function (l) {
      const indent = (l.match(/^(\u2502  |   )*/)[0].length) / 3 + 1;
      if (indent > maxDepth) maxDepth = indent;
    });
    const header = 'root: ' + rootLabel + (lines.length
      ? '  \u2014  ' + lines.length + ' field' + (lines.length === 1 ? '' : 's') + ', max depth ' + maxDepth
      : '');
    return [header].concat(lines).join('\n');
  }

  function jsonSchemaToTypescript(schema, rootName) {
    rootName = rootName || 'Root';
    if (schema && schema.type === 'object') {
      return 'interface ' + rootName + ' ' + tsObjectBody(schema, 0);
    }
    return 'type ' + rootName + ' = ' + schemaToTsType(schema, 0) + ';';
  }

  function schemaToZod(s, indent) {
    if (!s || (s.type === undefined && !s.anyOf)) return 'z.any()';
    if (s.anyOf) {
      const parts = s.anyOf.map(function (sub) { return schemaToZod(sub, indent); });
      return 'z.union([' + parts.join(', ') + '])';
    }
    if (s.type === 'string') return 'z.string()';
    if (s.type === 'integer') return 'z.number().int()';
    if (s.type === 'number') return 'z.number()';
    if (s.type === 'boolean') return 'z.boolean()';
    if (s.type === 'null') return 'z.null()';
    if (s.type === 'array') return 'z.array(' + schemaToZod(s.items, indent) + ')';
    if (s.type === 'object') return zodObjectBody(s, indent);
    return 'z.any()';
  }

  function zodObjectBody(s, indent) {
    const pad = '  '.repeat(indent + 1);
    const closePad = '  '.repeat(indent);
    const props = s.properties || {};
    const required = {};
    (s.required || []).forEach(function (k) { required[k] = true; });
    const keys = Object.keys(props);
    if (!keys.length) return 'z.object({})';
    const lines = keys.map(function (key) {
      let fieldZod = schemaToZod(props[key], indent + 1);
      if (!required[key]) fieldZod += '.optional()';
      return pad + tsKey(key) + ': ' + fieldZod + ',';
    });
    return 'z.object({\n' + lines.join('\n') + '\n' + closePad + '})';
  }

  function jsonSchemaToZod(schema, rootName) {
    rootName = rootName || 'Root';
    const body = schemaToZod(schema, 0);
    return 'import { z } from "zod";\n\n' +
      'const ' + rootName + 'Schema = ' + body + ';\n\n' +
      'export type ' + rootName + ' = z.infer<typeof ' + rootName + 'Schema>;';
  }

  // ---------------- JSON Schema -> Python (dataclasses / Pydantic) / Go ----------------
  // Unlike TS/Zod, Python and Go need every nested object as a NAMED class/
  // struct rather than an inline anonymous type, so these walk the schema
  // and collect class/struct definitions bottom-up (children emitted before
  // the parents that reference them) rather than returning one inline type.

  function toPascalCase(name) {
    return String(name)
      .replace(/(^|[_\-\s]+)([a-zA-Z0-9])/g, function (_, __, c) { return c.toUpperCase(); })
      .replace(/[^A-Za-z0-9]/g, '') || 'Item';
  }

  function pyIdentifier(key) {
    let s = String(key).replace(/[^A-Za-z0-9_]/g, '_');
    if (!/^[A-Za-z_]/.test(s)) s = '_' + s;
    return s;
  }

  function pySchemaType(s, nameHint, classes, style) {
    if (!s || (s.type === undefined && !s.anyOf)) return 'Any';
    if (s.anyOf) {
      const parts = Array.from(new Set(s.anyOf.map(function (sub) { return pySchemaType(sub, nameHint, classes, style); })));
      return parts.length > 1 ? 'Union[' + parts.join(', ') + ']' : parts[0];
    }
    if (s.type === 'string') return 'str';
    if (s.type === 'integer') return 'int';
    if (s.type === 'number') return 'float';
    if (s.type === 'boolean') return 'bool';
    if (s.type === 'null') return 'None';
    if (s.type === 'array') return 'List[' + pySchemaType(s.items, String(nameHint || 'Item').replace(/s$/, ''), classes, style) + ']';
    if (s.type === 'object') {
      const className = toPascalCase(nameHint || 'Item');
      emitPyClass(s, className, classes, style);
      return className;
    }
    return 'Any';
  }

  function emitPyClass(s, className, classes, style) {
    const props = s.properties || {};
    const required = {};
    (s.required || []).forEach(function (k) { required[k] = true; });
    const keys = Object.keys(props);
    const fieldLines = keys.map(function (k) {
      const fieldType = pySchemaType(props[k], k, classes, style);
      const finalType = required[k] ? fieldType : 'Optional[' + fieldType + ']';
      const defaultVal = required[k] ? '' : ' = None';
      return '    ' + pyIdentifier(k) + ': ' + finalType + defaultVal;
    });
    const body = fieldLines.length ? fieldLines.join('\n') : '    pass';
    const header = style === 'pydantic' ? 'class ' + className + '(BaseModel):' : '@dataclass\nclass ' + className + ':';
    classes.push(header + '\n' + body);
  }

  function jsonSchemaToPython(schema, rootName) {
    rootName = rootName || 'Root';
    const classes = [];
    const topType = pySchemaType(schema, rootName, classes, 'dataclass');
    if (schema && schema.type === 'object') {
      return 'from dataclasses import dataclass\nfrom typing import Any, List, Optional, Union\n\n\n' + classes.join('\n\n\n') + '\n';
    }
    return 'from typing import Any, List, Optional, Union\n\n' + rootName + ' = ' + topType + '\n';
  }

  function jsonSchemaToPydantic(schema, rootName) {
    rootName = rootName || 'Root';
    const classes = [];
    const topType = pySchemaType(schema, rootName, classes, 'pydantic');
    if (schema && schema.type === 'object') {
      return 'from pydantic import BaseModel\nfrom typing import Any, List, Optional, Union\n\n\n' + classes.join('\n\n\n') + '\n';
    }
    return 'from typing import Any, List, Optional, Union\n\n' + rootName + ' = ' + topType + '\n';
  }

  function goFieldName(key) { return toPascalCase(key); }
  function goTag(key, required) { return '`json:"' + key + (required ? '' : ',omitempty') + '"`'; }

  function schemaToGoType(s, nameHint, structs) {
    if (!s || (s.type === undefined && !s.anyOf)) return 'interface{}';
    if (s.anyOf) return 'interface{}'; // Go has no native union type — documented limitation
    if (s.type === 'string') return 'string';
    if (s.type === 'integer') return 'int';
    if (s.type === 'number') return 'float64';
    if (s.type === 'boolean') return 'bool';
    if (s.type === 'null') return 'interface{}';
    if (s.type === 'array') return '[]' + schemaToGoType(s.items, String(nameHint || 'Item').replace(/s$/, ''), structs);
    if (s.type === 'object') {
      const structName = toPascalCase(nameHint || 'Item');
      emitGoStruct(s, structName, structs);
      return structName;
    }
    return 'interface{}';
  }

  function emitGoStruct(s, structName, structs) {
    const props = s.properties || {};
    const required = {};
    (s.required || []).forEach(function (k) { required[k] = true; });
    const keys = Object.keys(props);
    const fieldLines = keys.map(function (k) {
      const fieldType = schemaToGoType(props[k], k, structs);
      return '\t' + goFieldName(k) + ' ' + fieldType + ' ' + goTag(k, !!required[k]);
    });
    structs.push('type ' + structName + ' struct {\n' + fieldLines.join('\n') + '\n}');
  }

  function jsonSchemaToGo(schema, rootName) {
    rootName = rootName || 'Root';
    const structs = [];
    const topType = schemaToGoType(schema, rootName, structs);
    if (schema && schema.type === 'object') return structs.join('\n\n') + '\n';
    return 'type ' + rootName + ' = ' + topType + '\n';
  }

  // ---------------- Kotlin data classes ----------------
  function schemaToKotlinType(s, nameHint, classes) {
    if (!s || (s.type === undefined && !s.anyOf)) return 'Any?';
    if (s.anyOf) return 'Any?'; // Kotlin sealed classes could model this, but that's a much bigger emit — documented limitation
    if (s.type === 'string') return 'String';
    if (s.type === 'integer') return 'Int';
    if (s.type === 'number') return 'Double';
    if (s.type === 'boolean') return 'Boolean';
    if (s.type === 'null') return 'Any?';
    if (s.type === 'array') return 'List<' + schemaToKotlinType(s.items, String(nameHint || 'Item').replace(/s$/, ''), classes) + '>';
    if (s.type === 'object') {
      const className = toPascalCase(nameHint || 'Item');
      emitKotlinClass(s, className, classes);
      return className;
    }
    return 'Any?';
  }

  function emitKotlinClass(s, className, classes) {
    const props = s.properties || {};
    const required = {};
    (s.required || []).forEach(function (k) { required[k] = true; });
    const keys = Object.keys(props);
    const fieldLines = keys.map(function (k, idx) {
      const baseType = schemaToKotlinType(props[k], k, classes);
      const isOptional = !required[k];
      const type = isOptional && !baseType.endsWith('?') ? baseType + '?' : baseType;
      const defaultVal = isOptional ? ' = null' : '';
      const comma = idx < keys.length - 1 ? ',' : '';
      return '    val ' + k + ': ' + type + defaultVal + comma;
    });
    const body = fieldLines.length ? '(\n' + fieldLines.join('\n') + '\n)' : '';
    classes.push('data class ' + className + body);
  }

  function jsonSchemaToKotlin(schema, rootName) {
    rootName = rootName || 'Root';
    const classes = [];
    const topType = schemaToKotlinType(schema, rootName, classes);
    if (schema && schema.type === 'object') return classes.join('\n\n') + '\n';
    return 'typealias ' + rootName + ' = ' + topType + '\n';
  }

  // ---------------- Rust structs (serde) ----------------
  function toSnakeCase(name) {
    return String(name)
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/[\s\-]+/g, '_')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '') || 'field';
  }

  function schemaToRustType(s, nameHint, structs) {
    if (!s || (s.type === undefined && !s.anyOf)) return 'serde_json::Value';
    if (s.anyOf) return 'serde_json::Value'; // Rust enums could model this, but that's a much bigger emit — documented limitation
    if (s.type === 'string') return 'String';
    if (s.type === 'integer') return 'i64';
    if (s.type === 'number') return 'f64';
    if (s.type === 'boolean') return 'bool';
    if (s.type === 'null') return 'serde_json::Value';
    if (s.type === 'array') return 'Vec<' + schemaToRustType(s.items, String(nameHint || 'Item').replace(/s$/, ''), structs) + '>';
    if (s.type === 'object') {
      const structName = toPascalCase(nameHint || 'Item');
      emitRustStruct(s, structName, structs);
      return structName;
    }
    return 'serde_json::Value';
  }

  function emitRustStruct(s, structName, structs) {
    const props = s.properties || {};
    const required = {};
    (s.required || []).forEach(function (k) { required[k] = true; });
    const keys = Object.keys(props);
    const fieldLines = keys.map(function (k) {
      const baseType = schemaToRustType(props[k], k, structs);
      const type = required[k] ? baseType : 'Option<' + baseType + '>';
      const snake = toSnakeCase(k);
      const rename = snake !== k ? '    #[serde(rename = "' + k + '")]\n' : '';
      return rename + '    pub ' + snake + ': ' + type + ',';
    });
    structs.push('#[derive(Debug, Serialize, Deserialize)]\npub struct ' + structName + ' {\n' + fieldLines.join('\n') + '\n}');
  }

  function jsonSchemaToRust(schema, rootName) {
    rootName = rootName || 'Root';
    const structs = [];
    const topType = schemaToRustType(schema, rootName, structs);
    const header = 'use serde::{Deserialize, Serialize};\n\n';
    if (schema && schema.type === 'object') return header + structs.join('\n\n') + '\n';
    return header + 'pub type ' + rootName + ' = ' + topType + ';\n';
  }

  // ---------------- Java records ----------------
  function schemaToJavaType(s, nameHint, records) {
    if (!s || (s.type === undefined && !s.anyOf)) return 'Object';
    if (s.anyOf) return 'Object';
    if (s.type === 'string') return 'String';
    if (s.type === 'integer') return 'Integer';
    if (s.type === 'number') return 'Double';
    if (s.type === 'boolean') return 'Boolean';
    if (s.type === 'null') return 'Object';
    if (s.type === 'array') return 'List<' + schemaToJavaType(s.items, String(nameHint || 'Item').replace(/s$/, ''), records) + '>';
    if (s.type === 'object') {
      const recordName = toPascalCase(nameHint || 'Item');
      emitJavaRecord(s, recordName, records);
      return recordName;
    }
    return 'Object';
  }
  function emitJavaRecord(s, recordName, records) {
    const props = s.properties || {};
    const keys = Object.keys(props);
    const fields = keys.map(function (k) { return schemaToJavaType(props[k], k, records) + ' ' + k; });
    records.push('public record ' + recordName + '(\n    ' + fields.join(',\n    ') + '\n) {}');
  }
  function jsonSchemaToJava(schema, rootName) {
    rootName = rootName || 'Root';
    const records = [];
    const header = 'import java.util.List;\n\n';
    if (schema && schema.type === 'object') {
      schemaToJavaType(schema, rootName, records);
      return header + records.join('\n\n') + '\n';
    }
    const topType = schemaToJavaType(schema, rootName, records);
    return header + '// ' + rootName + ' = ' + topType + '\n' + records.join('\n\n') + '\n';
  }

  // ---------------- Swift (Codable structs) ----------------
  function schemaToSwiftType(s, nameHint, structs) {
    if (!s || (s.type === undefined && !s.anyOf)) return 'AnyCodable';
    if (s.anyOf) return 'AnyCodable';
    if (s.type === 'string') return 'String';
    if (s.type === 'integer') return 'Int';
    if (s.type === 'number') return 'Double';
    if (s.type === 'boolean') return 'Bool';
    if (s.type === 'null') return 'AnyCodable?';
    if (s.type === 'array') return '[' + schemaToSwiftType(s.items, String(nameHint || 'Item').replace(/s$/, ''), structs) + ']';
    if (s.type === 'object') {
      const structName = toPascalCase(nameHint || 'Item');
      emitSwiftStruct(s, structName, structs);
      return structName;
    }
    return 'AnyCodable';
  }
  function emitSwiftStruct(s, structName, structs) {
    const props = s.properties || {};
    const required = {};
    (s.required || []).forEach(function (k) { required[k] = true; });
    const keys = Object.keys(props);
    const fields = keys.map(function (k) {
      const baseType = schemaToSwiftType(props[k], k, structs);
      const type = required[k] ? baseType : (baseType.endsWith('?') ? baseType : baseType + '?');
      return '    let ' + k + ': ' + type;
    });
    structs.push('struct ' + structName + ': Codable {\n' + fields.join('\n') + '\n}');
  }
  function jsonSchemaToSwift(schema, rootName) {
    rootName = rootName || 'Root';
    const structs = [];
    if (schema && schema.type === 'object') {
      schemaToSwiftType(schema, rootName, structs);
      return structs.join('\n\n') + '\n';
    }
    const topType = schemaToSwiftType(schema, rootName, structs);
    return 'typealias ' + rootName + ' = ' + topType + '\n' + structs.join('\n\n') + '\n';
  }

  // ---------------- C# classes ----------------
  function schemaToCSharpType(s, nameHint, classes) {
    if (!s || (s.type === undefined && !s.anyOf)) return 'object';
    if (s.anyOf) return 'object';
    if (s.type === 'string') return 'string';
    if (s.type === 'integer') return 'int';
    if (s.type === 'number') return 'double';
    if (s.type === 'boolean') return 'bool';
    if (s.type === 'null') return 'object';
    if (s.type === 'array') return 'List<' + schemaToCSharpType(s.items, String(nameHint || 'Item').replace(/s$/, ''), classes) + '>';
    if (s.type === 'object') {
      const className = toPascalCase(nameHint || 'Item');
      emitCSharpClass(s, className, classes);
      return className;
    }
    return 'object';
  }
  function csharpPropName(key) {
    const pascal = toPascalCase(key);
    return pascal.length ? pascal : key;
  }
  function emitCSharpClass(s, className, classes) {
    const props = s.properties || {};
    const required = {};
    (s.required || []).forEach(function (k) { required[k] = true; });
    const keys = Object.keys(props);
    const fields = keys.map(function (k) {
      const baseType = schemaToCSharpType(props[k], k, classes);
      const type = required[k] ? baseType : baseType + '?';
      const propName = csharpPropName(k);
      const jsonAttr = propName !== k ? '    [JsonPropertyName("' + k + '")]\n' : '';
      return jsonAttr + '    public ' + type + ' ' + propName + ' { get; set; }';
    });
    classes.push('public class ' + className + '\n{\n' + fields.join('\n') + '\n}');
  }
  function jsonSchemaToCSharp(schema, rootName) {
    rootName = rootName || 'Root';
    const classes = [];
    const header = 'using System.Collections.Generic;\nusing System.Text.Json.Serialization;\n\n';
    if (schema && schema.type === 'object') {
      schemaToCSharpType(schema, rootName, classes);
      return header + classes.join('\n\n') + '\n';
    }
    const topType = schemaToCSharpType(schema, rootName, classes);
    return header + '// ' + rootName + ' = ' + topType + '\n' + classes.join('\n\n') + '\n';
  }

  // ---------------- SQL CREATE TABLE (a starting point, not a full ORM) ----------------
  // Nested single objects flatten into the parent table (dotted paths become
  // underscore-joined column names, matching the CSV converter's own
  // flattening convention). Arrays of objects become their own child table
  // with a foreign key back to the parent, since SQL has no native concept
  // of a nested array. Arrays of primitives fall back to a JSON-encoded TEXT
  // column — normalizing a scalar list into its own table is rarely what
  // anyone actually wants from a generated starting schema.
  function toSnakeCaseSql(name) {
    return String(name).replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[\s\-]+/g, '_').toLowerCase().replace(/[^a-z0-9_]/g, '') || 'field';
  }
  function sqlType(s) {
    if (!s || (s.type === undefined && !s.anyOf)) return 'TEXT';
    if (s.anyOf) return 'TEXT';
    if (s.type === 'integer') return 'INTEGER';
    if (s.type === 'number') return 'REAL';
    if (s.type === 'boolean') return 'BOOLEAN';
    if (s.type === 'array') return 'TEXT'; // JSON-encoded array of primitives
    return 'TEXT';
  }
  function collectSqlColumns(s, prefix, required, columns) {
    const props = s.properties || {};
    Object.keys(props).forEach(function (k) {
      const child = props[k];
      const colName = toSnakeCaseSql(prefix ? prefix + '_' + k : k);
      const isRequired = required[k];
      if (child && child.type === 'object' && child.properties) {
        const childRequired = {};
        (child.required || []).forEach(function (rk) { childRequired[rk] = true; });
        collectSqlColumns(child, prefix ? prefix + '_' + k : k, childRequired, columns);
      } else if (child && child.type === 'array' && child.items && child.items.type === 'object') {
        // handled separately as a child table by the caller
      } else {
        columns.push({ name: colName, type: sqlType(child), nullable: !isRequired });
      }
    });
  }
  function emitSqlTable(s, tableName, parentTable, tables) {
    const required = {};
    (s.required || []).forEach(function (k) { required[k] = true; });
    const props = s.properties || {};
    const hasNaturalId = !!props.id; // reuse the data's own id field as PK instead of colliding with a synthetic one
    const columns = hasNaturalId ? [] : [{ name: 'id', type: 'INTEGER', pk: true }];
    if (parentTable) columns.push({ name: parentTable + '_id', type: 'INTEGER', fk: parentTable });
    collectSqlColumns(s, '', required, columns);
    if (hasNaturalId) {
      const idCol = columns.find(function (c) { return c.name === 'id'; });
      if (idCol) idCol.pk = true;
    }
    const lines = columns.map(function (c) {
      if (c.pk) return '  ' + c.name + ' ' + (c.type === 'INTEGER' ? 'INTEGER' : c.type) + ' PRIMARY KEY';
      const nullSql = c.nullable ? '' : ' NOT NULL';
      return '  ' + c.name + ' ' + c.type + nullSql;
    });
    const fkLines = columns.filter(function (c) { return c.fk; }).map(function (c) {
      return '  FOREIGN KEY (' + c.name + ') REFERENCES ' + c.fk + '(id)';
    });
    tables.push('CREATE TABLE ' + tableName + ' (\n' + lines.concat(fkLines).join(',\n') + '\n);');
    // child tables for arrays of objects
    Object.keys(props).forEach(function (k) {
      const child = props[k];
      if (child && child.type === 'array' && child.items && child.items.type === 'object') {
        const childTableName = toSnakeCaseSql(tableName + '_' + k);
        emitSqlTable(child.items, childTableName, tableName, tables);
      } else if (child && child.type === 'object' && child.properties) {
        // nested objects with their OWN array-of-object children still need those emitted
        const grandProps = child.properties || {};
        Object.keys(grandProps).forEach(function (gk) {
          const grandChild = grandProps[gk];
          if (grandChild && grandChild.type === 'array' && grandChild.items && grandChild.items.type === 'object') {
            const childTableName = toSnakeCaseSql(tableName + '_' + k + '_' + gk);
            emitSqlTable(grandChild.items, childTableName, tableName, tables);
          }
        });
      }
    });
  }
  function jsonSchemaToSql(schema, rootName) {
    rootName = rootName || 'Root';
    const tables = [];
    const tableName = toSnakeCaseSql(rootName);
    if (schema && schema.type === 'array' && schema.items && schema.items.type === 'object') {
      emitSqlTable(schema.items, tableName, null, tables);
    } else if (schema && schema.type === 'object') {
      emitSqlTable(schema, tableName, null, tables);
    } else {
      return '-- ' + rootName + ' is not an object or array of objects \u2014 nothing to generate a table for.\n';
    }
    return tables.join('\n\n') + '\n';
  }

  // ---------------- Mock data generation from a schema ----------------
  // Deliberately no AI/LLM involved — small, fast, fully client-side field-
  // name heuristics (an "email"-named field gets a fake email, a "city"
  // field gets a city name, etc.) plus type-based fallbacks for everything
  // else. Good enough for populating a test fixture or a UI mock, not meant
  // to be indistinguishable from real data.
  const MOCK_NAMES = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Katherine Johnson', 'Margaret Hamilton', 'Tim Berners-Lee', 'Radia Perlman', 'Linus Torvalds', 'Barbara Liskov', 'Vint Cerf'];
  const MOCK_CITIES = ['London', 'New York', 'Berlin', 'Tokyo', 'Toronto', 'Sydney', 'Dublin', 'Amsterdam'];
  const MOCK_COUNTRIES = ['United Kingdom', 'United States', 'Germany', 'Japan', 'Canada', 'Australia', 'Ireland', 'Netherlands'];
  const MOCK_WORDS = ['sample', 'value', 'placeholder', 'example', 'demo', 'preview', 'item', 'entry'];

  function mockPick(arr, i) { return arr[i % arr.length]; }
  function mockInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
  function mockFloat(min, max) { return Math.round((min + Math.random() * (max - min)) * 100) / 100; }

  function mockScalarForField(key, type, index) {
    const k = String(key || '').toLowerCase();
    if (/email/.test(k)) return mockPick(MOCK_NAMES, index).toLowerCase().replace(/[^a-z]+/g, '.') + '@example.com';
    if (/(^|_)id$|id$/.test(k) && type === 'integer') return index + 1;
    if (/(^|_)id$|id$/.test(k)) return 'id_' + Math.random().toString(36).slice(2, 10);
    if (/name/.test(k)) return mockPick(MOCK_NAMES, index);
    if (/city/.test(k)) return mockPick(MOCK_CITIES, index);
    if (/country/.test(k)) return mockPick(MOCK_COUNTRIES, index);
    if (/(phone|tel)/.test(k)) return '+1-555-' + String(mockInt(1000, 9999)).padStart(4, '0');
    if (/(url|link|website)/.test(k)) return 'https://example.com/' + mockPick(MOCK_WORDS, index) + '-' + (index + 1);
    if (/(date|time)/.test(k)) return new Date(Date.now() - mockInt(0, 3650) * 86400000).toISOString().slice(0, 10);
    if (/(price|amount|cost|total)/.test(k)) return mockFloat(1, 1000);
    if (type === 'string') return mockPick(MOCK_WORDS, index) + '_' + (index + 1);
    if (type === 'integer') return mockInt(1, 1000);
    if (type === 'number') return mockFloat(0, 1000);
    if (type === 'boolean') return Math.random() < 0.5;
    return null;
  }

  function mockValueForSchema(s, keyHint, index, depth) {
    if (depth > 6) return null; // guard against pathological/deeply-recursive schemas
    if (!s || (s.type === undefined && !s.anyOf)) return null;
    if (s.anyOf) return mockValueForSchema(s.anyOf[mockInt(0, s.anyOf.length - 1)], keyHint, index, depth);
    if (s.type === 'object') {
      const out = {};
      Object.keys(s.properties || {}).forEach(function (k) {
        out[k] = mockValueForSchema(s.properties[k], k, index, depth + 1);
      });
      return out;
    }
    if (s.type === 'array') {
      const n = mockInt(1, 3);
      const items = [];
      for (let i = 0; i < n; i++) items.push(mockValueForSchema(s.items, keyHint, i, depth + 1));
      return items;
    }
    return mockScalarForField(keyHint, s.type, index);
  }

  function mockDataFromSchema(schema, opts) {
    opts = opts || {};
    const count = Math.max(1, Math.min(50, opts.count || 3));
    if (schema && schema.type === 'array') {
      const out = [];
      for (let i = 0; i < count; i++) out.push(mockValueForSchema(schema.items, 'item', i, 0));
      return out;
    }
    return mockValueForSchema(schema, 'root', 0, 0);
  }

  // Real row count via the actual CSV parser (respects quoted fields with
  // embedded newlines/commas), not a naive newline count — used to gate
  // free-vs-Pro comparison size without misjudging a file that merely has
  // multi-line quoted cells.
  function csvRowCount(text, delim) {
    return csvToRows(text, delim || ',').rows.length;
  }

  return {
    flattenObj: flattenObj,
    unflattenObj: unflattenObj,
    jsonToCsv: jsonToCsv,
    csvToJson: csvToJson,
    csvToRows: csvToRows,
    jsonToXml: jsonToXml,
    xmlToJson: xmlToJson,
    parseXmlToTree: parseXmlToTree,
    jsonToYaml: jsonToYaml,
    yamlToJson: yamlToJson,
    jsonToMarkdownTable: jsonToMarkdownTable,
    markdownTableToJson: markdownTableToJson,
    deepDiff: deepDiff,
    pickArrayKey: pickArrayKey,
    csvDiff: csvDiff,
    csvRowCount: csvRowCount,
    jsonSchemaFromSample: jsonSchemaFromSample,
    jsonStructureSummary: jsonStructureSummary,
    jsonSchemaToTypescript: jsonSchemaToTypescript,
    jsonSchemaToZod: jsonSchemaToZod,
    jsonSchemaToPython: jsonSchemaToPython,
    jsonSchemaToPydantic: jsonSchemaToPydantic,
    jsonSchemaToGo: jsonSchemaToGo,
    jsonSchemaToKotlin: jsonSchemaToKotlin,
    jsonSchemaToRust: jsonSchemaToRust,
    jsonSchemaToJava: jsonSchemaToJava,
    jsonSchemaToSwift: jsonSchemaToSwift,
    jsonSchemaToCSharp: jsonSchemaToCSharp,
    jsonSchemaToSql: jsonSchemaToSql,
    mockDataFromSchema: mockDataFromSchema,
    validateAgainstSchema: validateAgainstSchema,
    jsonPathQuery: jsonPathQuery,
    validateJsonSyntax: validateJsonSyntax,
    validateXmlSyntax: validateXmlSyntax,
    inferCell: inferCell
  };
});
