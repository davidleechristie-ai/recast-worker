# Run log

Append concise dated run records here. Record only observed evidence and completed work.

## 2026-09-22 12:42 Europe/London — Solar installer-question CI verified; live revenue refreshed
- REVENUE: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: empty list (`data: []`, `has_more: false`). Genuine revenue remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers.
- FUNNEL/ACQUISITION: no newer authoritative Cloudflare-side snapshot available in this execution path; latest remains 56 landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains 40 → 16 → 5 → 5. Missing newer evidence remains null.
- SEARCH: no newer authoritative Search Console dataset established; latest available remains 0 clicks / 4 impressions / 0% CTR / average position 8.07.
- PRODUCTION: origin retrieval was unavailable through the current web path and no HQC production release was made. Prior rendered recovery/router-isolation proof remains authoritative; current GitHub canary evidence is not substituted for rendered production verification.
- PRODUCT/TESTS: `HQC Solar analysis CI` run `35717861021` completed successfully for commit `fc8a8840dcb0042b02874aac7e043360ce345d5b`, closing the pending verification gate for evidence-tied Solar/Battery installer questions.
- ROADMAP: WS3 installer-question capability marked verified/complete. PDF/image ingestion remains the next WS2/WS3 trust boundary; Solar remains non-public and Heat Pump unchanged.
- OPS/LEARNINGS.md unchanged: no new authoritative reusable customer/product lesson established.
- NEXT: implement and verify PDF/image ingestion behind the gate, verify technology propagation into durable funnel/checkout events, and continue qualified Heat Pump acquisition toward first genuine £4.99 purchase.

## 2026-09-22 11:48 Europe/London — evidence-tied Solar installer questions implemented
- REVENUE: no newer authoritative successful non-refunded payment dataset was available in this execution path; latest authoritative live Stripe evidence remains 0 PaymentIntents, £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers. Unavailable was not converted to a fresh zero.
- FUNNEL/ACQUISITION: fresh Cloudflare-side snapshot at `2026-09-22T10:06:07Z` remains 56 landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains 40 → 16 → 5 → 5. Measured landing→start is 29%; start→upload 31%. Technology row currently contains only heat_pump 3→1→0, so missing historical technology attribution is null rather than backfilled.
- SEARCH: no newer authoritative Search Console dataset established; latest available remains 0 clicks / 4 impressions / 0% CTR / average position 8.07.
- PRODUCTION: no deployment made. Origin retrieval was unavailable in this execution path; prior rendered recovery and production router-isolation proof remain authoritative.
- PRODUCT: added quote-specific Solar/Battery installer questions generated only from explicit evidence gaps. Questions ask for missing panel/array/inverter/battery/generation/DNO/warranty/MCS/price evidence and do not infer approval, certification or performance.
- TESTS: added regression coverage for partial evidence, battery-only suppression of irrelevant solar questions, and two-quote question generation. Commits `41242eca8c0e642369a51ff2b5362c0e10d4874c` and `fc8a8840dcb0042b02874aac7e043360ce345d5b`. CI had not registered at last observation, so the change is implemented/pending verification, not claimed green.
- ROADMAP: WS3 installer-question capability advanced to implemented/pending CI. PDF/image ingestion remains the next WS2 trust boundary; Solar remains non-public and Heat Pump unchanged.
- OPS/LEARNINGS.md unchanged: no new authoritative reusable customer/product lesson established.
- NEXT: require CI green; then continue PDF/image ingestion and technology-propagation work behind the gate while qualified Heat Pump acquisition remains commercial P0.

## 2026-09-22 10:41 Europe/London — Worker Solar isolation CI verified
- REVENUE: no newer authoritative payment dataset was available in this execution path; latest authoritative live Stripe evidence remains 0 PaymentIntents, £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers. Unavailable was not converted to a fresh zero.
- Funnel/acquisition: fresh production metrics unavailable; latest settled remains 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains 40 → 16 → 5 → 5.
- Search: no newer authoritative Search Console evidence; latest available remains 0 clicks / 4 impressions / 0% CTR / average position 8.07.
- PRODUCTION: no deployment made; prior rendered recovery and production router-isolation verification remain authoritative.
- CI EVIDENCE: GitHub Actions run `35706680835`, `HQC Solar analysis CI`, completed successfully for commit `a3661ea47293a0f715ba4647a7f00b35f95866d2`.
- PRODUCT/SAFETY: the actual Worker-level gate is now verified: Solar/Battery remains closed when `HQC_SOLAR_ANALYSIS_INTERNAL` is absent, enters the dedicated handler only when explicitly enabled, and unsupported technologies fail closed. Heat Pump was not changed.
- ROADMAP: WS2 request + Worker isolation boundary now verified. Next technical boundary is trustworthy PDF/image/manual ingestion plus technology propagation through durable funnel/checkout evidence. Solar remains non-public.
- OPS/LEARNINGS.md unchanged: this is engineering verification, not a new reusable customer/product lesson.
- NEXT: implement and verify ingestion behind the gate while continuing first-customer Heat Pump acquisition.

## 2026-09-22 09:46 Europe/London — Solar request CI green; Worker isolation coverage added
- REVENUE: no newer authoritative payment dataset was available in this execution path; latest authoritative live Stripe evidence remains 0 PaymentIntents, £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers. Unavailable was not converted to a fresh zero.
- Funnel/acquisition: fresh production metrics unavailable; latest settled remains 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains 40 → 16 → 5 → 5.
- Search: no newer authoritative Search Console evidence; latest available remains 0 clicks / 4 impressions / 0% CTR / average position 8.07.
- PRODUCTION: no deployment made; prior rendered recovery and router-isolation verification remain authoritative.
- CI EVIDENCE: previously queued Solar request-integration run `35701193912` completed successfully for commit `e51dc504cb7c59ab76598b90f32002de89140621`. Structured/manual JSON request integration is now verified behind the non-public gate.
- PRODUCT/SAFETY: added `test/worker-entry-solar-gate.test.mjs` proving the actual Worker keeps Solar/Battery closed with a 409 when the internal gate is absent, enters only the dedicated handler with `HQC_SOLAR_ANALYSIS_INTERNAL=1`, and keeps unsupported technologies fail-closed.
- CI: updated `HQC Solar analysis CI` to execute the Worker-level gate/isolation test and trigger on it. Commit `a3661ea47293a0f715ba4647a7f00b35f95866d2`; workflow registration was not visible at last observation, so this new Worker-level proof is pending rather than claimed green.
- ROADMAP: WS2 request integration marked verified; Worker isolation coverage implemented/pending CI. Solar remains non-public; Heat Pump unchanged.
- OPS/LEARNINGS.md unchanged: no new authoritative reusable customer/product lesson established.
- NEXT: require Worker isolation CI green, then progress verified PDF/image/manual ingestion behind the gate while continuing first-customer Heat Pump acquisition.

## Earlier runs
Earlier detailed run history remains available in repository history. The current state and durable learnings carry forward the authoritative operating context.