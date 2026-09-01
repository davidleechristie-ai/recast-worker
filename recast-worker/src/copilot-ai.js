
const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = 'gpt-5.6-luna';
const MAX_PROMPT_CHARS = 1200;
const AI_TIMEOUT_MS = 12000;
const RATE_LIMIT_PER_HOUR = 30;

const WORKFLOW_MODES = new Set([
  'apiRequestStep',
  'json2csv','csv2json','json2xml','xml2json','json2yaml','yaml2json','json2markdown','markdown2json',
  'flatten','unflatten',
  'transformRemove','transformRename','transformSelect','transformFilter','transformSort',
  'transformConvertType','transformAddField','transformCombine',
  'jsonPath','validateJsonStep','validateXmlStep','formatJson','sortJson','compareStep'
]);

const DIRECT_TOOLS = new Map([
  ['json-schema-generator','/tools/json-schema-generator.html'],
  ['validate-json-schema','/tools/validate-json-schema.html'],
  ['json-to-typescript','/tools/json-to-typescript.html'],
  ['json-to-zod','/tools/json-to-zod.html'],
  ['json-to-pydantic','/tools/json-to-pydantic.html'],
  ['json-to-python','/tools/json-to-python.html'],
  ['json-to-go','/tools/json-to-go.html'],
  ['json-to-swift','/tools/json-to-swift.html'],
  ['json-to-kotlin','/tools/json-to-kotlin.html'],
  ['json-to-rust','/tools/json-to-rust.html'],
  ['json-to-java','/tools/json-to-java.html'],
  ['json-to-csharp','/tools/json-to-csharp.html'],
  ['json-to-sql','/tools/json-to-sql.html'],
  ['json-formatter','/tools/json-formatter.html'],
  ['json-validator','/tools/json-validator.html'],
  ['jsonpath-tester','/tools/jsonpath-tester.html'],
  ['csv-diff','/tools/csv-diff.html'],
  ['json-diff','/tools/json-diff.html'],
  ['xml-diff','/tools/xml-diff.html'],
  ['compare-csv-files-by-id','/tools/compare-csv-files-by-id.html'],
  ['compare-json-arrays-by-id','/tools/compare-json-arrays-by-id.html'],
  ['api-response-to-csv','/tools/api-response-to-csv.html'],
  ['compare-api-responses','/tools/compare-api-responses.html'],
  ['flatten-json','/tools/flatten-json.html'],
  ['unflatten-json','/tools/unflatten-json.html'],
  ['tools','/tools/index.html']
]);

const STEP_PARAM_RULES = {
  apiRequestStep: p => ({ method: ['GET','POST','PUT','PATCH','DELETE'].includes(String(p.method||'GET').toUpperCase()) ? String(p.method||'GET').toUpperCase() : 'GET', url: String(p.url||'').slice(0,500) }),
  json2csv: () => ({}), csv2json: () => ({}), json2xml: () => ({}), xml2json: () => ({}),
  json2yaml: () => ({}), yaml2json: () => ({}), json2markdown: () => ({}), markdown2json: () => ({}),
  flatten: () => ({}), unflatten: () => ({}), validateJsonStep: () => ({}), validateXmlStep: () => ({}),
  formatJson: () => ({}), sortJson: () => ({}),
  transformRemove: p => ({ paths: safeStrings(p.paths, 20) }),
  transformSelect: p => ({ paths: safeStrings(p.paths, 20) }),
  transformRename: p => ({ from: safeField(p.from), to: safeField(p.to) }),
  transformFilter: p => ({ field: safeField(p.field), condition: safeEnum(p.condition,['equals','notEquals','contains','startsWith','endsWith','greaterThan','lessThan','exists','isNull'],'equals'), value: primitive(p.value) }),
  transformSort: p => ({ field: safeField(p.field), direction: safeEnum(p.direction,['asc','desc'],'asc') }),
  transformConvertType: p => ({ field: safeField(p.field), type: safeEnum(p.type,['string','number','integer','boolean','date'],'string') }),
  transformAddField: p => ({ field: safeField(p.field), value: primitive(p.value) }),
  transformCombine: p => ({ template: String(p.template||'').slice(0,300), newField: safeField(p.newField) }),
  jsonPath: p => ({ path: String(p.path||'$').slice(0,500) }),
  compareStep: p => ({ format: safeEnum(p.format,['json','csv','xml'],'json'), differencesOnly: p.differencesOnly !== false })
};

function safeStrings(v,max){ return Array.isArray(v) ? v.map(x=>String(x).trim().slice(0,120)).filter(Boolean).slice(0,max) : []; }
function safeField(v){ return String(v||'').trim().slice(0,120); }
function safeEnum(v,allowed,fallback){ v=String(v||''); return allowed.includes(v)?v:fallback; }
function primitive(v){ return ['string','number','boolean'].includes(typeof v) || v === null ? v : String(v ?? '').slice(0,300); }

function normaliseAiDefinition(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('AI returned no workflow');
  const steps = [];
  for (const item of Array.isArray(raw.steps) ? raw.steps.slice(0,16) : []) {
    if (!item || !WORKFLOW_MODES.has(item.mode)) continue;
    const clean = STEP_PARAM_RULES[item.mode](item.params || {});
    // Drop incomplete steps instead of inventing fields.
    if (item.mode === 'transformRename' && (!clean.from || !clean.to)) continue;
    if (['transformFilter','transformSort','transformConvertType','transformAddField'].includes(item.mode) && !clean.field) continue;
    if (item.mode === 'transformCombine' && (!clean.template || !clean.newField)) continue;
    if (item.mode === 'apiRequestStep' && !/^https:\/\//i.test(clean.url)) continue;
    steps.push({ mode:item.mode, params:clean });
  }

  let directAction = null;
  if (raw.directTool && typeof raw.directTool === 'object') {
    const slug = String(raw.directTool.slug || '');
    const href = DIRECT_TOOLS.get(slug);
    if (href) directAction = { label:String(raw.directTool.label || slug).slice(0,80), href };
  }

  // Never return a nil outcome.
  if (!steps.length && !directAction) {
    directAction = { label:'See all Recast tools', href:'/tools/index.html', fallback:true };
  }

  const requiresConfiguration = Boolean(raw.requiresConfiguration) ||
    steps.some(s => s.mode === 'compareStep' || (s.mode === 'apiRequestStep' && !s.params.url));
  return {
    name: String(raw.name || (directAction ? directAction.label : 'Recast workflow')).slice(0,120),
    steps,
    notes: safeStrings(raw.notes, 5),
    requiresConfiguration,
    automation: Boolean(raw.automation),
    directAction,
    matched: true,
    source: 'ai'
  };
}

function schema() {
  return {
    type:'object',
    additionalProperties:false,
    required:['name','steps','notes','requiresConfiguration','automation','directTool'],
    properties:{
      name:{type:'string'},
      steps:{type:'array',maxItems:16,items:{
        type:'object',additionalProperties:false,required:['mode','params'],
        properties:{
          mode:{type:'string',enum:[...WORKFLOW_MODES]},
          params:{type:'object',additionalProperties:true}
        }
      }},
      notes:{type:'array',maxItems:5,items:{type:'string'}},
      requiresConfiguration:{type:'boolean'},
      automation:{type:'boolean'},
      directTool:{
        anyOf:[
          {type:'null'},
          {type:'object',additionalProperties:false,required:['slug','label'],properties:{
            slug:{type:'string',enum:[...DIRECT_TOOLS.keys()]},
            label:{type:'string'}
          }}
        ]
      }
    }
  };
}

const SYSTEM_INSTRUCTIONS = `
You are Recast Workflow Copilot. Translate a user's plain-English data job into the smallest accurate Recast workflow or a dedicated Recast tool.

Rules:
- Understand intent semantically. Do not depend on exact keywords.
- Never invent unsupported operations.
- Prefer workflow steps when Recast can execute the operation as a repeatable pipeline.
- Use directTool when the request is better served by a dedicated tool page, especially schema/code generation.
- For comparisons, use compareStep and set format to json/csv/xml. Mark requiresConfiguration true because a second/reference input is needed.
- For API responses described as JSON, treat them as JSON unless the user says otherwise.
- For scheduled/recurring language, set automation true; only add steps for the data operation itself.
- If a requested field/path/value is not stated, do not fabricate it. Mark requiresConfiguration true and explain the missing detail in notes.
- Preserve operation order implied by words such as then, after, before.
- Supported workflow modes and expected params:
  apiRequestStep {method,url}; json2csv {}; csv2json {}; json2xml {}; xml2json {}; json2yaml {}; yaml2json {}; json2markdown {}; markdown2json {};
  flatten {}; unflatten {}; transformRemove {paths}; transformRename {from,to}; transformSelect {paths};
  transformFilter {field,condition,value}; transformSort {field,direction}; transformConvertType {field,type};
  transformAddField {field,value}; transformCombine {template,newField}; jsonPath {path};
  validateJsonStep {}; validateXmlStep {}; formatJson {}; sortJson {}; compareStep {format,differencesOnly}.
- Direct-tool slugs are limited to those in the response schema.
- Return only the structured response.
`;

function extractOutputText(data) {
  if (typeof data?.output_text === 'string') return data.output_text;
  for (const item of data?.output || []) {
    for (const c of item?.content || []) {
      if (typeof c?.text === 'string') return c.text;
    }
  }
  return '';
}

async function rateLimit(request, env) {
  if (!env.ENTITLEMENTS) return { ok:true };
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const bucket = Math.floor(Date.now() / 3600000);
  const key = `copilot-rate:${ip}:${bucket}`;
  let count = Number(await env.ENTITLEMENTS.get(key) || 0);
  if (count >= RATE_LIMIT_PER_HOUR) return { ok:false, retryAfter:3600 };
  await env.ENTITLEMENTS.put(key, String(count+1), { expirationTtl: 7200 });
  return { ok:true };
}

async function interpretWithAi(prompt, env, deps={}) {
  prompt = String(prompt || '').trim();
  if (!prompt) throw Object.assign(new Error('prompt is required'),{status:400});
  if (prompt.length > MAX_PROMPT_CHARS) throw Object.assign(new Error(`prompt must be ${MAX_PROMPT_CHARS} characters or fewer`),{status:400});

  const key = await (deps.resolveSecret || (async x => typeof x === 'string' ? x : x?.get ? x.get() : x))(env.OPENAI_API_KEY);
  if (!key) throw Object.assign(new Error('AI Copilot is not configured'),{status:503,code:'ai_not_configured'});

  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), AI_TIMEOUT_MS);
  const fetchImpl = deps.fetch || fetch;
  try {
    const response = await fetchImpl(OPENAI_RESPONSES_URL,{
      method:'POST',
      signal:controller.signal,
      headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'},
      body:JSON.stringify({
        model: env.OPENAI_MODEL || DEFAULT_MODEL,
        instructions:SYSTEM_INSTRUCTIONS,
        input:prompt,
        max_output_tokens:1200,
        reasoning:{effort:'low'},
        text:{format:{type:'json_schema',name:'recast_workflow_intent',strict:true,schema:schema()}}
      })
    });
    const data = await response.json().catch(()=>({}));
    if (!response.ok) {
      const message = data?.error?.message || `AI provider returned ${response.status}`;
      throw Object.assign(new Error(message),{status:502,code:'ai_provider_error'});
    }
    const text = extractOutputText(data);
    if (!text) throw Object.assign(new Error('AI returned an empty response'),{status:502,code:'ai_empty'});
    let parsed;
    try { parsed=JSON.parse(text); } catch (_) { throw Object.assign(new Error('AI returned invalid structured output'),{status:502,code:'ai_invalid_json'}); }
    return normaliseAiDefinition(parsed);
  } catch (e) {
    if (e?.name === 'AbortError') throw Object.assign(new Error('AI request timed out'),{status:504,code:'ai_timeout'});
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export {
  DEFAULT_MODEL, MAX_PROMPT_CHARS, RATE_LIMIT_PER_HOUR, WORKFLOW_MODES, DIRECT_TOOLS,
  normaliseAiDefinition, interpretWithAi, rateLimit, extractOutputText, schema
};
