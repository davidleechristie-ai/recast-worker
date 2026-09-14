(()=>{
  const VARIANT='landing-trust-v3';
  const source=()=>new URLSearchParams(location.search).get('src')||'direct';
  const observedStarts=new WeakSet();
  let upstreamStartSeenAt=0;

  const markUpstreamStart=(input,init)=>{
    try{
      const url=typeof input==='string'?input:(input&&input.url)||'';
      if(!/\/api\/event(?:\?|$)/.test(url))return;
      const raw=init?.body;
      if(typeof raw!=='string')return;
      const payload=JSON.parse(raw);
      if(payload?.event==='checker_cta_clicked')upstreamStartSeenAt=Date.now();
    }catch{}
  };

  if(!window.__hqcFetchStartObserverInstalled){
    window.__hqcFetchStartObserverInstalled=true;
    const nativeFetch=window.fetch.bind(window);
    window.fetch=(input,init)=>{markUpstreamStart(input,init);return nativeFetch(input,init);};
  }

  const emitFallbackStart=(provenance)=>{
    fetch('/api/event',{
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({event:'checker_cta_clicked',source:source(),analysisId:'',quoteCount:0,provenance,isTest:false}),
      keepalive:true
    }).catch(()=>{});
  };

  const trackWithFallback=(button,provenance)=>{
    if(observedStarts.has(button))return;
    observedStarts.add(button);
    button.addEventListener('click',()=>{
      const clickedAt=Date.now();
      setTimeout(()=>{
        if(upstreamStartSeenAt>=clickedAt-25)return;
        emitFallbackStart(provenance);
      },650);
    },{passive:true});
  };

  const apply=()=>{
    const copy=document.querySelector('.copy');
    if(copy){
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
      }
      if(btn)trackWithFallback(btn,'HERO_START_FALLBACK');
    }

    for(const headerBtn of document.querySelectorAll('header button')){
      if(!/^get started$/i.test((headerBtn.textContent||'').trim()))continue;
      trackWithFallback(headerBtn,'HEADER_START_FALLBACK');
    }
  };

  new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
  apply();
})();
