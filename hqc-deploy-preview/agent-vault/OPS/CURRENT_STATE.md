# Current state

Updated: 2026-09-22 06:46 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase and £100 cumulative validation revenue.

## Evidence refreshed
- Revenue: fresh authoritative live Stripe `Home Quote Check` PaymentIntents returned **0 objects, `has_more=false`**. Genuine production revenue remains **£0 / £1,000 monthly**, cumulative validation revenue **£0 / £100**, paying customers **0**.
- Durable funnel/acquisition: no newer qualified technology/source cohort was established this run; latest settled evidence remains **56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses**, with 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains **40 → 16 → 5 → 5**. Unavailable dimensions remain null rather than inferred.
- Search: fresh Search Console 28-day summary remains **0 clicks, 4 impressions, 0% CTR, average position 8.07**; data freshness remains subject to Search Console reporting lag.
- Production health: fresh `/health` and `/api/metrics` requests were made; no customer-facing regression was established. Last rendered production proof remains the successful 390×844 mobile and 1440×1000 desktop recovery verification.
- Production technology isolation: last authoritative router release remains successful, preserving Heat Pump compatibility, explicit Solar isolation and durable metrics without static asset deployment.

## Commercial diagnosis
The primary commercial bottleneck remains qualified acquisition and conversion to the first genuine £4.99 Decision Pack purchase. Five genuine analyses are insufficient evidence for a pricing or demand conclusion. Search visibility is still extremely small (4 impressions), so acquisition remains the binding commercial constraint.

## Current milestone
First genuine £4.99 Decision Pack purchase, then £100 cumulative validation revenue.

## Product strategy / Solar-Battery progress
- A dedicated **non-public executable Solar/Battery analysis module** now exists at `lib/solar-battery-analysis.js`. It consumes the structured extractor, emits evidence-state findings, preserves missing evidence explicitly, applies non-certification guardrails, and supports two-quote evidence-only comparison with no automatic winner.
- New analysis tests cover complete Solar, partial/missing evidence, battery-only isolation, and two-quote comparison. The executable-analysis tests passed in GitHub Actions.
- A dedicated Solar CI workflow was added. Its first combined run exposed a failure in the pre-existing broader evidence/fixture contract suite while the new executable-analysis step passed. The workflow has been split into independent checks to pinpoint the failing legacy contract before any integration or release. This is a behind-gate development issue, not a production regression.
- Solar remains non-public and is not wired into the production request path. Heat Pump is untouched.
- Next boundary: resolve the failing Solar contract check, obtain a fully green extraction/evidence/fixture/routing suite, then connect the dedicated service behind the existing non-public technology gate. Financial Assumptions Check follows only after that boundary is trustworthy.

## Active workstreams
1. Continue qualified acquisition into the healthy Heat Pump journey and measure genuine analyses → Decision Pack checkout/purchase.
2. Make the new Solar analysis service fully green against extraction/evidence/fixture/isolation contracts, then integrate behind the non-public gate without altering Heat Pump.
3. Then implement Financial Assumptions Check and richer Decision Pack on proven structured findings.
4. Paid Heat Pump boundary remains £4.99; no evidence supports a pricing change.

## Expected revenue impact
Heat Pump can acquire and convert customers now. The executable Solar analysis boundary materially reduces the engineering distance to a second quote-holder cohort, but it must not be exposed until the complete trust contract is green.

## Next actions
1. Pinpoint and correct the failing Solar evidence/fixture contract; do not weaken the contract merely to make CI green.
2. Once green, wire the executable Solar service behind the existing non-public route and verify Heat Pump isolation.
3. Continue qualified Heat Pump acquisition toward the first purchase; use source/technology evidence rather than aggregate traffic for decisions.
4. Progress Financial Assumptions Check after trustworthy Solar extraction/comparison is executable end-to-end.

## Durable learning
No new reusable customer/product learning established. OPS/LEARNINGS.md remains unchanged.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
