(()=>{
  const fit=()=>{
    const img=[...document.querySelectorAll('img')].find(x=>/homepage-graphic\.png/i.test(x.getAttribute('src')||''));
    if(!img)return;
    const art=img.parentElement;
    if(!art)return;
    art.style.setProperty('aspect-ratio','1 / 1','important');
    art.style.setProperty('max-height','none','important');
    art.style.setProperty('overflow','hidden','important');
    art.style.setProperty('background','#eef8f4','important');
    img.style.setProperty('position','static','important');
    img.style.setProperty('display','block','important');
    img.style.setProperty('width','100%','important');
    img.style.setProperty('height','100%','important');
    img.style.setProperty('max-width','100%','important');
    img.style.setProperty('object-fit','cover','important');
    img.style.setProperty('object-position','center center','important');
    img.style.setProperty('transform','none','important');
    img.style.setProperty('left','auto','important');
    img.style.setProperty('top','auto','important');
    img.style.setProperty('margin','0','important');
  };
  const run=()=>requestAnimationFrame(fit);
  new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
  addEventListener('resize',run,{passive:true});
  run();
})();
