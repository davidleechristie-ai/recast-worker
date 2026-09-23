# Run log

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