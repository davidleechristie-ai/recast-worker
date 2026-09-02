import seoWorker from './worker-seo.js';

function isHtml(response) {
  return (response.headers.get('content-type') || '').toLowerCase().includes('text/html');
}

function shouldInject(pathname) {
  return /^\/tools\/[^/]+\.html$/.test(pathname) || pathname === '/app' || pathname === '/app/' || pathname === '/app/index.html';
}

function injectRelease3Journey(response) {
  return new HTMLRewriter()
    .on('body', {
      element(el) {
        el.append('<script src="/release3-tool-workflow.js?v=1"></script>', { html: true });
      }
    })
    .transform(response);
}

export default {
  async scheduled(controller, env, ctx) {
    return seoWorker.scheduled(controller, env, ctx);
  },

  async fetch(request, env, ctx) {
    const response = await seoWorker.fetch(request, env, ctx);
    if (!isHtml(response)) return response;
    const pathname = new URL(request.url).pathname;
    if (!shouldInject(pathname)) return response;
    return injectRelease3Journey(response);
  }
};
