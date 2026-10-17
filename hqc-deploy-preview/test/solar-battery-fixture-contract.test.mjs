import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { validateSolarBatteryEvidence } from '../lib/solar-battery-evidence.js';

const fixtureUrl = new URL('./fixtures/solar-battery-cases.json', import.meta.url);
const fixture = JSON.parse(await readFile(fixtureUrl, 'utf8'));
const byId = Object.fromEntries(fixture.cases.map(item => [item.id, item]));

function evidenceFromExpected(item) {
  const expected = item.expected || {};
  return {
    technology: item.technology,
    panel: expected.panel ?? (expected.panelModel ? { model: expected.panelModel } : null),
    arrayKwp: expected.arrayKwp,
    inverter: expected.inverter,
    battery: expected.battery ?? (expected.batteryModel ? { model: expected.batteryModel, usableCapacityKwh: expected.batteryUsableCapacityKwh } : null),
    batteryMentioned: expected.batteryMentioned === true || Boolean(expected.battery),
    annualGenerationKwh: expected.annualGenerationKwh,
    generationBasis: expected.generationBasis,
    selfConsumptionPercent: expected.selfConsumptionPercent,
    exportPercent: expected.exportPercent,
    scaffolding: expected.scaffolding,
    roofWorks: expected.roofWorks,
    dnoTreatment: expected.dnoTreatment,
    priceGbp: expected.priceGbp,
  };
}

test('fixture corpus covers solar-only, solar+battery, battery-only, partial and comparison journeys', () => {
  for (const id of ['solar_only_complete', 'solar_battery_complete', 'battery_only', 'partial_quote_missing_evidence', 'comparison_pair']) {
    assert.ok(byId[id], `missing fixture ${id}`);
  }
});

test('fixture expected values normalise through the same Solar/Battery evidence contract', () => {
  for (const id of ['solar_only_complete', 'solar_battery_complete', 'battery_only', 'partial_quote_missing_evidence']) {
    const item = byId[id];
    const result = validateSolarBatteryEvidence(evidenceFromExpected(item));
    assert.equal(result.ok, true, `${id}: ${result.errors.join(', ')}`);
    assert.equal(result.evidence.technology, item.technology);
    assert.equal(result.evidence.priceGbp, item.expected.priceGbp);
  }
});

test('partial quote fixture preserves unknowns and surfaces its required decision gaps', () => {
  const item = byId.partial_quote_missing_evidence;
  const result = validateSolarBatteryEvidence(evidenceFromExpected(item));
  assert.equal(result.evidence.arrayKwp, null);
  assert.equal(result.evidence.panel, null);
  assert.equal(result.evidence.dnoTreatment, null);
  assert.equal(result.evidence.batteryMentioned, true);
  for (const gap of item.expected.requiredGaps) {
    assert.ok(result.gaps.includes(gap), `partial fixture did not surface ${gap}`);
  }
});

test('comparison fixture declares the decision dimensions and prohibited conclusions required by the public gate', () => {
  const item = byId.comparison_pair;
  for (const dimension of ['panel count', 'array kWp', 'inverter rating', 'battery inclusion and usable capacity', 'annual generation assumption', 'scaffolding scope', 'DNO treatment', 'price']) {
    assert.ok(item.expectedComparisonDimensions.includes(dimension), `missing comparison dimension ${dimension}`);
  }
  assert.ok(item.mustNotConclude.some(value => /electrically approved/i.test(value)));
  assert.ok(item.mustNotConclude.some(value => /structurally suitable/i.test(value)));
  assert.ok(item.mustNotConclude.some(value => /guaranteed/i.test(value)));
  assert.ok(item.mustNotConclude.some(value => /MCS certified/i.test(value)));
});
