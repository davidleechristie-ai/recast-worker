# Current state

Updated: 2026-09-20 23:41 Europe/London

North star: Sustain at least £1,000 genuine monthly revenue. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month window.

## Evidence refreshed
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed this run: 0 objects, `has_more=false`. Genuine production revenue remains £0 / £1,000 monthly North Star; cumulative validation revenue £0 / £100; paying customers 0.
- Durable funnel: fresh production `/api/growth-report` was not available in this execution context. Latest settled successful snapshot remains 55 genuine landings → 16 checker starts → 5 uploads → 5 genuine analyses. Extended cohort remains 4 genuine analyses → 0 multi-quote analyses → 4 Decision Cases → 0 installer-question actions → 2 share intents → 0 share opens → 0 recipient starts → 0 outbound/commercial clicks → 0 durable checkouts. Unavailable fresh evidence is not treated as zero.
- Qualified acquisition: latest settled evidence remains direct 39 landings → 16 starts → 5 uploads → 5 genuine analyses. Organic cohorts have no genuine analyses in the latest settled snapshot.
- Technology segmentation remains partial: latest classified evidence remains `heat_pump` 2 landings / 1 start / 0 uploads / 0 genuine / 0 checkouts. Solar/Battery remains behind its non-public correctness gate.
- SEO/search: fresh public searches on 2026-09-20 for both HQC heat-pump and solar/battery site footprints returned no results. No newer authoritative Search Console dataset was available; latest settled Search Console evidence remains 13 sitemap URLs, 2 receiving impressions, 4 total impressions and 0 clicks.
- Production health: fresh direct `/health` and www `/health` access was unavailable in this execution context. Latest settled health remains the prior successful production metrics workflow and guarded checkout release; fresh health is null rather than assumed.

## Commercial diagnosis
First-customer acquisition/conversion remains binding. Latest settled start→upload remains 31% (5/16), the earliest adequately observed downstream constraint. No new evidence justifies stacking another Heat Pump UI experiment. Qualified distribution remains the fastest route to exercising the verified £4.99 checkout while independent Solar/Battery implementation progresses.

## Current milestone
First genuine £4.99 Decision Pack purchase.

## Product strategy extension
- Tracked roadmap: `STRATEGY/PURCHASE_ADVISER_ROADMAP.md`.
- Analysis contract: `STRATEGY/SOLAR_ANALYSIS_BOUNDARY.md`.
- Implementation foundation remains `lib/technology-routing.js`: explicit Heat Pump compatibility, unknown-technology rejection, and a non-public Solar/Battery gate that cannot silently fall through to the heat-pump upstream.
- Contract tests remain at `test/technology-routing.test.mjs`, covering legacy Heat Pump compatibility, unknown technology rejection, Solar/Battery heat-pump isolation and explicit shared Solar/Battery adapter routing.
- New synthetic correctness corpus: `test/fixtures/solar-battery-cases.json` now covers solar-only, solar+battery, battery-only, deliberately incomplete quote evidence and a two-quote comparison. Product names/values are fictional and are test data only, not customer or market evidence.
- Roadmap status this run: WS1 IN PROGRESS; WS2 IN PROGRESS; WS3 now IN PROGRESS through the fixture corpus but still blocked from execution by Worker routing/adapter boundary; WS5 NOT STARTED pending trustworthy extraction; WS7 IN PROGRESS through the existing Heat Pump Decision Pack; WS8/WS9 DEFERRED.
- Technology routing is still not wired into `worker.js`, CI/preview/canary verified or deployed. Solar/Battery remains non-public.

## Active workstreams
1. Qualified high-intent distribution: continue channels aimed at homeowners who already hold heat-pump quotes; organic cohorts have not yet produced a genuine analysis.
2. Upload activation: latest settled start→upload remains 5/16; diagnose with durable evidence before changing UI again.
3. Paid boundary: repaired £4.99 checkout remains latest verified production state; do not change price again without genuine commercial-intent evidence.
4. Solar/Battery: routing contract/isolation tests and initial correctness fixtures now exist. Next safe slice is wire the contract into Worker analysis proxy behind the non-public gate, preserve Heat Pump behaviour, then bind the fixture corpus to a dedicated Solar extraction adapter.
5. Instrumentation: existing anonymous technology dimensions are reusable; do not expand PII.

## Expected revenue impact
The fixture corpus turns Solar/Battery correctness from an abstract checklist into executable acceptance examples for the forthcoming adapter, including the critical requirement that missing evidence stays missing rather than being invented. This reduces time and regression risk to a trustworthy second vertical without changing the live Heat Pump journey. Acquisition remains the immediate route to first revenue.

## Next actions
1. Refresh live Stripe PaymentIntents and durable checkout/funnel evidence every run; first genuine purchase remains the immediate milestone.
2. Progress qualified high-intent distribution and quote-intake activation without overlapping homepage experiments.
3. Wire `lib/technology-routing.js` into the Worker analysis proxy behind the non-public gate, verify routing tests/Heat Pump regressions, then preview/canary under `SOPS/SHIP_CHANGE.md`; do not expose Solar publicly.
4. Implement the dedicated Solar/Battery structured extraction adapter and bind `test/fixtures/solar-battery-cases.json` to correctness tests.
5. Then prove single/two-quote Solar journeys and begin deterministic Financial Assumptions Check.
6. Re-rank when additional genuine evidence arrives; unavailable metrics remain null rather than assumed zero.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy for deployment. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
