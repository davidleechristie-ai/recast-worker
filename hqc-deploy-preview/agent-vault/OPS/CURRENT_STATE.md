# Current state

Updated: 2026-09-20 21:44 Europe/London

North star: Sustain at least £1,000 genuine monthly revenue. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month window.

## Evidence refreshed
- Revenue: fresh authoritative live PaymentIntent execution was unavailable in this execution context. Latest authoritative successful evidence remains 0 PaymentIntents, genuine production revenue £0 / £1,000 monthly North Star; cumulative validation revenue £0 / £100; paying customers 0. Unavailable fresh evidence is not treated as zero.
- Durable funnel: fresh production `/api/growth-report` was attempted but inaccessible in this execution context. Latest settled successful snapshot remains 55 genuine landings → 16 checker starts → 5 uploads → 5 genuine analyses. Extended cohort remains 4 genuine analyses → 0 multi-quote analyses → 4 Decision Cases → 0 installer-question actions → 2 share intents → 0 share opens → 0 recipient starts → 0 outbound/commercial clicks → 0 durable checkouts.
- Qualified acquisition: latest settled evidence remains direct 39 landings → 16 starts → 5 uploads → 5 genuine analyses. Organic cohorts have no genuine analyses in the latest settled snapshot.
- Technology segmentation remains partial: latest classified evidence remains `heat_pump` 2 landings / 1 start / 0 uploads / 0 genuine / 0 checkouts. Solar/Battery remains behind its non-public correctness gate.
- SEO/search: fresh public searches on 2026-09-20 for both HQC heat-pump and solar/battery footprints returned no results. No newer authoritative Search Console dataset was available; latest settled Search Console evidence remains 13 sitemap URLs, 2 receiving impressions, 4 total impressions and 0 clicks.
- Production health: direct `/health` and `/api/growth-report` were attempted but inaccessible in this execution context. Latest settled health remains the prior successful production metrics workflow and guarded checkout release; fresh health is null rather than assumed.

## Commercial diagnosis
First-customer acquisition/conversion remains binding. Latest settled start→upload remains 31% (5/16), the earliest adequately observed downstream constraint. No new evidence justifies stacking another Heat Pump UI experiment. Qualified distribution remains the fastest route to exercising the verified £4.99 checkout while independent Solar/Battery implementation progresses.

## Current milestone
First genuine £4.99 Decision Pack purchase.

## Product strategy extension
- Tracked roadmap: `STRATEGY/PURCHASE_ADVISER_ROADMAP.md`.
- Analysis contract: `STRATEGY/SOLAR_ANALYSIS_BOUNDARY.md`.
- Implementation progressed this run: `lib/technology-routing.js` now provides an explicit side-effect-free technology routing contract. Legacy Heat Pump can retain the current upstream only when explicitly requested; unknown technologies are rejected; Solar/Battery and battery-only return a non-ready gate unless a dedicated `HQC_SOLAR_ANALYSIS_API_BASE` is configured. They cannot silently fall through to the heat-pump upstream.
- Contract tests added at `test/technology-routing.test.mjs`, covering legacy Heat Pump compatibility, unknown technology rejection, Solar/Battery heat-pump isolation and explicit shared Solar/Battery adapter routing. Commits: `e172171799cf33e87dbf7135e10cd461fd6c6934`, `12cbbe73a8f1eb2c72a58d017a62114f186cfff6`.
- This is implementation foundation only: it is not yet wired into `worker.js`, tested by CI, deployed, or a public Solar capability. No production/UI claim is made.

## Active workstreams
1. Qualified high-intent distribution: continue channels aimed at homeowners who already hold heat-pump quotes; organic cohorts have not yet produced a genuine analysis.
2. Upload activation: latest settled start→upload remains 5/16; diagnose with durable evidence before changing UI again.
3. Paid boundary: repaired £4.99 checkout remains latest verified production state; do not change price again without genuine commercial-intent evidence.
4. Solar/Battery: routing contract and isolation tests now exist. Next safe slice is wire the contract into Worker analysis proxy behind the non-public gate, run tests, and preserve Heat Pump behaviour; then implement structured Solar extraction fixtures/adapter.
5. Instrumentation: existing anonymous technology dimensions are reusable; do not expand PII.

## Expected revenue impact
The routing contract reduces the risk that a Solar/Battery customer receives heat-pump analysis and turns the second-vertical boundary into executable code while preserving the live Heat Pump path. It shortens the route to a trustworthy Solar/Battery MVP without creating a premature public CTA. Acquisition remains the immediate route to first revenue.

## Next actions
1. Refresh live Stripe PaymentIntents and durable checkout/funnel evidence when execution access is available; first genuine purchase remains the immediate milestone.
2. Progress qualified high-intent distribution and quote-intake activation without overlapping homepage experiments.
3. Wire `lib/technology-routing.js` into the Worker analysis proxy behind the non-public gate, verify routing tests/Heat Pump regressions, then preview/canary under `SOPS/SHIP_CHANGE.md`; do not expose Solar publicly.
4. Implement Solar/Battery structured extraction fixtures and adapter; prove solar-only, solar+battery, battery-only, malformed/partial and two-quote cases.
5. Then prove single/two-quote Solar journeys and begin deterministic Financial Assumptions Check.
6. Re-rank when additional genuine evidence arrives; unavailable metrics remain null rather than assumed zero.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy for deployment. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
