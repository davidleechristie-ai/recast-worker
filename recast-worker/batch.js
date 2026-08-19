/*!
 * Recast batch processing — runs a conversion/validation/schema mode across
 * many files at once. Pure logic here (no DOM); the caller supplies file
 * name/text pairs and gets back per-file results. Wired to the UI in app.js
 * and gated to Pro accounts there.
 */
(function (root) {
  'use strict';

  const E = root.RecastEngine;

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
    sortJson: { outExt: 'json', run: (text, opts) => {
      function sortKeys(o) {
        if (Array.isArray(o)) return o.map(sortKeys);
        if (o && typeof o === 'object') return Object.keys(o).sort().reduce((acc, k) => { acc[k] = sortKeys(o[k]); return acc; }, {});
        return o;
      }
      return JSON.stringify(sortKeys(JSON.parse(text)), null, opts.pretty === false ? 0 : 2);
    }},
  };

  function isBatchSupported(mode) { return !!BATCH_OPS[mode]; }
  function outExtFor(mode) { return (BATCH_OPS[mode] && BATCH_OPS[mode].outExt) || 'txt'; }

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

  const api = { isBatchSupported, outExtFor, runBatch, BATCH_OPS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.RecastBatch = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
