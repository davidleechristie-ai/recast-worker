const API_BASE='https://api-v2.appdeploy.ai/app/heat-pump-second-opinion-v43csv';
const STRIPE_API='https://api.stripe.com/v1';
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store',...extra}});
const isQaRequest=(request,mode)=>{if(mode!=='production')return true;const ref=request.headers.get('referer')||'';const ua=request.headers.get('user-agent')||'';return /HeadlessChrome|Playwright/i.test(ua)||/[?&](upload_handoff_smoke|release_probe|qa|pdf_probe|site_consistency)=/i.test(ref)||/[?&](upload_handoff_smoke|release_probe|qa|pdf_probe|site_consistency)(?:&|$)/i.test(ref);};
const validCaseId=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{8,80}$/.test(v);
const safeEqual=(a,b)=>{if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0;};
const hex=bytes=>[...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');
const emptyTotals=()=>({landings:0,cta:0,uploads:0,genuine:0,multiQuoteAnalyses:0,decisionCases:0,installerQuestions:0,shareIntent:0,shareOpens:0,recipientStarts:0,outboundClicks:0,checkouts:0});
const cleanSource=v=>String(v||'direct').slice(0,40).replace(/[^A-Za-z0-9_.:-]/g,'_')||'direct';

export class HqcMetrics {
  constructor(ctx){this.ctx=ctx;}
  async snapshot(){
    let startedAt=await this.ctx.storage.get('meta:startedAt');
    if(!startedAt){startedAt=new Date().toISOString();await this.ctx.storage.put('meta:startedAt',startedAt);}
    let extendedStartedAt=await this.ctx.storage.get('meta:extendedStartedAt');
    if(!extendedStartedAt){extendedStartedAt=new Date().toISOString();await this.ctx.storage.put('meta:extendedStartedAt',extendedStartedAt);}
    const total={...emptyTotals(),...((await this.ctx.storage.get('total'))||{})};
    const listed=await this.ctx.storage.list({prefix:'source:'});
    const sources=[...listed.values()].map(r=>({...emptyTotals(),...r})).sort((a,b)=>b.genuine-a.genuine||b.landings-a.landings);
    return {measurementStartedAt:startedAt,extendedMeasurementStartedAt:extendedStartedAt,total,sources};
  }
  async record(payload){
    if(!payload||payload.isTest===true)return this.snapshot();
    const event=String(payload.event||'');
    const source=cleanSource(payload.source);
    const total={...emptyTotals(),...((await this.ctx.storage.get('total'))||{})};
    const key='source:'+source;
    const row={source,...emptyTotals(),...((await this.ctx.storage.get(key))||{})};
    let changed=false;
    const inc=name=>{total[name]=(total[name]||0)+1;row[name]=(row[name]||0)+1;changed=true;};
    if(event==='landing_view')inc('landings');
    else if(event==='checker_cta_clicked'){inc('cta');if(source==='shared_case')inc('recipientStarts');}
    else if(event==='upload_started')inc('uploads');
    else if(event==='share_intent')inc('shareIntent');
    else if(event==='partner_outbound_click')inc('outboundClicks');
    else if(event==='detail_checkout_created'||event==='decision_pack_checkout_created')inc('checkouts');
    else if(event==='analysis_qualified_real_quote'&&payload.analysisId){
      const value=String(payload.analysisId).slice(0,80);
      const id='analysis:'+value;
      if(!(await this.ctx.storage.get(id))){await this.ctx.storage.put(id,true);inc('genuine');}
      if(Number(payload.quoteCount)>=2){const multi='multi:'+value;if(!(await this.ctx.storage.get(multi))){await this.ctx.storage.put(multi,true);inc('multiQuoteAnalyses');}}
    } else if(event==='decision_case_generated'&&payload.analysisId){
      const id='decision:'+String(payload.analysisId).slice(0,80);
      if(!(await this.ctx.storage.get(id))){await this.ctx.storage.put(id,true);inc('decisionCases');}
    } else if(event==='installer_questions_copied'&&payload.analysisId){
      const id='questions:'+String(payload.analysisId).slice(0,80);
      if(!(await this.ctx.storage.get(id))){await this.ctx.storage.put(id,true);inc('installerQuestions');}
    } else if(event==='share_opened'&&payload.analysisId){
      const id='share:'+String(payload.analysisId).slice(0,80);
      if(!(await this.ctx.storage.get(id))){await this.ctx.storage.put(id,true);inc('shareOpens');}
    }
    if(changed)await this.ctx.storage.put({total,[key]:row});
    return this.snapshot();
  }
  async fetch(request){
    const u=new URL(request.url);
    if(request.method==='POST'&&u.pathname==='/event'){
      let payload={};try{payload=await request.json();}catch{return json({error:'invalid_json'},400);}
      return json(await this.record(payload));
    }
    if(request.method==='GET'&&u.pathname==='/snapshot')return json(await this.snapshot());
    return json({error:'not_found'},404);
  }
}

async function metricsSnapshot(env){
  const stub=env.HQC_METRICS.getByName('global');
  const r=await stub.fetch('https://hqc-metrics/snapshot');
  if(!r.ok)throw new Error('durable metrics unavailable');
  return r.json();
}
async function recordDurableMetric(env,payload){
  const stub=env.HQC_METRICS.getByName('global');
  const r=await stub.fetch('https://hqc-metrics/event',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
  if(!r.ok)throw new Error('durable metric write failed');
}
async function durableMetricsResponse(env){
  const s=await metricsSnapshot(env),t=s.total;
  return json({genuineAnalyses:t.genuine,shareOpens:t.shareOpens,outboundClicks:t.outboundClicks,measurementStartedAt:s.measurementStartedAt,extendedMeasurementStartedAt:s.extendedMeasurementStartedAt,durable:true,targets:{genuineAnalyses:100,shareOpens:20,outboundClicks:10},note:'Cumulative Cloudflare-side counters from measurementStartedAt; QA/demo/test events are excluded. Extended funnel counters begin at extendedMeasurementStartedAt.'});
}
async function durableGrowthResponse(env){
  const s=await metricsSnapshot(env),t=s.total;
  const sources=s.sources.map(r=>({...r,landingToCta:r.landings?Math.round(r.cta/r.landings*100):null,ctaToUpload:r.cta?Math.round(r.uploads/r.cta*100):null,landingToGenuine:r.landings?Math.round(r.genuine/r.landings*100):null}));
  const rates={landingToCta:t.landings?Math.round(t.cta/t.landings*100):null,ctaToUpload:t.cta?Math.round(t.uploads/t.cta*100):null,uploadToGenuine:t.uploads?Math.round(t.genuine/t.uploads*100):null,genuineToMultiQuote:t.genuine?Math.round(t.multiQuoteAnalyses/t.genuine*100):null,genuineToDecisionCase:t.genuine?Math.round(t.decisionCases/t.genuine*100):null,decisionCaseToShareIntent:t.decisionCases?Math.round(t.shareIntent/t.decisionCases*100):null,shareOpenToRecipientStart:t.shareOpens?Math.round(t.recipientStarts/t.shareOpens*100):null};
  const recommendations=[];
  if(t.landings>=15&&t.cta/Math.max(1,t.landings)<.3)recommendations.push('Landing-to-CTA is weak: improve message match, trust proof and CTA prominence before adding more traffic.');
  else if(t.cta>=5&&t.uploads/Math.max(1,t.cta)<.5)recommendations.push('CTA-to-upload is weak: reduce intake friction and clarify privacy/file requirements.');
  else if(t.uploads>=3&&t.genuine===0)recommendations.push('Quote submission is not reaching genuine analysis: diagnose the analysis handoff before adding acquisition.');
  if(t.genuine>=5&&t.multiQuoteAnalyses/t.genuine<.4)recommendations.push('Too few genuine users reach a second-quote comparison: strengthen multi-quote progression before expanding acquisition.');
  if(t.decisionCases>=5&&t.shareIntent/Math.max(1,t.decisionCases)<.2)recommendations.push('Decision Cases are not progressing into sharing: improve the privacy-safe installer-question/share handoff.');
  if(t.genuine>=5&&t.shareOpens/t.genuine<.2)recommendations.push('Share loop is below the 20% validation threshold: strengthen Decision Case sharing and recipient conversion.');
  if(t.shareOpens>=5&&t.recipientStarts/Math.max(1,t.shareOpens)<.2)recommendations.push('Shared-case recipients are not starting their own checks: improve the recipient checker handoff.');
  if(t.genuine>=10&&t.outboundClicks/t.genuine<.1)recommendations.push('Commercial/outbound intent is weak: improve the clearly separated installer-finding action without changing comparison results.');
  if(!sources.some(x=>x.source.startsWith('organic_')&&x.genuine>0)&&t.landings>=15)recommendations.push('No qualified organic cohort yet: improve existing high-intent decision pages and internal handoff before expanding acquisition.');
  return json({generatedAt:new Date().toISOString(),measurementStartedAt:s.measurementStartedAt,extendedMeasurementStartedAt:s.extendedMeasurementStartedAt,durable:true,total:t,rates,sources:sources.slice(0,20),recommendations,loop:['Acquire qualified homeowners','Measure source funnels','Diagnose the largest constraint','Deploy one justified improvement','Verify against genuine analyses, shares and anonymous outbound intent']});
}
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
  if(incoming.pathname==='/health')return json({ok:true,service,environment:mode,frontend:'cloudflare-assets',apiBase:API_BASE,payments:mode==='production'?'configured-at-runtime':'disabled',durableMetrics:Boolean(env.HQC_METRICS)});
  if(incoming.pathname==='/api/metrics'&&request.method==='GET'&&!incoming.searchParams.has('legacy'))return durableMetricsResponse(env);
  if(incoming.pathname==='/api/growth-report'&&request.method==='GET'&&!incoming.searchParams.has('legacy'))return durableGrowthResponse(env);
  if(incoming.pathname==='/api/decision-pack/checkout'&&request.method==='POST')return createDecisionPackCheckout(request,env,mode,incoming);
  if(incoming.pathname==='/api/decision-pack/status'&&request.method==='GET')return decisionPackStatus(request,env,mode,incoming);
  if(incoming.pathname==='/api/stripe/webhook'&&request.method==='POST')return stripeWebhook(request,env,mode);
  if(incoming.pathname.startsWith('/api/')){const target=API_BASE+incoming.pathname+incoming.search,headers=new Headers(request.headers);headers.delete('host');headers.delete('origin');let body,forcedTest=false,eventPayload=null;if(!['GET','HEAD'].includes(request.method)){if(incoming.pathname==='/api/event'&&request.method==='POST'){try{const payload=await request.clone().json();forcedTest=isQaRequest(request,mode);if(forcedTest)payload.isTest=true;eventPayload=payload;body=JSON.stringify(payload);headers.set('content-type','application/json');}catch{body=request.body;}}else body=request.body;}const init={method:request.method,headers,redirect:'manual'};if(body!==undefined)init.body=body;const response=await fetch(target,init),outHeaders=new Headers(response.headers);if(eventPayload&&response.ok&&!eventPayload.isTest){try{await recordDurableMetric(env,eventPayload);}catch(e){console.error('durable metrics write failed',e);outHeaders.set('x-hqc-metrics-write','failed');}}outHeaders.set('x-hqc-cloudflare-edge',mode);if(forcedTest)outHeaders.set('x-hqc-qa-event','excluded');outHeaders.set('cache-control','no-store');return new Response(response.body,{status:response.status,statusText:response.statusText,headers:outHeaders});}
  const response=await env.ASSETS.fetch(request),headers=new Headers(response.headers);headers.set('x-hqc-cloudflare-edge',mode);if(incoming.pathname==='/'||incoming.pathname.endsWith('.html'))headers.set('cache-control','no-store');return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}};
