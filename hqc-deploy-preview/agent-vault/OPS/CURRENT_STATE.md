# Current state

Updated: 2026-09-21 01:44 Europe/London

North star: Sustain at least £1,000 genuine monthly revenue. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month window.

## Evidence refreshed
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed this run: 0 objects, `has_more=false`. Genuine production revenue remains £0 / £1,000 monthly North Star; cumulative validation revenue £0 / £100; paying customers 0.
- Durable funnel: fresh production `/api/growth-report` remains unavailable in this execution context. Latest settled successful snapshot remains 55 genuine landings → 16 checker starts → 5 uploads → 5 genuine analyses. Extended settled cohort remains 4 genuine analyses → 0 multi-quote analyses → 4 Decision Cases → 0 installer-question actions → 2 share intents → 0 share opens → 0 recipient starts → 0 outbound/commercial clicks → 0 durable checkouts. Unavailable fresh evidence is not treated as zero.
- Qualified acquisition: latest settled evidence remains direct 39 landings → 16 starts → 5 uploads → 5 genuine analyses. Organic cohorts have no genuine analyses in the latest settled snapshot.
- Technology segmentation remains partial: latest classified evidence remains `heat_pump` 2 landings / 1 start / 0 uploads / 0 genuine / 0 checkouts. Solar/Battery remains behind its non-public correctness gate.
- SEO/search: fresh public searches for the HQC site footprint returned no results. Latest authoritative Search Console evidence remains through settled date 2026-09-18: 0 clicks, 4 impressions, 0% CTR, average position 8.69; sitemap transport healthy but sitemap response reported 0 indexed. SEO remains supporting, not the immediate acquisition strategy.
- Production health: latest settled health remains the prior successful production metrics workflow and guarded checkout release. The new request-routing commits triggered GitHub Actions; custom-domain canary for `7e8e5901e2b567c2abca2d8a3f4dad8334daa213` was pending when checked, so no new deployment/verification claim is made.

## Commercial diagnosis
First-customer acquisition/conversion remains binding. Latest settled start→upload remains 31% (5/16), the earliest adequately observed downstream constraint. No new evidence justifies stacking another Heat Pump UI experiment. Qualified distribution remains the fastest route to exercising the verified £4.99 checkout while independent Solar/Battery implementation progresses.

## Current milestone
First genuine £4.99 Decision Pack purchase.

## Product strategy extension
- Tracked roadmap: `STRATEGY/PURCHASE_ADVISER_ROADMAP.md`.
- Analysis contract: `STRATEGY/SOLAR_ANALYSIS_BOUNDARY.md`.
- Authoritative Solar/Battery evidence research: `RESEARCH/SOLAR_BATTERY_EVIDENCE_2026-09-21.md`.
- Existing foundation: `lib/technology-routing.js` explicitly preserves legacy Heat Pump routing, rejects unknown technology and prevents Solar/Battery falling through to the heat-pump upstream.
- New source slice this run: `lib/analysis-request-routing.js` resolves technology at the request boundary without consuming PDF/form-data bodies. It accepts an explicit `x-hqc-technology` header or query hint, preserves legacy Heat Pump default, and returns the dedicated Solar adapter only when configured.
- New tests: `test/analysis-request-routing.test.mjs` cover legacy Heat Pump compatibility, explicit Solar/Battery isolation, configured Solar adapter routing, header precedence and unsupported-technology rejection.
- Commits: request routing `05dd0ebe81419b58d0c43dcc21c382589d00feb0`; isolation tests `7e8e5901e2b567c2abca2d8a3f4dad8334daa213`; roadmap update `ce437c3c1522214c0b083a4b2d3ecedd89217b0e`.
- Worker production proxy is still not wired to this helper. Solar/Battery remains non-public and no production capability is claimed.

## Active workstreams
1. Qualified high-intent distribution: continue channels aimed at homeowners who already hold heat-pump quotes; organic cohorts have not yet produced a genuine analysis.
2. Upload activation: latest settled start→upload remains 5/16; diagnose with durable evidence before changing UI again.
3. Paid boundary: repaired £4.99 checkout remains latest verified production state; do not change price again without genuine commercial-intent evidence.
4. Solar/Battery: routing contract, request-level isolation boundary, fixture corpus and evidence rules exist in source. Next safe slice is wire the request boundary into the Worker analysis proxy, preserve Heat Pump behaviour, then bind fixtures to a dedicated Solar extraction adapter.
5. Instrumentation: existing anonymous technology dimensions are reusable; do not expand PII.

## Expected revenue impact
The request-level boundary removes another implementation ambiguity: Solar/Battery can now be identified before proxying without parsing/consuming uploaded quote bodies, while legacy Heat Pump remains the explicit default. This reduces risk and time to the second vertical, but does not itself create a customer-facing capability. Acquisition remains the immediate route to first revenue.

## Next actions
1. Refresh live Stripe PaymentIntents and durable checkout/funnel evidence every run; first genuine purchase remains the immediate milestone.
2. Progress qualified high-intent distribution and quote-intake activation without overlapping homepage experiments.
3. Verify the request-routing test/CI result. If green, wire `analysisRequestRoute` into `worker.js` behind the non-public gate, run Heat Pump/routing regressions, then preview/canary under `SOPS/SHIP_CHANGE.md`; do not expose Solar publicly.
4. Implement the dedicated Solar/Battery structured extraction adapter and bind `test/fixtures/solar-battery-cases.json` to correctness tests.
5. Then prove single/two-quote Solar journeys and begin deterministic Financial Assumptions Check.
6. Re-rank when additional genuine evidence arrives; unavailable metrics remain null rather than assumed zero.

## Durable learning
No new durable lesson this run. Evidence reinforces the existing acquisition/activation and Solar-readiness lessons but does not establish, overturn or materially refine a reusable conclusion.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy for deployment. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
