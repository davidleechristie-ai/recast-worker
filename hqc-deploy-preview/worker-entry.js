import legacyWorker from './worker.js';
import { analysisRequestRoute, technologyRouteErrorResponse } from './lib/analysis-request-routing.js';

// Request-level analysis boundary. Existing Heat Pump requests are delegated unchanged.
// Explicit Solar/Battery requests can never fall through to the legacy Heat Pump service.
// They remain non-public and return technology_analysis_not_ready until a verified
// HQC_SOLAR_ANALYSIS_API_BASE is configured.
export default {
  async fetch(request, env, ctx) {
    const incoming = new URL(request.url);
    if (!incoming.pathname.startsWith('/api/')) {
      return legacyWorker.fetch(request, env, ctx);
    }

    // HQC-owned edge endpoints are handled by the existing Worker and are not analysis routes.
    if (
      incoming.pathname === '/api/metrics' ||
      incoming.pathname === '/api/growth-report' ||
      incoming.pathname === '/api/decision-pack/checkout' ||
      incoming.pathname === '/api/decision-pack/status' ||
      incoming.pathname === '/api/stripe/webhook' ||
      incoming.pathname === '/api/event'
    ) {
      return legacyWorker.fetch(request, env, ctx);
    }

    const route = analysisRequestRoute(request, env, incoming);
    if (!route.ok) return technologyRouteErrorResponse(route);

    // Preserve the proven Heat Pump path byte-for-byte at this boundary.
    if (route.technology === 'heat_pump') {
      return legacyWorker.fetch(request, env, ctx);
    }

    // Solar/Battery only reaches here when an explicit, verified adapter base has been
    // configured. Preserve the request body and strip origin/host before proxying.
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
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: outHeaders,
    });
  },
};
