# Current state

Updated: 2026-09-19 23:58 Europe/London

North star: Sustain at least £1,000 genuine monthly revenue. Immediate milestone: first genuine £4.99 purchase, then £100 cumulative validation revenue within the original three-month window.

## Evidence refreshed
- Revenue: authoritative live Stripe `Home Quote Check` (`livemode=true`) returned 0 PaymentIntents with `has_more=false`. Genuine live revenue = £0 / £1,000 monthly North Star; cumulative validation revenue = £0 / £100; paying customers = 0.
- Durable funnel: the production Cloudflare snapshot is available again and explicitly excludes QA/demo/test events. Latest committed snapshot fetched 2026-09-19T20:50:30Z: 47 landings → 12 checker starts → 5 uploads → 5 genuine analyses. Extended cohort: 4 genuine analyses → 0 multi-quote analyses → 4 Decision Cases → 0 installer-question actions → 2 share intents → 0 share opens → 0 recipient starts → 0 outbound/commercial clicks → 0 checkouts. Rates: landing→start 26%; start→upload 42%; upload→analysis 100%; extended analysis→comparison 0%; analysis→Decision Case 100%; Decision Case→share intent 50%.
- Source evidence: direct = 33 landings / 12 starts / 5 uploads / 5 genuine analyses. `results_compare` = 5 landings / 0 starts / 0 uploads. Seven measured organic/static/professional source cohorts have one landing each and zero downstream actions. No qualified organic conversion exists yet.
- SEO/search: authoritative Search Console API for 2026-09-01..16 reports 13 sitemap URLs, 2 with impressions. Homepage: 2 impressions, 0 clicks, avg position 3.5. `/is-this-a-good-heat-pump-quote.html`: 2 impressions, 0 clicks, avg position 5.5. Remaining sitemap URLs have no impressions in this settled window.
- Current SERP research: searches around heat-pump quote comparison are dominated by free installer-matching/lead-generation services. A smaller evidence-led intent exists around quote checklists and design evidence. HQC remains differentiated by serving homeowners who already possess quotes and want an independent written-proposal check rather than more installer leads.

## Commercial diagnosis
Commercial validation is not achieved. The earliest adequately sampled funnel weakness is landing → checker start (12/47, 26%). Checker start → upload is also weak at 42%, while upload → genuine analysis is healthy at 100%. Comparison remains an absolute downstream failure (0 multi-quote analyses), including 5 `results_compare` landings with no start, but its sample is smaller. Acquisition volume is extremely low and organic cohorts have not converted. First-customer distribution + activation therefore outrank broad product polish or additional generic content.

## Active experiments / execution
- Preserve the current homepage single-vs-compare choice and multi-quote-first journey long enough to obtain genuine post-release evidence; do not stack another overlapping homepage UI experiment without rendered QA and attribution.
- Preserve current SEO/indexing experiment. Do not add thin town/location pages or imitate installer lead-gen competitors.
- Independent workstream priority: qualified distribution to homeowners who already have quotes, durable funnel observability, checkout reliability, and evidence-backed activation fixes.

## Next actions
1. Refresh live Stripe first each run and count only genuine successful non-refunded payments.
2. Consume `hqc-ops/live-metrics.json` every run; do not report funnel as unavailable while this durable snapshot exists.
3. Measure whether post-release `results_compare` starts/uploads and multi-quote analyses move above zero before another comparison UI change.
4. Verify the £4.99 Decision Pack checkout path via safe preview/canary/release tests when a rendered production-equivalent path is available.
5. Progress qualified distribution and optimise existing high-intent decision pages; avoid broad feature work and thin acquisition content.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
