# Current state

Updated: 2026-09-21 12:42 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month validation window.

## Evidence refreshed
- Revenue: latest authoritative live Stripe `Home Quote Check` PaymentIntents evidence remains 0 objects, `has_more=false`. Genuine production revenue remains **£0 / £1,000 monthly**, cumulative validation revenue **£0 / £100**, paying customers **0**. No newer payment evidence was available in this execution context; it is not re-labelled as fresh.
- Durable funnel: latest successful live-metrics workflow completed at 2026-09-21 10:51Z. No newer parsed authoritative funnel counts were available here; latest settled counts remain 55 genuine landings → 16 checker starts → 5 uploads → 5 genuine analyses; extended settled evidence remains 4 Decision Cases → 2 share intents → 0 durable checkouts. Unavailable fresh evidence is not treated as zero.
- Qualified acquisition: latest settled evidence remains direct 39 landings → 16 starts → 5 uploads → 5 genuine analyses. Organic cohorts have no genuine analyses in the latest settled snapshot.
- Technology mix remains partial: latest classified evidence remains `heat_pump` 2 landings / 1 start / 0 uploads / 0 genuine / 0 checkouts. Solar/Battery remains behind its non-public correctness gate.
- Search: latest authoritative Search Console evidence through 2026-09-19 remains **0 clicks, 4 impressions, 0% CTR, average position 8.07** over the last 28 settled days. Search visibility remains too small to be the primary first-customer route.
- Production health: no fresh direct production-health response was available in this execution context; fresh health is null rather than assumed. No production release was attempted.
- CI: authoritative logs for commit `1ce7fcb3abee7c38d80c001d371b44e43c018d5d` now show the Solar evidence/extraction suite **9/9 passing**. The workflow then deployed preview successfully, but its preview verification step was cancelled when a newer main commit superseded the run; production steps were skipped. Therefore extraction correctness advanced, but end-to-end preview/readiness is not claimed.

## Commercial diagnosis
First-customer acquisition/conversion remains binding. Latest settled start→upload remains 31% (5/16), the earliest adequately observed downstream constraint. No new evidence justifies stacking another Heat Pump UI experiment. Qualified distribution remains the fastest route to exercising the verified £4.99 checkout while independent Solar/Battery implementation progresses.

## Current milestone
First genuine £4.99 Decision Pack purchase.

## Product strategy / Solar-Battery progress
- Tracked roadmap: `STRATEGY/PURCHASE_ADVISER_ROADMAP.md`.
- Analysis boundary: `STRATEGY/SOLAR_ANALYSIS_BOUNDARY.md`.
- Authoritative research: `RESEARCH/SOLAR_BATTERY_EVIDENCE_2026-09-21.md`.
- Technology routing/request-level isolation, structured evidence contract, representative synthetic fixture corpus and dedicated non-public extraction adapter/tests exist in source.
- Missing numeric evidence now remains null rather than being coerced to zero. The representative evidence/extraction suite is green: 9 tests passed, 0 failed on `1ce7fcb3...`.
- The same run successfully deployed the preview Worker before cancellation, but preview verification did not complete because the workflow was superseded. No production release/readiness is claimed.
- Worker production proxy is still not wired to the Solar adapter. Current `worker.js` still sends generic `/api/*` analysis traffic to the legacy heat-pump upstream. No customer-facing Solar capability is claimed.

## Active workstreams
1. Qualified high-intent distribution: continue channels aimed at homeowners already holding heat-pump quotes; organic cohorts have not yet produced a genuine analysis.
2. Upload activation: latest settled start→upload remains 5/16; diagnose with durable evidence before another UI change.
3. Paid boundary: repaired £4.99 checkout remains latest verified production state; do not change price without genuine commercial-intent evidence.
4. Solar/Battery: representative extraction gate is now green. Next engineering boundary is Worker integration behind non-public technology routing plus Heat Pump regression coverage; malformed/partial hardening continues before public exposure.
5. Instrumentation: existing anonymous technology dimensions are reusable; do not expand PII.

## Expected revenue impact
The green representative Solar extraction gate removes the known evidence-normalisation blocker and moves the second vertical from isolated extractor hardening to integration. Wiring the dedicated adapter behind explicit non-public routing is the shortest reusable step toward a genuine Solar paid-intent test while protecting the live Heat Pump journey. Acquisition remains the immediate route to first revenue.

## Next actions
1. Refresh live Stripe and durable checkout/funnel evidence every run; first genuine purchase remains immediate milestone.
2. Continue qualified acquisition/intake activation without overlapping homepage experiments.
3. Wire request-level technology routing into the Worker behind the non-public gate while preserving legacy Heat Pump behaviour; add regression coverage before any release.
4. Harden Solar/Battery extraction against malformed/partial representative inputs while preserving unknowns as null/gaps.
5. Run preview/canary verification under `SOPS/SHIP_CHANGE.md`; do not expose Solar publicly until single/two-quote journey, guardrail, instrumentation, checkout and rendered mobile/desktop gates pass.
6. After trustworthy integration, prove single/two-quote journeys and begin deterministic Financial Assumptions Check.

## Durable learning
No new durable customer/product lesson this run. The green extraction suite is material implementation progress but does not yet establish customer behaviour or public Solar readiness.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy for deployment. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
