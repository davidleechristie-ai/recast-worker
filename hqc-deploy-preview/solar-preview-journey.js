(()=>{
  const FLAG='hqc_solar_preview';
  const TECH='hqc_journey_technology';
  const enabled=()=>{try{return new URLSearchParams(location.search).get('solar_preview')==='1'||sessionStorage.getItem(FLAG)==='1'}catch{return false}};
  const setPreview=()=>{try{sessionStorage.setItem(FLAG,'1');sessionStorage.setItem(TECH,'solar_battery')}catch{}};
  const clearPreview=()=>{try{sessionStorage.removeItem(FLAG);sessionStorage.removeItem(TECH)}catch{}};
  function decorateHome(){
    if(!enabled())return;
    setPreview();
    const hero=document.querySelector('.copy');if(!hero)return;
    const h=hero.querySelector('h1,h2'),p=hero.querySelector('p');
    if(!h)return;
    h.textContent='Got a solar or battery quote? Check it before you pay a deposit.';
    if(p)p.textContent='Upload the installer quote you already have. We’ll flag missing panel, inverter, battery, generation, DNO, warranty and scope evidence so you know what to ask before you commit.';
    const choice=document.querySelector('#hqc-journey-choice');
    if(choice){
      const single=choice.querySelector('[data-mode="single"]');
      if(single){const b=single.querySelector('b'),span=single.querySelector('span'),strong=single.querySelector('strong');if(b)b.textContent='Check a solar or battery quote';if(span)span.textContent='See what evidence is included, what is missing and what to ask the installer.';if(strong)strong.textContent='Start solar quote check →';}
      const compare=choice.querySelector('[data-mode="compare"]');
      if(compare){const b=compare.querySelector('b'),span=compare.querySelector('span'),strong=compare.querySelector('strong');if(b)b.textContent='Compare solar / battery quotes';if(span)span.textContent='Upload two or more quotes and compare price, equipment, scope and documented evidence side by side.';if(strong)strong.textContent='Start solar quote comparison →';}
    }
    let badge=document.querySelector('#hqc-solar-preview-badge');
    if(!badge){badge=document.createElement('div');badge.id='hqc-solar-preview-badge';badge.textContent='SOLAR / BATTERY PREVIEW — NOT PUBLIC';badge.style.cssText='display:inline-block;margin:0 0 12px;padding:6px 10px;border-radius:999px;background:#fff4cc;color:#6a4b00;font:800 11px/1.2 system-ui';h.insertAdjacentElement('beforebegin',badge);}
  }
  function decorateUpload(){
    if(!enabled())return;
    setPreview();
    const card=[...document.querySelectorAll('.card')].find(x=>/Add your quotes/i.test(x.querySelector('h1')?.textContent||''));if(!card)return;
    const h=card.querySelector('h1');if(h)h.textContent='Add your solar or battery quotes';
    const intro=h?.nextElementSibling;if(intro)intro.textContent='Upload a genuine installer screenshot, photo or PDF. This private preview checks documented Solar/Battery evidence; it does not certify the design or installer.';
  }
  function addTechnologyHeader(){
    if(!enabled())return;
    const original=window.fetch;if(original.__hqcSolarPreview)return;
    const wrapped=(input,init={})=>{const u=typeof input==='string'?input:input?.url||'';if(/\/api\/(?:analyse|analyze)/i.test(u)){const headers=new Headers(init.headers||(input instanceof Request?input.headers:undefined));headers.set('x-hqc-technology','solar_battery');init={...init,headers};}return original(input,init)};
    wrapped.__hqcSolarPreview=true;window.fetch=wrapped;
  }
  if(new URLSearchParams(location.search).get('solar_preview')==='0')clearPreview();
  addTechnologyHeader();
  let queued=false;
  const tick=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorateHome();decorateUpload()})};
  new MutationObserver(tick).observe(document.documentElement,{childList:true,subtree:true});tick();
})();