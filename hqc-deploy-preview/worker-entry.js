import legacyWorker, { HqcMetrics } from './worker.js';

// Preserve the Durable Object class export used by existing preview deployments.
export { HqcMetrics };
import { analysisRequestRoute, technologyRouteErrorResponse, technologyHintFromRequest } from './lib/analysis-request-routing.js';
import { normaliseTechnology, HQC_TECHNOLOGIES } from './lib/technology-routing.js';
import { handleSolarBatteryAnalysisRequest } from './lib/solar-battery-request-handler.js';

export default {
  async fetch(request, env, ctx) {
    const incoming = new URL(request.url);
    if (!incoming.pathname.startsWith('/api/')) return legacyWorker.fetch(request, env, ctx);

    if (
      incoming.pathname === '/api/metrics' ||
      incoming.pathname === '/api/growth-report' ||
      incoming.pathname === '/api/decision-pack/checkout' ||
      incoming.pathname === '/api/decision-pack/status' ||
      incoming.pathname === '/api/stripe/webhook' ||
      incoming.pathname === '/api/event'
    ) return legacyWorker.fetch(request, env, ctx);

    // Non-public internal Solar/Battery boundary. It is deliberately disabled unless an
    // explicit Worker environment gate is set. Public traffic therefore retains the proven
    // 409 isolation behaviour. Heat Pump never enters this branch.
    const hintedTechnology = normaliseTechnology(technologyHintFromRequest(request, incoming));
    const solarTechnology = hintedTechnology === HQC_TECHNOLOGIES.SOLAR_BATTERY || hintedTechnology === HQC_TECHNOLOGIES.BATTERY;
    if (solarTechnology && String(env.HQC_SOLAR_ANALYSIS_INTERNAL || '') === '1') {
      const response = await handleSolarBatteryAnalysisRequest(request);
      const headers = new Headers(response.headers);
      headers.set('x-hqc-analysis-technology', hintedTechnology);
      headers.set('x-hqc-analysis-adapter', 'solar_battery_internal');
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }

    const route = analysisRequestRoute(request, env, incoming);
    if (!route.ok) return technologyRouteErrorResponse(route);
    if (route.technology === 'heat_pump') return legacyWorker.fetch(request, env, ctx);

    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('origin');
    const init = { method: request.method, headers, redirect: 'manual' };
    if (!['GET', 'HEAD'].includes(request.method)) init.body = request.body;
    const response = await fetch(route.target, init);
    const outHeaders = new Headers(response.headers);
    outHeaders.set('x-hqc-analysis-technology', route.technology);
    outHeaders.set('x-hqc-analysis-adapter', route.adapter);
    outHeaders.set('cache-control', 'no-store');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers: outHeaders });
  },
};
