/*!
 * Recast entitlements Worker.
 *
 * Routes:
 *   GET  /api/verify-session?session_id=...  — called once after Stripe
 *        Checkout redirects back. Confirms payment with Stripe directly
 *        (server-side, using the secret key) and issues an access token.
 *   GET  /api/verify-token?token=...         — called on page load / on an
 *        interval to re-check current entitlement. This is what actually
 *        catches a cancellation — nothing is trusted forever.
 *   POST /api/webhook                        — Stripe calls this on
 *        subscription changes. Signature-verified.
 *   POST /api/portal   { token }             — generates a real-time Stripe
 *        Billing Portal link for the token's customer.
 *
 *   POST /v1/convert   { mode, input, options } — the same access token
 *        issued at checkout doubles as the API key. Requires the API plan
 *        specifically (not just any Pro entitlement). Rate-limited to
 *        10,000 calls/month per the pricing page's promise, tracked in KV.
 *   POST /v1/diff      { mode, inputA, inputB, options }
 *   POST /v1/schema    { input, options }
 *   All three: Authorization: Bearer <token>
 *
 * Everything else falls through to the static site (env.ASSETS).
 */
import { verifyStripeSignature } from './stripe-verify.js';
import { issueToken, lookupToken, setCustomerStatus, isEntitled } from './entitlements.js';
import * as Engine from './engine.js';

const STRIPE_API = 'https://api.stripe.com/v1';
const DAY_PASS_DURATION_MS = 24 * 60 * 60 * 1000; // one-time pass window: 24 hours
const API_MONTHLY_CALL_LIMIT = 10000; // matches the pricing page's promise

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Resolves a secret regardless of how it's bound. Cloudflare's dashboard
 * currently pushes new bindings toward "Secrets Store" (an object with an
 * async .get() method) rather than a plain string env var, so this handles
 * both shapes without needing to know in advance which one was used.
 */
async function resolveSecret(binding) {
  if (binding == null) return binding;
  if (typeof binding === 'string') return binding;
  if (typeof binding.get === 'function') return binding.get();
  return binding;
}

function planFromPriceId(priceId, env) {
  // env.PRICE_MAP is a JSON string set as a Worker variable, e.g.:
  //   {"price_1ABC...":"pro_monthly","price_1DEF...":"pro_yearly", ...}
  // Fill this in with your real Stripe Price IDs after creating products.
  try {
    const map = JSON.parse(env.PRICE_MAP || '{}');
    return map[priceId] || 'unknown';
  } catch (e) {
    return 'unknown';
  }
}

async function stripeGet(path, env, fetchImpl) {
  const doFetch = fetchImpl || fetch;
  const secretKey = await resolveSecret(env.STRIPE_SECRET_KEY);
  const res = await doFetch(STRIPE_API + path, {
    headers: { Authorization: 'Bearer ' + secretKey },
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data.error && data.error.message) || 'Stripe API error');
  return data;
}

async function stripePost(path, params, env, fetchImpl) {
  const doFetch = fetchImpl || fetch;
  const secretKey = await resolveSecret(env.STRIPE_SECRET_KEY);
  const body = new URLSearchParams(params).toString();
  const res = await doFetch(STRIPE_API + path, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + secretKey,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data.error && data.error.message) || 'Stripe API error');
  return data;
}

async function handleVerifySession(request, env, deps) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');
  if (!sessionId) return json({ error: 'missing session_id' }, 400);

  let session;
  try {
    // line_items is needed alongside subscription because a one-time pass
    // (e.g. a 24-hour Pro pass) has no subscription object at all — its
    // price ID only shows up in the line items.
    session = await stripeGet('/checkout/sessions/' + sessionId + '?expand[]=subscription&expand[]=line_items', env, deps.fetchImpl);
  } catch (e) {
    return json({ error: 'could not verify session: ' + e.message }, 502);
  }

  if (session.payment_status !== 'paid' && session.status !== 'complete') {
    return json({ error: 'payment not completed' }, 402);
  }

  const sub = session.subscription;
  let priceId, status, expiresAt;

  if (sub) {
    // Ongoing subscription — no fixed expiry, status is kept current by webhooks.
    priceId = sub.items && sub.items.data && sub.items.data[0] && sub.items.data[0].price && sub.items.data[0].price.id;
    status = sub.status;
    expiresAt = null;
  } else {
    // One-time payment (e.g. a day pass) — no subscription object exists at
    // all, so the price comes from the line items instead, and the pass
    // gets a fixed expiry rather than an ongoing status webhooks would update.
    const lineItems = session.line_items && session.line_items.data;
    priceId = lineItems && lineItems[0] && lineItems[0].price && lineItems[0].price.id;
    status = 'active';
    expiresAt = Date.now() + DAY_PASS_DURATION_MS;
  }

  const plan = planFromPriceId(priceId, env);
  // A one-time Payment Link doesn't always create a real Stripe Customer
  // object (depends on the link's "customer creation" setting) — fall back
  // to the Checkout Session's own ID as the storage key in that case, since
  // a day pass doesn't need an ongoing customer relationship anyway.
  const customerId = session.customer || session.id;

  const token = await deps.issueToken(env.ENTITLEMENTS, customerId, plan, status, expiresAt);
  return json({ token: token, plan: plan, status: status, expiresAt: expiresAt, entitled: deps.isEntitled(status, expiresAt) });
}

async function handleVerifyToken(request, env, deps) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (!token) return json({ error: 'missing token' }, 400);
  const rec = await deps.lookupToken(env.ENTITLEMENTS, token);
  if (!rec) return json({ entitled: false, plan: null, status: null, expiresAt: null });
  return json({ entitled: deps.isEntitled(rec.status, rec.expiresAt), plan: rec.plan, status: rec.status, expiresAt: rec.expiresAt || null });
}

async function handleWebhook(request, env, deps) {
  const rawBody = await request.text();
  const sig = request.headers.get('Stripe-Signature');
  try {
    const webhookSecret = await resolveSecret(env.STRIPE_WEBHOOK_SECRET);
    await deps.verifyStripeSignature(rawBody, sig, webhookSecret);
  } catch (e) {
    return json({ error: 'invalid signature: ' + e.message }, 400);
  }

  let event;
  try { event = JSON.parse(rawBody); } catch (e) { return json({ error: 'invalid JSON payload' }, 400); }
  const obj = event.data && event.data.object;

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const customerId = obj.customer;
    const priceId = obj.items && obj.items.data && obj.items.data[0] && obj.items.data[0].price && obj.items.data[0].price.id;
    const plan = planFromPriceId(priceId, env);
    const status = event.type === 'customer.subscription.deleted' ? 'canceled' : obj.status;
    await deps.setCustomerStatus(env.ENTITLEMENTS, customerId, plan, status);
  }
  // checkout.session.completed is intentionally not handled here — entitlement
  // is granted via /api/verify-session, called directly by the frontend right
  // after redirect. This event still arrives and could be logged for an audit
  // trail, but isn't needed for the enforcement logic itself.

  return json({ received: true });
}

// ---------------- Contact form (/api/contact) ----------------
// Sends via the Resend API (https://resend.com) — chosen because MailChannels'
// free, no-signup email API for Cloudflare Workers was shut down in August
// 2024 (it required zero setup; nothing free and setup-free has replaced it
// since). Resend's free tier covers this site's contact-form volume many
// times over. Requires RESEND_API_KEY as a secret — see wrangler.jsonc.
const CONTACT_TO_EMAIL = 'contact@tryrecast.app';
const CONTACT_RATE_LIMIT_PER_DAY = 5; // per IP — generous for a real visitor, tight for a script

function isValidEmail(email) {
  // Deliberately simple — this only needs to reject obvious junk before an
  // API call, not fully validate RFC 5322. Resend's own send will be the
  // real check.
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

async function handleContactForm(request, env, deps) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'invalid JSON body' }, 400); }

  // Honeypot — a field real visitors never see or fill in (hidden via CSS
  // in the form), so anything that arrives with it populated is a bot.
  // Reply with a fake success rather than a 4xx, so the bot doesn't learn
  // to route around it.
  if (body && body.website) return json({ ok: true });

  const name = (body && body.name || '').trim();
  const email = (body && body.email || '').trim();
  const company = (body && body.company || '').trim();
  const topic = (body && body.topic || 'General question').trim();
  const message = (body && body.message || '').trim();

  if (!name || !email || !message) return json({ error: 'name, email, and message are required' }, 400);
  if (name.length > 200 || email.length > 200 || company.length > 200 || message.length > 5000) {
    return json({ error: 'one of the fields is too long' }, 400);
  }
  if (!isValidEmail(email)) return json({ error: 'that email address doesn\'t look right' }, 400);

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const day = new Date().toISOString().slice(0, 10);
  const rateKey = 'contact-rate:' + ip + ':' + day;
  const rateRaw = await env.ENTITLEMENTS.get(rateKey);
  const rateCount = rateRaw ? parseInt(rateRaw, 10) : 0;
  if (rateCount >= CONTACT_RATE_LIMIT_PER_DAY) {
    return json({ error: 'too many messages sent today — try again tomorrow, or email ' + CONTACT_TO_EMAIL + ' directly' }, 429);
  }

  const apiKey = await resolveSecret(env.RESEND_API_KEY);
  if (!apiKey) return json({ error: 'contact form is not configured yet — email ' + CONTACT_TO_EMAIL + ' directly' }, 503);

  const textBody = 'Name: ' + name + '\n'
    + (company ? 'Company: ' + company + '\n' : '')
    + 'Email: ' + email + '\n'
    + 'Topic: ' + topic + '\n\n'
    + message;
  const htmlBody = '<p><strong>Name:</strong> ' + escapeHtml(name) + '</p>'
    + (company ? '<p><strong>Company:</strong> ' + escapeHtml(company) + '</p>' : '')
    + '<p><strong>Email:</strong> ' + escapeHtml(email) + '</p>'
    + '<p><strong>Topic:</strong> ' + escapeHtml(topic) + '</p>'
    + '<p>' + escapeHtml(message).replace(/\n/g, '<br>') + '</p>';

  try {
    const doFetch = deps.fetchImpl || fetch;
    const res = await doFetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Recast Contact Form <contact@tryrecast.app>',
        to: [CONTACT_TO_EMAIL],
        reply_to: email,
        subject: 'Recast contact: ' + topic + ' — from ' + name,
        text: textBody,
        html: htmlBody,
      }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(function () { return {}; });
      return json({ error: 'message could not be sent: ' + (errData.message || res.status) }, 502);
    }
  } catch (e) {
    return json({ error: 'message could not be sent: ' + e.message }, 502);
  }

  await env.ENTITLEMENTS.put(rateKey, String(rateCount + 1), { expirationTtl: 60 * 60 * 24 * 2 });
  return json({ ok: true });
}

async function handlePortal(request, env, deps) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'invalid JSON body' }, 400); }
  const rec = body && body.token ? await deps.lookupToken(env.ENTITLEMENTS, body.token) : null;
  if (!rec) return json({ error: 'invalid or expired token' }, 401);
  try {
    const portalSession = await stripePost('/billing_portal/sessions', {
      customer: rec.customerId,
      return_url: env.SITE_URL || 'https://tryrecast.app/',
    }, env, deps.fetchImpl);
    return json({ url: portalSession.url });
  } catch (e) {
    return json({ error: 'could not create portal session: ' + e.message }, 502);
  }
}

// ---------------- Public REST API (/v1/*) ----------------
// The same access token issued at checkout doubles as the API key — no
// separate key-management system needed. Requires the API plan
// specifically, not just any Pro entitlement (Pro/day-pass tokens are
// rejected with 403, matching what the pricing page actually promises).

async function authenticateApiToken(request, env, deps) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.indexOf('Bearer ') === 0 ? authHeader.slice(7).trim() : null;
  if (!token) return { error: json({ error: 'missing Authorization: Bearer <token> header' }, 401) };
  const rec = await deps.lookupToken(env.ENTITLEMENTS, token);
  if (!rec || !deps.isEntitled(rec.status, rec.expiresAt)) return { error: json({ error: 'invalid or expired token' }, 401) };
  if (rec.plan !== 'api_monthly' && rec.plan !== 'api_yearly') {
    return { error: json({ error: 'this token is not on the API plan — see https://tryrecast.app/#pricing' }, 403) };
  }
  return { rec: rec };
}

async function checkAndIncrementUsage(kv, customerId, limit) {
  const period = new Date().toISOString().slice(0, 7); // "2026-08" — resets naturally each calendar month
  const key = 'usage:' + customerId + ':' + period;
  const raw = await kv.get(key);
  const count = raw ? parseInt(raw, 10) : 0;
  if (count >= limit) return { ok: false, count: count, limit: limit };
  await kv.put(key, String(count + 1));
  return { ok: true, count: count + 1, limit: limit };
}

async function handleApiConvert(request, env, deps) {
  const auth = await deps.authenticateApiToken(request, env, deps);
  if (auth.error) return auth.error;
  const usage = await deps.checkAndIncrementUsage(env.ENTITLEMENTS, auth.rec.customerId, API_MONTHLY_CALL_LIMIT);
  if (!usage.ok) return json({ error: 'monthly API limit reached (' + usage.limit + ' calls) — resets next calendar month' }, 429);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'invalid JSON body' }, 400); }
  const mode = body && body.mode, input = body && body.input, options = (body && body.options) || {};
  if (typeof input !== 'string') return json({ error: 'missing "input" (must be a string)' }, 400);

  try {
    let output;
    switch (mode) {
      case 'json2csv': output = Engine.jsonToCsv(JSON.parse(input), options); break;
      case 'csv2json': output = JSON.stringify(Engine.csvToJson(input, options), null, options.pretty === false ? 0 : 2); break;
      case 'json2xml': output = Engine.jsonToXml(JSON.parse(input), 'root'); break;
      case 'xml2json': output = JSON.stringify(Engine.xmlToJson(input), null, options.pretty === false ? 0 : 2); break;
      case 'flatten': output = JSON.stringify(Engine.flattenObj(JSON.parse(input)), null, options.pretty === false ? 0 : 2); break;
      case 'unflatten': output = JSON.stringify(Engine.unflattenObj(JSON.parse(input)), null, options.pretty === false ? 0 : 2); break;
      case 'json2yaml': output = Engine.jsonToYaml(JSON.parse(input)); break;
      case 'yaml2json': output = JSON.stringify(Engine.yamlToJson(input), null, options.pretty === false ? 0 : 2); break;
      case 'json2markdown': output = Engine.jsonToMarkdownTable(JSON.parse(input)); break;
      case 'markdown2json': output = JSON.stringify(Engine.markdownTableToJson(input, options), null, options.pretty === false ? 0 : 2); break;
      default: return json({ error: 'unknown mode: "' + mode + '" — expected one of json2csv, csv2json, json2xml, xml2json, flatten, unflatten, json2yaml, yaml2json, json2markdown, markdown2json' }, 400);
    }
    return json({ output: output, usage: { calls_this_month: usage.count, limit: usage.limit } });
  } catch (e) {
    return json({ error: e.message || String(e) }, 400);
  }
}

async function handleApiDiff(request, env, deps) {
  const auth = await deps.authenticateApiToken(request, env, deps);
  if (auth.error) return auth.error;
  const usage = await deps.checkAndIncrementUsage(env.ENTITLEMENTS, auth.rec.customerId, API_MONTHLY_CALL_LIMIT);
  if (!usage.ok) return json({ error: 'monthly API limit reached (' + usage.limit + ' calls) — resets next calendar month' }, 429);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'invalid JSON body' }, 400); }
  const mode = body && body.mode, inputA = body && body.inputA, inputB = body && body.inputB, options = (body && body.options) || {};
  if (typeof inputA !== 'string' || typeof inputB !== 'string') return json({ error: 'missing "inputA"/"inputB" (must both be strings)' }, 400);

  try {
    let result;
    if (mode === 'diffCsv') {
      result = Engine.csvDiff(inputA, inputB, options);
    } else if (mode === 'diffJson') {
      result = Engine.deepDiff(JSON.parse(inputA), JSON.parse(inputB));
    } else if (mode === 'diffXml') {
      result = Engine.deepDiff(Engine.xmlToJson(inputA), Engine.xmlToJson(inputB));
    } else {
      return json({ error: 'unknown mode: "' + mode + '" — expected one of diffCsv, diffJson, diffXml' }, 400);
    }
    return json({ result: result, usage: { calls_this_month: usage.count, limit: usage.limit } });
  } catch (e) {
    return json({ error: e.message || String(e) }, 400);
  }
}

async function handleApiSchema(request, env, deps) {
  const auth = await deps.authenticateApiToken(request, env, deps);
  if (auth.error) return auth.error;
  const usage = await deps.checkAndIncrementUsage(env.ENTITLEMENTS, auth.rec.customerId, API_MONTHLY_CALL_LIMIT);
  if (!usage.ok) return json({ error: 'monthly API limit reached (' + usage.limit + ' calls) — resets next calendar month' }, 429);

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'invalid JSON body' }, 400); }
  const input = body && body.input, options = (body && body.options) || {};
  if (typeof input !== 'string') return json({ error: 'missing "input" (must be a string)' }, 400);

  try {
    const schema = Engine.jsonSchemaFromSample(JSON.parse(input), options);
    return json({ schema: schema, usage: { calls_this_month: usage.count, limit: usage.limit } });
  } catch (e) {
    return json({ error: e.message || String(e) }, 400);
  }
}

const defaultDeps = {
  issueToken: issueToken,
  lookupToken: lookupToken,
  setCustomerStatus: setCustomerStatus,
  isEntitled: isEntitled,
  verifyStripeSignature: verifyStripeSignature,
  authenticateApiToken: authenticateApiToken,
  checkAndIncrementUsage: checkAndIncrementUsage,
  fetchImpl: undefined,
};

async function route(request, env, deps) {
  const url = new URL(request.url);
  if (url.pathname === '/api/verify-session' && request.method === 'GET') return handleVerifySession(request, env, deps);
  if (url.pathname === '/api/verify-token' && request.method === 'GET') return handleVerifyToken(request, env, deps);
  if (url.pathname === '/api/webhook' && request.method === 'POST') return handleWebhook(request, env, deps);
  if (url.pathname === '/api/portal' && request.method === 'POST') return handlePortal(request, env, deps);
  if (url.pathname === '/api/contact' && request.method === 'POST') return handleContactForm(request, env, deps);
  if (url.pathname === '/v1/convert' && request.method === 'POST') return handleApiConvert(request, env, deps);
  if (url.pathname === '/v1/diff' && request.method === 'POST') return handleApiDiff(request, env, deps);
  if (url.pathname === '/v1/schema' && request.method === 'POST') return handleApiSchema(request, env, deps);
  return null;
}

// Paths that need to resolve to a directory's index.html. Necessary
// because assets.html_handling is set to "none" (deliberately, to avoid a
// redirect-plus-service-worker interaction that previously caused
// ERR_FAILED on direct /index.html navigation — see the "none" config in
// wrangler.jsonc) — but per Cloudflare's own documented behavior, "none"
// also disables the automatic directory-index resolution that
// "auto-trailing-slash" would otherwise provide for free. Rewriting these
// specific paths here restores that behavior without reintroducing the
// redirect (this fetches and returns the index.html content directly; the
// browser's address bar is never touched, so no redirect ever occurs).
const DIRECTORY_INDEX_PATHS = {
  '/': '/index.html',
  '/blog': '/blog/index.html',
  '/blog/': '/blog/index.html',
  '/how-to': '/how-to/index.html',
  '/how-to/': '/how-to/index.html',
  '/demo': '/demo/index.html',
  '/demo/': '/demo/index.html',
};

export default {
  async fetch(request, env, ctx) {
    const apiResponse = await route(request, env, defaultDeps);
    if (apiResponse) return apiResponse;

    const url = new URL(request.url);
    const indexPath = DIRECTORY_INDEX_PATHS[url.pathname];
    if (indexPath) {
      const rewritten = new URL(url);
      rewritten.pathname = indexPath;
      return env.ASSETS.fetch(new Request(rewritten, request));
    }

    return env.ASSETS.fetch(request);
  },
};

export { route, handleVerifySession, handleVerifyToken, handleWebhook, handlePortal, handleContactForm, handleApiConvert, handleApiDiff, handleApiSchema, authenticateApiToken, checkAndIncrementUsage, planFromPriceId, defaultDeps, DIRECTORY_INDEX_PATHS };
