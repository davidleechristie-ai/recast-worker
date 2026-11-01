/* Sitewide HQC header presentation: reuse the same brand visual on app journeys.
   The native navigation, upload and payment controls remain untouched. */
(()=>{
 const styleId='hqc-shared-header-style';
 const css=`
 .hqc-unified-app-header{box-sizing:border-box!important;background:#faf9f5!important;border-bottom:1px solid #aebeb8!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:16px!important;min-height:88px!important;padding:16px max(20px,calc((100vw - 1180px)/2))!important;box-shadow:none!important}
 .hqc-unified-app-header .hqc-shared-brand{display:flex!important;flex:0 1 auto!important;min-width:0!important;align-items:center!important;gap:12px!important;text-decoration:none!important;color:#203336!important}
 .hqc-unified-app-header .hqc-shared-mark{width:43px;height:43px;flex:none;display:grid;place-items:center;background:#204b3d;color:white;border-radius:2px}
 .hqc-unified-app-header .hqc-shared-mark svg{width:24px;height:24px;display:block}
 .hqc-unified-app-header .hqc-shared-name{display:block;font:800 20px/1.16 Arial,Helvetica,sans-serif!important;letter-spacing:-.035em;color:#203336!important}
 .hqc-unified-app-header .hqc-shared-tagline{display:block;font:400 12px/1.35 Arial,Helvetica,sans-serif!important;margin-top:4px;color:#67787d!important}
 .hqc-unified-app-header :is(button,a):not(.hqc-shared-brand){border-radius:3px!important;box-shadow:none!important}
 .hqc-unified-app-header button{background:#204b3d!important;color:white!important;min-height:44px!important;padding:10px 16px!important}
 .hqc-unified-app-header .hqc-shared-brand:focus-visible{outline:3px solid #b48b44!important;outline-offset:4px}
 @media(max-width:759px){
 .hqc-unified-app-header{min-height:86px!important;padding:15px 20px!important;gap:10px!important}
 .hqc-unified-app-header .hqc-shared-mark{width:40px;height:40px}
 .hqc-unified-app-header .hqc-shared-name{font-size:17px!important;white-space:nowrap}
 .hqc-unified-app-header .hqc-shared-tagline{font-size:11px!important}
 .hqc-unified-app-header button{padding:10px 12px!important;font-size:14px!important;flex:none}
 }
 @media(max-width:360px){.hqc-unified-app-header{padding-inline:12px!important}.hqc-unified-app-header .hqc-shared-name{font-size:15px!important}.hqc-unified-app-header .hqc-shared-mark{width:36px;height:36px}}
 `;
 const qs=(s,r=document)=>r.querySelector(s);
 function mountStyle(){if(document.getElementById(styleId))return;const tag=document.createElement('style');tag.id=styleId;tag.textContent=css;document.head.appendChild(tag)}
 function decorate(){
  if(qs('#hqc-mobile-landing')||qs('#hqc-clean-home'))return;
  for(const header of document.querySelectorAll('header')){
   if(header.classList.contains('hqc-unified-app-header'))continue;
   const label=[...header.querySelectorAll('b,strong,span,div,h1,h2,p')].find(el=>el.children.length===0&&(el.textContent||'').trim()==='Home Quote Check');
   if(!label)continue;
   let candidate=label;
   while(candidate.parentElement && candidate.parentElement!==header){
    const parent=candidate.parentElement;
    if(parent.querySelector('button,[role="button"]'))break;
    if(!parent.textContent.includes('Home Quote Check'))break;
    candidate=parent;
   }
   const brand=document.createElement('a');
   brand.className='hqc-shared-brand';
   brand.href='/';
   brand.setAttribute('aria-label','Home Quote Check home');
   brand.innerHTML='<span class="hqc-shared-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="m4 11 8-7 8 7v9H4z"/><path d="M9 20v-7h6v7"/></svg></span><span><span class="hqc-shared-name">Home Quote Check</span><span class="hqc-shared-tagline">Be sure before you sign.</span></span>';
   candidate.replaceWith(brand);
   header.classList.add('hqc-unified-app-header');
  }
 }
 mountStyle();
 let pending=false;
 const run=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;decorate()})};
 new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
