/*!
 * Stripe webhook signature verification, implemented against the Web Crypto
 * API so the exact same code runs in the Cloudflare Worker runtime and in
 * Node (used here for testing) without any Node-specific crypto module.
 *
 * Algorithm per Stripe's docs: https://docs.stripe.com/webhooks#verify-manually
 *   signed_payload = "{timestamp}.{raw_body}"
 *   expected_sig   = hex(HMAC_SHA256(endpoint_secret, signed_payload))
 *   valid if expected_sig matches the v1 signature in the header AND the
 *   timestamp is within tolerance (replay protection).
 */

function parseSignatureHeader(header) {
  const parts = {};
  header.split(',').forEach((kv) => {
    const idx = kv.indexOf('=');
    if (idx === -1) return;
    const key = kv.slice(0, idx).trim();
    const val = kv.slice(idx + 1).trim();
    if (key === 'v1') {
      parts.v1 = parts.v1 || [];
      parts.v1.push(val);
    } else {
      parts[key] = val;
    }
  });
  return parts;
}

function timingSafeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacSha256Hex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sigBuf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies a Stripe webhook request. Throws with a specific reason on
 * failure; returns true on success. `toleranceSeconds` guards against replay
 * attacks (Stripe recommends 300s / 5 minutes, matching their own SDKs).
 */
async function verifyStripeSignature(rawBody, sigHeader, secret, toleranceSeconds, nowMs) {
  toleranceSeconds = toleranceSeconds === undefined ? 300 : toleranceSeconds;
  nowMs = nowMs === undefined ? Date.now() : nowMs;

  if (!sigHeader) throw new Error('missing Stripe-Signature header');
  if (!secret) throw new Error('missing webhook secret');

  const parsed = parseSignatureHeader(sigHeader);
  if (!parsed.t || !parsed.v1 || !parsed.v1.length) throw new Error('malformed Stripe-Signature header');

  const signedPayload = `${parsed.t}.${rawBody}`;
  const expectedHex = await hmacSha256Hex(secret, signedPayload);

  const matched = parsed.v1.some((sig) => timingSafeEqualHex(sig, expectedHex));
  if (!matched) throw new Error('signature mismatch');

  const ageSeconds = Math.abs(nowMs / 1000 - Number(parsed.t));
  if (!Number.isFinite(ageSeconds) || ageSeconds > toleranceSeconds) {
    throw new Error('timestamp outside tolerance (possible replay)');
  }

  return true;
}

/** Test/debug helper: builds a validly-signed header for a given payload. */
async function signPayloadForTest(rawBody, secret, timestampSeconds) {
  const t = timestampSeconds === undefined ? Math.floor(Date.now() / 1000) : timestampSeconds;
  const sig = await hmacSha256Hex(secret, `${t}.${rawBody}`);
  return `t=${t},v1=${sig}`;
}

const api = { verifyStripeSignature, parseSignatureHeader, timingSafeEqualHex, hmacSha256Hex, signPayloadForTest };
export { verifyStripeSignature, parseSignatureHeader, timingSafeEqualHex, hmacSha256Hex, signPayloadForTest };
export default api;
