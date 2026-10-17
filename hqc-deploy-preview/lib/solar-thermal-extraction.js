// Initial, dormant solar water-heating quote evidence. This is deliberately
// conservative: ambiguous alternatives and PV-only figures remain unknown.
const money=s=>Number(s.replace(/,/g,''));
const sentences=text=>String(text||'').match(/(?:\d\.\d|[^.!?\n])+[.!?]?/g)?.map(s=>s.trim()).filter(Boolean)||[];
const unique=(items)=>[...new Set(items.map(x=>x.value))];
const thermalScopeLine=s=>!/(?:solar\s*PV|photovoltaic|electricity|kWp)/i.test(s);
function scopedCommitment(lines,subject){
  const hits=[];
  for(const line of lines){if(!thermalScopeLine(line)||!subject.test(line))continue;
    const included=/\b(?:included|provided|will be installed|will be provided)\b/i.test(line);
    const excluded=/\b(?:excluded|not included|not provided|not covered)\b/i.test(line);
    const conditional=/\b(?:subject to (?:site )?survey|subject to inspection|to be confirmed|optional|after survey)\b/i.test(line);
    const states=[included&&!/\bnot included\b/i.test(line),excluded,conditional].filter(Boolean).length;
    if(states!==1){if(states>1)hits.push({status:'ambiguous'});continue}
    hits.push({status:conditional?'conditional':excluded?'excluded':'included',quoteText:line});
  }
  return hits.length&&new Set(hits.map(x=>x.status)).size===1&&hits[0].status!=='ambiguous'?hits[0]:null;
}
function warranty(lines,subject){
  const hits=[];
  for(const line of lines){if(!thermalScopeLine(line)||!subject.test(line)||!/\bwarranty\b/i.test(line))continue;
    const years=[...line.matchAll(/\b(\d{1,2})\s*(?:years?|yrs?)\b/gi)].map(x=>Number(x[1]));
    if(years.length!==1||/\b(?:optional|subject to|or|up to|from)\b/i.test(line)){hits.push({years:null});continue}
    hits.push({years:years[0],quoteText:line});
  }
  return hits.length&&hits.every(x=>x.years===hits[0].years)&&hits[0].years!==null?hits[0]:null;
}
function assumption(lines,pattern){
  const hits=[];
  for(const line of lines){if(!thermalScopeLine(line)||!/\b(?:assum(?:e|es|ed|ption)|based on|estimate)\b/i.test(line))continue;
    const values=[...line.matchAll(pattern)].map(x=>Number(x[1]));
    if(values.length)hits.push({values,quoteText:line});
  }
  return hits.length===1&&hits[0].values.length===1?{value:hits[0].values[0],quoteText:hits[0].quoteText}:null;
}
function capture(lines,pattern,parse,scope=()=>true){
  const hits=[];
  for(const line of lines){if(!scope(line))continue;for(const match of line.matchAll(pattern))hits.push({value:parse(match),text:line})}
  return unique(hits).length===1?hits[0]:null;
}
export function extractSolarThermalQuote(text){
  const lines=sentences(text);
  const thermal=lines.some(s=>/solar\s+(?:thermal|water heating|hot water)|hot water.*solar/i.test(s));
  const pv=lines.some(s=>/\b(?:solar\s*PV|photovoltaic|kWp)\b/i.test(s));
  const thermalLine=s=>/solar\s+(?:thermal|water heating|hot water)|\bcollector(?:s)?\b|\baperture area\b/i.test(s)&&!/\b(?:solar\s*PV|photovoltaic|kWp)\b/i.test(s);
  const cylinderLine=s=>/\b(?:hot water|twin.coil|solar)\s+cylinder\b/i.test(s)&&!/\b(?:solar\s*PV|photovoltaic)\b/i.test(s);
  const type=capture(lines,/\b(flat[ -]?plate|evacuated[ -]?tube)\b/gi,m=>/flat/i.test(m[1])?'flat_plate':'evacuated_tube',thermalLine);
  const area=capture(lines,/\b(?:aperture\s+area\s+)?(\d+(?:\.\d+)?)\s*(?:m²|m2|square\s+metres?)(?!\w)/gi,m=>Number(m[1]),thermalLine);
  const cylinder=capture(lines,/\b(\d{2,4})\s*(?:litres?|liters?|l)\b/gi,m=>Number(m[1]),cylinderLine);
  const annual=capture(lines,/\b([\d,]+)\s*kWh\s*(?:\/\s*(?:year|yr|annum)|per\s+(?:year|annum))\b/gi,m=>money(m[1]),s=>/\b(?:solar\s+heat|solar\s+thermal\s+(?:yield|output)|hot\s+water\s+(?:yield|output))\b/i.test(s)&&!/\b(?:solar\s*PV|photovoltaic|electricity)\b/i.test(s));
  const price=thermal&&!pv?capture(lines,/£\s*([\d,]+(?:\.\d{2})?)/g,m=>money(m[1]),s=>/\b(?:total|installed price|quotation|quote price)\b/i.test(s)):null;
  const backupLines=lines.filter(s=>/\b(?:boiler|heat pump|immersion heater)\b/i.test(s)&&/\b(?:backup|top[ -]?up|connect(?:ed|ion)?|integrat(?:ed|ion)?)\b/i.test(s)&&!/\b(?:solar\s*PV|photovoltaic)\b/i.test(s));
  const backup=backupLines.length===1&&/\b(?:included|connected|provided)\b/i.test(backupLines[0])&&
    !/\b(?:excluded|not included|not connected|not provided|subject to|optional)\b/i.test(backupLines[0])
    ?'Included: '+backupLines[0]:null;
  const installationScope={
    roofMounting:scopedCommitment(lines,/\b(?:roof mounting|roof fixings?|roof brackets?)\b/i),
    scaffolding:scopedCommitment(lines,/\b(?:scaffold(?:ing)?|access tower)\b/i),
    pipework:scopedCommitment(lines,/\b(?:solar pipework|solar thermal pipework|thermal pipework)\b/i),
    pumpControls:scopedCommitment(lines,/\b(?:pump station|solar pump|solar controls?|pump and controls)\b/i),
    commissioning:scopedCommitment(lines,/\bcommissioning\b/i)
  };
  const warranties={collector:warranty(lines,/\bcollectors?\b/i),cylinder:warranty(lines,/\bcylinder\b/i),workmanship:warranty(lines,/\b(?:workmanship|installation work)\b/i)};
  const occupants=assumption(lines,/\b(\d{1,2})\s*(?:person|people|occupant)(?:\s+household)?\b/gi);
  const hotWater=assumption(lines,/\b(\d{2,4})\s*(?:litres?|liters?|l)\s*(?:\/|per\s*)\s*day\b/gi);
  const heatAssumptions={occupants:occupants?.value??null,hotWaterLitresPerDay:hotWater?.value??null,provenance:{occupants:occupants?.quoteText??null,hotWaterLitresPerDay:hotWater?.quoteText??null}};
  const rhi=lines.find(s=>/\b(?:domestic\s+)?RHI\b|renewable heat incentive/i.test(s))||null;
  const values={collectorType:type?.value??null,collectorAreaM2:area?.value??null,cylinderLitres:cylinder?.value??null,annualSolarHeatKwh:annual?.value??null,priceGbp:price?.value??null,backupHeat:backup,installationScope,warranties,heatAssumptions,mcsClaim:null,rhiClaim:rhi};
  const provenance={collectorType:type?.text??null,collectorAreaM2:area?.text??null,cylinderLitres:cylinder?.text??null,annualSolarHeatKwh:annual?.text??null,priceGbp:price?.text??null,backupHeat:backupLines.length===1?backupLines[0]:null};
  const questions=[];
  if(!type||!area)questions.push('Which solar thermal collector type and aperture area are included in the final quote?');
  if(!cylinder)questions.push('What hot water cylinder and backup heat integration are included?');
  if(!annual)questions.push('What is the documented annual solar heat estimate and its household assumptions?');
  if(rhi)questions.push('The Domestic RHI closed to new applicants in March 2022. What current funding, if any, is actually available?');
  questions.push('Ask the installer to confirm roof, plumbing, water safety and commissioning scope; this quote check does not certify them.');
  return {technology:'solar_thermal',...values,provenance,questions};
}
