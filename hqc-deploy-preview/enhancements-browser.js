(()=>{
  const PENDING='hqc_pending_quotes';
  const MODE='hqc_add_second';
  const AUTO='hqc_auto_started';
  const readCase=()=>{try{return JSON.parse(localStorage.getItem('hqc_case')||'[]')}catch{return[]}};
  const readPending=()=>{try{return JSON.parse(sessionStorage.getItem(PENDING)||'[]')}catch{return[]}};
  const absent=v=>v==null||v===''||/not evidenced|not found on quote/i.test(String(v));
  const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const completeness=q=>{
    const items=[
      ['Total price',q.price!=null&&Number(q.price)>0],
      ['Exact heat-pump model',!absent(q.model)],
      ['Nominal capacity stated',!absent(q.capacity)],
      ['Whole-home heat loss',q.heatLossKw!=null&&Number.isFinite(Number(q.heatLossKw))],
      ['Room-by-room heat loss',/provided/i.test(q.roomByRoom||'')&&!/not provided|not found/i.test(q.roomByRoom||'')],
      ['Design outdoor temperature',q.designOutdoorC!=null&&Number.isFinite(Number(q.designOutdoorC))],
      ['Design flow temperature',q.flowTemperatureC!=null&&Number.isFinite(Number(q.flowTemperatureC))],
      ['Radiator / emitter treatment',!absent(q.emitterChanges)],
      ['COP / SCOP evidence or claim stated',!absent(q.efficiency)],
      ['MCS reference / claim stated',!absent(q.certification)]
    ];
    return {score:items.filter(([,ok])=>ok).length,items};
  };
  const dedupe=quotes=>{
    const seen=new Set();
    return quotes.filter(q=>{
      const key=[q.fileName,q.installer,q.price,q.model,q.heatLossKw,q.flowTemperatureC].join('|');
      if(seen.has(key))return false;
      seen.add(key);return true;
    }).slice(0,4);
  };
  function optimiseLanding(){
    const copy=document.querySelector('.copy');
    if(!copy||document.getElementById('hqc-landing-proof'))return;
    const h2=copy.querySelector('h2');
    const p=copy.querySelector('p');
    const button=copy.querySelector('button.primary');
    if(h2)h2.textContent='Got a heat-pump quote? Check what’s missing before you sign.';
    if(p)p.textContent='Start with one screenshot or photo. We compare what the quote actually says, flag missing evidence and give you the questions worth asking.';
    if(button)button.textContent='Check my quote — free →';
    const proof=document.createElement('div');
    proof.id='hqc-landing-proof';
    proof.style.cssText='margin-top:12px;padding:12px 14px;border:1px solid #d9e9e3;border-radius:10px;background:#f4faf7;font-size:11px;line-height:1.5;color:#526277';
    proof.innerHTML='<b style="color:#16493d">Start with just one quote.</b> A phone screenshot is enough to begin. No account, email, phone number or address is required.';
    button?.insertAdjacentElement('afterend',proof);
  }
  function optimiseUpload(){
    const card=[...document.querySelectorAll('.card')].find(x=>/Add your quotes/i.test(x.querySelector('h1')?.textContent||''));
    if(!card||document.getElementById('hqc-upload-help'))return;
    const intro=card.querySelector('h1')?.nextElementSibling;
    if(intro)intro.textContent='Start with one genuine installer quote. A screenshot or clear phone photo is enough for automatic extraction; you can add another quote after the first check.';
    const help=document.createElement('div');
    help.id='hqc-upload-help';
    help.style.cssText='margin:16px 0;padding:14px;border-radius:11px;background:#eef8f4;border:1px solid #d7e9e2;color:#40516a;font-size:12px;line-height:1.5';
    help.innerHTML='<b style="display:block;color:#07503b;margin-bottom:4px">Fastest way to start</b><span>Take a screenshot of the pages showing the price, heat-pump model and design figures, then choose the image below.</span><small style="display:block;margin-top:7px;color:#68778a">Have a PDF? Screenshot the relevant pages, or use “Enter manually”. Original quote images are processed transiently and are not intentionally stored.</small>';
    const drop=card.querySelector('.drop');
    if(drop)drop.insertAdjacentElement('beforebegin',help);
  }
  function mergeSecondQuoteIfReady(){
    if(sessionStorage.getItem(MODE)!=='1')return false;
    const pending=readPending();
    const current=readCase();
    const onResults=!!document.querySelector('.resultsTop');
    if(onResults&&pending.length&&current.length&&JSON.stringify(current)!==JSON.stringify(pending)){
      const merged=dedupe([...pending,...current]);
      if(merged.length>pending.length){
        localStorage.setItem('hqc_case',JSON.stringify(merged));
        sessionStorage.removeItem(PENDING);sessionStorage.removeItem(MODE);sessionStorage.removeItem(AUTO);
        location.reload();
        return true;
      }
    }
    if(!onResults&&current.length===0&&!sessionStorage.getItem(AUTO)){
      const start=[...document.querySelectorAll('button')].find(x=>/check my heat-pump quotes|check my quote|get started/i.test(x.textContent||''));
      if(start){sessionStorage.setItem(AUTO,'1');start.click();}
    }
    return false;
  }
  function renderCompleteness(){
    const quotes=readCase();
    const facts=document.querySelector('.facts.panel');
    if(!facts||!quotes.length||document.getElementById('hqc-completeness'))return;
    const section=document.createElement('section');
    section.id='hqc-completeness';section.className='panel';
    const cards=quotes.map((q,i)=>{
      const c=completeness(q);const missing=c.items.filter(([,ok])=>!ok).map(([name])=>name);
      const who=escapeHtml(q.installer||q.fileName||`Quote ${i+1}`);
      return `<article><small>EVIDENCE COMPLETENESS</small><h3>${who}</h3><p style="font-size:32px;font-weight:900;margin:6px 0;color:#00845c">${c.score}/10</p><p style="font-size:11px;color:#617187;margin:0 0 8px">documented</p>${missing.length?`<p style="font-size:11px;line-height:1.5"><b>Still missing:</b> ${missing.map(escapeHtml).join(', ')}</p>`:'<p style="font-size:11px;line-height:1.5"><b>All 10 evidence fields are stated.</b></p>'}</article>`;
    }).join('');
    const addSecond=quotes.length===1&&quotes[0].isReal?`<div class="seoCta"><h2>Have another quote?</h2><p>Add it and Home Quote Check will show where the installers disagree rather than judging either quote in isolation.</p><button id="hqc-add-second" class="primary">Add another quote →</button></div>`:'';
    section.innerHTML=`<h2>Quote evidence completeness</h2><p style="color:#617187;line-height:1.55"><b>This measures what each quote documents, not whether the design is correct.</b> It does not score sizing quality, MCS status or Boiler Upgrade Scheme eligibility.</p><div class="factCards">${cards}</div>${addSecond}`;
    facts.parentNode.insertBefore(section,facts);
    const button=document.getElementById('hqc-add-second');
    if(button)button.addEventListener('click',()=>{
      sessionStorage.setItem(PENDING,JSON.stringify(quotes));sessionStorage.setItem(MODE,'1');sessionStorage.removeItem(AUTO);
      const reset=[...document.querySelectorAll('button')].find(x=>/check different quotes/i.test(x.textContent||''));
      if(reset)reset.click();
    });
  }
  function strengthenInstallerQuestions(){
    const panel=document.querySelector('.questions');
    if(!panel||panel.dataset.hqcEnhanced==='1')return;
    const button=panel.querySelector('button.primary');
    if(!button)return;
    panel.dataset.hqcEnhanced='1';
    const intro=document.createElement('div');
    intro.className='evidenceState';
    intro.innerHTML='<b>TAKE THE EVIDENCE BACK TO THE INSTALLER</b><p>Copy these neutral clarification questions into email, WhatsApp or the installer’s portal. They contain no customer details or source quote documents.</p>';
    const heading=panel.querySelector('h2');
    if(heading)heading.insertAdjacentElement('afterend',intro);
    if(/copy questions/i.test(button.textContent||''))button.textContent='Copy questions to send →';
  }
  function tick(){optimiseLanding();optimiseUpload();if(mergeSecondQuoteIfReady())return;renderCompleteness();strengthenInstallerQuestions();}
  new MutationObserver(tick).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('storage',tick);tick();
})();
