(()=>{
  const endpoint='/api/event';
  const send=(event,meta={})=>{
    const payload=JSON.stringify({event,path:location.pathname,referrer:document.referrer||null,meta,ts:new Date().toISOString()});
    if(navigator.sendBeacon){navigator.sendBeacon(endpoint,new Blob([payload],{type:'application/json'}));return;}
    fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:payload,keepalive:true}).catch(()=>{});
  };
  send('page_view');
  document.addEventListener('click',e=>{
    const target=e.target.closest('a,button'); if(!target)return;
    const label=(target.textContent||'').trim().slice(0,80);
    const href=target.getAttribute('href');
    if(target.matches('.filter,.detail,#editSettings')) send('dashboard_demo_interaction',{label,filter:target.dataset.filter||null});
    if(target.classList.contains('primary')||/founding|join|access|pricing/i.test(label)) send('commercial_cta_click',{label,href});
    else if(/methodology|signal model|waste sales intelligence/i.test(label)) send('evidence_click',{label,href});
  });
})();
