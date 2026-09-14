const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==='/health') return json({ok:true,service:'scrapsignal-preview',frontend:'cloudflare-assets'});
    return env.ASSETS.fetch(request);
  }
};
