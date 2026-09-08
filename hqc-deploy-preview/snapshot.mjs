import {mkdir,writeFile,rm,copyFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
const ORIGIN='https://heat-pump-second-opinion-v43csv.v2.appdeploy.ai';
const DEFAULT_TARGET='https://hqc-migration-preview.davidleechristie.workers.dev';
const TARGET=(process.env.HQC_PUBLIC_ORIGIN||DEFAULT_TARGET).replace(/\/$/,'');
const SITE='site';
await rm(SITE,{recursive:true,force:true});
await mkdir(SITE,{recursive:true});
const saved=new Set();
function localPath(ref){
  if(ref.startsWith(ORIGIN+'/'))return new URL(ref).pathname;
  if(ref.startsWith(TARGET+'/'))return new URL(ref).pathname;
  if(ref.startsWith('./'))return '/'+ref.slice(2);
  if(ref.startsWith('/'))return ref;
  return null;
}
function cleanHtml(body){
  return body
    .replace(/<script data-appdeploy-overlay-bootstrap>[\s\S]*?<\/script>/g,'')
    .replace(/<script async src="https:\/\/v2\.appdeploy\.ai\/shared\/js\/overlay\.js"[\s\S]*?<\/script>/g,'')
    .replace(/<script>window\.__APPDEPLOY_APP_ID[\s\S]*?<\/script>/g,'')
    .replace(/<script data-appdeploy-network-hook>[\s\S]*?<\/script>/g,'')
    .replaceAll('https://homequotecheck.co.uk',TARGET)
    .replaceAll(ORIGIN,TARGET)
    .replaceAll('./resources/homepage-graphic.png','/resources/homepage-house-reference.svg')
    .replaceAll('/resources/homepage-graphic.png','/resources/homepage-house-reference.svg')
    .replace('</body>','<script src="/__hqc_enhancements.js" defer></script><script src="/__hqc_upload_v3.js" defer></script></body>');
}
async function save(path,binary=false){
  if(saved.has(path))return;
  saved.add(path);
  const res=await fetch(ORIGIN+path,{redirect:'follow'});
  if(!res.ok)throw new Error(`${path} -> ${res.status}`);
  let body=binary?Buffer.from(await res.arrayBuffer()):await res.text();
  if(!binary){
    if(path==='/'||path.endsWith('.html'))body=cleanHtml(body);
    else body=body.replaceAll('https://homequotecheck.co.uk',TARGET).replaceAll(ORIGIN,TARGET);
    if(path==='/'||path.endsWith('.html')){
      const refs=[...body.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m=>m[1]);
      for(const ref of refs){
        const p=localPath(ref);
        if(!p)continue;
        if(p.startsWith('/assets/')||p==='/manifest.json'||p==='/sw.js')await save(p,false);
      }
    }
  }
  const filePath=join(SITE,path==='/'?'index.html':path.replace(/^\//,''));
  await mkdir(dirname(filePath),{recursive:true});
  await writeFile(filePath,body);
  console.log(`snapshotted ${path}`);
}
await save('/');
for(const path of ['/robots.txt','/sitemap.xml','/is-this-a-good-heat-pump-quote.html'])await save(path);
await mkdir(join(SITE,'resources'),{recursive:true});
await copyFile('homepage-house-reference.svg',join(SITE,'resources/homepage-house-reference.svg'));
await copyFile('enhancements-browser.js',join(SITE,'__hqc_enhancements.js'));
await copyFile('upload-friction-v3.js',join(SITE,'__hqc_upload_v3.js'));
console.log(`HQC frontend snapshot complete for ${TARGET}: ${saved.size} fetched files + clean house artwork + enhancements + upload handoff v3`);
