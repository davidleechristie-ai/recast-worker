import Worker, * as W from './worker.js';
import * as E from './entitlements.js';
import { signPayloadForTest } from './stripe-verify.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

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

  // ---------------- /v1/convert (new formats: YAML, Markdown table) ----------------
  {
    const kv = makeMockKV();
    const token = await E.issueToken(kv, 'cus_api_1', 'api_monthly', 'active');
    const testEnv = Object.assign({}, env, { ENTITLEMENTS: kv });
    const authHeaders = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token };

    const yamlReq = mockRequest('https://x/v1/convert', {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({ mode: 'json2yaml', input: JSON.stringify({ id: 1, name: 'Ada' }) }),
    });
    const yamlRes = await W.handleApiConvert(yamlReq, testEnv, W.defaultDeps);
    const yamlBody = await yamlRes.json();
    assert('json2yaml returns 200', yamlRes.status === 200, yamlRes.status);
    assert('json2yaml output looks like YAML', yamlBody.output === 'id: 1\nname: Ada\n', yamlBody);

    const backReq = mockRequest('https://x/v1/convert', {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({ mode: 'yaml2json', input: yamlBody.output }),
    });
    const backBody = await (await W.handleApiConvert(backReq, testEnv, W.defaultDeps)).json();
    assert('yaml2json round-trips json2yaml output', JSON.parse(backBody.output).name === 'Ada', backBody);

    const mdReq = mockRequest('https://x/v1/convert', {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({ mode: 'json2markdown', input: JSON.stringify([{ id: 1, name: 'Ada' }]) }),
    });
    const mdBody = await (await W.handleApiConvert(mdReq, testEnv, W.defaultDeps)).json();
    assert('json2markdown produces a pipe table', mdBody.output.startsWith('| id | name |'), mdBody);

    const md2jsonReq = mockRequest('https://x/v1/convert', {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({ mode: 'markdown2json', input: mdBody.output }),
    });
    const md2jsonBody = await (await W.handleApiConvert(md2jsonReq, testEnv, W.defaultDeps)).json();
    assert('markdown2json round-trips json2markdown output', JSON.parse(md2jsonBody.output)[0].name === 'Ada', md2jsonBody);

    const badReq = mockRequest('https://x/v1/convert', {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({ mode: 'not_a_real_mode', input: '{}' }),
    });
    const badRes = await W.handleApiConvert(badReq, testEnv, W.defaultDeps);
    assert('unknown mode still rejected with 400', badRes.status === 400, badRes.status);
  }

  // ---------------- routing ----------------
  {
    const testEnv = Object.assign({}, env, { ENTITLEMENTS: makeMockKV() });
    const req = mockRequest('https://x/some/other/page.html');
    const result = await W.route(req, testEnv, W.defaultDeps);
    assert('non-API routes return null (fall through to static assets)', result === null, result);
  }

  // ---------------- directory-index rewriting (html_handling: "none" fix) ----------------
  // With assets.html_handling set to "none", Cloudflare no longer auto-resolves a bare
  // "/" (or "/blog/", etc.) to that directory's index.html — the default export's fetch()
  // handler has to do that itself now. These tests mock env.ASSETS.fetch to capture
  // exactly what pathname it was asked for, so they verify the actual rewrite, not just
  // that a response came back.
  {
    const testEnv = Object.assign({}, env, { ENTITLEMENTS: makeMockKV() });
    const casesExpectingRewrite = [
      ['https://tryrecast.app/', '/index.html'],
      ['https://tryrecast.app/blog', '/blog/index.html'],
      ['https://tryrecast.app/blog/', '/blog/index.html'],
      ['https://tryrecast.app/how-to', '/how-to/index.html'],
      ['https://tryrecast.app/how-to/', '/how-to/index.html'],
      ['https://tryrecast.app/demo', '/demo/index.html'],
      ['https://tryrecast.app/demo/', '/demo/index.html'],
    ];
    for (const [requestUrl, expectedAssetPath] of casesExpectingRewrite) {
      let capturedPathname = null;
      const mockAssetsEnv = Object.assign({}, testEnv, {
        ASSETS: { fetch: async (req) => { capturedPathname = new URL(req.url).pathname; return new Response('mock asset'); } },
      });
      await Worker.fetch(mockRequest(requestUrl), mockAssetsEnv, {});
      assert(`${requestUrl} -> ASSETS.fetch called with ${expectedAssetPath}`, capturedPathname === expectedAssetPath, capturedPathname);
    }

    // A path that already targets a real, specific file must NOT be rewritten —
    // only the bare directory-index paths above should be touched.
    let unrewrittenPathname = null;
    const mockAssetsEnvPassthrough = Object.assign({}, testEnv, {
      ASSETS: { fetch: async (req) => { unrewrittenPathname = new URL(req.url).pathname; return new Response('mock asset'); } },
    });
    await Worker.fetch(mockRequest('https://tryrecast.app/tools/json-to-csv.html'), mockAssetsEnvPassthrough, {});
    assert('an explicit, already-correct path is passed through unchanged', unrewrittenPathname === '/tools/json-to-csv.html', unrewrittenPathname);

    // The URL the browser sees must never change — this fetches index.html's
    // content directly, it must not redirect. Confirmed by checking the Request
    // object handed to ASSETS.fetch keeps the ORIGINAL url on .url... actually
    // what matters is simply that no Response with a Location header / redirect
    // status is ever returned by fetch() itself for these paths.
    const rootEnv = Object.assign({}, testEnv, { ASSETS: { fetch: async () => new Response('index html content', { status: 200 }) } });
    const rootResponse = await Worker.fetch(mockRequest('https://tryrecast.app/'), rootEnv, {});
    assert('no client-visible redirect — response is 200, not a 3xx', rootResponse.status === 200, rootResponse.status);
  }

  // ---------------- /api/contact ----------------
  {
    const env2 = Object.assign({}, env, { RESEND_API_KEY: 're_test_fake' });

    // Valid submission -> Resend called with the right recipient and content
    {
      const kv = makeMockKV();
      const testEnv = Object.assign({}, env2, { ENTITLEMENTS: kv });
      let capturedUrl = null, capturedBody = null, capturedAuth = null;
      const fakeFetch = async (url, opts) => {
        capturedUrl = url; capturedAuth = opts.headers.Authorization;
        capturedBody = JSON.parse(opts.body);
        return { ok: true, json: async () => ({ id: 'email_123' }) };
      };
      const deps = Object.assign({}, W.defaultDeps, { fetchImpl: fakeFetch });
      const req = mockRequest('https://x/api/contact', {
        method: 'POST',
        body: JSON.stringify({ name: 'Ada Lovelace', email: 'ada@example.com', company: 'Analytical Engines', topic: 'API / Pro plan', message: 'Does batch diffing work?' }),
      });
      const res = await W.handleContactForm(req, testEnv, deps);
      const body = await res.json();
      assert('valid submission returns 200', res.status === 200, res.status);
      assert('valid submission returns ok:true', body.ok === true, body);
      assert('calls the real Resend endpoint', capturedUrl === 'https://api.resend.com/emails', capturedUrl);
      assert('uses the configured API key as Bearer token', capturedAuth === 'Bearer re_test_fake', capturedAuth);
      assert('sends to the correct recipient', capturedBody.to[0] === 'contact@tryrecast.app', capturedBody.to);
      assert('reply_to is the submitter\'s own email', capturedBody.reply_to === 'ada@example.com', capturedBody.reply_to);
      assert('subject includes the topic and name', capturedBody.subject.includes('API / Pro plan') && capturedBody.subject.includes('Ada Lovelace'), capturedBody.subject);
      assert('text body includes the message', capturedBody.text.includes('Does batch diffing work?'), capturedBody.text);
    }

    // Missing required fields -> 400, Resend never called
    {
      const kv = makeMockKV();
      const testEnv = Object.assign({}, env2, { ENTITLEMENTS: kv });
      let fetchCalled = false;
      const deps = Object.assign({}, W.defaultDeps, { fetchImpl: async () => { fetchCalled = true; return { ok: true, json: async () => ({}) }; } });
      const req = mockRequest('https://x/api/contact', { method: 'POST', body: JSON.stringify({ name: '', email: 'a@b.com', message: '' }) });
      const res = await W.handleContactForm(req, testEnv, deps);
      assert('missing name/message returns 400', res.status === 400, res.status);
      assert('does not call Resend when validation fails', fetchCalled === false, fetchCalled);
    }

    // Invalid email format -> 400
    {
      const kv = makeMockKV();
      const testEnv = Object.assign({}, env2, { ENTITLEMENTS: kv });
      const deps = Object.assign({}, W.defaultDeps, { fetchImpl: async () => ({ ok: true, json: async () => ({}) }) });
      const req = mockRequest('https://x/api/contact', { method: 'POST', body: JSON.stringify({ name: 'Bot', email: 'not-an-email', message: 'hi' }) });
      const res = await W.handleContactForm(req, testEnv, deps);
      assert('malformed email returns 400', res.status === 400, res.status);
    }

    // Honeypot filled in -> silent fake success, Resend never called
    {
      const kv = makeMockKV();
      const testEnv = Object.assign({}, env2, { ENTITLEMENTS: kv });
      let fetchCalled = false;
      const deps = Object.assign({}, W.defaultDeps, { fetchImpl: async () => { fetchCalled = true; return { ok: true, json: async () => ({}) }; } });
      const req = mockRequest('https://x/api/contact', {
        method: 'POST',
        body: JSON.stringify({ name: 'Bot', email: 'bot@example.com', message: 'spam', website: 'http://spam.example' }),
      });
      const res = await W.handleContactForm(req, testEnv, deps);
      const body = await res.json();
      assert('honeypot-filled request still returns 200 (fake success)', res.status === 200, res.status);
      assert('honeypot-filled request reports ok:true', body.ok === true, body);
      assert('honeypot-filled request never actually calls Resend', fetchCalled === false, fetchCalled);
    }

    // Rate limit — 6th submission from the same IP in one day is rejected
    {
      const kv = makeMockKV();
      const testEnv = Object.assign({}, env2, { ENTITLEMENTS: kv });
      const deps = Object.assign({}, W.defaultDeps, { fetchImpl: async () => ({ ok: true, json: async () => ({}) }) });
      let lastStatus = null;
      for (let i = 0; i < 6; i++) {
        const req = mockRequest('https://x/api/contact', {
          method: 'POST',
          headers: { 'CF-Connecting-IP': '203.0.113.7' },
          body: JSON.stringify({ name: 'Ada', email: 'ada@example.com', message: 'msg ' + i }),
        });
        const res = await W.handleContactForm(req, testEnv, deps);
        lastStatus = res.status;
      }
      assert('6th submission from the same IP in one day is rate-limited (429)', lastStatus === 429, lastStatus);
    }

    // No API key configured -> 503, not a silent failure or a crash
    {
      const kv = makeMockKV();
      const testEnv = Object.assign({}, env, { ENTITLEMENTS: kv }); // env WITHOUT RESEND_API_KEY
      const deps = Object.assign({}, W.defaultDeps, { fetchImpl: async () => ({ ok: true, json: async () => ({}) }) });
      const req = mockRequest('https://x/api/contact', { method: 'POST', body: JSON.stringify({ name: 'Ada', email: 'ada@example.com', message: 'hi' }) });
      const res = await W.handleContactForm(req, testEnv, deps);
      assert('missing RESEND_API_KEY returns 503, not a crash', res.status === 503, res.status);
    }

    // Resend itself errors -> 502, surfaced to the caller
    {
      const kv = makeMockKV();
      const testEnv = Object.assign({}, env2, { ENTITLEMENTS: kv });
      const deps = Object.assign({}, W.defaultDeps, { fetchImpl: async () => ({ ok: false, status: 422, json: async () => ({ message: 'invalid from address' }) }) });
      const req = mockRequest('https://x/api/contact', { method: 'POST', body: JSON.stringify({ name: 'Ada', email: 'ada@example.com', message: 'hi' }) });
      const res = await W.handleContactForm(req, testEnv, deps);
      const body = await res.json();
      assert('a failed Resend call surfaces as 502', res.status === 502, res.status);
      assert('the error message is passed through', body.error.includes('invalid from address'), body.error);
    }
  }

  // ---------------- /api/notify-me ----------------
  {
    const env2 = Object.assign({}, env, { RESEND_API_KEY: 're_test_fake' });

    // Valid submission -> lead stored in KV, Resend notified
    {
      const kv = makeMockKV();
      const testEnv = Object.assign({}, env2, { ENTITLEMENTS: kv });
      let capturedUrl = null, capturedBody = null;
      const fakeFetch = async (url, opts) => {
        capturedUrl = url;
        capturedBody = JSON.parse(opts.body);
        return { ok: true, json: async () => ({ id: 'email_123' }) };
      };
      const deps = Object.assign({}, W.defaultDeps, { fetchImpl: fakeFetch });
      const req = mockRequest('https://x/api/notify-me', {
        method: 'POST',
        body: JSON.stringify({ email: 'ada@example.com', landing_path: 'blog/what-is-json-schema' }),
      });
      const res = await W.handleNotifyMe(req, testEnv, deps);
      const body = await res.json();
      assert('valid submission returns 200', res.status === 200, res.status);
      assert('valid submission returns ok:true', body.ok === true, body);
      assert('calls the real Resend endpoint', capturedUrl === 'https://api.resend.com/emails', capturedUrl);
      assert('notification email mentions the captured address', capturedBody.text.includes('ada@example.com'), capturedBody.text);
      assert('notification email includes the landing page', capturedBody.text.includes('blog/what-is-json-schema'), capturedBody.text);
      const stored = await kv.get('lead:ada@example.com');
      const storedData = JSON.parse(stored);
      assert('the lead is durably stored in KV, keyed by email', storedData.email === 'ada@example.com', storedData);
      assert('the stored lead records the landing page', storedData.landing_path === 'blog/what-is-json-schema', storedData);
    }

    // Missing email -> 400, nothing stored, Resend never called
    {
      const kv = makeMockKV();
      const testEnv = Object.assign({}, env2, { ENTITLEMENTS: kv });
      let fetchCalled = false;
      const deps = Object.assign({}, W.defaultDeps, { fetchImpl: async () => { fetchCalled = true; return { ok: true, json: async () => ({}) }; } });
      const req = mockRequest('https://x/api/notify-me', { method: 'POST', body: JSON.stringify({ email: '' }) });
      const res = await W.handleNotifyMe(req, testEnv, deps);
      assert('missing email returns 400', res.status === 400, res.status);
      assert('does not call Resend when validation fails', fetchCalled === false, fetchCalled);
    }

    // Invalid email format -> 400
    {
      const kv = makeMockKV();
      const testEnv = Object.assign({}, env2, { ENTITLEMENTS: kv });
      const deps = Object.assign({}, W.defaultDeps, { fetchImpl: async () => ({ ok: true, json: async () => ({}) }) });
      const req = mockRequest('https://x/api/notify-me', { method: 'POST', body: JSON.stringify({ email: 'not-an-email' }) });
      const res = await W.handleNotifyMe(req, testEnv, deps);
      assert('malformed email returns 400', res.status === 400, res.status);
    }

    // Honeypot filled in -> silent fake success, nothing stored, Resend never called
    {
      const kv = makeMockKV();
      const testEnv = Object.assign({}, env2, { ENTITLEMENTS: kv });
      let fetchCalled = false;
      const deps = Object.assign({}, W.defaultDeps, { fetchImpl: async () => { fetchCalled = true; return { ok: true, json: async () => ({}) }; } });
      const req = mockRequest('https://x/api/notify-me', {
        method: 'POST',
        body: JSON.stringify({ email: 'bot@example.com', website: 'http://spam.example' }),
      });
      const res = await W.handleNotifyMe(req, testEnv, deps);
      const body = await res.json();
      assert('honeypot-filled request still returns 200 (fake success)', res.status === 200, res.status);
      assert('honeypot-filled request reports ok:true', body.ok === true, body);
      assert('honeypot-filled request never actually calls Resend', fetchCalled === false, fetchCalled);
      const stored = await kv.get('lead:bot@example.com');
      assert('honeypot-filled request never stores a lead', stored === null, stored);
    }

    // Rate limit — 6th submission from the same IP in one day is rejected
    {
      const kv = makeMockKV();
      const testEnv = Object.assign({}, env2, { ENTITLEMENTS: kv });
      const deps = Object.assign({}, W.defaultDeps, { fetchImpl: async () => ({ ok: true, json: async () => ({}) }) });
      let lastStatus = null;
      for (let i = 0; i < 6; i++) {
        const req = mockRequest('https://x/api/notify-me', {
          method: 'POST',
          headers: { 'CF-Connecting-IP': '203.0.113.9' },
          body: JSON.stringify({ email: 'ada+' + i + '@example.com' }),
        });
        const res = await W.handleNotifyMe(req, testEnv, deps);
        lastStatus = res.status;
      }
      assert('6th submission from the same IP in one day is rate-limited (429)', lastStatus === 429, lastStatus);
    }

    // No Resend API key configured -> still succeeds; the lead itself must
    // not be lost just because the (best-effort) notification email can't
    // be sent. This is a deliberate behavioral difference from the contact
    // form, which has no persistence layer of its own to fall back on.
    {
      const kv = makeMockKV();
      const testEnv = Object.assign({}, env, { ENTITLEMENTS: kv }); // env WITHOUT RESEND_API_KEY
      const deps = Object.assign({}, W.defaultDeps, { fetchImpl: async () => ({ ok: true, json: async () => ({}) }) });
      const req = mockRequest('https://x/api/notify-me', { method: 'POST', body: JSON.stringify({ email: 'ada@example.com' }) });
      const res = await W.handleNotifyMe(req, testEnv, deps);
      const body = await res.json();
      assert('missing RESEND_API_KEY still returns 200 — the lead is not lost', res.status === 200, res.status);
      assert('missing RESEND_API_KEY still reports ok:true', body.ok === true, body);
      const stored = await kv.get('lead:ada@example.com');
      assert('the lead is still stored in KV even without an email notification', stored !== null, stored);
    }
  }

  // ---------------- wrangler.jsonc / worker.js drift check ----------------
  // The directory-index rewrite above only ever runs if Cloudflare's asset
  // server actually falls through to the Worker for these paths in the first
  // place. That fallthrough is NOT guaranteed by default — it depends on
  // wrangler.jsonc's assets.run_worker_first list. This bit in production
  // once already: DIRECTORY_INDEX_PATHS here was correct and fully tested,
  // but run_worker_first didn't explicitly list these paths, so Cloudflare's
  // own asset matching could resolve "/" before the Worker ever ran,
  // silently skipping the rewrite — a 404 no test above could catch, since
  // every test here calls Worker.fetch() directly and never exercises
  // Cloudflare's own asset-routing layer at all. This test cross-checks the
  // two files against each other so that gap can't reopen silently again.
  {
    const configPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'wrangler.jsonc');
    const configText = readFileSync(configPath, 'utf8');

    // Minimal, string-aware JSONC comment stripper — must not treat "//"
    // inside a string value (e.g. "https://tryrecast.app/") as a comment.
    function stripJsonComments(text) {
      let result = '', inString = false, i = 0;
      while (i < text.length) {
        const ch = text[i];
        if (inString) {
          result += ch;
          if (ch === '\\') { result += text[i + 1] || ''; i += 2; continue; }
          if (ch === '"') inString = false;
          i++; continue;
        }
        if (ch === '"') { inString = true; result += ch; i++; continue; }
        if (ch === '/' && text[i + 1] === '/') { while (i < text.length && text[i] !== '\n') i++; continue; }
        result += ch; i++;
      }
      return result;
    }

    let config;
    try {
      config = JSON.parse(stripJsonComments(configText));
    } catch (e) {
      assert('wrangler.jsonc parses as valid JSON (after stripping // comments)', false, e.message);
      config = null;
    }

    if (config) {
      assert('assets.html_handling is "none"', config.assets && config.assets.html_handling === 'none', config.assets && config.assets.html_handling);
      const runWorkerFirst = (config.assets && config.assets.run_worker_first) || [];
      const directoryIndexKeys = Object.keys(W.DIRECTORY_INDEX_PATHS || {});
      assert('DIRECTORY_INDEX_PATHS is exported for this cross-check', directoryIndexKeys.length > 0, directoryIndexKeys);
      // A key is covered either by an exact entry, or by a wildcard entry
      // that prefixes it (e.g. "/api/*" covers both "/api" and "/api/" —
      // confirmed directly against wrangler's own deploy-time validation,
      // which rejects an exact "/api/" entry as redundant once "/api/*" is
      // already present, so an exact-string-only check here would demand a
      // config wrangler itself refuses to accept).
      function isCovered(key) {
        if (runWorkerFirst.includes(key)) return true;
        return runWorkerFirst.some((entry) => {
          if (!entry.endsWith('/*')) return false;
          const prefix = entry.slice(0, -1); // "/api/*" -> "/api/"
          return key === prefix || key === prefix.slice(0, -1) || key.startsWith(prefix);
        });
      }
      const missing = directoryIndexKeys.filter((k) => !isCovered(k));
      assert(
        'every DIRECTORY_INDEX_PATHS key is covered by assets.run_worker_first (exactly or via a wildcard), so the Worker is guaranteed to run for it',
        missing.length === 0,
        missing
      );
    }
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
