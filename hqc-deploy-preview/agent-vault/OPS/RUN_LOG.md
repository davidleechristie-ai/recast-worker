# Run log

Append concise dated run records here. Record only observed evidence and completed work.

## 2026-09-21 11:41 Europe/London — preserve missing numeric Solar evidence as null
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: 0 objects, `has_more=false`; genuine monthly revenue £0 / £1,000; cumulative validation revenue £0 / £100; paying customers 0.
- Funnel/acquisition: no newer parsed authoritative counts were available; latest settled remains 55 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 durable checkouts. Unavailable fresh evidence was not converted to zero.
- Search: authoritative Search Console refreshed through 2026-09-19: 0 clicks, 4 impressions, 0% CTR, average position 8.07 over the last 28 settled days. Search volume remains far too small to displace qualified distribution as the immediate first-customer priority.
- CI evidence: the latest completed full extraction gate on `2873fdeb31e629a94b7735cad1beb4ca863bd71c` ran 9 tests: 7 passed and 2 failed. Both failures were `0 !== null` for missing numeric evidence in the battery-only and partial fixtures; preview/deploy/verify were skipped as intended.
- Diagnosis: `numberOrNull` used `Number(value)` before testing finiteness; JavaScript converts `null` to `0`, so genuinely absent evidence was being normalised into a real zero. This violated HQC's explicit unknown-is-null evidence rule.
- COMPLETED: fixed numeric normalisation so null, undefined and empty strings remain null before numeric conversion. Commit `1ce7fcb3abee7c38d80c001d371b44e43c018d5d`. CI remains pending at evidence cutoff; no pass/readiness or production deployment is claimed.
- Primary revenue bottleneck: first-customer acquisition/conversion; latest settled start→upload remains 31%.
- Expected revenue impact: prevents missing values from being misrepresented as zero in Solar/Battery decision evidence and removes a concrete correctness blocker on the route to a trustworthy second-vertical paid-intent test.
- Learning: no new durable customer/product lesson; this is implementation hardening consistent with the existing technology-readiness lesson.
- NEXT: verify the final CI gate; fix any remaining representative failures, then harden malformed/partial inputs and wire the adapter behind non-public technology routing only after green correctness + Heat Pump regression evidence. Continue acquisition/revenue monitoring in parallel.

## 2026-09-21 10:42 Europe/London — preserve unspecified battery as an evidence gap
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: 0 objects, `has_more=false`; genuine monthly revenue £0 / £1,000; cumulative validation revenue £0 / £100; paying customers 0.
- Funnel/acquisition: no newer parsed authoritative counts were available; latest settled remains 55 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 durable checkouts. Unavailable fresh evidence was not converted to zero.
- Search/health: no newer authoritative Search Console dataset or fresh production-health response was available in this execution context; unavailable remains null.
- CI evidence: `bf8cdf272d133a22763cb196049c16609fe840cc` completed with failure at `Test technology evidence models and Solar/Battery extraction`; preview/deploy/verify were correctly skipped.
- Diagnosis: source + representative fixture inspection exposed a deterministic evidence-model mismatch in `partial_quote_missing_evidence`: the quote says `12 premium panels and battery` but provides no battery specification/capacity. Existing gap logic only emitted `battery usable capacity` when a structured battery object had already been extracted, incorrectly collapsing “battery proposed but unspecified” into “no battery evidence object”.
- SOP/release discipline: followed `SOPS/SHIP_CHANGE.md`; Solar remains non-public and no production release/readiness claim was made.
- COMPLETED: added explicit `batteryMentioned` state to the Solar/Battery evidence contract and extraction adapter, and emit `battery usable capacity` when a battery is mentioned but capacity is absent. Commits `3377c0663bc3434c287ba60c46a5574df444c50f` and `c9f7fae274a024eba1480151ca97b1678dba7c81`. CI had not appeared at evidence cutoff, so no pass is claimed.
- Primary revenue bottleneck: first-customer acquisition/conversion; latest settled start→upload remains 31%.
- Expected revenue impact: prevents a material missing battery specification from disappearing from the consumer evidence gaps, improving trustworthiness of the Solar/Battery Decision Case and shortening the route to a safe second-vertical paid-intent test.
- Learning: no new durable customer/product lesson; this is implementation hardening under the existing technology-readiness correctness gate.
- NEXT: verify CI for `c9f7fae274a024eba1480151ca97b1678dba7c81`; fix remaining representative failures, harden malformed/partial inputs, then wire the adapter behind non-public technology routing only after green correctness + Heat Pump regression evidence. Continue acquisition/revenue monitoring in parallel.

## Earlier runs
Earlier detailed run history remains available in repository history. The current state and durable learnings carry forward the authoritative operating context.
