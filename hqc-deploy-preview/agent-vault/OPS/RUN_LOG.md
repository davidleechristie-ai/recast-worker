# Run log

Append concise dated run records here. Record only observed evidence and completed work.

## 2026-09-23 00:45 Europe/London — Solar media extraction trust boundary
- REVENUE: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: empty list (`data: []`, `has_more: false`). Genuine revenue remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers.
- FUNNEL/ACQUISITION: no newer authoritative synthetic-excluded Cloudflare snapshot available in this execution path; fresh funnel evidence is null. Latest settled snapshot remains 56 landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts.
- SEARCH: fresh authoritative Search Console evidence unavailable; null rather than inferred. Latest settled summary remains 0 clicks / 4 impressions / 0% CTR / average position 8.07.
- PRODUCT: added `lib/solar-battery-media-ingestion.js`, a fail-closed provenance contract for text extracted from PDF/JPEG/PNG/WebP. It requires supported source media type, non-empty extracted text and named extraction method; unknown confidence remains null.
- TESTS: added `test/solar-battery-media-ingestion.test.mjs` covering PDF-derived text, image/OCR-derived text, missing text, unsupported media and missing provenance. Updated `HQC Solar analysis CI` to execute the new contract tests.
- SAFETY: raw PDF/image request handling remains HTTP 415 and Solar remains non-public. No Heat Pump or production UI change was made.
- VERIFICATION: GitHub Actions run `35798847121` for commit `7593955a07378842bf77d1bf77b21a136f41114c` was queued at end of run; do not promote the media contract to verified until green.
- LEARNINGS: unchanged; no new authoritative reusable customer/product lesson established.
- NEXT: verify CI; then wire only verified extracted-text envelopes into the gated Solar request path and add representative end-to-end extraction fixtures before considering any relaxation of raw-media 415.

## 2026-09-22 22:42 Europe/London — authoritative revenue refresh
- REVENUE: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: empty list (`data: []`, `has_more: false`). Genuine revenue remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers.
- FUNNEL/ACQUISITION: no newer authoritative synthetic-excluded Cloudflare snapshot was available in this execution path; fresh funnel evidence is null. Latest settled snapshot remains 56 landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts.
- SEARCH: fresh authoritative Search Console evidence unavailable in this execution path; null rather than inferred. Latest settled summary remains 0 clicks / 4 impressions / 0% CTR / average position 8.07.
- PRODUCTION: no release made; prior rendered frontend recovery and router-isolation proof remain authoritative.
- PRODUCT/SAFETY: re-inspected the gated Solar request handler. Non-JSON media remains deliberately fail-closed at HTTP 415; structured/manual JSON remains the verified ingestion boundary. No unsafe media support introduced.
- ROADMAP: no capability promoted to verified/live. Representative PDF/image extraction correctness remains the next WS2/WS3 boundary, followed by technology propagation. Solar remains non-public; Heat Pump unchanged.
- OPS/LEARNINGS.md unchanged: no new authoritative reusable customer/product lesson established.
- NEXT: add representative gated PDF/image extraction correctness fixtures before changing the 415 boundary; continue qualified Heat Pump acquisition toward first genuine £4.99 purchase.

## 2026-09-22 21:41 Europe/London — authoritative revenue + durable funnel refresh
- REVENUE: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: empty list (`data: []`, `has_more: false`). Genuine revenue remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers.
- FUNNEL/ACQUISITION: latest repository-backed Cloudflare snapshot fetched at `2026-09-22T18:59:24Z` remains 56 landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains 40 → 16 → 5 → 5. Technology-segmented evidence currently records heat_pump 3 → 1 → 0 → 0; missing historical technology attribution remains null.
- SEARCH: fresh public search returned no indexed result in this execution path. Search Console was unavailable, so fresh authoritative Search Console evidence is null; latest settled summary remains 0 clicks / 4 impressions / 0% CTR / average position 8.07.
- PRODUCTION: direct origin retrieval unavailable in this execution path; no HQC production release made. Prior rendered recovery/router-isolation proof remains authoritative.
- PRODUCT/SAFETY: no unsafe media support introduced. Solar non-JSON media remains deliberately fail-closed at HTTP 415 while structured/manual JSON remains the verified ingestion boundary.
- ROADMAP: no capability promoted to verified/live. Trustworthy PDF/image extraction remains the next WS2/WS3 boundary, followed by end-to-end technology propagation. Solar remains non-public; Heat Pump unchanged.
- OPS/LEARNINGS.md unchanged: no new authoritative reusable customer/product lesson established.
- NEXT: build representative gated PDF/image extraction correctness fixtures before changing the 415 boundary; continue qualified Heat Pump acquisition toward first genuine £4.99 purchase.

## Earlier runs
Earlier detailed run history remains available in repository history. The current state and durable learnings carry forward the authoritative operating context.