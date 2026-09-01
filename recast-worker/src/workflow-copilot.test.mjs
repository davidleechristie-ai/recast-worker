import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const code = fs.readFileSync(new URL('../public/lib/workflow-copilot.js', import.meta.url), 'utf8');
const sandbox = { window:{}, document:{readyState:'loading',addEventListener(){},getElementById(){return null;},querySelectorAll(){return[];}}, console };
vm.createContext(sandbox); vm.runInContext(code,sandbox);
const build=sandbox.window.RecastWorkflowCopilot.build;

const workflowCases = [
  // conversions
  ['convert json to csv',['json2csv']],['turn this JSON into CSV',['json2csv']],['export this api response as csv',['json2csv']],['download this API data as an Excel csv',['json2csv']],
  ['convert csv to json',['csv2json']],['turn csv into json',['csv2json']],['json to xml',['json2xml']],['convert xml into json',['xml2json']],
  ['json to yaml',['json2yaml']],['convert yaml to json',['yaml2json']],['json to markdown',['json2markdown']],['markdown into json',['markdown2json']],
  // reshape / field transforms
  ['flatten this nested json',['flatten']],['flatten nested objects then convert to csv',['flatten','json2csv']],['unflatten these dotted fields',['unflatten']],['rebuild nested json from dot notation',['unflatten']],
  ['remove internal_id',['transformRemove']],['drop password and secret',['transformRemove']],['delete temp',['transformRemove']],['exclude debug',['transformRemove']],
  ['rename customer_name to name',['transformRename']],['rename field total to amount',['transformRename']],
  ['select id, name and email',['transformSelect']],['keep fields id and email',['transformSelect']],['retain sku and price',['transformSelect']],
  ['filter rows where status equals active',['transformFilter']],['keep rows where amount greater than 100',['transformFilter']],['filter records where email contains acme',['transformFilter']],
  ['filter rows where name starts with A',['transformFilter']],['filter rows where email ends with .com',['transformFilter']],['filter rows where deleted_at is null',['transformFilter']],
  ['convert field amount to number',['transformConvertType']],['cast active as boolean',['transformConvertType']],['change created_at to date',['transformConvertType']],
  ['add field source = recast',['transformAddField']],['default field status to active',['transformAddField']],['set field region to uk',['transformAddField']],
  ['combine firstName and lastName into fullName',['transformCombine']],['join city and country as location',['transformCombine']],
  ['sort records by created_at descending',['transformSort']],['order by amount asc',['transformSort']],['sort object keys alphabetically',['sortJson']],
  // JSONPath / validation / formatting
  ['extract $.users[*].name',['jsonPath']],['jsonpath $.data[*].id',['jsonPath']],['extract with jsonpath $.orders[*].total',['jsonPath']],
  ['validate this json',['validateJsonStep']],['check if this json is valid',['validateJsonStep']],['validate this xml',['validateXmlStep']],['is this xml valid',['validateXmlStep']],
  ['format this json',['formatJson']],['pretty print this json',['formatJson']],['beautify json',['formatJson']],
  // compare
  ['compare two csv then output differences only',['compareStep']],['compare two CSV files and show me what changed',['compareStep']],['csv diff',['compareStep']],['find mismatches in these csv files',['compareStep']],
  ['diff these json files',['compareStep']],['compare json files',['compareStep']],['compare two API responses',['compareStep']],['what changed between these api responses',['compareStep']],
  ['find differences between these XML files',['compareStep']],['xml diff',['compareStep']],
  // chained requests
  ['flatten this json remove internal_id then convert to csv',['flatten','transformRemove','json2csv']],
  ['rename customer_name to name then select id and name then json to csv',['transformRename','transformSelect','json2csv']],
  ['validate json then format json',['validateJsonStep','formatJson']],
  ['extract $.data[*] then flatten and convert to csv',['flatten','jsonPath','json2csv']],
  ['filter rows where status equals active then sort by created_at descending',['transformFilter','transformSort']],
  ['convert amount to number then sort by amount descending',['transformConvertType','transformSort']],
  ['add field source = api then select id and source',['transformSelect','transformAddField']],
  // API request builder support
  ['GET https://api.example.com/customers',['apiRequestStep']],['fetch https://api.example.com/orders',['apiRequestStep']],['POST https://api.example.com/events',['apiRequestStep']],
];

const directCases = [
  ['generate a json schema','JSON Schema Generator','tools/json-schema-generator.html'],
  ['create schema from this json','JSON Schema Generator','tools/json-schema-generator.html'],
  ['validate this json against a schema','Validate JSON Schema','tools/validate-json-schema.html'],
  ['json to typescript','JSON → TypeScript','tools/json-to-typescript.html'],['make a typescript interface from json','JSON → TypeScript','tools/json-to-typescript.html'],
  ['json to zod','JSON → Zod','tools/json-to-zod.html'],['make a zod schema','JSON → Zod','tools/json-to-zod.html'],
  ['json to pydantic','JSON → Pydantic','tools/json-to-pydantic.html'],['make a pydantic model from json','JSON → Pydantic','tools/json-to-pydantic.html'],
  ['json to python','JSON → Python','tools/json-to-python.html'],['python dataclass from json','JSON → Python','tools/json-to-python.html'],
  ['json to go','JSON → Go','tools/json-to-go.html'],['go struct from json','JSON → Go','tools/json-to-go.html'],
  ['json to swift','JSON → Swift','tools/json-to-swift.html'],['swift struct from json','JSON → Swift','tools/json-to-swift.html'],
  ['json to kotlin','JSON → Kotlin','tools/json-to-kotlin.html'],['kotlin data class from json','JSON → Kotlin','tools/json-to-kotlin.html'],
  ['json to rust','JSON → Rust','tools/json-to-rust.html'],['rust struct from json','JSON → Rust','tools/json-to-rust.html'],
  ['json to java','JSON → Java','tools/json-to-java.html'],['java pojo from json','JSON → Java','tools/json-to-java.html'],
  ['json to c#','JSON → C#','tools/json-to-csharp.html'],['csharp class from json','JSON → C#','tools/json-to-csharp.html'],
  ['json to sql','JSON → SQL','tools/json-to-sql.html'],['create sql from json','JSON → SQL','tools/json-to-sql.html'],
  ['minify this json','JSON Formatter','tools/json-formatter.html'],['compact json','JSON Formatter','tools/json-formatter.html'],
  ['inspect this api response','Data Inspector','index.html#workbench'],['help me explore this json','Data Inspector','index.html#workbench'],
];

let passed=0;
for(const [prompt,modes] of workflowCases){
  const def=build(prompt);
  assert.ok(def.steps.length>0, `${prompt}: expected workflow steps, got none`);
  for(const mode of modes) assert.ok(def.steps.some(s=>s.mode===mode), `${prompt}: missing ${mode}; got ${def.steps.map(s=>s.mode)}`);
  assert.equal(def.directAction,null,`${prompt}: should not route away from workflow`);
  passed++;
}
for(const [prompt,label,href] of directCases){
  const def=build(prompt);
  assert.equal(def.steps.length,0,`${prompt}: direct tool should not invent workflow steps`);
  assert.ok(def.directAction,`${prompt}: expected direct tool`);
  assert.equal(def.directAction.label,label,prompt); assert.equal(def.directAction.href,href,prompt);
  passed++;
}

// Automation language must not produce an empty answer when paired with a supported operation.
for(const prompt of ['every day convert json to csv','schedule json to csv daily','weekly flatten json then convert to csv','automate jsonpath $.data[*].id']){
  const def=build(prompt); assert.ok(def.steps.length>0,prompt); assert.equal(def.automation,true,prompt); passed++;
}

// Comparison format and configuration safety.
for(const [prompt,format] of [['compare two csv files','csv'],['compare api responses','json'],['compare xml files','xml']]){
  const def=build(prompt), step=def.steps.find(s=>s.mode==='compareStep'); assert.equal(step.params.format,format,prompt); assert.equal(def.requiresConfiguration,true,prompt); passed++;
}

// Unknown requests must never produce a nil/dead-end response.
for(const prompt of ['deduplicate this dataset','fix my weird data','make this useful','do something with this payload','clean this file please']){
  const def=build(prompt); assert.ok(def.steps.length>0 || def.directAction,`${prompt}: nil response`); assert.ok(def.matched,`${prompt}: not matched to any next action`); passed++;
}

// Existing critical regression.
const regression=build('compare two csv then output differences only');
assert.equal(regression.steps[0].mode,'compareStep'); assert.equal(regression.steps[0].params.format,'csv');
passed++;

const xmlComparison=build('compare two csv files and output differences in xml');
assert.equal(xmlComparison.steps[0].mode,'compareStep');
assert.equal(xmlComparison.steps[0].params.format,'csv');
assert.equal(xmlComparison.steps[0].params.outputFormat,'xml');
passed++;

console.log(`\n${passed} natural-language Copilot cases passed, 0 failed`);

// Phrase-variation matrix: test intent families, not just hand-picked sentences.
let matrixPassed = 0;
const conversionMatrix = [
  ['json','csv','json2csv'],['csv','json','csv2json'],['json','xml','json2xml'],['xml','json','xml2json'],
  ['json','yaml','json2yaml'],['yaml','json','yaml2json'],['json','markdown','json2markdown'],['markdown','json','markdown2json']
];
for (const [from,to,mode] of conversionMatrix) {
  for (const verb of ['convert','turn']) {
    const prompt = `${verb} this ${from} into ${to}`;
    const def=build(prompt); assert.ok(def.steps.some(s=>s.mode===mode),prompt); matrixPassed++;
  }
}
for (const [format] of [['csv'],['json'],['xml']]) {
  for (const phrase of [`compare two ${format} files`,`diff these ${format} files`,`find differences in these ${format} files`,`show what changed between these ${format} files`]) {
    const def=build(phrase); assert.ok(def.steps.some(s=>s.mode==='compareStep'),phrase); matrixPassed++;
  }
}
for (const verb of ['remove','drop','delete','exclude']) {
  for (const field of ['internal_id','debug','password']) {
    const prompt=`${verb} ${field}`; const def=build(prompt); assert.ok(def.steps.some(s=>s.mode==='transformRemove'),prompt); matrixPassed++;
  }
}
for (const [condition,expected] of [['equals active','equals'],['contains acme','contains'],['starts with A','startsWith'],['ends with .com','endsWith'],['greater than 10','greaterThan'],['less than 5','lessThan'],['is null','isNull']]) {
  const prompt=`filter rows where status ${condition}`; const def=build(prompt); const step=def.steps.find(s=>s.mode==='transformFilter'); assert.ok(step,prompt); assert.equal(step.params.condition,expected,prompt); matrixPassed++;
}
for (const type of ['string','number','integer','boolean','date']) {
  const prompt=`convert field value to ${type}`; const def=build(prompt); assert.ok(def.steps.some(s=>s.mode==='transformConvertType'),prompt); matrixPassed++;
}
for (const [lang,label] of [['typescript','JSON → TypeScript'],['zod','JSON → Zod'],['pydantic','JSON → Pydantic'],['python','JSON → Python'],['go','JSON → Go'],['swift','JSON → Swift'],['kotlin','JSON → Kotlin'],['rust','JSON → Rust'],['java','JSON → Java'],['sql','JSON → SQL']]) {
  for (const phrase of [`json to ${lang}`,`turn json into ${lang}`]) {
    const def=build(phrase); assert.equal(def.directAction?.label,label,phrase); matrixPassed++;
  }
}
for (const cadence of ['daily','weekly','hourly','every day','each morning']) {
  const prompt=`${cadence} convert json to csv`; const def=build(prompt); assert.ok(def.steps.length>0,prompt); assert.equal(def.automation,true,prompt); matrixPassed++;
}
for (const prompt of ['please sort by id','can you flatten this json','i need json converted to csv','show the differences between these csv files','could you validate this xml']) {
  const def=build(prompt); assert.ok(def.steps.length>0 || def.directAction,prompt); matrixPassed++;
}
console.log(`${matrixPassed} phrase-variation matrix cases passed, 0 failed`);
console.log(`${passed + matrixPassed} total Copilot requests covered, 0 failed`);

