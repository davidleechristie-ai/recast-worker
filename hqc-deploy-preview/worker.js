const API_BASE='https://api-v2.appdeploy.ai/app/heat-pump-second-opinion-v43csv';
const STRIPE_API='https://api.stripe.com/v1';
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store',...extra}});
const isQaRequest=(request,mode)=>{
  if(mode!=='production')return true;
  const ref=request.headers.get('referer')||'';
  return /[?&](upload_handoff_smoke|release_probe|qa)=/i.test(ref)||/[?&](upload_handoff_smoke|release_probe|qa)(?:&|$)/i.test(ref);
};
const validCaseId=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{8,80}$/.test(v);
async function createDecisionPackCheckout(request,env,mode,incoming){
  if(mode!=='production')return json({error:'payments_disabled_outside_production',test:true},409);
  if(!env.STRIPE_SECRET_KEY||!env.STRIPE_DECISION_PACK_PRICE_ID)return json({error:'payment_configuration_missing'},503);
  let payload={};try{payload=await request.json();}catch{return json({error:'invalid_json'},400);}
  const caseId=payload.caseId;
  if(!validCaseId(caseId))return json({error:'invalid_case_reference'},400);
  if(isQaRequest(request,mode))return json({error:'qa_checkout_blocked'},409);
  const success=`${incoming.origin}/?decision_pack=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancel=`${incoming.origin}/?decision_pack=cancelled`;
  const form=new URLSearchParams();
  form.set('mode','payment');
  form.set('line_items[0][price]',env.STRIPE_DECISION_PACK_PRICE_ID);
  form.set('line_items[0][quantity]','1');
  form.set('success_url',success);
  form.set('cancel_url',cancel);
  form.set('client_reference_id',caseId);
  form.set('metadata[case_id]',caseId);
  form.set('metadata[product]','decision_pack');
  form.set('payment_intent_data[metadata][case_id]',caseId);
  form.set('payment_intent_data[metadata][product]','decision_pack');
  const response=await fetch(`${STRIPE_API}/checkout/sessions`,{method:'POST',headers:{authorization:`Bearer ${env.STRIPE_SECRET_KEY}`,'content-type':'application/x-www-form-urlencoded'},body:form.toString()});
  const data=await response.json();
  if(!response.ok||!data.url)return json({error:'stripe_checkout_failed'},502);
  return json({url:data.url,sessionId:data.id});
}
async function decisionPackStatus(request,env,mode,incoming){
  if(mode!=='production')return json({paid:false,test:true},200);
  if(!env.STRIPE_SECRET_KEY)return json({error:'payment_configuration_missing'},503);
  const sessionId=incoming.searchParams.get('session_id')||'';
  const caseId=incoming.searchParams.get('case_id')||'';
  if(!/^cs_[A-Za-z0-9_]+$/.test(sessionId)||!validCaseId(caseId))return json({error:'invalid_reference'},400);
  const response=await fetch(`${STRIPE_API}/checkout/sessions/${encodeURIComponent(sessionId)}`,{headers:{authorization:`Bearer ${env.STRIPE_SECRET_KEY}`}});
  const data=await response.json();
  if(!response.ok)return json({error:'stripe_status_failed'},502);
  const matches=data.client_reference_id===caseId&&data.metadata?.case_id===caseId&&data.metadata?.product==='decision_pack';
  const paid=matches&&data.payment_status==='paid'&&data.status==='complete';
  return json({paid,amount_total:paid?data.amount_total:null,currency:paid?data.currency:null});
}
export default {
  async fetch(request,env) {
    const incoming=new URL(request.url);
    const mode=env.HQC_ENV||'preview';
    const service=mode==='production'?'home-quote-check':'hqc-migration-preview';
    if(incoming.pathname==='/health') return json({ok:true,service,environment:mode,frontend:'cloudflare-assets',apiBase:API_BASE,payments:mode==='production'?'configured-at-runtime':'disabled'});
    if(incoming.pathname==='/api/decision-pack/checkout'&&request.method==='POST')return createDecisionPackCheckout(request,env,mode,incoming);
    if(incoming.pathname==='/api/decision-pack/status'&&request.method==='GET')return decisionPackStatus(request,env,mode,incoming);
    if(incoming.pathname.startsWith('/api/')){
      const target=API_BASE+incoming.pathname+incoming.search;
      const headers=new Headers(request.headers);
      headers.delete('host');
      headers.delete('origin');
      let body;
      let forcedTest=false;
      if(!['GET','HEAD'].includes(request.method)){
        if(incoming.pathname==='/api/event'&&request.method==='POST'){
          try{
            const payload=await request.clone().json();
            forcedTest=isQaRequest(request,mode);
            if(forcedTest)payload.isTest=true;
            body=JSON.stringify(payload);
            headers.set('content-type','application/json');
          }catch{body=request.body;}
        }else body=request.body;
      }
      const init={method:request.method,headers,redirect:'manual'};
      if(body!==undefined)init.body=body;
      const response=await fetch(target,init);
      const outHeaders=new Headers(response.headers);
      outHeaders.set('x-hqc-cloudflare-edge',mode);
      if(forcedTest)outHeaders.set('x-hqc-qa-event','excluded');
      outHeaders.set('cache-control','no-store');
      return new Response(response.body,{status:response.status,statusText:response.statusText,headers:outHeaders});
    }
    const response=await env.ASSETS.fetch(request);
    const headers=new Headers(response.headers);
    headers.set('x-hqc-cloudflare-edge',mode);
    if(incoming.pathname==='/'||incoming.pathname.endsWith('.html'))headers.set('cache-control','no-store');
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  }
};
