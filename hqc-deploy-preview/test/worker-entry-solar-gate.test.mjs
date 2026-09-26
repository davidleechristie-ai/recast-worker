import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../worker-entry.js';

const solarRequest = (body = { quoteText: '12 x 450W panels. 5kW inverter. 10kWh usable battery. Total £12000.' }) => new Request(
  'https://homequotecheck.co.uk/api/analyse',
  {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-hqc-technology': 'solar_battery' },
    body: JSON.stringify(body),
  },
);

test('Worker keeps Solar/Battery closed when internal gate is absent', async () => {
  const response = await worker.fetch(solarRequest(), {}, {});
  assert.equal(response.status, 409);
  const payload = await response.json();
  assert.equal(payload.error, 'technology_analysis_not_ready');
  assert.equal(payload.technology, 'solar_battery');
});

test('Worker serves dedicated Solar/Battery handler only when internal gate is explicit', async () => {
  const response = await worker.fetch(solarRequest(), { HQC_SOLAR_ANALYSIS_INTERNAL: '1' }, {});
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-hqc-analysis-technology'), 'solar_battery');
  assert.equal(response.headers.get('x-hqc-analysis-adapter'), 'solar_battery_internal');
  const payload = await response.json();
  assert.ok(payload);
});

test('unsupported technology still fails closed at Worker boundary', async () => {
  const request = new Request('https://homequotecheck.co.uk/api/analyse?technology=boiler', { method: 'POST' });
  const response = await worker.fetch(request, { HQC_SOLAR_ANALYSIS_INTERNAL: '1' }, {});
  assert.equal(response.status, 400);
  const payload = await response.json();
  assert.equal(payload.error, 'unsupported_or_missing_technology');
});


test('Worker serves Solar/Battery through independent public production gate', async () => {
  const response = await worker.fetch(solarRequest(), { HQC_SOLAR_ANALYSIS_PUBLIC: '1' }, {});
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-hqc-analysis-technology'), 'solar_battery');
  assert.equal(response.headers.get('x-hqc-analysis-adapter'), 'solar_battery');
});
