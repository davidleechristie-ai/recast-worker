import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const SCOREBOARD = new URL('../GROWTH_SCOREBOARD.json', import.meta.url);
const today = new Date().toISOString().slice(0, 10);
const warnings = [];

const b64url = (v) => Buffer.from(v).toString('base64url');
const safeRatio = (numerator, denominator) => Number(denominator) > 0 ? Number(numerator || 0) / Number(denominator) : null;

async function googleAccessToken() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  const sa = JSON.parse(raw);
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly', aud: sa.token_uri || 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const unsigned = `${header}.${payload}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(unsigned), sa.private_key).toString('base64url');
  const res = await fetch(sa.token_uri || 'https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth2:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }) });
  if (!res.ok) throw new Error(`Google OAuth failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

function dateDaysAgo(days) { const d = new Date(); d.setUTCDate(d.getUTCDate() - days); return d.toISOString().slice(0, 10); }
function gscRow(row, dimensions) { const result = { clicks: row.clicks ?? 0, impressions: row.impressions ?? 0, ctr: row.ctr ?? 0, average_position: row.position ?? null }; for (let i=0;i<dimensions.length;i+=1) result[dimensions[i]]=row.keys?.[i]??null; return result; }
async function gscQuery(token, site, dimensions, rowLimit) { const res=await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`,{method:'POST',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify({startDate:dateDaysAgo(28),endDate:dateDaysAgo(1),dimensions,rowLimit})}); if(!res.ok) throw new Error(`Search Console ${dimensions.join('+')||'aggregate'} query failed: ${res.status} ${await res.text()}`); return (await res.json()).rows||[]; }
async function fetchGsc(token) { const site=process.env.GSC_SITE_URL||'sc-domain:tryrecast.app'; if(!token)return null; const [a,p,q,pq]=await Promise.all([gscQuery(token,site,[],1),gscQuery(token,site,['page'],50),gscQuery(token,site,['query'],100),gscQuery(token,site,['page','query'],250)]); const row=a[0]||{}; return {period_days:28,clicks:row.clicks??0,impressions:row.impressions??0,ctr:row.ctr??0,average_position:row.position??null,top_pages:p.map(r=>gscRow(r,['page'])),top_queries:q.map(r=>gscRow(r,['query'])),top_page_queries:pq.map(r=>gscRow(r,['page','query'])),evidence_date:today}; }

function parseEventRows(rows) {
  const counts = {};
  const users = {};
  for (const row of rows || []) {
    const name = row.dimensionValues?.[0]?.value;
    if (!name) continue;
    counts[name] = Number(row.metricValues?.[0]?.value || 0);
    users[name] = Number(row.metricValues?.[1]?.value || 0);
  }
  return { counts, users };
}

async function fetchGa4(token) {
  const property=process.env.GA4_PROPERTY_ID; if(!token||!property)return null;
  const endpoint=`https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(property)}:runReport`;
  const h={authorization:`Bearer ${token}`,'content-type':'application/json'};
  const organicFilter={filter:{fieldName:'sessionDefaultChannelGroup',stringFilter:{matchType:'EXACT',value:'Organic Search'}}};
  const eventNames=['tool_run_attempt','successful_tool_use','workflow_start','workflow_complete','upgrade_click','commercial_intent'];
  const eventNameFilter={filter:{fieldName:'eventName',inListFilter:{values:eventNames}}};
  const eventBody={dateRanges:[{startDate:'28daysAgo',endDate:'yesterday'}],dimensions:[{name:'eventName'}],metrics:[{name:'eventCount'},{name:'activeUsers'}],dimensionFilter:eventNameFilter};
  const eventRes=await fetch(endpoint,{method:'POST',headers:h,body:JSON.stringify(eventBody)});
  if(!eventRes.ok)throw new Error(`GA4 event report failed: ${eventRes.status} ${await eventRes.text()}`);
  const allEvents=parseEventRows((await eventRes.json()).rows||[]);

  const organicEventRes=await fetch(endpoint,{method:'POST',headers:h,body:JSON.stringify({...eventBody,dimensionFilter:{andGroup:{expressions:[organicFilter,eventNameFilter]}}})});
  if(!organicEventRes.ok)throw new Error(`GA4 organic event report failed: ${organicEventRes.status} ${await organicEventRes.text()}`);
  const organicEvents=parseEventRows((await organicEventRes.json()).rows||[]);

  const organicRes=await fetch(endpoint,{method:'POST',headers:h,body:JSON.stringify({dateRanges:[{startDate:'28daysAgo',endDate:'yesterday'}],metrics:[{name:'sessions'},{name:'activeUsers'},{name:'newUsers'}],dimensionFilter:organicFilter})});
  if(!organicRes.ok)throw new Error(`GA4 organic report failed: ${organicRes.status} ${await organicRes.text()}`);
  const organicRow=(await organicRes.json()).rows?.[0];
  const organicActiveUsers=Number(organicRow?.metricValues?.[1]?.value||0);

  const returningRes=await fetch(endpoint,{method:'POST',headers:h,body:JSON.stringify({dateRanges:[{startDate:'28daysAgo',endDate:'yesterday'}],dimensions:[{name:'newVsReturning'}],metrics:[{name:'activeUsers'}],dimensionFilter:organicFilter})});
  if(!returningRes.ok)throw new Error(`GA4 returning-user report failed: ${returningRes.status} ${await returningRes.text()}`);
  const returningUsers=((await returningRes.json()).rows||[]).filter(r=>r.dimensionValues?.[0]?.value==='returning').reduce((s,r)=>s+Number(r.metricValues?.[0]?.value||0),0);

  const attempts=allEvents.counts.tool_run_attempt??0;
  const successes=allEvents.counts.successful_tool_use??0;
  const workflowStarts=allEvents.counts.workflow_start??0;
  const workflowCompletions=allEvents.counts.workflow_complete??0;
  const activatedOrganicUsers=organicEvents.users.successful_tool_use??0;
  const workflowOrganicUsers=organicEvents.users.workflow_start??0;
  const commercialOrganicUsers=organicEvents.users.commercial_intent??0;

  return {
    period_days:28,
    organic_sessions:Number(organicRow?.metricValues?.[0]?.value||0),
    organic_active_users:organicActiveUsers,
    organic_new_users:Number(organicRow?.metricValues?.[2]?.value||0),
    organic_returning_users:returningUsers,
    event_counts:allEvents.counts,
    event_active_users:allEvents.users,
    organic_event_counts:organicEvents.counts,
    organic_event_active_users:organicEvents.users,
    tool_run_attempts:attempts,
    successful_tool_uses:successes,
    workflow_starts:workflowStarts,
    workflow_completions:workflowCompletions,
    upgrade_clicks:allEvents.counts.upgrade_click??0,
    commercial_intent_events:allEvents.counts.commercial_intent??0,
    rates:{
      successful_task_rate:safeRatio(successes,attempts),
      workflow_completion_rate:safeRatio(workflowCompletions,workflowStarts),
      activation_rate:safeRatio(activatedOrganicUsers,organicActiveUsers),
      deeper_product_usage_rate:safeRatio(workflowOrganicUsers,activatedOrganicUsers),
      commercial_intent_rate:safeRatio(commercialOrganicUsers,activatedOrganicUsers),
      returning_user_rate:safeRatio(returningUsers,organicActiveUsers)
    },
    rate_definitions:{
      successful_task_rate:'successful_tool_use events / tool_run_attempt events',
      workflow_completion_rate:'workflow_complete events / workflow_start events',
      activation_rate:'organic users with successful_tool_use / organic active users',
      deeper_product_usage_rate:'organic users with workflow_start / organic users with successful_tool_use',
      commercial_intent_rate:'organic users with commercial_intent / organic users with successful_tool_use',
      returning_user_rate:'organic returning active users / organic active users'
    },
    evidence_date:today
  };
}

function monthlyEquivalent(item) { const price=item.price||{}; const amount=Number(price.unit_amount||0)/100; const interval=price.recurring?.interval; const count=Number(price.recurring?.interval_count||1); if(interval==='year')return amount/(12*count); if(interval==='month')return amount/count; if(interval==='week')return amount*(52/12)/count; if(interval==='day')return amount*(365/12)/count; return 0; }
async function stripeGet(path,key){const res=await fetch(`https://api.stripe.com${path}`,{headers:{authorization:`Bearer ${key}`}});if(!res.ok)throw new Error(`Stripe query failed: ${res.status} ${await res.text()}`);return res.json();}

async function fetchStripe() {
  const key=process.env.STRIPE_SECRET_KEY; if(!key)return null;
  let startingAfter=null,mrr=0; const planCounts={}; const genuineCustomers=new Set(); const excluded=[]; const priceMap=JSON.parse(process.env.PRICE_MAP||'{}');
  do {
    const params=new URLSearchParams({status:'all',limit:'100'}); if(startingAfter)params.set('starting_after',startingAfter);
    const data=await stripeGet(`/v1/subscriptions?${params}`,key);
    for(const sub of data.data||[]){
      if(!['active','trialing'].includes(sub.status)){excluded.push({subscription:sub.id,reason:`status_${sub.status}`});continue;}
      if(!sub.latest_invoice){excluded.push({subscription:sub.id,reason:'no_latest_invoice'});continue;}
      const invoice=await stripeGet(`/v1/invoices/${encodeURIComponent(sub.latest_invoice)}?expand[]=charge`,key);
      if(invoice.status!=='paid'||Number(invoice.amount_paid||0)<=0){excluded.push({subscription:sub.id,reason:'invoice_not_paid'});continue;}
      let charge=invoice.charge;
      if(typeof charge==='string')charge=await stripeGet(`/v1/charges/${encodeURIComponent(charge)}`,key);
      if(!charge||charge.paid!==true||charge.status!=='succeeded'){excluded.push({subscription:sub.id,reason:'charge_not_succeeded'});continue;}
      const paid=Number(charge.amount||0); const refunded=Number(charge.amount_refunded||0);
      if(charge.refunded===true||refunded>=paid){excluded.push({subscription:sub.id,reason:'fully_refunded'});continue;}
      genuineCustomers.add(sub.customer);
      for(const item of sub.items?.data||[]){const qty=Number(item.quantity||1);mrr+=monthlyEquivalent(item)*qty;const label=priceMap[item.price?.id]||item.price?.id||'unknown';planCounts[label]=(planCounts[label]||0)+qty;}
    }
    startingAfter=data.has_more&&data.data?.length?data.data[data.data.length-1].id:null;
  }while(startingAfter);
  return {active_subscription_customers:genuineCustomers.size,mrr_gbp:Math.round(mrr*100)/100,plan_counts:planCounts,excluded_non_genuine_subscriptions:excluded.length,measurement_rule:'Counts only active/trialing subscriptions backed by a paid, succeeded latest invoice charge that has not been fully refunded.',evidence_date:today};
}

const board=JSON.parse(await fs.readFile(SCOREBOARD,'utf8'));
let googleToken=null;
try{googleToken=await googleAccessToken();}catch(e){warnings.push(e.message);}
let gsc=null,ga4=null,stripe=null;
try{gsc=await fetchGsc(googleToken);}catch(e){warnings.push(e.message);}
try{ga4=await fetchGa4(googleToken);}catch(e){warnings.push(e.message);}
try{stripe=await fetchStripe();}catch(e){warnings.push(e.message);}

board.sources=board.sources||{};
board.sources.search_console=gsc||{status:'unavailable',evidence_date:today};
board.sources.ga4=ga4||{status:'unavailable',evidence_date:today};
board.sources.stripe=stripe||{status:'unavailable',evidence_date:today};
board.funnel=board.funnel||{};
board.rates=board.rates||{};

if(gsc){
  board.funnel.search_impressions=gsc.impressions;
  board.funnel.organic_clicks=gsc.clicks;
  board.funnel.organic_ctr=gsc.ctr;
}
if(ga4){
  board.funnel.tool_run_attempts=ga4.tool_run_attempts;
  board.funnel.successful_tool_uses=ga4.successful_tool_uses;
  board.funnel.workflow_starts=ga4.workflow_starts;
  board.funnel.workflow_completions=ga4.workflow_completions;
  board.funnel.upgrade_visits=ga4.upgrade_clicks;
  board.funnel.commercial_intent_events=ga4.commercial_intent_events;
  board.funnel.returning_users=ga4.organic_returning_users;
  board.rates={...board.rates,...ga4.rates};
}
if(stripe){
  board.objective.current=stripe.mrr_gbp;
  board.objective.evidence_date=stripe.evidence_date;
  board.funnel.pro_customers=(stripe.plan_counts.pro_monthly||0)+(stripe.plan_counts.pro_yearly||0);
  board.funnel.api_automation_customers=(stripe.plan_counts.api_monthly||0)+(stripe.plan_counts.api_yearly||0)+(stripe.plan_counts.automation_monthly||0)+(stripe.plan_counts.automation_yearly||0);
  board.objective.revenue_definition='Genuine recurring revenue only: current subscription plus paid succeeded latest invoice charge, excluding fully refunded and inactive/cancelled subscriptions.';
}

board.measurement_rules=board.measurement_rules||{};
board.measurement_rules.rate_definitions=ga4?.rate_definitions||board.measurement_rules.rate_definitions||{};
board.measurement_rules.zero_denominator='A rate remains null when its denominator is zero; zero is never substituted for an unavailable rate.';
board.missing_instrumentation=[];
if(!gsc)board.missing_instrumentation.push('Google Search Console feed unavailable.');
if(!ga4)board.missing_instrumentation.push('GA4 feed unavailable.');
if(!stripe)board.missing_instrumentation.push('Stripe feed unavailable.');
if(gsc&&gsc.top_page_queries.length===0)board.missing_instrumentation.push('Search Console returned no page/query rows for the current 28-day period.');
if(board.funnel.indexed_target_pages==null)board.missing_instrumentation.push('Indexed target-page count or URL Inspection/index coverage evidence is unavailable.');
if(ga4&&ga4.tool_run_attempts===0)board.missing_instrumentation.push('Successful-task rate awaits post-instrumentation tool_run_attempt traffic.');
if(ga4&&ga4.workflow_starts===0)board.missing_instrumentation.push('Workflow completion rate awaits a workflow_start denominator.');
if(ga4&&(ga4.organic_event_active_users.successful_tool_use??0)===0)board.missing_instrumentation.push('Activation/deeper-product/commercial-intent user rates await post-instrumentation activated organic users.');
board.last_updated=today;
board.refresh_warnings=warnings;

await fs.writeFile(SCOREBOARD,JSON.stringify(board,null,2)+'\n');
console.log(JSON.stringify({refreshed:{gsc:!!gsc,ga4:!!ga4,stripe:!!stripe},rates:ga4?.rates||null,warnings},null,2));
