import assert from 'node:assert/strict';
import * as W from './worker.js';
import * as E from './entitlements.js';
function makeKV(){const store=new Map();return {store,async get(k){return store.has(k)?store.get(k):null},async put(k,v){store.set(k,v)},async delete(k){store.delete(k)},async list(o={}){return {keys:[...store.keys()].filter(k=>!o.prefix||k.startsWith(o.prefix)).map(name=>({name})),list_complete:true}}}}
function req(path,t,method='GET',body){return new Request('https://tryrecast.app'+path,{method,headers:{Authorization:'Bearer '+t,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined})}
const kv=makeKV(), env={ENTITLEMENTS:kv,CREDENTIAL_ENCRYPTION_KEY:'v14-test-only-secret-that-is-longer-than-32-characters'};
const tok=await E.issueToken(kv,'cus_vault','automation_monthly','active');
let r=await W.route(req('/v1/credentials',tok,'POST',{name:'CRM bearer',type:'bearer',value:'super-secret-token'}),env,W.defaultDeps);
assert.equal(r.status,201);const made=await r.json();assert.ok(made.credential.id.startsWith('cred_'));assert.equal(JSON.stringify(made).includes('super-secret-token'),false);
const stored=[...kv.store.entries()].find(([k])=>k.startsWith('credential:cus_vault:'));assert.ok(stored);assert.equal(stored[1].includes('super-secret-token'),false);
r=await W.route(req('/v1/credentials',tok),env,W.defaultDeps);const listed=await r.json();assert.equal(listed.credentials.length,1);assert.equal(JSON.stringify(listed).includes('super-secret-token'),false);
const other=await E.issueToken(kv,'cus_other_vault','automation_monthly','active');
r=await W.route(req('/v1/credentials/'+made.credential.id,other,'DELETE'),env,W.defaultDeps);assert.equal(r.status,404);
const apiTok=await E.issueToken(kv,'cus_api_only','api_monthly','active');
r=await W.route(req('/v1/credentials',apiTok,'POST',{name:'Nope',type:'bearer',value:'x'}),env,W.defaultDeps);assert.equal(r.status,403);
const envNoSecret={ENTITLEMENTS:kv};
const noSecretTok=await E.issueToken(kv,'cus_no_secret','automation_monthly','active');
r=await W.route(req('/v1/credentials',noSecretTok,'POST',{name:'Fail closed',type:'bearer',value:'secret'}),envNoSecret,W.defaultDeps);assert.equal(r.status,503);
console.log('credential-vault tests passed');
