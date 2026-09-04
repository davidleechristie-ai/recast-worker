import workerUi from './worker-ui.js';

const GLOBAL_UI_CLEANUP = `
<style id="global-ui-cleanup">
  /* Dedicated pages should keep the selected workbench/tool dominant.
     Legacy API live-example/playground panels are intentionally hidden site-wide. */
  .api-playground {
    display: none !important;
  }
</style>`;

const WORKFLOW_USABILITY_ASSETS = '<link rel="stylesheet" href="/workflow-usability.css?v=1"><script src="/workflow-usability.js?v=1" defer></script>';
const WORKFLOW_DOCS_SYNC_ASSET = '<script src="/workflow-docs-sync.js?v=1" defer></script>';

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
  const isDemo = url.pathname === '/demo' || url.pathname === '/demo/' || url.pathname === '/demo/index.html';
  const isWorkflowDocs = url.pathname === '/how-to/' || url.pathname === '/how-to/index.html' || url.pathname === '/how-to/automate.html' || url.pathname === '/demo/' || url.pathname === '/demo/index.html' || url.pathname === '/demo/workflows.html';

  return new HTMLRewriter()
    .on('head', {
      element(element) {
        element.append(GLOBAL_UI_CLEANUP, { html: true });
        element.append(WORKFLOW_USABILITY_ASSETS, { html: true });
        if (isWorkflowDocs) element.append(WORKFLOW_DOCS_SYNC_ASSET, { html: true });
        if (isDemo) element.append(DEMO_LAYOUT_FIX, { html: true });
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