# Current state

Updated: 2026-09-21 04:48 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month window.

## Evidence refreshed
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: 0 objects, `has_more=false`. Genuine production revenue remains **£0 / £1,000 monthly**, cumulative validation revenue **£0 / £100**, paying customers **0**.
- Durable funnel: no newer authoritative production funnel snapshot was available in this execution context. Latest settled successful snapshot remains 55 genuine landings → 16 checker starts → 5 uploads → 5 genuine analyses; extended settled evidence remains 4 Decision Cases → 2 share intents → 0 durable checkouts. Unavailable fresh evidence is not treated as zero.
- Qualified acquisition: latest settled evidence remains direct 39 landings → 16 starts → 5 uploads → 5 genuine analyses. Organic cohorts have no genuine analyses in the latest settled snapshot.
- Technology mix remains partial: latest classified evidence remains `heat_pump` 2 landings / 1 start / 0 uploads / 0 genuine / 0 checkouts. Solar/Battery remains behind its non-public correctness gate.
- Search: no newer authoritative Search Console dataset was available this run; latest settled Search Console evidence remains 0 clicks, 4 impressions, 0% CTR, average position 8.69 through 2026-09-18.
- Production/CI health: fixture-contract commit `16fa62bd70103162e4bedf38bddaa989abd32ce0` Cloudflare bridge completed successfully. Its custom-domain canary was cancelled, so no canary verification is claimed. New extraction-test commit `f37d67704a18685e6c5f163194d52c7bee956660` has CI pending at this state update.

## Commercial diagnosis
First-customer acquisition/conversion remains binding. Latest settled start→upload remains 31% (5/16), the earliest adequately observed downstream constraint. No new evidence justifies stacking another Heat Pump UI experiment. Qualified distribution remains the fastest route to exercising the verified £4.99 checkout while independent Solar/Battery implementation progresses.

## Current milestone
First genuine £4.99 Decision Pack purchase.

## Product strategy / Solar-Battery progress
- Tracked roadmap: `STRATEGY/PURCHASE_ADVISER_ROADMAP.md`.
- Analysis boundary: `STRATEGY/SOLAR_ANALYSIS_BOUNDARY.md`.
- Authoritative research: `RESEARCH/SOLAR_BATTERY_EVIDENCE_2026-09-21.md`.
- Technology routing and request-level isolation are implemented in source; legacy Heat Pump remains the explicit default and Solar/Battery cannot silently fall through to Heat Pump.
- Structured evidence contract exists in `lib/solar-battery-evidence.js`, preserving missing evidence as null/gaps and rejecting invalid numeric outputs.
- Representative synthetic fixture corpus covers solar-only, solar+battery, battery-only, partial and comparison journeys.
- New this run: dedicated non-public extraction adapter `lib/solar-battery-extraction.js` and fixture-driven extraction tests `test/solar-battery-extraction.test.mjs` were added. The adapter extracts structured panel/array/inverter/battery/generation/self-consumption/export/scope/DNO/warranty/MCS/price evidence where explicitly present and passes output through the existing evidence validator rather than inventing missing facts. Commits `021c553781d05ac1c3c49754227089ec05e81558` and `f37d67704a18685e6c5f163194d52c7bee956660`; CI pending.
- This remains a source/test slice only. Worker production proxy is not wired to the Solar adapter and no customer-facing Solar capability is claimed.

## Active workstreams
1. Qualified high-intent distribution: continue channels aimed at homeowners already holding heat-pump quotes; organic cohorts have not yet produced a genuine analysis.
2. Upload activation: latest settled start→upload remains 5/16; diagnose with durable evidence before another UI change.
3. Paid boundary: repaired £4.99 checkout remains latest verified production state; do not change price without genuine commercial-intent evidence.
4. Solar/Battery: routing/isolation boundary, evidence contract, fixture corpus and first dedicated extraction adapter/tests now exist. Next gate is CI correctness, then broaden malformed/partial extraction coverage and wire routing behind the non-public Worker gate while preserving Heat Pump behaviour.
5. Instrumentation: existing anonymous technology dimensions are reusable; do not expand PII.

## Expected revenue impact
A dedicated Solar/Battery extractor is the first implementation slice that turns quote text into the technology-specific evidence contract without using Heat Pump logic. If CI/regressions pass, this materially shortens the path to a trustworthy second vertical and therefore to testing paid intent across a larger home-energy transaction pool. Acquisition remains the immediate route to first revenue.

## Next actions
1. Refresh live Stripe and durable checkout/funnel evidence every run; first genuine purchase remains immediate milestone.
2. Continue qualified acquisition/intake activation without overlapping homepage experiments.
3. Verify CI for `f37d67704a18685e6c5f163194d52c7bee956660`; fix failures before advancing.
4. Harden Solar/Battery extraction against partial/malformed representative fixtures while preserving unknowns as null/gaps.
5. Wire `analysisRequestRoute` plus the dedicated adapter into the Worker behind the non-public gate only after adapter correctness and Heat Pump regressions pass; preview/canary under `SOPS/SHIP_CHANGE.md`. Do not expose Solar publicly.
6. After trustworthy extraction, prove single/two-quote journeys and begin deterministic Financial Assumptions Check.

## Durable learning
No new durable lesson this run. The new adapter is implementation progress; it is not yet sufficient evidence to change a reusable product/commercial conclusion.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy for deployment. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
