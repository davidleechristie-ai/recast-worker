# Current state

Updated: 2026-09-24 15:46 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase and £100 cumulative validation revenue.

## Evidence refreshed
- Revenue: authoritative live Home Quote Check Stripe PaymentIntents refreshed; `data=[]`, `has_more=false`. Genuine revenue remains **£0 / £1,000 monthly, £0 / £100 validation, 0 paying customers**.
- Durable funnel/acquisition: latest available synthetic-excluded Cloudflare snapshot fetched 2026-09-24 10:13:06Z remains **81 landings → 56 checker starts/CTA → 6 uploads → 6 genuine analyses**, 5 extended genuine analyses → **1 multi-quote analysis** → 5 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct produced all 6 genuine analyses. Start→upload remains **6/56 (11%)**.
- Technology evidence: Heat Pump records 28 landings, 41 CTA events, 1 upload, 1 genuine analysis, 1 multi-quote analysis, 1 Decision Case and 0 checkouts. The unsegmented remainder remains unknown; no qualified Solar production cohort exists while the public gate is closed.
- Search: fresh GSC 28-day settled summary through 2026-09-21 remains **0 clicks, 5 impressions, 0% CTR, average position 7.06**.
- Production health: **GREEN**. Full site-consistency verification remains green (`35979158224`), and the latest custom-domain canary run `36007880323` completed with workflow conclusion **success**; its sole canary job `107660920783` passed install, snapshot, Cloudflare binding, domain/static/API verification and rendered mobile-browser quote-intake/Solar/default-isolation verification. No public Solar release was made.

## Commercial diagnosis
The earliest measured revenue constraint remains checker-start/CTA → quote submission at **11%**. Six genuine analyses remain too few to conclude that £4.99 pricing or checkout demand is the problem. Organic-labelled cohorts have not yet produced a genuine analysis.

## Current milestone
First genuine £4.99 Decision Pack purchase, then £100 cumulative validation revenue.

## Solar/Battery progress
- Technology-aware Decision Pack telemetry CI remains verified green (`35850406399`).
- Gated Solar/Battery routing, analysis/comparison, evidence preservation, installer questions and representative extracted PDF/screenshot/photo envelopes remain CI-verified behind the non-public gate.
- Private rendered Solar preview + default Heat Pump isolation now has an unambiguous workflow-level green custom-domain canary (`36007880323`, job `107660920783`).
- Customer-ingestion boundary remains: browser intake supplies media to the existing journey, while the private Solar handler accepts JSON `quoteText` / provenance-bearing `extractedMedia`. The next safe product implementation remains trusted extraction-output → JSON `extractedMedia` → Solar handler → rendered results, never Solar fallback to Heat Pump.
- Solar Decision Pack content remains Heat-Pump-specific and gated.

## Active workstreams
1. **P0 commercial activation:** reduce Heat Pump checker-start → upload friction; measured boundary remains 11%.
2. Continue qualified Heat Pump acquisition while measuring upload → genuine analysis → checkout → purchase.
3. Build the private Solar customer-ingestion adapter: selected media → trustworthy extracted text/provenance → JSON `extractedMedia` → Solar handler → rendered results, with fail-closed isolation.
4. Verify technology propagation into durable funnel/checkout events end-to-end.
5. Begin Financial Assumptions Check only after trustworthy Solar customer ingestion is executable end-to-end.

## Expected revenue impact
No genuine-revenue advance this run. Production and private Solar rendered verification remain green. The direct first-purchase lever remains Heat Pump start→upload activation; the independent Solar ingestion bridge remains the highest-priority Purchase Adviser build boundary.

## Next actions
1. Continue the measured Heat Pump upload-activation experiment without overlapping conversion hypotheses.
2. Implement/test the private Solar extracted-media JSON bridge without enabling public Solar or allowing Heat Pump fallback.
3. Require end-to-end rendered private upload → Solar analysis → results verification before any public CTA.
4. Verify technology propagation into durable funnel/checkout events end-to-end.
5. Keep £4.99 pricing stable until materially more genuine analyses reach the paid boundary.

## Durable learning
No OPS/LEARNINGS.md update this run. Evidence is materially unchanged commercially; the latest canary strengthens engineering verification but does not establish a new reusable customer lesson.

## Guardrails
GitHub + Cloudflare only; never AppDeploy. UI production changes require rendered verification. Preserve independence/privacy/evidence guardrails.
