import {extractSolarThermalQuote} from './solar-thermal-extraction.js';

const gapDefinitions=[
 ['collector type',e=>!e.collectorType,'Which collector type is included in the final solar thermal proposal?'],
 ['collector aperture area',e=>e.collectorAreaM2==null,'What collector aperture area in m² is included?'],
 ['hot water cylinder',e=>e.cylinderLitres==null,'What hot water cylinder capacity and connections are included?'],
 ['backup heat integration',e=>!e.backupHeat,'How will the boiler, heat pump or immersion heater provide backup hot water?'],
 ['annual solar heat estimate',e=>e.annualSolarHeatKwh==null,'What is the annual solar heat estimate and what household hot-water assumptions support it?'],
 ['annual solar heat assumptions',e=>e.heatAssumptions?.occupants==null||e.heatAssumptions?.hotWaterLitresPerDay==null,'What household occupancy and daily hot-water demand were assumed for the annual heat estimate?'],
 ['installation scope',e=>Object.values(e.installationScope||{}).some(x=>!x),'Which roof mounting, scaffolding, solar pipework, pump/controls and commissioning works are included, excluded or subject to survey?'],
 ['warranty periods',e=>Object.values(e.warranties||{}).some(x=>!x),'What are the separate collector, cylinder and workmanship warranty periods and their terms?'],
 ['installed price',e=>e.priceGbp==null,'What is the final VAT-inclusive installed price and which works are excluded?']
];
const guardrails=[
 'This checks wording in the supplied quote, not roof, plumbing or water-safety approval.',
 'Installer solar heat estimates are claims, not guaranteed hot-water coverage or savings. MCS certification and funding eligibility are not verified.',
 'The Domestic RHI closed to new applicants in March 2022.'
];
export function analyseSolarThermalQuote({quoteText='',quoteId=null}={}){
 if(typeof quoteText!=='string'||!/solar\s+(?:thermal|water heating|hot water)|hot water.*solar/i.test(quoteText))
   return {ok:false,technology:'solar_thermal',quoteId,error:'solar_thermal_evidence_required'};
 const evidence=extractSolarThermalQuote(quoteText);
 const gaps=gapDefinitions.filter(([,missing])=>missing(evidence)).map(([name])=>name);
 const findings=[],installerScopeQuestions=[];
 for(const [key,value,unit] of [['collector_type',evidence.collectorType,''],['collector_area',evidence.collectorAreaM2,' m²'],['cylinder',evidence.cylinderLitres,' litres'],['annual_heat',evidence.annualSolarHeatKwh,' kWh/year'],['price',evidence.priceGbp,' GBP']]){
   if(value!=null)findings.push({key,evidenceState:key==='annual_heat'?'installer_claim':'stated',text:`${value}${unit} stated in quote`,quoteText:evidence.provenance[{collector_type:'collectorType',collector_area:'collectorAreaM2',cylinder:'cylinderLitres',annual_heat:'annualSolarHeatKwh',price:'priceGbp'}[key]]});
 }
 for(const [name,item] of Object.entries(evidence.installationScope)){
   if(item){findings.push({key:`scope_${name.replace(/[A-Z]/g,x=>'_'+x.toLowerCase())}`,evidenceState:item.status,text:`${name.replace(/[A-Z]/g,x=>' '+x.toLowerCase())}: ${item.status}`,quoteText:item.quoteText});
     if(item.status==='excluded'||item.status==='conditional')installerScopeQuestions.push({name,status:item.status});}
 }
 for(const [name,item] of Object.entries(evidence.warranties))if(item)findings.push({key:`warranty_${name}`,evidenceState:'stated',text:`${name} warranty ${item.years} years stated in quote`,quoteText:item.quoteText});
 if(evidence.heatAssumptions.occupants!=null&&evidence.heatAssumptions.hotWaterLitresPerDay!=null)findings.push({key:'heat_assumptions',evidenceState:'installer_claim',text:`Estimate assumes ${evidence.heatAssumptions.occupants} occupants and ${evidence.heatAssumptions.hotWaterLitresPerDay} litres/day hot water`,quoteText:evidence.heatAssumptions.provenance.occupants});
 const installerQuestions=gapDefinitions.filter(([name])=>gaps.includes(name)).map(([evidenceGap,,question],i)=>({id:`gap_${i+1}`,evidenceGap,question}));
 for(const {name,status} of installerScopeQuestions)installerQuestions.push({id:`scope_${name}`,evidenceGap:`${name} ${status}`,question:`Please confirm how ${name.replace(/[A-Z]/g,x=>' '+x.toLowerCase())} marked ${status} will be supplied and priced in the final proposal.`});
 installerQuestions.push({id:'scope_confirm',evidenceGap:null,question:'Please confirm roof mounting, plumbing, pump/control, water-safety and commissioning work in the price.'});
 installerQuestions.push({id:'warranty_confirm',evidenceGap:null,question:'Please confirm collector, cylinder and workmanship warranty periods and maintenance obligations.'});
 if(evidence.rhiClaim)installerQuestions.push({id:'historic_rhi',evidenceGap:'historic RHI claim',question:'The Domestic RHI closed to new applicants in March 2022. What current funding, if any, applies to this quote?'});
 return {ok:true,technology:'solar_thermal',quoteId,evidence,gaps,findings,installerQuestions,guardrails};
}
const dimensions=[['collector type',e=>e.collectorType],['collector aperture m²',e=>e.collectorAreaM2],['cylinder litres',e=>e.cylinderLitres],['annual solar heat kWh',e=>e.annualSolarHeatKwh],['assumed occupants',e=>e.heatAssumptions.occupants],['assumed hot-water litres/day',e=>e.heatAssumptions.hotWaterLitresPerDay],['backup heat',e=>e.backupHeat],['roof mounting scope',e=>e.installationScope.roofMounting?.status],['scaffolding scope',e=>e.installationScope.scaffolding?.status],['pipework scope',e=>e.installationScope.pipework?.status],['pump/controls scope',e=>e.installationScope.pumpControls?.status],['commissioning scope',e=>e.installationScope.commissioning?.status],['collector warranty years',e=>e.warranties.collector?.years],['cylinder warranty years',e=>e.warranties.cylinder?.years],['workmanship warranty years',e=>e.warranties.workmanship?.years],['installed price',e=>e.priceGbp]];
export function compareSolarThermalQuotes(quotes=[]){
 const analyses=quotes.map((q,i)=>analyseSolarThermalQuote({quoteText:typeof q==='string'?q:q.quoteText,quoteId:typeof q==='string'?`quote_${i+1}`:q.quoteId||`quote_${i+1}`}));
 return {ok:analyses.length>=2&&analyses.every(a=>a.ok),technology:'solar_thermal',analyses,comparison:dimensions.map(([dimension,get])=>({dimension,values:analyses.map(a=>({quoteId:a.quoteId,value:a.ok?(get(a.evidence)??null):null})),evidenceOnly:true})),conclusion:'No automatic winner: compare evidenced collectors, cylinder, estimated heat, installation scope and price before deciding.',guardrails};
}
