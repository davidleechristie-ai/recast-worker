(()=>{
  const q=(s,r=document)=>r.querySelector(s);
  const qa=new URLSearchParams(location.search).get('qa')==='1';
  const isDecision=/\.html$/i.test(location.pathname||'');
  const sourceFromPage=()=>{
    const p=new URLSearchParams(location.search);
    const explicit=p.get('src')||p.get('source')||p.get('utm_source');
    if(explicit&&/^[A-Za-z0-9_-]{2,80}$/.test(explicit))return explicit;
    const path=(location.pathname||'').toLowerCase();
    if(path.includes('is-this-a-good-heat-pump-quote'))return 'organic_goodquote_static';
    if(path.includes('compare-heat-pump-quotes'))return 'organic_compare_static';
    return 'organic_decision';
  };
  const acquisitionSource=sourceFromPage();
  const withAutoStart=(href)=>{
    try{
      const u=new URL(href,location.origin);
      if(u.origin!==location.origin||u.pathname!=='/')return href;
      u.searchParams.set('hqc_start','1');
      // The upstream app's canonical acquisition key is `src`. Using `source`
      // causes core landing/CTA/upload events to fall back to `direct`.
      if(!u.searchParams.get('src'))u.searchParams.set('src',acquisitionSource);
      u.searchParams.delete('source');
      return `${u.pathname}${u.search}${u.hash}`;
    }catch{return href;}
  };
  if(isDecision){
    // A visitor who clicks a decision-page CTA has already expressed checker intent.
    // Deep-link every same-origin homepage CTA into quote intake and retain the
    // decision-page cohort so checker starts/uploads are not misclassified as direct.
    [...document.querySelectorAll('a[href]')].forEach(a=>{
      const href=a.getAttribute('href')||'';
      const text=(a.textContent||'').trim();
      if(!/check (?:my|your)|quote|free|upload/i.test(text))return;
      const next=withAutoStart(href);
      if(next!==href)a.setAttribute('href',next);
    });
  }
  if(isDecision&&!q('#hqc-decision-entry')){
    const bar=document.createElement('aside');
    bar.id='hqc-decision-entry';
    bar.setAttribute('aria-label','Check your heat-pump quote');
    bar.style.cssText='position:fixed;z-index:2147483000;left:50%;bottom:14px;transform:translateX(-50%);width:min(720px,calc(100% - 24px));display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 14px 12px 16px;border:1px solid #cfe6de;border-radius:14px;background:rgba(255,255,255,.97);box-shadow:0 10px 30px rgba(11,37,72,.16);font:600 14px/1.35 system-ui,-apple-system,Segoe UI,sans-serif;color:#0b2548';
    bar.innerHTML=`<span><b style="display:block">Already have a quote?</b><small style="font-weight:500;color:#64748b">Check the actual document, not just the averages.</small></span><a href="/?hqc_start=1&src=${encodeURIComponent(acquisitionSource)}" style="flex:0 0 auto;text-decoration:none;border-radius:9px;background:#087f5b;color:white;padding:11px 14px;font-weight:800;white-space:nowrap">Check my quote →</a>`;
    if(innerWidth<620){bar.style.flexDirection='column';bar.style.alignItems='stretch';q('a',bar).style.textAlign='center';}
    document.body.appendChild(bar);
  }
  const params=new URLSearchParams(location.search);
  if(location.pathname==='/'&&params.get('hqc_start')==='1'&&!qa&&!sessionStorage.getItem('hqc_decision_autostart')){
    // Prefer the hero CTA because the upstream app already instruments it. The old
    // generic button search could select the header "Get started" button before the
    // supplemental header tracker had attached, producing upload/analysis with no CTA.
    const start=q('.copy button.primary')||[...document.querySelectorAll('button')].find(x=>/check my quote|check my heat-pump quotes|get started/i.test(x.textContent||''));
    if(start){sessionStorage.setItem('hqc_decision_autostart','1');start.click();}
  }
})();
