# Current state

Updated: 2026-09-23 11:55 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase and £100 cumulative validation revenue.

## Evidence refreshed
- Revenue: authoritative live Home Quote Check Stripe evidence refreshed this run. The live account has **0 PaymentIntents** (`has_more=false`), therefore successful non-refunded production payments remain **£0 / £1,000 monthly, £0 / £100 validation, 0 paying customers**.
- Durable funnel/acquisition: fresh authoritative synthetic-excluded Cloudflare evidence unavailable in this execution path; **null**. Latest settled snapshot remains **56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses**, 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts.
- Search: fresh Search Console evidence unavailable; **null**. Latest settled summary remains 0 clicks, 4 impressions, 0% CTR, average position 8.07.
- Production: no production release made this run. Solar remains non-public and raw PDF/image requests remain fail-closed.

## Commercial diagnosis
Qualified acquisition and activation remain the earliest measured revenue constraints. Only five genuine analyses exist, so there is insufficient evidence for a pricing/payment-demand conclusion. Fresh Stripe evidence confirms no purchase has occurred yet but does not change the bottleneck diagnosis.

## Current milestone
First genuine £4.99 Decision Pack purchase, then £100 cumulative validation revenue.

## Solar/Battery progress
- Custom-domain canary browser coverage now explicitly tests the private Solar preview at 390×844 and 1366×900, requires the non-public badge/Solar proposition, and separately proves the default public page remains Heat Pump with no Solar badge (commit `83ebc47`). Awaiting workflow result before marking rendered verification green.
- Technology-specific Solar/Battery routing, analysis/comparison, evidence preservation, installer questions and representative extracted PDF/screenshot/photo envelopes are CI-verified behind the non-public gate.
- A gated customer-facing Solar/Battery preview journey exists via explicit `?solar_preview=1` / session preview state and remains non-public.
- Decision Pack telemetry/checkout client plumbing now propagates the active anonymous technology dimension from `hqc_journey_technology`, defaulting safely to `heat_pump`. Commit `79a8889497873c1e58f7bf355c020dc12e8563ae`.
- Added `test/decision-pack-technology.test.mjs` and wired it into `HQC Solar analysis CI`; commits `a3c7a5819cb57a53b846d1f0f9587aa2615851ad`, `ad5f43a8b9e0029ab6d97ef1f6f606215efa60f1`.
- CI run `35850406399` was queued at cutoff; technology propagation is implemented but **not yet promoted to verified**.
- Solar Decision Pack content itself is still Heat-Pump-specific and must not be exposed for Solar merely because telemetry is technology-aware.
- Heat Pump public journey and production UI were not released or changed in production.

## Active workstreams
1. Continue qualified Heat Pump acquisition/conversion toward first purchase.
2. Verify gated Solar preview journey on desktop/mobile while proving non-preview Heat Pump isolation.
3. Complete technology propagation verification through durable funnel/checkout evidence; keep Solar Decision Pack content gated until technology-specific output exists.
4. Begin Financial Assumptions Check after trustworthy ingestion/journey gate is green end-to-end.

## Expected revenue impact
No material genuine-revenue advance this run. The change removes a measurement blind spot so future Solar/Battery commercial intent can be attributed correctly without contaminating Heat Pump evidence, improving speed and quality of go/no-go decisions for vertical #2.

## Next actions
1. Confirm `HQC Solar analysis CI` run `35850406399` green before promoting technology-aware checkout telemetry to verified.
2. Add automated rendered/browser coverage for the gated Solar preview journey and non-preview Heat Pump isolation.
3. Verify technology propagation into durable funnel/checkout events end-to-end.
4. Continue qualified Heat Pump acquisition and measure genuine analysis → checkout → purchase.
5. Start Financial Assumptions Check after the ingestion/journey gate is green end-to-end.

## Durable learning
No new reusable customer/product learning established; OPS/LEARNINGS.md unchanged.

## Guardrails
GitHub + Cloudflare only; never AppDeploy. UI production changes require rendered verification. Preserve independence/privacy/evidence guardrails.