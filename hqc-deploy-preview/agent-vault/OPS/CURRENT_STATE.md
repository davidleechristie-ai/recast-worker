# Current state

Updated: 2026-09-21 02:44 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month window.

## Evidence refreshed
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: 0 objects, `has_more=false`. Genuine production revenue remains **£0 / £1,000 monthly**, cumulative validation revenue **£0 / £100**, paying customers **0**.
- Durable funnel: latest settled successful snapshot remains 55 genuine landings → 16 checker starts → 5 uploads → 5 genuine analyses. Extended settled cohort remains 4 genuine analyses → 0 multi-quote analyses → 4 Decision Cases → 0 installer-question actions → 2 share intents → 0 share opens → 0 recipient starts → 0 outbound/commercial clicks → 0 durable checkouts. Fresh production growth-report content was not directly available in this execution context; unavailable is not treated as zero.
- Qualified acquisition: latest settled evidence remains direct 39 landings → 16 starts → 5 uploads → 5 genuine analyses. Organic cohorts have no genuine analyses in the latest settled snapshot.
- Technology mix remains partial: latest classified evidence remains `heat_pump` 2 landings / 1 start / 0 uploads / 0 genuine / 0 checkouts. Solar/Battery remains behind its non-public correctness gate.
- Search: no newer authoritative Search Console dataset was available in this execution. Latest settled evidence remains 0 clicks, 4 impressions, 0% CTR, average position 8.69 through 2026-09-18. SEO remains supporting rather than the immediate acquisition strategy.
- Production/CI health: `HQC North Star metrics snapshot` run 35549876134 completed successfully. The request-level technology isolation commit `7e8e5901e2b567c2abca2d8a3f4dad8334daa213` also has a successful HQC Cloudflare bridge run (35548726219). No customer-facing Solar capability is claimed.

## Commercial diagnosis
First-customer acquisition/conversion remains binding. Latest settled start→upload remains 31% (5/16), the earliest adequately observed downstream constraint. No new evidence justifies stacking another Heat Pump UI experiment. Qualified distribution remains the fastest route to exercising the verified £4.99 checkout while independent Solar/Battery implementation progresses.

## Current milestone
First genuine £4.99 Decision Pack purchase.

## Product strategy / Solar-Battery progress
- Tracked roadmap: `STRATEGY/PURCHASE_ADVISER_ROADMAP.md`.
- Analysis boundary: `STRATEGY/SOLAR_ANALYSIS_BOUNDARY.md`.
- Authoritative research: `RESEARCH/SOLAR_BATTERY_EVIDENCE_2026-09-21.md`.
- Technology routing and request-level isolation are implemented in source and CI-green; legacy Heat Pump remains the explicit default and Solar/Battery cannot silently fall through to Heat Pump.
- New this run: `lib/solar-battery-evidence.js` defines the structured evidence contract for panel, array, inverter, battery, generation assumptions, self-consumption/export, shading, scaffolding/roof works, DNO treatment, warranties, MCS wording, scope/exclusions and price. It preserves missing evidence as null/gaps and rejects invalid numeric outputs rather than inventing facts. Commit `3415c40867c9a18599ea90f8784d4ee3e571e1af`.
- New correctness tests: `test/solar-battery-evidence.test.mjs` cover complete Solar+Battery evidence, missing-evidence gaps, battery-only reuse and invalid numeric output. Commit `7992a4367f0e3348ab18757bc9f24d31a12d2154`.
- Worker production proxy is still not wired to `analysisRequestRoute`; Solar/Battery remains non-public. The new evidence contract is source-only until CI completes and a dedicated extraction adapter is bound to it.

## Active workstreams
1. Qualified high-intent distribution: continue channels aimed at homeowners already holding heat-pump quotes; organic cohorts have not yet produced a genuine analysis.
2. Upload activation: latest settled start→upload remains 5/16; diagnose with durable evidence before another UI change.
3. Paid boundary: repaired £4.99 checkout remains latest verified production state; do not change price without genuine commercial-intent evidence.
4. Solar/Battery: routing/isolation boundary is CI-green and the evidence contract/tests now exist. Next safe slice is bind representative fixtures to the evidence contract/extraction adapter, then wire request routing into the Worker behind the non-public gate while preserving Heat Pump behaviour.
5. Instrumentation: existing anonymous technology dimensions are reusable; do not expand PII.

## Expected revenue impact
The evidence contract turns Solar/Battery from a routing-only foundation into a testable correctness boundary: future extraction output must preserve unknowns, surface decision gaps and reject invalid values before it can reach comparison/Decision Pack logic. This reduces risk/time to a trustworthy second vertical without changing the live Heat Pump path. Acquisition remains the immediate route to first revenue.

## Next actions
1. Refresh live Stripe and durable checkout/funnel evidence every run; first genuine purchase remains immediate milestone.
2. Continue qualified acquisition/intake activation without overlapping homepage experiments.
3. Verify CI for the new Solar evidence contract/tests; if green, bind `test/fixtures/solar-battery-cases.json` to adapter correctness tests.
4. Wire `analysisRequestRoute` into the Worker behind the non-public gate, run Heat Pump/routing regressions, then preview/canary under `SOPS/SHIP_CHANGE.md`; do not expose Solar publicly.
5. Implement dedicated Solar/Battery structured extraction against the evidence contract, then prove single/two-quote journeys and begin deterministic Financial Assumptions Check.

## Durable learning
No new durable lesson this run. Evidence reinforces existing acquisition/activation and Solar-readiness lessons but does not establish, overturn or materially refine a reusable conclusion.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy for deployment. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
