import release4Worker from './worker-release4.js';

const UI_STYLE = '<link rel="icon" type="image/png" sizes="64x64" href="/assets/brand/recast-favicon-64.png"><link rel="apple-touch-icon" href="/icons/icon-192.png"><link rel="stylesheet" href="/ui-consistency.css?v=6">';
const UI_SCRIPT = '<script src="/ui-consistency.js?v=6" defer></script>';

function applyUi(response) {
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html') || !response.body) return response;
  return new HTMLRewriter()
    .on('head', { element(element) { element.append(UI_STYLE, { html: true }); } })
    .on('script[src]', { element(element) {
      const src = element.getAttribute('src') || '';
      if (src === 'app.js' || src.endsWith('/app.js')) element.setAttribute('src', '/app.js?v=87');
    } })
    .on('body', { element(element) { element.append(UI_SCRIPT, { html: true }); } })
    .transform(response);
}

export default {
  async scheduled(controller, env, ctx) {
    return release4Worker.scheduled(controller, env, ctx);
  },
  async fetch(request, env, ctx) {
    const response = await release4Worker.fetch(request, env, ctx);
    if (request.method !== 'GET') return response;
    return applyUi(response);
  }
};
