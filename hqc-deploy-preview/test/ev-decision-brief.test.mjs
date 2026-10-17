import assert from 'node:assert/strict';
import test from 'node:test';
import {analyseEvChargepointQuote,compareEvChargepointQuotes} from '../lib/ev-chargepoint-analysis.js';
import {buildEvDecisionBrief} from '../lib/ev-chargepoint-decision-brief.js';

test('single EV quote brief draws only from its evidence gaps and questions',()=>{
  const analysis=analyseEvChargepointQuote({quoteId:'A',quoteText:'Untethered EV chargepoint. Total £899. Cable route subject to survey.'});
  const brief=buildEvDecisionBrief(analysis);
  assert.equal(brief.technology,'ev_chargepoint');
  assert.equal(brief.availability,'private_preview');
  assert.equal(brief.quoteSummaries.length,1);
  assert.equal(brief.quoteSummaries[0].priceGbp,899);
  assert.ok(brief.quoteSummaries[0].openItems.includes('rated charging power'));
  assert.ok(brief.quoteSummaries[0].questions.some(q=>/DNO/.test(q)));
  assert.deepEqual(brief.comparisonFocus,[]);
  assert.doesNotMatch(JSON.stringify(brief),/heat loss|radiator|flow temperature|recommended winner/i);
});

test('EV comparison brief surfaces evidenced differences and explicit unknowns without ranking',()=>{
  const comparison=compareEvChargepointQuotes([
    {quoteId:'A',quoteText:'Install Zappi V2 EV charger 7 kW charging. Cable run included. Consumer unit upgrade excluded. Total £1,250.'},
    {quoteId:'B',quoteText:'Install Ohme HomePro chargepoint 7.4 kW charging. Consumer unit upgrade included. Total £1,099.'}
  ]);
  const brief=buildEvDecisionBrief(comparison);
  const price=brief.comparisonFocus.find(x=>x.dimension==='price');
  const cable=brief.comparisonFocus.find(x=>x.dimension==='cabling scope');
  assert.deepEqual(price.values,[{quoteId:'A',value:1250},{quoteId:'B',value:1099}]);
  assert.equal(price.evidenceState,'different');
  assert.deepEqual(cable.values,[{quoteId:'A',value:'Included: Cable run included.'},{quoteId:'B',value:null}]);
  assert.equal(cable.evidenceState,'incomplete');
  assert.ok(brief.quoteSummaries[1].questions.some(q=>/cabling/i.test(q)));
  assert.match(brief.decisionCondition,/confirm.*scope.*in writing/i);
  assert.doesNotMatch(JSON.stringify(brief),/best quote|recommended winner|heat loss|radiator/i);
});
