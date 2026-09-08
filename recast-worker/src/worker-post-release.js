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

// Measurement-only instrumentation. Existing product analytics record convert_run and
// recipe_run, but the strategic scorecard needs explicit attempt/success events so
// successful-task and deeper-product rates have valid denominators. This script adds
// those events without changing tool behaviour or sending user content.
const FUNNEL_MEASUREMENT_SCRIPT = `<script id="recast-funnel-measurement">
(function(){
  function emit(name, params){ try { if (typeof gtag === 'function') gtag('event', name, params || {}); } catch (_) {} }
  function mode(){ try { return window.currentMode || document.body.getAttribute('data-tool') || location.pathname; } catch (_) { return location.pathname; } }
  function wire(){
    var convert=document.getElementById('convertBtn');
    var status=document.getElementById('status');
    if(convert && status && !convert.dataset.measurementWired){
      convert.dataset.measurementWired='1';
      convert.addEventListener('click', function(){
        emit('tool_run_attempt',{mode:mode()});
        var settled=false;
        var observer=new MutationObserver(function(){
          if(settled) return;
          var ok=status.querySelector('.status-ok');
          var err=status.querySelector('.status-err');
          if(ok || err){
            settled=true; observer.disconnect();
            if(ok) emit('successful_tool_use',{mode:mode()});
          }
        });
        observer.observe(status,{childList:true,subtree:true,characterData:true});
        setTimeout(function(){ if(!settled) observer.disconnect(); },15000);
      });
    }
    var recipe=document.getElementById('recipeRunBtn');
    var recipeSummary=document.getElementById('recipeSummary');
    if(recipe && recipeSummary && !recipe.dataset.measurementWired){
      recipe.dataset.measurementWired='1';
      recipe.addEventListener('click',function(){
        emit('workflow_start',{surface:'recipe'});
        setTimeout(function(){ if(recipeSummary.querySelector('.status-ok')) emit('workflow_complete',{surface:'recipe'}); },0);
      });
    }
    document.addEventListener('click',function(e){
      var a=e.target && e.target.closest ? e.target.closest('a[href="#pricing"],a[href*="buy.stripe.com"]') : null;
      if(a) emit('upgrade_click',{destination:a.getAttribute('href') || ''});
    },true);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',wire,{once:true}); else wire();
})();
</script>`;

function optimiseResponse(response, requestUrl) {
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html') || !response.body) return response;
  const url = new URL(requestUrl);
  let rewriter = new HTMLRewriter()
    .on('body', { element(el) { el.append(FUNNEL_MEASUREMENT_SCRIPT, { html: true }); } });

  if (url.pathname === '/tools/json-formatter.html') {
    rewriter = rewriter
      .on('title', { element(el) { el.setInnerContent(JSON_FORMATTER_META.title); } })
      .on('meta[name="description"]', { element(el) { el.setAttribute('content', JSON_FORMATTER_META.description); } })
      .on('meta[property="og:title"]', { element(el) { el.setAttribute('content', JSON_FORMATTER_META.title); } })
      .on('meta[property="og:description"]', { element(el) { el.setAttribute('content', JSON_FORMATTER_META.description); } })
      .on('meta[name="twitter:title"]', { element(el) { el.setAttribute('content', JSON_FORMATTER_META.title); } })
      .on('meta[name="twitter:description"]', { element(el) { el.setAttribute('content', JSON_FORMATTER_META.description); } })
      .on('body', { element(el) { el.append(JSON_FORMATTER_LINKS, { html: true }); } });
  }

  if (url.pathname === '/tools/flatten-json.html') {
    rewriter = rewriter
      .on('title', { element(el) { el.setInnerContent(FLATTEN_JSON_META.title); } })
      .on('meta[name="description"]', { element(el) { el.setAttribute('content', FLATTEN_JSON_META.description); } })
      .on('meta[property="og:title"]', { element(el) { el.setAttribute('content', FLATTEN_JSON_META.title); } })
      .on('meta[property="og:description"]', { element(el) { el.setAttribute('content', FLATTEN_JSON_META.description); } })
      .on('meta[name="twitter:title"]', { element(el) { el.setAttribute('content', FLATTEN_JSON_META.title); } })
      .on('meta[name="twitter:description"]', { element(el) { el.setAttribute('content', FLATTEN_JSON_META.description); } })
      .on('main .hero h1', { element(el) { el.setInnerContent('Flatten JSON Online'); } })
      .on('body', { element(el) { el.append(FLATTEN_JSON_LINKS, { html: true }); } });
  }

  return rewriter.transform(response);
}

export default {
  async scheduled(controller, env, ctx) { return uiWorker.scheduled(controller, env, ctx); },
  async fetch(request, env, ctx) {
    const response = await uiWorker.fetch(request, env, ctx);
    if (request.method !== 'GET') return response;
    return optimiseResponse(response, request.url);
  }
};
