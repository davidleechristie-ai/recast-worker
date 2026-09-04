import uiWorker from './worker-ui-integrity.js';

const JSON_FORMATTER_META = {
  title: 'JSON Formatter Online — Beautify & Minify JSON | Recast',
  description: 'Format, beautify or minify JSON online in your browser. Fix readability fast, keep pasted data local, and move repeat transformations into Recast workflows.'
};

const JSON_FORMATTER_LINKS = '<section class="seo-authority-cluster" aria-label="Related JSON tasks"><h2>Related JSON tasks</h2><p>Need to check whether the JSON is valid? <a href="/tools/json-validator.html">Validate JSON</a>. Comparing two payloads instead? <a href="/tools/json-diff.html">Use JSON Diff</a>.</p></section>';

function optimiseResponse(response, requestUrl) {
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html') || !response.body) return response;
  const url = new URL(requestUrl);
  if (url.pathname !== '/tools/json-formatter.html') return response;
  return new HTMLRewriter()
    .on('title', { element(el) { el.setInnerContent(JSON_FORMATTER_META.title); } })
    .on('meta[name="description"]', { element(el) { el.setAttribute('content', JSON_FORMATTER_META.description); } })
    .on('meta[property="og:title"]', { element(el) { el.setAttribute('content', JSON_FORMATTER_META.title); } })
    .on('meta[property="og:description"]', { element(el) { el.setAttribute('content', JSON_FORMATTER_META.description); } })
    .on('meta[name="twitter:title"]', { element(el) { el.setAttribute('content', JSON_FORMATTER_META.title); } })
    .on('meta[name="twitter:description"]', { element(el) { el.setAttribute('content', JSON_FORMATTER_META.description); } })
    .on('body', { element(el) { el.append(JSON_FORMATTER_LINKS, { html: true }); } })
    .transform(response);
}

export default {
  async scheduled(controller, env, ctx) { return uiWorker.scheduled(controller, env, ctx); },
  async fetch(request, env, ctx) {
    const response = await uiWorker.fetch(request, env, ctx);
    if (request.method !== 'GET') return response;
    return optimiseResponse(response, request.url);
  }
};
