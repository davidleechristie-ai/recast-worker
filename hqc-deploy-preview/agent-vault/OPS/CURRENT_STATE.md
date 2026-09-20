# Current state

Updated: 2026-09-20 03:55 Europe/London

North star: Sustain at least £1,000 genuine monthly revenue. Immediate milestone: first genuine £4.99 purchase, then £100 cumulative validation revenue within the original three-month window.

## Evidence refreshed
- Revenue: authoritative live Stripe Home Quote Check account refreshed this run. PaymentIntents returned 0 objects with `has_more=false`; genuine live revenue = £0 / £1,000 monthly North Star; cumulative validation revenue = £0 / £100; paying customers = 0.
- Stripe commercial evidence: live Checkout Sessions contained two historical £19.00 sessions. One was explicitly `stripe_healthcheck_20260911`; the other used UUID case `b87fb69a-cae9-42e1-90fc-d8baf7a6677b`. Both expired unpaid. This is evidence that the live payment boundary had been reached at least once outside the named healthcheck, but not evidence of a genuine customer because provenance cannot be established authoritatively.
- Durable funnel: latest production Cloudflare snapshot remains 47 landings → 12 checker starts → 5 uploads → 5 genuine analyses. Extended cohort: 4 genuine analyses → 0 multi-quote analyses → 4 Decision Cases → 0 installer-question actions → 2 share intents → 0 share opens → 0 recipient starts → 0 outbound/commercial clicks → 0 durable checkouts. QA/demo/test excluded.
- SEO/search: latest settled Search Console evidence remains 13 sitemap URLs, 2 receiving impressions, 4 total impressions and 0 clicks.

## Material production improvement deployed
The customer-facing Decision Pack offer was £4.99, but production `STRIPE_DECISION_PACK_PRICE_ID` still pointed at the stale £19.00 live Stripe price. Stripe confirmed the active intended launch-validation price `price_1UFsZ2CnmTy7aZ0HpfSQ5E8Z` is GBP 499 and carries decision_pack / first-£100 validation metadata. Production configuration was changed to this £4.99 price.

Verification: initial config commit `4c3c0661d2254bbb5c1d192343395311bf9b24d4` passed Cloudflare bridge run 35485015861 and custom-domain canary run 35485015855 including mobile browser intake verification. Guarded production promotion commit `a5887baee51433f259f41b94b7308cf2f46d22d0` completed production deploy run 35485076527 successfully: deploy, production HTTP verification and mobile journey smoke all passed. No AppDeploy deployment was used.

## Commercial diagnosis
Commercial validation remains unachieved, but a severe payment-boundary mismatch has been removed. A homeowner shown £4.99 could previously have been sent to a £19 Stripe Checkout (3.8x advertised price). This directly threatened trust and first-purchase conversion. Distribution + activation remain the primary growth constraints after this fix.

## Remaining engineering debt
- Durable metrics counts `decision_pack_checkout_created`, but checkout creation does not currently record it; durable checkout counts can therefore understate created sessions.
- Stripe webhook retains a stale 1900-pence fallback if `amount_total` is absent. Normal Stripe completed-session payloads should carry amount_total, so this is lower priority than the now-fixed live checkout price but should be corrected through the guarded backend path.

## Next actions
1. Refresh live Stripe and durable metrics first; watch specifically for the first new £4.99 Checkout Session and successful PaymentIntent.
2. Patch checkout-created durable instrumentation and webhook fallback to 499 without changing UI.
3. Progress qualified distribution and existing high-intent decision-page visibility; do not add thin content.
4. Measure `results_compare` starts/uploads and multi-quote analyses before another comparison UI experiment.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
