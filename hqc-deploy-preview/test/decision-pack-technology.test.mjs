import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../decision-pack.js',import.meta.url),'utf8');

test('Decision Pack events carry the active journey technology',()=>{
  assert.match(source,/technology:technology\(\)/);
  assert.match(source,/hqc_journey_technology/);
});

test('Decision Pack checkout request carries technology for durable segmentation',()=>{
  assert.match(source,/JSON\.stringify\(\{caseId,technology:technology\(\)\}\)/);
});

test('Heat Pump remains the safe default when no technology is selected',()=>{
  assert.match(source,/sessionStorage\.getItem\(TECH\)\|\|'heat_pump'/);
  assert.match(source,/return'heat_pump'/);
});
