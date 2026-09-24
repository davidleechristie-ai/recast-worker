(()=>{
  const FLAG='hqc_solar_preview';
  const TECH='hqc_journey_technology';
  const MEDIA='hqc_solar_extracted_media';
  let lastResult=null,resultVersion=0;
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
  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const media=()=>{try{const v=JSON.parse(sessionStorage.getItem(MEDIA)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  function renderAnalysis(){
    if(!enabled()||!lastResult)return;
    let host=document.querySelector('#hqc-solar-analysis-result');
    if(host&&host.dataset.hqcResultVersion===String(resultVersion))return;
    if(!host){host=document.createElement('section');host.id='hqc-solar-analysis-result';host.style.cssText='max-width:1040px;margin:22px auto;padding:24px;border:1px solid #cfe3da;border-radius:14px;background:#f5fbf8;color:#102642;box-shadow:0 10px 30px rgba(16,38,66,.08)';const anchor=document.querySelector('.resultsTop')||document.querySelector('main')||document.body;if(anchor===document.body)anchor.prepend(host);else anchor.insertAdjacentElement('beforebegin',host);}
    const analyses=Array.isArray(lastResult.analyses)?lastResult.analyses:[lastResult];
    const cards=analyses.map((a,i)=>{const e=a.evidence||{},facts=[
      ['Price',e.priceGbp==null?'Not stated':'£'+Number(e.priceGbp).toLocaleString('en-GB')],
      ['Array size',e.arrayKwp==null?'Not stated':e.arrayKwp+' kWp'],
      ['Panels',e.panel?.count==null?'Not stated':e.panel.count+' panels'],
      ['Inverter',e.inverter?[e.inverter.make,e.inverter.model].filter(Boolean).join(' ')||'Stated':'Not stated'],
      ['Battery',e.battery?(e.battery.usableCapacityKwh==null?'Included; capacity not stated':e.battery.usableCapacityKwh+' kWh usable'):'Not evidenced'],
      ['Annual generation',e.annualGenerationKwh==null?'Not stated':Number(e.annualGenerationKwh).toLocaleString('en-GB')+' kWh']
    ];const gaps=(a.gaps||[]).map(g=>'<li>'+esc(g)+'</li>').join('');const qs=(a.installerQuestions||[]).slice(0,6).map(q=>'<li>'+esc(q.question)+'</li>').join('');
      return '<article style="padding:18px;border:1px solid #d9e9e2;border-radius:12px;background:#fff"><h3 style="margin:0 0 14px">'+esc(analyses.length>1?(a.quoteId||'Quote '+(i+1)):'What your Solar/Battery quote says')+'</h3><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px">'+facts.map(([k,v])=>'<div style="padding:12px;border-radius:9px;background:#f4f8f6"><small style="display:block;color:#617187;font-weight:700">'+esc(k)+'</small><b>'+esc(v)+'</b></div>').join('')+'</div><h4 style="margin:18px 0 6px">Evidence gaps</h4><ul style="margin:0 0 12px;padding-left:20px">'+(gaps||'<li>No configured evidence gaps found.</li>')+'</ul><h4 style="margin:14px 0 6px">Questions to ask the installer</h4><ul style="margin:0;padding-left:20px">'+(qs||'<li>No additional question generated.</li>')+'</ul></article>';
    }).join('');
    const compare=Array.isArray(lastResult.comparison)?'<p style="margin:14px 0 0;font-weight:800;color:#07503b">'+esc(lastResult.conclusion||'Compare evidenced scope and omissions before deciding.')+'</p>':'';
    host.dataset.hqcResultVersion=String(resultVersion);
    host.innerHTML='<div style="font-size:11px;font-weight:900;letter-spacing:.05em;color:#6a4b00">PRIVATE SOLAR / BATTERY PREVIEW</div><h2 style="margin:5px 0 8px">Independent quote evidence check</h2><p style="margin:0 0 16px;color:#526579">This checks what is written in the quote. It does not certify electrical design, roof suitability, DNO approval, MCS status, generation or savings.</p><div style="display:grid;gap:14px">'+cards+'</div>'+compare;
    host.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function addTechnologyHeader(){
    if(!enabled())return;
    const original=window.fetch;if(original.__hqcSolarPreview)return;
    const wrapped=async(input,init={})=>{
      const u=typeof input==='string'?input:input?.url||'';
      if(!/\/api\/(?:analyse|analyze)/i.test(u))return original(input,init);
      const extracted=media();
      const headers=new Headers(init.headers||(input instanceof Request?input.headers:undefined));
      headers.set('x-hqc-technology','solar_battery');
      if(!extracted.length){headers.set('content-type','application/json');return new Response(JSON.stringify({error:'solar_extracted_media_required'}),{status:415,headers:{'content-type':'application/json'}});}
      headers.set('content-type','application/json');
      const payload=extracted.length>1?{technology:'solar_battery',quotes:extracted.map((m,i)=>({quoteId:'quote_'+(i+1),extractedMedia:m}))}:{technology:'solar_battery',extractedMedia:extracted[0]};
      const response=await original(typeof input==='string'?input:u,{...init,method:'POST',headers,body:JSON.stringify(payload)});
      try{if(response.ok){lastResult=await response.clone().json();resultVersion++;setTimeout(renderAnalysis,50)}}catch{}
      return response;
    };
    wrapped.__hqcSolarPreview=true;window.fetch=wrapped;
  }
  if(new URLSearchParams(location.search).get('solar_preview')==='0')clearPreview();
  addTechnologyHeader();
  let queued=false;
  const tick=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorateHome();decorateUpload();renderAnalysis()})};
  new MutationObserver(tick).observe(document.documentElement,{childList:true,subtree:true});tick();
})();