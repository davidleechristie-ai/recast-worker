# Current state

Updated: 2026-09-20 00:49 Europe/London

North star: Sustain at least £1,000 genuine monthly revenue. Immediate milestone: first genuine £4.99 purchase, then £100 cumulative validation revenue within the original three-month window.

## Evidence refreshed
- Revenue: authoritative live Stripe `Home Quote Check` (`livemode=true`) returned 0 PaymentIntents with `has_more=false`. Genuine live revenue = £0 / £1,000 monthly North Star; cumulative validation revenue = £0 / £100; paying customers = 0.
- Durable funnel: latest production Cloudflare snapshot fetched 2026-09-19T23:15:08Z explicitly excludes QA/demo/test events. 47 landings → 12 checker starts → 5 uploads → 5 genuine analyses. Extended cohort: 4 genuine analyses → 0 multi-quote analyses → 4 Decision Cases → 0 installer-question actions → 2 share intents → 0 share opens → 0 recipient starts → 0 outbound/commercial clicks → 0 checkouts. Rates: landing→start 26%; start→upload 42%; upload→analysis 100%; extended analysis→comparison 0%; analysis→Decision Case 100%; Decision Case→share intent 50%.
- Source evidence: direct = 33 landings / 12 starts / 5 uploads / 5 genuine analyses. `results_compare` = 5 landings / 0 starts / 0 uploads. Measured organic/static/professional source cohorts remain one landing each and zero downstream actions. No qualified organic conversion exists yet.
- SEO/search: latest settled authoritative Search Console evidence remains 13 sitemap URLs with only 2 receiving impressions; homepage 2 impressions / 0 clicks / avg position 3.5 and good-quote page 2 / 0 / 5.5. Fresh public web search in this runtime returned no usable ranking evidence, so no new rank claim is made.
- Production health: direct web reader could not access the production URL in this runtime; no failure is inferred because the durable production snapshot refreshed successfully at 23:15Z.

## Commercial diagnosis
Commercial validation remains unachieved. The earliest adequately sampled funnel weakness remains landing → checker start (12/47, 26%), followed by start → upload (5/12, 42%). Upload → genuine analysis remains healthy at 100%. Comparison is still an absolute downstream failure (0 multi-quote analyses; 5 `results_compare` landings with zero starts). Acquisition volume remains extremely low and no measured organic cohort has converted. First-customer distribution + activation therefore outrank broad product polish.

## Engineering finding
Checkout code inspection found an observability mismatch worth fixing in a non-UI release: durable metrics increments `checkouts` only for `detail_checkout_created` or `decision_pack_checkout_created`, while the current Decision Pack frontend emits `decision_pack_checkout_started` and the checkout creation function does not visibly record `decision_pack_checkout_created` in the inspected code. This can undercount created checkout sessions and weaken revenue-funnel diagnosis. Also, the Stripe webhook fallback amount still defaults to 1900 pence if `amount_total` is absent, which is stale versus the current £4.99 offer; successful Stripe PaymentIntent evidence remains authoritative for revenue, so no revenue is misreported from this finding.

## Active experiments / execution
- Preserve homepage single-vs-compare and multi-quote-first journey until genuine post-release evidence moves; do not stack an unrendered homepage UI experiment.
- Preserve current SEO/indexing experiment; no thin location/installer-lead pages.
- Prioritise qualified distribution, activation, checkout reliability and durable commercial-funnel instrumentation.

## Next actions
1. Refresh live Stripe and `hqc-ops/live-metrics.json` first every run.
2. Correct checkout-created durable instrumentation and stale £19 webhook fallback in a backend-only change once the full worker edit can be safely patched/tested through the guarded release path.
3. Measure whether `results_compare` starts/uploads and multi-quote analyses move above zero before another comparison UI change.
4. Verify the £4.99 Decision Pack checkout path via safe preview/canary/release tests.
5. Progress qualified distribution and optimise existing high-intent decision pages; avoid broad feature work and thin acquisition content.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
