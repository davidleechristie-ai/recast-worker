/*!
 * Recast worker client — Promise wrapper around lib/worker.js.
 * Falls back to running the same RecastEngine synchronously on the main
 * thread if Workers can't start (e.g. opened via file:// without a server).
 */
(function (root) {
  'use strict';

  let worker = null;
  let nextId = 1;
  const pending = new Map();
  let workerFailed = false;

  function initWorker() {
    if (worker || workerFailed) return;
    try {
      // Root-relative path so this resolves correctly whether the page is
      // at the site root (/) or a subpath (/tools/json-to-csv.html) — a
      // page-relative path would break one directory down.
      worker = new root.Worker('/lib/worker.js');
      worker.onmessage = function (e) {
        const msg = e.data;
        const p = pending.get(msg.id);
        if (!p) return;
        pending.delete(msg.id);
        if (msg.ok) p.resolve(msg.result); else p.reject(new Error(msg.error));
      };
      worker.onerror = function () { workerFailed = true; worker = null; };
    } catch (e) {
      workerFailed = true;
    }
  }

  function runInWorker(task, payload) {
    return new Promise(function (resolve, reject) {
      initWorker();
      if (!worker) { reject(new Error('worker-unavailable')); return; }
      const id = nextId++;
      pending.set(id, { resolve: resolve, reject: reject });
      worker.postMessage({ id: id, task: task, payload: payload });
    });
  }

  // Synchronous fallback using the same engine, directly on the main thread.
  function runSync(task, payload) {
    const E = root.RecastEngine;
    const opts = payload.options || {};
    if (task === 'convert') {
      switch (payload.op) {
        case 'json2csv': return E.jsonToCsv(JSON.parse(payload.text), opts);
        case 'csv2json': return JSON.stringify(E.csvToJson(payload.text, opts), null, opts.pretty === false ? 0 : 2);
        case 'json2xml': return E.jsonToXml(JSON.parse(payload.text), 'root');
        case 'xml2json': return JSON.stringify(E.xmlToJson(payload.text), null, opts.pretty === false ? 0 : 2);
        case 'flatten': return JSON.stringify(E.flattenObj(JSON.parse(payload.text)), null, opts.pretty === false ? 0 : 2);
        case 'unflatten': return JSON.stringify(E.unflattenObj(JSON.parse(payload.text)), null, opts.pretty === false ? 0 : 2);
        case 'json2yaml': return E.jsonToYaml(JSON.parse(payload.text));
        case 'yaml2json': return JSON.stringify(E.yamlToJson(payload.text), null, opts.pretty === false ? 0 : 2);
        case 'json2markdown': return E.jsonToMarkdownTable(JSON.parse(payload.text));
        case 'markdown2json': return JSON.stringify(E.markdownTableToJson(payload.text, opts), null, opts.pretty === false ? 0 : 2);
        default: throw new Error('Unknown convert op: ' + payload.op);
      }
    }
    if (task === 'diff') {
      if (payload.op === 'diffCsv') return { kind: 'csv', result: E.csvDiff(payload.textA, payload.textB, opts) };
      const dataA = payload.op === 'diffXml' ? E.xmlToJson(payload.textA) : JSON.parse(payload.textA);
      const dataB = payload.op === 'diffXml' ? E.xmlToJson(payload.textB) : JSON.parse(payload.textB);
      return { kind: 'tree', result: E.deepDiff(dataA, dataB, '', opts) };
    }
    if (task === 'schema') {
      const schema = E.jsonSchemaFromSample(JSON.parse(payload.text), opts);
      if (opts.render === 'structure') return E.jsonStructureSummary(JSON.parse(payload.text));
      if (opts.render === 'typescript') return E.jsonSchemaToTypescript(schema, opts.rootName || 'Root');
      if (opts.render === 'zod') return E.jsonSchemaToZod(schema, opts.rootName || 'Root');
      if (opts.render === 'python') return E.jsonSchemaToPython(schema, opts.rootName || 'Root');
      if (opts.render === 'pydantic') return E.jsonSchemaToPydantic(schema, opts.rootName || 'Root');
      if (opts.render === 'go') return E.jsonSchemaToGo(schema, opts.rootName || 'Root');
      if (opts.render === 'kotlin') return E.jsonSchemaToKotlin(schema, opts.rootName || 'Root');
      if (opts.render === 'rust') return E.jsonSchemaToRust(schema, opts.rootName || 'Root');
      if (opts.render === 'java') return E.jsonSchemaToJava(schema, opts.rootName || 'Root');
      if (opts.render === 'swift') return E.jsonSchemaToSwift(schema, opts.rootName || 'Root');
      if (opts.render === 'csharp') return E.jsonSchemaToCSharp(schema, opts.rootName || 'Root');
      if (opts.render === 'sql') return E.jsonSchemaToSql(schema, opts.rootName || 'Root');
      if (opts.render === 'mock') return JSON.stringify(E.mockDataFromSchema(schema, { count: opts.count }), null, 2);
      return JSON.stringify(schema, null, 2);
    }
    if (task === 'validateSchema') return E.validateAgainstSchema(JSON.parse(payload.dataText), JSON.parse(payload.schemaText));
    if (task === 'transformPipeline') {
      const TB = root.RecastTransformBuilder;
      const data = JSON.parse(payload.text);
      const outcome = TB.runPipeline(data, payload.steps || []);
      return {
        output: JSON.stringify(outcome.result, null, 2),
        errors: outcome.errors,
        inputCount: TB.recordCount(data),
        outputCount: TB.recordCount(outcome.result),
      };
    }
    if (task === 'profileDataset') {
      const format = payload.format || 'json';
      let data;
      if (format === 'csv') data = E.csvToJson(payload.text, payload.csvOptions || {});
      else if (format === 'xml') data = E.xmlToJson(payload.text);
      else data = JSON.parse(payload.text);
      return root.RecastDataProfiler.profileDataset(data);
    }
    if (task === 'structuralAnalysis') {
      const before = JSON.parse(payload.textA);
      const after = JSON.parse(payload.textB);
      const changes = E.deepDiff(before, after);
      return root.RecastStructuralAnalysis.analyzeStructure(changes, before);
    }
    if (task === 'recipeStepsPartial') {
      return root.RecastRecipes.runRecipe(payload.text, payload.steps || [], {});
    }
    throw new Error('Unknown task: ' + task);
  }

  /** Public entry point: tries the worker, transparently falls back to sync. */
  async function runTask(task, payload) {
    try {
      return await runInWorker(task, payload);
    } catch (e) {
      return runSync(task, payload);
    }
  }

  root.RecastWorkerClient = { runTask: runTask };
})(typeof window !== 'undefined' ? window : this);
