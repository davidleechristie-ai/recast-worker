# Run log

## 2026-09-23 11:20 Europe/London — representative Solar document-ingestion gate added
- PRODUCT: added representative extractor-output fixtures for multi-page PDF, mobile screenshot OCR and partial camera-photo OCR, plus PDF+screenshot comparison.
- TESTS: added `test/solar-battery-extractor-e2e.test.mjs` to drive representative extracted-media envelopes through the gated Solar handler and assert evidence, provenance, unknown preservation and comparison behaviour.
- CI: `HQC Solar analysis CI` now runs the representative ingestion test. Commits: `46bbfb1727a0b79c70794fd49b6fd32817b392b2`, `9fe85a17e9f0d9d8a40e2abc0c0b9c7a51a936f2`, `e1cd6e9f2933ebd0121cb1d01da34f18bfc2bae9`.
- SAFETY: Solar remains non-public; raw PDF/image HTTP support is not opened by this change.
- NEXT: confirm CI green, then connect the proven Solar path to the customer-facing journey behind the existing public gate and perform rendered desktop/mobile verification.


Append concise dated run records here. Record only observed evidence and completed work.

## 2026-09-23 09:41 Europe/London — authoritative revenue refresh; no material state change
- REVENUE: refreshed the live Home Quote Check Stripe account. PaymentIntents list is empty (`data=[]`, `has_more=false`), so authoritative successful production payment evidence remains £0 / £1,000 monthly, £0 / £100 validation and 0 paying customers.
- FUNNEL/ACQUISITION: fresh authoritative synthetic-excluded Cloudflare snapshot unavailable in this execution path; null. Latest settled snapshot remains 56 landings → 16 starts → 5 uploads → 5 analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts.
- SEARCH: fresh Search Console evidence unavailable; null. Public web search produced no usable evidence and was not substituted for Search Console.
- PRODUCTION: fresh authoritative health evidence unavailable through the available HTTP path; null. No deployment or UI change made.
- PRODUCT: inspected the current Solar ingestion boundary and checkout technology plumbing; no unverified code change was shipped. Solar remains non-public and raw PDF/image requests remain HTTP 415.
- LEARNINGS: unchanged; no authoritative evidence established or overturned a reusable lesson.
- EXPECTED IMPACT: evidence refresh prevents stale/null payment state from being mistaken for revenue progress; commercial priority remains qualified acquisition/activation toward first £4.99 purchase.
- NEXT: representative PDF/screenshot/photo extractor fixtures; technology propagation verification through durable checkout evidence; continue qualified Heat Pump acquisition.

## 2026-09-23 08:42 Europe/London — extracted-media → gated Solar handler verified
- REVENUE: fresh authoritative Stripe evidence unavailable in this execution path; fresh evidence null. Latest authoritative settled evidence remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers and is not promoted as fresh.
- FUNNEL/ACQUISITION: fresh authoritative synthetic-excluded Cloudflare snapshot unavailable; null. Latest settled snapshot remains 56 landings → 16 starts → 5 uploads → 5 analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts.
- SEARCH: fresh Search Console evidence unavailable; null. Latest settled summary remains 0 clicks / 4 impressions / 0% CTR / average position 8.07.
- VERIFICATION: GitHub Actions `HQC Solar analysis CI` run `35823816580` completed successfully for commit `c4dca3dbd1d95cb64f8e33774f5787f8a8afc40b`.
- PRODUCT: promoted extracted-media → gated Solar handler integration from pending to verified. PDF-derived and image/OCR-derived extracted-text envelopes preserve provenance and unknowns; invalid envelopes fail closed.
- SAFETY: Solar remains non-public; raw PDF/image requests remain HTTP 415; no Heat Pump or production UI change.
- ROADMAP: WS2/WS3 updated to record verified handler integration. Remaining ingestion boundary is representative client/extractor PDF/screenshot/photo end-to-end correctness before changing raw-media support.
- LEARNINGS: unchanged; no reusable customer/product lesson established.
- EXPECTED IMPACT: removes another technical trust boundary toward a sellable Solar/Battery quote checker while preserving the live Heat Pump path.
- NEXT: representative client/extractor PDF/screenshot/photo fixtures; verify technology propagation into durable funnel/checkout evidence; continue qualified Heat Pump acquisition toward first genuine £4.99 purchase.

## 2026-09-23 06:47 Europe/London — extracted-media envelopes wired into gated Solar handler
- REVENUE: fresh authoritative Stripe evidence unavailable in this execution path; fresh evidence null. Latest authoritative settled evidence remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers.
- FUNNEL/ACQUISITION: fresh authoritative synthetic-excluded Cloudflare snapshot unavailable; null. Latest settled snapshot remains 56 landings → 16 starts → 5 uploads → 5 analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts.
- SEARCH: fresh Search Console evidence unavailable; null. Latest settled summary remains 0 clicks / 4 impressions / 0% CTR / average position 8.07.
- PRODUCT: wired the already-verified extracted-media provenance envelope into the non-public Solar request handler. Structured JSON may now carry PDF/image-derived extracted text + provenance into Solar analysis; raw PDF/image HTTP requests remain 415.
- TESTS: added handler-level PDF-derived and image/OCR-derived fixtures, provenance assertions, unknown-preservation and invalid-envelope fail-closed coverage.
- COMMITS: `a5044219eba000aa6aaefab8625be2d2bbf9e10b`, `c4dca3dbd1d95cb64f8e33774f5787f8a8afc40b`.
- VERIFICATION: `HQC Solar analysis CI` run `35823816580` was in progress at cutoff; capability is not promoted to verified yet.
- SAFETY: Solar remains non-public; raw media remains fail-closed; no Heat Pump or production UI change.
- LEARNINGS: unchanged; no reusable customer/product lesson established.
- NEXT: confirm CI, then progress representative client/extractor PDF/screenshot/photo fixtures and technology propagation.

## 2026-09-23 01:42 Europe/London — Solar media extraction contract verified
- REVENUE: fresh authoritative Stripe evidence unavailable in this execution path; fresh evidence is null. Latest authoritative settled evidence remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers and is not promoted as fresh.
- FUNNEL/ACQUISITION: no newer authoritative synthetic-excluded Cloudflare snapshot available in this execution path; fresh funnel evidence is null. Latest settled snapshot remains 56 landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts.
- SEARCH: fresh authoritative Search Console evidence unavailable; null rather than inferred. Latest settled summary remains 0 clicks / 4 impressions / 0% CTR / average position 8.07.
- VERIFICATION: GitHub Actions `HQC Solar analysis CI` run `35798847121` completed successfully for commit `7593955a07378842bf77d1bf77b21a136f41114c`.
- PRODUCT: promoted the PDF/image extracted-media provenance contract from queued to CI-verified. The next safe boundary is representative client/extractor → gated-handler end-to-end fixtures.
- SAFETY: raw PDF/image requests remain HTTP 415; Solar remains non-public; no Heat Pump or production UI change was made.
- ROADMAP: updated WS2/WS3 to record the verified media extraction contract without marking raw media ingestion live.
- LEARNINGS: unchanged; no new authoritative reusable customer/product lesson established.
- NEXT: wire only verified extracted-text envelopes into the gated Solar request path and prove representative PDF/image extraction end-to-end before changing the 415 boundary; continue qualified Heat Pump acquisition toward first genuine £4.99 purchase.

## Earlier runs
Earlier detailed run history remains available in repository history. The current state and durable learnings carry forward the authoritative operating context.