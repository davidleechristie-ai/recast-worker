(()=>{
 const qs=(s,r=document)=>r.querySelector(s),qsa=(s,r=document)=>[...r.querySelectorAll(s)];
 const read=()=>{try{return JSON.parse(localStorage.getItem('hqc_case')||'[]')}catch{return[]}};
 function addQuote(){
  sessionStorage.setItem('hqc_journey_mode','compare');sessionStorage.setItem('hqc_compare_intent','1');sessionStorage.setItem('hqc_add_second','1');sessionStorage.setItem('hqc_pending_quotes',JSON.stringify(read()));
  // Results are rendered inside the upstream SPA. Searching for a generic "upload"
  // control can select the completed Upload step and leave the customer on Results.
  // Navigate explicitly to the homepage intake route; decision-entry performs the
  // instrumented autostart there and upload-friction restores the comparison state.
  location.assign('/?hqc_start=1&src=results_compare&add_quote=1');
 }
 function apply(){const top=qs('.resultsTop');if(!top)return;const quotes=read(),count=Math.max(1,quotes.length),compare=sessionStorage.getItem('hqc_journey_mode')==='compare'||sessionStorage.getItem('hqc_compare_intent')==='1';
  if(qs('#hqc-simple-summary'))return;
  qsa('h1,h2',top).forEach(h=>{if(/decision case/i.test(h.textContent||''))h.textContent=count>1?'Your quote comparison':'Your quote check'});
  const oldStatus=qsa('.panel,.card,section').find(x=>/not ready to choose|ready to choose/i.test(x.innerText||''));if(oldStatus)oldStatus.style.setProperty('display','none','important');
  const summary=document.createElement('section');summary.id='hqc-simple-summary';summary.className='hqc-approved-result-summary';summary.style.cssText='margin:18px 0;padding:28px;border:1px solid #d8e8e1;border-radius:14px;background:linear-gradient(110deg,#f5fcf8,#eef9f4);color:#102642';
  summary.innerHTML=count===1?`<div style="font-size:12px;font-weight:800;color:#14734f;text-transform:uppercase">Quote checked</div><h2 style="margin:6px 0 8px;font-size:34px">A few details are missing</h2><p style="margin:0 0 16px;line-height:1.55;color:#5c6d82;font-size:16px">Your quote has useful information, but confirm the important gaps below before paying a deposit.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button data-next="questions" style="padding:12px 16px;border:0;border-radius:9px;background:#087f5b;color:white;font-weight:800">View questions to ask →</button><button data-next="compare" style="padding:12px 16px;border:1px solid #b8d5ca;border-radius:9px;background:white;color:#17352d;font-weight:800">Compare another quote →</button></div>`:`<div style="font-size:12px;font-weight:800;color:#14734f;text-transform:uppercase">Comparison complete</div><h2 style="margin:6px 0 8px;font-size:34px">Compare your quotes</h2><p style="margin:0 0 16px;line-height:1.55;color:#5c6d82;font-size:16px">See the important differences side by side, then resolve anything unclear before you choose.</p><button data-next="questions" style="padding:12px 16px;border:0;border-radius:9px;background:#087f5b;color:white;font-weight:800">See what I should ask next →</button>`;
  top.insertAdjacentElement('afterend',summary);qs('[data-next="questions"]',summary)?.addEventListener('click',()=>qs('.questions')?.scrollIntoView({behavior:'smooth',block:'start'}));qs('[data-next="compare"]',summary)?.addEventListener('click',addQuote);
  if(compare&&count===1){const note=document.createElement('p');note.textContent='You chose Compare Quotes. Add your second quote to complete the comparison.';note.style.cssText='margin:12px 0 0;font-weight:700;color:#0b5f4a';summary.appendChild(note)}
  const completion=qs('#hqc-completeness');if(completion){const h=qs('h2',completion);if(h)h.textContent='What information is in the quote?';const p=qs('p',completion);if(p)p.innerHTML='<b>A simple completeness check.</b> This shows whether useful details are written in the quote; it does not certify the heat-pump design.';}
  qsa('button,a').forEach(x=>{if(/share decision case/i.test(x.textContent||''))x.textContent='Share my quote check';if(/print \/ save pdf/i.test(x.textContent||''))x.textContent='Save / print results'});
 }
 new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});setTimeout(apply,200);
})();
