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
    const h=hero.querySelector('h1,h2'),p=hero.querySelector('p'),btn=hero.querySelector('button.primary');
    if(h)h.textContent='Got a solar or battery quote? Check it before you pay a deposit.';
    if(p)p.textContent='Upload the installer quote you already have. We’ll flag missing panel, inverter, battery, generation, DNO, warranty and scope evidence so you know what to ask before you commit.';
    if(btn)btn.textContent='Check my solar quote — preview →';
    let badge=document.querySelector('#hqc-solar-preview-badge');
    if(!badge&&h){badge=document.createElement('div');badge.id='hqc-solar-preview-badge';badge.textContent='SOLAR / BATTERY PREVIEW — NOT PUBLIC';badge.style.cssText='display:inline-block;margin:0 0 12px;padding:6px 10px;border-radius:999px;background:#fff4cc;color:#6a4b00;font:800 11px/1.2 system-ui';h.insertAdjacentElement('beforebegin',badge);}
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
  const tick=()=>{decorateHome();decorateUpload()};
  new MutationObserver(tick).observe(document.documentElement,{childList:true,subtree:true});tick();
})();