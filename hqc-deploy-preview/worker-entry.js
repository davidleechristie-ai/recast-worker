import legacyWorker, { HqcMetrics, isQaRequest, recordDurableMetric } from './worker.js';

// Preserve the Durable Object class export used by existing preview deployments.
export { HqcMetrics };
import { analysisRequestRoute, technologyRouteErrorResponse, technologyHintFromRequest } from './lib/analysis-request-routing.js';
import { normaliseTechnology, HQC_TECHNOLOGIES } from './lib/technology-routing.js';
import { handleSolarBatteryAnalysisRequest } from './lib/solar-battery-request-handler.js';
import { handleEvChargepointAnalysisRequest } from './lib/ev-chargepoint-request-handler.js';

function sourceFromRequest(request, incoming) {
  try {
    const ref = new URL(request.headers.get('referer') || '');
    if (ref.origin === incoming.origin) return ref.searchParams.get('src') || ref.searchParams.get('source') || 'direct';
  } catch {}
  return 'direct';
}

async function recordEvPdfCompletion(request, response, env, incoming, headers) {
  if (incoming.pathname !== '/api/analyse' || !response.ok || isQaRequest(request, env.HQC_ENV || 'preview')) return;
  const result = await response.clone().json();
  const provenance = Array.isArray(result.extractionProvenance)
    ? result.extractionProvenance.map(item => item.provenance)
    : [result.extractionProvenance];
  if (!provenance.length || !provenance.every(item => item?.sourceMediaType === 'application/pdf')) return;
  try {
    await recordDurableMetric(env, {
      event: 'ev_pdf_analysis_completed',
      source: sourceFromRequest(request, incoming),
      technology: 'ev_chargepoint',
      quoteCount: provenance.length,
      isTest: false,
    });
  } catch (error) {
    console.error('EV completion metric write failed', error);
    headers.set('x-hqc-metrics-write', 'failed');
  }
}

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
    const evTechnology = hintedTechnology === HQC_TECHNOLOGIES.EV_CHARGEPOINT;
    const evEnabled = String(env.HQC_EV_CHARGEPOINT_ANALYSIS_INTERNAL || '') === '1';
    if (evTechnology && evEnabled) {
      const response = await handleEvChargepointAnalysisRequest(request);
      const headers = new Headers(response.headers);
      headers.set('x-hqc-analysis-technology', hintedTechnology);
      headers.set('x-hqc-analysis-adapter', 'ev_chargepoint_internal');
      await recordEvPdfCompletion(request, response, env, incoming, headers);
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }
    const solarEnabled = String(env.HQC_SOLAR_ANALYSIS_PUBLIC || '') === '1' || String(env.HQC_SOLAR_ANALYSIS_INTERNAL || '') === '1';
    if (solarTechnology && solarEnabled) {
      const response = await handleSolarBatteryAnalysisRequest(request);
      const headers = new Headers(response.headers);
      headers.set('x-hqc-analysis-technology', hintedTechnology);
      headers.set('x-hqc-analysis-adapter', String(env.HQC_SOLAR_ANALYSIS_PUBLIC || '') === '1' ? 'solar_battery' : 'solar_battery_internal');
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
