import assert from 'node:assert/strict';
import { executeWorkflow, validateWorkflowDefinition } from './workflow-executor.js';

const def={name:'Customer export',steps:[
  {mode:'transformRemove',params:{paths:['internal_id']}},
  {mode:'transformRename',params:{from:'name',to:'customer_name'}},
  {mode:'json2csv',params:{}}
]};
const result=executeWorkflow(def,JSON.stringify([{name:'Ada',internal_id:7},{name:'Lin',internal_id:8}]));
assert.match(result.output,/customer_name/);
assert.doesNotMatch(result.output,/internal_id/);
assert.equal(result.stepResults.length,3);
assert.throws(()=>validateWorkflowDefinition({steps:[{mode:'notReal'}]}),/unsupported/);
const path=executeWorkflow({steps:[{mode:'jsonPath',params:{path:'$.customers[*].name'}}]},JSON.stringify({customers:[{name:'A'},{name:'B'}]}));
assert.deepEqual(JSON.parse(path.output),['A','B']);
const formatted=executeWorkflow({steps:[{mode:'formatJson',params:{}}]},'{"b":2,"a":1}');
assert.equal(formatted.output,'{\n  "b": 2,\n  "a": 1\n}');
console.log('workflow-executor tests passed');
