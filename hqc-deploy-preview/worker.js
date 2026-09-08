const ORIGIN='https://heat-pump-second-opinion-v43csv.v2.appdeploy.ai';
export default {
  async fetch(request) {
    const incoming=new URL(request.url);
    if(incoming.pathname==='/health') return new Response(JSON.stringify({ok:true,service:'hqc-migration-preview',origin:ORIGIN}),{headers:{'content-type':'application/json','cache-control':'no-store'}});
    const target=new URL(incoming.pathname+incoming.search,ORIGIN);
    const headers=new Headers(request.headers);
    headers.delete('host');
    const init={method:request.method,headers,redirect:'manual'};
    if(!['GET','HEAD'].includes(request.method)) init.body=request.body;
    let response=await fetch(target.toString(),init);
    const outHeaders=new Headers(response.headers);
    outHeaders.set('x-hqc-cloudflare-preview','1');
    outHeaders.set('cache-control','no-store');
    const location=outHeaders.get('location');
    if(location&&location.startsWith(ORIGIN)) outHeaders.set('location',incoming.origin+location.slice(ORIGIN.length));
    const type=outHeaders.get('content-type')||'';
    if(type.includes('text/html')||type.includes('javascript')||type.includes('text/css')) {
      let body=await response.text();
      body=body.split('https://homequotecheck.co.uk').join(incoming.origin).split(ORIGIN).join(incoming.origin);
      return new Response(body,{status:response.status,statusText:response.statusText,headers:outHeaders});
    }
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers:outHeaders});
  }
};