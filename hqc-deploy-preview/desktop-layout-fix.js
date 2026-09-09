(()=>{
  function directChild(parent,node){let n=node;while(n&&n.parentElement!==parent)n=n.parentElement;return n||node;}
  function apply(){
    if(innerWidth<761)return;
    const copy=document.querySelector('.copy');
    const img=[...document.querySelectorAll('img')].find(x=>/homepage-graphic\.png/i.test(x.getAttribute('src')||''));
    if(!copy||!img)return;
    let hero=copy.parentElement;
    while(hero&&hero!==document.body&&!hero.contains(img))hero=hero.parentElement;
    if(!hero||!hero.contains(img))return;
    const copyRoot=directChild(hero,copy),art=directChild(hero,img);
    hero.style.setProperty('display','grid','important');
    hero.style.setProperty('grid-template-columns','minmax(0,1fr) minmax(520px,1.08fr)','important');
    hero.style.setProperty('gap','48px','important');
    hero.style.setProperty('align-items','start','important');
    hero.style.setProperty('padding','54px 64px 44px','important');
    hero.style.setProperty('min-height','0','important');
    copyRoot.style.setProperty('width','100%','important');
    copyRoot.style.setProperty('min-width','0','important');
    copy.style.setProperty('max-width','560px','important');
    copy.style.setProperty('margin','0','important');
    const h=copy.querySelector('h1,h2');
    if(h){
      h.style.setProperty('font-size','clamp(44px,4.15vw,58px)','important');
      h.style.setProperty('line-height','1.03','important');
      h.style.setProperty('letter-spacing','-.035em','important');
      h.style.setProperty('margin','0 0 16px','important');
      h.style.setProperty('max-width','560px','important');
    }
    const lead=copy.querySelector('p');
    if(lead){lead.style.setProperty('font-size','16px','important');lead.style.setProperty('line-height','1.5','important');lead.style.setProperty('max-width','520px','important');}
    const proof=document.querySelector('#hqc-landing-proof');
    if(proof){proof.style.setProperty('font-size','12px','important');proof.style.setProperty('gap','14px','important');proof.style.setProperty('margin','18px 0','important');}
    const btn=copy.querySelector('button.primary');
    if(btn){btn.style.setProperty('width','min(430px,100%)','important');btn.style.setProperty('min-height','52px','important');}
    art.style.setProperty('width','100%','important');
    art.style.setProperty('aspect-ratio','1.38 / 1','important');
    art.style.setProperty('max-height','460px','important');
    art.style.setProperty('min-height','360px','important');
    art.style.setProperty('margin','8px 0 0','important');
    art.style.setProperty('overflow','hidden','important');
    art.style.setProperty('border-radius','16px','important');
    art.style.setProperty('background','#eef8f4','important');
    art.style.setProperty('position','relative','important');
    img.style.setProperty('position','absolute','important');
    img.style.setProperty('left','0','important');
    img.style.setProperty('top','0','important');
    img.style.setProperty('width','100%','important');
    img.style.setProperty('height','100%','important');
    img.style.setProperty('max-width','100%','important');
    img.style.setProperty('object-fit','cover','important');
    img.style.setProperty('object-position','center 52%','important');
    img.style.setProperty('transform','none','important');
  }
  let tries=0;
  const timer=setInterval(()=>{apply();if(++tries>=20)clearInterval(timer)},150);
  addEventListener('resize',apply,{passive:true});
  apply();
})();
