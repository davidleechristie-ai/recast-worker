import app from './worker.js';

const SITE = 'https://tryrecast.app';

const TOOL_GROUPS = {
  convert: [
    'json-to-csv','csv-to-json','json-to-xml','xml-to-json','json-to-yaml','yaml-to-json',
    'json-to-markdown','markdown-to-json','json-to-typescript','json-to-zod','json-to-python',
    'json-to-pydantic','json-to-go','json-to-kotlin','json-to-rust','json-to-java','json-to-swift',
    'json-to-csharp','json-to-sql','api-response-to-csv','convert-postman-response-to-csv',
    'json-to-csv-without-python','json-converter-without-uploading'
  ],
  transform: ['flatten-json','unflatten-json'],
  validate: ['json-validator','validate-json-schema','json-formatter'],
  compare: ['json-diff','csv-diff','xml-diff','compare-csv-files-by-id','compare-json-arrays-by-id','compare-api-responses'],
  query: ['jsonpath-tester','json-schema-generator']
};

const PROFILES = {
  'json-to-csv': {
    name: 'JSON to CSV Converter',
    title: 'JSON to CSV Converter — Free Online | Recast',
    description: 'Convert JSON to CSV online in your browser. Flatten nested JSON, choose delimiters and download Excel-ready CSV without uploading your data.',
    lead: 'Convert JSON arrays and API responses into clean, spreadsheet-ready CSV without writing a script.',
    uses: ['Export API data to Excel or Google Sheets','Flatten nested JSON into practical columns','Create reusable JSON-to-CSV workflows']
  },
  'csv-to-json': {
    name: 'CSV to JSON Converter',
    title: 'CSV to JSON Converter — Free Online | Recast',
    description: 'Convert CSV to JSON online in your browser. Turn spreadsheet rows into structured JSON quickly, privately and without signup.',
    lead: 'Turn CSV and spreadsheet exports into clean JSON that is ready for APIs, applications and further transformation.',
    uses: ['Prepare spreadsheet data for an API','Convert exports into structured records','Reuse CSV-to-JSON conversion in a workflow']
  },
  'json-diff': {
    name: 'JSON Diff',
    title: 'JSON Diff — Compare JSON Files Online | Recast',
    description: 'Compare two JSON files online and find added, removed and changed values. Structural comparison runs in your browser.',
    lead: 'Compare JSON structurally so meaningful changes stand out without line-by-line formatting noise.',
    uses: ['Compare API responses between environments','Review configuration changes','Match JSON arrays by identifiers']
  },
  'csv-diff': {
    name: 'CSV Diff',
    title: 'CSV Diff — Compare CSV Files Online | Recast',
    description: 'Compare CSV files online and find row and field changes in your browser. No upload or account required for the free tool.',
    lead: 'Compare CSV datasets and identify real row or field changes without manually checking spreadsheets.',
    uses: ['Compare data exports','Check before-and-after reports','Find changed records quickly']
  },
  'xml-diff': {
    name: 'XML Diff',
    title: 'XML Diff — Compare XML Files Online | Recast',
    description: 'Compare XML files online and identify structural changes in your browser. Fast, private and designed for developer data.',
    lead: 'Compare XML structures and values without relying on noisy text-only diffs.',
    uses: ['Compare XML API responses','Review configuration changes','Check generated XML output']
  },
  'json-formatter': {
    name: 'JSON Formatter',
    title: 'JSON Formatter — Format & Minify JSON Online | Recast',
    description: 'Format, pretty-print or minify JSON online in your browser. Inspect readable JSON without uploading the data.',
    lead: 'Pretty-print messy JSON for inspection or minify it again when you need compact output.',
    uses: ['Format API responses','Inspect minified JSON','Prepare readable JSON for debugging']
  },
  'json-validator': {
    name: 'JSON Validator',
    title: 'JSON Validator — Validate JSON Online | Recast',
    description: 'Validate JSON online and find syntax errors quickly in your browser. No upload and no signup required for the free tool.',
    lead: 'Validate JSON before it reaches an API, pipeline or application and pinpoint malformed input faster.',
    uses: ['Debug invalid API payloads','Check generated JSON','Validate files before processing']
  },
  'jsonpath-tester': {
    name: 'JSONPath Tester',
    title: 'JSONPath Tester — Test JSONPath Online | Recast',
    description: 'Test JSONPath expressions online against real JSON and inspect matched results instantly in your browser.',
    lead: 'Write and test JSONPath expressions against real data until you extract exactly the records and fields you need.',
    uses: ['Extract nested API records','Prototype JSONPath expressions','Build extraction steps for workflows']
  },
  'flatten-json': {
    name: 'Flatten JSON',
    title: 'Flatten JSON Online — Nested JSON to Flat Data | Recast',
    description: 'Flatten nested JSON online into dot-notation fields in your browser. Prepare nested API data for CSV, analysis and workflows.',
    lead: 'Turn deeply nested JSON into flat fields that are easier to export, compare and analyse.',
    uses: ['Prepare nested JSON for CSV','Flatten API responses','Simplify data before validation']
  },
  'unflatten-json': {
    name: 'Unflatten JSON',
    title: 'Unflatten JSON Online — Rebuild Nested JSON | Recast',
    description: 'Unflatten dot-notation JSON online and rebuild nested objects in your browser. Fast, private and script-free.',
    lead: 'Rebuild nested objects from flattened dot-notation keys without manually reconstructing the data structure.',
    uses: ['Reverse flattened exports','Rebuild nested API payloads','Transform flat records into objects']
  },
  'json-schema-generator': {
    name: 'JSON Schema Generator',
    title: 'JSON Schema Generator — Generate Schema from JSON | Recast',
    description: 'Generate JSON Schema from sample JSON online in your browser. Infer structure quickly and use it for validation or type generation.',
    lead: 'Infer a useful JSON Schema from sample data and turn an example payload into something you can validate and build against.',
    uses: ['Document API payloads','Create validation schemas','Generate types from real examples']
  },
  'validate-json-schema': {
    name: 'JSON Schema Validator',
    title: 'JSON Schema Validator — Validate JSON Against Schema | Recast',
    description: 'Validate JSON against JSON Schema online in your browser. Check payload conformance quickly without uploading your data.',
    lead: 'Check whether real JSON conforms to your schema before it reaches production systems.',
    uses: ['Validate API payloads','Test schema changes','Check generated data contracts']
  },
  'api-response-to-csv': {
    name: 'API Response to CSV',
    title: 'API Response to CSV Converter — Free Online | Recast',
    description: 'Convert a JSON API response to CSV online. Extract, flatten and export API data in your browser without writing a one-off script.',
    lead: 'Take a captured JSON API response and turn it into a useful CSV export without maintaining a conversion script.',
    uses: ['Export REST API data','Flatten nested response objects','Create repeatable API-to-CSV workflows']
  },
  'compare-api-responses': {
    name: 'Compare API Responses',
    title: 'Compare API Responses Online | Recast',
    description: 'Compare JSON API responses online and identify structural or value changes between environments, versions or requests.',
    lead: 'Compare API responses structurally to see what actually changed between environments, versions or test runs.',
    uses: ['Compare staging and production','Review API version changes','Spot regressions in response data']
  },
  'compare-csv-files-by-id': {
    name: 'Compare CSV Files by ID',
    title: 'Compare CSV Files by ID Online | Recast',
    description: 'Compare CSV files by ID or key field online and find changed, added and removed records without relying on row order.',
    lead: 'Match CSV records by a stable identifier so row order does not obscure the changes that matter.',
    uses: ['Compare database exports','Match reports by record ID','Find added, removed and changed rows']
  },
  'compare-json-arrays-by-id': {
    name: 'Compare JSON Arrays by ID',
    title: 'Compare JSON Arrays by ID Online | Recast',
    description: 'Compare JSON arrays by ID or key field online. Match objects by identity instead of array position and find real changes.',
    lead: 'Match JSON objects by ID so reordered arrays do not create misleading differences.',
    uses: ['Compare API record arrays','Track entity changes','Ignore harmless array reordering']
  }
};

const RELATED = {
  convert: ['json-to-csv','csv-to-json','json-to-yaml','json-to-xml','flatten-json'],
  transform: ['flatten-json','unflatten-json','jsonpath-tester','json-to-csv','json-formatter'],
  validate: ['json-validator','validate-json-schema','json-formatter','json-schema-generator','json-diff'],
  compare: ['json-diff','csv-diff','xml-diff','compare-api-responses','compare-json-arrays-by-id'],
  query: ['jsonpath-tester','json-schema-generator','flatten-json','json-validator','json-to-typescript']
};

const GUIDES = {
  convert: ['/how-to/convert.html','Conversion guides'],
  transform: ['/how-to/transform.html','Transformation guides'],
  validate: ['/how-to/validate.html','Validation guides'],
  compare: ['/how-to/compare.html','Comparison guides'],
  query: ['/how-to/find-inspect.html','Query and inspection guides']
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function humanise(slug) {
  const acronyms = new Set(['json','csv','xml','yaml','sql','api','id','zod','go']);
  return slug.split('-').map(part => acronyms.has(part) ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function groupFor(slug) {
  for (const [group, slugs] of Object.entries(TOOL_GROUPS)) if (slugs.includes(slug)) return group;
  if (slug.includes('diff') || slug.startsWith('compare-')) return 'compare';
  if (slug.includes('valid') || slug.includes('format')) return 'validate';
  if (slug.includes('flatten')) return 'transform';
  if (slug.includes('path') || slug.includes('schema')) return 'query';
  return 'convert';
}

function profileFor(slug) {
  if (PROFILES[slug]) return {...PROFILES[slug], group: groupFor(slug)};
  const name = humanise(slug);
  const group = groupFor(slug);
  const verb = group === 'compare' ? 'Compare' : group === 'validate' ? 'Validate' : group === 'query' ? 'Inspect' : group === 'transform' ? 'Transform' : 'Convert';
  return {
    name,
    group,
    title: `${name} — Free Online Tool | Recast`,
    description: `${verb} structured data with ${name} in your browser. Fast, private processing with no signup for Recast's free browser tools.`,
    lead: `Use ${name} directly in your browser, then turn the same job into a reusable workflow when it becomes repetitive.`,
    uses: [`Solve a ${name.toLowerCase()} task without a one-off script`,'Keep pasted data in your browser for local tool runs','Reuse the same data operation in a Recast workflow']
  };
}

function toolHref(slug) { return `/tools/${slug}.html`; }

function relatedTools(slug, group) {
  const pool = RELATED[group] || RELATED.convert;
  return pool.filter(item => item !== slug).slice(0, 4).map(item => ({slug:item, name:(PROFILES[item] && PROFILES[item].name) || humanise(item)}));
}

function schemas(slug, profile, canonical) {
  const faq = [
    {
      q: `Does the ${profile.name} upload my data?`,
      a: 'For Recast browser tools, the data you paste is processed in your browser and is not sent to a Recast processing server. Hosted API and automation runs are separate and only happen when you explicitly use those features.'
    },
    {
      q: `Do I need an account to use the ${profile.name}?`,
      a: 'No. You can use the free browser tool without creating an account. Paid plans add higher limits, reusable workflows, automation and API capabilities.'
    },
    {
      q: `Can I automate this ${profile.group === 'compare' ? 'comparison' : 'data task'}?`,
      a: 'Yes. When a task becomes repetitive, you can move it into a Recast workflow and use hosted automation or the API for repeatable execution.'
    }
  ];
  return {
    app: {
      '@context':'https://schema.org','@type':'WebApplication',name:profile.name,url:canonical,
      applicationCategory:'DeveloperApplication',operatingSystem:'Any',browserRequirements:'Requires JavaScript',
      description:profile.description,isAccessibleForFree:true,
      offers:[
        {'@type':'Offer',name:'Free',price:'0',priceCurrency:'GBP'},
        {'@type':'Offer',name:'Pro',price:'9',priceCurrency:'GBP'},
        {'@type':'Offer',name:'Automation',price:'29',priceCurrency:'GBP'},
        {'@type':'Offer',name:'API',price:'29',priceCurrency:'GBP'}
      ]
    },
    crumbs: {
      '@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[
        {'@type':'ListItem',position:1,name:'Home',item:`${SITE}/`},
        {'@type':'ListItem',position:2,name:'Tools',item:`${SITE}/tools/index.html`},
        {'@type':'ListItem',position:3,name:profile.name,item:canonical}
      ]
    },
    faq: {'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.map(x=>({'@type':'Question',name:x.q,acceptedAnswer:{'@type':'Answer',text:x.a}}))},
    faqItems: faq
  };
}

function seoBlock(slug, profile, schemaSet) {
  const related = relatedTools(slug, profile.group);
  const guide = GUIDES[profile.group] || GUIDES.convert;
  const uses = profile.uses.map(x => `<li>${escapeHtml(x)}</li>`).join('');
  const relatedHtml = related.map(x => `<a class="seo2-related-card" href="${toolHref(x.slug)}"><span>${escapeHtml(x.name)}</span><small>Open tool →</small></a>`).join('');
  const faqHtml = schemaSet.faqItems.map(x => `<details><summary>${escapeHtml(x.q)}</summary><p>${escapeHtml(x.a)}</p></details>`).join('');
  return `<section class="seo2-landing" aria-label="About ${escapeHtml(profile.name)}">
    <nav class="seo2-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>›</span><a href="/tools/index.html">Tools</a><span>›</span><span>${escapeHtml(profile.name)}</span></nav>
    <div class="seo2-intro"><span class="seo2-kicker">FREE BROWSER TOOL</span><h2>${escapeHtml(profile.lead)}</h2><p>Start with the tool above for an immediate result. Recast is designed to let you solve the one-off job first, then reuse the same transformation as a workflow or API operation when it becomes part of a regular process.</p></div>
    <div class="seo2-grid">
      <article><h3>How to use it</h3><ol><li>Paste or load the data you want to work with.</li><li>Choose the options that match your output.</li><li>Run the tool, inspect the result and download or copy it.</li></ol></article>
      <article><h3>Common uses</h3><ul>${uses}</ul></article>
    </div>
    <div class="seo2-next"><div><span class="seo2-kicker">WHEN THE JOB REPEATS</span><h3>Turn this tool into part of a workflow.</h3><p>Chain data operations together instead of maintaining another utility script.</p></div><div class="seo2-actions"><a class="seo2-primary" href="/app/#workflowBuilder">Build a workflow</a><a href="/api/index.html">Use the API</a></div></div>
    <div class="seo2-related"><div class="seo2-heading"><h3>Related Recast tools</h3><a href="${guide[0]}">${guide[1]} →</a></div><div class="seo2-related-grid">${relatedHtml}</div></div>
    <div class="seo2-faq"><h3>Frequently asked questions</h3>${faqHtml}</div>
  </section>`;
}

function focusedJourney(slug) {
  const journeys = {
    'jsonpath-tester': `<section class="seo2-landing seo2-focused" aria-label="JSONPath to CSV workflow"><div class="seo2-intro"><span class="seo2-kicker">CONTINUE WITH THE RESULT</span><h2>Extract API records, then export them to CSV.</h2><p>Run a JSONPath expression above. After a successful match, choose <strong>Export matches to CSV</strong>; Recast carries the matched JSON into the converter without another paste or upload.</p></div><div class="seo2-grid"><article><h3>Useful expressions</h3><ul><li><code>$.data[*]</code> — every record in a result envelope</li><li><code>$.orders[?(@.status == "paid")]</code> — filtered records</li><li><code>$.users[*].profile</code> — one nested object per user</li></ul></article><article><h3>When the extraction repeats</h3><p>Preserve the expression in a workflow, add flatten and CSV steps, then choose hosted Automation only when the job must run on a schedule or webhook.</p><a href="/automation/automate-jsonpath-extraction.html">Automate JSONPath extraction →</a></article></div></section>`,
    'json-schema-generator': `<section class="seo2-landing seo2-focused" aria-label="JSON contract workflow"><div class="seo2-intro"><span class="seo2-kicker">FROM SAMPLE TO CONTRACT</span><h2>Generate the schema, validate the payload, then create runtime types.</h2><p>After generating a schema above, choose <strong>Validate with this schema</strong>. Recast carries both the generated Draft-07 schema and your original sample into validation.</p></div><div class="seo2-grid"><article><h3>Continue into code</h3><ul><li><a href="/tools/json-to-typescript.html">Generate TypeScript types</a></li><li><a href="/tools/json-to-zod.html">Generate a Zod runtime schema</a></li><li><a href="/tools/json-to-pydantic.html">Generate Pydantic models</a></li></ul></article><article><h3>Use the right execution path</h3><p>Browser generation and validation stay local. Use the CLI when data must remain inside CI; use the hosted API only when server-side processing is acceptable.</p><a href="/seo/validate-json-schema-api-payload.html">Validate an API contract →</a></article></div></section>`,
    'json-diff': `<section class="seo2-landing seo2-focused" aria-label="ID-aware JSON comparison"><div class="seo2-intro"><span class="seo2-kicker">KEY-AWARE COMPARISON</span><h2>Compare records by identity, not array position.</h2><p>Recast automatically uses a unique ID-like field such as <code>id</code>, <code>uuid</code>, <code>key</code>, <code>slug</code>, <code>code</code> or <code>name</code>. Reordered records therefore do not become a wall of false changes.</p></div><div class="seo2-grid"><article><h3>Reliable matching</h3><p>Use a field that is present and unique in both arrays. Duplicate or missing values are ambiguous, so Recast falls back to positional comparison rather than silently pairing the wrong records.</p></article><article><h3>Recurring snapshots</h3><p>Use the focused API comparison path when comparing environments or scheduled snapshots.</p><a href="/tools/compare-api-responses.html">Compare API responses →</a></article></div></section>`
  };
  return journeys[slug] || '';
}

function jsonScript(value) {
  return `<script type="application/ld+json" data-recast-seo="2">${JSON.stringify(value).replace(/</g,'\\u003c')}</script>`;
}

function enhanceToolHtml(response, slug) {
  const profile = profileFor(slug);
  const canonical = `${SITE}/tools/${slug}.html`;
  const schemaSet = schemas(slug, profile, canonical);
  let rewriter = new HTMLRewriter()
    .on('title', { element(el) { el.setInnerContent(profile.title); } })
    .on('meta[name="description"]', { element(el) { el.setAttribute('content', profile.description); } })
    .on('link[rel="canonical"]', { element(el) { el.setAttribute('href', canonical); } })
    .on('meta[property="og:title"]', { element(el) { el.setAttribute('content', profile.title); } })
    .on('meta[property="og:description"]', { element(el) { el.setAttribute('content', profile.description); } })
    .on('meta[property="og:url"]', { element(el) { el.setAttribute('content', canonical); } })
    .on('meta[name="twitter:title"]', { element(el) { el.setAttribute('content', profile.title); } })
    .on('meta[name="twitter:description"]', { element(el) { el.setAttribute('content', profile.description); } })
    .on('script[type="application/ld+json"]', { element(el) { el.remove(); } })
    .on('section.seo-intent-block', { element(el) { el.remove(); } })
    .on('.seo-intent-links', { element(el) { el.remove(); } })
    .on('head', { element(el) {
      el.append('<link rel="stylesheet" href="/tool-seo.css?v=2">', {html:true});
      el.append(jsonScript(schemaSet.app) + jsonScript(schemaSet.crumbs) + jsonScript(schemaSet.faq), {html:true});
    }})
    .on('main', { element(el) { el.append(seoBlock(slug, profile, schemaSet) + focusedJourney(slug), {html:true}); } });
  return rewriter.transform(response);
}

function noindexApp(response) {
  return new HTMLRewriter()
    .on('meta[name="robots"]', { element(el) { el.setAttribute('content','noindex,follow'); } })
    .on('head', { element(el) {
      el.append('<meta name="robots" content="noindex,follow" data-recast-seo="2"><link rel="canonical" href="https://tryrecast.app/">', {html:true});
    }})
    .transform(response);
}

function isHtml(response) {
  return (response.headers.get('content-type') || '').toLowerCase().includes('text/html');
}

export default {
  async scheduled(controller, env, ctx) {
    return app.scheduled(controller, env, ctx);
  },
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const directoryIndexCanonical = {
      '/index.html': '/',
      '/tools/index.html': '/tools/',
      '/blog/index.html': '/blog/',
      '/how-to/index.html': '/how-to/',
      '/demo/index.html': '/demo/',
      '/api/index.html': '/api/',
      '/automation/index.html': '/automation/'
    }[url.pathname];
    if ((request.method === 'GET' || request.method === 'HEAD') && directoryIndexCanonical) {
      return Response.redirect(`${url.origin}${directoryIndexCanonical}${url.search}`, 301);
    }

    if ((request.method === 'GET' || request.method === 'HEAD') && /^\/tools\/[^/.]+$/.test(url.pathname)) {
      const destination = `${url.origin}${url.pathname}.html${url.search}`;
      return Response.redirect(destination, 301);
    }

    let routedRequest = request;
    if (url.pathname === '/app' || url.pathname === '/app/') {
      const rewritten = new URL(url);
      rewritten.pathname = '/app/index.html';
      routedRequest = new Request(rewritten, request);
    }

    const response = await app.fetch(routedRequest, env, ctx);
    if (!isHtml(response)) return response;

    const effective = new URL(routedRequest.url);
    const toolMatch = effective.pathname.match(/^\/tools\/([^/]+)\.html$/);
    if (toolMatch && toolMatch[1] !== 'index') return enhanceToolHtml(response, toolMatch[1]);
    if (effective.pathname === '/app/index.html') return noindexApp(response);
    return response;
  }
};
