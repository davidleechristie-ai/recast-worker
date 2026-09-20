# Current state

Updated: 2026-09-20 01:52 Europe/London

North star: Sustain at least £1,000 genuine monthly revenue. Immediate milestone: first genuine £4.99 purchase, then £100 cumulative validation revenue within the original three-month window.

## Evidence refreshed
- Revenue: the latest authoritative live Stripe refresh remains 0 PaymentIntents with `has_more=false`; genuine live revenue = £0 / £1,000 monthly North Star; cumulative validation revenue = £0 / £100; paying customers = 0. Stripe was not independently callable in this runtime, so this is explicitly the latest authoritative evidence rather than a newly asserted refresh.
- Durable funnel: latest production Cloudflare snapshot fetched 2026-09-19T23:15:08Z explicitly excludes QA/demo/test events. 47 landings → 12 checker starts → 5 uploads → 5 genuine analyses. Extended cohort: 4 genuine analyses → 0 multi-quote analyses → 4 Decision Cases → 0 installer-question actions → 2 share intents → 0 share opens → 0 recipient starts → 0 outbound/commercial clicks → 0 checkouts.
- Source evidence: direct = 33 landings / 12 starts / 5 uploads / 5 genuine analyses. `results_compare` = 5 landings / 0 starts / 0 uploads. Measured organic/static/professional source cohorts remain one landing each and zero downstream actions.
- SEO/search: fresh public search produced no reliable HQC ranking evidence; latest settled Search Console evidence remains 13 sitemap URLs with only 2 receiving impressions, 4 total impressions and 0 clicks.

## Commercial diagnosis
Commercial validation remains unachieved. Landing → checker start (26%) is the earliest adequately sampled funnel weakness; start → upload is 42%; upload → genuine analysis is 100%. Comparison remains an absolute downstream zero. Acquisition volume remains extremely low and no measured organic cohort has converted. First-customer distribution + activation outrank broad product polish.

## Engineering finding confirmed
Decision Pack frontend emits `decision_pack_checkout_started` before requesting Stripe Checkout. Durable metrics counts `decision_pack_checkout_created`, but the inspected checkout creation function returns the Stripe session without recording that event. This means successful checkout-session creation can be absent from durable funnel telemetry. The Stripe webhook also retains a stale `1900` pence fallback when `amount_total` is absent, inconsistent with the current £4.99 offer. Revenue remains authoritative from live Stripe, so this is an observability/correctness defect rather than evidence of lost revenue.

## Active experiments / execution
- Preserve homepage single-vs-compare and multi-quote-first journey until genuine post-release evidence moves; do not stack an unrendered homepage UI experiment.
- Preserve current SEO/indexing experiment; no thin location/installer-lead pages.
- Prioritise qualified distribution, activation, checkout reliability and durable commercial-funnel instrumentation.

## Next actions
1. Refresh live Stripe and `hqc-ops/live-metrics.json` first when connectors expose them.
2. Patch checkout-created durable instrumentation immediately after Stripe session creation and change the webhook fallback from 1900 to 499 through the guarded backend release path; no customer-facing UI change is required.
3. Measure whether `results_compare` starts/uploads and multi-quote analyses move above zero before another comparison UI change.
4. Verify the £4.99 Decision Pack checkout path via safe preview/canary/release tests.
5. Progress qualified distribution and optimise existing high-intent decision pages; avoid broad feature work and thin acquisition content.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
