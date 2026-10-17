import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const script=await readFile(new URL('../solar-thermal-preview-journey.js',import.meta.url),'utf8');
function journey(search, stored={}){
  const entries=new Map(Object.entries(stored));
  const calls=[];
  const original=async(_url,init)=>{calls.push(init);return new Response(JSON.stringify({ok:true,technology:'solar_thermal',evidence:{collectorAreaM2:4.2}}),{headers:{'content-type':'application/json','x-hqc-analysis-adapter':'solar_thermal_internal'}})};
  const context={location:{search},sessionStorage:{getItem:key=>entries.get(key)||null,setItem:(key,value)=>entries.set(key,value),removeItem:key=>entries.delete(key)},window:{fetch:original},fetch:original,Headers,Request,Response,URLSearchParams,MutationObserver:class{observe(){}},requestAnimationFrame:()=>{},setTimeout:()=>{},document:{documentElement:{},querySelector:()=>null,querySelectorAll:()=>[]}};
  vm.runInNewContext(script,context);
  return {context,entries,calls};
}
const pdf=text=>({sourceMediaType:'application/pdf',extractionMethod:'pdfjs-text-v1',pageCount:1,extractedText:text});

test('private thermal journey submits PDF provenance to isolated adapter',async()=>{
  const {context,entries,calls}=journey('?qa=1&thermal_preview=1',{'hqc_solar_thermal_extracted_media':JSON.stringify([pdf('Solar thermal collector 4.2 m2. Total £6,750.')])});
  const response=await context.window.fetch('/api/analyse',{method:'POST',body:'upstream-body'});
  assert.equal(response.status,200);
  assert.equal(response.headers.get('x-hqc-analysis-adapter'),'solar_thermal_internal');
  assert.equal(calls.length,1);
  assert.equal(calls[0].headers.get('x-hqc-technology'),'solar_thermal');
  assert.equal(JSON.parse(calls[0].body).extractedMedia.extractionMethod,'pdfjs-text-v1');
  assert.equal(entries.get('hqc_journey_technology'),'solar_thermal');
});

test('private thermal journey blocks analysis without extracted PDF evidence',async()=>{
  const {context,calls}=journey('?thermal_preview=1');
  const response=await context.window.fetch('/api/analyse',{method:'POST',body:'upstream-body'});
  assert.equal(response.status,415);
  assert.equal(calls.length,0);
});

test('explicit public technology wins over stale private thermal session',async()=>{
  const {context,calls,entries}=journey('?technology=heat_pump',{'hqc_solar_thermal_preview':'1','hqc_journey_technology':'solar_thermal','hqc_solar_thermal_extracted_media':JSON.stringify([pdf('Solar thermal')])});
  await context.window.fetch('/api/analyse',{method:'POST',body:'heat-pump-body'});
  assert.equal(calls[0].body,'heat-pump-body');
  assert.equal(entries.get('hqc_journey_technology'),'solar_thermal');
});
