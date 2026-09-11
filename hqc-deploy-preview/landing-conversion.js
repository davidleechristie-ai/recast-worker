(()=>{
  const VARIANT='landing-trust-v1';
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
    // The upstream application already emits checker_cta_clicked with the canonical
    // `src` acquisition source. Do not attach another click tracker here: doing so
    // would double-count starts and could attribute the duplicate to a different source.
  };
  new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
  apply();
})();
