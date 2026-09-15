const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});

const SECURITY_HEADERS={
  'x-content-type-options':'nosniff',
  'referrer-policy':'strict-origin-when-cross-origin',
  'permissions-policy':'camera=(), microphone=(), geolocation=()',
  'x-frame-options':'DENY'
};

const withHeaders=(response)=>{
  const next=new Response(response.body,response);
  for(const [key,value] of Object.entries(SECURITY_HEADERS)) next.headers.set(key,value);
  return next;
};

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==='/health') return withHeaders(json({ok:true,service:'scrapsignal-preview',frontend:'cloudflare-assets'}));

    // Keep public URLs clean while retaining static HTML assets behind Cloudflare Assets.
    const cleanRoutes={
      '/methodology':'/methodology.html',
      '/waste-sales-intelligence':'/waste-sales-intelligence.html'
    };
    if(cleanRoutes[url.pathname]){
      const assetUrl=new URL(request.url);
      assetUrl.pathname=cleanRoutes[url.pathname];
      return withHeaders(await env.ASSETS.fetch(new Request(assetUrl,request)));
    }

    // Consolidate duplicate .html URLs onto the extensionless canonical route.
    if(url.pathname==='/methodology.html' || url.pathname==='/waste-sales-intelligence.html'){
      url.pathname=url.pathname.replace(/\.html$/,'');
      return Response.redirect(url.toString(),308);
    }

    return withHeaders(await env.ASSETS.fetch(request));
  }
};
