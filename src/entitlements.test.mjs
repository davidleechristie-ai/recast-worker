import * as E from './entitlements.js';
let pass = 0, fail = 0;
function assert(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL:', name, detail !== undefined ? JSON.stringify(detail) : ''); }
}

// Mock KV matching Cloudflare's real namespace.get/put signature (string in, string out)
function makeMockKV() {
  const store = new Map();
  return {
    store,
    async get(key) { return store.has(key) ? store.get(key) : null; },
    async put(key, value) { store.set(key, value); },
    async delete(key) { store.delete(key); },
  };
}

(async () => {
  const kv = makeMockKV();

  // --- Token generation is unique and well-formed ---
  const t1 = E.generateToken();
  const t2 = E.generateToken();
  assert('generated tokens are unique', t1 !== t2);
  assert('token has expected prefix', t1.startsWith('rk_'), t1);
  assert('token has no unsafe URL characters', !/[+/=]/.test(t1), t1);

  // --- issueToken + lookupToken roundtrip ---
  const token = await E.issueToken(kv, 'cus_123', 'pro_monthly', 'active');
  const rec = await E.lookupToken(kv, token);
  assert('lookupToken returns correct customer/plan/status', rec && rec.customerId === 'cus_123' && rec.plan === 'pro_monthly' && rec.status === 'active', rec);

  // --- A webhook updating the customer record is reflected for an already-issued token ---
  await E.setCustomerStatus(kv, 'cus_123', 'pro_monthly', 'canceled');
  const recAfterCancel = await E.lookupToken(kv, token);
  assert('cancellation via webhook is reflected on next lookup for the SAME token', recAfterCancel.status === 'canceled', recAfterCancel);

  // --- isEntitled correctly gates on status ---
  assert('active status is entitled', E.isEntitled('active') === true);
  assert('trialing status is entitled', E.isEntitled('trialing') === true);
  assert('canceled status is NOT entitled', E.isEntitled('canceled') === false);
  assert('past_due status is NOT entitled', E.isEntitled('past_due') === false);
  assert('unknown/undefined status is NOT entitled', E.isEntitled(undefined) === false);

  // --- Unknown token returns null, doesn't throw ---
  const missing = await E.lookupToken(kv, 'rk_does_not_exist');
  assert('unknown token returns null', missing === null);

  // --- Token pointing at a customer that somehow has no record returns null (defensive) ---
  await kv.put('token:orphan', JSON.stringify({ customerId: 'cus_ghost' }));
  const orphanLookup = await E.lookupToken(kv, 'orphan');
  assert('token with no matching customer record returns null', orphanLookup === null);

  // --- Two tokens for the same customer both see the same live status ---
  const tokenA = await E.issueToken(kv, 'cus_999', 'api_monthly', 'active');
  const tokenB = await E.issueToken(kv, 'cus_999', 'api_monthly', 'active');
  await E.setCustomerStatus(kv, 'cus_999', 'api_monthly', 'past_due');
  const recA = await E.lookupToken(kv, tokenA);
  const recB = await E.lookupToken(kv, tokenB);
  assert('multiple tokens for one customer share live status (A)', recA.status === 'past_due', recA);
  assert('multiple tokens for one customer share live status (B)', recB.status === 'past_due', recB);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
