# Current state

Updated: 2026-09-23 12:43 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase and £100 cumulative validation revenue.

## Evidence refreshed
- Revenue: authoritative live Home Quote Check Stripe evidence refreshed this run. The live account has **0 PaymentIntents** (`has_more=false`), therefore successful non-refunded production payments remain **£0 / £1,000 monthly, £0 / £100 validation, 0 paying customers**.
- Durable funnel/acquisition: fresh authoritative synthetic-excluded Cloudflare snapshot generated 2026-09-23T11:40:31Z: **80 landings → 56 checker starts/CTA → 6 uploads → 6 genuine analyses**, 5 extended genuine analyses → **1 multi-quote analysis** → 5 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains the only source producing genuine analyses: 62 landings → 56 CTA → 6 uploads → 6 genuine analyses. Organic-labelled cohorts have landings but 0 CTA/uploads/analyses in this snapshot.
- Technology evidence: current durable technology breakdown records Heat Pump 27 landings, 41 CTA events, 1 upload, 1 genuine analysis, 1 multi-quote analysis, 1 Decision Case, 0 checkouts. Technology segmentation is not yet complete enough to reconcile all aggregate events; treat unsegmented remainder as unknown rather than assigning it.
- Search: fresh Search Console evidence unavailable; **null**. Latest settled summary remains 0 clicks, 4 impressions, 0% CTR, average position 8.07.
- Production: no production UI release made this run. Solar remains non-public and raw PDF/image requests remain fail-closed.

## Commercial diagnosis
The refreshed funnel materially sharpens the constraint: landing/start volume increased, but start/CTA → upload is only **6/56 (11%)**, making quote intake/activation the earliest measured revenue bottleneck. Six genuine analyses remain too few for a pricing/payment-demand conclusion. A first multi-quote analysis is now observed, but there are still zero durable checkouts and zero payments.

## Current milestone
First genuine £4.99 Decision Pack purchase, then £100 cumulative validation revenue.

## Solar/Battery progress
- Technology-aware Decision Pack telemetry CI is now **verified green**: `HQC Solar analysis CI` run `35850406399` completed successfully for commit `ad5f43a8b9e0029ab6d97ef1f6f606215efa60f1`.
- Custom-domain canary browser coverage explicitly tests the private Solar preview at mobile/desktop and separately proves the default public page remains Heat Pump. Run `35850820509` failed on browser navigation timeout; navigation hardening commit `df080f3` is present. Rendered Solar verification remains pending until a later custom-domain canary is authoritatively confirmed green.
- Technology-specific Solar/Battery routing, analysis/comparison, evidence preservation, installer questions and representative extracted PDF/screenshot/photo envelopes remain CI-verified behind the non-public gate.
- A gated customer-facing Solar/Battery preview journey exists via explicit `?solar_preview=1` / session preview state and remains non-public.
- Solar Decision Pack content itself is still Heat-Pump-specific and must not be exposed for Solar merely because telemetry is technology-aware.
- Heat Pump public journey and production UI were not released or changed in production.

## Active workstreams
1. Reduce Heat Pump checker-start → upload friction, now the clearest measured first-revenue bottleneck.
2. Continue qualified Heat Pump acquisition/conversion while measuring upload → genuine analysis → checkout → purchase.
3. Verify gated Solar preview journey on desktop/mobile while proving non-preview Heat Pump isolation.
4. Verify technology propagation into durable funnel/checkout evidence end-to-end; keep Solar Decision Pack content gated until technology-specific output exists.
5. Begin Financial Assumptions Check after trustworthy ingestion/journey gate is green end-to-end.

## Expected revenue impact
No genuine-revenue advance this run. The new durable evidence identifies quote intake rather than landing engagement as the highest-leverage conversion boundary: 56 starts/CTA events produced only 6 uploads. Reducing that friction should increase the number of genuine analyses exposed to the £4.99 paid boundary without requiring speculative pricing changes.

## Next actions
1. Diagnose and reduce checker-start → upload friction using the existing public Heat Pump journey; preserve one-experiment-at-a-time for overlapping activation changes.
2. Confirm a post-`df080f3` custom-domain canary green before promoting Solar rendered verification.
3. Verify technology propagation into durable funnel/checkout events end-to-end.
4. Continue qualified Heat Pump acquisition and measure genuine analysis → checkout → purchase.
5. Start Financial Assumptions Check after the Solar ingestion/journey gate is green end-to-end.

## Durable learning
No new OPS/LEARNINGS.md entry this run. The new snapshot materially refines the current diagnosis but remains a small cohort; retain it in current state until further genuine traffic establishes a reusable rule.

## Guardrails
GitHub + Cloudflare only; never AppDeploy. UI production changes require rendered verification. Preserve independence/privacy/evidence guardrails.