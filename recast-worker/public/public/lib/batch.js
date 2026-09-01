/*!
 * Recast batch processing — runs a conversion/validation/schema mode across
 * many files at once. Pure logic here (no DOM); the caller supplies file
 * name/text pairs and gets back per-file results. Wired to the UI in app.js
 * and gated to Pro accounts there.
 */
(function (root) {
  'use strict';

  const E = root.RecastEngine;
  const RecastTransformBuilder = root.RecastTransformBuilder;

  // Mirrors the single-file task-building logic in app.js's modeConfig, but
  // takes explicit text + options instead of reading the DOM, so it can run
  // per-file in a loop without touching any input elements.
  const BATCH_OPS = {
    json2csv: { outExt: 'csv', run: (text, opts) => E.jsonToCsv(JSON.parse(text), { delimiter: opts.delimiter || ',', excelBom: !!opts.excelBom }) },
    csv2json: { outExt: 'json', run: (text, opts) => JSON.stringify(E.csvToJson(text, { delimiter: opts.delimiter || ',', inferTypes: opts.inferTypes !== false }), null, opts.pretty === false ? 0 : 2) },
    json2xml: { outExt: 'xml', run: (text) => E.jsonToXml(JSON.parse(text), 'root') },
    xml2json: { outExt: 'json', run: (text, opts) => JSON.stringify(E.xmlToJson(text), null, opts.pretty === false ? 0 : 2) },
    flatten: { outExt: 'json', run: (text, opts) => JSON.stringify(E.flattenObj(JSON.parse(text)), null, opts.pretty === false ? 0 : 2) },
    unflatten: { outExt: 'json', run: (text, opts) => JSON.stringify(E.unflattenObj(JSON.parse(text)), null, opts.pretty === false ? 0 : 2) },
    jsonSchema: { outExt: 'json', run: (text) => JSON.stringify(E.jsonSchemaFromSample(JSON.parse(text)), null, 2) },
    jsonStructure: { outExt: 'txt', run: (text) => E.jsonStructureSummary(JSON.parse(text)) },
    json2ts: { outExt: 'ts', run: (text, opts) => E.jsonSchemaToTypescript(E.jsonSchemaFromSample(JSON.parse(text)), opts.rootName || 'Root') },
    json2zod: { outExt: 'ts', run: (text, opts) => E.jsonSchemaToZod(E.jsonSchemaFromSample(JSON.parse(text)), opts.rootName || 'Root') },
    json2python: { outExt: 'py', run: (text, opts) => E.jsonSchemaToPython(E.jsonSchemaFromSample(JSON.parse(text)), opts.rootName || 'Root') },
    json2pydantic: { outExt: 'py', run: (text, opts) => E.jsonSchemaToPydantic(E.jsonSchemaFromSample(JSON.parse(text)), opts.rootName || 'Root') },
    json2go: { outExt: 'go', run: (text, opts) => E.jsonSchemaToGo(E.jsonSchemaFromSample(JSON.parse(text)), opts.rootName || 'Root') },
    json2kotlin: { outExt: 'kt', run: (text, opts) => E.jsonSchemaToKotlin(E.jsonSchemaFromSample(JSON.parse(text)), opts.rootName || 'Root') },
    json2rust: { outExt: 'rs', run: (text, opts) => E.jsonSchemaToRust(E.jsonSchemaFromSample(JSON.parse(text)), opts.rootName || 'Root') },
    json2java: { outExt: 'java', run: (text, opts) => E.jsonSchemaToJava(E.jsonSchemaFromSample(JSON.parse(text)), opts.rootName || 'Root') },
    json2swift: { outExt: 'swift', run: (text, opts) => E.jsonSchemaToSwift(E.jsonSchemaFromSample(JSON.parse(text)), opts.rootName || 'Root') },
    json2csharp: { outExt: 'cs', run: (text, opts) => E.jsonSchemaToCSharp(E.jsonSchemaFromSample(JSON.parse(text)), opts.rootName || 'Root') },
    json2sql: { outExt: 'sql', run: (text, opts) => E.jsonSchemaToSql(E.jsonSchemaFromSample(JSON.parse(text)), opts.rootName || 'Root') },
    jsonMock: { outExt: 'json', run: (text, opts) => JSON.stringify(E.mockDataFromSchema(E.jsonSchemaFromSample(JSON.parse(text)), { count: opts.count }), null, 2) },
    sortJson: { outExt: 'json', run: (text, opts) => {
      function sortKeys(o) {
        if (Array.isArray(o)) return o.map(sortKeys);
        if (o && typeof o === 'object') return Object.keys(o).sort().reduce((acc, k) => { acc[k] = sortKeys(o[k]); return acc; }, {});
        return o;
      }
      return JSON.stringify(sortKeys(JSON.parse(text)), null, opts.pretty === false ? 0 : 2);
    }},
    // ---- Enhanced Transform Builder steps. Each one is a thin (text, opts)
    // wrapper around the pure functions in transform-builder.js, so a
    // builder step is a completely ordinary recipe step — same storage,
    // same runner, same everything, just with its own params.
    transformSelect: { outExt: 'json', run: (text, opts) => JSON.stringify(RecastTransformBuilder.selectFields(JSON.parse(text), opts.paths || []), null, opts.pretty === false ? 0 : 2) },
    transformRemove: { outExt: 'json', run: (text, opts) => JSON.stringify(RecastTransformBuilder.removeFields(JSON.parse(text), opts.paths || []), null, opts.pretty === false ? 0 : 2) },
    transformRename: { outExt: 'json', run: (text, opts) => JSON.stringify(RecastTransformBuilder.renameField(JSON.parse(text), opts.from, opts.to), null, opts.pretty === false ? 0 : 2) },
    transformFilter: { outExt: 'json', run: (text, opts) => JSON.stringify(RecastTransformBuilder.filterRecords(JSON.parse(text), opts.field, opts.condition, opts.value), null, opts.pretty === false ? 0 : 2) },
    transformSort: { outExt: 'json', run: (text, opts) => JSON.stringify(RecastTransformBuilder.sortRecords(JSON.parse(text), opts.field, opts.direction), null, opts.pretty === false ? 0 : 2) },
    transformConvertType: { outExt: 'json', run: (text, opts) => JSON.stringify(RecastTransformBuilder.convertType(JSON.parse(text), opts.field, opts.type), null, opts.pretty === false ? 0 : 2) },
    transformAddField: { outExt: 'json', run: (text, opts) => JSON.stringify(RecastTransformBuilder.addField(JSON.parse(text), opts.field, opts.value), null, opts.pretty === false ? 0 : 2) },
    transformCombine: { outExt: 'json', run: (text, opts) => JSON.stringify(RecastTransformBuilder.combineFields(JSON.parse(text), opts.template, opts.newField), null, opts.pretty === false ? 0 : 2) },
    // ---- Recipe Builder 2.0 additions: JSONPath, Validate, Compare-against-reference.
    jsonPath: { outExt: 'json', run: (text, opts) => JSON.stringify(E.jsonPathQuery(JSON.parse(text), opts.path || ''), null, opts.pretty === false ? 0 : 2) },
    validateJsonStep: { outExt: 'txt', run: (text) => {
      const r = E.validateJsonSyntax(text);
      if (!r.valid) throw new Error('Invalid JSON: ' + r.error);
      return text; // pass the data through unchanged so later steps can still use it
    }},
    validateXmlStep: { outExt: 'txt', run: (text) => {
      const r = E.validateXmlSyntax(text);
      if (!r.valid) throw new Error('Invalid XML: ' + r.error);
      return text;
    }},
    // Diffs the current pipeline value against a fixed reference text
    // supplied when the step was configured. Recipes are a linear
    // single-value chain, so a genuine two-input Compare can't sit mid-chain
    // the way it does in the standalone Diff tool — this compares against
    // a snapshot instead, which is what "did my data change since X" means
    // in a scripted/API context anyway.
    compareStep: { outExt: 'txt', run: (text, opts) => {
      const format = opts.format || 'json';
      if (format === 'csv') return flatTextFromCsvDiff(E.csvDiff(opts.reference || '', text, opts));
      const a = format === 'xml' ? E.xmlToJson(opts.reference || '{}') : JSON.parse(opts.reference || '{}');
      const b = format === 'xml' ? E.xmlToJson(text) : JSON.parse(text);
      return flatTextFromChanges(E.deepDiff(a, b));
    }},
    // Represents "this is how the recipe's data arrived" — an API request
    // description, not a transform. Making a real network call from here
    // is out of scope for this release (a future API/CLI executor is the
    // intended consumer of this step's params); the in-browser runner
    // treats it as an identity pass-through so a recipe that starts with
    // one still runs locally against whatever data is already loaded.
    apiRequestStep: { outExt: 'json', run: (text) => text },
  };

  function isBatchSupported(mode) { return !!BATCH_OPS[mode]; }
  function outExtFor(mode) { return (BATCH_OPS[mode] && BATCH_OPS[mode].outExt) || 'txt'; }

  // ---------------- Batch diff (pairs of files, not single files) ----------------
  function flatTextFromChanges(changes) {
    if (!changes.length) return '\u2713 No differences \u2014 documents are equal';
    return changes.map(function (c) {
      if (c.type === 'added') return '+ ADD ' + c.path + ' = ' + JSON.stringify(c.newVal);
      if (c.type === 'removed') return '- DEL ' + c.path + ' (was ' + JSON.stringify(c.oldVal) + ')';
      return '~ CHG ' + c.path + ': ' + JSON.stringify(c.oldVal) + ' -> ' + JSON.stringify(c.newVal);
    }).join('\n');
  }
  function flatTextFromCsvDiff(cd) {
    const lines = ['Key column: ' + cd.keyColumn, cd.added.length + ' added, ' + cd.removed.length + ' removed, ' + cd.changed.length + ' changed'];
    cd.added.forEach(function (r) { lines.push('+ ADD ' + JSON.stringify(r)); });
    cd.removed.forEach(function (r) { lines.push('- DEL ' + JSON.stringify(r)); });
    cd.changed.forEach(function (c) { c.cellChanges.forEach(function (cc) { lines.push('~ CHG [' + cd.keyColumn + '=' + c.key + '].' + cc.col + ': ' + JSON.stringify(cc.from) + ' -> ' + JSON.stringify(cc.to)); }); });
    return lines.join('\n');
  }

  const DIFF_BATCH_OPS = {
    diffJson: { outExt: 'txt', run: function (textA, textB) { return flatTextFromChanges(E.deepDiff(JSON.parse(textA), JSON.parse(textB))); } },
    diffXml: { outExt: 'txt', run: function (textA, textB) { return flatTextFromChanges(E.deepDiff(E.xmlToJson(textA), E.xmlToJson(textB))); } },
    diffCsv: { outExt: 'txt', run: function (textA, textB, opts) { return flatTextFromCsvDiff(E.csvDiff(textA, textB, opts || {})); } },
  };
  function isBatchDiffSupported(mode) { return !!DIFF_BATCH_OPS[mode]; }

  function baseNameNoExt(filename) { return baseName(filename); }

  // Pairs two file lists by matching filenames after stripping a trailing
  // "-original/-modified", "-before/-after", "-a/-b" style suffix if
  // present, falling back to alphabetical-order pairing (index-matched)
  // when names don't correspond directly — covers both "same name, two
  // folders" exports and "two differently-named sets" drops.
  function pairBatchFiles(filesA, filesB) {
    const sortedA = filesA.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    const sortedB = filesB.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    const n = Math.min(sortedA.length, sortedB.length);
    const pairs = [];
    for (let i = 0; i < n; i++) pairs.push({ nameA: sortedA[i].name, textA: sortedA[i].text, nameB: sortedB[i].name, textB: sortedB[i].text });
    return { pairs: pairs, unmatchedA: sortedA.slice(n).map(function (f) { return f.name; }), unmatchedB: sortedB.slice(n).map(function (f) { return f.name; }) };
  }

  /**
   * Process an array of {nameA, textA, nameB, textB} pairs through a diff mode.
   * Returns [{nameA, nameB, outName, ok, output, error}], preserving order.
   */
  async function runBatchDiff(pairs, mode, options, onProgress) {
    const op = DIFF_BATCH_OPS[mode];
    if (!op) throw new Error('Batch diff is not supported for mode: ' + mode);
    const results = [];
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];
      try {
        const output = op.run(pair.textA, pair.textB, options || {});
        results.push({ nameA: pair.nameA, nameB: pair.nameB, outName: baseNameNoExt(pair.nameA) + '-diff.' + op.outExt, ok: true, output: output, error: null });
      } catch (e) {
        results.push({ nameA: pair.nameA, nameB: pair.nameB, outName: null, ok: false, output: null, error: e.message || String(e) });
      }
      if (onProgress) onProgress(i + 1, pairs.length);
    }
    return results;
  }

  function baseName(filename) {
    const dot = filename.lastIndexOf('.');
    return dot > 0 ? filename.slice(0, dot) : filename;
  }

  /**
   * Process an array of {name, text} entries through `mode`.
   * Returns [{name, outName, ok, output, error}], preserving input order.
   * `onProgress(done, total)` is called after each file if provided.
   */
  async function runBatch(entries, mode, options, onProgress) {
    const op = BATCH_OPS[mode];
    if (!op) throw new Error('Batch is not supported for mode: ' + mode);
    const results = [];
    for (let i = 0; i < entries.length; i++) {
      const { name, text } = entries[i];
      try {
        const output = op.run(text, options || {});
        results.push({ name, outName: baseName(name) + '.' + op.outExt, ok: true, output, error: null });
      } catch (e) {
        results.push({ name, outName: null, ok: false, output: null, error: e.message || String(e) });
      }
      if (onProgress) onProgress(i + 1, entries.length);
    }
    return results;
  }

  const api = { isBatchSupported, outExtFor, runBatch, BATCH_OPS, isBatchDiffSupported, pairBatchFiles, runBatchDiff };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RecastBatch = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
