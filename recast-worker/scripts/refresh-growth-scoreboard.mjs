import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const SCOREBOARD = new URL('../GROWTH_SCOREBOARD.json', import.meta.url);
const today = new Date().toISOString().slice(0, 10);
const warnings = [];

const b64url = (v) => Buffer.from(v).toString('base64url');

async function googleAccessToken() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  const sa = JSON.parse(raw);
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly', aud: sa.token_uri || 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const unsigned = `${header}.${payload}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(unsigned), sa.private_key).toString('base64url');
  const res = await fetch(sa.token_uri || 'https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }) });
  if (!res.ok) throw new Error(`Google OAuth failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

function dateDaysAgo(days) { const d = new Date(); d.setUTCDate(d.getUTCDate() - days); return d.toISOString().slice(0, 10); }
function gscRow(row, dimensions) { const result = { clicks: row.clicks ?? 0, impressions: row.impressions ?? 0, ctr: row.ctr ?? 0, average_position: row.position ?? null }; for (let i=0;i<dimensions.length;i+=1) result[dimensions[i]]=row.keys?.[i]??null; return result; }
async function gscQuery(token, site, dimensions, rowLimit) { const res=await fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`,{method:'POST',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify({startDate:dateDaysAgo(28),endDate:dateDaysAgo(1),dimensions,rowLimit})}); if(!res.ok) throw new Error(`Search Console ${dimensions.join('+')||'aggregate'} query failed: ${res.status} ${await res.text()}`); return (await res.json()).rows||[]; }
async function fetchGsc(token) { const site=process.env.GSC_SITE_URL||'sc-domain:tryrecast.app'; if(!token)return null; const [a,p,q,pq]=await Promise.all([gscQuery(token,site,[],1),gscQuery(token,site,['page'],50),gscQuery(token,site,['query'],100),gscQuery(token,site,['page','query'],250)]); const row=a[0]||{}; return {period_days:28,clicks:row.clicks??0,impressions:row.impressions??0,ctr:row.ctr??0,average_position:row.position??null,top_pages:p.map(r=>gscRow(r,['page'])),top_queries:q.map(r=>gscRow(r,['query'])),top_page_queries:pq.map(r=>gscRow(r,['page','query'])),evidence_date:today}; }

async function fetchGa4(token) {
  const property=process.env.GA4_PROPERTY_ID; if(!token||!property)return null;
  const endpoint=`https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(property)}:runReport`; const h={authorization:`Bearer ${token}`,'content-type':'application/json'}; const organicFilter={filter:{fieldName:'sessionDefaultChannelGroup',stringFilter:{matchType:'EXACT',value:'Organic Search'}}};
  const eventRes=await fetch(endpoint,{method:'POST',headers:h,body:JSON.stringify({dateRanges:[{startDate:'28daysAgo',endDate:'yesterday'}],dimensions:[{name:'eventName'}],metrics:[{name:'eventCount'}],dimensionFilter:{filter:{fieldName:'eventName',inListFilter:{values:['successful_tool_use','workflow_start','workflow_complete','upgrade_click']}}}})}); if(!eventRes.ok)throw new Error(`GA4 event report failed: ${eventRes.status} ${await eventRes.text()}`); const events=Object.fromEntries(((await eventRes.json()).rows||[]).map(r=>[r.dimensionValues?.[0]?.value,Number(r.metricValues?.[0]?.value||0)]));
  const organicRes=await fetch(endpoint,{method:'POST',headers:h,body:JSON.stringify({dateRanges:[{startDate:'28daysAgo',endDate:'yesterday'}],metrics:[{name:'sessions'},{name:'activeUsers'},{name:'newUsers'}],dimensionFilter:organicFilter})}); if(!organicRes.ok)throw new Error(`GA4 organic report failed: ${organicRes.status} ${await organicRes.text()}`); const organicRow=(await organicRes.json()).rows?.[0];
  const returningRes=await fetch(endpoint,{method:'POST',headers:h,body:JSON.stringify({dateRanges:[{startDate:'28daysAgo',endDate:'yesterday'}],dimensions:[{name:'newVsReturning'}],metrics:[{name:'activeUsers'}],dimensionFilter:organicFilter})}); if(!returningRes.ok)throw new Error(`GA4 returning-user report failed: ${returningRes.status} ${await returningRes.text()}`); const returningUsers=((await returningRes.json()).rows||[]).filter(r=>r.dimensionValues?.[0]?.value==='returning').reduce((s,r)=>s+Number(r.metricValues?.[0]?.value||0),0);
  return {period_days:28,organic_sessions:Number(organicRow?.metricValues?.[0]?.value||0),organic_active_users:Number(organicRow?.metricValues?.[1]?.value||0),organic_new_users:Number(organicRow?.metricValues?.[2]?.value||0),organic_returning_users:returningUsers,successful_tool_uses:events.successful_tool_use??0,workflow_starts:events.workflow_start??0,workflow_completions:events.workflow_complete??0,upgrade_clicks:events.upgrade_click??0,evidence_date:today};
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
      // MRR is deliberately conservative: only currently active/trialing subscriptions
      // whose latest invoice has actually been paid and not subsequently refunded count.
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

const board=JSON.parse(await fs.readFile(SCOREBOARD,'utf8')); let googleToken=null; try{googleToken=await googleAccessToken();}catch(e){warnings.push(e.message);} let gsc=null,ga4=null,stripe=null; try{gsc=await fetchGsc(googleToken);}catch(e){warnings.push(e.message);} try{ga4=await fetchGa4(googleToken);}catch(e){warnings.push(e.message);} try{stripe=await fetchStripe();}catch(e){warnings.push(e.message);}
board.sources=board.sources||{}; board.sources.search_console=gsc||{status:'unavailable',evidence_date:today}; board.sources.ga4=ga4||{status:'unavailable',evidence_date:today}; board.sources.stripe=stripe||{status:'unavailable',evidence_date:today};
if(gsc){board.funnel.search_impressions=gsc.impressions;board.funnel.organic_clicks=gsc.clicks;board.funnel.organic_ctr=gsc.ctr;}
if(ga4){board.funnel.successful_tool_uses=ga4.successful_tool_uses;board.funnel.workflow_starts=ga4.workflow_starts;board.funnel.workflow_completions=ga4.workflow_completions;board.funnel.upgrade_visits=ga4.upgrade_clicks;board.funnel.returning_users=ga4.organic_returning_users;}
if(stripe){board.objective.current=stripe.mrr_gbp;board.objective.evidence_date=stripe.evidence_date;board.funnel.pro_customers=(stripe.plan_counts.pro_monthly||0)+(stripe.plan_counts.pro_yearly||0);board.funnel.api_automation_customers=(stripe.plan_counts.api_monthly||0)+(stripe.plan_counts.api_yearly||0)+(stripe.plan_counts.automation_monthly||0)+(stripe.plan_counts.automation_yearly||0);board.objective.revenue_definition='Genuine recurring revenue only: current subscription plus paid succeeded latest invoice charge, excluding fully refunded and inactive/cancelled subscriptions.';}
board.missing_instrumentation=[];if(!gsc)board.missing_instrumentation.push('Google Search Console feed unavailable.');if(!ga4)board.missing_instrumentation.push('GA4 feed unavailable.');if(!stripe)board.missing_instrumentation.push('Stripe feed unavailable.');if(gsc&&gsc.top_page_queries.length===0)board.missing_instrumentation.push('Search Console returned no page/query rows for the current 28-day period.');if(board.funnel.indexed_target_pages==null)board.missing_instrumentation.push('Indexed target-page count or URL Inspection/index coverage evidence is unavailable.');board.last_updated=today;board.refresh_warnings=warnings;
await fs.writeFile(SCOREBOARD,JSON.stringify(board,null,2)+'\n');console.log(JSON.stringify({refreshed:{gsc:!!gsc,ga4:!!ga4,stripe:!!stripe},warnings},null,2));
