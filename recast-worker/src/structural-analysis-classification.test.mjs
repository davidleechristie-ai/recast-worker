// Regression tests for Structural Analysis's evidence-based, conservative
// breaking-change classification. Loaded the same way as
// pipeline-field-discovery.test.mjs — public/lib/*.js are UMD modules, not
// ES modules, so they're evaluated via vm rather than import'd directly.

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
loadUmdModule('public/lib/engine.js', sandbox);
sandbox.RecastEngine = sandbox.window.RecastEngine;
loadUmdModule('public/lib/structural-analysis.js', sandbox);
const E = sandbox.window.RecastEngine;
const SA = sandbox.window.RecastStructuralAnalysis;

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
function plain(v) { return JSON.parse(JSON.stringify(v)); } // normalize out of the vm sandbox's separate realm before comparing

function analyze(before, after, options) {
  const changes = E.deepDiff(before, after);
  return plain(SA.analyzeStructure(changes, before, options));
}
function findChange(result, path) {
  return result.changes.find((c) => c.path === path);
}

console.log('Structural Analysis: evidence-based breaking classification\n');

// ---------------- The exact bug-report scenario ----------------
test('bug report: field removed from only some records is Uncertain, not Breaking', () => {
  const before = [{ id: 1, name: 'John' }, { id: 2 }];
  const after = [{ id: 1 }, { id: 2 }];
  const result = analyze(before, after);
  const change = findChange(result, '[id=1].name');
  assert.equal(change.severity, 'uncertain');
  assert.equal(result.summary.breaking, 0);
  assert.equal(result.summary.uncertain, 1);
});

// ---------------- 1. Required field removed ----------------
test('1. field present on every record, then removed -> Breaking', () => {
  const before = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
  const after = [{ id: 1 }, { id: 2, name: 'Jane' }];
  const result = analyze(before, after);
  const change = findChange(result, '[id=1].name');
  assert.equal(change.severity, 'breaking');
  assert.equal(change.label, 'Required field removed');
  assert.equal(result.summary.breaking, 1);
});

// ---------------- 2. Optional / partial field removed ----------------
test('2. field present on some but not all records, then removed -> Uncertain', () => {
  const before = [{ id: 1, name: 'John' }, { id: 2 }];
  const after = [{ id: 1 }, { id: 2 }];
  const result = analyze(before, after);
  const change = findChange(result, '[id=1].name');
  assert.equal(change.severity, 'uncertain');
  assert.notEqual(change.severity, 'breaking');
});

// ---------------- 3. Field added ----------------
test('3. optional field added -> Non-breaking', () => {
  const before = [{ id: 1 }];
  const after = [{ id: 1, status: 'active' }];
  const result = analyze(before, after);
  const change = findChange(result, '[id=1].status');
  assert.equal(change.severity, 'non-breaking');
  assert.equal(change.category, 'structural');
});

// ---------------- 4. Number -> string ----------------
test('4. number -> string -> Breaking', () => {
  const before = [{ id: 1, age: 42 }];
  const after = [{ id: 1, age: '42' }];
  const result = analyze(before, after);
  const change = findChange(result, '[id=1].age');
  assert.equal(change.severity, 'breaking');
  assert.equal(change.label, 'Primitive type changed');
});
test('4b. string -> number -> Breaking', () => {
  const before = [{ id: 1, age: '42' }];
  const after = [{ id: 1, age: 42 }];
  const result = analyze(before, after);
  const change = findChange(result, '[id=1].age');
  assert.equal(change.severity, 'breaking');
});
test('4c. boolean -> string -> Breaking', () => {
  const before = [{ id: 1, active: true }];
  const after = [{ id: 1, active: 'true' }];
  const result = analyze(before, after);
  const change = findChange(result, '[id=1].active');
  assert.equal(change.severity, 'breaking');
});

// ---------------- 5. Object -> primitive ----------------
test('5. object -> primitive -> Breaking', () => {
  const before = [{ id: 1, address: { city: 'London' } }];
  const after = [{ id: 1, address: 'London' }];
  const result = analyze(before, after);
  const change = findChange(result, '[id=1].address');
  assert.equal(change.severity, 'breaking');
  assert.equal(change.label, 'Object changed to primitive');
});

// ---------------- 6. Array -> primitive ----------------
test('6. array -> non-array (primitive) -> Breaking', () => {
  const before = [{ id: 1, tags: ['a', 'b'] }];
  const after = [{ id: 1, tags: 'a,b' }];
  const result = analyze(before, after);
  const change = findChange(result, '[id=1].tags');
  assert.equal(change.severity, 'breaking');
  assert.equal(change.label, 'Array changed to non-array');
});

// ---------------- 7. Array item removed ----------------
test('7. array item removed -> Non-breaking (array length can legitimately vary)', () => {
  const before = [{ id: 1, tags: ['a', 'b', 'c'] }];
  const after = [{ id: 1, tags: ['a', 'b'] }];
  const result = analyze(before, after);
  const removedItem = result.changes.find((c) => c.type === 'removed');
  assert.equal(removedItem.severity, 'non-breaking');
  assert.equal(removedItem.label, 'Array item removed');
});

// ---------------- 8. Value changed ----------------
test('8. same type, different value -> Value (not structural, no severity)', () => {
  const before = [{ id: 1, name: 'John' }];
  const after = [{ id: 1, name: 'Jonathan' }];
  const result = analyze(before, after);
  const change = findChange(result, '[id=1].name');
  assert.equal(change.category, 'value');
  assert.equal(change.severity, null);
  assert.equal(result.summary.value, 1);
  assert.equal(result.summary.breaking, 0);
});

// ---------------- 9. null -> string ----------------
test('9. null -> string is Uncertain, never automatically Breaking', () => {
  const before = [{ id: 1, note: null }];
  const after = [{ id: 1, note: 'hello' }];
  const result = analyze(before, after);
  const change = findChange(result, '[id=1].note');
  assert.equal(change.severity, 'uncertain');
  assert.notEqual(change.severity, 'breaking');
});

// ---------------- 10. string -> null ----------------
test('10. string -> null is Uncertain, never automatically Breaking', () => {
  const before = [{ id: 1, note: 'hello' }];
  const after = [{ id: 1, note: null }];
  const result = analyze(before, after);
  const change = findChange(result, '[id=1].note');
  assert.equal(change.severity, 'uncertain');
  assert.notEqual(change.severity, 'breaking');
});

// ---------------- Extra: nested-field presence evidence (correctness fix found while implementing) ----------------
test('extra: a nested field removed is checked at its own nested path, not by name alone', () => {
  // address.zip present on every record -> Breaking, even though a
  // different, unrelated top-level "zip" never exists anywhere. This
  // guards against a real bug found during implementation: checking
  // presence by the field's bare name (ignoring nesting) instead of its
  // full per-record path.
  const before = [
    { id: 1, address: { city: 'London', zip: '1' } },
    { id: 2, address: { city: 'Paris', zip: '2' } },
  ];
  const after = [
    { id: 1, address: { city: 'London' } },
    { id: 2, address: { city: 'Paris', zip: '2' } },
  ];
  const result = analyze(before, after);
  const change = findChange(result, '[id=1].address.zip');
  assert.equal(change.severity, 'breaking');
});
test('extra: same nested field removed, present on only some records -> Uncertain', () => {
  const before = [
    { id: 1, address: { city: 'London', zip: '1' } },
    { id: 2, address: { city: 'Paris' } }, // never had zip
  ];
  const after = [
    { id: 1, address: { city: 'London' } },
    { id: 2, address: { city: 'Paris' } },
  ];
  const result = analyze(before, after);
  const change = findChange(result, '[id=1].address.zip');
  assert.equal(change.severity, 'uncertain');
});

// ---------------- Extra: explicit schema hook (requiredFields) ----------------
test('extra: explicit requiredFields option overrides statistical evidence toward Breaking', () => {
  const before = [{ id: 1, name: 'John' }, { id: 2 }]; // name only on some records
  const after = [{ id: 1 }, { id: 2 }];
  const result = analyze(before, after, { requiredFields: new Set(['name']) });
  const change = findChange(result, '[id=1].name');
  assert.equal(change.severity, 'breaking');
  assert.equal(change.label, 'Required field removed');
});

// ---------------- Extra: single-object (non-array) beforeData ----------------
test('extra: single-object beforeData treats the removed field as present on its one record -> Breaking', () => {
  const before = { id: 1, name: 'John' };
  const after = { id: 1 };
  const result = analyze(before, after);
  const change = findChange(result, 'name');
  assert.equal(change.severity, 'breaking');
});

// ---------------- Uncertain is never miscounted as breaking or non-breaking in the summary ----------------
test('summary never double-counts Uncertain into breaking or nonBreaking', () => {
  const before = [{ id: 1, name: 'John' }, { id: 2 }];
  const after = [{ id: 1 }, { id: 2 }];
  const result = analyze(before, after);
  assert.equal(result.summary.uncertain, 1);
  assert.equal(result.summary.breaking, 0);
  assert.equal(result.summary.nonBreaking, 0);
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
