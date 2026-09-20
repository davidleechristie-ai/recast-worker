# Current state

Updated: 2026-09-20 10:49 Europe/London

North star: Sustain at least £1,000 genuine monthly revenue. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month window.

## Evidence refreshed
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed this run: 0 objects, `has_more=false`. Genuine production revenue remains £0 / £1,000 monthly North Star; cumulative validation revenue £0 / £100; paying customers 0.
- Durable funnel: latest repository snapshot remains 53 genuine landings → 15 checker starts → 5 uploads → 5 genuine analyses. Extended cohort: 4 genuine analyses → 0 multi-quote analyses → 4 Decision Cases → 0 installer-question actions → 2 share intents → 0 share opens → 0 recipient starts → 0 outbound/commercial clicks → 0 durable checkouts. This snapshot predates the 07:58 Decision Pack CTA repair and is not post-fix conversion evidence.
- Qualified acquisition: direct remains the only source with genuine analyses in the latest durable snapshot (37 landings, 15 starts, 5 uploads, 5 genuine analyses). Organic cohorts have landings but no genuine analyses yet. Technology rows are absent in this pre-segmentation snapshot, so technology mix is unavailable rather than assumed.
- SEO/search: no newer authoritative Search Console dataset was available this run; latest settled evidence remains 13 sitemap URLs, 2 receiving impressions, 4 total impressions and 0 clicks.
- Production health/release: the checkout observability patch is now preview- and canary-verified. The first bridge run for `adf542b...` was superseded/cancelled during rapid vault commits, but subsequent commit `dfdfeb8...`, which contains the same backend patch, passed Cloudflare preview run 35500841854 and custom-domain canary run 35500841869. A guarded production release was autonomously triggered via `PRODUCTION_RELEASE` commit `202a51075885091763f42e283204032f42d5e1c0`; production run 35503417274 is in progress and is not yet claimed successful.

## Technology mix
- Heat pump: live product; all currently classified genuine funnel evidence belongs to the pre-solar product.
- Solar PV + battery: vertical #2 remains behind the non-public correctness gate; no genuine solar funnel activity measured yet.

## Commercial diagnosis
First-customer acquisition/conversion remains the binding objective. The advertised £4.99 vs £19 checkout mismatch and non-working Decision Pack purchase CTA are repaired in production. Latest durable snapshot is too early to judge those repairs. Landing → checker start is 28% overall (15/53); direct traffic is materially stronger at 41% (15/37), but acquisition scale is extremely low. Start → upload is 33% (5/15), so upload activation is also a material downstream constraint. Do not stack another homepage UI experiment until post-release evidence matures.

## Checkout observability/correctness release
- Successful Stripe Checkout Session creation now records `decision_pack_checkout_created` in the durable synthetic-excluded metrics store, including anonymous source/technology dimensions when supplied.
- Stripe webhook missing-`amount_total` fallback corrected from 1900 pence to 499 pence, matching the current £4.99 Decision Pack.
- Code commit: `adf542b51913956dc066ea9cae2d1a315e47d890`; verified as included in subsequent main commit `dfdfeb8efd144ae358178088cf535bbe41800a27`.
- Preview verification: run 35500841854 passed.
- Custom-domain canary verification: run 35500841869 passed.
- Production promotion trigger: `202a51075885091763f42e283204032f42d5e1c0`; production run 35503417274 in progress at last observation.
- Revenue rationale: reliable checkout-created evidence distinguishes lack of paid intent from payment completion failure, accelerating diagnosis of the first-purchase bottleneck; the fallback correction prevents misleading revenue telemetry.

## Solar/battery evidence rules retained
- Report what a quote says about DNO treatment (G98/G99/G100 where present); do not assert approval.
- Treat generation, self-consumption, export and savings as installer/quote assumptions, not certified predictions.
- Preserve equipment/scope/warranty/MCS wording extraction and the non-public correctness gate before any solar checker CTA.

## Next actions
1. Verify guarded production run 35503417274; if green, treat checkout-created telemetry/fallback correction as production-complete and refresh durable funnel evidence.
2. Refresh live Stripe; first genuine £4.99 purchase remains the immediate commercial milestone.
3. Progress qualified high-intent distribution and upload activation without overlapping the current homepage/checkout measurement window.
4. Continue Solar PV + Battery extraction/evidence completeness behind the non-public gate; no production CTA until correctness + rendered journey gates pass.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
