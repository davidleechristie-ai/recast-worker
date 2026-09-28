import assert from 'node:assert/strict'; import test from 'node:test'; import fs from 'node:fs'; import {extractEvChargepointEvidence} from '../lib/ev-chargepoint-extraction.js';
const fixtures=JSON.parse(fs.readFileSync(new URL('./fixtures/ev-chargepoint-cases.json',import.meta.url))).cases;
for(const f of fixtures)test('EV extraction '+f.id,()=>{const r=extractEvChargepointEvidence(f.quoteText);for(const [k,v] of Object.entries(f.expected))assert.deepEqual(r[k],v,k);});
test('EV MVP benchmark >=95% with absent evidence left unknown',()=>{let n=0,c=0;for(const f of fixtures){const r=extractEvChargepointEvidence(f.quoteText);for(const [k,v] of Object.entries(f.expected)){n++;if(JSON.stringify(r[k])===JSON.stringify(v))c++;else console.error('EV_MVP_MISMATCH',f.id,k,v,r[k]);}}const accuracy=c/n;console.log('EV_MVP_ACCURACY',c+'/'+n,(100*accuracy).toFixed(1)+'%');assert.ok(accuracy>=.95);});
test('EV exclusions and unrelated solar mentions do not become included features',()=>{
  const excluded=extractEvChargepointEvidence('Smart charging not included. Dynamic load management excluded. Solar PV integration not included.');
  assert.equal(excluded.smart,null);
  assert.equal(excluded.loadManagement,null);
  assert.equal(excluded.pvIntegration,null);
  assert.equal(extractEvChargepointEvidence('Customer has existing solar panels. Charger has no PV integration.').pvIntegration,null);
  assert.equal(extractEvChargepointEvidence('Solar PV integration included with the charger.').pvIntegration,'solar/PV integration stated');
});
test('installation scope records explicit inclusion, exclusion and survey conditions',()=>{
  const e=extractEvChargepointEvidence('Dedicated 10m cable run included. Consumer unit upgrade excluded. Earthing arrangement subject to site survey.');
  assert.deepEqual(e.cablingScope,{status:'included',quoteText:'Dedicated 10m cable run included.'});
  assert.deepEqual(e.consumerUnitScope,{status:'excluded',quoteText:'Consumer unit upgrade excluded.'});
  assert.deepEqual(e.earthingScope,{status:'conditional',quoteText:'Earthing arrangement subject to site survey.'});
  const unknown=extractEvChargepointEvidence('We will assess the consumer unit and discuss the cable route. Existing earthing noted.');
  assert.equal(unknown.cablingScope,null);
  assert.equal(unknown.consumerUnitScope,null);
  assert.equal(unknown.earthingScope,null);
  const mixed=extractEvChargepointEvidence('Cable run included and consumer unit upgrade excluded.');
  assert.equal(mixed.cablingScope,null);
  assert.equal(mixed.consumerUnitScope,null);
});
