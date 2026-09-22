# Current state

Updated: 2026-09-22 11:48 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase and £100 cumulative validation revenue.

## Evidence refreshed
- Revenue: no newer authoritative successful non-refunded payment dataset was available in this execution path; latest authoritative live Stripe `Home Quote Check` evidence remains **0 PaymentIntents, £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers**. This is carried evidence, not a fresh zero assumption.
- Durable funnel/acquisition: fresh Cloudflare-side snapshot fetched at **2026-09-22T10:06:07Z** remains **56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses**, with 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains **40 → 16 → 5 → 5**. Technology rows currently show heat_pump **3 landings → 1 start → 0 uploads**, demonstrating that historical events predate complete technology propagation; missing technology dimensions remain null rather than being backfilled.
- Search: no newer authoritative Search Console dataset established; latest available 28-day summary remains **0 clicks, 4 impressions, 0% CTR, average position 8.07**. Missing fresh search evidence is null.
- Production health: web retrieval of the origin was unavailable in this execution path and no production deployment was made. Last rendered production recovery and router-isolation proof remain authoritative.

## Commercial diagnosis
The primary commercial bottleneck remains qualified acquisition and landing → checker-start conversion toward the first genuine £4.99 Decision Pack purchase. Current durable rate is 16/56 (29%) landing → start and 5/16 (31%) start → upload; only five genuine analyses exist, so there is still insufficient evidence for a pricing or payment-demand conclusion.

## Current milestone
First genuine £4.99 Decision Pack purchase, then £100 cumulative validation revenue.

## Product strategy / Solar-Battery progress
- Request-integration CI run `35701193912` and Worker isolation CI run `35706680835` remain green behind the non-public gate.
- Added quote-specific Solar/Battery installer questions generated only from explicit evidence gaps. Questions preserve unknowns and ask for missing panel/array/inverter/battery/generation/DNO/warranty/MCS/price evidence rather than asserting correctness or certification.
- Added regression coverage for partial quotes, battery-only suppression of irrelevant solar questions, and two-quote question generation. Commits `41242eca8c0e642369a51ff2b5362c0e10d4874c` and `fc8a8840dcb0042b02874aac7e043360ce345d5b`; CI registration/result is pending and is not claimed green.
- Solar remains non-public; Heat Pump and production assets were not changed.

## Active workstreams
1. Continue qualified Heat Pump acquisition and conversion toward first purchase; current measured earliest constraint is landing → checker start, followed by start → upload.
2. Progress verified PDF/image ingestion behind the non-public Solar gate; structured/manual JSON is verified and unsupported media remains fail-closed until correctness is proven.
3. Ensure technology propagates through durable anonymous funnel/checkout evidence before public Solar exposure.
4. Verify the new evidence-tied installer-question tests, then progress Financial Assumptions Check only after trustworthy ingestion is executable end-to-end.

## Expected revenue impact
Evidence-tied installer questions make the Solar analysis more decision-useful without inventing missing facts, advancing the Decision Case proposition while the public gate remains closed. Fresh funnel evidence keeps acquisition/conversion as the commercial P0 rather than allowing roadmap engineering to displace first-customer work.

## Next actions
1. Require CI green for installer-question generation; correct any contract failure without weakening evidence requirements.
2. Implement and verify PDF/image ingestion behind the gate; no public Solar CTA before rendered end-to-end verification.
3. Verify technology propagation into durable anonymous funnel and checkout events.
4. Continue qualified Heat Pump acquisition and measure genuine analysis → checkout → purchase.

## Durable learning
No new reusable customer/product learning established. OPS/LEARNINGS.md remains unchanged.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.