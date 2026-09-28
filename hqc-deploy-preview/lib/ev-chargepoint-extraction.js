const one=(t,r,g=1)=>t.match(r)?.[g]??null;
const n=v=>v==null?null:Number(String(v).replace(/,/g,''));
const included=(text,feature)=>text.split(/[.;\n]/).some(sentence=>feature.test(sentence)&&!/(?:\bnot\s+included\b|\bexcluded\b|\bnot\s+(?:offered|provided)\b|\bno\s+(?:solar|PV|smart|dynamic\s+load)\b)/i.test(sentence));
// A mention alone is not a commitment to installation scope.
const scope=(text,subject)=>{
  for(const part of text.match(/[^.!?]+[.!?]?/g)||[]){
    const quoteText=part.trim();
    if(!subject.test(quoteText))continue;
    // Opposing commitments in one sentence may refer to different works.
    if(/\b(?:included|will be installed|will be provided)\b/i.test(quoteText)&&/\b(?:excluded|not included|not provided|not covered)\b/i.test(quoteText))continue;
    let status=null;
    if(/\b(?:excluded|not included|not provided|not covered)\b/i.test(quoteText))status='excluded';
    else if(/\b(?:subject to (?:site )?survey|subject to inspection|to be confirmed(?: on| after)? (?:site )?survey)\b/i.test(quoteText))status='conditional';
    else if(/\b(?:included|will be (?:installed|provided)|we will (?:install|provide))\b/i.test(quoteText)||/^(?:\d+\.\s*)?(?:(?:supply and )?install|run|route)\b/i.test(quoteText))status='included';
    if(status)return {status,quoteText};
  }
  return null;
};
const warrantyNumber={one:1,two:2,three:3,four:4,five:5};
export function extractEvChargepointEvidence(quoteText=''){
  const t=String(quoteText||'').replace(/\s+/g,' ').trim();
  const m=t.match(/(?:install(?:ation)?\s+of\s+)([A-Z][A-Za-z0-9+.-]+)\s+([A-Z][A-Za-z0-9+.-]+)\s+(?:EV\s+)?(?:charger|chargepoint)/i)
    ||t.match(/(?:install\s+)([A-Z][A-Za-z0-9+.-]+)\s+([A-Z][A-Za-z0-9+.-]+)\s+(?:EV\s+)?(?:charger|chargepoint)/i)
    ||t.match(/(?:supply\s+and\s+install:\s*|installer\s+to\s+supply\s+)([A-Z][A-Za-z0-9+.-]+)\s+([A-Z][A-Za-z0-9+.-]+(?:\s+[A-Z][A-Za-z0-9+.-]+){0,2})\s+\d+(?:\.\d+)?\s*kW\s+(?:EV\s+)?(?:charger|chargepoint)/i)
    ||t.match(/\bcharger(?:\s+model)?\s*:\s*([A-Z][A-Za-z0-9+.-]+)\s+([A-Z][A-Za-z0-9+.-]+)/i);
  const installedModels=[...t.matchAll(/(?:install(?:ation)?\s+of\s+|install\s+)([A-Z][A-Za-z0-9+.-]+)\s+([A-Z][A-Za-z0-9+.-]+)\s+(?:EV\s+)?(?:charger|chargepoint)/gi)]
    .map(x=>x[1]+' '+x[2]);
  const multipleModels=new Set(installedModels.map(x=>x.toLowerCase())).size>1;
  const powers=[...t.matchAll(/\b(\d+(?:\.\d+)?)\s*kW\b(?=\s*(?:EV\s+)?(?:charger|chargepoint|charging)|\))/gi)].map(x=>Number(x[1]));
  const distinctPowers=[...new Set(powers)];
  const years=one(t,/(?:equipment|charger|chargepoint|installation|workmanship)\s+warranty\s*(\d+)\s*years?/i);
  const alternateYears=one(t,/\b(one|two|three|four|five|\d+)[- ]year\s+warranty\b/i);
  const warrantyYears=years==null?(alternateYears==null?null:(warrantyNumber[alternateYears.toLowerCase()]??Number(alternateYears))):n(years);
  const explicitLoad=included(t,/\b(?:CT|current transformer)\s+clamp\b[^.]{0,30}\bload\s+balancing|load\s+balancing\s+clamp/i);
  const prices=[...t.matchAll(/\b(?:total(?:\s+(?:installed\s+price|payable|price))?|installed\s+price|price)\s*(?:price\s*)?(?:\([^)]*\)\s*)?(?:of\s*)?£([\d,]+(?:\.\d{1,2})?)/gi)].map(x=>n(x[1]));
  const distinctPrices=[...new Set(prices)];
  return {
    technology:'ev_chargepoint',make:multipleModels?null:m?.[1]??null,model:multipleModels?null:m?.[2]??null,
    powerKw:distinctPowers.length===1?distinctPowers[0]:null,
    tethered:/\btethered\b/i.test(t)&&/\buntethered\b/i.test(t)?null:(/\btethered\b/i.test(t)?true:(/\buntethered\b/i.test(t)?false:null)),
    connector:one(t,/\b(Type\s*[12])\s+(?:(?:tethered\s+|untethered\s+)?(?:connector|cable|socket))/i),
    smart:included(t,/\bsmart\s+(?:charging|charger|functionality)|app\s+control|scheduled\s+charging/i)?true:null,
    loadManagement:included(t,/dynamic\s+load\s+(?:management|balancing)/i)?'dynamic load management stated':(explicitLoad&&/\b(?:CT|current transformer)\s+clamp\b[^.]{0,30}\bload\s+balancing[^.]{0,30}\bincluded\b|load\s+balancing\s+clamp[^.]{0,30}\bincluded\b/i.test(t)?'load balancing clamp stated':null),
    pvIntegration:included(t,/(?:solar|PV)\s+(?:integration|surplus\s+charging)/i)?'solar/PV integration stated':null,
    dnoTreatment:one(t,/(DNO[^.]{0,80}(?:notification|notify|application|approval)[^.]*)/i),
    warrantyYears,
    priceGbp:distinctPrices.length===1?distinctPrices[0]:null,
    cablingScope:scope(t,/\b(?:cable|cabling)\b/i),
    consumerUnitScope:scope(t,/\b(?:consumer unit|fuse ?board)\b/i),
    earthingScope:scope(t,/\b(?:earthing|earth|bonding)\b/i)
  };
}
