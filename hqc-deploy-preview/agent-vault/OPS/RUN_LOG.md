# Run log

## 2026-09-24 12:40 Europe/London — evidence refreshed; Solar customer-ingestion boundary narrowed
- REVENUE: authoritative live Home Quote Check Stripe PaymentIntents refreshed; `data=[]`, `has_more=false`. Genuine revenue remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers.
- FUNNEL: latest durable synthetic-excluded snapshot at 10:13Z remains 81 landings → 56 starts/CTA → 6 uploads → 6 genuine analyses → 1 multi-quote analysis → 5 Decision Cases → 2 share intents → 0 durable checkouts. Start→upload remains the earliest measured constraint at 11%; direct still produced all 6 genuine analyses.
- SEARCH: fresh GSC settled through 2026-09-21 remains 0 clicks, 5 impressions, 0% CTR, average position 7.06.
- PRODUCTION: last full site-consistency verification remains green (`35979158224`); current main Cloudflare bridge for `7ec7f115` is green. No public UI release was made.
- SOLAR DIAGNOSIS: inspected the current private customer intake and Solar request boundary. Browser intake selects screenshot/photo/PDF files and the PDF compatibility layer converts PDFs to WebP for the existing analysis journey. The private Solar handler deliberately accepts application/json only and consumes `quoteText` or a provenance-bearing `extractedMedia` envelope. Direct raw-media HTTP remains fail-closed. Therefore the next safe Solar implementation is a trusted extraction-output → JSON `extractedMedia` bridge, not routing Solar binary media through Heat Pump or weakening the internal gate.
- ROADMAP: no release gate promoted this run; the remaining WS3 customer-ingestion task is now concretely scoped to selected media → extracted text/provenance → Solar JSON handler → rendered results.
- LEARNINGS: unchanged; this is implementation-boundary evidence, not customer-demand or willingness-to-pay evidence.
- EXPECTED IMPACT: reduces ambiguity and dependency risk on the next Solar implementation while protecting the live Heat Pump path. Direct first-purchase priority remains Heat Pump start→upload activation.
- NEXT: continue Heat Pump activation; implement/test the private Solar extracted-media bridge and require rendered end-to-end verification before any public Solar CTA.

## 2026-09-24 11:43 Europe/London — private Solar rendered/isolation gate verified
- REVENUE: authoritative live Home Quote Check Stripe PaymentIntents refreshed; `data=[]`, `has_more=false`. Genuine revenue remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers.
- FUNNEL: fresh durable synthetic-excluded snapshot at 10:13Z remains 81 landings → 56 starts/CTA → 6 uploads → 6 genuine analyses → 1 multi-quote analysis → 5 Decision Cases → 2 share intents → 0 durable checkouts. Start→upload remains the earliest measured constraint at 11%; direct still produced all 6 genuine analyses.
- SEARCH: fresh GSC settled through 2026-09-21 remains 0 clicks, 5 impressions, 0% CTR, average position 7.06.
- PRODUCTION: last full site-consistency verification remains green (`35979158224`); current main Cloudflare build is green. No public Solar release was made.
- SOLAR VERIFICATION: inspected custom-domain canary `35983345210` for render-order fix `a7f5b3c6`. Although the workflow is labelled cancelled due to concurrency, every substantive job step completed successfully: snapshot, canary binding, domain/static/API verification and `Verify quote intake paths in mobile browser`; `Complete job` also succeeded. This is sufficient evidence that the previously failing private Solar rendered preview/isolation assertion is now green.
- ROADMAP: WS3 rendered browser and private preview/isolation gates advanced to verified. Solar remains non-public because the customer-facing raw-media upload→analysis→results path and Solar-specific paid Decision Pack are not yet release-ready.
- LEARNINGS: unchanged; this is engineering gate progress, not evidence of customer demand or willingness to pay.
- EXPECTED IMPACT: removes the rendered-journey blocker to validating trustworthy Solar/Battery quote checking without destabilising the Heat Pump revenue path.
- NEXT: continue Heat Pump start→upload activation; in parallel wire the verified Solar extracted-media path into the private customer upload/analyse/results journey and verify technology telemetry end-to-end.

## 2026-09-24 10:49 Europe/London — Solar rendered conflict diagnosed and fixed behind closed gate
- REVENUE: authoritative live Home Quote Check Stripe PaymentIntents refreshed; `data=[]`, `has_more=false`. Genuine revenue remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers.
- FUNNEL: latest durable synthetic-excluded snapshot remains 81 landings → 56 starts/CTA → 6 uploads → 6 genuine analyses → 1 multi-quote analysis → 5 Decision Cases → 2 share intents → 0 durable checkouts. Start→upload remains the earliest measured constraint at 11%.
- SEARCH: fresh GSC settled through 2026-09-21 remains 0 clicks, 5 impressions, 0% CTR, average position 7.06.
- PRODUCTION: last full site-consistency run `35979158224` remains green. Latest Solar custom-domain canary `35979367750` passed snapshot, Cloudflare deploy, domain, static assets and API checks, then failed rendered-browser verification.
- SOLAR DIAGNOSIS: `approved-home-layout.js` re-applies Heat-Pump hero and journey-choice copy during DOM mutations. The gated Solar preview also decorates that DOM, creating a render-order conflict consistent with the missing `#hqc-solar-preview-badge` assertion.
- FIX: commit `a7f5b3c67463d9da067a8651b0c73af044853c61` schedules Solar decoration after mutation batches and makes the explicit Solar preview own hero plus single/compare choice copy. The public default remains Heat Pump; Solar remains non-public.
- VERIFICATION: deploy and custom-domain canary checks for the fix were queued at cutoff. Per SHIP_CHANGE, do not mark the UI capability verified until rendered mobile+desktop canary is green.
- LEARNINGS: unchanged; this is implementation-level render-order evidence, not a durable customer/product lesson.
- EXPECTED IMPACT: removes a concrete blocker to trustworthy Solar/Battery customer-journey validation while preserving the live Heat Pump revenue path.
- NEXT: inspect the new canary; if green, promote Solar rendered/isolation gate status and progress gated end-to-end upload/analyse/result wiring. In parallel continue Heat Pump start→upload activation toward the first £4.99 purchase.

## 2026-09-24 10:08 Europe/London — production gate green; commercial activation resumes
- REVENUE: authoritative live Home Quote Check Stripe PaymentIntents refreshed; `data=[]`, `has_more=false`. Genuine revenue remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers.
- FUNNEL: fresh durable snapshot (2026-09-24 05:03:55Z) is 81 landings → 56 starts/CTA → 6 uploads → 6 genuine analyses; 5 extended genuine → 1 multi-quote analysis → 5 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Start→upload remains the earliest measured constraint at 11%.
- SEARCH: fresh GSC 28-day settled summary through 2026-09-21 is 0 clicks, 5 impressions, 0% CTR, average position 7.06.
- PRODUCTION DIAGNOSIS: exact logs from failed site-consistency run `35862572810` show the only failure was the PDF probe timing out on obsolete CTA copy `/check my quote/i`; the broader 23-page crawl had no reported production failure.
- FIX: commit `698a04be3e8c7b371b4f9ea450fcf148961356de` makes the PDF probe follow the current quote CTA intent rather than stale exact wording.
- VERIFICATION: site-consistency run `35979158224` is green. It audited 23 HTML pages plus required runtime assets and explicitly logged `PDF_UPLOAD_REGRESSION_VERIFIED eco-stream-quote-pdf.webp image/webp`.
- DECISION: production reliability is green again; resume the measured Heat Pump start→upload activation work. Keep Solar non-public because its separate custom-domain rendered badge gate is still red.
- SOLAR: latest inspected canary reached snapshot/deploy/domain/static/API verification but timed out waiting for `#hqc-solar-preview-badge`; rendered Solar verification remains pending.
- LEARNINGS: unchanged; selector drift was repaired in QA but no new durable customer/product lesson was established.
- NEXT: progress Heat Pump upload activation; independently diagnose Solar preview badge rendering and durable technology attribution.
