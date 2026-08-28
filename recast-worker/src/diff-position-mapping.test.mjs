// Regression tests for mapJsonPositions(), the position-tracking JSON
// parser that powers inline diff highlighting in the Compare tool: it
// walks raw JSON text and figures out which line every value lives on,
// while producing the exact same path strings deepDiff() uses (dotted
// keys, [idx], [key="val"] for array items matched by an id-like field),
// so a diff result can be looked up directly against real line numbers.
//
// Loaded the same way as typegen-array-root.test.mjs — public/lib/*.js
// are UMD modules, not ES modules, so they're evaluated via vm rather
// than import'd directly.

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
const E = sandbox.window.RecastEngine;

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

test('basic id-matched array: a changed field maps to the correct line', () => {
  const fileB = '[\n  { "id": 1, "name": "Ada Lovelace", "role": "Senior Engineer" },\n  { "id": 2, "name": "Grace Hopper", "role": "Admiral" }\n]';
  const fileA = '[\n  { "id": 1, "name": "Ada Lovelace", "role": "Engineer" },\n  { "id": 2, "name": "Grace Hopper", "role": "Admiral" }\n]';
  const rangesB = E.mapJsonPositions(fileB, JSON.parse(fileA));
  assert.deepEqual(plain(rangesB['[id=1].role']), { startLine: 1, endLine: 1 });
});

test('added record maps to the full span of lines it occupies', () => {
  const fileB = '[\n  { "id": 1, "name": "Ada" },\n  { "id": 2, "name": "Grace" },\n  {\n    "id": 3,\n    "name": "Katherine"\n  }\n]';
  const fileA = '[\n  { "id": 1, "name": "Ada" },\n  { "id": 2, "name": "Grace" }\n]';
  const rangesB = E.mapJsonPositions(fileB, JSON.parse(fileA));
  assert.deepEqual(plain(rangesB['[id=3]']), { startLine: 3, endLine: 6 });
});

test('removed record (present in A, absent from B) maps correctly in A', () => {
  const fileA = '[\n  { "id": 1, "name": "Ada" },\n  { "id": 2, "name": "Grace" }\n]';
  const fileB = '[\n  { "id": 1, "name": "Ada" }\n]';
  const rangesA = E.mapJsonPositions(fileA, JSON.parse(fileB));
  assert.deepEqual(plain(rangesA['[id=2]']), { startLine: 2, endLine: 2 });
});

test('nested object field maps to its own, deeper line', () => {
  const fileA = '[\n  {\n    "id": 1,\n    "address": {\n      "city": "London"\n    }\n  }\n]';
  const rangesA = E.mapJsonPositions(fileA, JSON.parse(fileA));
  assert.deepEqual(plain(rangesA['[id=1].address.city']), { startLine: 4, endLine: 4 });
});

test('array key choice matches deepDiff exactly, including when the two files disagree on which key is usable', () => {
  // File A's ids are all unique. File B has a duplicate id (1 appears
  // twice) — deepDiff's own pickArrayKey(arrA, arrB) requires uniqueness
  // in BOTH arrays, so it would reject 'id' entirely for this pair and
  // fall back to 'name' on both sides. If mapJsonPositions determined the
  // key from one file's array alone (ignoring what deepDiff actually
  // used), it could disagree with deepDiff's real path — producing a
  // highlight on the wrong line, or no highlight at all.
  const a = [{ id: 1, name: 'Ada' }, { id: 2, name: 'Grace' }];
  const b = [{ id: 1, name: 'Ada' }, { id: 1, name: 'Grace' }];
  const changes = E.deepDiff(a, b, '');
  assert.equal(changes.length, 1);
  assert.equal(changes[0].path, '[name="Grace"].id');

  const fileA = JSON.stringify(a, null, 2);
  const fileB = JSON.stringify(b, null, 2);
  const rangesA = E.mapJsonPositions(fileA, b);
  const rangesB = E.mapJsonPositions(fileB, a);
  assert.ok(rangesA['[name="Grace"].id'], 'file A should have a range for the exact path deepDiff produced');
  assert.ok(rangesB['[name="Grace"].id'], 'file B should have a range for the exact path deepDiff produced');
});

test('a single top-level object (not array-rooted) still maps correctly', () => {
  const fileA = '{\n  "id": 1,\n  "name": "Ada"\n}';
  const rangesA = E.mapJsonPositions(fileA, JSON.parse(fileA));
  assert.deepEqual(plain(rangesA['name']), { startLine: 2, endLine: 2 });
});

test('invalid JSON returns null rather than throwing', () => {
  const result = E.mapJsonPositions('{not valid json', undefined);
  assert.equal(result, null);
});

// ---------------- mapXmlPositions ----------------

test('XML: simple nested tags map to the correct lines', () => {
  const xml = '<root>\n  <customer>\n    <name>Ada</name>\n  </customer>\n</root>';
  const ranges = E.mapXmlPositions(xml, undefined);
  assert.deepEqual(plain(ranges['root.customer.name']), { startLine: 2, endLine: 2 });
  assert.deepEqual(plain(ranges['root.customer']), { startLine: 1, endLine: 3 });
});

test('XML: repeated sibling tags with a matchable child-element key produce the same path deepDiff does', () => {
  // Mirrors deepDiff's own real behavior for XML-derived data: an
  // attribute (@id) is never a matchable key candidate (the "@" prefix
  // isn't in pickArrayKey's candidate list at all), but a plain child
  // element like <name> is, if unique in both files.
  const xmlA = '<root>\n  <customer id="1">\n    <name>Ada</name>\n  </customer>\n  <customer id="2">\n    <name>Grace</name>\n  </customer>\n</root>';
  const xmlB = '<root>\n  <customer id="1">\n    <name>Ada</name>\n    <role>Engineer</role>\n  </customer>\n  <customer id="2">\n    <name>Grace</name>\n  </customer>\n</root>';
  const a = E.xmlToJson(xmlA);
  const b = E.xmlToJson(xmlB);
  const changes = E.deepDiff(a, b, '');
  assert.equal(changes.length, 1);
  assert.equal(changes[0].path, 'root.customer[name="Ada"].role');

  const rangesB = E.mapXmlPositions(xmlB, a);
  assert.deepEqual(plain(rangesB['root.customer[name="Ada"].role']), { startLine: 3, endLine: 3 });
});

test('XML: repeated sibling tags with no matchable key fall back to index-based paths, matching deepDiff', () => {
  const xmlA = '<root>\n  <item>\n    <val>1</val>\n  </item>\n  <item>\n    <val>2</val>\n  </item>\n</root>';
  const xmlB = '<root>\n  <item>\n    <val>1</val>\n  </item>\n  <item>\n    <val>99</val>\n  </item>\n</root>';
  const a = E.xmlToJson(xmlA);
  const b = E.xmlToJson(xmlB);
  const changes = E.deepDiff(a, b, '');
  assert.equal(changes.length, 1);
  assert.equal(changes[0].path, 'root.item[1].val');

  const rangesB = E.mapXmlPositions(xmlB, a);
  assert.deepEqual(plain(rangesB['root.item[1].val']), { startLine: 5, endLine: 5 });
});

test('XML: an attribute-bearing leaf element maps to its own single line', () => {
  const xml = '<root>\n  <price currency="USD">42</price>\n</root>';
  const ranges = E.mapXmlPositions(xml, undefined);
  assert.deepEqual(plain(ranges['root.price']), { startLine: 1, endLine: 1 });
});

test('XML: invalid markup returns null rather than throwing', () => {
  const result = E.mapXmlPositions('<root><unclosed>', undefined);
  assert.equal(result, null);
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
