import assert from 'node:assert/strict';
import test from 'node:test';
import {HQC_TECHNOLOGIES,analysisRouteForTechnology,normaliseTechnology} from '../lib/technology-routing.js';
import {extractSolarThermalQuote} from '../lib/solar-thermal-extraction.js';
import worker from '../worker-entry.js';

test('solar thermal is explicitly isolated from Heat Pump and Solar PV',()=>{
  assert.equal(normaliseTechnology('solar-thermal'),HQC_TECHNOLOGIES.SOLAR_THERMAL);
  const route=analysisRouteForTechnology('solar_thermal',{HQC_SOLAR_ANALYSIS_API_BASE:'https://solar.example.test'});
  assert.deepEqual(route,{ok:false,status:409,technology:'solar_thermal',error:'technology_analysis_not_ready'});
});
test('production Worker keeps solar thermal closed even with Solar PV public flag',async()=>{
  const request=new Request('https://homequotecheck.co.uk/api/analyse',{method:'POST',headers:{'content-type':'application/json','x-hqc-technology':'solar_thermal'},body:JSON.stringify({quoteText:'Solar thermal collector quote'})});
  const response=await worker.fetch(request,{HQC_SOLAR_ANALYSIS_PUBLIC:'1',HQC_EV_CHARGEPOINT_ANALYSIS_PUBLIC:'1'},{});
  assert.equal(response.status,409);assert.equal((await response.json()).technology,'solar_thermal');
});
test('solar thermal records only labelled collector, cylinder, yield and price evidence',()=>{
  const quote='Supply two evacuated tube solar thermal collectors, total aperture area 4.2 m². Install a 250 litre twin-coil hot water cylinder and pump station. Estimated solar heat 1,900 kWh/year. Total installed price £6,750 incl VAT.';
  const e=extractSolarThermalQuote(quote);
  assert.equal(e.collectorType,'evacuated_tube');assert.equal(e.collectorAreaM2,4.2);assert.equal(e.cylinderLitres,250);assert.equal(e.annualSolarHeatKwh,1900);assert.equal(e.priceGbp,6750);
  assert.equal(e.backupHeat,null);assert.equal(e.mcsClaim,null);
  assert.match(e.provenance.collectorAreaM2,/4\.2 m²/);
});
test('solar PV and unlabelled numbers do not become thermal performance',()=>{
  const e=extractSolarThermalQuote('Solar PV panels 5.1 kWp with 4,200 kWh annual electricity. A separate solar hot water option is subject to survey. Price £8,900 for the PV system.');
  assert.equal(e.collectorType,null);assert.equal(e.collectorAreaM2,null);assert.equal(e.cylinderLitres,null);assert.equal(e.annualSolarHeatKwh,null);assert.equal(e.priceGbp,null);
});
test('alternatives and obsolete RHI claims are retained as questions, not selected benefits',()=>{
  const e=extractSolarThermalQuote('Choose either flat plate or evacuated tube collectors. 200 or 300 litre cylinder. Solar RHI income £400/year. Price from £5,000 or £7,000.');
  assert.equal(e.collectorType,null);assert.equal(e.cylinderLitres,null);assert.equal(e.priceGbp,null);assert.equal(e.rhiClaim,'Solar RHI income £400/year.');
  assert.ok(e.questions.some(x=>/RHI.*closed/i.test(x)));
});
