import release4Worker from './worker-release4.js';

const UI_STYLE = '<link rel="stylesheet" href="/ui-consistency.css?v=2">';
const UI_SCRIPT = '<script src="/ui-consistency.js?v=2" defer></script>';

function applyUi(response) {
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html') || !response.body) return response;
  return new HTMLRewriter()
    .on('head', { element(element) { element.append(UI_STYLE, { html: true }); } })
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
