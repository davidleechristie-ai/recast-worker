import assert from 'node:assert/strict';
const origin=process.env.HQC_CANARY_ORIGIN||'https://cf-preview.homequotecheck.co.uk';
const text='Solar thermal evacuated tube collectors, aperture area 4.2 m². 250 litre solar hot water cylinder. Solar heat 1,900 kWh/year. Total installed price £6,750.';
const media=t=>({sourceMediaType:'application/pdf',extractionMethod:'pdfjs-text-v1',pageCount:1,extractedText:t});
async function check(body){const response=await fetch(`${origin}/api/analyse`,{method:'POST',headers:{'content-type':'application/json','x-hqc-technology':'solar_thermal','x-hqc-qa':'1'},body:JSON.stringify(body)});return {response,body:await response.json()}}
const single=await check({technology:'solar_thermal',extractedMedia:media(text)});
assert.equal(single.response.status,200);assert.equal(single.response.headers.get('x-hqc-analysis-adapter'),'solar_thermal_internal');assert.equal(single.body.evidence.collectorAreaM2,4.2);assert.equal(single.body.evidence.annualSolarHeatKwh,1900);
const compared=await check({quotes:[{quoteId:'A',extractedMedia:media(text)},{quoteId:'B',extractedMedia:media('Solar hot water flat plate collectors, aperture area 3.8 m². Total installed price £5,950.')} ]});
assert.equal(compared.response.status,200);assert.equal(compared.body.comparison.find(x=>x.dimension==='cylinder litres').values[1].value,null);
const unsupported=await check({extractedMedia:{...media(text),sourceMediaType:'image/png'}});assert.equal(unsupported.response.status,415);
const pv=await check({quoteText:'Solar PV 5.1 kWp. Total price £9,000.'});assert.equal(pv.response.status,422);
console.log('Private solar thermal single/comparison PDF-derived analysis and fail-closed boundaries passed.');
