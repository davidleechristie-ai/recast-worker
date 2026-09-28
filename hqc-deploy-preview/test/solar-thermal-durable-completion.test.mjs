import assert from 'node:assert/strict';
import test from 'node:test';
import worker,{HqcMetrics} from '../worker-entry.js';

class MemoryStorage{
  values=new Map();
  async get(key){return this.values.get(key)}
  async put(key,value){if(typeof key==='object')for(const [k,v] of Object.entries(key))this.values.set(k,v);else this.values.set(key,value)}
  async list({prefix}){return new Map([...this.values].filter(([key])=>key.startsWith(prefix)))}
}
const quote=(area,price)=>({extractedMedia:{sourceMediaType:'application/pdf',extractionMethod:'pdfjs-text-v1',pageCount:1,extractedText:`Private quote evidence. Solar thermal collectors aperture area ${area} m2. Solar cylinder 250 litres. Solar heat 1900 kWh/year. Total £${price}.`}});
const request=(body,ref='https://homequotecheck.co.uk/?src=organic_thermal')=>new Request('https://homequotecheck.co.uk/api/analyse',{method:'POST',headers:{'content-type':'application/json','x-hqc-technology':'solar_thermal',referer:ref},body:JSON.stringify({technology:'solar_thermal',...body})});
const fixture=()=>{const storage=new MemoryStorage(),metrics=new HqcMetrics({storage});return {storage,metrics,env:{HQC_ENV:'production',HQC_SOLAR_THERMAL_ANALYSIS_INTERNAL:'1',HQC_METRICS:{getByName:()=>({fetch:(url,init)=>metrics.fetch(new Request(url,init))})}}}};

test('successful private thermal PDF checks and comparisons count by source and technology without quote content',async()=>{
  const {storage,metrics,env}=fixture();
  assert.equal((await worker.fetch(request(quote(4.2,6750)),env,{})).status,200);
  assert.equal((await worker.fetch(request({quotes:[quote(4.2,6750),quote(3.4,5950)]}),env,{})).status,200);
  const report=await metrics.snapshot();
  assert.equal(report.total.thermalAnalyses,2);
  assert.equal(report.total.thermalComparisons,1);
  assert.equal(report.technologies.find(x=>x.technology==='solar_thermal').thermalAnalyses,2);
  assert.equal(report.sources.find(x=>x.source==='organic_thermal').thermalComparisons,1);
  assert.equal(report.total.genuine,0);
  assert.doesNotMatch(JSON.stringify([...storage.values]),/Private quote evidence|6750|5950|1900/);
});

test('QA, failed, raw-text and disabled public thermal requests do not increment completion counters',async()=>{
  const {metrics,env}=fixture();
  assert.equal((await worker.fetch(request(quote(4.2,6750),'https://homequotecheck.co.uk/?qa=1'),env,{})).status,200);
  assert.equal((await worker.fetch(request({extractedMedia:{sourceMediaType:'image/png',extractionMethod:'ocr',extractedText:'Solar thermal'}}),env,{})).status,415);
  assert.equal((await worker.fetch(request({quoteText:'Solar thermal collector 4.2 m2. Total £6,750.'}),env,{})).status,200);
  assert.equal((await worker.fetch(request(quote(4.2,6750)),{...env,HQC_SOLAR_THERMAL_ANALYSIS_INTERNAL:'0'},{})).status,409);
  assert.equal((await metrics.snapshot()).total.thermalAnalyses,0);
});
