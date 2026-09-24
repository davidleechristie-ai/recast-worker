# Run log

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


## 2026-09-23 16:46 Europe/London — production consistency gate red; unrelated UI work held
- REVENUE: fresh authoritative payment evidence unavailable in this execution path; null. Latest settled authoritative position remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers.
- FUNNEL/ACQUISITION: fresh authoritative synthetic-excluded snapshot unavailable; null. Latest settled snapshot remains 80 landings → 56 starts/CTA → 6 uploads → 6 genuine analyses → 1 multi-quote analysis → 5 Decision Cases → 2 share intents → 0 durable checkouts. Start→upload remains the earliest measured commercial constraint at 11%.
- SEARCH: fresh Search Console evidence unavailable; null.
- PRODUCTION: scheduled `HQC site consistency` run `35862572810` failed on main `ee2a957f880dd27ff06ce6562f247f570110a22e`. Setup and Playwright installation passed; the failing step was the browser audit covering HTML/assets/responsive/PDF upload. Available Actions metadata does not expose the failing assertion, so production health is unverified rather than assumed broken or healthy.
- DECISION: per SHIP_CHANGE, hold unrelated UI production changes until the red consistency gate is diagnosed and a green verification exists. This temporarily outranks the measured upload-activation experiment.
- SOLAR: remains non-public; no capability was promoted. Existing gated analysis/extraction evidence remains intact; rendered custom-domain verification remains pending.
- LEARNINGS: unchanged; one opaque audit failure is insufficient for a durable rule.
- NEXT: diagnose exact site-consistency failure, repair only if legitimate, require green rerun; then resume start→upload conversion work and independent Solar rendered/isolation verification.

## 2026-09-23 12:43 Europe/London — fresh funnel identifies quote-intake constraint
- REVENUE: authoritative live Home Quote Check Stripe PaymentIntents refreshed; `data=[]`, `has_more=false`. Genuine revenue remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers.
- FUNNEL: fresh synthetic-excluded Cloudflare snapshot at 11:40Z: 80 landings → 56 CTA/checker starts → 6 uploads → 6 genuine analyses; 5 extended genuine → 1 multi-quote analysis → 5 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts.
- SOURCE: direct produced all 6 genuine analyses (62 landings → 56 CTA → 6 uploads → 6 genuine); current organic-labelled cohorts produced landings but no CTA/upload/analysis.
- DIAGNOSIS: start/CTA → upload is now the earliest measured constraint at 11%; landing engagement is no longer the leading measured problem. Sample remains small, so do not infer a pricing problem from 0 checkouts.
- SOLAR: technology-aware Decision Pack telemetry CI run `35850406399` is now confirmed green for `ad5f43a8b9e0029ab6d97ef1f6f606215efa60f1`. Rendered Solar preview verification remains pending a confirmed post-`df080f3` custom-domain canary success.
- SEARCH: fresh Search Console evidence unavailable; null.
- PRODUCTION: no UI/product production release this run; Solar remains non-public and Heat Pump unchanged.
- LEARNINGS: unchanged; evidence refines current diagnosis but does not yet establish a durable reusable customer lesson.
- NEXT: reduce Heat Pump checker-start → upload friction; independently close Solar rendered/isolation verification and durable technology attribution.

## 2026-09-23 12:03 Europe/London — Solar preview canary navigation hardened
- RESULT: custom-domain canary run `35850820509` failed in Playwright because `page.goto(...solar_preview=1)` exceeded 30s waiting for `domcontentloaded`.
- DIAGNOSIS: snapshot, Cloudflare canary deployment, domain verification, static assets and API health had already passed; no Solar proposition/isolation assertion failed before the navigation timeout.
- FIX: commit `df080f39793c574722855afa1e112063cd0a0296` changes the new Solar/default navigation checks to wait for response commit and then explicit UI elements, avoiding a false failure caused by slow/nonessential page resources.
- STATUS: rendered Solar verification remains pending until the resulting canary run is green.
- NEXT: inspect the new run and only promote the gate after success.

## 2026-09-23 11:55 Europe/London — Solar preview rendered-isolation canary added
- TEST: custom-domain Playwright canary now opens the private Solar preview at mobile and desktop widths, requires the Solar/Battery proposition and explicit NOT PUBLIC badge, then opens the normal journey and proves Solar state has not leaked and the Heat Pump proposition remains.
- COMMIT: `83ebc474259aa87bf43dc917687c6fc6d930b5eb`.
- STATUS: test is committed; do not mark rendered verification complete until the resulting canary workflow is green.
- NEXT: inspect canary result, fix any legitimate regression, then advance the preview journey toward real upload/analyse/result wiring while retaining the backend/public gate.

## 2026-09-23 11:48 Europe/London — technology-aware Decision Pack telemetry added
- REVENUE: refreshed authoritative live Home Quote Check Stripe PaymentIntents; `data=[]`, `has_more=false`. Genuine revenue remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers.
- FUNNEL/ACQUISITION: fresh authoritative synthetic-excluded Cloudflare snapshot unavailable in this execution path; null. Latest settled snapshot remains 56 landings → 16 starts → 5 uploads → 5 analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts.
- SEARCH: fresh Search Console evidence unavailable; null.
- PRODUCT: Decision Pack events and checkout requests now carry the active anonymous `hqc_journey_technology`, defaulting safely to `heat_pump`; this removes a Solar/Battery commercial-intent attribution blind spot without changing the public journey.
- TESTS: added `test/decision-pack-technology.test.mjs`; Solar CI now gates this contract.
- COMMITS: `79a8889497873c1e58f7bf355c020dc12e8563ae`, `a3c7a5819cb57a53b846d1f0f9587aa2615851ad`, `ad5f43a8b9e0029ab6d97ef1f6f606215efa60f1`.
- VERIFICATION: `HQC Solar analysis CI` run `35850406399` queued at cutoff; do not promote capability to verified until green.
- SAFETY: no production release; Solar remains non-public; Solar Decision Pack content remains gated because the current pack analysis is Heat-Pump-specific.
- LEARNINGS: unchanged; no authoritative reusable customer/product lesson established.
- EXPECTED IMPACT: preserves trustworthy technology-level measurement so Solar/Battery demand and checkout intent can be evaluated independently of Heat Pump when the gated journey advances.
- NEXT: confirm CI; add rendered browser coverage for gated Solar preview + non-preview Heat Pump isolation; verify durable technology propagation end-to-end; continue qualified Heat Pump acquisition toward first £4.99 purchase.

## 2026-09-23 11:47 Europe/London — gated Solar customer journey added
- PRODUCT: added `solar-preview-journey.js`, activated only by explicit `?solar_preview=1` / preview session state. It adapts landing/upload copy for Solar/Battery and marks analysis requests with `x-hqc-technology: solar_battery`.
- SNAPSHOT: `snapshot.mjs` now bundles the preview script as `/__hqc_solar_preview.js`.
- COMMITS: `564381a0bf0c3a7812063eb045ee85a3eb0f4b38`, `c202d089bd93808c15f3220ec20d5608e1174d89`.
- SAFETY: no public Solar release; backend remains gated by `HQC_SOLAR_ANALYSIS_INTERNAL=1`. Heat Pump remains the default public journey.
- NEXT: add browser regression coverage for preview desktop/mobile plus non-preview Heat Pump isolation, then verify before any exposure.

## 2026-09-23 11:38 Europe/London — representative Solar ingestion gate verified
- VERIFICATION: `HQC Solar analysis CI` run `35849623161` completed successfully for commit `e1cd6e9f2933ebd0121cb1d01da34f18bfc2bae9`.
- PRODUCT: representative PDF extraction, mobile screenshot OCR, partial camera-photo OCR and PDF+screenshot comparison now pass through the gated Solar request handler in CI.
- SAFETY: this verifies extracted-document envelopes, not direct raw-media HTTP ingestion; Solar remains non-public.
- NEXT: connect the verified Solar analysis path to the customer-facing journey behind the closed public gate, then perform rendered desktop/mobile and instrumentation checks before exposure.

## 2026-09-23 11:20 Europe/London — representative Solar document-ingestion gate added
- PRODUCT: added representative extractor-output fixtures for multi-page PDF, mobile screenshot OCR and partial camera-photo OCR, plus PDF+screenshot comparison.
- TESTS: added `test/solar-battery-extractor-e2e.test.mjs` to drive representative extracted-media envelopes through the gated Solar handler and assert evidence, provenance, unknown preservation and comparison behaviour.
- CI: `HQC Solar analysis CI` now runs the representative ingestion test. Commits: `46bbfb1727a0b79c70794fd49b6fd32817b392b2`, `9fe85a17e9f0d9d8a40e2abc0c0b9c7a51a936f2`, `e1cd6e9f2933ebd0121cb1d01da34f18bfc2bae9`.
- SAFETY: Solar remains non-public; raw PDF/image HTTP support is not opened by this change.
- NEXT: confirm CI green, then connect the proven Solar path to the customer-facing journey behind the existing public gate and perform rendered desktop/mobile verification.

Append concise dated run records here. Record only observed evidence and completed work.

## Earlier runs
Earlier detailed run history remains available in repository history. The current state and durable learnings carry forward the authoritative operating context.