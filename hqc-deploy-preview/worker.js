const API_BASE='https://api-v2.appdeploy.ai/app/heat-pump-second-opinion-v43csv';
export default {
  async fetch(request,env) {
    const incoming=new URL(request.url);
    const mode=env.HQC_ENV||'preview';
    const service=mode==='production'?'home-quote-check':'hqc-migration-preview';
    if(incoming.pathname==='/health') return new Response(JSON.stringify({ok:true,service,environment:mode,frontend:'cloudflare-assets',apiBase:API_BASE}),{headers:{'content-type':'application/json','cache-control':'no-store'}});
    if(incoming.pathname.startsWith('/api/')){
      const target=API_BASE+incoming.pathname+incoming.search;
      const headers=new Headers(request.headers);
      headers.delete('host');
      headers.delete('origin');
      const init={method:request.method,headers,redirect:'manual'};
      if(!['GET','HEAD'].includes(request.method))init.body=request.body;
      const response=await fetch(target,init);
      const outHeaders=new Headers(response.headers);
      outHeaders.set('x-hqc-cloudflare-edge',mode);
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
