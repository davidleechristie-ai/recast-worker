import assert from 'node:assert/strict';
import test from 'node:test';
import { normaliseSolarBatteryEvidence, solarBatteryEvidenceGaps, validateSolarBatteryEvidence } from '../lib/solar-battery-evidence.js';

test('complete solar+battery evidence preserves explicit quote facts', () => {
  const result = validateSolarBatteryEvidence({
    technology: 'solar_battery',
    panel: { make: 'HelioWorks', model: 'HW430', count: 12 },
    arrayKwp: 5.16,
    inverter: { make: 'VoltBridge', model: 'VB5', ratingKw: 5 },
    battery: { make: 'StoreBox', model: 'SB10', usableCapacityKwh: 9.2 },
    annualGenerationKwh: 4650,
    generationBasis: 'installer states MCS methodology',
    selfConsumptionPercent: 70,
    exportPercent: 30,
    dnoTreatment: 'G99 application required; approval not evidenced',
    warranties: ['panels 25 years', 'battery 10 years'],
    mcsWording: 'installer states installation will be MCS certified on completion',
    priceGbp: 12400,
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.gaps, []);
  assert.equal(result.evidence.battery.usableCapacityKwh, 9.2);
  assert.match(result.evidence.dnoTreatment, /approval not evidenced/);
});

test('missing quote evidence remains null and is surfaced as gaps', () => {
  const evidence = normaliseSolarBatteryEvidence({ technology: 'solar_battery', priceGbp: 10995 });
  assert.equal(evidence.arrayKwp, null);
  assert.equal(evidence.panel, null);
  assert.equal(evidence.dnoTreatment, null);
  const gaps = solarBatteryEvidenceGaps(evidence);
  for (const expected of ['panel specification', 'array size', 'inverter specification', 'generation estimate and basis', 'DNO treatment', 'warranty detail', 'MCS wording']) {
    assert.ok(gaps.includes(expected), `missing ${expected}`);
  }
});

test('battery-only does not invent solar evidence requirements', () => {
  const result = validateSolarBatteryEvidence({
    technology: 'battery',
    inverter: { model: 'AC3600', ratingKw: 3.6 },
    battery: { make: 'PowerNest', model: 'PN7', usableCapacityKwh: 6.8 },
    warranties: ['battery 10 years'],
    priceGbp: 5250,
  });
  assert.equal(result.gaps.includes('panel specification'), false);
  assert.equal(result.gaps.includes('array size'), false);
  assert.equal(result.gaps.includes('generation estimate and basis'), false);
  assert.ok(result.gaps.includes('DNO treatment'));
});

test('implausible numeric output is rejected rather than silently accepted', () => {
  const result = validateSolarBatteryEvidence({
    technology: 'solar_battery',
    panel: { model: 'P1', count: -1 },
    selfConsumptionPercent: 120,
    priceGbp: -5,
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('panel count must be positive'));
  assert.ok(result.errors.includes('selfConsumptionPercent must not exceed 100'));
  assert.ok(result.errors.includes('priceGbp must not be negative'));
});
