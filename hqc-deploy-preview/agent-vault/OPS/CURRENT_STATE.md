# Current state

Updated: 2026-09-23 00:45 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase and £100 cumulative validation revenue.

## Evidence refreshed
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed this run: empty list (`data: []`, `has_more: false`). **£0 / £1,000 monthly, £0 / £100 validation, 0 paying customers**.
- Durable funnel/acquisition: no newer authoritative synthetic-excluded Cloudflare snapshot was available in this execution path; fresh evidence is **null**. Latest settled snapshot remains **56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses**, with 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains 40 → 16 → 5 → 5. Historical missing technology attribution remains null.
- Search: fresh authoritative Search Console evidence unavailable in this execution path, so fresh Search Console evidence is **null**. Latest settled summary remains **0 clicks, 4 impressions, 0% CTR, average position 8.07** and is not promoted as fresh evidence.
- Production health: no production release made this run. Prior rendered frontend recovery and production router-isolation proof remain authoritative.

## Commercial diagnosis
The primary commercial bottleneck remains qualified acquisition and landing → checker-start conversion toward the first genuine £4.99 Decision Pack purchase. Current durable rate is 16/56 (29%) landing → start and 5/16 (31%) start → upload; only five genuine analyses exist, so there is still insufficient evidence for a pricing or payment-demand conclusion.

## Current milestone
First genuine £4.99 Decision Pack purchase, then £100 cumulative validation revenue.

## Product strategy / Solar-Battery progress
- Request-integration CI run `35701193912` and Worker isolation CI run `35706680835` remain green behind the non-public gate.
- Evidence-tied Solar/Battery installer questions remain verified by `HQC Solar analysis CI` run `35717861021`.
- Added a dedicated non-public media-extraction contract (`lib/solar-battery-media-ingestion.js`) plus correctness tests for PDF-derived text and image/OCR-derived text. The contract requires supported source media type, non-empty extracted text and extraction provenance; it preserves unknown confidence as null and does not invent quote evidence.
- Raw PDF/image requests remain deliberately fail-closed at HTTP 415. This change does **not** expose media ingestion publicly and does not weaken the existing request boundary.
- CI workflow now runs the media-ingestion contract tests. Run `35798847121` was queued at the end of this run; capability is not promoted to verified until it passes.
- Solar remains non-public; Heat Pump and production HQC assets were not changed.

## Active workstreams
1. Continue qualified Heat Pump acquisition and conversion toward first purchase; measured earliest constraint remains landing → checker start, followed by start → upload.
2. Complete trustworthy PDF/image ingestion behind the non-public Solar gate by verifying extraction provenance/correctness before changing the 415 boundary.
3. Ensure technology propagates through durable anonymous funnel/checkout evidence before public Solar exposure.
4. Begin Financial Assumptions Check only after trustworthy PDF/image/manual ingestion is executable end-to-end.

## Expected revenue impact
No genuine payment or funnel advance matured this run. The new media extraction contract reduces the trust risk of accepting PDF/image-derived Solar evidence and creates a testable boundary for the next ingestion step without destabilising Heat Pump. It does not itself create revenue and remains behind the non-public gate.

## Next actions
1. Verify CI run `35798847121`; if green, wire only verified extracted-text envelopes into the gated Solar request path while raw media remains fail-closed until end-to-end extraction is proven.
2. Add representative PDF/image extraction fixtures at the client/extractor boundary and prove quote facts survive extraction without invented values.
3. Verify technology propagation into durable anonymous funnel and checkout events.
4. Continue qualified Heat Pump acquisition and measure genuine analysis → checkout → purchase.
5. After trustworthy ingestion is green, start Financial Assumptions Check with deterministic calculations separated from narrative.

## Durable learning
No new reusable customer/product learning established. OPS/LEARNINGS.md remains unchanged.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.