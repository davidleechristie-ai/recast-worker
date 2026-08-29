/* Recast launch workflow templates — local-first onboarding. */
(function(){
'use strict';
const $=id=>document.getElementById(id), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TEMPLATES=[
 {sample:'[{"id":101,"name":"Ada","plan":"pro"},{"id":102,"name":"Grace","plan":"automation"}]',id:'api-json-csv',icon:'↔',title:'API → CSV export',tag:'Popular',desc:'Fetch JSON, flatten nested records and produce CSV for reporting or import.',input:'HTTP API',output:'CSV',steps:[{mode:'flatten',params:{}},{mode:'json2csv',params:{}}]},
 {sample:'[{"internal_id":"crm_82x","customer_name":"Acme Labs","status":"active"}]',id:'api-clean-webhook',icon:'→',title:'Clean API data → webhook',tag:'Automation',desc:'Remove internal fields, rename a field and forward clean JSON to another system.',input:'HTTP API',output:'Webhook',steps:[{mode:'transformRemove',params:{paths:['internal_id']}},{mode:'transformRename',params:{from:'customer_name',to:'name'}}]},
 {sample:'{"data":[{"sku":"RC-101","qty":4},{"sku":"RC-205","qty":9}]}',id:'jsonpath-csv',icon:'⌁',title:'Extract JSONPath → CSV',tag:'Developer',desc:'Extract the records you need from a large API response, flatten them and export CSV.',input:'JSON/API',output:'CSV',steps:[{mode:'jsonPath',params:{path:'$.data[*]'}},{mode:'flatten',params:{}},{mode:'json2csv',params:{}}]},
 {sample:'{"event":"order.created","id":"ord_2048","status":"paid"}',id:'validate-forward',icon:'✓',title:'Validate → forward',tag:'Quality',desc:'Validate incoming JSON before it is forwarded to a downstream webhook.',input:'JSON/API',output:'Webhook',steps:[{mode:'validateJsonStep',params:{}}]},
 {sample:'id,name,email,internal\n1,Ada,ada@example.test,x\n2,Grace,grace@example.test,y',id:'csv-api-json',icon:'⇄',title:'CSV → clean JSON',tag:'Migration',desc:'Convert CSV into JSON, select the required fields and prepare it for another API.',input:'CSV',output:'JSON/API',steps:[{mode:'csv2json',params:{}},{mode:'transformSelect',params:{paths:['id','name','email']}}]},
 {sample:'[{"id":1,"account":{"name":"Acme","tier":"pro"},"status":"active"}]',id:'authenticated-sync',icon:'🔐',title:'Authenticated API sync',tag:'Automation',desc:'Start an authenticated API-to-webhook workflow using Recast’s encrypted credential vault.',input:'Authenticated API',output:'Authenticated webhook',steps:[{mode:'flatten',params:{}}]}
];
function definition(t){return {schemaVersion:3,name:t.title,steps:JSON.parse(JSON.stringify(t.steps)),templateId:t.id,createdFromTemplate:true};}
function use(t,save){
 window.RecastFunnel?.track('workflow_template_selected',{template_id:t.id,action:save?'save':'customise'});
 const d=definition(t);
 if(save&&window.RecastWorkflowLibrary){window.RecastWorkflowLibrary.save(d);window.showToastSafe?.('Template saved to Workflow Library');document.getElementById('workflowLibrary')?.scrollIntoView({behavior:'smooth'});return;}
 if(window.RecastRecipeBuilder2){if(t.sample&&$('input')){$('input').value=t.sample;$('input').dispatchEvent(new Event('input',{bubbles:true}));}window.RecastRecipeBuilder2.openWithDefinition(d);window.RecastFunnel?.track('template_sample_loaded',{template_id:t.id});document.getElementById('recipeBuilder2Panel')?.scrollIntoView({behavior:'smooth',block:'start'});}
}
function render(){
 const wrap=$('workflowTemplateGrid');if(!wrap)return;
 wrap.innerHTML=TEMPLATES.map(t=>`<article class="template-card"><div class="template-top"><span class="template-icon">${t.icon}</span><span class="template-tag">${esc(t.tag)}</span></div><h4>${esc(t.title)}</h4><p>${esc(t.desc)}</p><div class="template-flow"><span>${esc(t.input)}</span><b>→</b><span>${t.steps.length} step${t.steps.length===1?'':'s'}</span><b>→</b><span>${esc(t.output)}</span></div><div class="template-actions"><button class="btn secondary" data-template-open="${t.id}">Try example</button><button class="btn primary" data-template-save="${t.id}">Save workflow</button></div></article>`).join('');
 wrap.querySelectorAll('[data-template-open]').forEach(b=>b.onclick=()=>use(TEMPLATES.find(t=>t.id===b.dataset.templateOpen),false));
 wrap.querySelectorAll('[data-template-save]').forEach(b=>b.onclick=()=>use(TEMPLATES.find(t=>t.id===b.dataset.templateSave),true));
}
window.RecastWorkflowTemplates={templates:TEMPLATES,definition,use,render};
function init(){render();try{const id=new URLSearchParams(location.search).get('template');const item=TEMPLATES.find(t=>t.id===id);if(item){window.RecastFunnel?.track('use_case_landed',{template_id:id});setTimeout(()=>{document.getElementById('workflowTemplates')?.scrollIntoView({behavior:'smooth'});const card=document.querySelector('[data-template-save="'+id+'"]')?.closest('.template-card');card?.classList.add('template-highlight');},120);}}catch(_){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();