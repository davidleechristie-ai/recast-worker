import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import worker from '../worker.js';

const request=(technology)=>new Request('https://homequotecheck.co.uk/api/decision-pack/checkout',{
  method:'POST',headers:{'content-type':'application/json'},
  body:JSON.stringify({caseId:'case-renewable-123456',technology})
});
const env={HQC_ENV:'production',STRIPE_SECRET_KEY:'test-key',STRIPE_DECISION_PACK_PRICE_ID:'price_test'};

for(const technology of ['ev_chargepoint','solar_battery','battery','made_up']){
  test('no Heat Pump Decision Pack checkout for '+technology,async()=>{
    const original=globalThis.fetch;
    globalThis.fetch=()=>{throw new Error('Renewable checkout reached Stripe')};
    try{
      const r=await worker.fetch(request(technology),env);
      assert.equal(r.status,409);
      assert.equal((await r.json()).error,'decision_pack_unavailable_for_technology');
    }finally{globalThis.fetch=original}
  });
}
test('Heat Pump checkout still creates a session',async()=>{
  const original=globalThis.fetch;
  let requested=false;
  globalThis.fetch=async(url)=>{assert.match(String(url),/checkout\/sessions$/);requested=true;return Response.json({url:'https://checkout.stripe.test/session',id:'cs_test'})};
  try{
    const r=await worker.fetch(request('heat_pump'),{...env,HQC_METRICS:{getByName:()=>({fetch:async()=>Response.json({recorded:true})})}});
    assert.equal(r.status,200);
    assert.equal((await r.json()).url,'https://checkout.stripe.test/session');
    assert.equal(requested,true);
  }finally{globalThis.fetch=original}
});

const source=fs.readFileSync(new URL('../decision-pack.js',import.meta.url),'utf8');
for(const technology of ['ev_chargepoint','solar_battery','battery']){
  test('no Heat Pump Decision Pack offer for '+technology,()=>{
    const children=[];
    const store=new Map([['hqc_journey_technology',technology]]);
    const document={
      body:{innerText:'Your Decision Case',appendChild:e=>children.push(e)},
      documentElement:{},
      getElementById:()=>null,
      querySelector:()=>null,
      createElement:()=>({style:{},dataset:{},querySelector:()=>null})
    };
    let onTimeout;
    vm.runInNewContext(source,{
      location:{search:'',pathname:'/'},document,
      sessionStorage:{getItem:k=>store.get(k)||null},
      localStorage:{getItem:()=>null,setItem:()=>{}},
      crypto:{randomUUID:()=> 'case-renewable-123456'},
      MutationObserver:class{observe(){}},
      setTimeout:fn=>{onTimeout=fn},
      URLSearchParams,history:{replaceState(){}}
    });
    onTimeout();
    assert.equal(children.length,0);
  });
}
test('Heat Pump still renders its Decision Pack offer',()=>{
  const children=[];
  const document={
    body:{innerText:'Your Decision Case',appendChild:e=>children.push(e)},
    documentElement:{},getElementById:()=>null,querySelector:()=>null,
    createElement:()=>({style:{},dataset:{},querySelector:()=>null})
  };
  let onTimeout;
  vm.runInNewContext(source,{
    location:{search:'',pathname:'/'},document,fetch:async()=>Response.json({recorded:true}),
    sessionStorage:{getItem:()=> 'heat_pump'},
    localStorage:{getItem:()=>null,setItem:()=>{}},
    crypto:{randomUUID:()=> 'case-heat-pump-123456'},
    MutationObserver:class{observe(){}},setTimeout:fn=>{onTimeout=fn},
    URLSearchParams,history:{replaceState(){}}
  });
  onTimeout();
  assert.equal(children.length,1);
  assert.match(children[0].innerHTML,/£4.99/);
});
