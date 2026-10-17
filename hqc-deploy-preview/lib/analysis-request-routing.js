import { analysisRouteForTechnology, buildAnalysisTarget } from './technology-routing.js';

// Resolve analysis technology without consuming request bodies. This keeps the routing
// boundary safe for PDFs/form-data and lets the Worker preserve the legacy Heat Pump
// journey while Solar/Battery remains explicitly gated.
export function technologyHintFromRequest(request, incomingUrl = new URL(request.url)) {
  const header = request.headers.get('x-hqc-technology');
  const query = incomingUrl.searchParams.get('technology');
  return header || query || null;
}

export function analysisRequestRoute(request, env = {}, incomingUrl = new URL(request.url)) {
  const hint = technologyHintFromRequest(request, incomingUrl);
  const route = analysisRouteForTechnology(hint, env, { legacyHeatPumpDefault: true });
  if (!route.ok) return route;
  return {
    ...route,
    target: buildAnalysisTarget(route, incomingUrl.pathname, incomingUrl.search),
  };
}

export function technologyRouteErrorResponse(route) {
  const status = route?.status || 400;
  return new Response(JSON.stringify({
    error: route?.error || 'technology_routing_failed',
    technology: route?.technology || null,
  }), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
  });
}
