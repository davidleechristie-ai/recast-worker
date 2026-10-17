import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {extractSolarThermalQuote} from '../lib/solar-thermal-extraction.js';

export const BENCHMARK_FIELDS=Object.freeze([
 'collectorType','collectorAreaM2','cylinderLitres','annualSolarHeatKwh','priceGbp',
 'backupHeat','occupants','hotWaterLitresPerDay',
 'roofMountingScope','scaffoldingScope','pipeworkScope','pumpControlsScope','commissioningScope',
 'collectorWarrantyYears','cylinderWarrantyYears','workmanshipWarrantyYears'
]);
const scopeFields={roofMountingScope:'roofMounting',scaffoldingScope:'scaffolding',pipeworkScope:'pipework',pumpControlsScope:'pumpControls',commissioningScope:'commissioning'};
const warrantyFields={collectorWarrantyYears:'collector',cylinderWarrantyYears:'cylinder',workmanshipWarrantyYears:'workmanship'};
function validLabel(field,value){
 if(value===null)return true;
 if(field==='collectorType')return ['flat_plate','evacuated_tube'].includes(value);
 if(field==='backupHeat')return value==='included';
 if(field in scopeFields)return ['included','excluded','conditional'].includes(value);
 return typeof value==='number'&&Number.isFinite(value)&&value>0;
}
function valueFor(e,field){
 if(field==='backupHeat')return e.backupHeat?.startsWith('Included:')?'included':null;
 if(field==='occupants')return e.heatAssumptions?.occupants??null;
 if(field==='hotWaterLitresPerDay')return e.heatAssumptions?.hotWaterLitresPerDay??null;
 if(field in scopeFields)return e.installationScope?.[scopeFields[field]]?.status??null;
 if(field in warrantyFields)return e.warranties?.[warrantyFields[field]]?.years??null;
 return e[field]??null;
}
function tally(cases,extractor){
 const fields=Object.fromEntries(BENCHMARK_FIELDS.map(field=>[field,{positiveLabels:0,correctPositive:0,misses:0,falsePositives:0,correctUnknown:0}]));
 for(const entry of cases){
  const extracted=extractor(entry.quoteText);
  for(const field of BENCHMARK_FIELDS){
   const expected=entry.expected[field],actual=valueFor(extracted,field),counts=fields[field];
   if(expected!==null){counts.positiveLabels++;if(actual===expected)counts.correctPositive++;else counts.misses++;}
   if(expected===null){if(actual===null)counts.correctUnknown++;else counts.falsePositives++;}
  }
 }
 const metrics=Object.fromEntries(['positiveLabels','correctPositive','misses','falsePositives','correctUnknown'].map(key=>[key,Object.values(fields).reduce((sum,field)=>sum+field[key],0)]));
 metrics.recall=metrics.positiveLabels?metrics.correctPositive/metrics.positiveLabels:null;
 return {fields,metrics};
}
export function scoreSolarThermalCorpus(cases,{extractor=extractSolarThermalQuote}={}){
 if(!Array.isArray(cases))throw new TypeError('cases must be an array');
 const ids=new Set();
 for(const entry of cases){
  if(!entry||typeof entry.id!=='string'||!entry.id||ids.has(entry.id))throw new Error('missing or duplicate id');
  ids.add(entry.id);
  if(!['synthetic','permissioned_real'].includes(entry.sourceType)||typeof entry.quoteText!=='string'||!entry.quoteText||typeof entry.installerKey!=='string'||!entry.installerKey||typeof entry.layoutKey!=='string'||!entry.layoutKey)throw new Error('invalid benchmark case metadata');
  if(entry.sourceType==='permissioned_real'&&(entry.permissioned!==true||entry.deidentified!==true))throw new Error('real quotes must be permissioned and deidentified');
  if(!entry.expected||Object.keys(entry.expected).length!==BENCHMARK_FIELDS.length||BENCHMARK_FIELDS.some(field=>!Object.hasOwn(entry.expected,field)||entry.expected[field]===undefined))throw new Error('complete expected labels required, including null for unknowns');
  if(BENCHMARK_FIELDS.some(field=>!validLabel(field,entry.expected[field])))throw new Error('invalid expected label');
 }
 const all=tally(cases,extractor);
 const realCases=cases.filter(entry=>entry.sourceType==='permissioned_real');
 const real=tally(realCases,extractor);
 const installers=new Set(realCases.map(entry=>entry.installerKey)).size;
 const layouts=new Set(realCases.map(entry=>entry.layoutKey)).size;
 const covered=BENCHMARK_FIELDS.every(field=>real.fields[field].positiveLabels>=3);
 const coverage=realCases.length>=30&&installers>=5&&layouts>=2&&covered;
 const accurate=real.metrics.recall!==null&&real.metrics.recall>=0.95&&real.metrics.falsePositives===0;
 return {
  cohort:{total:cases.length,real:realCases.length,synthetic:cases.length-realCases.length},
  fields:all.fields,metrics:all.metrics,
  gate:{ready:coverage&&accurate,reason:!coverage?'insufficient_real_coverage':!accurate?'accuracy_below_gate':null,realQuotes:realCases.length,installers,layouts,realMetrics:real.metrics,realFieldCoverage:covered,
   criteria:{minRealQuotes:30,minInstallers:5,minLayouts:2,minPositivePerField:3,minRecall:0.95,maxFalsePositives:0}}
 };
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const path=process.argv[2];
 if(!path){console.error('Usage: node scripts/solar-thermal-benchmark.mjs /path/to/deidentified-corpus.json');process.exitCode=2;}
 else{
  try{
   const data=JSON.parse(await readFile(path,'utf8'));
   const report=scoreSolarThermalCorpus(data.cases);
   console.log(JSON.stringify(report,null,2));
   if(!report.gate.ready)process.exitCode=1;
  }catch{console.error('Benchmark input invalid; check JSON and required case labels.');process.exitCode=2;}
 }
}
