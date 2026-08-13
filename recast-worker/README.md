# recast-worker — entitlements backend

Replaces the pure-`localStorage`-trust model with real, server-verified
subscription checks. Serves the static site **and** four API routes from a
single Cloudflare Worker — no separate backend to run.

## What this actually fixes

Before: "Pro" was a flag anyone could set in their browser console, forever,
whether they'd paid or not.

After: every page load re-checks a real access token against Stripe-derived
state in KV. A cancelled subscription is caught on the next visit. A token
nobody was actually issued is never entitled, no matter what's in
localStorage.

## Prerequisites

- A Cloudflare account (free tier is fine to start)
- Node.js and `npm install -g wrangler` (or use `npx wrangler`)
- A Stripe account with the 4 products/prices already created (see the main
  site's `app.js` header comment for that checklist) and their Payment
  Links already set up

## 1. Install and log in

```
cd recast-worker
npm init -y            # only if you haven't already; wrangler needs a package.json nearby
npm install -D wrangler
npx wrangler login
```

## 2. Create the KV namespace

```
npx wrangler kv namespace create ENTITLEMENTS
```

This prints an `id`. Copy it into `wrangler.jsonc`, replacing
`REPLACE_WITH_YOUR_KV_NAMESPACE_ID`.

## 3. Fill in your Stripe Price IDs

In `wrangler.jsonc`, the `PRICE_MAP` variable maps Stripe Price IDs (found
on each Price's page in the Stripe Dashboard — looks like `price_1AbCdE...`)
to the plan keys the site already uses:

```json
"PRICE_MAP": "{\"price_1AbC...\":\"pro_monthly\",\"price_1DeF...\":\"pro_yearly\",\"price_1GhI...\":\"api_monthly\",\"price_1JkL...\":\"api_yearly\"}"
```

## 4. Set the two secrets (never go in wrangler.jsonc or git)

```
npx wrangler secret put STRIPE_SECRET_KEY
# paste your Stripe secret key (starts with sk_live_ or sk_test_) when prompted

npx wrangler secret put STRIPE_WEBHOOK_SECRET
# paste the webhook signing secret — you'll get this in step 6 below
```

## 5. Deploy

```
npx wrangler deploy
```

This uploads both the Worker code and everything in `public/` (the site
itself). You'll get a `*.workers.dev` URL immediately; attach your real
domain afterward via the Cloudflare dashboard (Worker → Settings → Domains
& Routes → Add Custom Domain).

## 6. Point Stripe's webhook at the deployed Worker

Stripe Dashboard → Developers → Webhooks → Add endpoint:

- Endpoint URL: `https://tryrecast.app/api/webhook` (or your `*.workers.dev`
  URL if you haven't attached the custom domain yet)
- Events to send: `customer.subscription.updated`, `customer.subscription.deleted`
  (that's all this Worker needs — it doesn't act on `checkout.session.completed`
  since `/api/verify-session` already handles granting access right after
  checkout)

After creating the endpoint, Stripe shows you a **signing secret**
(`whsec_...`) — that's the value for `STRIPE_WEBHOOK_SECRET` in step 4. If
you set up the webhook after already deploying, just re-run that
`wrangler secret put` command with the real value and redeploy.

## 7. Update the Payment Link redirect URLs

Each of the 4 Stripe Payment Links (set up when you first collected
payment) should redirect to:

```
https://tryrecast.app/?upgraded=1&plan=pro_monthly&session_id={CHECKOUT_SESSION_ID}
```

(swap `pro_monthly` per link). This was already true if you followed the
original payment-collection setup — nothing changes here, the Worker just
now actually verifies that `session_id` instead of the frontend blindly
trusting it.

## Testing it worked

1. Complete a real (or Stripe test-mode) checkout.
2. You should land back on the site with `?upgraded=1&session_id=...` in
   the URL, which the frontend immediately calls `/api/verify-session`
   with, then cleans the URL.
3. Open devtools → Application → Local Storage. You should see
   `recast_access_token` (a real token, not just a boolean) and
   `recast_account_cache` with `"entitled":true`.
4. In the Stripe Dashboard, cancel that test subscription.
5. Reload the site. Within moments, `refreshEntitlement()` calls
   `/api/verify-token`, sees the cancellation, and `isPro()` flips back to
   false — this is the part that never worked before.

## Local development

```
npx wrangler dev
```

Runs the Worker + static assets locally with simulated KV. Real Stripe API
calls still go to the real Stripe API (use `sk_test_...` keys and Stripe
test mode for this), so you can test the full flow without deploying.

## Architecture notes

- Tokens never store plan/status directly — they only point at a customer
  record (`token:<x> -> {customerId}`, `customer:<id> -> {plan,status}`).
  A webhook updating the customer record is instantly reflected for every
  token ever issued to that customer, without touching each token
  individually.
- `/api/verify-session` is idempotent-ish in effect: calling it twice for
  the same session just issues two tokens pointing at the same customer
  record, both correctly reflecting current status. Not a problem.
- If you ever need to manually revoke someone (refund, chargeback, abuse),
  just run `wrangler kv key put --namespace-id=<id> "customer:cus_xxx" '{"plan":"pro_monthly","status":"canceled","updatedAt":0}'`
  — every token for that customer is revoked on their next page load.
