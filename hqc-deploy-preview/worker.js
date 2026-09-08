const FRONTEND_ORIGIN='https://heat-pump-second-opinion-v43csv.v2.appdeploy.ai';
const API_BASE='https://api-v2.appdeploy.ai/app/heat-pump-second-opinion-v43csv';
export default {
  async fetch(request) {
    const incoming=new URL(request.url);
    if(incoming.pathname==='/health') return new Response(JSON.stringify({ok:true,service:'hqc-migration-preview',frontendOrigin:FRONTEND_ORIGIN,apiBase:API_BASE}),{headers:{'content-type':'application/json','cache-control':'no-store'}});
    const isApi=incoming.pathname.startsWith('/api/');
    const target=isApi?API_BASE+incoming.pathname+incoming.search:new URL(incoming.pathname+incoming.search,FRONTEND_ORIGIN).toString();
    const headers=new Headers(request.headers);
    headers.delete('host');
    headers.delete('origin');
    const init={method:request.method,headers,redirect:'manual'};
    if(!['GET','HEAD'].includes(request.method)) init.body=request.body;
    const response=await fetch(target,init);
    const outHeaders=new Headers(response.headers);
    outHeaders.set('x-hqc-cloudflare-preview','1');
    outHeaders.set('cache-control','no-store');
    const location=outHeaders.get('location');
    if(location&&location.startsWith(FRONTEND_ORIGIN)) outHeaders.set('location',incoming.origin+location.slice(FRONTEND_ORIGIN.length));
    const type=outHeaders.get('content-type')||'';
    if(!isApi&&(type.includes('text/html')||type.includes('javascript')||type.includes('text/css'))) {
      let body=await response.text();
      body=body.split('https://homequotecheck.co.uk').join(incoming.origin).split(FRONTEND_ORIGIN).join(incoming.origin);
      return new Response(body,{status:response.status,statusText:response.statusText,headers:outHeaders});
    }
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers:outHeaders});
  }
};