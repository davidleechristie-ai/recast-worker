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
import { validateWorkflowDefinition, executeWorkflow, MAX_WORKFLOW_INPUT_BYTES } from './workflow-executor.js';

const STRIPE_API = 'https://api.stripe.com/v1';
const DAY_PASS_DURATION_MS = 24 * 60 * 60 * 1000; // one-time pass window: 24 hours
const API_MONTHLY_CALL_LIMIT = 10000; // matches the pricing page's promise
const AUTOMATION_MONTHLY_RUN_LIMIT = 1000;
const AUTOMATION_ACTIVE_WORKFLOW_LIMIT = 10;
const API_PLANS = new Set(['api_monthly','api_yearly']);
const AUTOMATION_PLANS = new Set(['automation_monthly','automation_yearly']);
function canUseApiPlan(plan) { return API_PLANS.has(plan) || AUTOMATION_PLANS.has(plan); }
function canUseAutomationPlan(plan) { return AUTOMATION_PLANS.has(plan); }

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

// ---------------- Notify-me capture (/api/notify-me) ----------------
// A narrow, opt-in lead capture — NOT a site-wide popup, which would
// contradict the "no accounts, no tracking" positioning this product is
// actually built on. This exists specifically for the pricing section: a
// visitor who isn't ready to pay today currently has no way back once they
// leave. Stores the email + how they landed here, so it isn't lost — but
// deliberately doesn't create an account, entitlement, or any tracking
// beyond this one record. Reuses the contact form's exact rate-limit and
// validation pattern rather than a new one.
const NOTIFY_TO_EMAIL = 'contact@tryrecast.app';
const NOTIFY_RATE_LIMIT_PER_DAY = 5; // per IP — same generous-but-bounded limit as the contact form

async function handleNotifyMe(request, env, deps) {
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'invalid JSON body' }, 400); }

  // Honeypot — same pattern as the contact form.
  if (body && body.website) return json({ ok: true });

  const email = (body && body.email || '').trim();
  const landingPath = (body && body.landing_path || '').trim().slice(0, 200);

  if (!email) return json({ error: 'email is required' }, 400);
  if (email.length > 200) return json({ error: 'that email address is too long' }, 400);
  if (!isValidEmail(email)) return json({ error: 'that email address doesn\'t look right' }, 400);

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const day = new Date().toISOString().slice(0, 10);
  const rateKey = 'notify-rate:' + ip + ':' + day;
  const rateRaw = await env.ENTITLEMENTS.get(rateKey);
  const rateCount = rateRaw ? parseInt(rateRaw, 10) : 0;
  if (rateCount >= NOTIFY_RATE_LIMIT_PER_DAY) {
    return json({ error: 'too many requests today — try again tomorrow' }, 429);
  }

  // Store the lead itself, keyed by email so a repeat signup updates the
  // record rather than creating duplicates. No expiry — this is a lead
  // list, not a cache.
  const leadKey = 'lead:' + email.toLowerCase();
  await env.ENTITLEMENTS.put(leadKey, JSON.stringify({
    email: email,
    landing_path: landingPath || null,
    capturedAt: new Date().toISOString(),
  }));

  // Best-effort notification email — the lead is already durably saved in
  // KV above, so if Resend isn't configured or the send fails, that's not
  // a reason to fail the whole request back to the visitor.
  const apiKey = await resolveSecret(env.RESEND_API_KEY);
  if (apiKey) {
    try {
      const doFetch = deps.fetchImpl || fetch;
      await doFetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Recast Leads <contact@tryrecast.app>',
          to: [NOTIFY_TO_EMAIL],
          subject: 'New notify-me signup: ' + email,
          text: 'Email: ' + email + '\nLanding page: ' + (landingPath || '(not set)'),
        }),
      });
    } catch (e) { /* lead is already saved in KV; a failed notification email isn't fatal */ }
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
  if (!canUseApiPlan(rec.plan)) {
    return { error: json({ error: 'this token is not on an API or Automation plan — see https://tryrecast.app/#pricing' }, 403) };
  }
  return { rec: rec };
}

async function checkAndIncrementAutomationUsage(kv, customerId, limit) {
  const period = new Date().toISOString().slice(0, 7);
  const key = 'automation-usage:' + customerId + ':' + period;
  const raw = await kv.get(key); const count = raw ? parseInt(raw, 10) : 0;
  if (count >= limit) return { ok: false, count, limit };
  await kv.put(key, String(count + 1));
  return { ok: true, count: count + 1, limit };
}
async function countActiveAutomations(kv, customerId) {
  const listed = await kv.list({ prefix: 'automation:' + customerId + ':', limit: 100 });
  let count = 0;
  for (const k of listed.keys) {
    const raw = await kv.get(k.name); if (!raw) continue;
    try { if (JSON.parse(raw).enabled) count++; } catch (_) {}
  }
  return count;
}
async function handleWorkflowUsage(request, env, deps) {
  const auth = await deps.authenticateApiToken(request, env, deps); if (auth.error) return auth.error;
  const period = new Date().toISOString().slice(0, 7);
  const apiRaw = await env.ENTITLEMENTS.get('usage:' + auth.rec.customerId + ':' + period);
  const autoRaw = await env.ENTITLEMENTS.get('automation-usage:' + auth.rec.customerId + ':' + period);
  const active = await countActiveAutomations(env.ENTITLEMENTS, auth.rec.customerId);
  return json({ plan: auth.rec.plan, period, api: { used: parseInt(apiRaw||'0',10), limit: API_MONTHLY_CALL_LIMIT },
    automation: { enabled: canUseAutomationPlan(auth.rec.plan), runs_used: parseInt(autoRaw||'0',10), runs_limit: AUTOMATION_MONTHLY_RUN_LIMIT, active, active_limit: AUTOMATION_ACTIVE_WORKFLOW_LIMIT } });
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



async function handleWorkflowHealth(request, env, deps) {
  const auth=await deps.authenticateApiToken(request,env,deps);if(auth.error)return auth.error;
  const autoPlan=canUseAutomationPlan(auth.rec.plan);
  let credentialVault=false;
  if(autoPlan){try{await credentialCryptoKey(env);credentialVault=true;}catch(_){}}
  const resend=!!(await resolveSecret(env.RESEND_API_KEY));
  return json({
    ok:true,
    plan:auth.rec.plan,
    entitlement:true,
    services:{
      workflow_storage:!!env.ENTITLEMENTS,
      credential_vault:autoPlan?credentialVault:null,
      failure_email:autoPlan?resend:null,
      automation:autoPlan
    },
    scheduler:{configured:true,resolution:'hourly'},
    limits:{api:API_MONTHLY_CALL_LIMIT,automation_runs:AUTOMATION_MONTHLY_RUN_LIMIT,active_automations:AUTOMATION_ACTIVE_WORKFLOW_LIMIT}
  });
}

// ---------------- Hosted workflows + automation (/v1/workflows/*) ----------------
// Hosted workflow execution is the paid/repeatable counterpart to Recast's
// local-first browser tools. Definitions and automation inputs are stored in
// KV only after an API-plan customer explicitly deploys them.
const WORKFLOW_MAX_PER_CUSTOMER = 50;
const WORKFLOW_HISTORY_LIMIT = 20;

function workflowKey(customerId, id) { return 'workflow:' + customerId + ':' + id; }
function workflowIndexKey(customerId) { return 'workflow-index:' + customerId; }
function automationKey(customerId, id) { return 'automation:' + customerId + ':' + id; }
function runPrefix(customerId, id) { return 'workflow-run:' + customerId + ':' + id + ':'; }
function safeWorkflowId() { return 'wf_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20); }

async function loadWorkflowIndex(kv, customerId) {
  const raw = await kv.get(workflowIndexKey(customerId));
  try { return raw ? JSON.parse(raw) : []; } catch (_) { return []; }
}
async function saveWorkflowIndex(kv, customerId, items) {
  await kv.put(workflowIndexKey(customerId), JSON.stringify(items.slice(0, WORKFLOW_MAX_PER_CUSTOMER)));
}
async function getOwnedWorkflow(kv, customerId, id) {
  const raw = await kv.get(workflowKey(customerId, id));
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (_) { return null; }
}
function publicWorkflow(rec) {
  return { id: rec.id, name: rec.name, steps: rec.steps, createdAt: rec.createdAt, updatedAt: rec.updatedAt, endpoint: '/v1/workflows/' + rec.id + '/run' };
}
async function recordWorkflowRun(kv, customerId, workflowId, data) {
  const ts = Date.now();
  const key = runPrefix(customerId, workflowId) + String(ts).padStart(13, '0') + ':' + crypto.randomUUID().slice(0, 8);
  await kv.put(key, JSON.stringify(Object.assign({ timestamp: ts }, data)), { expirationTtl: 60 * 60 * 24 * 30 });
}
async function executeStoredWorkflow(env, customerId, wf, input, source, deps, options) {
  const opts = options || {};
  let usage = { ok: true, count: null, limit: API_MONTHLY_CALL_LIMIT };
  if (!opts.skipApiUsage) {
    usage = await deps.checkAndIncrementUsage(env.ENTITLEMENTS, customerId, API_MONTHLY_CALL_LIMIT);
    if (!usage.ok) throw Object.assign(new Error('monthly API limit reached (' + usage.limit + ' calls)'), { status: 429 });
  }
  const started = Date.now();
  try {
    const result = executeWorkflow(wf, input);
    if (!opts.skipHistory) await recordWorkflowRun(env.ENTITLEMENTS, customerId, wf.id, { ok: true, source: source || 'api', durationMs: Date.now() - started, stepResults: result.stepResults, outputPreview: result.output.slice(0, 2000) });
    return { result: result, usage: usage, durationMs: Date.now() - started };
  } catch (e) {
    if (!opts.skipHistory) await recordWorkflowRun(env.ENTITLEMENTS, customerId, wf.id, { ok: false, source: source || 'api', durationMs: Date.now() - started, error: e.message || String(e), stepResults: e.stepResults || [] });
    throw e;
  }
}

async function handleWorkflowCreate(request, env, deps) {
  const auth = await deps.authenticateApiToken(request, env, deps); if (auth.error) return auth.error;
  let body; try { body = await request.json(); } catch (_) { return json({ error: 'invalid JSON body' }, 400); }
  const definition = body && (body.workflow || body.definition || body);
  try { validateWorkflowDefinition(definition); } catch (e) { return json({ error: e.message }, 400); }
  const items = await loadWorkflowIndex(env.ENTITLEMENTS, auth.rec.customerId);
  if (items.length >= WORKFLOW_MAX_PER_CUSTOMER) return json({ error: 'workflow limit reached (' + WORKFLOW_MAX_PER_CUSTOMER + ')' }, 409);
  const now = Date.now(), id = safeWorkflowId();
  const rec = { id, customerId: auth.rec.customerId, name: String(definition.name || 'Untitled workflow').slice(0, 120), steps: definition.steps, createdAt: now, updatedAt: now };
  await env.ENTITLEMENTS.put(workflowKey(auth.rec.customerId, id), JSON.stringify(rec));
  items.unshift({ id, name: rec.name, createdAt: now, updatedAt: now }); await saveWorkflowIndex(env.ENTITLEMENTS, auth.rec.customerId, items);
  return json({ workflow: publicWorkflow(rec) }, 201);
}
async function handleWorkflowList(request, env, deps) {
  const auth = await deps.authenticateApiToken(request, env, deps); if (auth.error) return auth.error;
  const items = await loadWorkflowIndex(env.ENTITLEMENTS, auth.rec.customerId);
  return json({ workflows: items.map(x => Object.assign({}, x, { endpoint: '/v1/workflows/' + x.id + '/run' })) });
}
async function handleWorkflowGet(request, env, deps, id) {
  const auth = await deps.authenticateApiToken(request, env, deps); if (auth.error) return auth.error;
  const wf = await getOwnedWorkflow(env.ENTITLEMENTS, auth.rec.customerId, id); if (!wf) return json({ error: 'workflow not found' }, 404);
  const autoRaw = await env.ENTITLEMENTS.get(automationKey(auth.rec.customerId, id));
  let automation = null; try { automation = autoRaw ? JSON.parse(autoRaw) : null; } catch (_) {}
  return json({ workflow: publicWorkflow(wf), automation: automation && { enabled: automation.enabled, cadence: automation.cadence, inputMode: automation.inputMode || 'fixed', inputUrl: automation.inputUrl, outputWebhook: automation.outputWebhook, timeZone: automation.timeZone || 'UTC', hour: automation.hour, weekday: automation.weekday, nextRunAt: automation.nextRunAt, lastAttemptAt: automation.lastAttemptAt, lastSuccessAt: automation.lastSuccessAt, lastFailureAt: automation.lastFailureAt, lastError: automation.lastError } });
}
async function handleWorkflowDelete(request, env, deps, id) {
  const auth = await deps.authenticateApiToken(request, env, deps); if (auth.error) return auth.error;
  const wf = await getOwnedWorkflow(env.ENTITLEMENTS, auth.rec.customerId, id); if (!wf) return json({ error: 'workflow not found' }, 404);
  await env.ENTITLEMENTS.delete(workflowKey(auth.rec.customerId, id)); await env.ENTITLEMENTS.delete(automationKey(auth.rec.customerId, id));
  const items = (await loadWorkflowIndex(env.ENTITLEMENTS, auth.rec.customerId)).filter(x => x.id !== id); await saveWorkflowIndex(env.ENTITLEMENTS, auth.rec.customerId, items);
  return json({ deleted: true });
}
async function handleWorkflowRun(request, env, deps, id) {
  const auth = await deps.authenticateApiToken(request, env, deps); if (auth.error) return auth.error;
  const wf = await getOwnedWorkflow(env.ENTITLEMENTS, auth.rec.customerId, id); if (!wf) return json({ error: 'workflow not found' }, 404);
  let body; try { body = await request.json(); } catch (_) { return json({ error: 'invalid JSON body' }, 400); }
  const input = body && body.input; if (typeof input !== 'string') return json({ error: 'missing "input" (must be a string)' }, 400);
  try {
    const run = await executeStoredWorkflow(env, auth.rec.customerId, wf, input, 'api', deps);
    return json({ workflow_id: id, output: run.result.output, steps: run.result.stepResults, usage: { calls_this_month: run.usage.count, limit: run.usage.limit } });
  } catch (e) { return json({ error: e.message || String(e), steps: e.stepResults || [] }, e.status || 400); }
}

const AUTOMATION_MAX_RETRIES = 3;
const AUTOMATION_FETCH_TIMEOUT_MS = 15000;
const AUTOMATION_MAX_REMOTE_BYTES = MAX_WORKFLOW_INPUT_BYTES;

function validTimeZone(tz) {
  try { new Intl.DateTimeFormat('en-GB', { timeZone: tz || 'UTC' }).format(new Date()); return true; }
  catch (_) { return false; }
}
function zonedParts(ts, timeZone) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(new Date(ts));
  const out = {}; for (const p of parts) if (p.type !== 'literal') out[p.type] = p.value;
  return { weekday: out.weekday, hour: Number(out.hour), minute: Number(out.minute) };
}
function nextRunAt(cadence, now, schedule) {
  const current = now || Date.now();
  if (cadence === 'hourly') return Math.floor(current / 3600000) * 3600000 + 3600000;
  const tz = schedule?.timeZone || 'UTC';
  const hour = Number.isInteger(schedule?.hour) ? schedule.hour : 8;
  const wantedDay = schedule?.weekday || 'Mon';
  // Worker cron runs hourly, so scan hour boundaries until the next matching
  // local hour/day. This avoids storing server-local timezone assumptions.
  let t = Math.floor(current / 3600000) * 3600000 + 3600000;
  const maxHours = cadence === 'weekly' ? 24 * 8 : 48;
  for (let i = 0; i < maxHours; i++, t += 3600000) {
    const p = zonedParts(t, tz);
    if (p.hour === hour && (cadence !== 'weekly' || p.weekday === wantedDay)) return t;
  }
  return current + (cadence === 'weekly' ? 7 : 1) * 24 * 3600000;
}
function isSafeAutomationUrl(value) {
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:') return false;
    const h = u.hostname.toLowerCase();
    if (!h || h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return false;
    // Disallow obvious private/link-local IP literals. Hostnames are fetched
    // through Cloudflare; users should not use this as a private-network proxy.
    if (/^(127\.|10\.|0\.|169\.254\.|192\.168\.)/.test(h)) return false;
    const m = h.match(/^172\.(\d+)\./); if (m && Number(m[1]) >= 16 && Number(m[1]) <= 31) return false;
    if (h === '::1' || h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80:')) return false;
    return true;
  } catch (_) { return false; }
}

function credentialKey(customerId, id) { return 'credential:' + customerId + ':' + id; }
function credentialId() { const b = new Uint8Array(10); crypto.getRandomValues(b); return 'cred_' + Array.from(b,x=>x.toString(16).padStart(2,'0')).join(''); }
async function credentialCryptoKey(env) {
  const secret = await resolveSecret(env.CREDENTIAL_ENCRYPTION_KEY);
  if (!secret || String(secret).length < 32) throw new Error('credential vault is not configured');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(secret)));
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt','decrypt']);
}
function b64bytes(bytes){let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s);}
function unb64bytes(s){const raw=atob(s);return Uint8Array.from(raw,c=>c.charCodeAt(0));}
async function encryptCredential(env, value) {
  const key=await credentialCryptoKey(env), iv=crypto.getRandomValues(new Uint8Array(12));
  const enc=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(value));
  return { v:1, iv:b64bytes(iv), ciphertext:b64bytes(new Uint8Array(enc)) };
}
async function decryptCredential(env, blob) {
  const key=await credentialCryptoKey(env);
  const dec=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64bytes(blob.iv)},key,unb64bytes(blob.ciphertext));
  return new TextDecoder().decode(dec);
}
function credentialAuthHeaders(type, value, headerName) {
  if(type==='bearer') return {Authorization:'Bearer '+value};
  if(type==='api_key') return {[headerName||'X-API-Key']:value};
  return {};
}
async function getOwnedCredential(kv, customerId, id) {
  if(!id)return null; const raw=await kv.get(credentialKey(customerId,id)); if(!raw)return null;
  try{const c=JSON.parse(raw);return c.customerId===customerId?c:null;}catch(_){return null;}
}
async function handleCredentialCreate(request, env, deps) {
  const auth=await deps.authenticateApiToken(request,env,deps);if(auth.error)return auth.error;
  if(!canUseAutomationPlan(auth.rec.plan))return json({error:'Credential vault requires the Automation plan.'},403);
  let body;try{body=await request.json();}catch(_){return json({error:'invalid JSON body'},400);}
  const name=String(body.name||'Credential').trim().slice(0,80), type=body.type;
  const value=String(body.value||''); const headerName=String(body.headerName||'X-API-Key').trim().slice(0,80);
  if(!['bearer','api_key'].includes(type))return json({error:'credential type must be bearer or api_key'},400);
  if(!value||value.length>4096)return json({error:'credential value is required and must be under 4096 characters'},400);
  if(type==='api_key'&&!/^[A-Za-z0-9-]{1,80}$/.test(headerName))return json({error:'invalid API-key header name'},400);
  let encrypted;try{encrypted=await encryptCredential(env,value);}catch(e){return json({error:e.message},503);}
  const id=credentialId(), rec={id,customerId:auth.rec.customerId,name,type,headerName:type==='api_key'?headerName:undefined,encrypted,createdAt:Date.now()};
  await env.ENTITLEMENTS.put(credentialKey(auth.rec.customerId,id),JSON.stringify(rec));
  return json({credential:{id,name,type,headerName:rec.headerName,createdAt:rec.createdAt}},201);
}
async function handleCredentialList(request,env,deps){
  const auth=await deps.authenticateApiToken(request,env,deps);if(auth.error)return auth.error;
  const listed=await env.ENTITLEMENTS.list({prefix:'credential:'+auth.rec.customerId+':',limit:100});const rows=[];
  for(const k of listed.keys){const raw=await env.ENTITLEMENTS.get(k.name);if(!raw)continue;try{const c=JSON.parse(raw);rows.push({id:c.id,name:c.name,type:c.type,headerName:c.headerName,createdAt:c.createdAt});}catch(_){}}
  return json({credentials:rows.sort((a,b)=>b.createdAt-a.createdAt)});
}
async function handleCredentialDelete(request,env,deps,id){
  const auth=await deps.authenticateApiToken(request,env,deps);if(auth.error)return auth.error;
  const c=await getOwnedCredential(env.ENTITLEMENTS,auth.rec.customerId,id);if(!c)return json({error:'credential not found'},404);
  await env.ENTITLEMENTS.delete(credentialKey(auth.rec.customerId,id));return json({deleted:true});
}
async function credentialHeaders(env,customerId,id){
  if(!id)return {};const c=await getOwnedCredential(env.ENTITLEMENTS,customerId,id);if(!c)throw new Error('configured credential was not found');
  const value=await decryptCredential(env,c.encrypted);return credentialAuthHeaders(c.type,value,c.headerName);
}
async function fetchAutomationInput(a, deps) {
  if (a.inputMode !== 'http') return a.input || '';
  if (!isSafeAutomationUrl(a.inputUrl)) throw new Error('unsafe or invalid automation input URL');
  const fetchImpl = deps.fetchImpl || fetch;
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), AUTOMATION_FETCH_TIMEOUT_MS);
  try {
    const authHeaders = await credentialHeaders(deps.env || {}, a.customerId, a.inputCredentialId);
    const r = await fetchImpl(a.inputUrl, { method: 'GET', redirect: 'error', signal: ctrl.signal, headers: Object.assign({ 'Accept': 'application/json,text/plain,text/csv,application/xml,text/xml,*/*' }, authHeaders) });
    if (!r.ok) throw new Error('input fetch failed (' + r.status + ')');
    const declared = Number(r.headers.get('content-length') || 0);
    if (declared > AUTOMATION_MAX_REMOTE_BYTES) throw new Error('remote input exceeds ' + AUTOMATION_MAX_REMOTE_BYTES + ' bytes');
    const body = await r.text();
    if (new TextEncoder().encode(body).length > AUTOMATION_MAX_REMOTE_BYTES) throw new Error('remote input exceeds ' + AUTOMATION_MAX_REMOTE_BYTES + ' bytes');
    return body;
  } finally { clearTimeout(timer); }
}
async function deliverAutomationOutput(a, wf, output, deps) {
  if (!a.outputWebhook) return { delivered: false };
  if (!isSafeAutomationUrl(a.outputWebhook)) throw new Error('unsafe or invalid output webhook URL');
  const fetchImpl = deps.fetchImpl || fetch;
  let lastErr;
  for (let attempt = 1; attempt <= AUTOMATION_MAX_RETRIES; attempt++) {
    const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), AUTOMATION_FETCH_TIMEOUT_MS);
    try {
      const r = await fetchImpl(a.outputWebhook, {
        method: 'POST', redirect: 'error', signal: ctrl.signal,
        headers: Object.assign({ 'Content-Type': 'application/json', 'User-Agent': 'Recast-Automation/1.0' }, await credentialHeaders(deps.env || {}, a.customerId, a.outputCredentialId)),
        body: JSON.stringify({ workflow_id: wf.id, workflow_name: wf.name, run_at: Date.now(), output })
      });
      if (r.ok) return { delivered: true, attempts: attempt, status: r.status };
      lastErr = new Error('webhook delivery failed (' + r.status + ')');
    } catch (e) { lastErr = e; }
    finally { clearTimeout(timer); }
  }
  throw lastErr || new Error('webhook delivery failed');
}
async function handleWorkflowAutomation(request, env, deps, id) {
  const auth = await deps.authenticateApiToken(request, env, deps); if (auth.error) return auth.error;
  const wf = await getOwnedWorkflow(env.ENTITLEMENTS, auth.rec.customerId, id); if (!wf) return json({ error: 'workflow not found' }, 404);
  let body; try { body = await request.json(); } catch (_) { return json({ error: 'invalid JSON body' }, 400); }
  if (body.enabled === false) { await env.ENTITLEMENTS.delete(automationKey(auth.rec.customerId, id)); return json({ automation: { enabled: false } }); }
  if (!canUseAutomationPlan(auth.rec.plan)) return json({ error: 'Hosted scheduling requires the Automation plan.' }, 403);
  const existingAuto = await env.ENTITLEMENTS.get(automationKey(auth.rec.customerId, id));
  if (!existingAuto && await countActiveAutomations(env.ENTITLEMENTS, auth.rec.customerId) >= AUTOMATION_ACTIVE_WORKFLOW_LIMIT)
    return json({ error: 'active automation limit reached (' + AUTOMATION_ACTIVE_WORKFLOW_LIMIT + ')' }, 429);

  const cadence = body.cadence || 'daily';
  if (!['hourly','daily','weekly'].includes(cadence)) return json({ error: 'cadence must be hourly, daily or weekly' }, 400);
  const inputMode = body.inputMode === 'http' ? 'http' : 'fixed';
  if (inputMode === 'fixed') {
    if (typeof body.input !== 'string') return json({ error: 'fixed automation input must be a string' }, 400);
    if (new TextEncoder().encode(body.input).length > MAX_WORKFLOW_INPUT_BYTES) return json({ error: 'automation input exceeds ' + MAX_WORKFLOW_INPUT_BYTES + ' bytes' }, 400);
  } else if (!isSafeAutomationUrl(body.inputUrl)) return json({ error: 'HTTP input must use a public HTTPS URL' }, 400);

  if (body.outputWebhook && !isSafeAutomationUrl(body.outputWebhook)) return json({ error: 'output webhook must use a public HTTPS URL' }, 400);
  if (body.inputCredentialId && !(await getOwnedCredential(env.ENTITLEMENTS, auth.rec.customerId, body.inputCredentialId))) return json({error:'input credential not found'},400);
  if (body.outputCredentialId && !(await getOwnedCredential(env.ENTITLEMENTS, auth.rec.customerId, body.outputCredentialId))) return json({error:'output credential not found'},400);
  const alertEmail = String(body.alertEmail || '').trim();
  if (alertEmail && !isValidEmail(alertEmail)) return json({error:'invalid failure-alert email address'},400);
  const timeZone = String(body.timeZone || 'UTC');
  if (!validTimeZone(timeZone)) return json({ error: 'invalid IANA timezone' }, 400);
  const hour = Math.max(0, Math.min(23, Number.isFinite(Number(body.hour)) ? Math.floor(Number(body.hour)) : 8));
  const weekday = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].includes(body.weekday) ? body.weekday : 'Mon';

  const rec = {
    customerId: auth.rec.customerId, workflowId: id, enabled: true, cadence,
    inputMode, input: inputMode === 'fixed' ? body.input : undefined,
    inputUrl: inputMode === 'http' ? body.inputUrl : undefined,
    outputWebhook: body.outputWebhook || undefined,
    inputCredentialId: body.inputCredentialId || undefined,
    outputCredentialId: body.outputCredentialId || undefined,
    alertEmail: alertEmail || undefined,
    timeZone, hour, weekday,
    retryCount: 0, nextRunAt: nextRunAt(cadence, Date.now(), { timeZone, hour, weekday }), updatedAt: Date.now()
  };
  await env.ENTITLEMENTS.put(automationKey(auth.rec.customerId, id), JSON.stringify(rec));
  return json({ automation: { enabled: true, cadence, inputMode, inputUrl: rec.inputUrl, outputWebhook: rec.outputWebhook, inputCredentialId: rec.inputCredentialId, outputCredentialId: rec.outputCredentialId, alertEmail: rec.alertEmail, timeZone, hour, weekday, nextRunAt: rec.nextRunAt } });
}
async function handleWorkflowHistory(request, env, deps, id) {
  const auth = await deps.authenticateApiToken(request, env, deps); if (auth.error) return auth.error;
  const wf = await getOwnedWorkflow(env.ENTITLEMENTS, auth.rec.customerId, id); if (!wf) return json({ error: 'workflow not found' }, 404);
  const listed = await env.ENTITLEMENTS.list({ prefix: runPrefix(auth.rec.customerId, id), limit: 100 });
  const keys = listed.keys.map(k => k.name).sort().reverse().slice(0, WORKFLOW_HISTORY_LIMIT);
  const rows = []; for (const key of keys) { const raw = await env.ENTITLEMENTS.get(key); if (raw) try { rows.push(JSON.parse(raw)); } catch (_) {} }
  return json({ runs: rows });
}

async function sendAutomationFailureAlert(env, deps, automation, workflow, errorMessage) {
  if (!automation.alertEmail || !isValidEmail(automation.alertEmail)) return false;
  const apiKey = await resolveSecret(env.RESEND_API_KEY); if (!apiKey) return false;
  const doFetch = deps.fetchImpl || fetch;
  try {
    const res = await doFetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'},
      body:JSON.stringify({
        from:'Recast Automation <contact@tryrecast.app>',
        to:[automation.alertEmail],
        subject:'Recast automation failed: '+(workflow.name||workflow.id),
        html:'<h2>Automation needs attention</h2><p><strong>'+escapeHtml(workflow.name||workflow.id)+'</strong> failed after '+AUTOMATION_MAX_RETRIES+' attempts.</p><p>'+escapeHtml(errorMessage||'Unknown error')+'</p><p>Open Recast → Hosted Automation to review the run history and configuration.</p>'
      })
    });
    return res.ok;
  } catch (_) { return false; }
}
async function runDueAutomations(env, deps) {
  let cursor; const now = Date.now(); let processed = 0;
  do {
    const listed = await env.ENTITLEMENTS.list({ prefix: 'automation:', cursor, limit: 100 }); cursor = listed.list_complete ? undefined : listed.cursor;
    for (const k of listed.keys) {
      const raw = await env.ENTITLEMENTS.get(k.name); if (!raw) continue;
      let a; try { a = JSON.parse(raw); } catch (_) { continue; }
      if (!a.enabled || !a.nextRunAt || a.nextRunAt > now) continue;
      const custRaw = await env.ENTITLEMENTS.get('customer:' + a.customerId); let cust; try { cust = custRaw ? JSON.parse(custRaw) : null; } catch (_) { cust = null; }
      if (!cust || !deps.isEntitled(cust.status, cust.expiresAt) || !canUseAutomationPlan(cust.plan)) continue;
      const wf = await getOwnedWorkflow(env.ENTITLEMENTS, a.customerId, a.workflowId); if (!wf) { await env.ENTITLEMENTS.delete(k.name); continue; }
      const autoUsage = await checkAndIncrementAutomationUsage(env.ENTITLEMENTS, a.customerId, AUTOMATION_MONTHLY_RUN_LIMIT);
      if (!autoUsage.ok) {
        a.lastError = 'monthly automation run limit reached (' + AUTOMATION_MONTHLY_RUN_LIMIT + ')';
        a.lastFailureAt = now; a.nextRunAt = nextRunAt(a.cadence, now, a); a.updatedAt = now;
        await env.ENTITLEMENTS.put(k.name, JSON.stringify(a)); continue;
      }

      let success = false, lastErr = null;
      for (let attempt = 1; attempt <= AUTOMATION_MAX_RETRIES && !success; attempt++) {
        try {
          const runDeps = Object.assign({}, deps, {env});
          const input = await fetchAutomationInput(a, runDeps);
          const run = await executeStoredWorkflow(env, a.customerId, wf, input, 'automation', deps, { skipApiUsage: true, skipHistory: true });
          const delivery = await deliverAutomationOutput(a, wf, run.result.output, runDeps);
          await recordWorkflowRun(env.ENTITLEMENTS, a.customerId, wf.id, { ok: true, source: 'automation', attempts: attempt, delivery, durationMs: run.durationMs, stepResults: run.result.stepResults, outputPreview: run.result.output.slice(0, 2000) });
          success = true; a.retryCount = 0; a.lastSuccessAt = Date.now(); a.lastError = undefined; a.failureAlertSent = false;
        } catch (e) { lastErr = e; a.retryCount = attempt; }
      }
      if (!success) {
        a.lastError = (lastErr && (lastErr.message || String(lastErr))) || 'automation failed';
        a.lastFailureAt = Date.now();
        if (!a.failureAlertSent && a.alertEmail) { a.failureAlertSent = await sendAutomationFailureAlert(env, deps, a, wf, a.lastError); }
        await recordWorkflowRun(env.ENTITLEMENTS, a.customerId, wf.id, { ok: false, source: 'automation', attempts: a.retryCount, error: a.lastError });
      }
      a.nextRunAt = nextRunAt(a.cadence, now, a); a.lastAttemptAt = now; a.updatedAt = Date.now();
      await env.ENTITLEMENTS.put(k.name, JSON.stringify(a)); processed++;
    }
  } while (cursor);
  return processed;
}

const defaultDeps = {
  issueToken: issueToken,
  lookupToken: lookupToken,
  setCustomerStatus: setCustomerStatus,
  isEntitled: isEntitled,
  verifyStripeSignature: verifyStripeSignature,
  authenticateApiToken: authenticateApiToken,
  checkAndIncrementUsage: checkAndIncrementUsage,
  checkAndIncrementAutomationUsage: checkAndIncrementAutomationUsage,
  fetchImpl: undefined,
};

async function route(request, env, deps) {
  const url = new URL(request.url);
  if (url.pathname === '/api/verify-session' && request.method === 'GET') return handleVerifySession(request, env, deps);
  if (url.pathname === '/api/verify-token' && request.method === 'GET') return handleVerifyToken(request, env, deps);
  if (url.pathname === '/api/webhook' && request.method === 'POST') return handleWebhook(request, env, deps);
  if (url.pathname === '/api/portal' && request.method === 'POST') return handlePortal(request, env, deps);
  if (url.pathname === '/api/contact' && request.method === 'POST') return handleContactForm(request, env, deps);
  if (url.pathname === '/api/notify-me' && request.method === 'POST') return handleNotifyMe(request, env, deps);
  if (url.pathname === '/v1/convert' && request.method === 'POST') return handleApiConvert(request, env, deps);
  if (url.pathname === '/v1/diff' && request.method === 'POST') return handleApiDiff(request, env, deps);
  if (url.pathname === '/v1/schema' && request.method === 'POST') return handleApiSchema(request, env, deps);

  if (url.pathname === '/v1/workflows/usage' && request.method === 'GET') return handleWorkflowUsage(request, env, deps);
  if (url.pathname === '/v1/workflows/health' && request.method === 'GET') return handleWorkflowHealth(request, env, deps);
  if (url.pathname === '/v1/credentials' && request.method === 'POST') return handleCredentialCreate(request,env,deps);
  if (url.pathname === '/v1/credentials' && request.method === 'GET') return handleCredentialList(request,env,deps);
  const credMatch=url.pathname.match(/^\/v1\/credentials\/([^/]+)$/);
  if(credMatch && request.method==='DELETE') return handleCredentialDelete(request,env,deps,credMatch[1]);
  if (url.pathname === '/v1/workflows' && request.method === 'POST') return handleWorkflowCreate(request, env, deps);
  if (url.pathname === '/v1/workflows' && request.method === 'GET') return handleWorkflowList(request, env, deps);
  const wfMatch = url.pathname.match(/^\/v1\/workflows\/([^/]+)$/);
  if (wfMatch && request.method === 'GET') return handleWorkflowGet(request, env, deps, wfMatch[1]);
  if (wfMatch && request.method === 'DELETE') return handleWorkflowDelete(request, env, deps, wfMatch[1]);
  const wfRunMatch = url.pathname.match(/^\/v1\/workflows\/([^/]+)\/run$/);
  if (wfRunMatch && request.method === 'POST') return handleWorkflowRun(request, env, deps, wfRunMatch[1]);
  const wfAutoMatch = url.pathname.match(/^\/v1\/workflows\/([^/]+)\/automation$/);
  if (wfAutoMatch && request.method === 'POST') return handleWorkflowAutomation(request, env, deps, wfAutoMatch[1]);
  const wfHistoryMatch = url.pathname.match(/^\/v1\/workflows\/([^/]+)\/history$/);
  if (wfHistoryMatch && request.method === 'GET') return handleWorkflowHistory(request, env, deps, wfHistoryMatch[1]);
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
  '/tools': '/tools/index.html',
  '/tools/': '/tools/index.html',
  '/api': '/api/index.html',
  '/api/': '/api/index.html',
};

export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(runDueAutomations(env, defaultDeps));
  },
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

export { route, handleVerifySession, handleVerifyToken, handleWebhook, handlePortal, handleContactForm, handleNotifyMe, handleApiConvert, handleApiDiff, handleApiSchema, handleWorkflowCreate, handleWorkflowList, handleWorkflowHealth, handleWorkflowGet, handleWorkflowDelete, handleWorkflowRun, handleWorkflowAutomation, handleWorkflowHistory, handleCredentialCreate, handleCredentialList, handleCredentialDelete, runDueAutomations, authenticateApiToken, checkAndIncrementUsage, planFromPriceId, defaultDeps, DIRECTORY_INDEX_PATHS };
