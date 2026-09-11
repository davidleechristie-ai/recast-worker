(()=>{
  const VARIANT='landing-trust-v1';
  const EVENT_ENDPOINT='/api/event';
  const isQa=/[?&](?:qa|release_probe|upload_handoff_smoke)=/i.test(location.search);
  const source=()=>new URLSearchParams(location.search).get('source')||'homepage';
  const emit=(name,extra={})=>{try{fetch(EVENT_ENDPOINT,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event:name,source:source(),variant:VARIANT,isTest:isQa,...extra}),keepalive:true});}catch{}};
  const apply=()=>{
    const copy=document.querySelector('.copy');
    if(!copy)return;
    const btn=copy.querySelector('button.primary');
    if(!btn||btn.dataset.hqcLandingVariant===VARIANT)return;
    btn.dataset.hqcLandingVariant=VARIANT;
    let reassurance=document.getElementById('hqc-start-reassurance');
    if(!reassurance){
      reassurance=document.createElement('div');
      reassurance.id='hqc-start-reassurance';
      reassurance.innerHTML='<b>See the gaps before you commit.</b><span> Takes about a minute to start · screenshot, photo or PDF · no account required.</span>';
      reassurance.style.cssText='margin:0 0 12px;max-width:520px;font-size:13px;line-height:1.45;color:#42566f';
      btn.insertAdjacentElement('beforebegin',reassurance);
    }
    // The metrics API has a fixed event vocabulary. Keep variant attribution on the
    // supported CTA event instead of emitting a separate unsupported exposure event.
    btn.addEventListener('click',()=>emit('checker_cta_clicked',{placement:'homepage_hero'}),{once:true});
  };
  new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
  apply();
})();
