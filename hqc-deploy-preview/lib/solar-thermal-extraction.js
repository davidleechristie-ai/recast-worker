// Initial, dormant solar water-heating quote evidence. This is deliberately
// conservative: ambiguous alternatives and PV-only figures remain unknown.
const money=s=>Number(s.replace(/,/g,''));
const sentences=text=>String(text||'').match(/(?:\d\.\d|[^.!?\n])+[.!?]?/g)?.map(s=>s.trim()).filter(Boolean)||[];
const unique=(items)=>[...new Set(items.map(x=>x.value))];
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
  const rhi=lines.find(s=>/\b(?:domestic\s+)?RHI\b|renewable heat incentive/i.test(s))||null;
  const values={collectorType:type?.value??null,collectorAreaM2:area?.value??null,cylinderLitres:cylinder?.value??null,annualSolarHeatKwh:annual?.value??null,priceGbp:price?.value??null,backupHeat:null,mcsClaim:null,rhiClaim:rhi};
  const provenance={collectorType:type?.text??null,collectorAreaM2:area?.text??null,cylinderLitres:cylinder?.text??null,annualSolarHeatKwh:annual?.text??null,priceGbp:price?.text??null};
  const questions=[];
  if(!type||!area)questions.push('Which solar thermal collector type and aperture area are included in the final quote?');
  if(!cylinder)questions.push('What hot water cylinder and backup heat integration are included?');
  if(!annual)questions.push('What is the documented annual solar heat estimate and its household assumptions?');
  if(rhi)questions.push('The Domestic RHI closed to new applicants in March 2022. What current funding, if any, is actually available?');
  questions.push('Ask the installer to confirm roof, plumbing, water safety and commissioning scope; this quote check does not certify them.');
  return {technology:'solar_thermal',...values,provenance,questions};
}
