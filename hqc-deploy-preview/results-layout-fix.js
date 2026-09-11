(()=>{
  const qs=(s,r=document)=>r.querySelector(s),qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const headingText=n=>(qs('h1,h2,h3',n)?.textContent||'').trim();
  const directChild=(parent,node)=>{let n=node;while(n&&n.parentElement!==parent)n=n.parentElement;return n||node;};
  function findPanel(re){return qsa('.panel,.card').find(x=>re.test(headingText(x)));}
  function apply(){
    const key=findPanel(/^What to do next$/i)||findPanel(/^Key issues$/i);
    const questions=qs('.questions')||findPanel(/^Questions to ask installers$/i);
    if(!key||!questions)return;
    let common=key.parentElement;while(common&&common!==document.body&&!common.contains(questions))common=common.parentElement;
    if(common&&common!==document.body){const kr=directChild(common,key),qr=directChild(common,questions);if(kr!==qr){common.style.setProperty('display','grid','important');common.style.setProperty('grid-template-columns',innerWidth<760?'1fr':'minmax(0,.95fr) minmax(0,1.05fr)','important');common.style.setProperty('gap','18px','important');common.style.setProperty('align-items','stretch','important');[kr,qr].forEach(x=>{x.style.setProperty('grid-column','auto','important');x.style.setProperty('min-width','0','important');x.style.setProperty('width','100%','important');});}}
    const kh=qs('h2,h3',key);if(kh){kh.textContent='What to do next';kh.style.setProperty('font-size','24px','important');kh.style.setProperty('line-height','1.2','important');}
    const items=qsa('li,article',key);items.forEach(item=>{
      const title=qs('b,strong,h3,h4',item);if(title&&/decision-critical evidence is still missing/i.test(title.textContent||''))title.textContent='Important information is still missing';
      qsa('p,div',item).forEach(n=>{const t=(n.textContent||'').trim();if(/^\d+ unresolved evidence items remain\.?$/i.test(t))n.textContent='Your quote doesn’t contain enough information to confidently assess the proposed system yet.';if(/^Next:/i.test(t))n.remove();if(/^Do this:/i.test(t))n.remove();});
      item.style.setProperty('font-size','15px','important');item.style.setProperty('line-height','1.55','important');
    });
    let next=qs('#hqc-next-step',key);if(!next){next=document.createElement('div');next.id='hqc-next-step';next.innerHTML='<strong>Next step</strong><p>Ask the installer for the missing information before paying a deposit.</p>';const btn=qsa('button',key).find(b=>/send these questions/i.test(b.textContent||''));if(btn)btn.insertAdjacentElement('beforebegin',next);else key.appendChild(next);}next.style.cssText='margin:18px 0 14px;padding:16px 18px;border-radius:10px;background:#f1f7f4;color:#173b31;font-size:15px;line-height:1.5';const np=qs('p',next);if(np)np.style.cssText='margin:4px 0 0';
    const keyButton=qsa('button',key).find(b=>/send these questions/i.test(b.textContent||''));if(keyButton){keyButton.textContent='Send questions to installer →';keyButton.style.setProperty('width','100%','important');keyButton.style.setProperty('min-height','52px','important');keyButton.style.setProperty('font-size','16px','important');}
    const qh=qs('h2,h3',questions);if(qh){qh.style.setProperty('font-size','24px','important');qh.style.setProperty('line-height','1.2','important');}
    qsa('label,li',questions).forEach(x=>{x.style.setProperty('font-size','14px','important');x.style.setProperty('line-height','1.45','important');});
    [key,questions].forEach(p=>{p.style.setProperty('box-sizing','border-box','important');p.style.setProperty('height','100%','important');p.style.setProperty('min-width','0','important');p.style.setProperty('padding',innerWidth<760?'18px':'22px','important');});
    const completeness=findPanel(/^Quote evidence completeness$/i);if(completeness){completeness.style.setProperty('font-size','15px','important');const h=qs('h2,h3',completeness);if(h)h.style.setProperty('font-size','22px','important');qsa('small',completeness).forEach(x=>x.style.setProperty('font-size','12px','important'));}
    const facts=findPanel(/^Quote Facts$/i)||findPanel(/^Quote facts and provenance$/i);if(facts){const h=qs('h2,h3',facts);if(h){h.textContent='Quote Facts';h.style.setProperty('font-size','22px','important');}facts.style.setProperty('font-size','15px','important');facts.style.setProperty('line-height','1.5','important');qsa('small',facts).forEach(x=>x.style.setProperty('font-size','12px','important'));}
  }
  let queued=false;const tick=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});};new MutationObserver(tick).observe(document.documentElement,{childList:true,subtree:true,characterData:true});addEventListener('resize',tick,{passive:true});tick();
})();
