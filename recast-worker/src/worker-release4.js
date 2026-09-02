import release3Worker from './worker-release3.js';
import { SEO_PAGES, renderSeoPage, renderSeoIndex } from './seo-pages.js';

function html(body, status = 200) {
  return new Response(body, { status, headers: { 'content-type':'text/html; charset=utf-8', 'cache-control':'public, max-age=300' } });
}

export default {
  async scheduled(controller, env, ctx) {
    return release3Worker.scheduled(controller, env, ctx);
  },
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === 'GET' || request.method === 'HEAD') {
      if (url.pathname === '/seo' || url.pathname === '/seo/') return html(renderSeoIndex());
      const extensionless = url.pathname.match(/^\/seo\/([^/.]+)$/);
      if (extensionless && SEO_PAGES[extensionless[1]]) return Response.redirect(`${url.origin}/seo/${extensionless[1]}.html${url.search}`, 301);
      const match = url.pathname.match(/^\/seo\/([^/]+)\.html$/);
      if (match && SEO_PAGES[match[1]]) return html(renderSeoPage(match[1]));
    }
    return release3Worker.fetch(request, env, ctx);
  }
};
