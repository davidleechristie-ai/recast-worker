# Run log

Append concise dated run records here. Record only observed evidence and completed work.

## 2026-09-22 07:50 Europe/London — Solar trust contract fully green behind gate
- REVENUE: fresh authoritative live Stripe `Home Quote Check` PaymentIntents returned 0 objects with `has_more=false`; genuine revenue remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers.
- Funnel/acquisition: no newer qualified technology/source cohort established; latest settled remains 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains 40 → 16 → 5 → 5. Missing dimensions remain null.
- Search: no newer authoritative Search Console dataset established; latest available remains 0 clicks / 4 impressions / 0% CTR / average position 8.07. Missing fresh evidence is null.
- PRODUCTION: no UI or production analysis change made; prior rendered recovery and router-isolation verification remain authoritative.
- DIAGNOSIS: isolated the Solar CI failure to the fixture contract. The partial synthetic quote explicitly said a battery was present but its expected-value mapper discarded that presence because make/model/capacity were unknown, so `battery usable capacity` was not surfaced as a required evidence gap.
- FIX: added explicit `batteryMentioned: true` to the partial fixture and propagated it through the fixture-to-evidence mapper. Unknown battery specification remains unknown; no evidence requirement was weakened.
- TESTS: GitHub Actions run `35696615513` passed executable Solar analysis, extraction, evidence contract, fixture contract and technology-isolation checks. The complete behind-gate trust suite is now green.
- ROADMAP: trust-contract blocker closed. Next boundary is wiring the dedicated Solar service behind the existing non-public request gate and validating complete/partial/malformed/two-quote request behaviour before Financial Assumptions Check or any public Solar CTA.
- OPS/LEARNINGS.md unchanged: this is engineering correctness evidence, not a reusable customer/product learning.

## 2026-09-22 06:46 Europe/London — executable Solar analysis boundary added behind gate
- REVENUE: fresh authoritative live Stripe `Home Quote Check` PaymentIntents returned 0 objects with `has_more=false`; genuine revenue remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers.
- Funnel/acquisition: no newer qualified technology/source cohort established; latest settled remains 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains 40 → 16 → 5 → 5. Missing dimensions remain null.
- Search: fresh Search Console 28-day summary remains 0 clicks / 4 impressions / 0% CTR / average position 8.07. Visibility remains too small for meaningful SEO conversion inference.
- Production: fresh `/health` and `/api/metrics` requests were made and no customer-facing regression was established; last rendered proof remains the successful mobile/desktop recovery. Heat Pump was not changed this run.
- PRODUCT: added `lib/solar-battery-analysis.js`, a non-public executable analysis/comparison layer over the structured Solar/Battery extractor. It emits evidence-state findings, preserves missing evidence, carries explicit non-certification guardrails and compares two quotes without selecting an automatic winner.
- TESTS: added `test/solar-battery-analysis.test.mjs`; its dedicated GitHub Actions step passed. Added dedicated `HQC Solar analysis CI` to keep this work independent of production release.
- CI: the first broader CI run exposed a failure in the pre-existing evidence/fixture contract group while the new executable-analysis tests passed. Split the workflow into independent extraction/evidence/fixture/isolation checks to pinpoint the legacy contract failure before integration. No contract was weakened and nothing was deployed.
- ROADMAP: executable analysis has moved from design/extraction-only to tested behind-gate implementation. Integration remains blocked on a fully green trust contract; Financial Assumptions Check remains behind that boundary.
- OPS/LEARNINGS.md unchanged: no authoritative reusable customer/product lesson established.
- NEXT: identify and correct the failing evidence/fixture contract, then connect the service behind the non-public technology gate only after the complete Solar suite is green.

## 2026-09-22 05:42 Europe/London — technology isolation restored safely in production
- REVENUE: fresh authoritative live Stripe `Home Quote Check` PaymentIntents returned 0 objects with `has_more=false`; genuine revenue remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers.
- Funnel/acquisition: fresh production endpoint evidence unavailable; latest settled remains 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains 40 → 16 → 5 → 5. Missing fresh evidence is null.
- Search: no newer authoritative Search Console dataset available; latest through 2026-09-19 remains 0 clicks / 4 impressions / 0% CTR / average position 8.07.
- PRODUCTION ROUTER: workflow run `35646864766`, attempt 2, completed successfully. Job `106607937449` passed technology evidence/routing tests, prepared the router-only Wrangler config, deployed production without static assets, and passed live verification of Heat Pump compatibility, explicit Solar isolation and durable metrics.
- PRESENTATION: no UI assets were deployed by this release. The prior guarded recovery remains the authoritative rendered production evidence and had passed 390×844 mobile + 1440×1000 desktop.
- ROADMAP: technology-isolation blocker is closed. Dedicated Solar extraction/evidence modules exist and remain non-public; next engineering boundary is wiring them into a complete dedicated Solar analysis path and validating single/two-quote Decision Case behaviour before Financial Assumptions Check.
- OPS/LEARNINGS.md unchanged: this is operational verification, not a new customer/product learning.
- NEXT: continue qualified Heat Pump acquisition toward first £4.99 purchase while independently wiring and testing the dedicated non-public Solar analysis path without changing Heat Pump.

## Earlier runs
Earlier detailed run history remains available in repository history. The current state and durable learnings carry forward the authoritative operating context.