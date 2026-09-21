import assert from 'node:assert/strict';
import test from 'node:test';
import { HEAT_PUMP_API_BASE } from '../lib/technology-routing.js';
import { analysisRequestRoute, technologyHintFromRequest } from '../lib/analysis-request-routing.js';

const req = (url, technology) => new Request(url, { headers: technology ? { 'x-hqc-technology': technology } : {} });

test('legacy analysis request remains on existing Heat Pump upstream', () => {
  const request = req('https://homequotecheck.co.uk/api/analyse?case=abc');
  const route = analysisRequestRoute(request, {});
  assert.equal(route.ok, true);
  assert.equal(route.technology, 'heat_pump');
  assert.equal(route.apiBase, HEAT_PUMP_API_BASE);
  assert.equal(route.target, `${HEAT_PUMP_API_BASE}/api/analyse?case=abc`);
});

test('explicit Solar/Battery request is blocked while adapter is unavailable', () => {
  for (const technology of ['solar_battery', 'battery']) {
    const request = req('https://homequotecheck.co.uk/api/analyse', technology);
    const route = analysisRequestRoute(request, {});
    assert.equal(route.ok, false);
    assert.equal(route.status, 409);
    assert.equal(route.error, 'technology_analysis_not_ready');
    assert.notEqual(route.apiBase, HEAT_PUMP_API_BASE);
  }
});

test('explicit Solar/Battery request uses only configured dedicated adapter', () => {
  const env = { HQC_SOLAR_ANALYSIS_API_BASE: 'https://solar-adapter.example.test/' };
  for (const technology of ['solar_battery', 'battery']) {
    const request = req(`https://homequotecheck.co.uk/api/analyse?technology=${technology}`);
    const route = analysisRequestRoute(request, env);
    assert.equal(route.ok, true);
    assert.equal(route.adapter, 'solar_battery');
    assert.equal(route.apiBase, 'https://solar-adapter.example.test');
    assert.match(route.target, /^https:\/\/solar-adapter\.example\.test\/api\/analyse/);
    assert.equal(route.target.includes('heat-pump-second-opinion'), false);
  }
});

test('header technology takes precedence over query technology', () => {
  const request = req('https://homequotecheck.co.uk/api/analyse?technology=heat_pump', 'solar_battery');
  assert.equal(technologyHintFromRequest(request), 'solar_battery');
  const route = analysisRequestRoute(request, {});
  assert.equal(route.ok, false);
  assert.equal(route.technology, 'solar_battery');
});

test('unsupported technology cannot silently inherit Heat Pump', () => {
  const request = req('https://homequotecheck.co.uk/api/analyse?technology=boiler');
  const route = analysisRequestRoute(request, {});
  assert.equal(route.ok, false);
  assert.equal(route.status, 400);
  assert.equal(route.error, 'unsupported_or_missing_technology');
});
