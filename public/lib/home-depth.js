(function(){
'use strict';
const tabs=()=>Array.from(document.querySelectorAll('[data-depth-tab]'));
const panels=()=>Array.from(document.querySelectorAll('[data-depth-panel]'));
const map={workflowTemplates:'templates',workflowCopilot:'builder',workflowLibrary:'library',automationHub:'automation'};
function activate(key,scroll){
  if(!key)return;
  tabs().forEach(b=>{const on=b.dataset.depthTab===key;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));});
  panels().forEach(p=>{const on=p.dataset.depthPanel===key;p.classList.toggle('active',on);p.hidden=!on;});
  const panel=document.querySelector('[data-depth-panel="'+key+'"]');
  if(scroll) document.getElementById('exploreRecast')?.scrollIntoView({behavior:'smooth',block:'start'});
  try{sessionStorage.setItem('recast_home_depth',key)}catch(_){}
}
function fromHash(){
  const id=(location.hash||'').slice(1),key=map[id];
  if(key){activate(key,false);setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'}),80);return true}
  return false;
}
function init(){
  if(!document.getElementById('exploreRecast'))return;
  let saved='templates';try{saved=sessionStorage.getItem('recast_home_depth')||'templates'}catch(_){}
  activate(saved,false);fromHash();
  tabs().forEach(b=>b.addEventListener('click',()=>{activate(b.dataset.depthTab,false);window.RecastFunnel?.track('homepage_depth_selected',{surface:b.dataset.depthTab});}));
  document.querySelectorAll('[data-depth-link]').forEach(a=>a.addEventListener('click',e=>{
    const key=a.dataset.depthLink;if(!key)return;activate(key,false);
    window.RecastFunnel?.track('homepage_path_selected',{surface:key});
  }));
  const workbench=document.getElementById('workbench');
  if(workbench&&'IntersectionObserver' in window){
    new IntersectionObserver(entries=>{
      document.body.classList.toggle('tool-mode',entries.some(x=>x.isIntersecting));
    },{rootMargin:'-15% 0px -60% 0px',threshold:0}).observe(workbench);
  }
  window.addEventListener('hashchange',fromHash);
}
window.RecastHomeDepth={activate};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();