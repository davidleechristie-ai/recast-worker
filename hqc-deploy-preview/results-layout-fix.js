(()=>{
  const qs=(s,r=document)=>r.querySelector(s),qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const headingText=n=>(qs('h1,h2,h3',n)?.textContent||'').trim();
  const directChild=(parent,node)=>{let n=node;while(n&&n.parentElement!==parent)n=n.parentElement;return n||node;};
  function findPanel(re){return qsa('.panel,.card').find(x=>re.test(headingText(x)));}
  function apply(){
    const key=findPanel(/^What to do next$/i)||findPanel(/^Key issues$/i);
    const questions=qs('.questions')||findPanel(/^Questions to ask installers$/i);
    if(!key||!questions)return;

    // The old three-column grid left a blank third column after Evidence status was removed.
    // Collapse the two surviving primary panels into a clean, balanced decision row.
    let common=key.parentElement;
    while(common&&common!==document.body&&!common.contains(questions))common=common.parentElement;
    if(common&&common!==document.body){
      const keyRoot=directChild(common,key),qRoot=directChild(common,questions);
      if(keyRoot!==qRoot){
        common.style.setProperty('display','grid','important');
        common.style.setProperty('grid-template-columns',innerWidth<760?'minmax(0,1fr)':'minmax(0,1fr) minmax(0,1fr)','important');
        common.style.setProperty('gap',innerWidth<760?'14px':'16px','important');
        common.style.setProperty('align-items','stretch','important');
        keyRoot.style.setProperty('grid-column','auto','important');
        qRoot.style.setProperty('grid-column','auto','important');
        keyRoot.style.setProperty('min-width','0','important');
        qRoot.style.setProperty('min-width','0','important');
        keyRoot.style.setProperty('width','100%','important');
        qRoot.style.setProperty('width','100%','important');
      }
    }

    // Action text was being placed into an implicit narrow grid column, causing one-word-per-line rendering.
    qsa('li,article',key).forEach(item=>{
      const action=qsa('p,div',item).find(x=>/^Do this:/i.test((x.textContent||'').trim()));
      if(!action)return;
      action.classList.add('hqc-do-this');
      action.style.setProperty('grid-column','2 / -1','important');
      action.style.setProperty('min-width','0','important');
      action.style.setProperty('width','auto','important');
      action.style.setProperty('max-width','none','important');
      action.style.setProperty('white-space','normal','important');
      action.style.setProperty('word-break','normal','important');
      action.style.setProperty('overflow-wrap','break-word','important');
      action.style.setProperty('margin','10px 0 0','important');
      action.style.setProperty('padding','10px 12px','important');
      action.style.setProperty('border-radius','8px','important');
      action.style.setProperty('background','#f1f7f4','important');
      action.style.setProperty('color','#173b31','important');
      action.style.setProperty('font-size','13px','important');
      action.style.setProperty('font-weight','500','important');
      action.style.setProperty('line-height','1.45','important');
      const b=qs('b',action);if(b){b.style.setProperty('display','inline','important');b.style.setProperty('color','#14835f','important');b.style.setProperty('font-weight','800','important');}
    });

    [key,questions].forEach(panel=>{
      panel.style.setProperty('box-sizing','border-box','important');
      panel.style.setProperty('height','100%','important');
      panel.style.setProperty('min-width','0','important');
    });
    const keyButton=qsa('button',key).find(b=>/send these questions/i.test(b.textContent||''));
    if(keyButton){keyButton.textContent='Send these questions to installers →';keyButton.style.setProperty('width','100%','important');}
  }
  let queued=false;const tick=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});};
  new MutationObserver(tick).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  addEventListener('resize',tick,{passive:true});
  tick();
})();
