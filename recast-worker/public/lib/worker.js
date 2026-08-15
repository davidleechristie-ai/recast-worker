/*!
 * Recast worker — runs convert/diff/schema off the main thread so a large
 * paste doesn't freeze the tab. Pure engine logic only (no DOM), so the
 * exact same engine.js that powers the CLI runs here unmodified.
 */
importScripts('engine.js');
const E = self.RecastEngine;

function runConvert(p) {
  const opts = p.options || {};
  switch (p.op) {
    case 'json2csv': return E.jsonToCsv(JSON.parse(p.text), opts);
    case 'csv2json': return JSON.stringify(E.csvToJson(p.text, opts), null, opts.pretty === false ? 0 : 2);
    case 'json2xml': return E.jsonToXml(JSON.parse(p.text), 'root');
    case 'xml2json': return JSON.stringify(E.xmlToJson(p.text), null, opts.pretty === false ? 0 : 2);
    case 'flatten': return JSON.stringify(E.flattenObj(JSON.parse(p.text)), null, opts.pretty === false ? 0 : 2);
    case 'unflatten': return JSON.stringify(E.unflattenObj(JSON.parse(p.text)), null, opts.pretty === false ? 0 : 2);
    default: throw new Error('Unknown convert op: ' + p.op);
  }
}

function runDiff(p) {
  const opts = p.options || {};
  if (p.op === 'diffCsv') {
    return { kind: 'csv', result: E.csvDiff(p.textA, p.textB, opts) };
  }
  const dataA = p.op === 'diffXml' ? E.xmlToJson(p.textA) : JSON.parse(p.textA);
  const dataB = p.op === 'diffXml' ? E.xmlToJson(p.textB) : JSON.parse(p.textB);
  return { kind: 'tree', result: E.deepDiff(dataA, dataB) };
}

function runSchema(p) {
  const opts = p.options || {};
  const schema = E.jsonSchemaFromSample(JSON.parse(p.text), opts);
  if (opts.render === 'typescript') return E.jsonSchemaToTypescript(schema, opts.rootName || 'Root');
  if (opts.render === 'zod') return E.jsonSchemaToZod(schema, opts.rootName || 'Root');
  return JSON.stringify(schema, null, 2);
}

function runValidateSchema(p) {
  const data = JSON.parse(p.dataText);
  const schema = JSON.parse(p.schemaText);
  return E.validateAgainstSchema(data, schema);
}

self.onmessage = function (e) {
  const msg = e.data;
  try {
    let result;
    if (msg.task === 'convert') result = runConvert(msg.payload);
    else if (msg.task === 'diff') result = runDiff(msg.payload);
    else if (msg.task === 'schema') result = runSchema(msg.payload);
    else if (msg.task === 'validateSchema') result = runValidateSchema(msg.payload);
    else throw new Error('Unknown task: ' + msg.task);
    self.postMessage({ id: msg.id, ok: true, result: result });
  } catch (err) {
    self.postMessage({ id: msg.id, ok: false, error: err.message || String(err) });
  }
};
