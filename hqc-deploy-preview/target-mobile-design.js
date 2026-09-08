(()=>{
  function apply(){
    if(innerWidth>760)return;
    const copy=document.querySelector('.copy');
    const img=[...document.querySelectorAll('img')].find(x=>/homepage-graphic\.png/i.test(x.getAttribute('src')||''));
    if(!copy||!img)return;
    let hero=copy.parentElement;while(hero&&hero!==document.body&&!hero.contains(img))hero=hero.parentElement;if(!hero)return;
    const direct=(parent,node)=>{let n=node;while(n&&n.parentElement!==parent)n=n.parentElement;return n||node};
    const copyRoot=direct(hero,copy),art=direct(hero,img);
    hero.style.cssText+=';display:grid!important;grid-template-columns:1fr!important;gap:18px!important;padding:18px 22px 20px!important;align-items:start!important';
    [...hero.children].forEach(c=>c.style.setProperty('display',c===copyRoot||c===art?'block':'none','important'));
    copyRoot.style.cssText+=';order:1!important;width:100%!important;min-width:0!important';
    copy.style.cssText+=';display:block!important;margin:0!important;max-width:none!important';
    const h=copy.querySelector('h1,h2');if(h){h.textContent='Got a heat-pump quote? Check what’s missing before you sign.';h.style.cssText+=';display:block!important;visibility:visible!important;font-size:clamp(40px,10.8vw,58px)!important;line-height:1.02!important;letter-spacing:-.035em!important;margin:10px 0 14px!important;font-weight:800!important;color:#0b2548!important'}
    const p=copy.querySelector('p');if(p){p.textContent='Upload your quote in seconds and we’ll highlight what’s included, what’s missing and how it compares — so you can make a confident decision.';p.style.cssText+=';font-size:18px!important;line-height:1.45!important;margin:0 0 18px!important;color:#55657a!important'}
    const eyebrow=[...copy.querySelectorAll('*')].find(e=>/independent|impartial|unbiased/i.test(e.textContent||'')&&(e.children.length===0||e.tagName==='SMALL'));if(eyebrow){eyebrow.textContent='🍃  INDEPENDENT · UNBIASED · UK FOCUSED';eyebrow.style.cssText+=';display:inline-block!important;background:#eef5f3!important;border-radius:999px!important;padding:6px 10px!important;font-size:11px!important;font-weight:800!important;letter-spacing:.03em!important;color:#53667a!important'}
    let proof=document.getElementById('hqc-landing-proof');if(proof){proof.style.cssText='margin:16px 0 18px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;font-size:12px;line-height:1.35;color:#33475f';[...proof.children].forEach(s=>{s.style.display='flex';s.style.alignItems='flex-start';s.style.gap='6px'});}
    const button=copy.querySelector('button.primary');if(button){button.textContent='Check my quote — free  →';button.style.cssText+=';width:100%!important;min-height:60px!important;border-radius:8px!important;font-size:18px!important;font-weight:800!important;margin:0!important'}
    if(button&&!document.getElementById('hqc-cta-note')){const note=document.createElement('div');note.id='hqc-cta-note';note.textContent='Get an independent check in seconds.';note.style.cssText='text-align:center;font-size:12px;color:#6c7785;margin:7px 0 0';button.insertAdjacentElement('afterend',note)}
    art.style.cssText+=';order:2!important;width:100%!important;aspect-ratio:1.94/1!important;max-height:none!important;overflow:hidden!important;border-radius:14px!important;background:#eef8f4!important;position:relative!important;padding:0!important;margin:4px 0 0!important';
    img.style.cssText+=';display:block!important;position:absolute!important;max-width:none!important;width:300%!important;height:auto!important;left:-94%!important;top:-16%!important;transform:none!important;object-fit:unset!important;margin:0!important';
    const header=document.querySelector('header');if(header){header.style.cssText+=';padding:16px 22px!important;min-height:74px!important';const nav=header.querySelector('nav');if(nav)nav.style.setProperty('display','none','important');}
    const how=[...document.querySelectorAll('section,div')].find(e=>/Add your quotes/.test(e.textContent||'')&&/We compare them/.test(e.textContent||'')&&/Know what to ask/.test(e.textContent||''));if(how&&how!==hero){how.style.cssText+=';border-radius:14px!important;margin:14px 20px 0!important'}
  }
  let n=0,t=setInterval(()=>{apply();if(++n>30)clearInterval(t)},100);addEventListener('resize',apply,{passive:true});new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});apply();
})();