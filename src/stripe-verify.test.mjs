import * as V from './stripe-verify.js';
let pass = 0, fail = 0;
function assert(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL:', name, detail !== undefined ? JSON.stringify(detail) : ''); }
}
async function throws(fn) {
  try { await fn(); return null; } catch (e) { return e.message; }
}

(async () => {
  const secret = 'whsec_test_secret_abc123';
  const payload = JSON.stringify({ id: 'evt_123', type: 'checkout.session.completed', data: { object: { id: 'cs_test_1' } } });
  const nowSec = Math.floor(Date.now() / 1000);

  // --- Valid signature accepted ---
  const validHeader = await V.signPayloadForTest(payload, secret, nowSec);
  const ok = await V.verifyStripeSignature(payload, validHeader, secret, 300, nowSec * 1000);
  assert('valid signature is accepted', ok === true);

  // --- Tampered payload rejected ---
  const tamperedPayload = payload.replace('cs_test_1', 'cs_test_HACKED');
  const err1 = await throws(() => V.verifyStripeSignature(tamperedPayload, validHeader, secret, 300, nowSec * 1000));
  assert('tampered payload is rejected', err1 === 'signature mismatch', err1);

  // --- Wrong secret rejected ---
  const wrongSecretHeader = await V.signPayloadForTest(payload, 'whsec_wrong_secret', nowSec);
  const err2 = await throws(() => V.verifyStripeSignature(payload, wrongSecretHeader, secret, 300, nowSec * 1000));
  assert('signature made with wrong secret is rejected', err2 === 'signature mismatch', err2);

  // --- Replay (old timestamp) rejected ---
  const oldHeader = await V.signPayloadForTest(payload, secret, nowSec - 1000); // 1000s old, tolerance 300s
  const err3 = await throws(() => V.verifyStripeSignature(payload, oldHeader, secret, 300, nowSec * 1000));
  assert('old timestamp (replay) is rejected', err3.includes('tolerance'), err3);

  // --- Missing header rejected ---
  const err4 = await throws(() => V.verifyStripeSignature(payload, null, secret));
  assert('missing signature header is rejected', err4.includes('missing'), err4);

  // --- Malformed header rejected ---
  const err5 = await throws(() => V.verifyStripeSignature(payload, 'garbage-not-a-real-header', secret));
  assert('malformed header is rejected', err5.includes('malformed'), err5);

  // --- Multiple v1 signatures (Stripe sends this during secret rotation) — any match should pass ---
  const correctSig = (await V.signPayloadForTest(payload, secret, nowSec)).split('v1=')[1];
  const multiHeader = `t=${nowSec},v1=deadbeef00000000000000000000000000000000000000000000000000dead,v1=${correctSig}`;
  const ok2 = await V.verifyStripeSignature(payload, multiHeader, secret, 300, nowSec * 1000);
  assert('accepts when ANY v1 signature in a multi-sig header matches', ok2 === true);

  // --- Empty/no v1 at all ---
  const err6 = await throws(() => V.verifyStripeSignature(payload, `t=${nowSec}`, secret));
  assert('header with timestamp but no v1 is rejected', err6.includes('malformed'), err6);

  // --- Case sensitivity / exact match required for hex comparison ---
  const upperCaseSig = correctSig.toUpperCase();
  const err7 = await throws(() => V.verifyStripeSignature(payload, `t=${nowSec},v1=${upperCaseSig}`, secret, 300, nowSec * 1000));
  assert('uppercase hex signature does not accidentally match (hex comparison is exact)', err7 === 'signature mismatch', err7);

  // --- Different payloads with same secret produce different signatures ---
  const sigA = (await V.signPayloadForTest('payload-a', secret, nowSec)).split('v1=')[1];
  const sigB = (await V.signPayloadForTest('payload-b', secret, nowSec)).split('v1=')[1];
  assert('different payloads produce different signatures', sigA !== sigB);

  // --- Deterministic: same input always produces same signature ---
  const sig1 = (await V.signPayloadForTest(payload, secret, nowSec)).split('v1=')[1];
  const sig2 = (await V.signPayloadForTest(payload, secret, nowSec)).split('v1=')[1];
  assert('signing is deterministic for identical input', sig1 === sig2);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
