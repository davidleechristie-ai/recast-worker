/*!
* Recast entitlements Worker.
*
* Routes:
*  GET  /api/verify-session?session_id=...  — called once after Stripe
*        Checkout redirects back. Confirms payment with Stripe directly
*        (server-side, using the secret key) and issues an access token.
*  GET  /api/verify-token?token=...        — called on page load / on an
*        interval to re-check current entitlement. This is what actually
*        catches a cancellation — nothing is trusted forever.
*  POST /api/webhook                        — Stripe calls this on
*        subscription changes. Signature-verified.
*  POST /api/portal  { token }            — generates a real-time Stripe
*        Billing Portal link for the token's customer.
*
* Everything else falls through to the static site (env.ASSETS).
*/
import { verifyStripeSignature } from './stripe-verify.js';
import { issueToken, lookupToken, setCustomerStatus, isEntitled } from './entitlements.js';

const STRIPE_API = 'https://api.stripe.com/v1';

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
    session = await stripeGet('/checkout/sessions/' + sessionId + '?expand[]=subscription', env, deps.fetchImpl);
  } catch (e) {
    return json({ error: 'could not verify session: ' + e.message }, 502);
  }

  if (session.payment_status !== 'paid' && session.status !== 'complete') {
    return json({ error: 'payment not completed' }, 402);
  }

  const customerId = session.customer;
  const sub = session.subscription;
  const priceId = sub && sub.items && sub.items.data && sub.items.data[0] && sub.items.data[0].price && sub.items.data[0].price.id;
  const plan = planFromPriceId(priceId, env);
  const status = sub ? sub.status : 'active';

  const token = await deps.issueToken(env.ENTITLEMENTS, customerId, plan, status);
  return json({ token: token, plan: plan, status: status, entitled: deps.isEntitled(status) });
}

async function handleVerifyToken(request, env, deps) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (!token) return json({ error: 'missing token' }, 400);
  const rec = await deps.lookupToken(env.ENTITLEMENTS, token);
  if (!rec) return json({ entitled: false, plan: null, status: null });
  return json({ entitled: deps.isEntitled(rec.status), plan: rec.plan, status: rec.status });
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

  return json({ received: true });
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

const defaultDeps = {
  issueToken: issueToken,
  lookupToken: lookupToken,
  setCustomerStatus: setCustomerStatus,
  isEntitled: isEntitled,
  verifyStripeSignature: verifyStripeSignature,
  fetchImpl: undefined,
};

async function route(request, env, deps) {
  const url = new URL(request.url);
  if (url.pathname === '/api/verify-session' && request.method === 'GET') return handleVerifySession(request, env, deps);
  if (url.pathname === '/api/verify-token' && request.method === 'GET') return handleVerifyToken(request, env, deps);
  if (url.pathname === '/api/webhook' && request.method === 'POST') return handleWebhook(request, env, deps);
  if (url.pathname === '/api/portal' && request.method === 'POST') return handlePortal(request, env, deps);
  return null;
}

export default {
  async fetch(request, env, ctx) {
    const apiResponse = await route(request, env, defaultDeps);
    if (apiResponse) return apiResponse;
    return env.ASSETS.fetch(request);
  },
};

export { route, handleVerifySession, handleVerifyToken, handleWebhook, handlePortal, planFromPriceId, defaultDeps };
