import uiWorker from './worker-ui-integrity.js';

const JSON_FORMATTER_META = {
  title: 'JSON Formatter Online — Beautify & Minify JSON | Recast',
  description: 'Format, beautify or minify JSON online in your browser. Fix readability fast, keep pasted data local, and move repeat transformations into Recast workflows.'
};

const JSON_FORMATTER_LINKS = '<section class="seo-authority-cluster" aria-label="Related JSON tasks"><h2>Related JSON tasks</h2><p>Need to check whether the JSON is valid? <a href="/tools/json-validator.html">Validate JSON</a>. Comparing two payloads instead? <a href="/tools/json-diff.html">Use JSON Diff</a>.</p></section>';

const FLATTEN_JSON_META = {
  title: 'Flatten JSON Online — Nested JSON to Dot Notation | Recast',
  description: 'Flatten nested JSON online into simple dot-notation key paths. Runs in your browser, keeps pasted data local, and connects naturally to CSV and workflow tasks.'
};

const FLATTEN_JSON_LINKS = '<section class="seo-authority-cluster" aria-label="Related flatten JSON tasks"><h2>Related flatten JSON tasks</h2><p>Need the original nested structure back? <a href="/tools/unflatten-json.html">Unflatten JSON</a>. Preparing API data for a spreadsheet? <a href="/tools/json-to-csv.html">Convert JSON to CSV</a>. For a worked explanation, see <a href="/blog/flatten-nested-json.html">how to flatten nested JSON</a>.</p></section>';

function optimiseResponse(response, requestUrl) {
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html') || !response.body) return response;
  const url = new URL(requestUrl);

  if (url.pathname === '/tools/json-formatter.html') {
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

  if (url.pathname === '/tools/flatten-json.html') {
    return new HTMLRewriter()
      .on('title', { element(el) { el.setInnerContent(FLATTEN_JSON_META.title); } })
      .on('meta[name="description"]', { element(el) { el.setAttribute('content', FLATTEN_JSON_META.description); } })
      .on('meta[property="og:title"]', { element(el) { el.setAttribute('content', FLATTEN_JSON_META.title); } })
      .on('meta[property="og:description"]', { element(el) { el.setAttribute('content', FLATTEN_JSON_META.description); } })
      .on('meta[name="twitter:title"]', { element(el) { el.setAttribute('content', FLATTEN_JSON_META.title); } })
      .on('meta[name="twitter:description"]', { element(el) { el.setAttribute('content', FLATTEN_JSON_META.description); } })
      .on('main .hero h1', { element(el) { el.setInnerContent('Flatten JSON Online'); } })
      .on('body', { element(el) { el.append(FLATTEN_JSON_LINKS, { html: true }); } })
      .transform(response);
  }

  return response;
}

export default {
  async scheduled(controller, env, ctx) { return uiWorker.scheduled(controller, env, ctx); },
  async fetch(request, env, ctx) {
    const response = await uiWorker.fetch(request, env, ctx);
    if (request.method !== 'GET') return response;
    return optimiseResponse(response, request.url);
  }
};
