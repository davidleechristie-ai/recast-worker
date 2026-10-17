import assert from 'node:assert/strict';
import test from 'node:test';
import {
  HQC_TECHNOLOGIES,
  HEAT_PUMP_API_BASE,
  normaliseTechnology,
  analysisRouteForTechnology,
  buildAnalysisTarget,
} from '../lib/technology-routing.js';

test('legacy heat-pump requests can preserve current behaviour explicitly', () => {
  assert.equal(normaliseTechnology(undefined, { legacyHeatPumpDefault: true }), HQC_TECHNOLOGIES.HEAT_PUMP);
  const route = analysisRouteForTechnology(undefined, {}, { legacyHeatPumpDefault: true });
  assert.equal(route.ok, true);
  assert.equal(route.apiBase, HEAT_PUMP_API_BASE);
});

test('unknown technology is rejected rather than silently routed', () => {
  assert.deepEqual(analysisRouteForTechnology('boiler'), {
    ok: false,
    status: 400,
    error: 'unsupported_or_missing_technology',
  });
});

test('solar/battery cannot reach heat-pump analysis while adapter is unconfigured', () => {
  for (const technology of ['solar_battery', 'battery']) {
    const route = analysisRouteForTechnology(technology, {});
    assert.equal(route.ok, false);
    assert.equal(route.status, 409);
    assert.equal(route.error, 'technology_analysis_not_ready');
    assert.notEqual(route.apiBase, HEAT_PUMP_API_BASE);
  }
});

test('configured solar adapter is explicit and shared with battery-only', () => {
  const env = { HQC_SOLAR_ANALYSIS_API_BASE: 'https://solar.example.test/' };
  for (const technology of ['solar_battery', 'battery']) {
    const route = analysisRouteForTechnology(technology, env);
    assert.equal(route.ok, true);
    assert.equal(route.apiBase, 'https://solar.example.test');
    assert.equal(route.adapter, 'solar_battery');
    assert.equal(buildAnalysisTarget(route, '/api/analyse', '?case=fixture'), 'https://solar.example.test/api/analyse?case=fixture');
  }
});
