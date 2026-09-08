import {mkdir,writeFile,rm} from 'node:fs/promises';
import {dirname,join} from 'node:path';
const ORIGIN='https://heat-pump-second-opinion-v43csv.v2.appdeploy.ai';
const PREVIEW='https://hqc-migration-preview.davidleechristie.workers.dev';
const SITE='site';
await rm(SITE,{recursive:true,force:true});
await mkdir(SITE,{recursive:true});
const saved=new Set();
function localPath(ref){
  if(ref.startsWith(ORIGIN+'/'))return new URL(ref).pathname;
  if(ref.startsWith(PREVIEW+'/'))return new URL(ref).pathname;
  if(ref.startsWith('./'))return '/'+ref.slice(2);
  if(ref.startsWith('/'))return ref;
  return null;
}
async function save(path,binary=false){
  if(saved.has(path))return;
  saved.add(path);
  const res=await fetch(ORIGIN+path,{redirect:'follow'});
  if(!res.ok)throw new Error(`${path} -> ${res.status}`);
  let body=binary?Buffer.from(await res.arrayBuffer()):await res.text();
  if(!binary){
    body=body.replaceAll('https://homequotecheck.co.uk',PREVIEW).replaceAll(ORIGIN,PREVIEW);
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
await save('/resources/homepage-graphic.png',true);
console.log(`HQC frontend snapshot complete: ${saved.size} files`);
