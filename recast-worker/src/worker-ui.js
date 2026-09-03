import appWorker from './worker.js';

const UI_LOADER = '<script src="/ui-consistency-loader.js?v=2"></script>';

function applyUiConsistency(response) {
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html') || !response.body) return response;

  return new HTMLRewriter()
    .on('body', {
      element(element) {
        element.append(UI_LOADER, { html: true });
      }
    })
    .transform(response);
}

export default {
  async scheduled(controller, env, ctx) {
    return appWorker.scheduled(controller, env, ctx);
  },

  async fetch(request, env, ctx) {
    const response = await appWorker.fetch(request, env, ctx);
    if (request.method !== 'GET') return response;
    return applyUiConsistency(response);
  }
};
