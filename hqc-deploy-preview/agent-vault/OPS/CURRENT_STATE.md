# Current state

Updated: 2026-09-21 11:41 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month validation window.

## Evidence refreshed
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed this run: 0 objects, `has_more=false`. Genuine production revenue remains **£0 / £1,000 monthly**, cumulative validation revenue **£0 / £100**, paying customers **0**.
- Durable funnel: no newer parsed authoritative funnel counts were available in this execution context. Latest settled counts remain 55 genuine landings → 16 checker starts → 5 uploads → 5 genuine analyses; extended settled evidence remains 4 Decision Cases → 2 share intents → 0 durable checkouts. Unavailable fresh evidence is not treated as zero.
- Qualified acquisition: latest settled evidence remains direct 39 landings → 16 starts → 5 uploads → 5 genuine analyses. Organic cohorts have no genuine analyses in the latest settled snapshot.
- Technology mix remains partial: latest classified evidence remains `heat_pump` 2 landings / 1 start / 0 uploads / 0 genuine / 0 checkouts. Solar/Battery remains behind its non-public correctness gate.
- Search: authoritative Search Console refreshed through 2026-09-19: **0 clicks, 4 impressions, 0% CTR, average position 8.07** over the last 28 settled days. Search visibility remains too small to be the primary first-customer route.
- Production health: fresh direct production-health response remains unavailable in this execution context; fresh health is null rather than assumed. No production release was attempted.
- CI: latest completed full Solar extraction gate on `2873fdeb...` ran 9 tests: 7 passed, 2 failed. Both failures were deterministic `0 !== null` mismatches for missing numeric evidence in `battery_only` and `partial_quote_missing_evidence`; preview/deploy/verify correctly remained skipped.

## Commercial diagnosis
First-customer acquisition/conversion remains binding. Latest settled start→upload remains 31% (5/16), the earliest adequately observed downstream constraint. No new evidence justifies stacking another Heat Pump UI experiment. Qualified distribution remains the fastest route to exercising the verified £4.99 checkout while independent Solar/Battery implementation progresses.

## Current milestone
First genuine £4.99 Decision Pack purchase.

## Product strategy / Solar-Battery progress
- Tracked roadmap: `STRATEGY/PURCHASE_ADVISER_ROADMAP.md`.
- Analysis boundary: `STRATEGY/SOLAR_ANALYSIS_BOUNDARY.md`.
- Authoritative research: `RESEARCH/SOLAR_BATTERY_EVIDENCE_2026-09-21.md`.
- Technology routing/request-level isolation, structured evidence contract, representative synthetic fixture corpus and dedicated non-public extraction adapter/tests exist in source.
- This run inspected the authoritative CI logs and found the remaining representative failures were caused by `numberOrNull`: JavaScript `Number(null)` converted missing evidence to `0`, violating the core rule that unknown/missing evidence remains null.
- Fixed numeric normalisation so null, undefined and empty-string inputs remain null before numeric conversion. Commit `1ce7fcb3abee7c38d80c001d371b44e43c018d5d`. CI result pending; no pass/readiness is claimed.
- Worker production proxy is still not wired to the Solar adapter and no customer-facing Solar capability is claimed.

## Active workstreams
1. Qualified high-intent distribution: continue channels aimed at homeowners already holding heat-pump quotes; organic cohorts have not yet produced a genuine analysis.
2. Upload activation: latest settled start→upload remains 5/16; diagnose with durable evidence before another UI change.
3. Paid boundary: repaired £4.99 checkout remains latest verified production state; do not change price without genuine commercial-intent evidence.
4. Solar/Battery: verify CI after the missing-numeric fix; continue representative/malformed/partial hardening until the full gate is green, then wire the adapter behind non-public technology routing.
5. Instrumentation: existing anonymous technology dimensions are reusable; do not expand PII.

## Expected revenue impact
Preserving missing numeric evidence as null prevents absent values from being presented as real zero values, a material trust/correctness requirement for consumer quote decisions. This removes a concrete blocker from the Solar/Battery correctness gate and shortens the route to a trustworthy second-vertical paid-intent test. Acquisition remains the immediate route to first revenue.

## Next actions
1. Refresh live Stripe and durable checkout/funnel evidence every run; first genuine purchase remains immediate milestone.
2. Continue qualified acquisition/intake activation without overlapping homepage experiments.
3. Verify CI after `1ce7fcb3abee7c38d80c001d371b44e43c018d5d`; fix any remaining representative-fixture failures before advancing.
4. Harden Solar/Battery extraction against partial/malformed representative fixtures while preserving unknowns as null/gaps.
5. Wire technology routing plus the dedicated adapter into the Worker behind the non-public gate only after extractor correctness and Heat Pump regressions pass; preview/canary under `SOPS/SHIP_CHANGE.md`. Do not expose Solar publicly.
6. After trustworthy extraction, prove single/two-quote journeys and begin deterministic Financial Assumptions Check.

## Durable learning
No new durable customer/product lesson this run. The numeric-null defect is implementation hardening consistent with the existing readiness lesson; it does not yet establish customer behaviour.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy for deployment. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
