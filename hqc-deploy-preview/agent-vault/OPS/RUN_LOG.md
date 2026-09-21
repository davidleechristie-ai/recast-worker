# Run log

Append concise dated run records here. Record only observed evidence and completed work.

## 2026-09-21 14:44 Europe/London — routing preview gate passed; production boundary prepared
- Revenue/funnel/search: no newer authoritative Stripe, parsed funnel or Search Console dataset was available in this execution context. Latest verified revenue remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers; latest settled funnel remains 55 landings → 16 starts → 5 uploads → 5 genuine analyses → 0 durable checkouts. Missing fresh evidence remained null.
- VERIFIED: GitHub workflow `35603189156` for `6c436d8b...` completed successfully. Solar evidence/extraction tests passed 9/9; Cloudflare preview deployment succeeded as version `daf09043-fa92-4cc9-8798-4b8d9a747b9a`; all configured preview route/asset/API checks passed.
- FIX VERIFIED: the prior Cloudflare 10064 Durable Object deployment failure is resolved by preserving the `HqcMetrics` export from `worker-entry.js`; no delete-class migration or metrics-data deletion was used.
- Production health evidence: workflow routing inspection observed `https://homequotecheck.co.uk/` returning HTTP 200 at 13:04Z. This does not imply the new router is production-live.
- COMPLETED: changed `wrangler.production.toml` to use the preview-verified `worker-entry.js`, commit `f753ac9a85e74b6dc9268f365445bb9a0880f93e`. This prepares the non-UI production boundary while Solar remains gated.
- Primary revenue bottleneck remains first-customer acquisition/conversion; latest settled start→upload remains 31%.
- Expected impact: technology isolation is no longer blocked at preview, allowing progressive production/public expansion without risking Solar requests being analysed as Heat Pump.
- Learning: no new durable customer/product lesson; this is release evidence under the existing technology-readiness lesson.
- NEXT: deploy and verify the non-UI router in production through GitHub/Cloudflare, explicitly regression-check Heat Pump/durable metrics/Solar rejection, then connect the dedicated Solar executable path and complete end-to-end + rendered gates before public Solar CTA.

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

## Earlier runs
Earlier detailed run history remains available in repository history. The current state and durable learnings carry forward the authoritative operating context.
