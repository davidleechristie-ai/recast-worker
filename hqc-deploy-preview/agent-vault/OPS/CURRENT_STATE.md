# Current state

Updated: 2026-09-21 09:41 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month validation window.

## Evidence refreshed
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed this run: 0 objects, `has_more=false`. Genuine production revenue remains **£0 / £1,000 monthly**, cumulative validation revenue **£0 / £100**, paying customers **0**.
- Durable funnel: no newer parsed authoritative funnel counts were available in this execution context. Latest settled counts remain 55 genuine landings → 16 checker starts → 5 uploads → 5 genuine analyses; extended settled evidence remains 4 Decision Cases → 2 share intents → 0 durable checkouts. Unavailable fresh evidence is not treated as zero.
- Qualified acquisition: latest settled evidence remains direct 39 landings → 16 starts → 5 uploads → 5 genuine analyses. Organic cohorts have no genuine analyses in the latest settled snapshot.
- Technology mix remains partial: latest classified evidence remains `heat_pump` 2 landings / 1 start / 0 uploads / 0 genuine / 0 checkouts. Solar/Battery remains behind its non-public correctness gate.
- Search: fresh public site search returned no HQC result this run. No newer authoritative Search Console dataset was available; latest settled Search Console evidence remains 0 clicks, 4 impressions, 0% CTR, average position 8.69 through 2026-09-18.
- Production health: direct health endpoints were inaccessible from the web execution context, so fresh production health is null rather than assumed. No production release was attempted.
- CI/preview: commit `1d44ad899bf5f7ef74446290f7546fc13ed0e358` ran the corrected Cloudflare bridge gate and failed at `Test technology evidence models and Solar/Battery extraction`; preview/deploy/verify were skipped. Its separate custom-domain canary reached a healthy canary-domain check but was cancelled during mobile quote-intake verification, so no canary pass is claimed.

## Commercial diagnosis
First-customer acquisition/conversion remains binding. Latest settled start→upload remains 31% (5/16), the earliest adequately observed downstream constraint. No new evidence justifies stacking another Heat Pump UI experiment. Qualified distribution remains the fastest route to exercising the verified £4.99 checkout while independent Solar/Battery implementation progresses.

## Current milestone
First genuine £4.99 Decision Pack purchase.

## Product strategy / Solar-Battery progress
- Tracked roadmap: `STRATEGY/PURCHASE_ADVISER_ROADMAP.md`.
- Analysis boundary: `STRATEGY/SOLAR_ANALYSIS_BOUNDARY.md`.
- Authoritative research: `RESEARCH/SOLAR_BATTERY_EVIDENCE_2026-09-21.md`.
- Technology routing/request-level isolation, structured evidence contract, representative synthetic fixture corpus and dedicated non-public extraction adapter/tests exist in source.
- The corrected CI gate remains fail-closed and representative fixtures continue exposing parser defects before public exposure.
- This run inspected the still-failing representative corpus and found `solar_only_complete` uses `Estimated annual generation 4,100 kWh`, while the extractor accepted `annual generation` but not the leading `Estimated`. The parser now accepts that evidenced wording. Commit `bf8cdf272d133a22763cb196049c16609fe840cc`; CI result is pending and no pass/readiness is claimed.
- Worker production proxy is still not wired to the Solar adapter and no customer-facing Solar capability is claimed.

## Active workstreams
1. Qualified high-intent distribution: continue channels aimed at homeowners already holding heat-pump quotes; organic cohorts have not yet produced a genuine analysis.
2. Upload activation: latest settled start→upload remains 5/16; diagnose with durable evidence before another UI change.
3. Paid boundary: repaired £4.99 checkout remains latest verified production state; do not change price without genuine commercial-intent evidence.
4. Solar/Battery: verify CI for `bf8cdf272d133a22763cb196049c16609fe840cc`; continue fixing representative extraction failures until the full evidence gate is green, then harden malformed/partial inputs and wire the adapter behind non-public technology routing.
5. Instrumentation: existing anonymous technology dimensions are reusable; do not expand PII.

## Expected revenue impact
The fail-closed representative corpus has now exposed another concrete extraction mismatch before customer exposure. Fixing annual-generation wording improves Solar quote coverage and shortens the route to a trustworthy Solar/Battery paid-intent test. Acquisition remains the immediate route to first revenue.

## Next actions
1. Refresh live Stripe and durable checkout/funnel evidence every run; first genuine purchase remains immediate milestone.
2. Continue qualified acquisition/intake activation without overlapping homepage experiments.
3. Verify CI for `bf8cdf272d133a22763cb196049c16609fe840cc`; fix any remaining representative-fixture failures before advancing.
4. Harden Solar/Battery extraction against partial/malformed representative fixtures while preserving unknowns as null/gaps.
5. Wire technology routing plus the dedicated adapter into the Worker behind the non-public gate only after extractor correctness and Heat Pump regressions pass; preview/canary under `SOPS/SHIP_CHANGE.md`. Do not expose Solar publicly.
6. After trustworthy extraction, prove single/two-quote journeys and begin deterministic Financial Assumptions Check.

## Durable learning
No new durable customer/product lesson this run. Parser hardening remains consistent with the existing lesson that technology instrumentation is not product readiness.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy for deployment. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
