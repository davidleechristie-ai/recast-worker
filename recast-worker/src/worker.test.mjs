import * as W from './worker.js';
import * as E from './entitlements.js';
import { signPayloadForTest } from './stripe-verify.js';

let pass = 0, fail = 0;
function assert(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL:', name, detail !== undefined ? JSON.stringify(detail) : ''); }
}

function makeMockKV() {
  const store = new Map();
  return {
    async get(key) { return store.has(key) ? store.get(key) : null; },
    async put(key, value) { store.set(key, value); },
  };
}

function mockRequest(url, opts) {
  opts = opts || {};
  return new Request(url, opts);
}

const env = {
  ENTITLEMENTS: null, // set per-test
  STRIPE_SECRET_KEY: 'sk_test_fake',
  STRIPE_WEBHOOK_SECRET: 'whsec_test_fake',
  PRICE_MAP: JSON.stringify({ price_pro_m: 'pro_monthly', price_pro_y: 'pro_yearly', price_api_m: 'api_monthly' }),
  SITE_URL: 'https://tryrecast.app/',
};

(async () => {
  // ---------------- /api/verify-session ----------------
  {
    const kv = makeMockKV();
    const testEnv = Object.assign({}, env, { ENTITLEMENTS: kv });
    const fakeStripeFetch = async (url) => {
      assert('verify-session calls the correct Stripe endpoint', url.includes('/checkout/sessions/cs_test_1'), url);
      return {
        ok: true,
        json: async () => ({
          payment_status: 'paid',
          status: 'complete',
          customer: 'cus_abc',
          subscription: { status: 'active', items: { data: [{ price: { id: 'price_pro_m' } }] } },
        }),
      };
    };
    const deps = Object.assign({}, W.defaultDeps, { fetchImpl: fakeStripeFetch });
    const req = mockRequest('https://x/api/verify-session?session_id=cs_test_1');
    const res = await W.handleVerifySession(req, testEnv, deps);
    const body = await res.json();
    assert('verify-session returns 200 for a paid session', res.status === 200, res.status);
    assert('verify-session returns a token', !!body.token, body);
    assert('verify-session maps the price ID to the right plan', body.plan === 'pro_monthly', body);
    assert('verify-session reports entitled=true for active status', body.entitled === true, body);

    // token should actually be usable via lookupToken
    const rec = await E.lookupToken(kv, body.token);
    assert('token issued by verify-session resolves via lookupToken', rec && rec.customerId === 'cus_abc' && rec.plan === 'pro_monthly', rec);
  }

  // --- verify-session: unpaid session is rejected ---
  {
    const kv = makeMockKV();
    const testEnv = Object.assign({}, env, { ENTITLEMENTS: kv });
    const fakeStripeFetch = async () => ({
      ok: true,
      json: async () => ({ payment_status: 'unpaid', status: 'open', customer: 'cus_x' }),
    });
    const deps = Object.assign({}, W.defaultDeps, { fetchImpl: fakeStripeFetch });
    const req = mockRequest('https://x/api/verify-session?session_id=cs_test_2');
    const res = await W.handleVerifySession(req, testEnv, deps);
    assert('verify-session rejects an unpaid session with 402', res.status === 402, res.status);
  }

  // --- verify-session: missing session_id ---
  {
    const testEnv = Object.assign({}, env, { ENTITLEMENTS: makeMockKV() });
    const req = mockRequest('https://x/api/verify-session');
    const res = await W.handleVerifySession(req, testEnv, W.defaultDeps);
    assert('verify-session requires session_id', res.status === 400, res.status);
  }

  // ---------------- /api/verify-token ----------------
  {
    const kv = makeMockKV();
    const token = await E.issueToken(kv, 'cus_777', 'api_monthly', 'active');
    const testEnv = Object.assign({}, env, { ENTITLEMENTS: kv });
    const req = mockRequest('https://x/api/verify-token?token=' + token);
    const res = await W.handleVerifyToken(req, testEnv, W.defaultDeps);
    const body = await res.json();
    assert('verify-token reports entitled for an active subscriber', body.entitled === true && body.plan === 'api_monthly', body);
  }

  // --- verify-token: reflects a cancellation that happened after the token was issued ---
  {
    const kv = makeMockKV();
    const token = await E.issueToken(kv, 'cus_888', 'pro_monthly', 'active');
    await E.setCustomerStatus(kv, 'cus_888', 'pro_monthly', 'canceled');
    const testEnv = Object.assign({}, env, { ENTITLEMENTS: kv });
    const req = mockRequest('https://x/api/verify-token?token=' + token);
    const res = await W.handleVerifyToken(req, testEnv, W.defaultDeps);
    const body = await res.json();
    assert('verify-token catches a cancellation \u2014 THIS is the actual enforcement', body.entitled === false, body);
  }

  // --- verify-token: unknown token ---
  {
    const testEnv = Object.assign({}, env, { ENTITLEMENTS: makeMockKV() });
    const req = mockRequest('https://x/api/verify-token?token=rk_forged_by_hand');
    const res = await W.handleVerifyToken(req, testEnv, W.defaultDeps);
    const body = await res.json();
    assert('a token nobody actually issued (someone guessing/forging) is not entitled', body.entitled === false, body);
  }

  // ---------------- /api/webhook ----------------
  {
    const kv = makeMockKV();
    await E.issueToken(kv, 'cus_999', 'pro_monthly', 'active');
    const testEnv = Object.assign({}, env, { ENTITLEMENTS: kv });

    const payload = JSON.stringify({
      type: 'customer.subscription.updated',
      data: { object: { customer: 'cus_999', status: 'past_due', items: { data: [{ price: { id: 'price_pro_m' } }] } } },
    });
    const sig = await signPayloadForTest(payload, testEnv.STRIPE_WEBHOOK_SECRET);
    const req = mockRequest('https://x/api/webhook', { method: 'POST', body: payload, headers: { 'Stripe-Signature': sig } });
    const res = await W.handleWebhook(req, testEnv, W.defaultDeps);
    assert('valid webhook is accepted', res.status === 200, res.status);

    const custRaw = await kv.get('customer:cus_999');
    assert('webhook updates the customer record status', JSON.parse(custRaw).status === 'past_due', custRaw);
  }

  // --- webhook: bad signature rejected ---
  {
    const kv = makeMockKV();
    const testEnv = Object.assign({}, env, { ENTITLEMENTS: kv });
    const payload = JSON.stringify({ type: 'customer.subscription.deleted', data: { object: { customer: 'cus_1', items: { data: [] } } } });
    const req = mockRequest('https://x/api/webhook', { method: 'POST', body: payload, headers: { 'Stripe-Signature': 't=1,v1=deadbeef' } });
    const res = await W.handleWebhook(req, testEnv, W.defaultDeps);
    assert('webhook with bad signature is rejected with 400', res.status === 400, res.status);
  }

  // --- webhook: subscription deleted revokes entitlement ---
  {
    const kv = makeMockKV();
    const token = await E.issueToken(kv, 'cus_del', 'pro_yearly', 'active');
    const testEnv = Object.assign({}, env, { ENTITLEMENTS: kv });
    const payload = JSON.stringify({ type: 'customer.subscription.deleted', data: { object: { customer: 'cus_del', items: { data: [] } } } });
    const sig = await signPayloadForTest(payload, testEnv.STRIPE_WEBHOOK_SECRET);
    const req = mockRequest('https://x/api/webhook', { method: 'POST', body: payload, headers: { 'Stripe-Signature': sig } });
    await W.handleWebhook(req, testEnv, W.defaultDeps);
    const rec = await E.lookupToken(kv, token);
    assert('subscription.deleted webhook revokes entitlement for existing token', rec.status === 'canceled' && E.isEntitled(rec.status) === false, rec);
  }

  // ---------------- /api/portal ----------------
  {
    const kv = makeMockKV();
    const token = await E.issueToken(kv, 'cus_portal', 'pro_monthly', 'active');
    const testEnv = Object.assign({}, env, { ENTITLEMENTS: kv });
    const fakeStripeFetch = async (url, opts) => {
      assert('portal request posts to billing_portal/sessions', url.includes('/billing_portal/sessions'), url);
      assert('portal request includes the correct customer id', opts.body.includes('cus_portal'), opts.body);
      return { ok: true, json: async () => ({ url: 'https://billing.stripe.com/session/xyz' }) };
    };
    const deps = Object.assign({}, W.defaultDeps, { fetchImpl: fakeStripeFetch });
    const req = mockRequest('https://x/api/portal', { method: 'POST', body: JSON.stringify({ token }), headers: { 'Content-Type': 'application/json' } });
    const res = await W.handlePortal(req, testEnv, deps);
    const body = await res.json();
    assert('portal endpoint returns a URL', body.url === 'https://billing.stripe.com/session/xyz', body);
  }

  // --- portal: invalid token rejected ---
  {
    const testEnv = Object.assign({}, env, { ENTITLEMENTS: makeMockKV() });
    const req = mockRequest('https://x/api/portal', { method: 'POST', body: JSON.stringify({ token: 'rk_nope' }), headers: { 'Content-Type': 'application/json' } });
    const res = await W.handlePortal(req, testEnv, W.defaultDeps);
    assert('portal rejects an invalid token with 401', res.status === 401, res.status);
  }

  // ---------------- routing ----------------
  {
    const testEnv = Object.assign({}, env, { ENTITLEMENTS: makeMockKV() });
    const req = mockRequest('https://x/some/other/page.html');
    const result = await W.route(req, testEnv, W.defaultDeps);
    assert('non-API routes return null (fall through to static assets)', result === null, result);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
