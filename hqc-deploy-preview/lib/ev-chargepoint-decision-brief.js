// A deterministic, private EV decision draft. It only reorganises the
// evidence and questions produced by the EV adapter; it does not certify
// installation work or choose an installer.
const focusDimensions=new Set([
  'chargepoint','rated power kW','cabling scope','consumer unit works',
  'earthing scope','load management','DNO treatment','warranty years','price'
]);

export function buildEvDecisionBrief(result){
  const analyses=Array.isArray(result.analyses)?result.analyses:[result];
  const comparisonFocus=Array.isArray(result.comparison)&&analyses.length>=2
    ?result.comparison.filter(row=>{
      if(!focusDimensions.has(row.dimension))return false;
      const values=row.values.map(item=>item.value??null);
      return new Set(values.map(value=>JSON.stringify(value))).size>1;
    }).map(row=>({
      dimension:row.dimension,
      values:row.values.map(item=>({quoteId:item.quoteId,value:item.value??null})),
      evidenceState:row.values.some(item=>item.value==null)?'incomplete':'different'
    }))
    :[];
  return {
    technology:'ev_chargepoint',
    availability:'private_preview',
    title:'EV chargepoint decision brief',
    quoteSummaries:analyses.map((analysis,index)=>({
      quoteId:analysis.quoteId||'quote_'+(index+1),
      charger:[analysis.evidence?.make,analysis.evidence?.model].filter(Boolean).join(' ')||null,
      priceGbp:analysis.evidence?.priceGbp??null,
      openItems:[...(analysis.gaps||[])],
      questions:(analysis.installerQuestions||[]).map(item=>item.question)
    })),
    comparisonFocus,
    decisionCondition:'Confirm equipment, scope, exclusions, DNO responsibilities, warranties and final price in writing before choosing.',
    guardrails:['This brief reorganises written quote evidence only. It does not certify electrical safety, DNO acceptance, grant eligibility, compatibility, charging speed or savings.']
  };
}
