import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../worker-entry.js';
import {HqcMetrics} from '../worker.js';

const ev=()=>new Request('https://homequotecheck.co.uk/api/analyse',{method:'POST',headers:{'content-type':'application/json','x-hqc-technology':'ev_chargepoint'},body:JSON.stringify({quoteText:'Installation of Zappi V2 EV charger 7.4 kW charging. Total £1,250.'})});

class MemoryStorage{
  values=new Map();
  async get(key){return this.values.get(key)}
  async put(key,value){if(typeof key==='object')for(const [k,v] of Object.entries(key))this.values.set(k,v);else this.values.set(key,value)}
  async list({prefix}){return new Map([...this.values].filter(([key])=>key.startsWith(prefix)))}
}

const metricsEnv=()=>{
  const metrics=new HqcMetrics({storage:new MemoryStorage()});
  return {metrics,env:{HQC_ENV:'production',HQC_METRICS:{getByName:()=>({fetch:(url,init)=>metrics.fetch(new Request(url,init))})}}};
};

test('EV stays closed without internal gate',async()=>{const r=await worker.fetch(ev(),{},{});assert.equal(r.status,409);assert.equal((await r.json()).technology,'ev_chargepoint')});
test('EV internal gate invokes only EV adapter',async()=>{const r=await worker.fetch(ev(),{HQC_EV_CHARGEPOINT_ANALYSIS_INTERNAL:'1'},{});assert.equal(r.status,200);assert.equal(r.headers.get('x-hqc-analysis-technology'),'ev_chargepoint');assert.equal(r.headers.get('x-hqc-analysis-adapter'),'ev_chargepoint_internal');const j=await r.json();assert.equal(j.technology,'ev_chargepoint');assert.equal(j.evidence.powerKw,7.4)});
test('Solar flag cannot open EV',async()=>{const r=await worker.fetch(ev(),{HQC_SOLAR_ANALYSIS_PUBLIC:'1'},{});assert.equal(r.status,409)});
test('EV public flag opens only EV adapter while explicit kill switch stays closed',async()=>{const r=await worker.fetch(ev(),{HQC_EV_CHARGEPOINT_ANALYSIS_PUBLIC:'1'},{});assert.equal(r.status,200);assert.equal(r.headers.get('x-hqc-analysis-adapter'),'ev_chargepoint');assert.equal((await r.json()).technology,'ev_chargepoint');const closed=await worker.fetch(ev(),{HQC_EV_CHARGEPOINT_ANALYSIS_PUBLIC:'0'},{});assert.equal(closed.status,409)});

test('anonymous conversion funnel events are recorded at the edge without upstream dependency',async()=>{
  const {metrics,env}=metricsEnv();
  const request=new Request('https://homequotecheck.co.uk/api/event',{method:'POST',headers:{'content-type':'application/json','referer':'https://homequotecheck.co.uk/?src=direct'},body:JSON.stringify({event:'single_quote_start_clicked',source:'direct',technology:'heat_pump'})});
  const response=await worker.fetch(request,env,{});
  assert.equal(response.status,200);
  assert.equal(response.headers.get('x-hqc-cloudflare-edge'),'production');
  assert.equal((await metrics.snapshot()).total.singleStarts,1);
});

test('QA conversion events are excluded from durable metrics',async()=>{
  const {metrics,env}=metricsEnv();
  const request=new Request('https://homequotecheck.co.uk/api/event',{method:'POST',headers:{'content-type':'application/json','referer':'https://homequotecheck.co.uk/?qa=1'},body:JSON.stringify({event:'installer_alternative_interest',source:'direct',technology:'heat_pump'})});
  const response=await worker.fetch(request,env,{});
  assert.equal(response.status,200);
  assert.equal((await response.json()).test,true);
  assert.equal((await metrics.snapshot()).total.installerAlternativeInterest,0);
});
