import assert from 'node:assert/strict';
import { OPERATIONS, SUPPORTED_MODES, getOperation, normalizePipeline, validatePipeline } from './operation-registry.js';
import { executeWorkflow } from './workflow-executor.js';
assert.ok(Object.keys(OPERATIONS).length >= 23);
assert.equal(Object.keys(OPERATIONS).length, SUPPORTED_MODES.size);
for(const [mode,op] of Object.entries(OPERATIONS)){ assert.ok(op.label); assert.ok(op.description); assert.ok(Array.isArray(op.input)&&op.input.length); assert.ok(op.output); assert.equal(getOperation(mode),op); }
const legacy={goal:'Create a customer export',input:{type:'json'},steps:[{mode:'transformRemove',params:{paths:['internalId']}},{mode:'json2csv',params:{}}]};
const pipeline=validatePipeline(legacy);
assert.equal(pipeline.version,2);
assert.deepEqual(pipeline.steps.map(s=>s.label),['Remove fields','JSON to CSV']);
assert.equal(normalizePipeline({steps:[{mode:'flatten'}]}).steps[0].id,'step-1');
assert.throws(()=>validatePipeline({steps:[{mode:'inventedByAI'}]}),/unsupported pipeline step/);
const result=executeWorkflow(legacy,JSON.stringify([{name:'Ada',internalId:123}]));
assert.equal(result.output.trim(),'name\nAda');
assert.equal(result.pipeline.version,2);
assert.equal(result.pipeline.steps[0].description,'Remove selected fields.');
console.log(`Recast 2A operation registry passed: ${Object.keys(OPERATIONS).length} deterministic operations`);