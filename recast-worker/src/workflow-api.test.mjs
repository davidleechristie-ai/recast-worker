import assert from 'node:assert/strict';
import * as W from './worker.js';
import * as E from './entitlements.js';

function makeKV(){
  const store=new Map();
  return {
    async get(k){return store.has(k)?store.get(k):null;},
    async put(k,v){store.set(k,v);},
    async delete(k){store.delete(k);},
    async list(opts={}){const keys=[...store.keys()].filter(k=>!opts.prefix||k.startsWith(opts.prefix)).sort().slice(0,opts.limit||1000).map(name=>({name}));return {keys,list_complete:true};}
  };
}
function req(path,token,method='GET',body){return new Request('https://tryrecast.app'+path,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});}
const kv=makeKV();
const token=await E.issueToken(kv,'cus_workflow','api_monthly','active');
const env={ENTITLEMENTS:kv};

let r=await W.route(req('/v1/workflows',token,'POST',{workflow:{name:'Export',steps:[{mode:'transformRemove',params:{paths:['secret']}},{mode:'json2csv',params:{}}]}}),env,W.defaultDeps);
assert.equal(r.status,201); const created=await r.json(); const id=created.workflow.id; assert.ok(id.startsWith('wf_'));

r=await W.route(req('/v1/workflows/'+id+'/run',token,'POST',{input:JSON.stringify([{name:'Ada',secret:'x'}])}),env,W.defaultDeps);
assert.equal(r.status,200); const run=await r.json(); assert.match(run.output,/name/); assert.doesNotMatch(run.output,/secret/);

r=await W.route(req('/v1/workflows/'+id+'/automation',token,'POST',{enabled:true,cadence:'daily',input:'[{"name":"Ada"}]'}),env,W.defaultDeps);
assert.equal(r.status,403);
await E.setCustomerStatus(kv,'cus_workflow','automation_monthly','active');
r=await W.route(req('/v1/workflows/'+id+'/automation',token,'POST',{enabled:true,cadence:'daily',input:'[{"name":"Ada"}]'}),env,W.defaultDeps);
assert.equal(r.status,200); const auto=await r.json(); assert.equal(auto.automation.enabled,true); assert.ok(auto.automation.nextRunAt>Date.now());
r=await W.route(req('/v1/workflows/usage',token),env,W.defaultDeps);
assert.equal(r.status,200); const usage=await r.json(); assert.equal(usage.automation.enabled,true); assert.equal(usage.automation.runs_limit,1000); assert.equal(usage.automation.active_limit,10);


r=await W.route(req('/v1/workflows/'+id+'/automation',token,'POST',{
  enabled:true,cadence:'daily',inputMode:'http',inputUrl:'https://example.com/feed.json',
  outputWebhook:'https://example.com/hook',timeZone:'Europe/London',hour:8
}),env,W.defaultDeps);
assert.equal(r.status,200); const httpAuto=await r.json();
assert.equal(httpAuto.automation.inputMode,'http');
assert.equal(httpAuto.automation.timeZone,'Europe/London');
assert.equal(httpAuto.automation.hour,8);

r=await W.route(req('/v1/workflows/'+id+'/automation',token,'POST',{
  enabled:true,cadence:'daily',inputMode:'http',inputUrl:'http://127.0.0.1/private'
}),env,W.defaultDeps);
assert.equal(r.status,400);

r=await W.route(req('/v1/workflows/'+id+'/automation',token,'POST',{
  enabled:true,cadence:'daily',input:'[]',outputWebhook:'https://192.168.1.5/hook'
}),env,W.defaultDeps);
assert.equal(r.status,400);

r=await W.route(req('/v1/workflows/'+id+'/history',token),env,W.defaultDeps); assert.equal(r.status,200); const hist=await r.json(); assert.equal(hist.runs.length,1); assert.equal(hist.runs[0].ok,true);

// Scheduled Automation has its own quota and creates one canonical history record.
// Force this workflow due now with fixed input, then ensure general API usage does not move.
const autoKey='automation:cus_workflow:'+id;
const autoRaw=await kv.get(autoKey); const due=JSON.parse(autoRaw);
due.inputMode='fixed'; due.input='[{"name":"Grace"}]'; delete due.outputWebhook; due.enabled=true; due.nextRunAt=Date.now()-1000;
await kv.put(autoKey,JSON.stringify(due));
const period=new Date().toISOString().slice(0,7);
const apiBefore=parseInt((await kv.get('usage:cus_workflow:'+period))||'0',10);
await W.runDueAutomations(env,W.defaultDeps);
const apiAfter=parseInt((await kv.get('usage:cus_workflow:'+period))||'0',10);
const autoUsed=parseInt((await kv.get('automation-usage:cus_workflow:'+period))||'0',10);
assert.equal(apiAfter,apiBefore,'scheduled automation must not consume general API quota');
assert.equal(autoUsed,1,'scheduled automation consumes exactly one automation run');
r=await W.route(req('/v1/workflows/'+id+'/history',token),env,W.defaultDeps);
const afterAutoHist=await r.json();
assert.equal(afterAutoHist.runs.filter(x=>x.source==='automation').length,1,'one canonical automation history record');

r=await W.route(req('/v1/workflows/health',token),{...env,CREDENTIAL_ENCRYPTION_KEY:'health-test-secret-value-that-is-at-least-32-characters',RESEND_API_KEY:'test-resend'},W.defaultDeps);
assert.equal(r.status,200);const health=await r.json();assert.equal(health.services.workflow_storage,true);assert.equal(health.services.automation,true);assert.equal(health.services.credential_vault,true);assert.equal(health.services.failure_email,true);

const other=await E.issueToken(kv,'cus_other','api_monthly','active');
r=await W.route(req('/v1/workflows/'+id,other),env,W.defaultDeps); assert.equal(r.status,404);

console.log('workflow-api tests passed');
