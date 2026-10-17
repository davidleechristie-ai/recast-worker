import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const sandbox = { console };
sandbox.window = sandbox;
sandbox.global = sandbox;
vm.createContext(sandbox);
vm.runInContext(await readFile(new URL('../public/lib/engine.js', import.meta.url), 'utf8'), sandbox);
const engine = sandbox.RecastEngine;

const before = [{ account: 'a-1', status: 'new' }, { account: 'a-2', status: 'paid' }];
const after = [{ account: 'a-2', status: 'paid' }, { account: 'a-1', status: 'shipped' }];
const preferred = engine.deepDiff(before, after, '', { arrayKey:'account' });
assert.equal(preferred.length, 1);
assert.equal(preferred[0].path, '[account="a-1"].status');

const duplicate = [{ account:'same', status:'a' }, { account:'same', status:'b' }];
assert.equal(engine.pickArrayKey(duplicate, duplicate, 'account'), null, 'duplicate preferred keys must be rejected');

const automation = await readFile(new URL('../public/automation/api-response-to-csv.html', import.meta.url), 'utf8');
for (const phrase of ['authenticated', 'pagination', 'maximum-page guard', 'JSONPath', 'Select and rename columns', 'Failure handling', 'hosted execution']) {
  assert.match(automation, new RegExp(phrase, 'i'));
}

const apiCsv = await readFile(new URL('../public/tools/api-response-to-csv.html', import.meta.url), 'utf8');
for (const phrase of ['Result envelopes', 'Nested arrays', 'Stable columns', 'paginated APIs', 'Need to repeat this export']) {
  assert.match(apiCsv, new RegExp(phrase, 'i'));
}

const compare = await readFile(new URL('../public/tools/compare-json-arrays-by-id.html', import.meta.url), 'utf8');
for (const phrase of ['chooses a matching key', 'Reordering is not a data change', 'duplicate keys']) {
  assert.match(compare, new RegExp(phrase, 'i'));
}

const app = await readFile(new URL('../public/app.js', import.meta.url), 'utf8');
assert.match(app, /id="jsonArrayKey"/);
assert.match(app, /arrayKey:/);
assert.match(app, /path: \$\('jsonPathInput'\)/);

console.log('commercial search journey tests passed');
