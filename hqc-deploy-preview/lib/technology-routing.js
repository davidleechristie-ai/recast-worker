// Technology routing contract for HQC analysis.
// This module is deliberately side-effect free so it can be verified before it is wired
// into the production Worker. Heat Pump keeps the existing upstream. Solar/Battery is
// explicitly blocked until a technology-specific adapter is configured and verified.

export const HQC_TECHNOLOGIES = Object.freeze({
  HEAT_PUMP: 'heat_pump',
  SOLAR_BATTERY: 'solar_battery',
  BATTERY: 'battery',
});

export const HEAT_PUMP_API_BASE = 'https://api-v2.appdeploy.ai/app/heat-pump-second-opinion-v43csv';

export function normaliseTechnology(value, { legacyHeatPumpDefault = false } = {}) {
  if ((value === undefined || value === null || value === '') && legacyHeatPumpDefault) {
    return HQC_TECHNOLOGIES.HEAT_PUMP;
  }
  const normalised = String(value ?? '').trim().toLowerCase().replace(/[- ]/g, '_');
  if (Object.values(HQC_TECHNOLOGIES).includes(normalised)) return normalised;
  return null;
}

export function analysisRouteForTechnology(value, env = {}, options = {}) {
  const technology = normaliseTechnology(value, options);
  if (!technology) {
    return { ok: false, status: 400, error: 'unsupported_or_missing_technology' };
  }

  if (technology === HQC_TECHNOLOGIES.HEAT_PUMP) {
    return { ok: true, technology, apiBase: HEAT_PUMP_API_BASE, adapter: 'heat_pump_legacy' };
  }

  // Non-public correctness gate: never allow Solar/Battery to fall through to the
  // heat-pump upstream. A future verified adapter must be explicitly configured.
  const solarBase = String(env.HQC_SOLAR_ANALYSIS_API_BASE || '').trim();
  if (!solarBase) {
    return { ok: false, status: 409, technology, error: 'technology_analysis_not_ready' };
  }

  return { ok: true, technology, apiBase: solarBase.replace(/\/$/, ''), adapter: 'solar_battery' };
}

export function buildAnalysisTarget(route, pathname, search = '') {
  if (!route?.ok || !route.apiBase) throw new Error('analysis route is not available');
  if (!String(pathname || '').startsWith('/api/')) throw new Error('invalid analysis pathname');
  return `${route.apiBase}${pathname}${search || ''}`;
}
