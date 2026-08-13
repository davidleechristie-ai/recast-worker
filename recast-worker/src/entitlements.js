/*!
 * Entitlement storage on top of Cloudflare KV.
 *
 * Two record types:
 *   token:<opaque-token>    -> { customerId }
 *   customer:<stripe-cust>  -> { plan, status, updatedAt }
 *
 * A token never stores the plan/status directly — it only points at a
 * customer record. That means a webhook updating the customer record
 * (renewal, cancellation, plan change) is immediately reflected for every
 * token ever issued to that customer, without needing to touch each token.
 */

function generateToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  const b64 = btoa(binary);
  return 'rk_' + b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function issueToken(kv, customerId, plan, status) {
  const token = generateToken();
  await kv.put('token:' + token, JSON.stringify({ customerId }));
  await setCustomerStatus(kv, customerId, plan, status);
  return token;
}

async function setCustomerStatus(kv, customerId, plan, status) {
  await kv.put('customer:' + customerId, JSON.stringify({ plan, status, updatedAt: Date.now() }));
}

async function lookupToken(kv, token) {
  if (!token) return null;
  const tokenRaw = await kv.get('token:' + token);
  if (!tokenRaw) return null;
  const tokenRec = JSON.parse(tokenRaw);
  const custRaw = await kv.get('customer:' + tokenRec.customerId);
  if (!custRaw) return null;
  const custRec = JSON.parse(custRaw);
  return { customerId: tokenRec.customerId, plan: custRec.plan, status: custRec.status, updatedAt: custRec.updatedAt };
}

/** True for any status that should currently unlock paid features. */
function isEntitled(status) {
  return status === 'active' || status === 'trialing';
}

const api = { generateToken, issueToken, setCustomerStatus, lookupToken, isEntitled };
export { generateToken, issueToken, setCustomerStatus, lookupToken, isEntitled };
export default api;
