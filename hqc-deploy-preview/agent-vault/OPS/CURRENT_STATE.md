# Current state

Updated: 2026-09-21 17:42 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month validation window.

## Evidence refreshed
- Revenue: no newer authoritative Stripe object set was available in this execution context; latest verified live `Home Quote Check` PaymentIntent evidence remains 0 objects, `has_more=false`. Genuine production revenue remains **£0 / £1,000 monthly**, cumulative validation revenue **£0 / £100**, paying customers **0**. Stale evidence is not relabelled as fresh.
- Durable funnel/acquisition: latest authoritative production snapshot remains **56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses**, with 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains **40 → 16 → 5 → 5**. No newer parsed snapshot was available in this execution context.
- Search: no newer authoritative Search Console dataset was available; latest through 2026-09-19 remains **0 clicks, 4 impressions, 0% CTR, average position 8.07**.
- Production router deployment is now authoritative: workflow run `35620826072` passed both 9/9 test suites, deployed `hqc-production` version `1c0821fd-1864-4ae0-90e8-f899cae8bc87`, preserved `HqcMetrics`, and verified the default Heat Pump health path returned HTTP 200.
- Explicit Solar/Battery isolation also worked in production: the probe returned HTTP **409** and `technology_analysis_not_ready`, proving it did not fall through to Heat Pump. The workflow was marked failed only because the verification script incorrectly expected 503 rather than the router's intentional 409 contract.
- The verification expectation was corrected in commit `bf3dd66d0fb20df07748960c2655afbedce272ca`; a new workflow run had not yet registered at evidence cutoff.

## Commercial diagnosis
First-customer acquisition/conversion remains binding. Latest settled landing→start and start→upload remain the earliest observed constraints. No evidence justifies changing the £4.99 paid boundary. Independent Solar engineering continues because it opens a materially larger quote-holder vertical without confounding Heat Pump conversion measurement.

## Current milestone
First genuine £4.99 Decision Pack purchase.

## Product strategy / Solar-Battery progress
- Technology-aware request isolation is now **LIVE in production** at the infrastructure boundary: Heat Pump remains available and explicit Solar/Battery is safely rejected rather than leaking to Heat Pump.
- Representative Solar evidence/extraction remains 9/9 green.
- Public Solar analysis remains gated because the dedicated Solar extraction adapter is not yet an executable configured HTTP analysis path and the required single/two-quote, checkout and rendered UI gates are incomplete.
- Production verification automation now matches the intentional 409 `technology_analysis_not_ready` contract; rerun evidence remains pending.

## Active workstreams
1. Qualified high-intent acquisition: continue quote-holder distribution; raw direct landing growth without starts is not success.
2. Activation: measure landing→start→upload without overlapping UI experiments.
3. Paid boundary: retain £4.99 until genuine willingness-to-pay evidence changes.
4. Solar/Battery: connect a dedicated executable Solar adapter behind the now-live isolation boundary and prove complete journeys before public CTA.
5. Instrumentation: reuse anonymous technology dimensions; do not expand PII.

## Expected revenue impact
The production technology boundary is now live without changing the customer-facing Heat Pump journey. This removes the accidental Solar→Heat Pump risk and shortens the path to a trustworthy Solar paid-intent test. Acquisition remains the immediate route to first revenue.

## Next actions
1. Verify the corrected production-router workflow rerun when registered.
2. Refresh authoritative Stripe/funnel evidence every run; first genuine purchase remains immediate milestone.
3. Connect the verified Solar extraction adapter to an executable gated analysis path.
4. Prove single/two-quote Solar journeys, guardrails, technology instrumentation and checkout.
5. Complete rendered mobile/desktop verification before exposing Solar publicly.
6. Continue qualified acquisition while measuring landing→start→upload; do not count raw landings as acquisition success.
7. Begin deterministic Financial Assumptions Check after trustworthy end-to-end Solar analysis.

## Durable learning
No new durable customer/product lesson. The 409/503 mismatch was a verification-script defect, not evidence about customer behaviour or product value.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy for deployment. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.