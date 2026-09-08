(()=>{
  const PENDING='hqc_pending_quotes';
  const MODE='hqc_add_second';
  const AUTO='hqc_auto_started';
  const readCase=()=>{try{return JSON.parse(localStorage.getItem('hqc_case')||'[]')}catch{return[]}};
  const readPending=()=>{try{return JSON.parse(sessionStorage.getItem(PENDING)||'[]')}catch{return[]}};
  const absent=v=>v==null||v===''||/not evidenced|not found on quote/i.test(String(v));
  const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const completeness=q=>{const items=[['Total price',q.price!=null&&Number(q.price)>0],['Exact heat-pump model',!absent(q.model)],['Nominal capacity stated',!absent(q.capacity)],['Whole-home heat loss',q.heatLossKw!=null&&Number.isFinite(Number(q.heatLossKw))],['Room-by-room heat loss',/provided/i.test(q.roomByRoom||'')&&!/not provided|not found/i.test(q.roomByRoom||'')],['Design outdoor temperature',q.designOutdoorC!=null&&Number.isFinite(Number(q.designOutdoorC))],['Design flow temperature',q.flowTemperatureC!=null&&Number.isFinite(Number(q.flowTemperatureC))],['Radiator / emitter treatment',!absent(q.emitterChanges)],['COP / SCOP evidence or claim stated',!absent(q.efficiency)],['MCS reference / claim stated',!absent(q.certification)]];return {score:items.filter(([,ok])=>ok).length,items};};
  const dedupe=quotes=>{const seen=new Set();return quotes.filter(q=>{const key=[q.fileName,q.installer,q.price,q.model,q.heatLossKw,q.flowTemperatureC].join('|');if(seen.has(key))return false;seen.add(key);return true;}).slice(0,4);};
  function approvedHero(){
    const img=[...document.querySelectorAll('img')].find(x=>/homepage-graphic\.png/i.test(x.getAttribute('src')||''));
    const copy=document.querySelector('.copy');
    if(!img||!copy)return;
    const hero=copy.parentElement;
    const wrap=img.parentElement;
    if(hero){
      hero.style.setProperty('display','grid','important');
      hero.style.setProperty('grid-template-columns',window.innerWidth<760?'1fr':'minmax(0, .88fr) minmax(0, 1.12fr)','important');
      hero.style.setProperty('gap',window.innerWidth<760?'22px':'36px','important');
      hero.style.setProperty('align-items','center','important');
      hero.style.setProperty('padding',window.innerWidth<760?'26px 20px 30px':'42px 46px','important');
    }
    copy.style.setProperty('order','1','important');
    copy.style.setProperty('max-width','620px','important');
    if(wrap){
      wrap.style.setProperty('order',window.innerWidth<760?'2':'2','important');
      wrap.style.setProperty('overflow','hidden','important');
      wrap.style.setProperty('border-radius','16px','important');
      wrap.style.setProperty('display','block','important');
      wrap.style.setProperty('background','#eef8f4','important');
      wrap.style.setProperty('padding','0','important');
      wrap.style.setProperty('width','100%','important');
      wrap.style.setProperty('aspect-ratio',window.innerWidth<760?'1.03 / 1':'1.12 / 1','important');
      wrap.style.setProperty('max-height',window.innerWidth<760?'410px':'570px','important');
    }
    img.style.setProperty('display','block','important');
    img.style.setProperty('width','100%','important');
    img.style.setProperty('height','100%','important');
    img.style.setProperty('max-width','none','important');
    img.style.setProperty('margin','0','important');
    img.style.setProperty('object-fit','cover','important');
    img.style.setProperty('object-position',window.innerWidth<760?'57% 43%':'58% 43%','important');
    img.alt='Heat-pump quote comparison showing price and heat-loss differences';
    const h1=copy.querySelector('h1,h2');
    if(h1){h1.innerHTML='Got a heat-pump quote? <span style="color:#00966b">Check what’s missing</span> before you sign.';h1.style.setProperty('font-size',window.innerWidth<760?'clamp(36px,10vw,54px)':'clamp(48px,5vw,72px)','important');h1.style.setProperty('line-height','1.02','important');h1.style.setProperty('letter-spacing','-.035em','important');}
  }
  function optimiseLanding(){
    const copy=document.querySelector('.copy');if(!copy)return;
    const p=copy.querySelector('p');const button=copy.querySelector('button.primary');
    if(p)p.textContent='Upload your quote in seconds and we’ll highlight what’s included, what’s missing and how it compares — so you can make a confident decision.';
    if(button)button.textContent='Check my quote — free →';
    let proof=document.getElementById('hqc-landing-proof');
    if(!proof){proof=document.createElement('div');proof.id='hqc-landing-proof';button?.insertAdjacentElement('beforebegin',proof);}
    proof.style.cssText='margin:20px 0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;font-size:12px;line-height:1.35;color:#40516a';
    proof.innerHTML='<span>✓ &nbsp;No account<br>&nbsp;&nbsp;&nbsp;&nbsp;required</span><span>✓ &nbsp;No personal<br>&nbsp;&nbsp;&nbsp;&nbsp;details needed</span><span>✓ &nbsp;One screenshot<br>&nbsp;&nbsp;&nbsp;&nbsp;is enough</span>';
    if(button){button.style.setProperty('width',window.innerWidth<760?'100%':'min(430px,100%)','important');button.style.setProperty('min-height','54px','important');}
  }
  function optimiseUpload(){const card=[...document.querySelectorAll('.card')].find(x=>/Add your quotes/i.test(x.querySelector('h1')?.textContent||''));if(!card||document.getElementById('hqc-upload-help'))return;const intro=card.querySelector('h1')?.nextElementSibling;if(intro)intro.textContent='Start with one genuine installer quote. A screenshot or clear phone photo is enough for automatic extraction; you can add another quote after the first check.';const help=document.createElement('div');help.id='hqc-upload-help';help.style.cssText='margin:16px 0;padding:14px;border-radius:11px;background:#eef8f4;border:1px solid #d7e9e2;color:#40516a;font-size:12px;line-height:1.5';help.innerHTML='<b style="display:block;color:#07503b;margin-bottom:4px">Fastest way to start</b><span>Take a screenshot of the pages showing the price, heat-pump model and design figures, then choose the image below.</span><small style="display:block;margin-top:7px;color:#68778a">Have a PDF? Screenshot the relevant pages, or use “Enter manually”. Original quote images are processed transiently and are not intentionally stored.</small>';const drop=card.querySelector('.drop');if(drop)drop.insertAdjacentElement('beforebegin',help);}
  function mergeSecondQuoteIfReady(){if(sessionStorage.getItem(MODE)!=='1')return false;const pending=readPending();const current=readCase();const onResults=!!document.querySelector('.resultsTop');if(onResults&&pending.length&&current.length&&JSON.stringify(current)!==JSON.stringify(pending)){const merged=dedupe([...pending,...current]);if(merged.length>pending.length){localStorage.setItem('hqc_case',JSON.stringify(merged));sessionStorage.removeItem(PENDING);sessionStorage.removeItem(MODE);sessionStorage.removeItem(AUTO);location.reload();return true;}}if(!onResults&&current.length===0&&!sessionStorage.getItem(AUTO)){const start=[...document.querySelectorAll('button')].find(x=>/check my heat-pump quotes|check my quote|get started/i.test(x.textContent||''));if(start){sessionStorage.setItem(AUTO,'1');start.click();}}return false;}
  function renderCompleteness(){const quotes=readCase();const facts=document.querySelector('.facts.panel');if(!facts||!quotes.length||document.getElementById('hqc-completeness'))return;const section=document.createElement('section');section.id='hqc-completeness';section.className='panel';const cards=quotes.map((q,i)=>{const c=completeness(q);const missing=c.items.filter(([,ok])=>!ok).map(([name])=>name);const who=escapeHtml(q.installer||q.fileName||`Quote ${i+1}`);return `<article><small>EVIDENCE COMPLETENESS</small><h3>${who}</h3><p style="font-size:32px;font-weight:900;margin:6px 0;color:#00845c">${c.score}/10</p><p style="font-size:11px;color:#617187;margin:0 0 8px">documented</p>${missing.length?`<p style="font-size:11px;line-height:1.5"><b>Still missing:</b> ${missing.map(escapeHtml).join(', ')}</p>`:'<p style="font-size:11px;line-height:1.5"><b>All 10 evidence fields are stated.</b></p>'}</article>`;}).join('');const addSecond=quotes.length===1&&quotes[0].isReal?`<div class="seoCta"><h2>Have another quote?</h2><p>Add it and Home Quote Check will show where the installers disagree rather than judging either quote in isolation.</p><button id="hqc-add-second" class="primary">Add another quote →</button></div>`:'';section.innerHTML=`<h2>Quote evidence completeness</h2><p style="color:#617187;line-height:1.55"><b>This measures what each quote documents, not whether the design is correct.</b> It does not score sizing quality, MCS status or Boiler Upgrade Scheme eligibility.</p><div class="factCards">${cards}</div>${addSecond}`;facts.parentNode.insertBefore(section,facts);const button=document.getElementById('hqc-add-second');if(button)button.addEventListener('click',()=>{sessionStorage.setItem(PENDING,JSON.stringify(quotes));sessionStorage.setItem(MODE,'1');sessionStorage.removeItem(AUTO);const reset=[...document.querySelectorAll('button')].find(x=>/check different quotes/i.test(x.textContent||''));if(reset)reset.click();});}
  function strengthenInstallerQuestions(){const panel=document.querySelector('.questions');if(!panel||panel.dataset.hqcEnhanced==='1')return;const button=panel.querySelector('button.primary');if(!button)return;panel.dataset.hqcEnhanced='1';const intro=document.createElement('div');intro.className='evidenceState';intro.innerHTML='<b>TAKE THE EVIDENCE BACK TO THE INSTALLER</b><p>Copy these neutral clarification questions into email, WhatsApp or the installer’s portal. They contain no customer details or source quote documents.</p>';const heading=panel.querySelector('h2');if(heading)heading.insertAdjacentElement('afterend',intro);if(/copy questions/i.test(button.textContent||''))button.textContent='Copy questions to send →';}
  function tick(){approvedHero();optimiseLanding();optimiseUpload();if(mergeSecondQuoteIfReady())return;renderCompleteness();strengthenInstallerQuestions();}
  new MutationObserver(tick).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('resize',tick);window.addEventListener('storage',tick);tick();
})();
