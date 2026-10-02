(()=>{
  const params=new URLSearchParams(location.search);
  const source=params.get('src')||params.get('source')||'direct';
  const isTest=location.hostname!=='homequotecheck.co.uk'||['qa','release_probe','upload_handoff_smoke','pdf_probe','site_consistency'].some(key=>params.has(key));
  const technology=()=>{try{return sessionStorage.getItem('hqc_journey_technology')||'heat_pump'}catch{return 'heat_pump'}};
  const emit=(event,extra={})=>fetch('/api/event',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event,source,technology:technology(),isTest,...extra}),keepalive:true}).catch(()=>{});
  document.addEventListener('click',event=>{
    if(event.target?.closest?.('#hqc-choose-file'))emit('intake_picker_opened');
    else if(event.target?.closest?.('#hqc-enter-manual'))emit('intake_manual_opened');
  });
  document.addEventListener('change',event=>{
    if(event.isTrusted&&event.target?.matches?.('input[type="file"]')&&event.target.files?.length){emit('intake_file_selected',{fileCount:event.target.files.length});emit('upload_handoff_started',{fileCount:event.target.files.length});}
  });
  let lastStage='';
  const observe=()=>{const text=(document.body?.innerText||'').replace(/\s+/g,' ');let stage='';if(/ready to analyse|analyse my quote|analyse my quotes/i.test(text))stage='analysis_ready';else if(/your quote check|your quote comparison|comparison complete/i.test(text))stage='results_visible';else if(/could not|failed|try again|error/i.test(text)&&/quote|analysis|upload/i.test(text))stage='analysis_error_visible';if(stage&&stage!==lastStage){lastStage=stage;emit(stage);}};
  new MutationObserver(observe).observe(document.documentElement,{childList:true,subtree:true});setTimeout(observe,300);
})();