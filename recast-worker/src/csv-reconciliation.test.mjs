// CSV reconciliation safety regression suite. Run from recast-worker/ with node src/csv-reconciliation.test.mjs.
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const sandbox={console};
sandbox.window=sandbox;
sandbox.global=sandbox;
vm.createContext(sandbox);
vm.runInContext(readFileSync('public/lib/engine.js','utf8'),sandbox);
const E=sandbox.RecastEngine;
const diff=(a,b,opts={})=>E.csvDiff(a,b,opts);
function statuses(d){return Array.from(d.rows,r=>r.status);}
assert.deepEqual(statuses(diff('id,name\n1,Ada\n2,Bob','id,name\n2,Bob\n1,Ada')),['unchanged','unchanged']);
assert.deepEqual(statuses(diff('id,name\n1,Ada','id,name\n1,Ada\n2,Bob')),['unchanged','added']);
assert.deepEqual(statuses(diff('id,name\n1,Ada\n2,Bob','id,name\n1,Ada')),['unchanged','removed']);
const changed=diff('id,name\n1,Ada','id,name\n1,Grace');
assert.equal(changed.changed.length,1);
assert.equal(changed.changed[0].cellChanges[0].col,'name');
assert.throws(()=>diff('id,name\n1,Ada\n1,Bob','id,name\n1,Ada'),/duplicate.*original/i);
assert.throws(()=>diff('id,name\n1,Ada','id,name\n1,Ada\n1,Bob'),/duplicate.*modified/i);
assert.throws(()=>diff('id,name\n,Ada','id,name\n1,Ada'),/blank.*original/i);
assert.throws(()=>diff('id,name\n1,Ada','id,title\n1,Ada',{keyColumn:'name'}),/must exist in both/i);
console.log('CSV reconciliation regression tests passed');
