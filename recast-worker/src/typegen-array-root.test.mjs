// Regression tests for a real bug found and fixed in this session: when the
// top-level JSON sample is an array of objects (not a single object), several
// type-generation functions produced a self-referencing, non-compiling
// definition (e.g. Kotlin's "typealias Person = List<Person>") with the
// actual class/struct definition never printed anywhere in the output.
//
// Loaded the same way as structural-analysis-classification.test.mjs —
// public/lib/*.js are UMD modules, not ES modules, so they're evaluated via
// vm rather than import'd directly.

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

// The exact sample shape that exposed the bug: an array of objects whose
// inferred item class name is identical to the root name given to the
// generator — the collision case.
const arraySample = [
  { name: 'Ada Lovelace', role: 'Engineer', address: { city: 'London', country: 'UK' } },
  { name: 'Grace Hopper', role: 'Admiral', address: { city: 'New York', country: 'US' } },
];
const objectSample = { name: 'Ada Lovelace', role: 'Engineer' };

const collidingArraySchema = E.jsonSchemaFromSample(arraySample, { title: 'Person' });
const nonCollidingArraySchema = E.jsonSchemaFromSample(arraySample, { title: 'Employees' });
const objectSchema = E.jsonSchemaFromSample(objectSample, { title: 'Person' });

// A definition is genuinely usable only if it's actually declared somewhere
// in the output — not just referenced. This checks for a real declaration
// line, not merely that the class name appears as a substring (which the
// broken "List<Person>" reference would also satisfy).
function declaresClass(code, marker) {
  return code.includes(marker);
}

test('Kotlin: colliding array root emits the class, not a self-referencing typealias', () => {
  const out = E.jsonSchemaToKotlin(collidingArraySchema, 'Person');
  assert.ok(declaresClass(out, 'data class Person('), 'expected a real "data class Person(" declaration');
  assert.ok(!out.includes('typealias Person = List<Person>'), 'must not emit a self-referencing typealias');
});

test('Kotlin: non-colliding array root still emits both the class and a meaningful typealias', () => {
  const out = E.jsonSchemaToKotlin(nonCollidingArraySchema, 'Employees');
  assert.ok(declaresClass(out, 'data class Employee('), 'expected the item class to be declared');
  assert.ok(out.includes('typealias Employees = List<Employee>'), 'expected the non-colliding typealias to still be emitted (pre-existing correct behavior)');
});

test('Kotlin: single-object root is unaffected by the array-path fix', () => {
  const out = E.jsonSchemaToKotlin(objectSchema, 'Person');
  assert.ok(declaresClass(out, 'data class Person('));
  assert.ok(!out.includes('typealias'), 'an object root should never emit a typealias at all');
});

test('Rust: colliding array root emits the struct, not a self-referencing type alias', () => {
  const out = E.jsonSchemaToRust(collidingArraySchema, 'Person');
  assert.ok(declaresClass(out, 'pub struct Person {'), 'expected a real "pub struct Person {" declaration');
  assert.ok(!out.includes('pub type Person = Vec<Person>;'), 'must not emit a self-referencing type alias');
});

test('Python (dataclass): colliding array root emits the class, not a self-referencing assignment', () => {
  const out = E.jsonSchemaToPython(collidingArraySchema, 'Person');
  assert.ok(declaresClass(out, 'class Person:'), 'expected a real "class Person:" declaration');
  assert.ok(!out.includes('Person = List[Person]'), 'must not emit a self-referencing assignment');
});

test('Pydantic: colliding array root emits the class, not a self-referencing assignment', () => {
  const out = E.jsonSchemaToPydantic(collidingArraySchema, 'Person');
  assert.ok(declaresClass(out, 'class Person(BaseModel):'), 'expected a real "class Person(BaseModel):" declaration');
  assert.ok(!out.includes('Person = List[Person]'), 'must not emit a self-referencing assignment');
});

test('Go: colliding array root emits the struct, not a self-referencing type alias', () => {
  const out = E.jsonSchemaToGo(collidingArraySchema, 'Person');
  assert.ok(declaresClass(out, 'type Person struct {'), 'expected a real "type Person struct {" declaration');
  assert.ok(!out.includes('type Person = []Person'), 'must not emit a self-referencing type alias');
});

test('TypeScript: array root was already correct (inlines the shape) — confirm no regression', () => {
  const out = E.jsonSchemaToTypescript(collidingArraySchema, 'Person');
  assert.ok(out.includes('name: string') && out.includes('}[]'), 'expected an inlined array-of-object type');
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
