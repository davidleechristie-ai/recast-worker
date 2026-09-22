# Current state

Updated: 2026-09-22 12:42 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase and £100 cumulative validation revenue.

## Evidence refreshed
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents list refreshed this run and is empty (`data: []`, `has_more: false`): **£0 / £1,000 monthly, £0 / £100 validation, 0 paying customers**. This is fresh production payment evidence, not an inferred zero.
- Durable funnel/acquisition: no newer authoritative Cloudflare-side snapshot was available in this execution path; latest authoritative snapshot remains **56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses**, with 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains **40 → 16 → 5 → 5**. Technology rows currently show heat_pump **3 landings → 1 start → 0 uploads**; missing historical technology attribution remains null rather than backfilled.
- Search: no newer authoritative Search Console dataset established; latest available 28-day summary remains **0 clicks, 4 impressions, 0% CTR, average position 8.07**. Missing fresh search evidence is null.
- Production health: origin retrieval was unavailable through the current web execution path and no HQC production release was made. Prior rendered frontend recovery and production router-isolation proof remain authoritative. GitHub canary/check evidence for the current main commit is green, but this is not substituted for rendered production verification.

## Commercial diagnosis
The primary commercial bottleneck remains qualified acquisition and landing → checker-start conversion toward the first genuine £4.99 Decision Pack purchase. Current durable rate is 16/56 (29%) landing → start and 5/16 (31%) start → upload; only five genuine analyses exist, so there is still insufficient evidence for a pricing or payment-demand conclusion.

## Current milestone
First genuine £4.99 Decision Pack purchase, then £100 cumulative validation revenue.

## Product strategy / Solar-Battery progress
- Request-integration CI run `35701193912` and Worker isolation CI run `35706680835` remain green behind the non-public gate.
- Evidence-tied Solar/Battery installer questions are now verified: `HQC Solar analysis CI` run `35717861021` completed successfully for commit `fc8a8840dcb0042b02874aac7e043360ce345d5b`.
- Questions preserve unknowns and ask for missing panel/array/inverter/battery/generation/DNO/warranty/MCS/price evidence rather than asserting correctness, approval or certification.
- Solar remains non-public; Heat Pump and production HQC assets were not changed in this run.

## Active workstreams
1. Continue qualified Heat Pump acquisition and conversion toward first purchase; current measured earliest constraint is landing → checker start, followed by start → upload.
2. Progress verified PDF/image ingestion behind the non-public Solar gate; structured/manual JSON is verified and unsupported media remains fail-closed until correctness is proven.
3. Ensure technology propagates through durable anonymous funnel/checkout evidence before public Solar exposure.
4. Begin Financial Assumptions Check only after trustworthy PDF/image/manual ingestion is executable end-to-end.

## Expected revenue impact
Closing the installer-question verification gate advances Solar from extraction/comparison toward a genuinely decision-useful Quote Check without inventing missing facts. Fresh live Stripe evidence confirms that customer #1 remains the commercial P0; roadmap engineering must continue in parallel rather than displacing qualified acquisition.

## Next actions
1. Implement and verify PDF/image ingestion behind the gate; no public Solar CTA before correctness and rendered end-to-end verification.
2. Verify technology propagation into durable anonymous funnel and checkout events.
3. Continue qualified Heat Pump acquisition and measure genuine analysis → checkout → purchase.
4. After trustworthy ingestion is green, start Financial Assumptions Check with deterministic calculations separated from narrative.

## Durable learning
No new reusable customer/product learning established. OPS/LEARNINGS.md remains unchanged.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.