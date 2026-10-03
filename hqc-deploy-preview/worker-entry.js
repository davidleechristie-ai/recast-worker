import legacyWorker, { HqcMetrics, isQaRequest, recordDurableMetric } from './worker.js';

// Preserve the Durable Object class export used by existing preview deployments.
export { HqcMetrics };
import { analysisRequestRoute, technologyRouteErrorResponse, technologyHintFromRequest } from './lib/analysis-request-routing.js';
import { normaliseTechnology, HQC_TECHNOLOGIES } from './lib/technology-routing.js';
import { handleSolarBatteryAnalysisRequest } from './lib/solar-battery-request-handler.js';
import { handleEvChargepointAnalysisRequest } from './lib/ev-chargepoint-request-handler.js';
import { handleSolarThermalAnalysisRequest } from './lib/solar-thermal-request-handler.js';

const EDGE_FUNNEL_EVENTS = new Set([
  'intake_picker_opened',
  'intake_file_selected',
  'intake_manual_opened',
  'single_quote_start_clicked',
  'comparison_start_clicked',
  'results_summary_viewed',
  'commercial_next_step_viewed',
  'alternative_quote_intent',
  'upload_handoff_started',
  'analysis_ready_after_upload',
  'analysis_auto_started',
  'analysis_error_visible',
  'results_visible',
  'installer_alternative_interest',
]);

function sourceFromRequest(request, incoming) {
  try {
    const ref = new URL(request.headers.get('referer') || '');
    if (ref.origin === incoming.origin) return ref.searchParams.get('src') || ref.searchParams.get('source') || 'direct';
  } catch {}
  return 'direct';
}

async function recordEdgeFunnelEvent(request, env, incoming) {
  if (incoming.pathname !== '/api/event' || request.method !== 'POST') return null;
  let payload;
  try { payload = await request.clone().json(); } catch { return null; }
  if (!EDGE_FUNNEL_EVENTS.has(String(payload?.event || ''))) return null;
  const isTest = isQaRequest(request, env.HQC_ENV || 'preview') || payload.isTest === true;
  if (!isTest) {
    try {
      await recordDurableMetric(env, {
        event: String(payload.event),
        source: String(payload.source || sourceFromRequest(request, incoming) || 'direct'),
        technology: String(payload.technology || 'heat_pump'),
        isTest: false,
      });
    } catch (error) {
      console.error('edge funnel metric write failed', error);
      return new Response(JSON.stringify({ error: 'metrics_unavailable' }), { status: 503, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
    }
  }
  return new Response(JSON.stringify({ recorded: !isTest, test: isTest }), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-hqc-cloudflare-edge': env.HQC_ENV || 'preview' },
  });
}

async function recordPdfCompletion(request, response, env, incoming, headers, technology, event) {
  if (incoming.pathname !== '/api/analyse' || !response.ok || isQaRequest(request, env.HQC_ENV || 'preview')) return;
  const result = await response.clone().json();
  const provenance = Array.isArray(result.extractionProvenance)
    ? result.extractionProvenance.map(item => item.provenance)
    : [result.extractionProvenance];
  if (!provenance.length || !provenance.every(item => item?.sourceMediaType === 'application/pdf')) return;
  try {
    await recordDurableMetric(env, {
      event,
      source: sourceFromRequest(request, incoming),
      technology,
      quoteCount: provenance.length,
      isTest: false,
    });
  } catch (error) {
    console.error('PDF completion metric write failed', error);
    headers.set('x-hqc-metrics-write', 'failed');
  }
}

export default {
  async fetch(request, env, ctx) {
    const incoming = new URL(request.url);
    if (!incoming.pathname.startsWith('/api/')) return legacyWorker.fetch(request, env, ctx);

    if (incoming.pathname === '/api/event' && request.method === 'POST') {
      const edgeResponse = await recordEdgeFunnelEvent(request, env, incoming);
      if (edgeResponse) return edgeResponse;
      return legacyWorker.fetch(request, env, ctx);
    }

    if (
      incoming.pathname === '/api/metrics' ||
      incoming.pathname === '/api/growth-report' ||
      incoming.pathname === '/api/decision-pack/checkout' ||
      incoming.pathname === '/api/decision-pack/status' ||
      incoming.pathname === '/api/stripe/webhook'
    ) return legacyWorker.fetch(request, env, ctx);

    // Non-public internal Solar/Battery boundary. It is deliberately disabled unless an
    // explicit Worker environment gate is set. Public traffic therefore retains the proven
    // 409 isolation behaviour. Heat Pump never enters this branch.
    const hintedTechnology = normaliseTechnology(technologyHintFromRequest(request, incoming));
    const solarTechnology = hintedTechnology === HQC_TECHNOLOGIES.SOLAR_BATTERY || hintedTechnology === HQC_TECHNOLOGIES.BATTERY;
    const evTechnology = hintedTechnology === HQC_TECHNOLOGIES.EV_CHARGEPOINT;
    if (hintedTechnology === HQC_TECHNOLOGIES.SOLAR_THERMAL && String(env.HQC_SOLAR_THERMAL_ANALYSIS_INTERNAL || '') === '1') {
      const response = await handleSolarThermalAnalysisRequest(request);
      const headers = new Headers(response.headers);
      headers.set('x-hqc-analysis-technology', hintedTechnology);
      headers.set('x-hqc-analysis-adapter', 'solar_thermal_internal');
      await recordPdfCompletion(request, response, env, incoming, headers, 'solar_thermal', 'solar_thermal_pdf_analysis_completed');
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }
    const evPublic = String(env.HQC_EV_CHARGEPOINT_ANALYSIS_PUBLIC || '') === '1';
    const evEnabled = evPublic || String(env.HQC_EV_CHARGEPOINT_ANALYSIS_INTERNAL || '') === '1';
    if (evTechnology && evEnabled) {
      const response = await handleEvChargepointAnalysisRequest(request);
      const headers = new Headers(response.headers);
      headers.set('x-hqc-analysis-technology', hintedTechnology);
      headers.set('x-hqc-analysis-adapter', evPublic ? 'ev_chargepoint' : 'ev_chargepoint_internal');
      await recordPdfCompletion(request, response, env, incoming, headers, 'ev_chargepoint', 'ev_pdf_analysis_completed');
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
