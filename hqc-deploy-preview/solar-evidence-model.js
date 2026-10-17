export const SOLAR_EVIDENCE_FIELDS = [
  {key:'price',label:'Total price'},
  {key:'panelModel',label:'Panel make/model'},
  {key:'panelCount',label:'Panel count'},
  {key:'arrayKwp',label:'Array capacity (kWp)'},
  {key:'inverterModel',label:'Inverter make/model'},
  {key:'inverterRatingKw',label:'Inverter rating'},
  {key:'batteryModel',label:'Battery make/model',optionalFor:'solar_only'},
  {key:'batteryUsableKwh',label:'Battery usable capacity',optionalFor:'solar_only'},
  {key:'annualGenerationKwh',label:'Annual generation estimate'},
  {key:'generationMethod',label:'Generation-estimate basis / MCS method wording'},
  {key:'selfConsumption',label:'Self-consumption assumption'},
  {key:'shading',label:'Shading assumption'},
  {key:'gridConnection',label:'DNO / G98 / G99 / G100 treatment'},
  {key:'scaffolding',label:'Scaffolding scope'},
  {key:'roofWorks',label:'Roof works / exclusions'},
  {key:'equipmentWarranty',label:'Equipment warranty'},
  {key:'workmanshipWarranty',label:'Workmanship warranty'},
  {key:'mcsClaim',label:'MCS certification claim / wording'}
];

const absent=v=>v==null||v===''||(typeof v==='string'&&/^(?:n\/?a|unknown|not stated|not found|not evidenced)$/i.test(v.trim()));

export function solarEvidenceCompleteness(quote={},systemType='solar_battery'){
  const applicable=SOLAR_EVIDENCE_FIELDS.filter(f=>!(systemType==='solar_only'&&f.optionalFor==='solar_only'));
  const documented=applicable.filter(f=>!absent(quote[f.key]));
  return {
    documented: documented.length,
    applicable: applicable.length,
    missing: applicable.filter(f=>absent(quote[f.key])).map(f=>f.key),
    note:'Documentation completeness only. It does not certify system design, roof suitability, grid approval, MCS status, savings or performance.'
  };
}

export function solarQuoteDifferences(quotes=[]){
  if(!Array.isArray(quotes)||quotes.length<2)return [];
  return SOLAR_EVIDENCE_FIELDS.flatMap(field=>{
    const values=quotes.map(q=>q?.[field.key]).filter(v=>!absent(v)).map(v=>String(v).trim());
    const unique=[...new Set(values)];
    return unique.length>1?[{key:field.key,label:field.label,values:quotes.map(q=>absent(q?.[field.key])?null:q[field.key])}]:[];
  });
}

export const SOLAR_GUARDRAILS = Object.freeze({
  certification:'Automated quote checking does not certify electrical design, MCS status, DNO approval or structural/roof suitability.',
  performance:'Generation, self-consumption, export and savings figures are quote assumptions/estimates, not guaranteed outcomes.',
  scope:'A documented item is not evidence that the item is technically appropriate; HQC checks what the written quote says and highlights differences or omissions.'
});
