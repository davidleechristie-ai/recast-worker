import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { extractSolarBatteryEvidence } from '../lib/solar-battery-extraction.js';

const fixtures = JSON.parse(fs.readFileSync(new URL('./fixtures/solar-battery-cases.json', import.meta.url))).cases;

for (const fixture of fixtures.filter(f => f.quoteText)) {
  test(`extracts ${fixture.id} without inventing missing evidence`, () => {
    const result = extractSolarBatteryEvidence(fixture.quoteText, fixture.technology);
    assert.equal(result.ok, true);
    assert.equal(result.evidence.priceGbp, fixture.expected.priceGbp);
    if ('arrayKwp' in fixture.expected) assert.equal(result.evidence.arrayKwp, fixture.expected.arrayKwp);
    if (fixture.expected.panel?.count) assert.equal(result.evidence.panel?.count, fixture.expected.panel.count);
    if (fixture.expected.battery?.usableCapacityKwh) assert.equal(result.evidence.battery?.usableCapacityKwh, fixture.expected.battery.usableCapacityKwh);
    if (fixture.expected.annualGenerationKwh) assert.equal(result.evidence.annualGenerationKwh, fixture.expected.annualGenerationKwh);
    if (fixture.expected.dnoTreatment === null) assert.equal(result.evidence.dnoTreatment, null);
    for (const gap of fixture.expected.requiredGaps || []) assert.ok(result.gaps.includes(gap), `expected gap: ${gap}`);
  });
}

test('extracts both comparison quotes independently', () => {
  const fixture = fixtures.find(f => f.id === 'comparison_pair');
  const [a, b] = fixture.quotes.map(q => extractSolarBatteryEvidence(q, fixture.technology));
  assert.equal(a.evidence.arrayKwp, 4.4);
  assert.equal(a.evidence.priceGbp, 7200);
  assert.equal(b.evidence.arrayKwp, 5.28);
  assert.equal(b.evidence.battery?.usableCapacityKwh, 7.5);
  assert.equal(b.evidence.priceGbp, 11900);
  assert.match(b.evidence.dnoTreatment, /G99/);
});


test('MVP benchmark: >=95% of explicitly expected material fields are correct with zero fabricated values', () => {
  const leaves=(obj,prefix='')=>Object.entries(obj||{}).flatMap(([k,v])=>{ const path=prefix?prefix+'.'+k:k; if(v && typeof v==='object' && !Array.isArray(v)) return leaves(v,path); return [[path,v]]; });
  const get=(obj,path)=>path.split('.').reduce((v,k)=>v==null?null:v[k],obj);
  let expected=0,correct=0;
  for(const fixture of fixtures.filter(f=>f.quoteText)){
    const result=extractSolarBatteryEvidence(fixture.quoteText,fixture.technology);
    for(const [path,value] of leaves(fixture.expected)){
      if(path==='requiredGaps'||path.endsWith('Mentioned')||path.endsWith('Model')||path==='mcsStatus') continue;
      expected++;
      const actual=get(result.evidence,path);
      if(JSON.stringify(actual)===JSON.stringify(value)) correct++; else console.error('MVP_MISMATCH',fixture.id,path,'expected=',JSON.stringify(value),'actual=',JSON.stringify(actual));
    }
    if(fixture.expected.panel===null) assert.equal(result.evidence.panel,null);
    if(fixture.expected.arrayKwp===null) assert.equal(result.evidence.arrayKwp,null);
    if(fixture.expected.dnoTreatment===null) assert.equal(result.evidence.dnoTreatment,null);
    if(fixture.expected.inverter===null) assert.equal(result.evidence.inverter,null);
    if(fixture.expected.annualGenerationKwh===null) assert.equal(result.evidence.annualGenerationKwh,null);
  }
  const accuracy=correct/expected;
  assert.ok(accuracy>=0.95,'material-field accuracy '+(accuracy*100).toFixed(1)+'% is below 95% ('+correct+'/'+expected+')');
});
