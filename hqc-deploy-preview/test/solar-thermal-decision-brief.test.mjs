import test from 'node:test';
import assert from 'node:assert/strict';
import {analyseSolarThermalQuote,compareSolarThermalQuotes} from '../lib/solar-thermal-analysis.js';
import {buildSolarThermalDecisionBrief} from '../lib/solar-thermal-decision-brief.js';
const quote='Solar thermal flat plate collectors, aperture area 4 m². Solar cylinder 250 litres. Total installed price £6,500. Scaffolding excluded. Collector warranty 10 years.';
test('single thermal brief uses quote gaps and scope without invented benefits',()=>{
 const brief=buildSolarThermalDecisionBrief(analyseSolarThermalQuote({quoteText:quote,quoteId:'A'}));
 assert.equal(brief.technology,'solar_thermal');assert.equal(brief.availability,'private_preview');assert.equal(brief.quoteSummaries[0].priceGbp,6500);assert.equal(brief.quoteSummaries[0].scaffolding,'excluded');assert.ok(brief.quoteSummaries[0].questions.some(q=>/scaffolding/i.test(q)));assert.deepEqual(brief.comparisonFocus,[]);assert.doesNotMatch(JSON.stringify(brief),/checkout|guaranteed savings|grant eligible|recommended winner|heat loss|radiator/i);
});
test('comparison highlights differences and unknowns without choosing cheapest',()=>{
 const comparison=compareSolarThermalQuotes([{quoteId:'A',quoteText:quote},{quoteId:'B',quoteText:'Solar thermal evacuated tube collectors, aperture area 3.8 m². Total installed price £5,900.'}]);
 const brief=buildSolarThermalDecisionBrief(comparison);
 assert.deepEqual(brief.comparisonFocus.find(x=>x.dimension==='installed price').values,[{quoteId:'A',value:6500},{quoteId:'B',value:5900}]);assert.equal(brief.comparisonFocus.find(x=>x.dimension==='scaffolding scope').evidenceState,'incomplete');assert.equal(brief.comparisonFocus.find(x=>x.dimension==='collector type').evidenceState,'different');assert.match(brief.decisionCondition,/scope.*assumptions.*in writing/i);assert.doesNotMatch(JSON.stringify(brief),/best quote|winner is|RHI income|automatic savings/i);
});
