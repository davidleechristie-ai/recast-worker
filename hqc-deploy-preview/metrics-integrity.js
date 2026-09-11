(()=>{
  const qa=()=>location.hostname!=='homequotecheck.co.uk'||/[?&](?:qa|release_probe|upload_handoff_smoke|pdf_probe|site_consistency)=/i.test(location.search);
  const source=()=>new URLSearchParams(location.search).get('src')||new URLSearchParams(location.search).get('source')||'direct';
  const emit=(event,analysisId,quoteCount,provenance)=>fetch('/api/event',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event,source:source(),analysisId,quoteCount,provenance,isTest:qa()}),keepalive:true}).catch(()=>{});
  let last='';
  const reconcile=()=>{
    try{
      const id=localStorage.getItem('hqc_analysis_id')||'';
      if(!id||id==='demo'||id===last)return;
      const quotes=JSON.parse(localStorage.getItem('hqc_case')||'[]');
      if(!Array.isArray(quotes)||!quotes.length||!quotes.some(q=>q&&q.isReal===true))return;
      const results=document.querySelector('.resultsTop,.decision,.facts.panel');
      if(!results)return;
      last=id;
      const provenance=quotes.some(q=>q?.provenance==='USER_TRANSCRIBED')?'USER_TRANSCRIBED':'AI_EXTRACTED';
      emit('analysis_qualified_real_quote',id,Math.min(4,quotes.length),provenance);
    }catch{}
  };
  new MutationObserver(reconcile).observe(document.documentElement,{childList:true,subtree:true});
  addEventListener('pageshow',reconcile);
  setTimeout(reconcile,250);
  setTimeout(reconcile,1500);
})();
