# Current state

Updated: 2026-09-20 11:51 Europe/London

North star: Sustain at least £1,000 genuine monthly revenue. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month window.

## Evidence refreshed
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed this run: 0 objects, `has_more=false`. Genuine production revenue remains £0 / £1,000 monthly North Star; cumulative validation revenue £0 / £100; paying customers 0.
- Durable funnel: no newer authoritative durable snapshot was retrieved this run, so latest repository snapshot remains 53 genuine landings → 15 checker starts → 5 uploads → 5 genuine analyses. Extended cohort: 4 genuine analyses → 0 multi-quote analyses → 4 Decision Cases → 0 installer-question actions → 2 share intents → 0 share opens → 0 recipient starts → 0 outbound/commercial clicks → 0 durable checkouts. This snapshot predates the 07:58 Decision Pack CTA repair and must not be treated as post-fix conversion evidence.
- Qualified acquisition: no newer authoritative segmented snapshot retrieved this run. Latest durable evidence has direct as the only source with genuine analyses (37 landings, 15 starts, 5 uploads, 5 genuine analyses). Technology rows are absent in that pre-segmentation snapshot, so technology mix is unavailable rather than assumed.
- SEO/search: no newer authoritative Search Console dataset was available this run; latest settled evidence remains 13 sitemap URLs, 2 receiving impressions, 4 total impressions and 0 clicks.
- Production health/release: guarded production run 35503417274 for commit `202a51075885091763f42e283204032f42d5e1c0` completed successfully. Its deploy job passed technology evidence tests, production Worker deployment, production HTTP verification and the mobile journey smoke test. The checkout-created telemetry and £4.99 webhook fallback correction are therefore production-complete.

## Technology mix
- Heat pump: live product; all currently classified genuine funnel evidence belongs to the pre-solar product.
- Solar PV + battery: vertical #2 remains behind the non-public correctness gate; no genuine solar funnel activity measured yet.

## Commercial diagnosis
First-customer acquisition/conversion remains the binding objective. The advertised £4.99 vs £19 checkout mismatch, non-working Decision Pack purchase CTA, missing server-side checkout-created telemetry and stale £19 fallback have now all been repaired and production-verified. There is still no genuine PaymentIntent. Latest durable funnel evidence is too early to judge the repaired purchase path. Landing → checker start is 28% overall (15/53); direct traffic is materially stronger at 41% (15/37). Start → upload is 33% (5/15), so qualified acquisition scale and upload activation remain material constraints. Do not stack another homepage UI experiment until post-release evidence matures.

## Checkout observability/correctness release
- Successful Stripe Checkout Session creation now records `decision_pack_checkout_created` in the durable synthetic-excluded metrics store, including anonymous source/technology dimensions when supplied.
- Stripe webhook missing-`amount_total` fallback corrected from 1900 pence to 499 pence, matching the current £4.99 Decision Pack.
- Code commit: `adf542b51913956dc066ea9cae2d1a315e47d890`; included in production promotion commit `202a51075885091763f42e283204032f42d5e1c0`.
- Preview verification: run 35500841854 passed.
- Custom-domain canary verification: run 35500841869 passed.
- Production verification: run 35503417274 passed; deployment, production verification and mobile journey smoke all green.
- Revenue rationale: the paid boundary is now both operational and observable at session creation, accelerating diagnosis of whether first-purchase failure is acquisition/value or payment completion.

## Solar/battery evidence rules retained
- Report what a quote says about DNO treatment (G98/G99/G100 where present); do not assert approval.
- Treat generation, self-consumption, export and savings as installer/quote assumptions, not certified predictions.
- Preserve equipment/scope/warranty/MCS wording extraction and the non-public correctness gate before any solar checker CTA.

## Next actions
1. Refresh live Stripe and durable checkout/funnel evidence each run; first genuine £4.99 purchase remains the immediate commercial milestone.
2. Progress qualified high-intent distribution and upload activation without overlapping the current homepage/checkout measurement window.
3. Continue Solar PV + Battery extraction/evidence completeness behind the non-public gate; no production CTA until correctness + rendered journey gates pass.
4. Re-rank only when post-fix genuine evidence is available; unavailable metrics remain null rather than assumed zero.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
