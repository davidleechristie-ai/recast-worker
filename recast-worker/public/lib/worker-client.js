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
        default: throw new Error('Unknown convert op: ' + payload.op);
      }
    }
    if (task === 'diff') {
      if (payload.op === 'diffCsv') return { kind: 'csv', result: E.csvDiff(payload.textA, payload.textB, opts) };
      const dataA = payload.op === 'diffXml' ? E.xmlToJson(payload.textA) : JSON.parse(payload.textA);
      const dataB = payload.op === 'diffXml' ? E.xmlToJson(payload.textB) : JSON.parse(payload.textB);
      return { kind: 'tree', result: E.deepDiff(dataA, dataB) };
    }
    if (task === 'schema') return JSON.stringify(E.jsonSchemaFromSample(JSON.parse(payload.text), opts), null, 2);
    if (task === 'validateSchema') return E.validateAgainstSchema(JSON.parse(payload.dataText), JSON.parse(payload.schemaText));
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
