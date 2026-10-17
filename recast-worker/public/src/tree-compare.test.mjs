// Regression tests for RecastTreeCompare (public/lib/tree-compare.js) —
// the filterable, searchable structural-analysis table built over an
// engine.deepDiff() result, used by XML diff's "Structural analysis" view.
//
// Loaded the same way as typegen-array-root.test.mjs — public/lib/*.js
// are UMD modules, not ES modules ("type": "module" in package.json means
// a plain require() here would silently return an empty ES-module
// namespace object instead of the real exports), so they're evaluated via
// vm rather than import'd or require()'d directly.

import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

function loadUmdModule(path, sandbox) {
  const code = readFileSync(path, 'utf8');
  vm.runInContext(code, sandbox);
}

const sandbox = { console };
sandbox.window = sandbox;
sandbox.global = sandbox;
vm.createContext(sandbox);
loadUmdModule('public/lib/tree-compare.js', sandbox);
const TC = sandbox.window.RecastTreeCompare;

let passed = 0, failed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  \u2713', name);
  } catch (e) {
    failed++;
    console.log('  \u2715', name);
    console.log('    ', e.message);
  }
}

const sampleChanges = [
  { path: 'root.customer[name="Ada"].role', type: 'added', oldVal: null, newVal: 'Engineer' },
  { path: 'root.customer[name="Grace"].role', type: 'changed', oldVal: 'Admiral', newVal: 'Rear Admiral' },
  { path: 'root.customer[name="Bob"]', type: 'removed', oldVal: { name: 'Bob' }, newVal: null },
];

test('buildTableHtml renders one row per change with the right status badge', () => {
  const html = TC.buildTableHtml(sampleChanges, { statusFilter: 'all' });
  assert.equal((html.match(/<tr class="row-/g) || []).length, 3);
  assert.ok(html.includes('>ADD<'));
  assert.ok(html.includes('>CHG<'));
  assert.ok(html.includes('>DEL<'));
});

test('buildTableHtml filters by status', () => {
  const html = TC.buildTableHtml(sampleChanges, { statusFilter: 'changed' });
  assert.equal((html.match(/<tr class="row-/g) || []).length, 1);
  assert.ok(html.includes('Rear Admiral'));
});

test('buildTableHtml search matches path or either value, case-insensitively', () => {
  const byPath = TC.buildTableHtml(sampleChanges, { searchText: 'BOB' });
  assert.equal((byPath.match(/<tr class="row-/g) || []).length, 1);
  const byValue = TC.buildTableHtml(sampleChanges, { searchText: 'engineer' });
  assert.equal((byValue.match(/<tr class="row-/g) || []).length, 1);
});

test('buildTableHtml shows an empty-state message when nothing matches', () => {
  const html = TC.buildTableHtml(sampleChanges, { searchText: 'nothing-matches-this' });
  assert.ok(html.includes('No changes match'));
  assert.ok(!html.includes('<tr'));
});

test('a path containing a literal double-quote is safely escaped in the row attribute (not just text content)', () => {
  // The exact bug class found and fixed in app.js's tree-view rows: an
  // unescaped '"' in a data-path="..." attribute breaks the HTML. This
  // module's own esc() must not repeat that mistake.
  const html = TC.buildTableHtml(sampleChanges, { statusFilter: 'all' });
  assert.ok(html.includes('data-path="root.customer[name=&quot;Ada&quot;].role"'));
  assert.ok(!html.includes('data-path="root.customer[name=" '));
});

test('toReportCsv produces a well-formed CSV with a header row and one row per change', () => {
  const csv = TC.toReportCsv(sampleChanges);
  const lines = csv.split('\n');
  assert.equal(lines[0], 'status,path,old,new');
  assert.equal(lines.length, 4); // header + 3 changes
  assert.ok(lines[1].startsWith('added,'));
});

test('toReportHtml embeds a working table and a status summary', () => {
  const html = TC.toReportHtml(sampleChanges, { title: 'Test Report' });
  assert.ok(html.includes('Test Report'));
  assert.ok(html.includes('1 added'));
  assert.ok(html.includes('1 removed'));
  assert.ok(html.includes('1 changed'));
  assert.ok(html.includes('<table'));
});

test('an empty changes list renders the empty-state message, not a broken table', () => {
  const html = TC.buildTableHtml([], { statusFilter: 'all' });
  assert.ok(html.includes('No changes match'));
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
