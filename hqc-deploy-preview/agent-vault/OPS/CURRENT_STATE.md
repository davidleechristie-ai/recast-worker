# Current state

Updated: 2026-09-23 16:46 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase and £100 cumulative validation revenue.

## Evidence refreshed
- Revenue: fresh authoritative payment evidence unavailable in this execution path; **null**. Latest authoritative settled evidence remains **£0 / £1,000 monthly, £0 / £100 validation, 0 paying customers** from a live Home Quote Check Stripe account with 0 PaymentIntents.
- Durable funnel/acquisition: fresh authoritative synthetic-excluded snapshot unavailable this run; **null**. Latest settled snapshot remains **80 landings → 56 checker starts/CTA → 6 uploads → 6 genuine analyses**, 5 extended genuine analyses → **1 multi-quote analysis** → 5 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct produced all 6 genuine analyses; organic-labelled cohorts had landings but 0 CTA/uploads/analyses.
- Technology evidence: latest settled durable breakdown records Heat Pump 27 landings, 41 CTA events, 1 upload, 1 genuine analysis, 1 multi-quote analysis, 1 Decision Case, 0 checkouts. Unsegmented remainder remains unknown.
- Search: fresh Search Console evidence unavailable; **null**. Latest settled summary remains 0 clicks, 4 impressions, 0% CTR, average position 8.07.
- Production health: **not green**. Scheduled `HQC site consistency` run `35862572810` on current main `ee2a957f880dd27ff06ce6562f247f570110a22e` failed in the browser audit step `Crawl HTML pages, verify loaded assets, responsive layouts and PDF upload`. Setup/install passed. The available Actions metadata does not expose the failing assertion/log text, so do not infer whether this is a production defect or QA timeout. Per SHIP_CHANGE, production health remains unverified until a subsequent audit is green or the exact failure is diagnosed.

## Commercial diagnosis
The latest settled funnel still identifies checker-start/CTA → upload as the earliest measured revenue constraint at **6/56 (11%)**. Six genuine analyses remain too few for a pricing/payment-demand conclusion. However, the newly observed red production consistency gate temporarily outranks conversion changes: do not ship unrelated UI changes while production health is unverified.

## Current milestone
First genuine £4.99 Decision Pack purchase, then £100 cumulative validation revenue.

## Solar/Battery progress
- Technology-aware Decision Pack telemetry CI remains verified green (`35850406399`).
- Gated Solar/Battery routing, analysis/comparison, evidence preservation, installer questions and representative extracted PDF/screenshot/photo envelopes remain CI-verified behind the non-public gate.
- A gated customer-facing Solar/Battery preview journey exists via explicit `?solar_preview=1` / session preview state and remains non-public.
- Rendered Solar verification remains pending a confirmed green custom-domain canary after navigation hardening `df080f3`.
- Solar Decision Pack content remains Heat-Pump-specific and must stay gated.
- No Solar public release was made this run.

## Active workstreams
1. **P0/P1 reliability:** diagnose the current red site-consistency audit before unrelated production UI changes.
2. Reduce Heat Pump checker-start → upload friction once production health is green.
3. Continue qualified Heat Pump acquisition/conversion while measuring upload → genuine analysis → checkout → purchase.
4. Close gated Solar rendered/isolation verification and durable technology attribution.
5. Begin Financial Assumptions Check after trustworthy Solar ingestion/journey gate is green end-to-end.

## Expected revenue impact
No genuine-revenue advance this run. Protecting the working Heat Pump journey from an unresolved production-consistency failure prevents conversion work from being measured against an unreliable surface. Once green, start→upload remains the highest-leverage measured commercial boundary.

## Next actions
1. Obtain/diagnose the exact failure from `HQC site consistency` run `35862572810`; fix only a legitimate production/QA regression and require a green rerun.
2. Resume the measured Heat Pump upload-activation experiment after the reliability gate is green.
3. Confirm a post-`df080f3` custom-domain canary green before promoting Solar rendered verification.
4. Verify technology propagation into durable funnel/checkout events end-to-end.
5. Continue qualified Heat Pump acquisition and measure genuine analysis → checkout → purchase.

## Durable learning
No new OPS/LEARNINGS.md entry. A single failed audit without the failing assertion does not establish a reusable lesson.

## Guardrails
GitHub + Cloudflare only; never AppDeploy. UI production changes require rendered verification. Preserve independence/privacy/evidence guardrails.