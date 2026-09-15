const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const SECURITY_HEADERS={'x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin','permissions-policy':'camera=(), microphone=(), geolocation=()','x-frame-options':'DENY'};
const withHeaders=(response)=>{const next=new Response(response.body,response);for(const [key,value] of Object.entries(SECURITY_HEADERS))next.headers.set(key,value);return next;};
const ALLOWED_EVENTS=new Set(['page_view','commercial_cta_click','evidence_click','dashboard_demo_interaction','dashboard_view','dashboard_filter','signal_open','alert_settings_saved','csv_export','watchlist_toggle','copy_sales_angle','checkout_start','signup','checkout_complete','subscription','cancellation']);
const BOT_RE=/(bot|crawler|spider|slurp|headless|lighthouse|pagespeed|monitor|synthetic|uptime|playwright|puppeteer|curl|wget)/i;
const safe=(value,max=240)=>String(value||'').slice(0,max);
const recordCommercialEvent=(request,env,event)=>{
  if(!env.ANALYTICS)return false;
  const ua=request.headers.get('user-agent')||'';
  if(BOT_RE.test(ua)||event?.meta?.synthetic===true||event?.meta?.qa===true)return false;
  const cf=request.cf||{};
  env.ANALYTICS.writeDataPoint({
    indexes:['scrapsignal'],
    blobs:[safe(event.event,64),safe(event.path,180),safe(event.referrer,260),safe(cf.country,8),safe(cf.region,80),safe(event.meta?.source,80),safe(event.meta?.plan,40)],
    doubles:[1,Date.now()],
  });
  return true;
};
export default {async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==='/health')return withHeaders(json({ok:true,service:'scrapsignal-preview',frontend:'cloudflare-assets',analytics:'durable'}));
  if(url.pathname==='/api/event'&&request.method==='POST'){
    try{
      const event=await request.json();
      if(!ALLOWED_EVENTS.has(event.event))return withHeaders(json({ok:false},400));
      const persisted=recordCommercialEvent(request,env,event);
      console.log(JSON.stringify({type:'commercial_event',persisted,event:event.event,path:safe(event.path,160),referrer:safe(event.referrer,300),meta:event.meta||{},ts:event.ts||new Date().toISOString()}));
      return withHeaders(json({ok:true,persisted},202));
    }catch{return withHeaders(json({ok:false},400));}
  }
  const cleanRoutes={'/methodology':'/methodology.html','/waste-sales-intelligence':'/waste-sales-intelligence.html','/waste-compliance-sales-signals':'/waste-compliance-sales-signals.html','/digital-waste-tracking-sales-intelligence':'/digital-waste-tracking-sales-intelligence.html','/digital-waste-tracking-supplier-market-2026':'/digital-waste-tracking-supplier-market-2026.html','/dashboard-demo':'/dashboard-demo.html','/signals/new-waste-sites-september-2026':'/new-waste-sites-september-2026.html','/signals/global-metal-recycling-compliance':'/global-metal-recycling-compliance-signal.html'};
  if(cleanRoutes[url.pathname]){
    const assetUrl=new URL(request.url);assetUrl.pathname=cleanRoutes[url.pathname];
    const asset=await env.ASSETS.fetch(new Request(assetUrl,request));
    if(url.pathname==='/dashboard-demo'&&asset.ok){const html=await asset.text();const enhanced=html.replace('</body>','<script src="/live-signals.js"></script></body>');return withHeaders(new Response(enhanced,{status:asset.status,headers:asset.headers}));}
    return withHeaders(asset);
  }
  if(Object.values(cleanRoutes).includes(url.pathname)){const match=Object.entries(cleanRoutes).find(([,file])=>file===url.pathname);url.pathname=match?match[0]:url.pathname.replace(/\.html$/,'');return Response.redirect(url.toString(),308);}
  return withHeaders(await env.ASSETS.fetch(request));
}};
