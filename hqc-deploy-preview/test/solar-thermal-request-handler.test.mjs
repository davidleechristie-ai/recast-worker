import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../worker-entry.js';
import {handleSolarThermalAnalysisRequest} from '../lib/solar-thermal-request-handler.js';
const quote='Solar thermal evacuated tube collectors, aperture area 4.2 m². 250 litre solar hot water cylinder. Solar heat 1,900 kWh/year. Total installed price £6,750.';
const media=text=>({sourceMediaType:'application/pdf',extractionMethod:'pdfjs-text-v1',pageCount:1,extractedText:text});
const req=(body,headers={})=>new Request('https://homequotecheck.co.uk/api/analyse',{method:'POST',headers:{'content-type':'application/json','x-hqc-technology':'solar_thermal',...headers},body:JSON.stringify(body)});

test('private PDF-derived solar thermal request returns isolated evidence and provenance',async()=>{
 const response=await handleSolarThermalAnalysisRequest(req({technology:'solar_thermal',extractedMedia:media(quote)}));
 assert.equal(response.status,200);const data=await response.json();assert.equal(data.technology,'solar_thermal');assert.equal(data.evidence.collectorAreaM2,4.2);assert.equal(data.extractionProvenance.sourceMediaType,'application/pdf');
});
test('two thermal PDFs compare only stated evidence and keep separate provenance',async()=>{
 const response=await handleSolarThermalAnalysisRequest(req({quotes:[{quoteId:'A',extractedMedia:media(quote)},{quoteId:'B',extractedMedia:media('Solar hot water flat plate collectors, aperture area 3.8 m². Total installed price £5,950.')}]}));
 assert.equal(response.status,200);const data=await response.json();assert.equal(data.analyses.length,2);assert.equal(data.extractionProvenance.length,2);assert.equal(data.comparison.find(x=>x.dimension==='cylinder litres').values[1].value,null);
});
test('malformed, unsupported and nonthermal inputs fail closed',async()=>{
 const wrong=await handleSolarThermalAnalysisRequest(req({technology:'solar_battery',quoteText:quote}));assert.equal(wrong.status,400);
 const image=await handleSolarThermalAnalysisRequest(req({technology:'solar_thermal',extractedMedia:{...media(quote),sourceMediaType:'image/png'}}));assert.equal(image.status,415);
 const pv=await handleSolarThermalAnalysisRequest(req({technology:'solar_thermal',quoteText:'Solar PV array 5 kWp. Total price £9,000.'}));assert.equal(pv.status,422);
 const raw=await handleSolarThermalAnalysisRequest(new Request('https://homequotecheck.co.uk/api/analyse',{method:'POST',headers:{'x-hqc-technology':'solar_thermal'},body:'PDF BINARY'}));assert.equal(raw.status,415);
});
test('Worker requires internal solar thermal gate; existing public flags cannot open it',async()=>{
 const closed=await worker.fetch(req({extractedMedia:media(quote)}),{HQC_SOLAR_ANALYSIS_PUBLIC:'1',HQC_EV_CHARGEPOINT_ANALYSIS_PUBLIC:'1'},{});assert.equal(closed.status,409);
 const open=await worker.fetch(req({extractedMedia:media(quote)}),{HQC_SOLAR_THERMAL_ANALYSIS_INTERNAL:'1'},{});assert.equal(open.status,200);assert.equal(open.headers.get('x-hqc-analysis-adapter'),'solar_thermal_internal');assert.equal((await open.json()).evidence.priceGbp,6750);
});
