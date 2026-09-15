const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
const SECURITY_HEADERS={'x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin','permissions-policy':'camera=(), microphone=(), geolocation=()','x-frame-options':'DENY'};
const withHeaders=(response)=>{const next=new Response(response.body,response);for(const [key,value] of Object.entries(SECURITY_HEADERS))next.headers.set(key,value);return next;};
export default {async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==='/health')return withHeaders(json({ok:true,service:'scrapsignal-preview',frontend:'cloudflare-assets'}));
  if(url.pathname==='/api/event'&&request.method==='POST'){
    try{const event=await request.json();const allowed=new Set(['page_view','commercial_cta_click','evidence_click','dashboard_demo_interaction','dashboard_view','dashboard_filter','signal_open','alert_settings_saved','csv_export','watchlist_toggle','copy_sales_angle']);if(!allowed.has(event.event))return withHeaders(json({ok:false},400));console.log(JSON.stringify({type:'commercial_event',event:event.event,path:String(event.path||'').slice(0,160),referrer:String(event.referrer||'').slice(0,300),meta:event.meta||{},ts:event.ts||new Date().toISOString()}));return withHeaders(json({ok:true},202));}catch{return withHeaders(json({ok:false},400));}
  }
  const cleanRoutes={'/methodology':'/methodology.html','/waste-sales-intelligence':'/waste-sales-intelligence.html','/digital-waste-tracking-sales-intelligence':'/digital-waste-tracking-sales-intelligence.html','/dashboard-demo':'/dashboard-demo.html'};
  if(cleanRoutes[url.pathname]){
    const assetUrl=new URL(request.url);assetUrl.pathname=cleanRoutes[url.pathname];
    const asset=await env.ASSETS.fetch(new Request(assetUrl,request));
    if(url.pathname==='/dashboard-demo'&&asset.ok){
      const html=await asset.text();
      const enhanced=html.replace('</body>','<script src="/live-signals.js"></script></body>');
      return withHeaders(new Response(enhanced,{status:asset.status,headers:asset.headers}));
    }
    return withHeaders(asset);
  }
  if(Object.values(cleanRoutes).includes(url.pathname)){url.pathname=url.pathname.replace(/\.html$/,'');return Response.redirect(url.toString(),308);}
  return withHeaders(await env.ASSETS.fetch(request));
}};
