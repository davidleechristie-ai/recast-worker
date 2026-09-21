# Current state

Updated: 2026-09-21 06:44 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month window.

## Evidence refreshed
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed this run: 0 objects, `has_more=false`. Genuine production revenue remains **£0 / £1,000 monthly**, cumulative validation revenue **£0 / £100**, paying customers **0**.
- Durable funnel: no newer authoritative production funnel snapshot was available in this execution context. Latest settled successful snapshot remains 55 genuine landings → 16 checker starts → 5 uploads → 5 genuine analyses; extended settled evidence remains 4 Decision Cases → 2 share intents → 0 durable checkouts. Unavailable fresh evidence is not treated as zero.
- Qualified acquisition: latest settled evidence remains direct 39 landings → 16 starts → 5 uploads → 5 genuine analyses. Organic cohorts have no genuine analyses in the latest settled snapshot.
- Technology mix remains partial: latest classified evidence remains `heat_pump` 2 landings / 1 start / 0 uploads / 0 genuine / 0 checkouts. Solar/Battery remains behind its non-public correctness gate.
- Search: fresh public searches for the HQC brand/solar footprint returned no results. No newer authoritative Search Console dataset was available; latest settled Search Console evidence remains 0 clicks, 4 impressions, 0% CTR, average position 8.69 through 2026-09-18.
- CI/preview: corrected Solar extraction gate ran for commit `6156eb44f8293a3d7e706c9a7e84ecc618f3465f` and failed specifically at `Test technology evidence models and Solar/Battery extraction`; preview/deploy/verify steps were skipped. Inspection of fixtures and extractor found a concrete parser gap: a representative complete Solar+Battery fixture used `Price £12,400`, while the extractor only accepted `total` or `installed` price wording.

## Commercial diagnosis
First-customer acquisition/conversion remains binding. Latest settled start→upload remains 31% (5/16), the earliest adequately observed downstream constraint. No new evidence justifies stacking another Heat Pump UI experiment. Qualified distribution remains the fastest route to exercising the verified £4.99 checkout while independent Solar/Battery implementation progresses.

## Current milestone
First genuine £4.99 Decision Pack purchase.

## Product strategy / Solar-Battery progress
- Tracked roadmap: `STRATEGY/PURCHASE_ADVISER_ROADMAP.md`.
- Analysis boundary: `STRATEGY/SOLAR_ANALYSIS_BOUNDARY.md`.
- Authoritative research: `RESEARCH/SOLAR_BATTERY_EVIDENCE_2026-09-21.md`.
- Technology routing/request-level isolation, structured evidence contract, representative synthetic fixture corpus and dedicated non-public extraction adapter/tests exist in source.
- The CI gate is now doing useful correctness work: it blocked preview on a real extraction mismatch instead of allowing false readiness.
- Fixed the identified price-wording gap in `lib/solar-battery-extraction.js` so `Price £...` is handled alongside `total` and `installed`. Commit `6a23a110a0265c42118cfad6676e16cdf108dce2`; CI had not appeared at the evidence cutoff, so no pass is claimed.
- Worker production proxy is still not wired to the Solar adapter and no customer-facing Solar capability is claimed.

## Active workstreams
1. Qualified high-intent distribution: continue channels aimed at homeowners already holding heat-pump quotes; organic cohorts have not yet produced a genuine analysis.
2. Upload activation: latest settled start→upload remains 5/16; diagnose with durable evidence before another UI change.
3. Paid boundary: repaired £4.99 checkout remains latest verified production state; do not change price without genuine commercial-intent evidence.
4. Solar/Battery: corrected CI gate found a real parser defect; price wording fix is committed. Next gate is a green extraction run, then malformed/partial hardening and non-public Worker wiring while preserving Heat Pump behaviour.
5. Instrumentation: existing anonymous technology dimensions are reusable; do not expand PII.

## Expected revenue impact
The enforced extraction gate has already prevented a broken representative Solar quote from reaching preview. Fixing the detected parser gap increases the probability that the second vertical handles real installer wording reliably and shortens the route to a trustworthy Solar/Battery paid-intent test. Acquisition remains the immediate route to first revenue.

## Next actions
1. Refresh live Stripe and durable checkout/funnel evidence every run; first genuine purchase remains immediate milestone.
2. Continue qualified acquisition/intake activation without overlapping homepage experiments.
3. Verify CI for `6a23a110a0265c42118cfad6676e16cdf108dce2`; fix any remaining representative-fixture failures before advancing.
4. Harden Solar/Battery extraction against partial/malformed representative fixtures while preserving unknowns as null/gaps.
5. Wire technology routing plus the dedicated adapter into the Worker behind the non-public gate only after extractor correctness and Heat Pump regressions pass; preview/canary under `SOPS/SHIP_CHANGE.md`. Do not expose Solar publicly.
6. After trustworthy extraction, prove single/two-quote journeys and begin deterministic Financial Assumptions Check.

## Durable learning
No new durable customer/product lesson this run. The CI gate demonstrated its engineering value by catching a real parser mismatch, but this does not alter the existing commercial/product learnings.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy for deployment. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
