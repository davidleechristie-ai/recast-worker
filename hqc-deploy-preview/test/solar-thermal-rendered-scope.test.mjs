import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

test('private result renders evidenced scope, separate warranties and estimate assumptions',async()=>{
  const script=await readFile(new URL('../solar-thermal-preview-journey.js',import.meta.url),'utf8');
  const result={technology:'solar_thermal',evidence:{collectorType:'flat_plate',collectorAreaM2:4,cylinderLitres:250,annualSolarHeatKwh:1850,priceGbp:6500,installationScope:{roofMounting:{status:'included',quoteText:'Roof mounting included.'},scaffolding:{status:'excluded',quoteText:'Scaffolding excluded.'},pipework:null,pumpControls:null,commissioning:null},warranties:{collector:{years:10,quoteText:'Collector warranty 10 years.'},cylinder:{years:5,quoteText:'Cylinder warranty 5 years.'},workmanship:null},heatAssumptions:{occupants:4,hotWaterLitresPerDay:160}},gaps:['pipework'],installerQuestions:[{question:'Please confirm scaffolding cost.'}]};
  const host={dataset:{},style:{},scrollIntoView(){},innerHTML:''};
  const body={prepend(){}};
  const storage=new Map([['hqc_solar_thermal_extracted_media',JSON.stringify([{sourceMediaType:'application/pdf',extractionMethod:'pdfjs-text-v1',pageCount:1,extractedText:'Solar thermal quote'}])]]);
  const context={location:{search:'?thermal_preview=1'},sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},window:{fetch:async()=>Response.json(result)},Headers,Request,Response,URLSearchParams,MutationObserver:class{observe(){}},requestAnimationFrame:()=>{},setTimeout:fn=>fn(),document:{documentElement:{},body,querySelector:s=>s==='#hqc-thermal-analysis-result'?host:null,querySelectorAll:()=>[],createElement:()=>host}};
  vm.runInNewContext(script,context);
  await context.window.fetch('/api/analyse',{method:'POST'});
  for(const phrase of ['Scaffolding','excluded','Collector warranty','10 years','Cylinder warranty','5 years','4 occupants','160 litres/day'])assert.ok(host.innerHTML.includes(phrase),`missing ${phrase} in rendered result`);
  assert.match(host.innerHTML,/Workmanship warranty<\/small><br><b>Not stated<\/b>/);
});
