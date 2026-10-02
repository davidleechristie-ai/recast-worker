import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import worker,{HqcMetrics} from '../worker.js';

class MemoryStorage{
  values=new Map();
  async get(key){return this.values.get(key)}
  async put(key,value){if(typeof key==='object')for(const [k,v] of Object.entries(key))this.values.set(k,v);else this.values.set(key,value)}
  async list({prefix}){return new Map([...this.values].filter(([key])=>key.startsWith(prefix)))}
}

test('intake stages count by technology without storing quote data or QA activity',async()=>{
  const storage=new MemoryStorage(),metrics=new HqcMetrics({storage});
  for(const event of ['intake_picker_opened','intake_file_selected','intake_manual_opened'])await metrics.record({event,source:'direct',technology:'heat_pump',filename:'private-quote.pdf'});
  await metrics.record({event:'intake_file_selected',source:'direct',technology:'heat_pump',isTest:true});
  const snapshot=await metrics.snapshot();
  assert.deepEqual([snapshot.total.pickerOpens,snapshot.total.fileSelections,snapshot.total.manualOpens],[1,1,1]);
  assert.equal(snapshot.technologies.find(row=>row.technology==='heat_pump').fileSelections,1);
  assert.doesNotMatch(JSON.stringify([...storage.values]),/private-quote\.pdf/);
});

test('browser intake emits stage names and no file details',async()=>{
  const path=new URL('../intake-diagnostics.js',import.meta.url);
  const source=fs.readFileSync(path,'utf8'),listeners={},sent=[];
  const document={addEventListener(name,fn){listeners[name]=fn}};
  vm.runInNewContext(source,{document,location:{hostname:'homequotecheck.co.uk',search:'?src=direct'},URLSearchParams,sessionStorage:{getItem:()=> 'heat_pump'},fetch:async(url,init)=>{sent.push({url,body:JSON.parse(init.body)});return {ok:true}}});
  const closest=id=>({closest:selector=>selector===id?{}:null});
  listeners.click({target:closest('#hqc-choose-file')});
  listeners.click({target:closest('#hqc-enter-manual')});
  listeners.change({isTrusted:true,target:{matches:selector=>selector==='input[type="file"]',files:[{name:'private-quote.pdf',size:999}]}});
  await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(sent.map(x=>x.body.event),['intake_picker_opened','intake_manual_opened','intake_file_selected','upload_handoff_started']);
  assert.ok(sent.every(x=>x.body.technology==='heat_pump'&&x.body.source==='direct'));
  assert.doesNotMatch(JSON.stringify(sent),/private-quote\.pdf|999/);
});

test('intake events are recorded at Cloudflare without relying on the upstream API',async()=>{
  const storage=new MemoryStorage(),metrics=new HqcMetrics({storage});
  const env={HQC_ENV:'production',HQC_METRICS:{getByName:()=>({fetch:(url,init)=>metrics.fetch(new Request(url,init))})}};
  const request=new Request('https://homequotecheck.co.uk/api/event',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event:'intake_file_selected',technology:'solar_battery',source:'direct'})});
  const response=await worker.fetch(request,env);
  assert.equal(response.status,200);
  assert.equal((await metrics.snapshot()).total.fileSelections,1);
  const qa=new Request('https://homequotecheck.co.uk/api/event',{method:'POST',headers:{'content-type':'application/json',referer:'https://homequotecheck.co.uk/?qa=1'},body:JSON.stringify({event:'intake_file_selected',technology:'solar_battery',source:'direct'})});
  assert.equal((await worker.fetch(qa,env)).status,200);
  assert.equal((await metrics.snapshot()).total.fileSelections,1);
});
