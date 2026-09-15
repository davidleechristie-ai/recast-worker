(()=>{
  const endpoint='/api/event';
  const send=(event,meta={})=>{
    const payload=JSON.stringify({event,path:location.pathname,referrer:document.referrer||null,meta,ts:new Date().toISOString()});
    if(navigator.sendBeacon){navigator.sendBeacon(endpoint,new Blob([payload],{type:'application/json'}));return;}
    fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:payload,keepalive:true}).catch(()=>{});
  };
  if(location.pathname==='/'||location.pathname==='/index.html'){
    const nav=document.querySelector('.navright');
    if(nav&&!nav.querySelector('[href="/proof"]')){
      const proof=document.createElement('a');proof.className='navlink';proof.href='/proof';proof.textContent='Live evidence';nav.prepend(proof);
    }
    if(nav&&!nav.querySelector('[href="/dashboard-demo"]')){
      const a=document.createElement('a');a.className='navlink';a.href='/dashboard-demo';a.textContent='Dashboard demo';nav.prepend(a);
    }
    const heroCta=document.querySelector('.hero .cta');
    if(heroCta&&!heroCta.querySelector('[href="/proof"]')){
      const p=document.createElement('a');p.className='btn primary';p.href='/proof';p.textContent='See genuine signals →';heroCta.prepend(p);
    }
    if(heroCta&&!heroCta.querySelector('[href="/dashboard-demo"]')){
      const a=document.createElement('a');a.className='btn';a.href='/dashboard-demo';a.textContent='Explore the dashboard →';heroCta.appendChild(a);
    }
  }
  send('page_view');
  document.addEventListener('click',e=>{
    const target=e.target.closest('a,button'); if(!target)return;
    const label=(target.textContent||'').trim().slice(0,80);
    const href=target.getAttribute('href');
    if(target.matches('.filter,.detail,#editSettings')) send('dashboard_demo_interaction',{label,filter:target.dataset.filter||null});
    if(target.classList.contains('primary')||/founding|join|access|pricing/i.test(label)) send('commercial_cta_click',{label,href});
    else if(/methodology|signal model|live evidence|genuine signals|waste sales intelligence|dashboard demo/i.test(label)) send('evidence_click',{label,href});
  });
})();
