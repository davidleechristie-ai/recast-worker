# Current state

Updated: 2026-09-21 16:42 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month validation window.

## Evidence refreshed
- Revenue: no newer authoritative Stripe object set was available in this execution context; latest verified live `Home Quote Check` PaymentIntent evidence remains 0 objects, `has_more=false`. Genuine production revenue remains **£0 / £1,000 monthly**, cumulative validation revenue **£0 / £100**, paying customers **0**. Stale evidence is not relabelled as fresh.
- Durable funnel/acquisition: latest authoritative production snapshot remains **56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses**, with 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains **40 → 16 → 5 → 5**. No newer parsed snapshot was available in this execution context.
- Funnel rates remain landing→CTA 29%, CTA→upload 31%, upload→genuine 100%, Decision Case→share intent 50%; multi-quote 0/4.
- Technology mix remains partial: classified Heat Pump is 3 landings / 1 CTA / 0 uploads / 0 genuine / 0 checkouts. Solar/Battery remains non-public.
- Search: no newer authoritative Search Console dataset was available; latest through 2026-09-19 remains **0 clicks, 4 impressions, 0% CTR, average position 8.07**.
- Preview remains verified: Solar evidence/extraction 9/9 green; technology isolation passed preview; Durable Object compatibility is preserved.
- Production router: a dedicated release workflow now exists at `.github/workflows/hqc-production-router-release.yml` (commit `c89238ea1c60cc49778eaaac14233c59d9646418`). At evidence cutoff GitHub had not yet registered its run, so production-router LIVE status is not claimed.

## Commercial diagnosis
First-customer acquisition/conversion remains binding. Latest settled landing→start and start→upload remain the earliest observed constraints. No evidence justifies changing the £4.99 paid boundary. Independent Solar engineering continues because it opens a materially larger quote-holder vertical without confounding Heat Pump conversion measurement.

## Current milestone
First genuine £4.99 Decision Pack purchase.

## Product strategy / Solar-Battery progress
- Technology-aware request isolation is **VERIFIED IN PREVIEW**. Heat Pump delegates to the existing path; explicit Solar/Battery cannot silently fall through to Heat Pump.
- Representative Solar evidence/extraction remains 9/9 green.
- Production config uses `worker-entry.js` and preserves `HqcMetrics`.
- A production release workflow is now scoped only to Worker/router/config changes. It runs extraction + routing tests, deploys `hqc-production`, then verifies production health, default Heat Pump compatibility, explicit Solar rejection and durable metrics. Agent-vault state writes do not trigger production deployment.
- Public Solar analysis remains gated because the dedicated Solar extraction adapter is not yet an executable configured HTTP analysis path and the required single/two-quote, checkout and rendered UI gates are incomplete.

## Active workstreams
1. Qualified high-intent acquisition: continue quote-holder distribution; raw direct landing growth without starts is not success.
2. Activation: measure landing→start→upload without overlapping UI experiments.
3. Paid boundary: retain £4.99 until genuine willingness-to-pay evidence changes.
4. Solar/Battery: verify the new production release run, then connect a dedicated executable Solar adapter and prove complete journeys before public CTA.
5. Instrumentation: reuse anonymous technology dimensions; do not expand PII.

## Expected revenue impact
The production release path removes a deployment-control gap between verified preview routing and public infrastructure. Once green, HQC can safely make the technology boundary live while still rejecting unready Solar analysis, shortening the route to a trustworthy Solar paid-intent test without risking Heat Pump regressions or accidental Solar→Heat Pump leakage.

## Next actions
1. Verify the production-router release workflow; if green, mark the non-UI technology boundary LIVE while keeping Solar CTA gated.
2. Refresh authoritative Stripe/funnel evidence every run; first genuine purchase remains immediate milestone.
3. Connect the verified Solar extraction adapter to an executable gated analysis path.
4. Prove single/two-quote Solar journeys, guardrails, technology instrumentation and checkout.
5. Complete rendered mobile/desktop verification before exposing Solar publicly.
6. Continue qualified acquisition while measuring landing→start→upload; do not count raw landings as acquisition success.
7. Begin deterministic Financial Assumptions Check after trustworthy end-to-end Solar analysis.

## Durable learning
No new durable lesson this run. Production release automation is implementation progress, not customer/product evidence.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy for deployment. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.