import {analyseSolarThermalQuote,compareSolarThermalQuotes} from './solar-thermal-analysis.js';
import {buildSolarThermalDecisionBrief} from './solar-thermal-decision-brief.js';
import {normaliseExtractedMedia} from './solar-battery-media-ingestion.js';
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
function unpack(quote){
 if(quote?.extractedMedia){
   if(String(quote.extractedMedia.sourceMediaType||'').split(';')[0].trim().toLowerCase()!=='application/pdf')return {error:'text_pdf_required',status:415};
   const result=normaliseExtractedMedia(quote.extractedMedia);
   return result.ok?{quoteText:result.quoteText,provenance:result.provenance}:{error:result.error,status:400};
 }
 const text=quote?.quoteText;
 return typeof text==='string'&&text.trim()&&text.length<=120000?{quoteText:text.trim(),provenance:null}:{error:'quote_text_required_or_too_large',status:400};
}
export async function handleSolarThermalAnalysisRequest(request){
 if(request.method!=='POST')return json({error:'method_not_allowed'},405);
 if(!(request.headers.get('content-type')||'').toLowerCase().includes('application/json'))return json({error:'unsupported_media_type'},415);
 let body;try{body=await request.json()}catch{return json({error:'invalid_json'},400)}
 const technology=String(body?.technology||request.headers.get('x-hqc-technology')||'').trim().toLowerCase().replace(/[- ]/g,'_');
 if(technology!=='solar_thermal'||(body?.technology&&request.headers.get('x-hqc-technology')&&String(body.technology).replace(/[- ]/g,'_')!==String(request.headers.get('x-hqc-technology')).replace(/[- ]/g,'_')))return json({error:'unsupported_or_missing_technology'},400);
 if(Array.isArray(body?.quotes)){
   if(body.quotes.length<2||body.quotes.length>5)return json({error:'comparison_requires_two_to_five_quotes'},400);
   const inputs=body.quotes.map((q,i)=>({...unpack(q),quoteId:q?.quoteId||`quote_${i+1}`}));
   const invalid=inputs.find(x=>x.error);if(invalid)return json({error:invalid.error},invalid.status);
   const result=compareSolarThermalQuotes(inputs);if(!result.ok)return json({error:'solar_thermal_evidence_required'},422);
   result.extractionProvenance=inputs.map(x=>({quoteId:x.quoteId,provenance:x.provenance}));result.decisionBrief=buildSolarThermalDecisionBrief(result);return json(result);
 }
 const input=unpack(body);if(input.error)return json({error:input.error},input.status);
 const result=analyseSolarThermalQuote({quoteText:input.quoteText,quoteId:body.quoteId||null});
 if(!result.ok)return json({error:result.error},422);
 result.extractionProvenance=input.provenance;result.decisionBrief=buildSolarThermalDecisionBrief(result);return json(result);
}
