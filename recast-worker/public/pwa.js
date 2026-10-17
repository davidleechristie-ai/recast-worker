(function(){
'use strict';
const TASK='recast_pwa_success_count_v1',DISMISSED='recast_pwa_install_dismissed_v1',INSTALLED='recast_pwa_installed_at_v1',RETURN='recast_pwa_last_return_day_v1',PINS='recast_pwa_pinned_tools_v1',RECENT='recast_pwa_recent_tools_v1';
const track=(name,params)=>{try{if(typeof gtag==='function')gtag('event',name,params||{});}catch(_){}};
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const taskCount=()=>{try{return Number(localStorage.getItem(TASK)||0);}catch(_){return 0;}};
const isIos=()=>/iphone|ipad|ipod/i.test(navigator.userAgent);
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(()=>{}));
function networkState(){let el=document.getElementById('recastOfflineIndicator');if(navigator.onLine){el?.remove();return;}if(!el){el=document.createElement('div');el.id='recastOfflineIndicator';el.className='recast-offline-indicator';el.setAttribute('role','status');el.textContent='Offline — local tools remain available';document.body.appendChild(el);track('pwa_offline_seen',{path:location.pathname});}}
addEventListener('online',networkState);addEventListener('offline',networkState);
let deferredPrompt=null;
addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredPrompt=event;maybePrompt();});
addEventListener('appinstalled',()=>{try{localStorage.setItem(INSTALLED,String(Date.now()));}catch(_){}track('pwa_installed',{path:location.pathname,successful_tasks:taskCount()});document.getElementById('recastInstallCard')?.remove();});
function eligible(){try{return taskCount()>=2&&!localStorage.getItem(DISMISSED)&&!standalone();}catch(_){return false;}}
function installCard(ios){
 if(!eligible()||document.getElementById('recastInstallCard'))return;
 const card=document.createElement('aside');card.id='recastInstallCard';card.className='recast-install-card';card.setAttribute('aria-label','Install Recast');
 card.innerHTML=ios?'<strong>Keep Recast on your Home Screen</strong><p>Tap the Share button, then choose <b>Add to Home Screen</b>. Recast will open like an app and keep local tools available offline.</p><div class="recast-install-actions"><button class="primary" type="button" data-understood>Got it</button><button type="button" data-later>Not now</button></div>':'<strong>Keep Recast one click away</strong><p>Install the local toolkit for faster return visits and offline access.</p><div class="recast-install-actions"><button class="primary" type="button" data-install>Install Recast</button><button type="button" data-later>Not now</button></div>';
 document.body.appendChild(card);track('pwa_install_prompt_shown',{successful_tasks:taskCount(),path:location.pathname,platform:ios?'ios':'browser'});
 card.querySelector('[data-install]')?.addEventListener('click',async()=>{track('pwa_install_clicked',{successful_tasks:taskCount()});deferredPrompt.prompt();const choice=await deferredPrompt.userChoice;track('pwa_install_prompt_result',{outcome:choice.outcome});deferredPrompt=null;card.remove();});
 card.querySelector('[data-understood]')?.addEventListener('click',()=>{track('pwa_ios_install_instructions_acknowledged',{});card.remove();});
 card.querySelector('[data-later]').addEventListener('click',()=>{try{localStorage.setItem(DISMISSED,String(Date.now()));}catch(_){}track('pwa_install_dismissed',{platform:ios?'ios':'browser'});card.remove();});
}
function maybePrompt(){if(!eligible())return;if(deferredPrompt)installCard(false);else if(isIos())installCard(true);}
function recordSuccess(kind){try{const next=Math.min(99,taskCount()+1);localStorage.setItem(TASK,String(next));track('pwa_successful_task',{task_kind:kind||'tool',successful_tasks:next});maybePrompt();}catch(_){}}
document.addEventListener('recast:task-success',event=>recordSuccess(event.detail?.kind));
function setupSuccessTracking(){
 const convert=document.getElementById('convertBtn'),status=document.getElementById('status');if(convert&&status){let armed=false;convert.addEventListener('click',()=>{armed=true;});new MutationObserver(()=>{if(armed&&status.querySelector('.status-ok')){armed=false;recordSuccess('conversion');}}).observe(status,{childList:true,subtree:true,characterData:true});}
 const recipeRun=document.getElementById('recipeRunBtn'),summary=document.getElementById('recipeSummary');if(recipeRun&&summary){let armed=false;recipeRun.addEventListener('click',()=>{armed=true;});new MutationObserver(()=>{if(armed&&summary.querySelector('.status-ok')){armed=false;recordSuccess('workflow');}}).observe(summary,{childList:true,subtree:true,characterData:true});}
 document.getElementById('rb2RunBtn')?.addEventListener('click',()=>setTimeout(()=>{const preview=document.getElementById('rb2Preview'),errors=document.getElementById('rb2Errors');if(preview?.value&&(!errors||errors.style.display==='none'))recordSuccess('workflow_builder');},700));
 document.getElementById('playgroundRunBtn')?.addEventListener('click',()=>setTimeout(()=>{if(!document.getElementById('playgroundOutput')?.classList.contains('playground-error'))recordSuccess('api_playground');},0));
 const toast=document.getElementById('shareToast');if(toast)new MutationObserver(()=>{if(/Hosted workflow completed successfully/i.test(toast.textContent||''))recordSuccess('hosted_workflow');}).observe(toast,{childList:true,subtree:true,characterData:true});
}
function rememberTool(){
 const match=location.pathname.match(/^\/tools\/([^/]+)$/);if(!match)return;const slug=match[1].replace(/\.html$/,'');if(slug==='index')return;const path=location.pathname,heading=document.querySelector('h1'),label=heading?.textContent?.trim().replace(/\s+/g,' ').slice(0,60)||slug.replace(/-/g,' ');
 try{const recent=JSON.parse(localStorage.getItem(RECENT)||'[]').filter(item=>item[1]!==path);recent.unshift([label,path]);localStorage.setItem(RECENT,JSON.stringify(recent.slice(0,5)));const button=document.createElement('button');button.type='button';button.className='recast-pin-tool';const refresh=()=>{const pins=JSON.parse(localStorage.getItem(PINS)||'[]');button.textContent=pins.some(item=>item[1]===path)?'★ Pinned':'☆ Pin tool';};button.addEventListener('click',()=>{let pins=JSON.parse(localStorage.getItem(PINS)||'[]');const active=pins.some(item=>item[1]===path);pins=active?pins.filter(item=>item[1]!==path):[[label,path]].concat(pins).slice(0,8);localStorage.setItem(PINS,JSON.stringify(pins));track(active?'pwa_tool_unpinned':'pwa_tool_pinned',{tool_path:path});refresh();});heading?.insertAdjacentElement('afterend',button);refresh();}catch(_){}
}
function applyOption(id,value){const el=document.getElementById(id);if(!el||value===undefined)return;if(el.type==='checkbox')el.checked=!!value;else el.value=String(value);el.dispatchEvent(new Event('change',{bubbles:true}));}
function consumeHandoff(){
 if(!/^\/app(?:\/|$)/.test(location.pathname))return;
 try{const rawFile=sessionStorage.getItem('recast_pwa_open_file_v1');if(rawFile){const data=JSON.parse(rawFile),input=document.getElementById('input');if(input){input.value=data.text||'';input.dispatchEvent(new Event('input',{bubbles:true}));const ext=(data.name.split('.').pop()||'').toLowerCase(),mode={csv:'csv2json',xml:'xml2json',yaml:'yaml2json',yml:'yaml2json'}[ext];if(mode)document.querySelector(`.mode-chip[data-mode="${mode}"]`)?.click();sessionStorage.removeItem('recast_pwa_open_file_v1');track('pwa_file_loaded_to_workbench',{extension:ext,file_count:data.count||1});}}
 const rawPreset=sessionStorage.getItem('recast_pwa_open_preset_v1');if(rawPreset){const preset=JSON.parse(rawPreset);document.querySelector(`.mode-chip[data-mode="${preset.mode}"]`)?.click();const options=preset.options||{};applyOption('delimiter',options.delimiter);applyOption('excelBom',options.excelBom);applyOption('prettyPrint',options.prettyPrint??options.pretty);applyOption('inferTypes',options.inferTypes);sessionStorage.removeItem('recast_pwa_open_preset_v1');track('pwa_preset_applied',{mode:preset.mode||'unknown'});}}
 catch(_){}
}
function retention(){if(!standalone())return;const today=new Date().toISOString().slice(0,10);try{let installedAt=Number(localStorage.getItem(INSTALLED)||0);if(!installedAt){installedAt=Date.now();localStorage.setItem(INSTALLED,String(installedAt));}const previous=localStorage.getItem(RETURN),days=Math.max(0,Math.floor((Date.now()-installedAt)/86400000));track('pwa_standalone_opened',{path:location.pathname,source:new URLSearchParams(location.search).get('source')||'direct',days_since_install:days});if(previous&&previous!==today)track('pwa_retention_return',{days_since_install:days});localStorage.setItem(RETURN,today);}catch(_){} }
function init(){networkState();setupSuccessTracking();rememberTool();consumeHandoff();retention();maybePrompt();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
