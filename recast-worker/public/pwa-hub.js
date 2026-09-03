(function () {
  'use strict';
  const PIN_KEY='recast_pwa_pinned_tools_v1', RECENT_KEY='recast_pwa_recent_tools_v1', PRESET_KEY='recast_presets_v1';
  const DEFAULTS=[['JSON → CSV','/tools/json-to-csv.html'],['CSV diff','/tools/csv-diff.html'],['JSON formatter','/tools/json-formatter.html']];
  const $=id=>document.getElementById(id);
  const read=(key,fallback)=>{try{const value=localStorage.getItem(key);return value?JSON.parse(value):fallback;}catch(_){return fallback;}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch(_){}};
  const track=(name,params)=>{try{if(typeof gtag==='function')gtag('event',name,params||{});}catch(_){}};
  function pins(){const stored=read(PIN_KEY,null);if(Array.isArray(stored))return stored;write(PIN_KEY,DEFAULTS);return DEFAULTS.slice();}
  function row(item,action,label){
    const wrap=document.createElement('div');wrap.className='pwa-tool-row';
    const link=document.createElement('a');link.href=item[1];
    const text=document.createElement('span');text.textContent=item[0];const arrow=document.createElement('span');arrow.textContent='→';link.append(text,arrow);wrap.appendChild(link);
    if(action){const button=document.createElement('button');button.type='button';button.className='pwa-row-action';button.textContent=label;button.setAttribute('aria-label',`${label} ${item[0]}`);button.addEventListener('click',()=>action(item));wrap.appendChild(button);}
    return wrap;
  }
  function isPinned(path){return pins().some(item=>item[1]===path);}
  function pin(item){write(PIN_KEY,[item].concat(pins().filter(existing=>existing[1]!==item[1])).slice(0,8));track('pwa_tool_pinned',{tool_path:item[1]});render();}
  function unpin(item){write(PIN_KEY,pins().filter(existing=>existing[1]!==item[1]));track('pwa_tool_unpinned',{tool_path:item[1]});render();}
  function openPreset(index){const preset=read(PRESET_KEY,[])[index];if(!preset)return;try{sessionStorage.setItem('recast_pwa_open_preset_v1',JSON.stringify(preset));}catch(_){}track('pwa_preset_opened',{mode:preset.mode||'unknown'});location.href='/app/?source=pwa-preset';}
  function render(){
    const pinned=pins(),pinnedEl=$('pinnedTools');pinnedEl.innerHTML='';if(!pinned.length)pinnedEl.innerHTML='<span class="empty">Pin a recent tool to keep it here.</span>';pinned.forEach(item=>pinnedEl.appendChild(row(item,unpin,'Unpin')));
    const recent=read(RECENT_KEY,[]),recentEl=$('recentTools');recentEl.innerHTML='';if(!recent.length)recentEl.innerHTML='<span class="empty">Your recently opened tools will appear here.</span>';recent.forEach(item=>recentEl.appendChild(row(item,isPinned(item[1])?unpin:pin,isPinned(item[1])?'Unpin':'Pin')));
    const presets=read(PRESET_KEY,[]),presetEl=$('savedPresets');presetEl.innerHTML='';if(!presets.length)presetEl.innerHTML='<span class="empty">Your saved presets will appear here.</span>';presets.slice(0,5).forEach((preset,index)=>{const presetRow=row([preset.name||'Saved preset','#'],()=>openPreset(index),'Open');presetRow.querySelector('a').addEventListener('click',event=>{event.preventDefault();openPreset(index);});presetEl.appendChild(presetRow);});
    const workflows=read('recast_workflow_library_v1',read('recast_recipes_v1',[])),workflowEl=$('savedWorkflows');workflowEl.innerHTML='';if(!Array.isArray(workflows)||!workflows.length)workflowEl.innerHTML='<span class="empty">Workflows saved in Recast stay available on this device.</span>';(Array.isArray(workflows)?workflows:[]).slice(0,5).forEach(flow=>workflowEl.appendChild(row([flow.name||'Saved workflow','/app/#workflowLibrary'])));
  }
  render();
  const status=$('networkStatus');function networkState(){status.textContent=navigator.onLine?'Online':'Offline · local mode';}addEventListener('online',networkState);addEventListener('offline',networkState);networkState();
  const input=$('fileInput'),drop=$('dropZone');$('fileOpen').addEventListener('click',()=>input.click());input.addEventListener('change',()=>openFiles(input.files));
  ['dragenter','dragover'].forEach(name=>drop.addEventListener(name,event=>{event.preventDefault();drop.classList.add('active');}));
  ['dragleave','drop'].forEach(name=>drop.addEventListener(name,event=>{event.preventDefault();drop.classList.remove('active');if(name==='drop')openFiles(event.dataTransfer.files);}));
  function openFiles(files){if(!files||!files.length)return;const file=files[0],reader=new FileReader();reader.onload=()=>{try{sessionStorage.setItem('recast_pwa_open_file_v1',JSON.stringify({name:file.name,type:file.type,text:String(reader.result),count:files.length}));}catch(_){}track('pwa_file_opened',{extension:(file.name.split('.').pop()||'').toLowerCase(),file_count:files.length});location.href='/app/?source=pwa-file';};reader.readAsText(file);}
  if('launchQueue'in window&&'LaunchParams'in window&&'files'in window.LaunchParams.prototype)launchQueue.setConsumer(async params=>{if(!params.files||!params.files.length)return;const files=[];for(const handle of params.files)files.push(await handle.getFile());openFiles(files);});
  if(new URLSearchParams(location.search).get('source')==='share-target'){const open=indexedDB.open('recast-pwa',1);open.onupgradeneeded=()=>open.result.createObjectStore('shared');open.onsuccess=()=>{const tx=open.result.transaction('shared','readwrite'),store=tx.objectStore('shared'),get=store.get('pending');get.onsuccess=()=>{if(!get.result||!get.result.files||!get.result.files.length)return;openFiles(get.result.files);store.delete('pending');track('pwa_share_target_opened',{file_count:get.result.files.length});};};}
})();
