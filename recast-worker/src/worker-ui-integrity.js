import workerUi from './worker-ui.js';

const DEMO_LAYOUT_FIX = `
<style id="demo-layout-integrity-fix">
  .demo-gallery > .demo-next {
    grid-column: 1 / -1;
    width: 100%;
    min-width: 0;
  }

  .demo-next,
  .demo-next-head,
  .demo-next-grid,
  .demo-next-card {
    min-width: 0;
  }

  .demo-next-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .demo-next-head h2 {
    overflow-wrap: normal;
    word-break: normal;
  }

  @media (max-width: 780px) {
    .demo-next-grid {
      grid-template-columns: 1fr;
    }
  }
</style>`;

function applyIntegrityFix(response, requestUrl) {
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html') || !response.body) return response;

  const url = new URL(requestUrl);
  if (!(url.pathname === '/demo' || url.pathname === '/demo/' || url.pathname === '/demo/index.html')) {
    return response;
  }

  return new HTMLRewriter()
    .on('head', {
      element(element) {
        element.append(DEMO_LAYOUT_FIX, { html: true });
      }
    })
    .transform(response);
}

export default {
  async scheduled(controller, env, ctx) {
    return workerUi.scheduled(controller, env, ctx);
  },

  async fetch(request, env, ctx) {
    const response = await workerUi.fetch(request, env, ctx);
    if (request.method !== 'GET') return response;
    return applyIntegrityFix(response, request.url);
  }
};
