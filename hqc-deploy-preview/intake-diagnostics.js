(()=>{
  const params=new URLSearchParams(location.search);
  const source=params.get('src')||params.get('source')||'direct';
  const isTest=location.hostname!=='homequotecheck.co.uk'||['qa','release_probe','upload_handoff_smoke','pdf_probe','site_consistency'].some(key=>params.has(key));
  const technology=()=>{try{return sessionStorage.getItem('hqc_journey_technology')||'heat_pump'}catch{return 'heat_pump'}};
  const emit=event=>fetch('/api/event',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event,source,technology:technology(),isTest}),keepalive:true}).catch(()=>{});
  document.addEventListener('click',event=>{
    if(event.target?.closest?.('#hqc-choose-file'))emit('intake_picker_opened');
    else if(event.target?.closest?.('#hqc-enter-manual'))emit('intake_manual_opened');
  });
  document.addEventListener('change',event=>{
    if(event.isTrusted&&event.target?.matches?.('input[type="file"]')&&event.target.files?.length)emit('intake_file_selected');
  });
})();
