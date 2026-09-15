(()=>{
  const endpoint='/api/event';
  const send=(event,meta={})=>{
    const payload=JSON.stringify({event,path:location.pathname,referrer:document.referrer||null,meta,ts:new Date().toISOString()});
    if(navigator.sendBeacon){navigator.sendBeacon(endpoint,new Blob([payload],{type:'application/json'}));return;}
    fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:payload,keepalive:true}).catch(()=>{});
  };
  send('page_view');
  document.addEventListener('click',e=>{
    const link=e.target.closest('a'); if(!link)return;
    const label=(link.textContent||'').trim().slice(0,80);
    if(link.classList.contains('primary')||/founding|join|access|pricing/i.test(label)) send('commercial_cta_click',{label,href:link.getAttribute('href')});
    else if(/methodology|signal model|waste sales intelligence/i.test(label)) send('evidence_click',{label,href:link.getAttribute('href')});
  });
})();
