import test from 'node:test';
import assert from 'node:assert/strict';
import {extractSolarThermalQuote} from '../lib/solar-thermal-extraction.js';
import {analyseSolarThermalQuote,compareSolarThermalQuotes} from '../lib/solar-thermal-analysis.js';

const prefix='Solar thermal flat plate collectors, aperture area 4.0 m2. Solar cylinder 250 litres. Solar heat 1,850 kWh/year. Total installed price £6,500. ';

test('named installation scope and warranties retain the exact quote wording',()=>{
  const quote=prefix+'Roof mounting included. Scaffolding excluded. Solar pipework included. Pump station and controls subject to site survey. Commissioning included. Collector warranty 10 years. Cylinder warranty 5 years. Workmanship warranty 2 years.';
  const e=extractSolarThermalQuote(quote);
  assert.equal(e.installationScope.roofMounting.status,'included');
  assert.equal(e.installationScope.scaffolding.status,'excluded');
  assert.equal(e.installationScope.pipework.status,'included');
  assert.equal(e.installationScope.pumpControls.status,'conditional');
  assert.equal(e.installationScope.commissioning.status,'included');
  assert.match(e.installationScope.scaffolding.quoteText,/Scaffolding excluded/);
  assert.equal(e.warranties.collector.years,10);
  assert.equal(e.warranties.cylinder.years,5);
  assert.equal(e.warranties.workmanship.years,2);
  assert.match(e.warranties.collector.quoteText,/Collector warranty 10 years/);
  const a=analyseSolarThermalQuote({quoteText:quote});
  assert.ok(a.findings.some(f=>f.key==='scope_scaffolding'&&f.evidenceState==='excluded'));
  assert.ok(a.findings.some(f=>f.key==='warranty_collector'&&f.quoteText.includes('10 years')));
  assert.ok(a.installerQuestions.some(q=>/scaffold.*excluded/i.test(q.question)));
});

test('household hot-water assumptions remain attributed to the quoted annual estimate',()=>{
  const e=extractSolarThermalQuote(prefix+'Estimate assumes a 4 person household and 160 litres/day hot-water demand.');
  assert.equal(e.heatAssumptions.occupants,4);
  assert.equal(e.heatAssumptions.hotWaterLitresPerDay,160);
  assert.match(e.heatAssumptions.provenance.occupants,/4 person household/);
  const a=analyseSolarThermalQuote({quoteText:prefix+'Estimate assumes a 4 person household and 160 litres/day hot-water demand.'});
  assert.ok(!a.gaps.includes('annual solar heat assumptions'));
  assert.ok(a.findings.some(f=>f.key==='heat_assumptions'&&f.evidenceState==='installer_claim'));
});

test('alternatives, contradictory commitments and unspecific warranties stay unknown',()=>{
  const quote=prefix+'Scaffolding included or excluded after survey. Roof mounting included. Roof mounting excluded. Collector warranty 5 or 10 years. Cylinder warranty included. Estimated for a 2 or 4 person household.';
  const e=extractSolarThermalQuote(quote);
  assert.equal(e.installationScope.scaffolding,null);
  assert.equal(e.installationScope.roofMounting,null);
  assert.equal(e.warranties.collector,null);
  assert.equal(e.warranties.cylinder,null);
  assert.equal(e.heatAssumptions.occupants,null);
  const a=analyseSolarThermalQuote({quoteText:quote});
  assert.ok(a.gaps.includes('installation scope'));
  assert.ok(a.gaps.includes('warranty periods'));
  assert.ok(a.gaps.includes('annual solar heat assumptions'));
});

test('PV work does not become thermal scope, and comparison preserves separate unknowns',()=>{
  const one=prefix+'Solar PV scaffolding included. Collector warranty 10 years. Roof mounting included.';
  const two=prefix+'Solar thermal scaffolding excluded. Collector warranty 5 years.';
  const compared=compareSolarThermalQuotes([{quoteId:'A',quoteText:one},{quoteId:'B',quoteText:two}]);
  assert.equal(compared.analyses[0].evidence.installationScope.scaffolding,null);
  assert.deepEqual(compared.comparison.find(x=>x.dimension==='scaffolding scope').values,[{quoteId:'A',value:null},{quoteId:'B',value:'excluded'}]);
  assert.deepEqual(compared.comparison.find(x=>x.dimension==='collector warranty years').values,[{quoteId:'A',value:10},{quoteId:'B',value:5}]);
  assert.equal(compared.conclusion.includes('winner'),true);
});
