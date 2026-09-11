(()=>{
  const VARIANT='landing-trust-v2';
  const source=()=>new URLSearchParams(location.search).get('src')||'direct';
  const trackHeaderStart=()=>{
    fetch('/api/event',{
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({event:'checker_cta_clicked',source:source(),analysisId:'',quoteCount:0,provenance:'HEADER_START',isTest:false}),
      keepalive:true
    }).catch(()=>{});
  };
  const apply=()=>{
    const copy=document.querySelector('.copy');
    if(!copy)return;
    const btn=copy.querySelector('button.primary');
    if(btn&&btn.dataset.hqcLandingVariant!==VARIANT){
      btn.dataset.hqcLandingVariant=VARIANT;
      let reassurance=document.getElementById('hqc-start-reassurance');
      if(!reassurance){
        reassurance=document.createElement('div');
        reassurance.id='hqc-start-reassurance';
        reassurance.innerHTML='<b>See the gaps before you commit.</b><span> Takes about a minute to start · screenshot, photo or PDF · no account required.</span>';
        reassurance.style.cssText='margin:0 0 12px;max-width:520px;font-size:13px;line-height:1.45;color:#42566f';
        btn.insertAdjacentElement('beforebegin',reassurance);
      }
      // The hero CTA already emits checker_cta_clicked in the upstream application.
      // Do not attach another tracker to it or acquisition starts would double-count.
    }

    // The upstream landing-page header "Get started" button changes React state but
    // does not emit checker_cta_clicked. Track only that otherwise-invisible entry
    // route so landing -> checker-start measurement reflects genuine user behaviour.
    for(const headerBtn of document.querySelectorAll('header button')){
      if(!/^get started$/i.test((headerBtn.textContent||'').trim()))continue;
      if(headerBtn.dataset.hqcHeaderStartTracked==='1')continue;
      headerBtn.dataset.hqcHeaderStartTracked='1';
      headerBtn.addEventListener('click',trackHeaderStart,{passive:true});
    }
  };
  new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
  apply();
})();
