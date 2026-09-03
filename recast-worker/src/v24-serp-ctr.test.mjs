import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workerUi = await readFile(new URL('./worker-ui.js', import.meta.url), 'utf8');

const expected = [
  '/tools/json-to-csv.html',
  '/tools/json-diff.html',
  '/tools/csv-diff.html',
  '/tools/api-response-to-csv.html',
  '/tools/compare-api-responses.html'
];

for (const path of expected) {
  assert(workerUi.includes(`'${path}'`), `CTR metadata must cover ${path}`);
}

assert(workerUi.includes('JSON to CSV Online — Convert Nested JSON Free | Recast'));
assert(workerUi.includes('JSON Diff Online — Compare Two JSON Files | Recast'));
assert(workerUi.includes('CSV Diff Online — Compare Two CSV Files | Recast'));
assert(workerUi.includes('API Response to CSV — Convert JSON API Data Online | Recast'));
assert(workerUi.includes('Compare API Responses Online — Find JSON Changes | Recast'));
assert(workerUi.includes(".on('title'"), 'worker must rewrite document title safely');
assert(workerUi.includes('meta[name="description"]'), 'worker must rewrite meta description safely');
assert(workerUi.includes('meta[property="og:title"]'), 'worker must keep OG title aligned');

console.log('V24 SERP CTR checks passed');
