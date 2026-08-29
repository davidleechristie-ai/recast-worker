/* Recast hosted workflow deployment + automation dashboard. */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function token(){ try{return localStorage.getItem('recast_access_token')||'';}catch(_){return '';} }
  function headers(){ return {'Content-Type':'application/json','Authorization':'Bearer '+token()}; }
  function toast(msg){ if(window.showToast)window.showToast(msg); else alert(msg); }
  function requireToken(){ if(token()) return true; showUpgrade('api','Deploying a hosted workflow requires API or Automation access.'); return false; }
  function showUpgrade(kind,message){window.RecastFunnel?.track('upgrade_shown',{feature:kind});toast(message);location.hash='pricing';setTimeout(()=>document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'}),80);}
  async function api(path,opts){ const r=await fetch(path,Object.assign({},opts||{},{headers:Object.assign({},headers(),(opts&&opts.headers)||{})})); let data={}; try{data=await r.json();}catch(_){} if(!r.ok)throw new Error(data.error||('Request failed ('+r.status+')')); return data; }

  const HOSTED_SUPPORTED=new Set(['json2csv','csv2json','json2xml','xml2json','flatten','unflatten','json2yaml','yaml2json','json2markdown','markdown2json','transformSelect','transformRemove','transformRename','transformFilter','transformSort','transformConvertType','transformAddField','transformCombine','jsonPath','validateJsonStep','validateXmlStep','sortJson','formatJson']);
  function unsupportedSteps(item){return (item?.steps||[]).map(s=>s.mode).filter(m=>!HOSTED_SUPPORTED.has(m));}
  function preflight(item){
    const bad=unsupportedSteps(item);
    if(!bad.length)return true;
    toast('This workflow contains browser-only steps that cannot be hosted yet: '+[...new Set(bad)].join(', ')+'. Remove or replace them before deployment.');
    return false;
  }
  async function syncHosted(){
    if(!token()||!window.RecastWorkflowLibrary)return;
    try{
      const d=await api('/v1/workflows'), hosted=d.workflows||[], local=window.RecastWorkflowLibrary.load();
      for(const remote of hosted){
        let item=local.find(w=>w.deploymentId===remote.id);
        if(!item){
          try{
            const detail=await api('/v1/workflows/'+encodeURIComponent(remote.id));
            const wf=detail.workflow;
            item=window.RecastWorkflowLibrary.save({schemaVersion:3,name:wf.name,steps:wf.steps||[],deploymentId:wf.id,endpoint:wf.endpoint,hostedRecovered:true,automation:detail.automation||undefined});
          }catch(_){}
        } else {
          try{const detail=await api('/v1/workflows/'+encodeURIComponent(remote.id));window.RecastWorkflowLibrary.update(item.id,{automation:detail.automation||item.automation,endpoint:detail.workflow.endpoint});}catch(_){}
        }
      }
      render();
    }catch(_){}
  }
  async function deleteHosted(item){
    if(!item?.deploymentId||!requireToken())return;
    if(!confirm('Delete the hosted deployment? The local workflow will remain available in this browser.'))return;
    try{await api('/v1/workflows/'+encodeURIComponent(item.deploymentId),{method:'DELETE'});window.RecastWorkflowLibrary.update(item.id,{deploymentId:null,endpoint:null,deployedAt:null,automation:null});toast('Hosted deployment deleted. Local workflow kept.');render();refreshMetrics();}catch(e){if(/Automation plan/i.test(e.message))showUpgrade('automation','Scheduling and encrypted connectors are included with the Automation plan.');else toast(e.message);}
  }

  async function deploy(item){
    if(!item||!requireToken())return null;
    if(!preflight(item))return null;
    if(item.deploymentId){ toast('This workflow is already deployed.'); return item; }
    try{
      const data=await api('/v1/workflows',{method:'POST',body:JSON.stringify({workflow:{name:item.name,steps:item.steps}})});
      const wf=data.workflow;
      const updated=window.RecastWorkflowLibrary.update(item.id,{deploymentId:wf.id,endpoint:wf.endpoint,deployedAt:Date.now()});
      toast('Workflow deployed — API endpoint is ready.'); render(); return updated;
    }catch(e){toast(e.message);return null;}
  }

  async function run(item){
    if(!item||!requireToken())return;
    if(!item.deploymentId)item=await deploy(item); if(!item||!item.deploymentId)return;
    const input=$('input')?.value||''; if(!input.trim()){toast('Load data into the Recast input first, then run the hosted workflow.');return;}
    try{
      const data=await api('/v1/workflows/'+encodeURIComponent(item.deploymentId)+'/run',{method:'POST',body:JSON.stringify({input})});
      if($('output'))$('output').value=data.output||'';
      toast('Hosted workflow completed successfully.'); await history(item);
    }catch(e){toast(e.message);}
  }

  let pendingAutomationItem=null;
  function closeAutomationModal(){const m=$('automationSetupModal');if(m)m.hidden=true;pendingAutomationItem=null;}
  async function schedule(item){
    window.RecastFunnel?.track('automation_clicked',{workflow_name:item?.name||'Untitled'});
    if(!item||!requireToken())return;
    if(!item.deploymentId)item=await deploy(item); if(!item||!item.deploymentId)return;
    pendingAutomationItem=item;
    const m=$('automationSetupModal'); if(!m)return;
    $('autoTimezone').value=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
    $('autoHour').value=new Date().getHours();
    m.hidden=false; loadCredentials();
  }
  async function saveAutomationSetup(){
    const item=pendingAutomationItem;if(!item)return;
    const cadence=$('autoCadence').value, inputMode=document.querySelector('input[name="autoInputMode"]:checked')?.value||'fixed';
    const body={enabled:true,cadence,inputMode,timeZone:$('autoTimezone').value.trim()||'UTC',hour:Math.max(0,Math.min(23,parseInt($('autoHour').value,10)||0)),weekday:$('autoWeekday').value};
    if(inputMode==='http'){body.inputUrl=$('autoInputUrl').value.trim();if(!body.inputUrl){toast('Enter a public HTTPS input URL.');return;}}
    else {body.input=$('input')?.value||'';if(!body.input.trim()){toast('Load the input you want to automate first.');return;}if(!confirm('This stores the current input in Recast hosted storage. Continue?'))return;}
    const hook=$('autoWebhook').value.trim();if(hook)body.outputWebhook=hook;const alertEmail=$('autoAlertEmail')?.value.trim();if(alertEmail)body.alertEmail=alertEmail;const inCred=$('autoInputCredential')?.value,outCred=$('autoOutputCredential')?.value;if(inCred)body.inputCredentialId=inCred;if(outCred)body.outputCredentialId=outCred;
    try{const data=await api('/v1/workflows/'+encodeURIComponent(item.deploymentId)+'/automation',{method:'POST',body:JSON.stringify(body)});window.RecastWorkflowLibrary.update(item.id,{automation:data.automation});toast('Automation enabled.');closeAutomationModal();render();refreshUsage();}
    catch(e){toast(e.message);}
  }
  async function pause(item){
    if(!item?.deploymentId||!requireToken())return;
    try{await api('/v1/workflows/'+encodeURIComponent(item.deploymentId)+'/automation',{method:'POST',body:JSON.stringify({enabled:false})});window.RecastWorkflowLibrary.update(item.id,{automation:{enabled:false}});toast('Automation paused.');render();}catch(e){toast(e.message);}
  }
  async function copyEndpoint(item){
    if(!item?.deploymentId){toast('Deploy the workflow first.');return;}
    const value=location.origin+'/v1/workflows/'+item.deploymentId+'/run';
    try{await navigator.clipboard.writeText(value);toast('Workflow endpoint copied.');}catch(_){prompt('Copy endpoint:',value);}
  }
  async function history(item){
    if(!item?.deploymentId||!requireToken())return;
    const target=$('automationHistory'); if(target)target.innerHTML='<div class="auto-empty">Loading run history…</div>';
    try{
      const data=await api('/v1/workflows/'+encodeURIComponent(item.deploymentId)+'/history');
      if(!target)return;
      if(!data.runs?.length){target.innerHTML='<div class="auto-empty">No hosted runs yet.</div>';return;}
      target.innerHTML='<div class="auto-history-head"><strong>'+esc(item.name)+'</strong><span>Last '+data.runs.length+' runs</span></div>'+data.runs.map(r=>`<div class="auto-run"><span class="auto-status ${r.ok?'ok':'bad'}">${r.ok?'✓':'!'}</span><div><strong>${r.ok?'Successful':'Failed'}</strong><small>${new Date(r.timestamp).toLocaleString()} · ${esc(r.source||'api')} · ${Number(r.durationMs||0)}ms${r.error?' · '+esc(r.error):''}</small></div></div>`).join('');
    }catch(e){if(target)target.innerHTML='<div class="auto-empty">'+esc(e.message)+'</div>';}
  }

  async function loadCredentials(){
    if(!token())return [];
    try{const d=await api('/v1/credentials'),rows=d.credentials||[];
      for(const id of ['autoInputCredential','autoOutputCredential']){const s=$(id);if(!s)continue;const chosen=s.value;s.innerHTML='<option value="">No authentication</option>'+rows.map(c=>`<option value="${esc(c.id)}">${esc(c.name)} · ${esc(c.type)}</option>`).join('');s.value=chosen;}
      const list=$('credentialVaultList');if(list)list.innerHTML=rows.length?rows.map(c=>`<div class="automation-vault-row"><div><strong>${esc(c.name)}</strong><small>${esc(c.type)}${c.headerName?' · '+esc(c.headerName):''}</small></div><button class="btn secondary" data-delete-cred="${esc(c.id)}">Delete</button></div>`).join(''):'<p class="muted">No credentials saved yet.</p>';
      return rows;}catch(e){toast(e.message);return [];}
  }
  async function saveCredential(){const body={name:$('credName').value.trim(),type:$('credType').value,value:$('credValue').value,headerName:$('credHeader').value.trim()};if(!body.name||!body.value){toast('Enter a credential name and secret value.');return;}try{await api('/v1/credentials',{method:'POST',body:JSON.stringify(body)});$('credValue').value='';toast('Credential encrypted and saved.');await loadCredentials();}catch(e){toast(e.message);}}
  async function deleteCredential(id){if(!confirm('Delete this credential? Automations using it will fail until reconfigured.'))return;try{await api('/v1/credentials/'+encodeURIComponent(id),{method:'DELETE'});toast('Credential deleted.');await loadCredentials();}catch(e){toast(e.message);}}
  function openCredentialVault(){$('credentialVaultModal').hidden=false;loadCredentials();}
  function closeCredentialVault(){$('credentialVaultModal').hidden=true;}

  function healthRow(label,state,detail){
    const cls=state===true?'ok':state===false?'bad':'na',icon=state===true?'✓':state===false?'!':'–';
    return `<div class="health-row ${cls}"><span>${icon}</span><div><strong>${esc(label)}</strong><small>${esc(detail)}</small></div></div>`;
  }
  async function refreshHealth(){
    const box=$('launchHealth'),grid=$('launchHealthGrid');if(!box||!grid)return;
    if(!token()){box.hidden=true;return;}
    box.hidden=false;grid.innerHTML=healthRow('Checking…',null,'Contacting Recast services');
    try{
      const d=await api('/v1/workflows/health'),sv=d.services||{};
      const rows=[
        ['Hosted workflow storage',sv.workflow_storage,sv.workflow_storage?'Ready':'Storage binding unavailable'],
        ['Automation entitlement',sv.automation,sv.automation?'Scheduling enabled for this plan':'Upgrade to Automation for schedules'],
        ['Encrypted credential vault',sv.credential_vault,sv.credential_vault===null?'Not required for this plan':sv.credential_vault?'Encryption key configured':'Encryption key needs configuration'],
        ['Failure alert email',sv.failure_email,sv.failure_email===null?'Not required for this plan':sv.failure_email?'Email service configured':'Email service needs configuration'],
        ['Scheduler',true,'Hourly execution window']
      ];
      grid.innerHTML=rows.map(r=>healthRow(...r)).join('');
      const bad=rows.filter(r=>r[1]===false).length;
      $('launchHealthNote').textContent=bad?bad+' readiness check'+(bad===1?'':'s')+' need attention before full Automation launch.':'Core checks passed for this plan.';
    }catch(e){grid.innerHTML=healthRow('Diagnostics unavailable',false,e.message);}
  }

  async function refreshMetrics(){
    if(!token())return;
    try{
      const d=await api('/v1/workflows/usage');
      if($('metricActive'))$('metricActive').textContent=d.automation.active+'/'+d.automation.active_limit;
      if($('metricRuns'))$('metricRuns').textContent=d.automation.runs_used+'/'+d.automation.runs_limit;
      if($('metricApi'))$('metricApi').textContent=d.api.used+'/'+d.api.limit;
      let failures=0;
      for(const wf of (window.RecastWorkflowLibrary?.load()||[]).filter(x=>x.deploymentId)){
        try{const hd=await api('/v1/workflows/'+encodeURIComponent(wf.deploymentId)+'/history');failures+=(hd.runs||[]).filter(r=>!r.ok).length;}catch(_){}
      }
      if($('metricFailures'))$('metricFailures').textContent=String(failures);
    }catch(_){}
  }
  function render(){
    const wrap=$('automationWorkflowList'); if(!wrap||!window.RecastWorkflowLibrary)return;
    const items=window.RecastWorkflowLibrary.load();
    if(!items.length){wrap.innerHTML='<div class="auto-empty"><strong>No workflows yet.</strong><span>Create and save a Workflow Copilot pipeline to deploy it here.</span></div>';return;}
    wrap.innerHTML=items.map(w=>{
      const active=w.automation&&w.automation.enabled;
      const endpoint=w.deploymentId?'/v1/workflows/'+w.deploymentId+'/run':'Not deployed yet'; const scheduleLabel=active?(w.automation.cadence+(w.automation.cadence==='hourly'?'':' · '+String(w.automation.hour??8).padStart(2,'0')+':00 · '+(w.automation.timeZone||'UTC'))):'';
      return `<article class="auto-card"><div class="auto-card-top"><div><strong>${esc(w.name||'Untitled workflow')}</strong><span>${w.steps?.length||0} steps · ${w.deploymentId?'Hosted':'Local only'}${active?' · '+esc(scheduleLabel):''}</span></div><span class="auto-pill ${active?'active':''}">${active?'Automated':w.deploymentId?'API ready':'Local'}</span></div><code>${esc(endpoint)}</code><div class="auto-actions"><button class="icon-btn" data-auto-deploy="${esc(w.id)}">${w.deploymentId?'Deployed':'Deploy API'}</button><button class="icon-btn" data-auto-run="${esc(w.id)}">Run now</button><button class="icon-btn" data-auto-schedule="${esc(w.id)}">${active?'Reschedule':'Automate'}</button>${active?`<button class="icon-btn" data-auto-pause="${esc(w.id)}">Pause</button>`:''}<button class="icon-btn" data-auto-copy="${esc(w.id)}">Copy endpoint</button><button class="icon-btn" data-auto-history="${esc(w.id)}">History</button>${w.deploymentId?`<button class="icon-btn danger-soft" data-auto-delete-hosted="${esc(w.id)}">Remove hosted</button>`:''}</div></article>`;
    }).join('');
    const find=id=>window.RecastWorkflowLibrary.load().find(w=>w.id===id);
    wrap.querySelectorAll('[data-auto-deploy]').forEach(b=>b.onclick=()=>deploy(find(b.dataset.autoDeploy)));
    wrap.querySelectorAll('[data-auto-run]').forEach(b=>b.onclick=()=>run(find(b.dataset.autoRun)));
    wrap.querySelectorAll('[data-auto-schedule]').forEach(b=>b.onclick=()=>schedule(find(b.dataset.autoSchedule)));
    wrap.querySelectorAll('[data-auto-pause]').forEach(b=>b.onclick=()=>pause(find(b.dataset.autoPause)));
    wrap.querySelectorAll('[data-auto-copy]').forEach(b=>b.onclick=()=>copyEndpoint(find(b.dataset.autoCopy)));
    wrap.querySelectorAll('[data-auto-history]').forEach(b=>b.onclick=()=>history(find(b.dataset.autoHistory)));
    wrap.querySelectorAll('[data-auto-delete-hosted]').forEach(b=>b.onclick=()=>deleteHosted(find(b.dataset.autoDeleteHosted)));
  }
  function init(){render();refreshMetrics();syncHosted();refreshHealth();$('healthRefresh')?.addEventListener('click',refreshHealth);$('manageCredentialsBtn')?.addEventListener('click',openCredentialVault);$('credentialVaultClose')?.addEventListener('click',closeCredentialVault);$('credSave')?.addEventListener('click',saveCredential);$('credType')?.addEventListener('change',()=>{$('credHeaderWrap').style.display=$('credType').value==='api_key'?'grid':'none';});$('credentialVaultList')?.addEventListener('click',e=>{const b=e.target.closest('[data-delete-cred]');if(b)deleteCredential(b.dataset.deleteCred);});}
  window.RecastWorkflowAutomation={deploy,run,schedule,pause,history,render,syncHosted,deleteHosted,unsupportedSteps,refreshHealth};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
