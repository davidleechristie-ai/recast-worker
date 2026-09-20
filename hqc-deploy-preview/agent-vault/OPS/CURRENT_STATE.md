# Current state

Updated: 2026-09-21 00:41 Europe/London

North star: Sustain at least £1,000 genuine monthly revenue. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month window.

## Evidence refreshed
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed this run: 0 objects, `has_more=false`. Genuine production revenue remains £0 / £1,000 monthly North Star; cumulative validation revenue £0 / £100; paying customers 0.
- Durable funnel: fresh production `/api/growth-report` was attempted but unavailable in this execution context. Latest settled successful snapshot remains 55 genuine landings → 16 checker starts → 5 uploads → 5 genuine analyses. Extended cohort remains 4 genuine analyses → 0 multi-quote analyses → 4 Decision Cases → 0 installer-question actions → 2 share intents → 0 share opens → 0 recipient starts → 0 outbound/commercial clicks → 0 durable checkouts. Unavailable fresh evidence is not treated as zero.
- Qualified acquisition: latest settled evidence remains direct 39 landings → 16 starts → 5 uploads → 5 genuine analyses. Organic cohorts have no genuine analyses in the latest settled snapshot.
- Technology segmentation remains partial: latest classified evidence remains `heat_pump` 2 landings / 1 start / 0 uploads / 0 genuine / 0 checkouts. Solar/Battery remains behind its non-public correctness gate.
- SEO/search: authoritative Search Console refreshed through settled date 2026-09-18: 0 clicks, 4 impressions, 0% CTR, average position 8.69 across the property. Sitemap remains healthy at transport level (13 submitted, 0 warnings/errors) but Search Console reports 0 indexed in the sitemap response. This does not justify treating SEO as the immediate acquisition strategy.
- Production health: direct `/health`, www `/health` and `/api/growth-report` access was attempted but unavailable in this execution context. Latest settled health remains the prior successful production metrics workflow and guarded checkout release; fresh health is null rather than assumed.

## Commercial diagnosis
First-customer acquisition/conversion remains binding. Latest settled start→upload remains 31% (5/16), the earliest adequately observed downstream constraint. No new evidence justifies stacking another Heat Pump UI experiment. Qualified distribution remains the fastest route to exercising the verified £4.99 checkout while independent Solar/Battery implementation progresses.

## Current milestone
First genuine £4.99 Decision Pack purchase.

## Product strategy extension
- Tracked roadmap: `STRATEGY/PURCHASE_ADVISER_ROADMAP.md`.
- Analysis contract: `STRATEGY/SOLAR_ANALYSIS_BOUNDARY.md`.
- Current authoritative Solar/Battery evidence research is pinned at `RESEARCH/SOLAR_BATTERY_EVIDENCE_2026-09-21.md` (commit `a331341eee937f3dd0a01fd6de5d74cd511dbd3c`). It confirms DNO wording, self-consumption uncertainty, battery-economics assumptions, scope/warranty evidence and the requirement not to turn quote claims into certification.
- Implementation foundation remains `lib/technology-routing.js`: explicit Heat Pump compatibility, unknown-technology rejection, and a non-public Solar/Battery gate that cannot silently fall through to the heat-pump upstream.
- Contract tests remain at `test/technology-routing.test.mjs`, covering legacy Heat Pump compatibility, unknown technology rejection, Solar/Battery heat-pump isolation and explicit shared Solar/Battery adapter routing.
- Synthetic correctness corpus `test/fixtures/solar-battery-cases.json` covers solar-only, solar+battery, battery-only, deliberately incomplete quote evidence and a two-quote comparison. Product names/values are fictional and are test data only, not customer or market evidence.
- Roadmap status: WS1 IN PROGRESS; WS2 IN PROGRESS; WS3 IN PROGRESS but still blocked from execution by Worker routing/adapter boundary; WS5 NOT STARTED pending trustworthy extraction; WS7 IN PROGRESS through the existing Heat Pump Decision Pack; WS8/WS9 DEFERRED.
- Technology routing is still not wired into `worker.js`, CI/preview/canary verified or deployed. Solar/Battery remains non-public.

## Active workstreams
1. Qualified high-intent distribution: continue channels aimed at homeowners who already hold heat-pump quotes; organic cohorts have not yet produced a genuine analysis.
2. Upload activation: latest settled start→upload remains 5/16; diagnose with durable evidence before changing UI again.
3. Paid boundary: repaired £4.99 checkout remains latest verified production state; do not change price again without genuine commercial-intent evidence.
4. Solar/Battery: routing contract/isolation tests, fixture corpus and authoritative evidence rules now exist. Next safe slice is wire the contract into Worker analysis proxy behind the non-public gate, preserve Heat Pump behaviour, then bind fixtures to a dedicated Solar extraction adapter.
5. Instrumentation: existing anonymous technology dimensions are reusable; do not expand PII.

## Expected revenue impact
The refreshed authoritative evidence rules reduce correctness and regulatory-claim risk in the second vertical and provide concrete acceptance criteria for the Solar/Battery adapter, while leaving the live Heat Pump conversion path untouched. Acquisition remains the immediate route to first revenue; the Solar work expands the addressable quote-holder pool without prematurely exposing an unverified product.

## Next actions
1. Refresh live Stripe PaymentIntents and durable checkout/funnel evidence every run; first genuine purchase remains the immediate milestone.
2. Progress qualified high-intent distribution and quote-intake activation without overlapping homepage experiments.
3. Wire `lib/technology-routing.js` into the Worker analysis proxy behind the non-public gate, verify routing tests/Heat Pump regressions, then preview/canary under `SOPS/SHIP_CHANGE.md`; do not expose Solar publicly.
4. Implement the dedicated Solar/Battery structured extraction adapter against `RESEARCH/SOLAR_BATTERY_EVIDENCE_2026-09-21.md` and bind `test/fixtures/solar-battery-cases.json` to correctness tests.
5. Then prove single/two-quote Solar journeys and begin deterministic Financial Assumptions Check.
6. Re-rank when additional genuine evidence arrives; unavailable metrics remain null rather than assumed zero.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy for deployment. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
