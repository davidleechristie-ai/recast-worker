/*!
 * Recast Workflow Copilot
 * AI-first natural-language intent layer for Recast. The request text is sent
 * to Recast's AI interpretation endpoint; working dataset/input remains local
 * unless the user explicitly uses a hosted API or Automation feature. The
 * deterministic parser remains as a resilient fallback.
 */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const CONVERSIONS = [
    ['json','csv','json2csv','JSON → CSV'], ['csv','json','csv2json','CSV → JSON'],
    ['json','xml','json2xml','JSON → XML'], ['xml','json','xml2json','XML → JSON'],
    ['json','yaml','json2yaml','JSON → YAML'], ['yaml','json','yaml2json','YAML → JSON'],
    ['json','markdown','json2markdown','JSON → Markdown'], ['markdown','json','markdown2json','Markdown → JSON']
  ];

  const DIRECT_TOOLS = [
    { re:/\b(?:generate|create|make|infer)\b.*\bjson\s+schema\b|\b(?:generate|create|make|infer)\b.*\bschema\b.*\bjson\b|\bjson\s+schema\s+generator\b/, label:'JSON Schema Generator', href:'tools/json-schema-generator.html' },
    { re:/\bvalidate\b.*\bjson\b.*\bschema\b|\bvalidate\b.*\bjson\s+schema\b|\bcheck\b.*\bagainst\b.*\bschema\b/, label:'Validate JSON Schema', href:'tools/validate-json-schema.html' },
    { re:/\bjson\b.*\b(?:to|into|as)\s+typescript\b|\btypescript\s+(?:type|interface)\b/, label:'JSON → TypeScript', href:'tools/json-to-typescript.html' },
    { re:/\bjson\b.*\b(?:to|into|as)\s+zod\b|\bzod\s+schema\b/, label:'JSON → Zod', href:'tools/json-to-zod.html' },
    { re:/\bjson\b.*\b(?:to|into|as)\s+pydantic\b|\bpydantic\s+(?:model|class)\b/, label:'JSON → Pydantic', href:'tools/json-to-pydantic.html' },
    { re:/\bjson\b.*\b(?:to|into|as)\s+python\b|\bpython\s+(?:class|dataclass)\b/, label:'JSON → Python', href:'tools/json-to-python.html' },
    { re:/\bjson\b.*\b(?:to|into|as)\s+go\b|\bgo\s+struct\b/, label:'JSON → Go', href:'tools/json-to-go.html' },
    { re:/\bjson\b.*\b(?:to|into|as)\s+swift\b|\bswift\s+struct\b/, label:'JSON → Swift', href:'tools/json-to-swift.html' },
    { re:/\bjson\b.*\b(?:to|into|as)\s+kotlin\b|\bkotlin\s+data\s+class\b/, label:'JSON → Kotlin', href:'tools/json-to-kotlin.html' },
    { re:/\bjson\b.*\b(?:to|into|as)\s+rust\b|\brust\s+struct\b/, label:'JSON → Rust', href:'tools/json-to-rust.html' },
    { re:/\bjson\b.*\b(?:to|into|as)\s+java\b|\bjava\s+(?:class|pojo)\b/, label:'JSON → Java', href:'tools/json-to-java.html' },
    { re:/\bjson\b.*\b(?:to|into|as)\s+c\s*#|\bc\s*#\s+class\b|\bcsharp\b/, label:'JSON → C#', href:'tools/json-to-csharp.html' },
    { re:/\bjson\b.*\b(?:to|into|as)\s+sql\b|\bsql\b.*\bfrom\b.*\bjson\b/, label:'JSON → SQL', href:'tools/json-to-sql.html' },
    { re:/\b(?:minify|compact)\b.*\bjson\b|\bjson\b.*\b(?:minify|compact)\b/, label:'JSON Formatter', href:'tools/json-formatter.html' },
    { re:/\b(?:inspect|explore|browse|understand)\b.*\b(?:json|data|payload|api response)\b/, label:'Data Inspector', href:'index.html#workbench' }
  ];

  function normalise(prompt) {
    return String(prompt || '').toLowerCase().replace(/[’]/g,"'").replace(/\s+/g,' ').trim();
  }

  function findConversion(t) {
    for (const [from,to,mode,label] of CONVERSIONS) {
      if ((new RegExp('\\b'+from+'\\b')).test(t) && (new RegExp('\\b(?:to|into|as|->|→)\\s*'+to+'\\b')).test(t)) return {mode,label};
    }
    if (/\b(json|api\s+(?:response|payload|data)|nested\s+(?:objects?|data|fields?))\b/.test(t) && /\b(?:csv|spreadsheet|excel)\b/.test(t) && /\b(convert|export|download|save|turn|make)\b/.test(t)) return {mode:'json2csv',label:'JSON → CSV'};
    if (/\bflatten\b/.test(t) && /\b(?:convert|export|turn|save)\b.*\b(?:csv|spreadsheet|excel)\b/.test(t)) return {mode:'json2csv',label:'JSON → CSV'};
    return null;
  }

  function findComparison(t) {
    const wantsCompare = /\b(compare|diff|difference|differences|changed|changes|mismatch|mismatches)\b/.test(t) || /\bwhat\s+(?:has\s+)?changed\b/.test(t);
    if (!wantsCompare) return null;
    let format = null;
    if (/\bcsv\b|comma[- ]separated/.test(t)) format = 'csv';
    else if (/\bxml\b/.test(t)) format = 'xml';
    else if (/\bjson\b|\bapi\s+(?:response|responses|payload|payloads)\b/.test(t)) format = 'json';
    if (!format) return null;
    return {format,label:{csv:'CSV comparison',json:'JSON comparison',xml:'XML comparison'}[format]};
  }

  function parseFields(t, verbs) {
    const verbGroup = Array.isArray(verbs) ? verbs.join('|') : verbs;
    const m = t.match(new RegExp('\\b(?:'+verbGroup+')\\b(?:\\s+(?:the|only|fields?|columns?|keys?))?\\s+([^.;]+)', 'i'));
    if (!m) return [];
    let raw = m[1].replace(/\b(?:then|and then|before|after)\b.*$/i,'').trim();
    return raw.split(/\s*(?:,|\band\b)\s*/).map(x => x.trim().replace(/^['"`]|['"`]$/g,'')).filter(x => x && !/^(?:to|into|as|csv|json|xml|yaml)$/i.test(x));
  }

  function directTool(t) {
    for (const tool of DIRECT_TOOLS) if (tool.re.test(t)) return {label:tool.label,href:tool.href};
    return null;
  }

  function filterStep(t) {
    const field = (t.match(/\b(?:where|filter|keep|only)\s+(?:rows?|records?)?\s*(?:where|with)?\s*([a-zA-Z0-9_.$-]+)\s+/) || [])[1];
    if (!field) return null;
    const tail = t.slice(t.indexOf(field) + field.length).trim();
    const patterns = [
      [/^(?:is\s+null|null|is\s+missing|missing)/,'isNull'],
      [/^(?:exists|is\s+present)/,'exists'],
      [/^(?:is\s+not|does\s+not\s+equal|!=)\s+["']?([^"']+?)["']?(?:\s+then|$)/,'notEquals'],
      [/^(?:equals?|is|=)\s+["']?([^"']+?)["']?(?:\s+then|$)/,'equals'],
      [/^contains?\s+["']?([^"']+?)["']?(?:\s+then|$)/,'contains'],
      [/^starts?\s+with\s+["']?([^"']+?)["']?(?:\s+then|$)/,'startsWith'],
      [/^ends?\s+with\s+["']?([^"']+?)["']?(?:\s+then|$)/,'endsWith'],
      [/^(?:>|greater\s+than|more\s+than)\s*["']?([^"']+?)["']?(?:\s+then|$)/,'greaterThan'],
      [/^(?:<|less\s+than|under)\s*["']?([^"']+?)["']?(?:\s+then|$)/,'lessThan']
    ];
    for (const [re,condition] of patterns) {
      const m = tail.match(re); if (m) return {mode:'transformFilter',params:{field,condition,value:m[1] ? m[1].trim() : ''}};
    }
    return null;
  }

  function typeStep(t) {
    const m = t.match(/\b(?:convert|cast|change)\s+(?:the\s+)?(?:field\s+)?([a-zA-Z0-9_.$-]+)\s+(?:to|into|as)\s+(string|number|integer|boolean|date)\b/);
    return m ? {mode:'transformConvertType',params:{field:m[1],type:m[2]}} : null;
  }

  function addFieldStep(t) {
    const m = t.match(/\b(?:add|default|set)\s+(?:a\s+)?(?:field\s+|column\s+)?([a-zA-Z0-9_.$-]+)\s+(?:to|=|as|with(?:\s+value)?)\s*["']?([^"';,.]+)["']?/);
    if (!m || /\b(?:add|set)\s+(?:a\s+)?(?:schedule|webhook|api)/.test(t)) return null;
    return {mode:'transformAddField',params:{field:m[1],value:m[2].trim()}};
  }

  function combineStep(prompt, t) {
    const m = prompt.match(/\b(?:combine|join|merge)\s+(?:fields?\s+)?([a-zA-Z0-9_.$-]+)\s+(?:and|\+)\s+([a-zA-Z0-9_.$-]+)(?:\s+(?:into|as|to)\s+([a-zA-Z0-9_.$-]+))?/i);
    if (!m || /\b(?:files?|datasets?|jsons?|csvs?)\b/i.test(prompt)) return null;
    const newField = m[3] || 'combined';
    return {mode:'transformCombine',params:{template:`{${m[1]}} {${m[2]}}`,newField}};
  }

  function apiRequestStep(prompt, t) {
    const url = (prompt.match(/https:\/\/[^\s"'<>]+/i) || [])[0];
    if (!url || !/\b(fetch|get|call|request|post|put|patch|delete)\b/.test(t)) return null;
    const method = ((t.match(/\b(get|post|put|patch|delete)\b/) || [,'GET'])[1] || 'GET').toUpperCase();
    return {mode:'apiRequestStep',params:{method,url,body:'',authRef:'RECAST_API_KEY'}};
  }

  function build(prompt) {
    const t = normalise(prompt);
    const steps = [];
    const notes = [];
    const conversion = findConversion(t);
    const comparison = findComparison(t);
    let requiresConfiguration = false;

    const apiStep = apiRequestStep(prompt,t); if (apiStep) { steps.push(apiStep); notes.push('API credentials are never inferred from the prompt. Configure authentication in the builder or Automation credential vault.'); requiresConfiguration = true; }

    if (/\bunflatten\b|\bexpand\s+(?:dot|dotted)[ -]?notation\b|\brebuild\s+nested\b/.test(t)) steps.push({mode:'unflatten',params:{}});
    if (!/\bunflatten\b/.test(t) && /\bflatten\b|\bflattened\b|\bnested\s+(?:json|objects?|fields?)\b.*\b(?:flat|csv|columns?)\b/.test(t)) steps.push({mode:'flatten',params:{}});

    const remove = parseFields(t, ['remove','drop','delete','exclude']);
    if (remove.length) steps.push({mode:'transformRemove',params:{paths:remove}});

    const renameMatch = t.match(/\brename\s+(?:the\s+)?(?:field\s+|column\s+|key\s+)?([a-zA-Z0-9_.$-]+)\s+(?:to|as)\s+([a-zA-Z0-9_.$-]+)/);
    if (renameMatch) steps.push({mode:'transformRename',params:{from:renameMatch[1],to:renameMatch[2]}});

    const select = parseFields(t, ['select','keep','retain','pick']);
    if (select.length && !/\b(?:keep|select)\s+(?:rows?|records?)\b/.test(t)) steps.push({mode:'transformSelect',params:{paths:select}});

    const filter = filterStep(t); if (filter) steps.push(filter);
    const type = typeStep(t); if (type) steps.push(type);
    const add = addFieldStep(t); if (add) steps.push(add);
    const combine = combineStep(prompt,t); if (combine) steps.push(combine);

    const pathMatch = prompt.match(/(?:jsonpath|extract(?:\s+(?:using|with))?)\s+(?:at\s+)?[`"']?(\$[A-Za-z0-9_$.[\]*_-]+)[`"']?/i) || prompt.match(/(\$[A-Za-z0-9_$.[\]*_-]+)/);
    if (pathMatch) steps.push({mode:'jsonPath',params:{path:pathMatch[1]}});

    const wantsValidation = /\b(validate|validation|check\s+(?:whether|if)|is\s+this\s+(?:json\s+|xml\s+)?valid)\b/.test(t);
    if (wantsValidation && !/\bschema\b/.test(t)) {
      steps.push({mode:/\bxml\b/.test(t)?'validateXmlStep':'validateJsonStep',params:{}});
    }

    if (/\b(?:sort|order)\s+(?:object\s+)?keys?\b|\balphabeti(?:c|cal|cally)\b.*\bkeys?\b/.test(t)) steps.push({mode:'sortJson',params:{}});
    else if (/\b(sort|order)\b/.test(t)) {
      const sortField = (t.match(/\b(?:by|on)\s+([a-zA-Z0-9_.$-]+)/) || [])[1];
      if (sortField) steps.push({mode:'transformSort',params:{field:sortField,direction:/\b(desc|descending|highest|newest|largest)\b/.test(t)?'desc':'asc'}});
      else { notes.push('I recognised a record sort, but need the field to sort by. Open the builder to choose it.'); steps.push({mode:'transformSort',params:{field:'',direction:/\bdesc/.test(t)?'desc':'asc'}}); requiresConfiguration = true; }
    }

    if (/\b(?:format|pretty[- ]?print|beautify|indent)\b/.test(t) && /\bjson\b/.test(t) && !conversion) steps.push({mode:'formatJson',params:{}});

    if (comparison) {
      steps.push({mode:'compareStep',params:{format:comparison.format,reference:''}});
      notes.push(`Understood as ${comparison.label.toLowerCase()}. Recast returns added, removed and changed differences. Set the first ${comparison.format.toUpperCase()} as the reference; the second is the current input.`);
      requiresConfiguration = true;
    }

    if (conversion && !comparison) steps.push({mode:conversion.mode,params:{}});

    const unique = [];
    const seen = new Set();
    steps.forEach(s => { const key=s.mode+JSON.stringify(s.params||{}); if(!seen.has(key)){seen.add(key);unique.push(s);} });

    let directAction = null;
    if (!unique.length) directAction = directTool(t);
    if (!unique.length && !directAction) {
      directAction = {label:'Choose the closest Recast tool',href:'how-to/choose-a-tool.html',fallback:true};
      notes.push('I do not want to invent a workflow that could alter your data incorrectly. This request is not yet a confident workflow match, so I’ll take you to the closest-tool guide instead of returning an empty result.');
    }

    const automation = /\b(every|daily|weekly|hourly|schedule|scheduled|automate|automation|each morning|each day|each week|without me|recurring)\b/.test(t);
    if (automation && unique.length) notes.push('Automation detected. Test the workflow first; after deployment you can configure its schedule, HTTPS input, credentials and optional webhook delivery.');

    const name = comparison ? comparison.label+' workflow' : conversion ? conversion.label+' workflow' : directAction ? directAction.label : 'Recast workflow';
    return {name,steps:unique,notes,requiresConfiguration,automation,directAction,matched:unique.length>0 || !!directAction};
  }


  async function buildWithAi(prompt) {
    const response = await fetch('/api/copilot/interpret', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({prompt:String(prompt||'').trim()})
    });
    let data={};
    try { data=await response.json(); } catch (_) {}
    if (!response.ok || !data.definition) {
      const err=new Error(data.error || 'AI interpretation unavailable');
      err.code=data.code || 'ai_unavailable';
      throw err;
    }
    return data.definition;
  }

  function render(def) {
    const wrap = $('wcPipeline');
    if (!wrap) return;
    if (!def.steps.length && def.directAction) {
      wrap.innerHTML = `<div class="wc-step"><span class="wc-step-num">→</span><div><strong>${esc(def.directAction.label)}</strong><small>${def.directAction.fallback?'I’ll route this safely rather than guess.':'This request maps to a dedicated Recast tool.'}</small></div></div>`;
      return;
    }
    wrap.innerHTML = def.steps.map((s,i) => {
      const labels = {
        apiRequestStep:'API Request',json2csv:'JSON → CSV',csv2json:'CSV → JSON',json2xml:'JSON → XML',xml2json:'XML → JSON',json2yaml:'JSON → YAML',yaml2json:'YAML → JSON',json2markdown:'JSON → Markdown',markdown2json:'Markdown → JSON',
        flatten:'Flatten nested objects',unflatten:'Unflatten fields',transformRemove:'Remove fields',transformRename:'Rename field',transformSelect:'Select fields',transformFilter:'Filter records',transformSort:'Sort records',sortJson:'Sort object keys',transformConvertType:'Convert field type',transformAddField:'Add / default field',transformCombine:'Combine fields',jsonPath:'Extract with JSONPath',validateJsonStep:'Validate JSON',validateXmlStep:'Validate XML',formatJson:'Format JSON',compareStep:'Compare files → differences'
      };
      const p=s.params||{};
      const detail = p.paths ? p.paths.join(', ') : p.from ? `${p.from} → ${p.to}` : p.path ? p.path : s.mode==='transformFilter'?`${p.field} ${p.condition} ${p.value??''}`:s.mode==='transformSort'?`${p.field||'choose field'} (${p.direction||'asc'})`:s.mode==='transformConvertType'?`${p.field} → ${p.type}`:s.mode==='transformAddField'?`${p.field} = ${p.value}`:s.mode==='transformCombine'?`${p.template} → ${p.newField}`:s.mode==='compareStep'?`${(p.format||'json').toUpperCase()} · reference required`:s.mode==='apiRequestStep'?`${p.method} ${p.url}`:'';
      return `<div class="wc-step"><span class="wc-step-num">${i+1}</span><div><strong>${esc(labels[s.mode]||s.mode)}</strong>${detail?`<small>${esc(detail)}</small>`:''}</div></div>`;
    }).join('<span class="wc-arrow">↓</span>');
  }

  function init() {
    if (!$('wcBuildBtn')) return;
    let definition = null;
    function setButtonState(def) {
      const direct=def.directAction;
      if ($('wcOpenBtn')) {
        $('wcOpenBtn').disabled=false;
        $('wcOpenBtn').textContent=direct ? `Open ${direct.label} →` : 'Open in Workflow Builder →';
      }
      if ($('wcRunBtn')) $('wcRunBtn').disabled=!!direct || !!def.requiresConfiguration;
      if ($('wcSaveBtn')) $('wcSaveBtn').disabled=!!direct || !!def.requiresConfiguration;
      if ($('wcApiBtn')) $('wcApiBtn').style.display=direct?'none':'';
    }
    async function buildNow() {
      const prompt=$('wcPrompt').value.trim();
      if(!prompt){$('wcPrompt').focus();return;}
      const button=$('wcBuildBtn');
      const previous=button?.innerHTML;
      if(button){button.disabled=true;button.textContent='Thinking…';}
      $('wcResult') && ($('wcResult').hidden=true);

      let usedFallback=false;
      try {
        definition=await buildWithAi(prompt);
      } catch (e) {
        // Availability must never become a dead end: the proven local parser
        // remains the fallback if the hosted model is unavailable/rate-limited.
        definition=build(prompt);
        usedFallback=true;
        definition.source='local-fallback';
        definition.notes=definition.notes||[];
        definition.notes.unshift('AI interpretation was unavailable, so Recast used its local intent fallback for this request.');
      } finally {
        if(button){button.disabled=false;button.innerHTML=previous||'Build workflow <span>→</span>';}
      }

      render(definition);
      setButtonState(definition);
      $('wcResultTitle').textContent=definition.directAction?(definition.directAction.fallback?'I can route that safely':'Request understood — use the dedicated tool'):(definition.requiresConfiguration?'Request understood — one detail to configure':'Workflow ready');
      $('wcResultMeta').textContent=(definition.steps.length?definition.steps.length+' step'+(definition.steps.length===1?'':'s'):'direct tool')+(definition.source==='ai'?' · AI':'');
      const privacy = definition.source==='ai'
        ? 'AI interpreted this request. Your working data has not been uploaded.'
        : '';
      $('wcNote').textContent=[...(definition.notes||[]),privacy].filter(Boolean).join(' ') || 'Review the pipeline before saving it.';
      $('wcResult').hidden=false;
      $('wcResult').scrollIntoView({behavior:'smooth',block:'nearest'});
    }
    $('wcBuildBtn').addEventListener('click',buildNow);
    $('wcPrompt').addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter')buildNow();});
    document.querySelectorAll('[data-wc-example]').forEach(b=>b.addEventListener('click',()=>{$('wcPrompt').value=b.getAttribute('data-wc-example');buildNow();}));
    $('wcEditPromptBtn').addEventListener('click',()=>{$('wcResult').hidden=true;$('wcPrompt').focus();});
    $('wcSaveBtn')?.addEventListener('click',()=>{if(!definition||!definition.steps.length||definition.directAction)return;if(window.RecastWorkflowLibrary){const saved=window.RecastWorkflowLibrary.save(definition);if(window.showToastSafe)window.showToastSafe(`Saved workflow "${saved.name}"`);}});
    $('wcOpenBtn').addEventListener('click',()=>{
      if(!definition)return;
      if(definition.directAction){window.location.href=definition.directAction.href;return;}
      if(!definition.steps.length)return;
      if(window.RecastRecipeBuilder2?.openWithDefinition){window.RecastRecipeBuilder2.openWithDefinition(definition);const panel=$('recipeBuilder2Panel');if(panel)panel.scrollIntoView({behavior:'smooth',block:'start'});}
    });
    $('wcRunBtn').addEventListener('click',()=>{if(!definition||!definition.steps.length||definition.directAction||!window.RecastRecipeBuilder2)return;window.RecastRecipeBuilder2.openWithDefinition(definition);const run=$('rb2RunBtn');if(run)setTimeout(()=>run.click(),100);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.RecastWorkflowCopilot={build,buildWithAi};
})();
