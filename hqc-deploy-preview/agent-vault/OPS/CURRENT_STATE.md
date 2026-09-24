# Current state

Updated: 2026-09-24 10:49 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase and £100 cumulative validation revenue.

## Evidence refreshed
- Revenue: authoritative live Home Quote Check Stripe PaymentIntents refreshed; `data=[]`, `has_more=false`. Genuine revenue remains **£0 / £1,000 monthly, £0 / £100 validation, 0 paying customers**.
- Durable funnel/acquisition: latest synthetic-excluded Cloudflare snapshot fetched 2026-09-24 05:03:55Z: **81 landings → 56 checker starts/CTA → 6 uploads → 6 genuine analyses**, 5 extended genuine analyses → **1 multi-quote analysis** → 5 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct produced all 6 genuine analyses. Start→upload remains **6/56 (11%)**.
- Technology evidence: Heat Pump records 28 landings, 41 CTA events, 1 upload, 1 genuine analysis, 1 multi-quote analysis, 1 Decision Case and 0 checkouts. The unsegmented remainder remains unknown.
- Search: fresh GSC 28-day settled summary through 2026-09-21 remains **0 clicks, 5 impressions, 0% CTR, average position 7.06**.
- Production health: last full site-consistency verification remains **GREEN** (`35979158224`): 23 HTML pages/assets/responsive checks clean and PDF→WebP upload conversion verified. A new commit in this run is flowing through deploy/canary and must not be treated as verified until those checks complete.

## Commercial diagnosis
The earliest measured revenue constraint remains checker-start/CTA → quote submission at **11%**. Six genuine analyses remain too few to conclude that £4.99 pricing or checkout demand is the problem. Organic-labelled cohorts have not yet produced a genuine analysis.

## Current milestone
First genuine £4.99 Decision Pack purchase, then £100 cumulative validation revenue.

## Solar/Battery progress
- Technology-aware Decision Pack telemetry CI remains verified green (`35850406399`).
- Gated Solar/Battery routing, analysis/comparison, evidence preservation, installer questions and representative extracted PDF/screenshot/photo envelopes remain CI-verified behind the non-public gate.
- The latest custom-domain canary (`35979367750`) again passed snapshot/deploy/domain/static/API verification but failed the rendered-browser stage.
- Diagnosis: `approved-home-layout.js` continuously reapplies Heat-Pump hero/choice copy on DOM mutations, while the Solar preview script also decorates the same DOM. This render-order conflict can remove/overwrite the Solar proposition and explains the missing `#hqc-solar-preview-badge` gate.
- Fix committed as `a7f5b3c67463d9da067a8651b0c73af044853c61`: Solar decoration is scheduled after mutation batches and now owns both hero and journey-choice copy when explicitly preview-enabled. Solar remains **NON-PUBLIC** pending green rendered canary verification.
- Solar Decision Pack content remains Heat-Pump-specific and must stay gated.

## Active workstreams
1. **P0 commercial activation:** reduce Heat Pump checker-start → upload friction; measured boundary remains 11%.
2. Continue qualified Heat Pump acquisition while measuring upload → genuine analysis → checkout → purchase.
3. Require the new Solar preview render-order fix to pass mobile+desktop custom-domain canary before promoting rendered verification.
4. Verify technology propagation into durable funnel/checkout events end-to-end.
5. Begin Financial Assumptions Check after trustworthy Solar journey verification is green end-to-end.

## Expected revenue impact
No genuine-revenue advance this run. The Solar fix removes a concrete rendered-journey blocker without exposing Solar publicly or changing the Heat Pump analysis path. Heat Pump start→upload remains the direct first-purchase lever.

## Next actions
1. Inspect deploy/canary results for `a7f5b3c6`; if green, mark Solar rendered isolation verified, otherwise diagnose the exact remaining rendered assertion.
2. Continue the measured Heat Pump upload-activation experiment without overlapping conversion hypotheses.
3. Verify technology propagation into durable funnel/checkout events end-to-end.
4. Continue qualified Heat Pump acquisition and measure genuine analysis → checkout → purchase.
5. Keep £4.99 pricing stable until materially more genuine analyses reach the paid boundary.

## Durable learning
No OPS/LEARNINGS.md update this run. The Solar render-order diagnosis is an implementation defect, not yet a reusable customer/product lesson.

## Guardrails
GitHub + Cloudflare only; never AppDeploy. UI production changes require rendered verification. Preserve independence/privacy/evidence guardrails.
