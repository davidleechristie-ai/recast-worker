/*!
 * Recast worker — runs convert/diff/schema off the main thread so a large
 * paste doesn't freeze the tab. Pure engine logic only (no DOM), so the
 * exact same engine.js that powers the CLI runs here unmodified.
 */
importScripts('engine.js', 'transform-builder.js', 'batch.js', 'recipes.js', 'data-profiler.js', 'structural-analysis.js');
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
    case 'json2yaml': return E.jsonToYaml(JSON.parse(p.text));
    case 'yaml2json': return JSON.stringify(E.yamlToJson(p.text), null, opts.pretty === false ? 0 : 2);
    case 'json2markdown': return E.jsonToMarkdownTable(JSON.parse(p.text));
    case 'markdown2json': return JSON.stringify(E.markdownTableToJson(p.text, opts), null, opts.pretty === false ? 0 : 2);
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
  return { kind: 'tree', result: E.deepDiff(dataA, dataB, '', opts) };
}

function runSchema(p) {
  const opts = p.options || {};
  if (opts.render === 'structure') return E.jsonStructureSummary(JSON.parse(p.text));
  const schema = E.jsonSchemaFromSample(JSON.parse(p.text), opts);
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

function runValidateSchema(p) {
  const data = JSON.parse(p.dataText);
  const schema = JSON.parse(p.schemaText);
  return E.validateAgainstSchema(data, schema);
}

function runTransformPipeline(p) {
  const TB = self.RecastTransformBuilder;
  const data = JSON.parse(p.text);
  const outcome = TB.runPipeline(data, p.steps || []);
  return {
    output: JSON.stringify(outcome.result, null, 2),
    errors: outcome.errors,
    inputCount: TB.recordCount(data),
    outputCount: TB.recordCount(outcome.result),
  };
}

function runProfileDataset(p) {
  const format = p.format || 'json';
  let data;
  if (format === 'csv') data = E.csvToJson(p.text, p.csvOptions || {});
  else if (format === 'xml') data = E.xmlToJson(p.text);
  else data = JSON.parse(p.text);
  return self.RecastDataProfiler.profileDataset(data);
}

function runStructuralAnalysis(p) {
  const before = JSON.parse(p.textA);
  const after = JSON.parse(p.textB);
  const changes = E.deepDiff(before, after);
  return self.RecastStructuralAnalysis.analyzeStructure(changes, before);
}

// Runs a prefix of a Recipe Builder 2.0-style ({mode, params}) step
// sequence — used for pipeline-aware field discovery there, the same way
// runTransformPipeline is used for Transform Builder's ({op, params})
// steps. Reuses the existing recipe runner unchanged.
function runRecipeStepsPartial(p) {
  const result = self.RecastRecipes.runRecipe(p.text, p.steps || [], {});
  return result;
}

self.onmessage = function (e) {
  const msg = e.data;
  try {
    let result;
    if (msg.task === 'convert') result = runConvert(msg.payload);
    else if (msg.task === 'diff') result = runDiff(msg.payload);
    else if (msg.task === 'schema') result = runSchema(msg.payload);
    else if (msg.task === 'validateSchema') result = runValidateSchema(msg.payload);
    else if (msg.task === 'transformPipeline') result = runTransformPipeline(msg.payload);
    else if (msg.task === 'profileDataset') result = runProfileDataset(msg.payload);
    else if (msg.task === 'structuralAnalysis') result = runStructuralAnalysis(msg.payload);
    else if (msg.task === 'recipeStepsPartial') result = runRecipeStepsPartial(msg.payload);
    else throw new Error('Unknown task: ' + msg.task);
    self.postMessage({ id: msg.id, ok: true, result: result });
  } catch (err) {
    self.postMessage({ id: msg.id, ok: false, error: err.message || String(err) });
  }
};
