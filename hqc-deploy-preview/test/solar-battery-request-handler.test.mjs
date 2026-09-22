import test from 'node:test';
import assert from 'node:assert/strict';
import { handleSolarBatteryAnalysisRequest } from '../lib/solar-battery-request-handler.js';

const request = (body, headers = {}) => new Request('https://example.test/api/analyse', {
  method: 'POST', headers: { 'content-type': 'application/json', 'x-hqc-technology': 'solar_battery', ...headers },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});

test('single Solar quote returns technology-specific evidence', async () => {
  const r = await handleSolarBatteryAnalysisRequest(request({ quoteText: '12 panels. Array size 5.1 kWp. Annual generation 4200 kWh. Total price £9,500.' }));
  assert.equal(r.status, 200); const j = await r.json(); assert.equal(j.technology, 'solar_battery'); assert.equal(j.evidence.arrayKwp, 5.1); assert.equal(j.evidence.priceGbp, 9500);
});

test('two quotes return evidence-only comparison with no automatic winner', async () => {
  const r = await handleSolarBatteryAnalysisRequest(request({ quotes: [{ quoteId: 'a', quoteText: 'Array size 4 kWp. Total price £8,000.' }, { quoteId: 'b', quoteText: 'Array size 5 kWp. Total price £9,000.' }] }));
  assert.equal(r.status, 200); const j = await r.json(); assert.equal(j.analyses.length, 2); assert.match(j.conclusion, /No automatic winner/);
});

test('partial quote preserves missing evidence rather than inventing values', async () => {
  const r = await handleSolarBatteryAnalysisRequest(request({ quoteText: 'Solar PV and battery included. Total price £10,000.' }));
  assert.equal(r.status, 200); const j = await r.json(); assert.ok(j.gaps.length > 0); assert.equal(j.evidence.arrayKwp, null);
});

test('malformed JSON fails closed', async () => {
  const r = await handleSolarBatteryAnalysisRequest(request('{bad')); assert.equal(r.status, 400); assert.equal((await r.json()).error, 'invalid_json');
});

test('PDF/image request remains explicitly unverified', async () => {
  const r = await handleSolarBatteryAnalysisRequest(new Request('https://example.test/api/analyse', { method: 'POST', headers: { 'content-type': 'application/pdf', 'x-hqc-technology': 'solar_battery' }, body: 'pdf' }));
  assert.equal(r.status, 415); assert.equal((await r.json()).error, 'unsupported_media_type');
});
