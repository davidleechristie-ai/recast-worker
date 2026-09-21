# Run log

Append concise dated run records here. Record only observed evidence and completed work.

## 2026-09-21 17:42 Europe/London — production technology boundary live; verifier corrected
- Revenue: no newer authoritative Stripe object set was available; latest verified genuine monthly revenue remains £0 / £1,000, validation revenue £0 / £100, paying customers 0. Missing fresh evidence remains null.
- Funnel/acquisition: latest authoritative production snapshot remains 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 durable checkouts. No newer parsed snapshot was available.
- Search: latest authoritative Search Console evidence remains 0 clicks / 4 impressions through 2026-09-19; no newer dataset was available.
- PRODUCTION EVIDENCE: release run `35620826072` passed both 9/9 Solar evidence/extraction and 9/9 technology/request-routing suites and deployed `hqc-production` version `1c0821fd-1864-4ae0-90e8-f899cae8bc87`. Durable Object `HqcMetrics` remained bound. Production default Heat Pump health returned HTTP 200.
- Solar isolation worked: explicit `x-hqc-technology: solar_battery` returned HTTP 409 with `technology_analysis_not_ready`, so Solar did not fall through to Heat Pump. The job failed only because its assertion expected 503.
- COMPLETED: corrected the release verifier to the router's intentional 409 contract in commit `bf3dd66d0fb20df07748960c2655afbedce272ca`. A follow-up run had not registered at evidence cutoff.
- Public status: non-UI technology isolation boundary is LIVE; customer-facing Solar remains gated because no executable dedicated Solar analysis endpoint is configured and end-to-end/rendered gates remain incomplete.
- Primary revenue bottleneck remains first-customer acquisition/activation. This release removes product-integrity risk for the second vertical but does not itself constitute customer acquisition.
- Learning: no durable customer/product lesson added; the HTTP expectation mismatch is an implementation verification defect.
- NEXT: verify the corrected workflow; connect the dedicated Solar executable analysis path; prove single/two-quote, instrumentation, checkout and rendered gates; continue qualified quote-holder acquisition in parallel.

## 2026-09-21 16:42 Europe/London — production router release path created
- Revenue: no newer authoritative Stripe object set was available in this execution context; latest verified genuine monthly revenue remains £0 / £1,000, validation revenue £0 / £100, paying customers 0. Missing fresh payment evidence remains null.
- Funnel/acquisition: latest authoritative production snapshot remains 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 durable checkouts. No newer parsed snapshot was available, so these values are not relabelled as fresh.
- Search: no newer authoritative Search Console dataset was available; latest remains 0 clicks / 4 impressions through 2026-09-19.
- COMPLETED: created `.github/workflows/hqc-production-router-release.yml` in commit `c89238ea1c60cc49778eaaac14233c59d9646418`. The production release is deliberately scoped to router/Worker/config changes, not agent-vault documentation, preventing hourly state writes from redeploying production.
- Release gate: workflow runs 9/9 Solar evidence/extraction tests plus technology/request-routing tests before deployment; deploys `hqc-production` with `wrangler.production.toml`; then verifies production health, legacy/default Heat Pump `/api/_healthcheck`, explicit Solar/Battery rejection with `technology_analysis_not_ready`, and durable metrics health. This is a non-UI release and does not expose Solar publicly.
- Evidence cutoff: immediately after commit, GitHub had not yet registered a workflow run for the commit. Production-router LIVE status is therefore not claimed.
- Primary revenue bottleneck remains first-customer acquisition/activation; this independent engineering release reduces risk/time to the second quote-holder vertical.
- Learning: no new durable lesson; release automation is implementation progress under existing technology-readiness learning.
- NEXT: verify the production release run; if green, record router as LIVE while keeping Solar CTA gated, then connect the dedicated Solar executable analysis path and prove single/two-quote + checkout + instrumentation + rendered gates.

## Earlier runs
Earlier detailed run history remains available in repository history. The current state and durable learnings carry forward the authoritative operating context.