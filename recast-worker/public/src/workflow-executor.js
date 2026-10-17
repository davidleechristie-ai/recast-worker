import * as Engine from './engine.js';

const MAX_WORKFLOW_STEPS = 16;
const MAX_WORKFLOW_INPUT_BYTES = 64 * 1024;
const SUPPORTED_MODES = new Set([
  'json2csv','csv2json','json2xml','xml2json','flatten','unflatten','json2yaml','yaml2json','json2markdown','markdown2json',
  'transformSelect','transformRemove','transformRename','transformFilter','transformSort','transformConvertType','transformAddField','transformCombine',
  'jsonPath','validateJsonStep','validateXmlStep','sortJson','formatJson'
]);

function clone(v) { return JSON.parse(JSON.stringify(v)); }
function asArray(data) { return Array.isArray(data) ? data : [data]; }
function wrapLike(original, result) { return Array.isArray(original) ? result : (result[0] !== undefined ? result[0] : result); }
function getPath(obj, path) {
  if (!path) return undefined;
  let cur = obj;
  for (const part of String(path).split('.')) { if (cur == null) return undefined; cur = cur[part]; }
  return cur;
}
function setPath(obj, path, value) {
  const parts = String(path).split('.'); let cur = obj;
  for (let i=0;i<parts.length-1;i++) { if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]]={}; cur=cur[parts[i]]; }
  cur[parts[parts.length-1]] = value;
}
function deletePath(obj, path) {
  const parts=String(path).split('.'); let cur=obj;
  for(let i=0;i<parts.length-1;i++){ if(!cur || typeof cur!=='object') return; cur=cur[parts[i]]; }
  if(cur && typeof cur==='object') delete cur[parts[parts.length-1]];
}
function mapRecords(data, fn) { const out=asArray(data).map(fn); return wrapLike(data,out); }
function selectFields(data, paths) { if(!paths?.length)return data; return mapRecords(data, rec=>{const out={}; for(const p of paths){const v=getPath(rec,p); if(v!==undefined)setPath(out,p,v);} return out;}); }
function removeFields(data, paths) { if(!paths?.length)return data; return mapRecords(data, rec=>{const out=clone(rec); for(const p of paths)deletePath(out,p); return out;}); }
function renameField(data, from, to) { if(!from||!to)return data; return mapRecords(data, rec=>{const out=clone(rec); const v=getPath(out,from); deletePath(out,from); if(v!==undefined)out[to]=v; return out;}); }
const FILTERS={equals:(a,b)=>String(a)===String(b),notEquals:(a,b)=>String(a)!==String(b),contains:(a,b)=>String(a??'').includes(String(b)),startsWith:(a,b)=>String(a??'').startsWith(String(b)),endsWith:(a,b)=>String(a??'').endsWith(String(b)),greaterThan:(a,b)=>Number(a)>Number(b),lessThan:(a,b)=>Number(a)<Number(b),exists:a=>a!==undefined,isNull:a=>a==null};
function filterRecords(data,field,condition,value){const fn=FILTERS[condition]; if(!fn||!field)return data; const out=asArray(data).filter(r=>fn(getPath(r,field),value)); return wrapLike(data,out);}
function sortRecords(data,field,direction){if(!field)return data; const out=asArray(data).slice(); const d=direction==='desc'?-1:1; out.sort((a,b)=>{const av=getPath(a,field),bv=getPath(b,field); if(av===undefined)return 1;if(bv===undefined)return-1;if(typeof av==='number'&&typeof bv==='number')return(av-bv)*d;return String(av).localeCompare(String(bv))*d;}); return wrapLike(data,out);}
function convertType(data,field,type){const c={string:v=>v==null?v:String(v),number:v=>{const n=parseFloat(v);return Number.isNaN(n)?null:n;},integer:v=>{const n=parseInt(v,10);return Number.isNaN(n)?null:n;},boolean:v=>{if(typeof v==='boolean')return v;const s=String(v).trim().toLowerCase();if(['true','1','yes'].includes(s))return true;if(['false','0','no',''].includes(s))return false;return!!v;},date:v=>{const d=new Date(v);return Number.isNaN(d.getTime())?null:d.toISOString();}}[type]; if(!c||!field)return data; return mapRecords(data,rec=>{const out=clone(rec);const v=getPath(out,field);if(v!==undefined)setPath(out,field,c(v));return out;});}
function addField(data,field,value){if(!field)return data;return mapRecords(data,rec=>{const out=clone(rec);if(getPath(out,field)===undefined)setPath(out,field,value);return out;});}
function combineFields(data,template,newField){if(!template||!newField)return data;return mapRecords(data,rec=>{const out=clone(rec);out[newField]=template.replace(/\{([^}]+)\}/g,(_,p)=>{const v=getPath(out,p.trim());return v==null?'':String(v);});return out;});}
function jsonPathQuery(obj,path){path=String(path||'').trim();if(!path)throw new Error('Enter a JSONPath expression');if(path.startsWith('$.'))path=path.slice(2);else if(path.startsWith('$'))path=path.slice(1);if(path.startsWith('.'))path=path.slice(1);const parts=[];path.replace(/([^.\[\]]+)|\[(\d+)\]|\[\*\]/g,(_,key,idx)=>{if(key!==undefined)parts.push(key);else if(idx!==undefined)parts.push(Number(idx));else parts.push('*');});let current=[obj];for(const part of parts){const next=[];for(const node of current){if(part==='*'){if(Array.isArray(node))next.push(...node);else if(node&&typeof node==='object')next.push(...Object.values(node));}else if(node!=null&&typeof node==='object')next.push(node[part]);}current=next.filter(v=>v!==undefined);}return current.length===1?current[0]:current;}
function sortKeys(v){if(Array.isArray(v))return v.map(sortKeys);if(v&&typeof v==='object')return Object.keys(v).sort().reduce((o,k)=>(o[k]=sortKeys(v[k]),o),{});return v;}
function xmlLooksValid(text){try{Engine.parseXmlToTree(text);return true;}catch(_){return false;}}

function validateWorkflowDefinition(def) {
  if (!def || typeof def !== 'object') throw new Error('workflow definition is required');
  if (!Array.isArray(def.steps) || !def.steps.length) throw new Error('workflow must contain at least one step');
  if (def.steps.length > MAX_WORKFLOW_STEPS) throw new Error('workflow exceeds '+MAX_WORKFLOW_STEPS+' steps');
  def.steps.forEach((s,i)=>{ if(!s || !SUPPORTED_MODES.has(s.mode)) throw new Error('unsupported workflow step '+(i+1)+': '+(s?.mode||'missing mode')); });
  return true;
}

function runStep(text, step) {
  const p=step.params||{}; let data;
  switch(step.mode){
    case 'json2csv': return Engine.jsonToCsv(JSON.parse(text),p);
    case 'csv2json': return JSON.stringify(Engine.csvToJson(text,p),null,p.pretty===false?0:2);
    case 'json2xml': return Engine.jsonToXml(JSON.parse(text),p.rootName||'root');
    case 'xml2json': return JSON.stringify(Engine.xmlToJson(text),null,p.pretty===false?0:2);
    case 'flatten': return JSON.stringify(Engine.flattenObj(JSON.parse(text)),null,p.pretty===false?0:2);
    case 'unflatten': return JSON.stringify(Engine.unflattenObj(JSON.parse(text)),null,p.pretty===false?0:2);
    case 'json2yaml': return Engine.jsonToYaml(JSON.parse(text));
    case 'yaml2json': return JSON.stringify(Engine.yamlToJson(text),null,p.pretty===false?0:2);
    case 'json2markdown': return Engine.jsonToMarkdownTable(JSON.parse(text));
    case 'markdown2json': return JSON.stringify(Engine.markdownTableToJson(text,p),null,p.pretty===false?0:2);
    case 'transformSelect': data=selectFields(JSON.parse(text),p.paths||[]); break;
    case 'transformRemove': data=removeFields(JSON.parse(text),p.paths||[]); break;
    case 'transformRename': data=renameField(JSON.parse(text),p.from,p.to); break;
    case 'transformFilter': data=filterRecords(JSON.parse(text),p.field,p.condition,p.value); break;
    case 'transformSort': data=sortRecords(JSON.parse(text),p.field,p.direction); break;
    case 'transformConvertType': data=convertType(JSON.parse(text),p.field,p.type); break;
    case 'transformAddField': data=addField(JSON.parse(text),p.field,p.value); break;
    case 'transformCombine': data=combineFields(JSON.parse(text),p.template,p.newField); break;
    case 'jsonPath': data=jsonPathQuery(JSON.parse(text),p.path); break;
    case 'sortJson': data=sortKeys(JSON.parse(text)); break;
    case 'formatJson': data=JSON.parse(text); break;
    case 'validateJsonStep': JSON.parse(text); return text;
    case 'validateXmlStep': if(!xmlLooksValid(text))throw new Error('Invalid XML'); return text;
    default: throw new Error('unsupported workflow step: '+step.mode);
  }
  return JSON.stringify(data,null,p.pretty===false?0:2);
}

function executeWorkflow(def,input){
  validateWorkflowDefinition(def);
  if(typeof input!=='string') throw new Error('input must be a string');
  if(new TextEncoder().encode(input).length>MAX_WORKFLOW_INPUT_BYTES) throw new Error('workflow input exceeds '+MAX_WORKFLOW_INPUT_BYTES+' bytes');
  let current=input; const steps=[];
  for(let i=0;i<def.steps.length;i++){
    const started=Date.now();
    try{current=runStep(current,def.steps[i]);steps.push({index:i,mode:def.steps[i].mode,ok:true,durationMs:Date.now()-started});}
    catch(e){steps.push({index:i,mode:def.steps[i].mode,ok:false,durationMs:Date.now()-started,error:e.message||String(e)});const err=new Error('step '+(i+1)+' ('+def.steps[i].mode+') failed: '+(e.message||String(e)));err.stepResults=steps;throw err;}
  }
  return {output:current,stepResults:steps};
}

export { MAX_WORKFLOW_STEPS, MAX_WORKFLOW_INPUT_BYTES, SUPPORTED_MODES, validateWorkflowDefinition, executeWorkflow };
