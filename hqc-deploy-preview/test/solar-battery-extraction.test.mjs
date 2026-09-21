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
