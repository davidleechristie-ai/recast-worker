/* Safe compact-mobile restoration: Check my quote — free | aspect-ratio:1.94/1
   Style-only adjustments: no destructive DOM replacement. */
(()=>{
  const qs=(s,r=document)=>r.querySelector(s),qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const isMobile=()=>matchMedia('(max-width:759px)').matches;
  function direct(parent,node){let n=node;while(n&&n.parentElement!==parent)n=n.parentElement;return n||node;}
  function apply(){
    if(!isMobile())return;
    const copy=qs('.copy');
    const img=qsa('img').find(x=>/homepage-(?:graphic|house-only)\.(?:png|svg)/i.test(x.getAttribute('src')||''));
    if(!copy||!img)return;
    let hero=copy.parentElement;while(hero&&hero!==document.body&&!hero.contains(img))hero=hero.parentElement;
    if(!hero||!hero.contains(img)||hero.dataset.hqcCompactMobile==='safe-v1')return;
    const left=direct(hero,copy),right=direct(hero,img);
    hero.dataset.hqcCompactMobile='safe-v1';
    hero.style.setProperty('display','grid','important');hero.style.setProperty('grid-template-columns','1fr','important');hero.style.setProperty('gap','16px','important');hero.style.setProperty('align-items','start','important');hero.style.setProperty('padding','18px 20px 22px','important');hero.style.setProperty('margin','0 auto','important');hero.style.setProperty('max-width','760px','important');
    left.style.setProperty('display','block','important');left.style.setProperty('order','1','important');left.style.setProperty('width','100%','important');left.style.setProperty('min-width','0','important');copy.style.setProperty('display','block','important');copy.style.setProperty('margin','0','important');copy.style.setProperty('max-width','none','important');
    const h=qs('h1,h2',copy),lead=qs('p',copy),btn=qs('button.primary',copy);
    if(h){h.textContent='Got a heat-pump quote? Check what’s missing before you sign.';h.style.setProperty('font-size','clamp(38px,10.5vw,52px)','important');h.style.setProperty('line-height','1.02','important');h.style.setProperty('letter-spacing','-.035em','important');h.style.setProperty('margin','6px 0 12px','important');h.style.setProperty('visibility','visible','important');}
    if(lead){lead.style.setProperty('font-size','17px','important');lead.style.setProperty('line-height','1.45','important');lead.style.setProperty('margin','0 0 14px','important');}
    const proof=qs('#hqc-landing-proof');if(proof){proof.style.setProperty('grid-template-columns','1fr','important');proof.style.setProperty('gap','6px','important');proof.style.setProperty('margin','12px 0 14px','important');}
    const note=qs('#hqc-independence-note');if(note){note.style.setProperty('margin','0 0 14px','important');note.style.setProperty('padding','10px 12px','important');}
    if(btn){btn.textContent='Check my quote — free →';btn.style.setProperty('width','100%','important');btn.style.setProperty('max-width','none','important');btn.style.setProperty('min-height','58px','important');btn.style.setProperty('font-size','17px','important');}
    right.style.setProperty('display','block','important');right.style.setProperty('order','2','important');right.style.setProperty('width','100%','important');right.style.setProperty('position','relative','important');right.style.setProperty('overflow','hidden','important');right.style.setProperty('aspect-ratio','1.94/1','important');right.style.setProperty('max-height','250px','important');right.style.setProperty('border-radius','14px','important');right.style.setProperty('background','#eef8f4','important');right.style.setProperty('padding','0','important');
    img.setAttribute('src','/resources/homepage-house-only.svg');img.setAttribute('alt','Home with an air-source heat pump');img.style.setProperty('display','block','important');img.style.setProperty('position','absolute','important');img.style.setProperty('inset','0','important');img.style.setProperty('width','100%','important');img.style.setProperty('height','100%','important');img.style.setProperty('max-width','100%','important');img.style.setProperty('object-fit','contain','important');img.style.setProperty('object-position','center','important');img.style.setProperty('transform','none','important');img.style.setProperty('margin','0','important');
    const steps=qs('#hqc-hero-steps');if(steps)steps.style.setProperty('display','none','important');
  }
  let queued=false;const tick=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});};
  new MutationObserver(tick).observe(document.documentElement,{childList:true,subtree:true});
  addEventListener('resize',()=>{const hero=qs('[data-hqc-compact-mobile]');if(hero)delete hero.dataset.hqcCompactMobile;tick();},{passive:true});tick();
})();
