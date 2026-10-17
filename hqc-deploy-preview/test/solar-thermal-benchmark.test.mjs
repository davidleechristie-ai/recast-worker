import test from 'node:test';
import assert from 'node:assert/strict';
import {BENCHMARK_FIELDS, scoreSolarThermalCorpus} from '../scripts/solar-thermal-benchmark.mjs';

const emptyExpected=()=>Object.fromEntries(BENCHMARK_FIELDS.map(field=>[field,null]));
const quote='Solar thermal flat plate collectors, aperture area 4 m². Solar cylinder 250 litres. Total installed price £6,500.';
const example=(overrides={})=>({id:'example',sourceType:'synthetic',installerKey:'installer-a',layoutKey:'pdf-a',permissioned:false,deidentified:true,quoteText:quote,expected:{...emptyExpected(),collectorType:'flat_plate',collectorAreaM2:4,cylinderLitres:250,priceGbp:6500},...overrides});

test('scores evidenced values and unknowns separately without emitting quote contents',()=>{
 const result=scoreSolarThermalCorpus([example({expected:{...example().expected,collectorAreaM2:5,priceGbp:null}})]);
 assert.equal(result.metrics.positiveLabels,3);
 assert.equal(result.metrics.correctPositive,2);
 assert.equal(result.metrics.falsePositives,1);
 assert.equal(result.metrics.recall,2/3);
 assert.equal(result.fields.collectorAreaM2.misses,1);
 assert.equal(result.fields.priceGbp.falsePositives,1);
 assert.equal(result.gate.ready,false);
 assert.doesNotMatch(JSON.stringify(result),/Solar thermal flat plate|£6,500|installer-a/);
});

test('rejects incomplete labels, duplicate IDs and unmarked real quote permission',()=>{
 assert.throws(()=>scoreSolarThermalCorpus([example({expected:{priceGbp:6500}})]),/complete expected labels/);
 assert.throws(()=>scoreSolarThermalCorpus([example(),example()]),/duplicate id/);
 assert.throws(()=>scoreSolarThermalCorpus([example({sourceType:'permissioned_real'})]),/permissioned and deidentified/);
});

test('synthetic coverage cannot open the real quote gate',()=>{
 const cases=Array.from({length:30},(_,i)=>example({id:`synthetic-${i}`,installerKey:`installer-${i%5}`,layoutKey:`pdf-${i%2}`}));
 const result=scoreSolarThermalCorpus(cases);
 assert.equal(result.metrics.recall,1);
 assert.equal(result.gate.ready,false);
 assert.equal(result.gate.reason,'insufficient_real_coverage');
 assert.equal(result.gate.realQuotes,0);
});

test('real cohort gate requires independent installer/layout and field coverage and zero unsupported positives',()=>{
 const cases=Array.from({length:30},(_,i)=>example({id:`real-${i}`,sourceType:'permissioned_real',permissioned:true,installerKey:`installer-${i%5}`,layoutKey:`pdf-${i%2}`,expected:Object.fromEntries(BENCHMARK_FIELDS.map(field=>[field,field==='collectorType'?'flat_plate':field==='backupHeat'?'included':field.endsWith('Scope')?'included':1]))}));
 const extractor=()=>({collectorType:'flat_plate',collectorAreaM2:1,cylinderLitres:1,annualSolarHeatKwh:1,priceGbp:1,backupHeat:'Included: evidence',heatAssumptions:{occupants:1,hotWaterLitresPerDay:1},installationScope:{roofMounting:{status:'included'},scaffolding:{status:'included'},pipework:{status:'included'},pumpControls:{status:'included'},commissioning:{status:'included'}},warranties:{collector:{years:1},cylinder:{years:1},workmanship:{years:1}}});
 const result=scoreSolarThermalCorpus(cases,{extractor});
 assert.equal(result.gate.ready,true);
 assert.equal(result.gate.realQuotes,30);
 assert.equal(result.metrics.recall,1);
 assert.equal(scoreSolarThermalCorpus(cases.slice(0,29),{extractor}).gate.ready,false);
 assert.equal(scoreSolarThermalCorpus(cases.map(c=>({...c,installerKey:'same'})),{extractor}).gate.ready,false);
});
