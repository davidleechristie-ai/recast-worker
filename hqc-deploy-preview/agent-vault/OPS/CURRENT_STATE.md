# Current state

Updated: 2026-09-21 03:43 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month window.

## Evidence refreshed
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed this run: 0 objects, `has_more=false`. Genuine production revenue remains **£0 / £1,000 monthly**, cumulative validation revenue **£0 / £100**, paying customers **0**.
- Durable funnel: no newer authoritative production funnel snapshot was available in this execution context. Latest settled successful snapshot remains 55 genuine landings → 16 checker starts → 5 uploads → 5 genuine analyses; extended settled evidence remains 4 Decision Cases → 2 share intents → 0 durable checkouts. Unavailable fresh evidence is not treated as zero.
- Qualified acquisition: latest settled evidence remains direct 39 landings → 16 starts → 5 uploads → 5 genuine analyses. Organic cohorts have no genuine analyses in the latest settled snapshot.
- Technology mix remains partial: latest classified evidence remains `heat_pump` 2 landings / 1 start / 0 uploads / 0 genuine / 0 checkouts. Solar/Battery remains behind its non-public correctness gate.
- Search: fresh public searches for the HQC heat-pump and Solar/Battery footprints returned no results. No newer authoritative Search Console dataset was available; latest settled Search Console evidence remains 0 clicks, 4 impressions, 0% CTR, average position 8.69 through 2026-09-18.
- Production/CI health: latest settled production metrics workflow remains successful. The new Solar fixture-contract commit `16fa62bd70103162e4bedf38bddaa989abd32ce0` triggered CI; custom-domain canary run 35555162047 was queued when checked, so no deployment/verification claim is made from it.

## Commercial diagnosis
First-customer acquisition/conversion remains binding. Latest settled start→upload remains 31% (5/16), the earliest adequately observed downstream constraint. No new evidence justifies stacking another Heat Pump UI experiment. Qualified distribution remains the fastest route to exercising the verified £4.99 checkout while independent Solar/Battery implementation progresses.

## Current milestone
First genuine £4.99 Decision Pack purchase.

## Product strategy / Solar-Battery progress
- Tracked roadmap: `STRATEGY/PURCHASE_ADVISER_ROADMAP.md`.
- Analysis boundary: `STRATEGY/SOLAR_ANALYSIS_BOUNDARY.md`.
- Authoritative research: `RESEARCH/SOLAR_BATTERY_EVIDENCE_2026-09-21.md`.
- Technology routing and request-level isolation are implemented in source and previously CI-green; legacy Heat Pump remains the explicit default and Solar/Battery cannot silently fall through to Heat Pump.
- Structured evidence contract exists in `lib/solar-battery-evidence.js`, preserving missing evidence as null/gaps and rejecting invalid numeric outputs.
- New this run: `test/solar-battery-fixture-contract.test.mjs` binds the representative synthetic fixture corpus to the same evidence contract. It verifies coverage for solar-only, solar+battery, battery-only, partial and comparison journeys; preserves unknowns/gaps for the partial quote; and locks the comparison guardrails against claims of electrical approval, structural suitability, guaranteed generation or MCS certification. Commit `16fa62bd70103162e4bedf38bddaa989abd32ce0`.
- This is a correctness/test improvement only. Worker production proxy is still not wired to `analysisRequestRoute`; no customer-facing Solar capability is claimed.

## Active workstreams
1. Qualified high-intent distribution: continue channels aimed at homeowners already holding heat-pump quotes; organic cohorts have not yet produced a genuine analysis.
2. Upload activation: latest settled start→upload remains 5/16; diagnose with durable evidence before another UI change.
3. Paid boundary: repaired £4.99 checkout remains latest verified production state; do not change price without genuine commercial-intent evidence.
4. Solar/Battery: routing/isolation boundary, evidence contract and representative fixture-contract tests now exist. Next safe slice is dedicated extraction against those fixtures, then Worker routing behind the non-public gate while preserving Heat Pump behaviour.
5. Instrumentation: existing anonymous technology dimensions are reusable; do not expand PII.

## Expected revenue impact
Binding representative Solar/Battery fixtures to the evidence contract converts the correctness gate from hand-written examples into an executable specification. This reduces the risk that future extraction silently drops unknowns or overclaims approval/certification, and shortens the path to a trustworthy second vertical. Acquisition remains the immediate route to first revenue.

## Next actions
1. Refresh live Stripe and durable checkout/funnel evidence every run; first genuine purchase remains immediate milestone.
2. Continue qualified acquisition/intake activation without overlapping homepage experiments.
3. Verify CI for commit `16fa62bd70103162e4bedf38bddaa989abd32ce0`; fix any failure before advancing the gate.
4. Implement the dedicated Solar/Battery structured extraction adapter against the fixture corpus and evidence contract.
5. Wire `analysisRequestRoute` into the Worker behind the non-public gate only after adapter correctness and Heat Pump regressions pass; then preview/canary under `SOPS/SHIP_CHANGE.md`. Do not expose Solar publicly.
6. After trustworthy extraction, prove single/two-quote journeys and begin deterministic Financial Assumptions Check.

## Durable learning
No new durable lesson this run. Evidence reinforces existing acquisition/activation and Solar-readiness lessons but does not establish, overturn or materially refine a reusable conclusion.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy for deployment. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
