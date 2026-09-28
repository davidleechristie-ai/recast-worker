import assert from 'node:assert/strict';
import test from 'node:test';
import worker,{HqcMetrics} from '../worker-entry.js';

class MemoryStorage{
  values=new Map();
  async get(key){return this.values.get(key)}
  async put(key,value){if(typeof key==='object')for(const [k,v] of Object.entries(key))this.values.set(k,v);else this.values.set(key,value)}
  async list({prefix}){return new Map([...this.values].filter(([key])=>key.startsWith(prefix)))}
}
const quote=(name,price)=>({extractedMedia:{sourceMediaType:'application/pdf',extractionMethod:'pdfjs-text-v1',pageCount:1,extractedText:'Install '+name+' EV charger 7 kW charging. Total £'+price+'. Private quote evidence.'}});
const request=(body,ref='https://homequotecheck.co.uk/?src=organic_ev')=>new Request('https://homequotecheck.co.uk/api/analyse',{
  method:'POST',headers:{'content-type':'application/json','x-hqc-technology':'ev_chargepoint',referer:ref},body:JSON.stringify({technology:'ev_chargepoint',...body})
});
const fixture=()=>{const storage=new MemoryStorage(),metrics=new HqcMetrics({storage});return {storage,metrics,env:{HQC_ENV:'production',HQC_EV_CHARGEPOINT_ANALYSIS_INTERNAL:'1',HQC_METRICS:{getByName:()=>({fetch:(url,init)=>metrics.fetch(new Request(url,init))})}}}};

test('successful EV PDF checks and comparisons are durably segmented, without quote content',async()=>{
  const {storage,metrics,env}=fixture();
  const single=await worker.fetch(request(quote('Zappi V2',1250)),env,{});
  assert.equal(single.status,200);
  const multi=await worker.fetch(request({quotes:[quote('Zappi V2',1250),quote('Ohme HomePro',1099)]}),env,{});
  assert.equal(multi.status,200);
  const report=await metrics.snapshot();
  assert.equal(report.total.evAnalyses,2);
  assert.equal(report.total.evComparisons,1);
  assert.equal(report.technologies.find(x=>x.technology==='ev_chargepoint').evAnalyses,2);
  assert.equal(report.sources.find(x=>x.source==='organic_ev').evComparisons,1);
  assert.equal(report.total.genuine,0);
  assert.doesNotMatch(JSON.stringify([...storage.values]),/Private quote evidence|Zappi|Ohme|1250/);
});

test('QA, failed and raw-text-only EV requests do not count as PDF completions',async()=>{
  const {metrics,env}=fixture();
  assert.equal((await worker.fetch(request(quote('Zappi V2',1250),'https://homequotecheck.co.uk/?qa=1'),env,{})).status,200);
  assert.equal((await worker.fetch(request({extractedMedia:{sourceMediaType:'image/png',extractionMethod:'ocr',extractedText:''}}),env,{})).status,400);
  assert.equal((await worker.fetch(request({quoteText:'Install Zappi V2 EV charger 7 kW charging. Total £1250.'}),env,{})).status,200);
  assert.equal((await metrics.snapshot()).total.evAnalyses,0);
});
