(()=>{
  const OFFER_ID='hqc-decision-pack-offer';
  const STORAGE_CASE='hqcDecisionPackCaseId';
  const STORAGE_PAID='hqcDecisionPackPaid';
  const EVENT_ENDPOINT='/api/event';
  const qa=/[?&](?:qa|release_probe|upload_handoff_smoke)=/i.test(location.search);
  const caseId=(()=>{let v=localStorage.getItem(STORAGE_CASE);if(!v){v=(crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`);localStorage.setItem(STORAGE_CASE,v);}return v;})();
  const event=async(name,extra={})=>{try{await fetch(EVENT_ENDPOINT,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event:name,caseId,isTest:qa,...extra}),keepalive:true});}catch{}};
  const paid=()=>{try{return JSON.parse(localStorage.getItem(STORAGE_PAID)||'null')?.caseId===caseId;}catch{return false;}};
  const setPaid=(session)=>localStorage.setItem(STORAGE_PAID,JSON.stringify({caseId,sessionId:session,paidAt:new Date().toISOString()}));
  const hasDecisionCase=()=>/your decision case|decision case/i.test(document.body?.innerText||'');
  const findUpload=()=>[...document.querySelectorAll('input[type="file"]')].find(el=>!el.disabled)||null;
  const installerQuestions=()=>{
    const text=(document.body?.innerText||'').toLowerCase();
    const q=[];
    const add=(needle,question)=>{if(text.includes(needle))q.push(question);};
    add('heat loss','Please provide the room-by-room heat-loss calculation and the design assumptions used.');
    add('flow temperature','What design flow temperature has been assumed, and which emitters have been sized against it?');
    add('radiator','Please confirm the proposed radiator/emitter schedule and outputs at the design flow temperature.');
    add('cylinder','Please confirm the hot-water cylinder specification, capacity and how it has been sized for the household.');
    add('electrical','Please confirm any electrical upgrades or additional electrical works included or excluded from the quote.');
    add('grant','Please identify exactly which parts of the quoted price depend on grant/BUS assumptions and what evidence is required.');
    if(!q.length)q.push('Please provide the room-by-room heat-loss calculation and design assumptions.','What design flow temperature has been assumed and how have emitters been sized?','Please list all material exclusions, provisional sums and items that could change the final price.');
    q.push('Please confirm in writing which design calculations, commissioning records and handover documents will be provided before final payment.');
    return [...new Set(q)];
  };
  const printPack=()=>{
    const body=(document.body?.innerText||'').replace(/\n{3,}/g,'\n\n');
    const questions=installerQuestions().map((q,i)=>`${i+1}. ${q}`).join('\n');
    const w=open('','_blank');if(!w)return;
    w.document.write(`<html><head><title>Home Quote Check Decision Pack</title><style>body{font:16px/1.5 system-ui;max-width:820px;margin:40px auto;padding:0 24px;color:#17352d}h1{font-size:30px}h2{margin-top:30px}pre{white-space:pre-wrap;font:14px/1.5 system-ui;background:#f5faf7;padding:18px;border-radius:12px}</style></head><body><h1>Home Quote Check Decision Pack</h1><p>Independent evidence summary. This is not design certification, installer approval or confirmation of grant eligibility.</p><h2>Questions to send your installer</h2><pre>${questions.replaceAll('&','&amp;').replaceAll('<','&lt;')}</pre><h2>Your current Decision Case</h2><pre>${body.replaceAll('&','&amp;').replaceAll('<','&lt;')}</pre><script>print()<\/script></body></html>`);w.document.close();
    event('decision_case_downloaded',{product:'decision_pack'});
  };
  const unlockMarkup=()=>`<div style="font-weight:800;font-size:22px;margin-bottom:6px">Decision Pack unlocked</div><div style="color:#365b50;margin-bottom:14px">Your one-off purchase is active for this quote case.</div><div style="display:flex;gap:10px;flex-wrap:wrap"><button data-hqc-add-quote style="border:0;border-radius:10px;padding:12px 16px;background:#183f34;color:white;font-weight:700;cursor:pointer">Add another quote</button><button data-hqc-questions style="border:1px solid #b9d5c8;border-radius:10px;padding:12px 16px;background:white;color:#183f34;font-weight:700;cursor:pointer">Copy installer questions</button><button data-hqc-print style="border:1px solid #b9d5c8;border-radius:10px;padding:12px 16px;background:white;color:#183f34;font-weight:700;cursor:pointer">Print Decision Pack</button></div><div data-hqc-note style="font-size:13px;color:#56756c;margin-top:12px">Evidence-based support only — not design certification, installer approval or grant-eligibility confirmation.</div>`;
  const offerMarkup=()=>`<div style="font-size:13px;font-weight:800;letter-spacing:.06em;color:#2f6c5a;text-transform:uppercase">Optional one-off upgrade</div><div style="font-weight:850;font-size:24px;margin:5px 0 8px">Decision Pack — £19</div><div style="color:#365b50;line-height:1.5;margin-bottom:12px">Compare another quote, turn the evidence gaps into installer questions and keep a printable Decision Case. One payment, no subscription.</div><ul style="margin:0 0 15px;padding-left:20px;color:#365b50"><li>Compare up to three quotes using the same evidence framework</li><li>Installer clarification questions based on the evidence check</li><li>Printable decision summary</li></ul><button data-hqc-buy style="width:100%;border:0;border-radius:12px;padding:14px 18px;background:#183f34;color:white;font-size:16px;font-weight:800;cursor:pointer">Unlock Decision Pack — £19</button><div data-hqc-pay-status style="font-size:13px;color:#56756c;margin-top:10px">Secure checkout by Stripe · One-off payment</div>`;
  const bind=(box)=>{
    box.querySelector('[data-hqc-buy]')?.addEventListener('click',async e=>{
      const btn=e.currentTarget,status=box.querySelector('[data-hqc-pay-status]');btn.disabled=true;btn.textContent='Opening secure checkout…';event('decision_pack_checkout_started',{price_gbp:19});
      try{const r=await fetch('/api/decision-pack/checkout',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({caseId})});const d=await r.json();if(!r.ok||!d.url)throw new Error(d.error||'checkout_unavailable');location.href=d.url;}catch(err){status.textContent='Checkout is temporarily unavailable. Please try again.';btn.disabled=false;btn.textContent='Unlock Decision Pack — £19';}
    });
    box.querySelector('[data-hqc-add-quote]')?.addEventListener('click',()=>{const input=findUpload();if(input){input.click();event('second_quote_add_started',{product:'decision_pack'});}else{box.querySelector('[data-hqc-note]').textContent='Use the quote upload control above to add your next quote.';}});
    box.querySelector('[data-hqc-questions]')?.addEventListener('click',async e=>{const qs=installerQuestions().map((q,i)=>`${i+1}. ${q}`).join('\n');try{await navigator.clipboard.writeText(qs);e.currentTarget.textContent='Questions copied';event('installer_questions_generated',{product:'decision_pack',count:installerQuestions().length});}catch{}});
    box.querySelector('[data-hqc-print]')?.addEventListener('click',printPack);
  };
  const render=()=>{
    if(!hasDecisionCase()&&!paid())return;
    let box=document.getElementById(OFFER_ID);
    if(!box){box=document.createElement('section');box.id=OFFER_ID;box.style.cssText='max-width:760px;margin:24px auto;padding:20px;border:1px solid #cfe3da;border-radius:16px;background:#f8fcfa;box-shadow:0 8px 24px rgba(20,62,49,.06)';const anchor=[...document.querySelectorAll('main,section,div')].find(el=>/your decision case/i.test(el.innerText||''));(anchor?.parentElement||document.querySelector('main')||document.body).appendChild(box);event('decision_pack_viewed',{price_gbp:19});}
    box.innerHTML=paid()?unlockMarkup():offerMarkup();bind(box);
  };
  const verifyReturn=async()=>{const p=new URLSearchParams(location.search),session=p.get('session_id');if(p.get('decision_pack')!=='success'||!session)return;try{const r=await fetch(`/api/decision-pack/status?session_id=${encodeURIComponent(session)}&case_id=${encodeURIComponent(caseId)}`);const d=await r.json();if(r.ok&&d.paid){setPaid(session);if(!localStorage.getItem(`hqcDecisionPackReported:${session}`)){localStorage.setItem(`hqcDecisionPackReported:${session}`,'1');event('decision_pack_payment_success',{amount_pence:d.amount_total||1900,currency:d.currency||'gbp'});}history.replaceState({},'',location.pathname);render();}}catch{}};
  verifyReturn();
  const mo=new MutationObserver(()=>render());mo.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  setTimeout(render,1200);
})();
