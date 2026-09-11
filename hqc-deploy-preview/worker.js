const API_BASE='https://api-v2.appdeploy.ai/app/heat-pump-second-opinion-v43csv';
const STRIPE_API='https://api.stripe.com/v1';
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store',...extra}});
const isQaRequest=(request,mode)=>{if(mode!=='production')return true;const ref=request.headers.get('referer')||'';const ua=request.headers.get('user-agent')||'';return /HeadlessChrome|Playwright/i.test(ua)||/[?&](upload_handoff_smoke|release_probe|qa|pdf_probe|site_consistency)=/i.test(ref)||/[?&](upload_handoff_smoke|release_probe|qa|pdf_probe|site_consistency)(?:&|$)/i.test(ref);};
const validCaseId=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{8,80}$/.test(v);
const safeEqual=(a,b)=>{if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0;};
const hex=bytes=>[...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');
async function verifyStripeSignature(raw,header,secret){
  if(!header||!secret)return false;
  const parts=header.split(',').map(x=>x.trim());
  const ts=parts.find(x=>x.startsWith('t='))?.slice(2)||'';
  const sigs=parts.filter(x=>x.startsWith('v1=')).map(x=>x.slice(3));
  if(!/^\d+$/.test(ts)||!sigs.length)return false;
  if(Math.abs(Math.floor(Date.now()/1000)-Number(ts))>300)return false;
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const digest=hex(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${ts}.${raw}`)));
  return sigs.some(sig=>safeEqual(digest,sig));
}
async function createDecisionPackCheckout(request,env,mode,incoming){
  if(mode!=='production')return json({error:'payments_disabled_outside_production',test:true},409);
  if(!env.STRIPE_SECRET_KEY||!env.STRIPE_DECISION_PACK_PRICE_ID)return json({error:'payment_configuration_missing'},503);
  let payload={};try{payload=await request.json();}catch{return json({error:'invalid_json'},400);}
  const caseId=payload.caseId;if(!validCaseId(caseId))return json({error:'invalid_case_reference'},400);if(isQaRequest(request,mode))return json({error:'qa_checkout_blocked'},409);
  const form=new URLSearchParams();form.set('mode','payment');form.set('line_items[0][price]',env.STRIPE_DECISION_PACK_PRICE_ID);form.set('line_items[0][quantity]','1');form.set('success_url',`${incoming.origin}/?decision_pack=success&session_id={CHECKOUT_SESSION_ID}`);form.set('cancel_url',`${incoming.origin}/?decision_pack=cancelled`);form.set('client_reference_id',caseId);form.set('metadata[case_id]',caseId);form.set('metadata[product]','decision_pack');form.set('payment_intent_data[metadata][case_id]',caseId);form.set('payment_intent_data[metadata][product]','decision_pack');
  const response=await fetch(`${STRIPE_API}/checkout/sessions`,{method:'POST',headers:{authorization:`Bearer ${env.STRIPE_SECRET_KEY}`,'content-type':'application/x-www-form-urlencoded','idempotency-key':`hqc-decision-pack-${caseId}`},body:form.toString()});const data=await response.json();if(!response.ok||!data.url)return json({error:'stripe_checkout_failed'},502);return json({url:data.url,sessionId:data.id});
}
async function decisionPackStatus(request,env,mode,incoming){
  if(mode!=='production')return json({paid:false,test:true},200);if(!env.STRIPE_SECRET_KEY)return json({error:'payment_configuration_missing'},503);
  const sessionId=incoming.searchParams.get('session_id')||'',caseId=incoming.searchParams.get('case_id')||'';if(!/^cs_[A-Za-z0-9_]+$/.test(sessionId)||!validCaseId(caseId))return json({error:'invalid_reference'},400);
  const response=await fetch(`${STRIPE_API}/checkout/sessions/${encodeURIComponent(sessionId)}`,{headers:{authorization:`Bearer ${env.STRIPE_SECRET_KEY}`}});const data=await response.json();if(!response.ok)return json({error:'stripe_status_failed'},502);
  const matches=data.client_reference_id===caseId&&data.metadata?.case_id===caseId&&data.metadata?.product==='decision_pack';const paid=matches&&data.payment_status==='paid'&&data.status==='complete';return json({paid,amount_total:paid?data.amount_total:null,currency:paid?data.currency:null});
}
async function stripeWebhook(request,env,mode){
  if(mode!=='production')return json({received:true,test:true});if(!env.STRIPE_WEBHOOK_SECRET)return json({error:'webhook_configuration_missing'},503);
  const raw=await request.text();if(!(await verifyStripeSignature(raw,request.headers.get('stripe-signature'),env.STRIPE_WEBHOOK_SECRET)))return json({error:'invalid_signature'},400);
  let event;try{event=JSON.parse(raw);}catch{return json({error:'invalid_payload'},400);}
  if(!['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed'].includes(event.type))return json({received:true,ignored:true});
  const session=event.data?.object||{},caseId=session.client_reference_id||session.metadata?.case_id||'';const matches=validCaseId(caseId)&&session.metadata?.case_id===caseId&&session.metadata?.product==='decision_pack';
  if(!matches)return json({received:true,ignored:true});
  if(event.type!=='checkout.session.async_payment_failed'&&session.payment_status!=='paid')return json({received:true,pending:true});
  try{await fetch(`${API_BASE}/api/event`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event:event.type==='checkout.session.async_payment_failed'?'decision_pack_payment_failed':'decision_pack_payment_confirmed',caseId,amount_pence:session.amount_total||1900,currency:session.currency||'gbp',stripeSessionId:session.id,isTest:false})});}catch{}
  return json({received:true});
}
export default {async fetch(request,env){
  const incoming=new URL(request.url),mode=env.HQC_ENV||'preview',service=mode==='production'?'home-quote-check':'hqc-migration-preview';
  if(incoming.pathname==='/health')return json({ok:true,service,environment:mode,frontend:'cloudflare-assets',apiBase:API_BASE,payments:mode==='production'?'configured-at-runtime':'disabled'});
  if(incoming.pathname==='/api/decision-pack/checkout'&&request.method==='POST')return createDecisionPackCheckout(request,env,mode,incoming);
  if(incoming.pathname==='/api/decision-pack/status'&&request.method==='GET')return decisionPackStatus(request,env,mode,incoming);
  if(incoming.pathname==='/api/stripe/webhook'&&request.method==='POST')return stripeWebhook(request,env,mode);
  if(incoming.pathname.startsWith('/api/')){const target=API_BASE+incoming.pathname+incoming.search,headers=new Headers(request.headers);headers.delete('host');headers.delete('origin');let body,forcedTest=false;if(!['GET','HEAD'].includes(request.method)){if(incoming.pathname==='/api/event'&&request.method==='POST'){try{const payload=await request.clone().json();forcedTest=isQaRequest(request,mode);if(forcedTest)payload.isTest=true;body=JSON.stringify(payload);headers.set('content-type','application/json');}catch{body=request.body;}}else body=request.body;}const init={method:request.method,headers,redirect:'manual'};if(body!==undefined)init.body=body;const response=await fetch(target,init),outHeaders=new Headers(response.headers);outHeaders.set('x-hqc-cloudflare-edge',mode);if(forcedTest)outHeaders.set('x-hqc-qa-event','excluded');outHeaders.set('cache-control','no-store');return new Response(response.body,{status:response.status,statusText:response.statusText,headers:outHeaders});}
  const response=await env.ASSETS.fetch(request),headers=new Headers(response.headers);headers.set('x-hqc-cloudflare-edge',mode);if(incoming.pathname==='/'||incoming.pathname.endsWith('.html'))headers.set('cache-control','no-store');return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}};
