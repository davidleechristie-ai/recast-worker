/*!
 * Entitlement storage on top of Cloudflare KV.
 *
 * Two record types:
 *   token:<opaque-token>    -> { customerId }
 *   customer:<stripe-cust>  -> { plan, status, updatedAt, expiresAt? }
 *
 * A token never stores the plan/status directly — it only points at a
 * customer record. That means a webhook updating the customer record
 * (renewal, cancellation, plan change) is immediately reflected for every
 * token ever issued to that customer, without needing to touch each token.
 *
 * `expiresAt` (epoch ms, optional) supports one-time, time-boxed passes
 * (e.g. a 24-hour Pro pass paid for without a subscription) alongside
 * ongoing subscriptions, which have no expiresAt and rely purely on status
 * being kept current by webhooks instead.
 */

function generateToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  const b64 = btoa(binary);
  return 'rk_' + b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function issueToken(kv, customerId, plan, status, expiresAt) {
  const token = generateToken();
  await kv.put('token:' + token, JSON.stringify({ customerId }));
  await setCustomerStatus(kv, customerId, plan, status, expiresAt);
  return token;
}

async function setCustomerStatus(kv, customerId, plan, status, expiresAt) {
  const rec = { plan: plan, status: status, updatedAt: Date.now() };
  if (expiresAt) rec.expiresAt = expiresAt;
  await kv.put('customer:' + customerId, JSON.stringify(rec));
}

async function lookupToken(kv, token) {
  if (!token) return null;
  const tokenRaw = await kv.get('token:' + token);
  if (!tokenRaw) return null;
  const tokenRec = JSON.parse(tokenRaw);
  const custRaw = await kv.get('customer:' + tokenRec.customerId);
  if (!custRaw) return null;
  const custRec = JSON.parse(custRaw);
  return {
    customerId: tokenRec.customerId,
    plan: custRec.plan,
    status: custRec.status,
    updatedAt: custRec.updatedAt,
    expiresAt: custRec.expiresAt || null,
  };
}

/**
 * True for any status/expiry combination that should currently unlock paid
 * features. `expiresAt` is optional — omit it (or pass a falsy value) for
 * an ongoing subscription with no fixed end date; pass an epoch-ms
 * timestamp for a time-boxed pass, which stops being entitled once it's
 * in the past, regardless of status.
 */
function isEntitled(status, expiresAt) {
  const statusOk = status === 'active' || status === 'trialing';
  if (!statusOk) return false;
  if (expiresAt && Date.now() > expiresAt) return false;
  return true;
}

const api = { generateToken, issueToken, setCustomerStatus, lookupToken, isEntitled };
export { generateToken, issueToken, setCustomerStatus, lookupToken, isEntitled };
export default api;
