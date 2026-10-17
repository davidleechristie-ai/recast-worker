(()=>{
 const mobile=()=>window.innerWidth<760;
 if(location.pathname!=='/'||!mobile())return;
 const destination=new URLSearchParams(location.search);
 if(destination.has('technology')&&destination.has('start')){
   let tries=0;const handoff=setInterval(()=>{tries++;const original=document.getElementById(destination.get('start')==='compare'?'hqc-secondary-compare':'hqc-primary-start')||document.querySelector('.copy button.primary');if(original){clearInterval(handoff);original.click()}else if(tries>=25)clearInterval(handoff)},300);return;
 }
 const css=`@media(min-width:760px){#hqc-mobile-landing{display:none!important}}@media(max-width:759px){
 #hqc-mobile-landing{position:fixed;z-index:2147480000;inset:0;background:white;overflow:auto;overscroll-behavior:contain;color:#0b2548;font:normal 15px/1.45 system-ui,-apple-system,Segoe UI,sans-serif}
 #hqc-mobile-landing *{box-sizing:border-box}#hqc-mobile-landing .inner{max-width:430px;margin:auto;padding:20px 20px 95px}
 #hqc-mobile-landing .brand{display:flex;gap:12px;align-items:center;margin-bottom:36px}
 #hqc-mobile-landing .mark{width:40px;height:40px;border:3px solid #05845c;color:#05845c;border-radius:12px;display:grid;place-items:center;font-size:25px}
 #hqc-mobile-landing .brand b{display:block;font-size:16px;line-height:1.2}#hqc-mobile-landing .brand small{font-size:11px;color:#687a86}
 #hqc-mobile-landing .tag{display:inline-block;border-radius:30px;background:#e4f6ed;padding:6px 12px;font-weight:800;letter-spacing:.1em;color:#057e5b;font-size:11px}
 #hqc-mobile-landing h1{font-size:clamp(32px,9vw,40px);letter-spacing:-.04em;line-height:1.04;margin:15px 0 16px;font-weight:850;color:#0b2548}
 #hqc-mobile-landing p{color:#52647a;margin:4px 0 12px}#hqc-mobile-landing .lead{font-size:16px;line-height:1.5;margin-bottom:20px}
 #hqc-mobile-landing button{cursor:pointer}#hqc-mobile-landing .primary{width:100%;border:0;border-radius:12px;background:#07835f;padding:16px;color:white;font-size:17px;font-weight:800}
 #hqc-mobile-landing .technology-picker{padding:14px;background:#eff9f5;border-radius:14px;margin:16px 0}#hqc-mobile-landing .technology-picker>b{font-size:13px;display:block;margin-bottom:10px}#hqc-mobile-landing .technology-options{display:flex;flex-wrap:wrap;gap:7px}#hqc-mobile-landing .technology-options button{border:1px solid #a6cdc0;border-radius:999px;padding:9px 11px;background:white;color:#0b2548;font-size:12px;font-weight:750}#hqc-mobile-landing .technology-options button[aria-pressed="true"]{background:#087f5b;color:white;border-color:#087f5b}
 #hqc-mobile-landing .upload-note{text-align:center;font-size:12px;margin:10px 0 18px}
 #hqc-mobile-landing .scene{position:relative;background:#eef8f3;border-radius:18px;overflow:hidden;height:215px;margin:20px 0}
 #hqc-mobile-landing .scene img{width:100%;height:100%;object-fit:contain}
 #hqc-mobile-landing .result-mini{position:absolute;right:10px;bottom:10px;background:#fff;border-radius:12px;padding:12px;box-shadow:0 5px 22px #0b254833;font-size:11px}
 #hqc-mobile-landing .result-mini b,#hqc-mobile-landing .result-mini span{display:block;margin:3px 0}
 #hqc-mobile-landing .benefits{border-radius:16px;background:#eff9f5;padding:4px 16px;margin:16px 0 24px}
 #hqc-mobile-landing .benefit{display:flex;gap:14px;align-items:center;padding:14px 0;border-bottom:1px solid #dce9e3}#hqc-mobile-landing .benefit:last-child{border:0}
 #hqc-mobile-landing .symbol{width:43px;height:43px;flex:none;border-radius:50%;display:grid;place-items:center;background:#d3f1e4;color:#07835f;font-size:22px}
 #hqc-mobile-landing .benefit b{font-size:15px}#hqc-mobile-landing .benefit p{font-size:13px;margin:3px 0 0}
 #hqc-mobile-landing h2{font-size:24px!important;letter-spacing:-.025em;line-height:1.15;margin:7px 0 10px;color:#0b2548!important}
 #hqc-mobile-landing .section{margin:28px 0}#hqc-mobile-landing .sample{border-radius:14px;border:1px solid #dbe8e1;padding:16px;margin-top:12px}
 #hqc-mobile-landing .sample b{display:block;margin-bottom:8px}#hqc-mobile-landing .fact{display:flex;justify-content:space-between;gap:8px;border-top:1px solid #e8eeeb;padding:9px 0;font-size:12px}
 #hqc-mobile-landing .fact em{font-style:normal;color:#057f59;text-align:right}#hqc-mobile-landing .fact .warn{color:#a46a00}
 #hqc-mobile-landing .step{display:flex;gap:12px;margin:14px 0}#hqc-mobile-landing .step i{flex:none;width:30px;height:30px;border-radius:50%;background:#c9efdf;display:grid;place-items:center;font-style:normal;font-weight:800}
 #hqc-mobile-landing .step b{font-size:14px}#hqc-mobile-landing .step p{font-size:12px;margin:2px 0}
 #hqc-mobile-landing .comparison{border-radius:16px;background:#eff9f5;padding:18px;margin-bottom:24px}
 #hqc-mobile-landing .secondary{width:100%;border:1px solid #07835f;border-radius:10px;background:transparent;color:#07835f;font-size:14px;font-weight:800;padding:12px;margin-top:12px}
 #hqc-mobile-landing .sticky{position:sticky;bottom:0;background:linear-gradient(transparent,#fff 18%);padding:12px 20px max(14px,env(safe-area-inset-bottom));margin-top:-70px}
 }`;
 const template=`<div class="inner"><div class="brand"><span class="mark">⌂</span><div><b>Home Quote Check</b><small>Be sure before you sign.</small></div></div>
 <span class="tag">HOME ENERGY QUOTES</span><h1>Is your home energy quote a good deal?</h1>
 <p class="lead">See what’s included, what’s missing and what to ask before paying a deposit.</p><div class="technology-picker"><b>What are you getting a quote for?</b><div class="technology-options"><button type="button" data-tech="heat_pump" aria-pressed="true">Heat pump</button><button type="button" data-tech="solar_battery" aria-pressed="false">Solar & battery</button><button type="button" data-tech="ev_chargepoint" aria-pressed="false">EV charger</button></div></div>
 <button class="primary" data-go="single">Check my quote — free →</button><p class="upload-note">Upload a photo, screenshot or PDF · Get clear next steps</p>
 <div class="scene"><img src="/resources/homepage-house-only.svg" alt="House with an outdoor heat pump"><div class="result-mini"><b>✓ Example quote review</b><span>✓ Price checked</span><span>⚠ Missing details highlighted</span><span>✓ Questions to ask</span></div></div>
 <div class="benefits"><div class="benefit"><span class="symbol">▥</span><div><b>Check the price</b><p>Understand how your quote compares.</p></div></div>
 <div class="benefit"><span class="symbol">⌕</span><div><b>Spot what's missing</b><p>Find unclear costs and exclusions.</p></div></div>
 <div class="benefit"><span class="symbol">☏</span><div><b>Ask the right questions</b><p>Know what to clarify with your installer.</p></div></div></div>
 <div class="section"><span class="tag">EXAMPLE RESULT</span><h2>A clearer picture of your quote.</h2><p>Illustrative example of the information checked.</p>
 <div class="sample"><b>▤ Installer Quote.pdf · Example</b><div class="fact">Price <em>✓ Reviewed</em></div><div class="fact">Installation scope <em class="warn">⚠ Details missing</em></div><div class="fact">Warranty <em>✓ Checked</em></div><div class="fact">Extras and add-ons <em class="warn">⚠ Needs clarity</em></div><div class="fact">Installer questions <em>✓ Suggested</em></div></div></div>
 <div class="section"><h2>How it works</h2><div class="step"><i>1</i><div><b>Upload your quote</b><p>Take a photo or upload a PDF.</p></div></div><div class="step"><i>2</i><div><b>We check the details</b><p>We review price, scope and key information.</p></div></div><div class="step"><i>3</i><div><b>Get your answers</b><p>See what needs attention before you commit.</p></div></div></div>
 <div class="comparison"><span class="tag">MORE THAN ONE QUOTE?</span><h2>Compare quotes side by side.</h2><p>See differences in price, scope and what's included.</p><button class="secondary" data-go="compare">Compare quotes →</button></div>
 </div><div class="sticky"><button class="primary" data-go="single">Check my quote — free →</button></div>`;
 function updatePresentation(screen,technology){
  const renewable=technology==='solar_battery'||technology==='ev_chargepoint';
  const label=technology==='solar_battery'?'solar or battery':technology==='ev_chargepoint'?'EV charger':'home energy';
  screen.querySelector('h1').textContent='Is your '+label+' quote a good deal?';
  screen.querySelector('.upload-note').textContent=renewable?'Upload a text-based installer PDF · Photos and scanned PDFs are not supported':'Upload a photo, screenshot or PDF · Get clear next steps';
  screen.querySelector('.scene').hidden=renewable;
  screen.querySelector('.step p').textContent=renewable?'Upload a text-based installer PDF.':'Take a photo or upload a PDF.';
 }
 function selectedTechnology(){return document.querySelector("#hqc-mobile-landing [data-tech][aria-pressed=\"true\"]")?.dataset.tech||"heat_pump"}
 let journeyActive=false;
 function go(mode){
  journeyActive=true;
  const technology=selectedTechnology();try{sessionStorage.setItem("hqc_journey_technology",technology);sessionStorage.setItem("hqc_journey_mode",mode);if(mode==="compare")sessionStorage.setItem("hqc_compare_intent","1");else sessionStorage.removeItem("hqc_compare_intent")}catch{}
  const overlay=document.getElementById('hqc-mobile-landing');if(overlay)overlay.remove();
  document.getElementById('hqc-mobile-sticky-cta')?.remove();
  let original=mode==='compare'?document.getElementById('hqc-secondary-compare'):document.getElementById('hqc-primary-start');
  if(!original)original=document.querySelector('.copy button.primary')||[...document.querySelectorAll('button')].find(b=>/get started/i.test(b.textContent||''));
  if(technology!=="heat_pump"||(destination.get('technology')&&destination.get('technology')!==technology)){const next=new URL(location.href);next.searchParams.set('technology',technology);next.searchParams.set('start',mode);location.href=next.pathname+next.search;return}
  if(original){original.click();return}
  const nav=document.querySelector('header button');if(nav)nav.click();
 }
 function mount(){
  if(!mobile()||document.getElementById('hqc-mobile-landing'))return;
  if(journeyActive)return;
  const text=document.body.innerText||'';
  if(/Upload your quote|Your home|Your quote check|Your quote comparison/i.test(text)&&!/Add your quotes|Understand your quotes before choosing an installer/i.test(text))return;
  if(!/Add your quotes|Check your quote|Understand your quotes/i.test(text))return;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
  const screen=document.createElement('div');screen.id='hqc-mobile-landing';screen.setAttribute('aria-label','Home Quote Check mobile homepage');screen.innerHTML=template;
  document.body.appendChild(screen);
  screen.querySelectorAll('[data-tech]').forEach(button=>button.addEventListener('click',()=>{screen.querySelectorAll('[data-tech]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));updatePresentation(screen,button.dataset.tech);}));
  const preferred=destination.get('technology')||sessionStorage.getItem('hqc_journey_technology')||'heat_pump';
  const selected=screen.querySelector('[data-tech="'+preferred+'"]')||screen.querySelector('[data-tech="heat_pump"]');selected.click();
  screen.querySelectorAll('[data-go]').forEach(button=>button.addEventListener('click',()=>go(button.dataset.go)));
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
 setTimeout(mount,1200);
 // The underlying app changes routes without reloading scripts. Remount on return to Home.
 function onNavigation(){
  if(!mobile()||location.pathname!=='/')return;
  const text=document.body.innerText||'';
  const isHome=/Add your quotes|Understand your quotes before choosing an installer/i.test(text);
  if(isHome){journeyActive=false;mount()}
 }
 let pending=false;
 new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;onNavigation()})}).observe(document.body||document.documentElement,{childList:true,subtree:true});
 addEventListener('popstate',()=>setTimeout(onNavigation,100));
 document.addEventListener('click',event=>{
  const button=event.target.closest('button,a');if(!button)return;
  const name=(button.textContent||'').trim();
  if(/^Home$/i.test(name))setTimeout(()=>{journeyActive=false;onNavigation()},150);
 },true);
})();
