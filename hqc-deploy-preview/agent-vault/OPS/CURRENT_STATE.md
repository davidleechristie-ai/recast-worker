# Current state

Updated: 2026-09-22 10:41 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase and £100 cumulative validation revenue.

## Evidence refreshed
- Revenue: no newer authoritative successful non-refunded payment dataset was available in this execution path; latest authoritative live Stripe `Home Quote Check` evidence remains **0 PaymentIntents, £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers**. This is carried evidence, not a fresh zero assumption.
- Durable funnel/acquisition: fresh production metrics were unavailable from the current execution path; latest settled evidence remains **56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses**, with 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains **40 → 16 → 5 → 5**. Unavailable dimensions remain null.
- Search: no newer authoritative Search Console dataset established; latest available 28-day summary remains **0 clicks, 4 impressions, 0% CTR, average position 8.07**. Missing fresh search evidence is null.
- Production health: no production deployment was made this run. Last rendered production recovery and router-isolation proof remain authoritative.

## Commercial diagnosis
The primary commercial bottleneck remains qualified acquisition and conversion to the first genuine £4.99 Decision Pack purchase. Five genuine analyses are insufficient evidence for a pricing or demand conclusion.

## Current milestone
First genuine £4.99 Decision Pack purchase, then £100 cumulative validation revenue.

## Product strategy / Solar-Battery progress
- Request-integration CI run `35701193912` completed successfully, verifying the gated structured/manual JSON Solar request boundary.
- Worker-level gate/isolation CI run `35706680835` completed successfully for commit `a3661ea47293a0f715ba4647a7f00b35f95866d2`. It verifies Solar/Battery returns 409 while the internal gate is absent, enters the dedicated Solar handler only with `HQC_SOLAR_ANALYSIS_INTERNAL=1`, and unsupported technology fails closed.
- The Worker request boundary is therefore verified behind the non-public gate. Nothing was deployed; Solar remains non-public and Heat Pump remains unchanged.

## Active workstreams
1. Continue qualified Heat Pump acquisition toward first purchase.
2. Progress verified PDF/image/manual-entry ingestion behind the non-public Solar gate; structured/manual JSON is verified and unsupported media remains fail-closed until correctness is proven.
3. Ensure technology propagates through durable anonymous funnel/checkout evidence before public Solar exposure.
4. Then progress Financial Assumptions Check and richer Decision Pack.

## Expected revenue impact
The now-green request integration and Worker isolation boundary moves Solar toward a trustworthy second paid-intent vertical while explicitly protecting the live Heat Pump revenue path. It reduces the risk of launching a second vertical on the wrong analysis service.

## Next actions
1. Implement and verify PDF/image/manual-entry ingestion behind the gate; do not expose a public Solar CTA before rendered end-to-end verification.
2. Verify technology propagation into durable anonymous funnel and checkout events.
3. Continue qualified Heat Pump acquisition and measure genuine analysis → checkout → purchase.
4. Begin Financial Assumptions Check only after trustworthy Solar ingestion is executable end-to-end.

## Durable learning
No new reusable customer/product learning established. OPS/LEARNINGS.md remains unchanged.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.