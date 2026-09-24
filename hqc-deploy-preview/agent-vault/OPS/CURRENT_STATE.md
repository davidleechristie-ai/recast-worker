# Current state

Updated: 2026-09-24 10:08 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase and £100 cumulative validation revenue.

## Evidence refreshed
- Revenue: authoritative live Home Quote Check Stripe PaymentIntents refreshed; `data=[]`, `has_more=false`. Genuine revenue remains **£0 / £1,000 monthly, £0 / £100 validation, 0 paying customers**.
- Durable funnel/acquisition: latest synthetic-excluded Cloudflare snapshot fetched 2026-09-24 05:03:55Z: **81 landings → 56 checker starts/CTA → 6 uploads → 6 genuine analyses**, 5 extended genuine analyses → **1 multi-quote analysis** → 5 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct produced all 6 genuine analyses. Start→upload remains **6/56 (11%)**.
- Technology evidence: Heat Pump now records 28 landings, 41 CTA events, 1 upload, 1 genuine analysis, 1 multi-quote analysis, 1 Decision Case and 0 checkouts. The unsegmented remainder remains unknown.
- Search: fresh GSC 28-day settled summary through 2026-09-21 is **0 clicks, 5 impressions, 0% CTR, average position 7.06**.
- Production health: **GREEN**. The previous site-consistency failure was diagnosed from job logs as a QA selector regression: the PDF probe waited for the obsolete exact CTA copy `Check my quote`. Commit `698a04be3e8c7b371b4f9ea450fcf148961356de` made the probe follow the current quote CTA intent. Rerun `35979158224` passed: 23 HTML pages/assets/responsive checks clean and PDF→WebP upload conversion explicitly verified.

## Commercial diagnosis
With production reliability green again, the earliest measured revenue constraint returns to checker-start/CTA → quote submission at **11%**. Six genuine analyses remain too few to conclude that £4.99 pricing or checkout demand is the problem. Organic-labelled cohorts have not yet produced a genuine analysis.

## Current milestone
First genuine £4.99 Decision Pack purchase, then £100 cumulative validation revenue.

## Solar/Battery progress
- Technology-aware Decision Pack telemetry CI remains verified green (`35850406399`).
- Gated Solar/Battery routing, analysis/comparison, evidence preservation, installer questions and representative extracted PDF/screenshot/photo envelopes remain CI-verified behind the non-public gate.
- A gated customer-facing Solar/Battery preview journey exists via explicit `?solar_preview=1` / session preview state and remains non-public.
- Rendered Solar verification remains **not green**: latest custom-domain canary evidence reaches deployment/domain/static/API checks but times out waiting for `#hqc-solar-preview-badge`. Do not promote Solar until this rendered preview failure is diagnosed and green.
- Solar Decision Pack content remains Heat-Pump-specific and must stay gated.

## Active workstreams
1. **P0 commercial activation:** reduce Heat Pump checker-start → upload friction, now that production health is green.
2. Continue qualified Heat Pump acquisition while measuring upload → genuine analysis → checkout → purchase.
3. Diagnose/fix the gated Solar rendered-preview badge failure without changing the public Heat Pump journey.
4. Verify technology propagation into durable funnel/checkout events end-to-end.
5. Begin Financial Assumptions Check after trustworthy Solar journey verification is green end-to-end.

## Expected revenue impact
The run removed a false reliability block and restores safe experimentation on the measured 11% start→upload constraint. No genuine-revenue advance yet.

## Next actions
1. Resume the measured Heat Pump upload-activation experiment; prioritise clearer file requirements/privacy and fewer steps before quote submission.
2. Diagnose the Solar preview badge failure on the custom-domain canary; require rendered mobile+desktop green before any public Solar CTA.
3. Verify technology propagation into durable funnel/checkout events end-to-end.
4. Continue qualified Heat Pump acquisition and measure genuine analysis → checkout → purchase.
5. Keep £4.99 pricing stable until materially more genuine analyses reach the paid boundary.

## Durable learning
No OPS/LEARNINGS.md update this run. The reliability incident was a test-selector drift fixed in the release gate; it does not yet justify a broader customer/product lesson.

## Guardrails
GitHub + Cloudflare only; never AppDeploy. UI production changes require rendered verification. Preserve independence/privacy/evidence guardrails.
