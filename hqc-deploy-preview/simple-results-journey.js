(()=>{
 const qs=(s,r=document)=>r.querySelector(s),qsa=(s,r=document)=>[...r.querySelectorAll(s)];
 const read=()=>{try{return JSON.parse(localStorage.getItem('hqc_case')||'[]')}catch{return[]}};
 const source=()=>new URLSearchParams(location.search).get('src')||new URLSearchParams(location.search).get('source')||'direct';
 const technology=()=>{try{return new URLSearchParams(location.search).get('technology')||sessionStorage.getItem('hqc_journey_technology')||'heat_pump'}catch{return'heat_pump'}};
 const emit=(event,extra={})=>fetch('/api/event',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event,source:source(),technology:technology(),analysisId:localStorage.getItem('hqc_analysis_id')||'',quoteCount:read().length,isTest:false,...extra}),keepalive:true}).catch(()=>{});
 function addQuote(){
  emit('alternative_quote_intent',{action:'compare_existing_quote'});
  sessionStorage.setItem('hqc_journey_mode','compare');sessionStorage.setItem('hqc_compare_intent','1');sessionStorage.setItem('hqc_add_second','1');sessionStorage.setItem('hqc_pending_quotes',JSON.stringify(read()));
  location.assign('/?hqc_start=1&src=results_compare&add_quote=1');
 }
 function addRevenuePrompt(summary){
  if(qs('#hqc-revenue-next-step'))return;
  const box=document.createElement('section');box.id='hqc-revenue-next-step';box.style.cssText='margin:14px 0 0;padding:18px;border:1px solid #cfe3da;border-radius:12px;background:#fff;color:#102642';
  box.innerHTML='<div style="font-size:11px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:#087f5b">Before you commit</div><h3 style="margin:5px 0 7px;font-size:20px">Would another quote help you decide?</h3><p style="margin:0 0 12px;color:#5c6d82;line-height:1.5">Add another installer quote and HQC will compare the important differences side by side. You stay in control and we do not sell your contact details.</p><button data-hqc-add-alternative style="width:100%;min-height:48px;padding:12px 16px;border:0;border-radius:9px;background:#0b2548;color:#fff;font-weight:800;cursor:pointer">Add another quote to compare →</button>';
  summary.insertAdjacentElement('afterend',box);
  qs('[data-hqc-add-alternative]',box)?.addEventListener('click',addQuote);
  emit('commercial_next_step_viewed',{offer:'add_alternative_quote'});
 }
 function apply(){const top=qs('.resultsTop');if(!top)return;const quotes=read(),count=Math.max(1,quotes.length),compare=sessionStorage.getItem('hqc_journey_mode')==='compare'||sessionStorage.getItem('hqc_compare_intent')==='1';
  if(qs('#hqc-simple-summary'))return;
  qsa('h1,h2',top).forEach(h=>{if(/decision case/i.test(h.textContent||''))h.textContent=count>1?'Your quote comparison':'Your quote check'});
  const oldStatus=qsa('.panel,.card,section').find(x=>/not ready to choose|ready to choose/i.test(x.innerText||''));if(oldStatus)oldStatus.style.setProperty('display','none','important');
  const summary=document.createElement('section');summary.id='hqc-simple-summary';summary.className='hqc-approved-result-summary';summary.style.cssText='margin:18px 0;padding:28px;border:1px solid #d8e8e1;border-radius:14px;background:linear-gradient(110deg,#f5fcf8,#eef9f4);color:#102642';
  summary.innerHTML=count===1?`<div style="font-size:12px;font-weight:800;color:#14734f;text-transform:uppercase">Your quote check</div><h2 style="margin:6px 0 8px;font-size:34px">A few details need checking</h2><p style="margin:0 0 16px;line-height:1.55;color:#5c6d82;font-size:16px">We found useful information in your quote, but there are gaps worth resolving before you pay a deposit.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button data-next="questions" style="padding:12px 16px;border:0;border-radius:9px;background:#087f5b;color:white;font-weight:800">See what to ask the installer →</button><button data-next="compare" style="padding:12px 16px;border:1px solid #b8d5ca;border-radius:9px;background:white;color:#17352d;font-weight:800">Add another quote →</button></div>`:`<div style="font-size:12px;font-weight:800;color:#14734f;text-transform:uppercase">Quote comparison complete</div><h2 style="margin:6px 0 8px;font-size:34px">See the differences that matter</h2><p style="margin:0 0 16px;line-height:1.55;color:#5c6d82;font-size:16px">Compare price, scope and evidence side by side, then resolve anything unclear before you choose.</p><button data-next="questions" style="padding:12px 16px;border:0;border-radius:9px;background:#087f5b;color:white;font-weight:800">See what I should ask next →</button>`;
  top.insertAdjacentElement('afterend',summary);
  emit('results_summary_viewed',{resultMode:count>1?'comparison':'single'});
  qs('[data-next="questions"]',summary)?.addEventListener('click',()=>{emit('installer_questions_intent');qs('.questions')?.scrollIntoView({behavior:'smooth',block:'start'})});
  qs('[data-next="compare"]',summary)?.addEventListener('click',addQuote);
  if(count===1)addRevenuePrompt(summary);
  if(compare&&count===1){const note=document.createElement('p');note.textContent='You chose Compare Quotes. Add your second quote to complete the comparison.';note.style.cssText='margin:12px 0 0;font-weight:700;color:#0b5f4a';summary.appendChild(note)}
  const completion=qs('#hqc-completeness');if(completion){const h=qs('h2',completion);if(h)h.textContent='What information is in the quote?';const p=qs('p',completion);if(p)p.innerHTML='<b>A simple completeness check.</b> This shows whether useful details are written in the quote; it does not certify the system design.';}
  qsa('button,a').forEach(x=>{if(/share decision case/i.test(x.textContent||''))x.textContent='Share my quote check';if(/print \/ save pdf/i.test(x.textContent||''))x.textContent='Save / print results'});
 }
 new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});setTimeout(apply,200);
})();
