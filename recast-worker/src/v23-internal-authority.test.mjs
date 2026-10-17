import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workerUi = await readFile(new URL('./worker-ui.js', import.meta.url), 'utf8');

for (const path of [
  '/tools/csv-diff.html',
  '/tools/json-diff.html',
  '/tools/json-to-csv.html',
  '/tools/'
]) {
  assert(workerUi.includes(`'${path}'`), `authority map must cover ${path}`);
}

for (const target of [
  '/tools/compare-csv-files-by-id.html',
  '/tools/api-response-to-csv.html',
  '/tools/compare-api-responses.html'
]) {
  assert(workerUi.includes(target), `authority links must include ${target}`);
}

assert(workerUi.includes('seo-authority-cluster'), 'authority links need a stable server-rendered wrapper');
assert(workerUi.includes('element.prepend(AUTHORITY_STYLE'), 'authority style must be added in head');
assert(workerUi.includes('element.append(authorityHtml'), 'authority links must be emitted server-side in HTML');

console.log('V23 internal authority checks passed');
