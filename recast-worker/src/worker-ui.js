import release4Worker from './worker-release4.js';

const UI_STYLE = '<script>(function(){try{var t=localStorage.getItem("recast_theme");if(t==="light")document.documentElement.setAttribute("data-theme","light");else document.documentElement.removeAttribute("data-theme")}catch(e){document.documentElement.removeAttribute("data-theme")}})();</script><link rel="icon" type="image/png" sizes="64x64" href="/assets/brand/recast-favicon-64.png"><link rel="apple-touch-icon" href="/icons/icon-192.png"><link rel="manifest" href="/manifest.json"><meta name="theme-color" content="#0A0E1F"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><link rel="stylesheet" href="/ui-consistency.css?v=14"><link rel="stylesheet" href="/pwa.css?v=2">';
const UI_SCRIPT = '<script src="/ui-consistency.js?v=14" defer></script><script src="/pwa.js?v=2" defer></script>';
const TOOLS_HUB_URL = 'https://tryrecast.app/tools/';

function applyUi(response, requestUrl) {
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html') || !response.body) return response;

  const url = new URL(requestUrl);
  const isToolsHub = url.pathname === '/tools/' || url.pathname === '/tools/index.html';
  const rewriter = new HTMLRewriter()
    .on('head', { element(element) { element.append(UI_STYLE, { html: true }); } })
    .on('script[src]', { element(element) {
      const src = element.getAttribute('src') || '';
      if (src === 'app.js' || src.endsWith('/app.js')) element.setAttribute('src', '/app.js?v=88');
    } })
    .on('body', { element(element) { element.append(UI_SCRIPT, { html: true }); } });

  if (isToolsHub) {
    rewriter
      .on('link[rel="canonical"]', { element(element) { element.setAttribute('href', TOOLS_HUB_URL); } })
      .on('meta[property="og:url"]', { element(element) { element.setAttribute('content', TOOLS_HUB_URL); } });
  }

  return rewriter.transform(response);
}

export default {
  async scheduled(controller, env, ctx) {
    return release4Worker.scheduled(controller, env, ctx);
  },
  async fetch(request, env, ctx) {
    const response = await release4Worker.fetch(request, env, ctx);
    if (request.method !== 'GET') return response;
    return applyUi(response, request.url);
  }
};
