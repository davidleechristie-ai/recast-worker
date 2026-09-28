import assert from 'node:assert/strict';
import test from 'node:test';
import {analyseSolarThermalQuote,compareSolarThermalQuotes} from '../lib/solar-thermal-analysis.js';

const complete='Solar thermal system: evacuated tube collectors, aperture area 4.2 m². Install a 250 litre twin-coil hot water cylinder. Estimated solar heat 1,900 kWh/year. Total installed price £6,750 incl VAT.';

test('single solar thermal analysis keeps installer yield a claim and generates missing-scope questions',()=>{
 const result=analyseSolarThermalQuote({quoteText:complete,quoteId:'A'});
 assert.equal(result.ok,true);assert.equal(result.technology,'solar_thermal');assert.equal(result.evidence.collectorAreaM2,4.2);
 assert.equal(result.findings.find(x=>x.key==='annual_heat').evidenceState,'installer_claim');
 assert.ok(result.gaps.includes('backup heat integration'));
 assert.ok(result.installerQuestions.some(x=>/roof|plumbing|commissioning/i.test(x.question)));
 assert.doesNotMatch(JSON.stringify(result),/grant eligible|certified safe|guaranteed savings/i);
});

test('comparison preserves explicit values, unknowns and RHI questions without a winner',()=>{
 const result=compareSolarThermalQuotes([
   {quoteId:'A',quoteText:complete},
   {quoteId:'B',quoteText:'Solar hot water: flat plate collectors, aperture area 3.8 m². Solar RHI income £400/year. Total installed price £5,950.'}
 ]);
 assert.equal(result.ok,true);assert.equal(result.analyses.length,2);
 assert.deepEqual(result.comparison.find(x=>x.dimension==='cylinder litres').values,[{quoteId:'A',value:250},{quoteId:'B',value:null}]);
 assert.equal(result.comparison.find(x=>x.dimension==='annual solar heat kWh').values[1].value,null);
 assert.ok(result.analyses[1].installerQuestions.some(x=>/RHI.*closed/i.test(x.question)));
 assert.match(result.conclusion,/No automatic winner/);
});

test('nonthermal text is rejected from the dedicated analysis',()=>{
 const result=analyseSolarThermalQuote({quoteText:'Solar PV 5.1 kWp electricity, inverter 5 kW. Total price £9,500.'});
 assert.equal(result.ok,false);assert.equal(result.error,'solar_thermal_evidence_required');
});
test('explicit backup integration is not reported missing, while scope confirmation remains a question',()=>{
 const result=analyseSolarThermalQuote({quoteText:'Solar thermal flat plate collectors, aperture area 3.6 m². Existing boiler backup connected to twin-coil cylinder, included. Total installed price £5,900.'});
 assert.match(result.evidence.backupHeat,/Included:.*boiler backup/i);
 assert.ok(!result.gaps.includes('backup heat integration'));
 assert.ok(!result.gaps.includes('installation and commissioning scope'));
 assert.ok(result.installerQuestions.some(x=>/roof mounting.*commissioning/i.test(x.question)));
});
