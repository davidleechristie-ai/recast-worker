import test from 'node:test';
import assert from 'node:assert/strict';
import {solarEvidenceCompleteness,solarQuoteDifferences,SOLAR_GUARDRAILS} from './solar-evidence-model.js';

test('solar completeness reports documentation without certifying design',()=>{
  const r=solarEvidenceCompleteness({price:9000,panelModel:'Example 450W',panelCount:10,arrayKwp:4.5,annualGenerationKwh:3900});
  assert.equal(r.documented,5);
  assert.ok(r.missing.includes('gridConnection'));
  assert.match(r.note,/does not certify/i);
});

test('solar-only does not require battery fields',()=>{
  const r=solarEvidenceCompleteness({},'solar_only');
  assert.equal(r.applicable,16);
  assert.ok(!r.missing.includes('batteryModel'));
  assert.ok(!r.missing.includes('batteryUsableKwh'));
});

test('comparison surfaces quote differences and preserves missing values',()=>{
  const d=solarQuoteDifferences([{price:9000,arrayKwp:4.5},{price:10500,arrayKwp:5.2}]);
  assert.deepEqual(d.map(x=>x.key),['price','arrayKwp']);
});

test('guardrails explicitly prevent performance certainty',()=>assert.match(SOLAR_GUARDRAILS.performance,/not guaranteed/i));
