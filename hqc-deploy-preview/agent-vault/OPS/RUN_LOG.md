# Run log

Append concise dated run records here. Record only observed evidence and completed work.

## 2026-09-21 13:50 Europe/London — technology-aware Worker boundary activated in source
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: 0 objects, `has_more=false`; genuine monthly revenue £0 / £1,000; cumulative validation revenue £0 / £100; paying customers 0.
- Funnel/acquisition: no newer parsed authoritative counts were available; latest settled remains 55 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 durable checkouts. Unavailable fresh evidence was not converted to zero.
- Search/health: no newer authoritative Search Console dataset was available; direct production web fetch was unavailable, so fresh production health is null rather than assumed.
- Diagnosis: representative Solar extraction is green (9/9), but `worker.js` still proxied all generic analysis traffic to the legacy Heat Pump upstream. This made request-level isolation the smallest safe integration step before public Solar exposure.
- COMPLETED: created `worker-entry.js` to enforce `analysisRequestRoute` before the legacy Worker. Heat Pump delegates unchanged; explicit `solar_battery`/`battery` cannot fall through and is rejected with `technology_analysis_not_ready` unless a dedicated Solar analysis base is configured. Updated `wrangler.toml` to use this entry. Commits `f1526cbf8570204b2ad1b9f353ce40c047450706` and `614429ffece11ffb9e5092bac78f025408278884`.
- Release evidence: GitHub automatically triggered HQC Cloudflare bridge workflow `35601642799` for `614429ff...`; it remained pending at evidence cutoff. No preview/canary/production success is claimed yet. The change is non-UI and does not expose a Solar CTA.
- Primary revenue bottleneck: first-customer acquisition/conversion; latest settled start→upload remains 31%.
- Expected revenue impact: removes the dangerous Solar→Heat Pump fall-through path and creates a safe server boundary for connecting the dedicated Solar adapter, shortening time to a trustworthy second-vertical paid-intent test without destabilising Heat Pump.
- Learning: no new durable customer/product lesson; this is implementation progress under the existing technology-readiness lesson.
- NEXT: verify the bridge workflow and preview/canary; then connect the verified Solar extraction adapter to an executable gated analysis path and prove single/two-quote journeys before rendered public exposure. Continue acquisition/revenue monitoring in parallel.

## 2026-09-21 12:42 Europe/London — Solar representative extraction gate green
- Revenue: no newer authoritative payment object set was available in this execution context; latest live Stripe evidence remains 0 PaymentIntents, genuine monthly revenue £0 / £1,000, cumulative validation revenue £0 / £100, paying customers 0. Stale evidence was not promoted as fresh.
- Funnel/acquisition: latest live-metrics workflow completed successfully at 10:51Z, but no newer parsed authoritative counts were available here. Latest settled remains 55 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 durable checkouts. Latest settled direct cohort remains 39 / 16 / 5 / 5.
- Search: latest authoritative Search Console evidence through 2026-09-19 remains 0 clicks, 4 impressions, 0% CTR, average position 8.07; no newer authoritative dataset was available.
- CI evidence: inspected authoritative workflow logs for `1ce7fcb3abee7c38d80c001d371b44e43c018d5d`. Solar technology evidence + extraction tests now pass **9/9** including solar-only, solar+battery, battery-only, partial missing-evidence and two-quote comparison fixtures. This confirms the null-normalisation fix removed the two known deterministic failures.
- Preview evidence: the workflow successfully deployed `hqc-migration-preview` version `67286aec-43b2-4019-a437-e8331fc3127c`; verification began and `/` returned 200, then the workflow was cancelled/superseded before the remaining verification completed. Production inspection/deployment steps were skipped. No preview-complete or production-readiness claim is made.
- Source inspection: current `worker.js` still routes generic `/api/*` analysis traffic directly to the legacy heat-pump upstream. The technology-aware request routing module is not yet wired into this production boundary, so Solar remains correctly non-public.
- COMPLETED: verified the previously pending Solar extraction gate from authoritative CI logs and advanced persistent state from “CI pending” to “9/9 extraction tests green”; identified Worker integration as the next concrete engineering boundary. State commit `6b42c883876ff0dc6cb5a02e45bbdd5eb0046cf3`.
- Primary revenue bottleneck: first-customer acquisition/conversion; latest settled start→upload remains 31%.
- Expected revenue impact: removes the known extractor correctness blocker and shortens the route to a trustworthy Solar/Battery paid-intent test without exposing Solar prematurely or destabilising Heat Pump.
- Learning: no new durable customer/product lesson; this is implementation progress under the existing Solar-readiness lesson.
- NEXT: continue acquisition/revenue monitoring; wire technology-aware request routing into the Worker behind the non-public gate with Heat Pump regression coverage, then complete preview/canary verification before any production/public Solar exposure.

## Earlier runs
Earlier detailed run history remains available in repository history. The current state and durable learnings carry forward the authoritative operating context.
