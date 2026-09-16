import assert from 'node:assert/strict';
import { OPERATIONS, SUPPORTED_MODES, getOperation, normalizePipeline, validatePipeline } from './operation-registry.js';
import { executeWorkflow } from './workflow-executor.js';

assert.ok(Object.keys(OPERATIONS).length >= 23, 'registry should cover existing executable workflow operations');
assert.equal(Object.keys(OPERATIONS).length, SUPPORTED_MODES.size, 'registry is the single source of supported modes');
for(const [mode,op] of Object.entries(OPERATIONS)){
  assert.ok(op.label, `${mode} needs a human label`);
  assert.ok(op.description, `${mode} needs a human description`);
  assert.ok(Array.isArray(op.input) && op.input.length, `${mode} needs accepted input types`);
  assert.ok(op.output, `${mode} needs an output type`);
  assert.equal(getOperation(mode),op);
}
const legacy={goal:'Create a customer export',input:{type:'json'},steps:[{mode:'transformRemove',params:{paths:['internalId']}},{mode:'json2csv',params:{}}]};
const pipeline=validatePipeline(legacy);
assert.equal(pipeline.version,2);
assert.equal(pipeline.goal,'Create a customer export');
assert.deepEqual(pipeline.steps.map(s=>s.label),['Remove fields','JSON to CSV']);
assert.deepEqual(normalizePipeline({steps:[{mode:'flatten'}]}).steps[0].id,'step-1');
assert.throws(()=>validatePipeline({steps:[{mode:'inventedByAI'}]}),/unsupported pipeline step/);

const result=executeWorkflow(legacy,JSON.stringify([{name:'Ada',internalId:123}]));
assert.equal(result.output.trim(),'name\nAda');
assert.equal(result.pipeline.version,2);
assert.equal(result.pipeline.steps[0].description,'Remove selected fields.');
console.log(`Recast 2 operation registry passed: ${Object.keys(OPERATIONS).length} deterministic operations exposed to pipelines`);
