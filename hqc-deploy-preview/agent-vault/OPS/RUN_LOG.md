# Run log

Append concise dated run records here. Record only observed evidence and completed work.

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

## 2026-09-22 08:48 Europe/London — gated Solar request integration implemented
- REVENUE: fresh authoritative live Stripe `Home Quote Check` PaymentIntents returned 0 objects with `has_more=false`; genuine revenue remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers.
- Funnel/acquisition: fresh production metrics were unavailable from the current web execution path; latest settled remains 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Missing fresh dimensions remain null.
- Search: no newer authoritative Search Console dataset established; latest available remains 0 clicks / 4 impressions / 0% CTR / average position 8.07.
- PRODUCTION: no deployment made. Direct health/metrics retrieval was unavailable from the current web execution path; prior rendered recovery and production technology-isolation proof remain authoritative.
- PRODUCT: added `lib/solar-battery-request-handler.js` for structured/manual JSON single-quote analysis and two-quote comparison. It fails closed for malformed/missing input and explicitly rejects PDF/image media until that ingestion path is verified.
- ISOLATION: wired the handler into `worker-entry.js` only for explicit Solar/Battery requests when `HQC_SOLAR_ANALYSIS_INTERNAL=1`. The gate is absent in current production, so public Solar isolation behaviour is unchanged; Heat Pump bypasses the new branch.
- TESTS: added request-boundary tests for single quote, two-quote comparison, partial evidence, malformed JSON and unsupported media. Updated Solar CI to run them and to trigger on Worker boundary changes.
- CI: run `35701193912` for commit `e51dc504cb7c59ab76598b90f32002de89140621` registered and was queued at last observation. Capability is implemented but not marked verified.
- ROADMAP: WS2 request integration advanced from not wired to implemented/pending CI. No public CTA and no production config change.
- OPS/LEARNINGS.md unchanged: no authoritative reusable customer/product lesson established.
- NEXT: require CI green, add Worker-level gate/isolation tests, then verify PDF/image ingestion before any public Solar journey; continue qualified Heat Pump acquisition in parallel.

## 2026-09-22 07:50 Europe/London — Solar trust contract fully green behind gate
- REVENUE: fresh authoritative live Stripe `Home Quote Check` PaymentIntents returned 0 objects with `has_more=false`; genuine revenue remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers.
- Funnel/acquisition: no newer qualified technology/source cohort established; latest settled remains 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains 40 → 16 → 5 → 5. Missing dimensions remain null.
- Search: no newer authoritative Search Console dataset established; latest available remains 0 clicks / 4 impressions / 0% CTR / average position 8.07. Missing fresh evidence is null.
- PRODUCTION: no UI or production analysis change made; prior rendered recovery and router-isolation verification remain authoritative.
- DIAGNOSIS: isolated the Solar CI failure to the fixture contract. The partial synthetic quote explicitly said a battery was present but its expected-value mapper discarded that presence because make/model/capacity were unknown, so `battery usable capacity` was not surfaced as a required evidence gap.
- FIX: added explicit `batteryMentioned: true` to the partial fixture and propagated it through the fixture-to-evidence mapper. Unknown battery specification remains unknown; no evidence requirement was weakened.
- TESTS: GitHub Actions run `35696615513` passed executable Solar analysis, extraction, evidence contract, fixture contract and technology-isolation checks. The complete behind-gate trust suite is now green.
- ROADMAP: trust-contract blocker closed. Next boundary is wiring the dedicated Solar service behind the existing non-public request gate and validating complete/partial/malformed/two-quote request behaviour before Financial Assumptions Check or any public Solar CTA.
- OPS/LEARNINGS.md unchanged: this is engineering correctness evidence, not a reusable customer/product learning.

## Earlier runs
Earlier detailed run history remains available in repository history. The current state and durable learnings carry forward the authoritative operating context.