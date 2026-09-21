# Current state

Updated: 2026-09-21 05:43 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month window.

## Evidence refreshed
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed this run: 0 objects, `has_more=false`. Genuine production revenue remains **£0 / £1,000 monthly**, cumulative validation revenue **£0 / £100**, paying customers **0**.
- Durable funnel: no newer authoritative production funnel snapshot was available in this execution context. Latest settled successful snapshot remains 55 genuine landings → 16 checker starts → 5 uploads → 5 genuine analyses; extended settled evidence remains 4 Decision Cases → 2 share intents → 0 durable checkouts. Unavailable fresh evidence is not treated as zero.
- Qualified acquisition: latest settled evidence remains direct 39 landings → 16 starts → 5 uploads → 5 genuine analyses. Organic cohorts have no genuine analyses in the latest settled snapshot.
- Technology mix remains partial: latest classified evidence remains `heat_pump` 2 landings / 1 start / 0 uploads / 0 genuine / 0 checkouts. Solar/Battery remains behind its non-public correctness gate.
- Search: no newer authoritative Search Console dataset was available this run; latest settled Search Console evidence remains 0 clicks, 4 impressions, 0% CTR, average position 8.69 through 2026-09-18.
- CI/preview: the Solar extraction commit `f37d67704a18685e6c5f163194d52c7bee956660` custom-domain canary was cancelled during the verify step; logs show deployment completed but verification was cancelled, so no canary success is claimed. Inspection also found the Cloudflare bridge only ran `solar-evidence-model.test.js` and did **not** execute the new `test/solar-battery-extraction.test.mjs`; therefore previous bridge success could not prove extractor correctness.

## Commercial diagnosis
First-customer acquisition/conversion remains binding. Latest settled start→upload remains 31% (5/16), the earliest adequately observed downstream constraint. No new evidence justifies stacking another Heat Pump UI experiment. Qualified distribution remains the fastest route to exercising the verified £4.99 checkout while independent Solar/Battery implementation progresses.

## Current milestone
First genuine £4.99 Decision Pack purchase.

## Product strategy / Solar-Battery progress
- Tracked roadmap: `STRATEGY/PURCHASE_ADVISER_ROADMAP.md`.
- Analysis boundary: `STRATEGY/SOLAR_ANALYSIS_BOUNDARY.md`.
- Authoritative research: `RESEARCH/SOLAR_BATTERY_EVIDENCE_2026-09-21.md`.
- Technology routing/request-level isolation, structured evidence contract, representative synthetic fixture corpus and dedicated non-public extraction adapter/tests exist in source.
- New this run: corrected the CI correctness gap by changing `.github/workflows/hqc-cloudflare-bridge.yml` so preview deployment is gated by both the evidence-model tests and `test/solar-battery-extraction.test.mjs`. Commit `6156eb44f8293a3d7e706c9a7e84ecc618f3465f`. The workflow had not yet appeared at this state update, so no pass is claimed.
- Worker production proxy is still not wired to the Solar adapter and no customer-facing Solar capability is claimed.

## Active workstreams
1. Qualified high-intent distribution: continue channels aimed at homeowners already holding heat-pump quotes; organic cohorts have not yet produced a genuine analysis.
2. Upload activation: latest settled start→upload remains 5/16; diagnose with durable evidence before another UI change.
3. Paid boundary: repaired £4.99 checkout remains latest verified production state; do not change price without genuine commercial-intent evidence.
4. Solar/Battery: extractor now has an explicit CI gate. Next gate is an actual green run, then malformed/partial hardening and non-public Worker wiring while preserving Heat Pump behaviour.
5. Instrumentation: existing anonymous technology dimensions are reusable; do not expand PII.

## Expected revenue impact
The new CI gate prevents a Solar/Battery preview from being treated as correct while its dedicated extractor is untested. That reduces regression/false-readiness risk and shortens the path to a trustworthy second vertical capable of testing paid intent. Acquisition remains the immediate route to first revenue.

## Next actions
1. Refresh live Stripe and durable checkout/funnel evidence every run; first genuine purchase remains immediate milestone.
2. Continue qualified acquisition/intake activation without overlapping homepage experiments.
3. Verify the new CI gate for `6156eb44f8293a3d7e706c9a7e84ecc618f3465f`; fix failures before advancing.
4. Harden Solar/Battery extraction against partial/malformed representative fixtures while preserving unknowns as null/gaps.
5. Wire technology routing plus the dedicated adapter into the Worker behind the non-public gate only after extractor correctness and Heat Pump regressions pass; preview/canary under `SOPS/SHIP_CHANGE.md`. Do not expose Solar publicly.
6. After trustworthy extraction, prove single/two-quote journeys and begin deterministic Financial Assumptions Check.

## Durable learning
No new durable lesson this run. The CI gap is an engineering-control correction, not yet a reusable product/commercial conclusion.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy for deployment. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
