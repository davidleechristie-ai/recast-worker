# Run log

Append concise dated run records here. Record only observed evidence and completed work.

## 2026-09-21 09:41 Europe/London — Solar annual-generation parser hardening
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: 0 objects, `has_more=false`; genuine monthly revenue £0 / £1,000; cumulative validation revenue £0 / £100; paying customers 0.
- Funnel/acquisition: no newer parsed authoritative counts were available; latest settled remains 55 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 durable checkouts. Unavailable fresh evidence was not converted to zero.
- Search/health: fresh public HQC site search returned no result; no newer authoritative Search Console dataset was available. Direct production health endpoints were inaccessible from this execution context, so fresh health is null rather than assumed.
- CI evidence: `1d44ad899bf5f7ef74446290f7546fc13ed0e358` completed with failure at `Test technology evidence models and Solar/Battery extraction`; preview/deploy/verify were skipped. The parallel custom-domain canary reached successful domain verification but was cancelled during mobile quote-intake verification, so no canary pass is claimed.
- Diagnosis: fixture/extractor inspection found another representative mismatch: `solar_only_complete` says `Estimated annual generation 4,100 kWh`, while the extractor accepted `annual generation` but not the leading `Estimated` wording.
- SOP/release discipline: followed `SOPS/SHIP_CHANGE.md`; Solar remains non-public and no production release/readiness claim was made.
- COMPLETED: expanded annual-generation extraction to accept `Estimated annual generation ...` while retaining existing annual-PV-generation and generic generation forms. Commit `bf8cdf272d133a22763cb196049c16609fe840cc`. CI result pending at evidence cutoff.
- Primary revenue bottleneck: first-customer acquisition/conversion; latest settled start→upload remains 31%.
- Expected revenue impact: fixes a concrete representative Solar quote extraction gap before public exposure and shortens the path to a trustworthy second-vertical paid-intent test without destabilising Heat Pump.
- Learning: no new durable customer/product lesson; this remains implementation hardening under the existing technology-readiness correctness gate.
- NEXT: verify CI for `bf8cdf272d133a22763cb196049c16609fe840cc`; fix remaining representative failures, harden malformed/partial inputs, then wire the adapter behind non-public technology routing only after green correctness + Heat Pump regression evidence. Continue acquisition/revenue monitoring in parallel.

## 2026-09-21 08:43 Europe/London — corrected Solar battery wording parser
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: 0 objects, `has_more=false`; genuine monthly revenue £0 / £1,000; cumulative validation revenue £0 / £100; paying customers 0.
- Funnel/acquisition: no newer parsed authoritative funnel counts were available; latest settled remains 55 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 durable checkouts. Unavailable fresh evidence was not converted to zero.
- CI evidence: commit `671ac93232eb0caf574989ab2cb30721fb72132c` did trigger canary activity, but the custom-domain canary was cancelled during mobile quote-intake verification. Direct source/fixture inspection showed the previous battery regex change still did not match the representative phrase `StoreBox SB10 battery, 9.2 kWh usable capacity`; it had changed the wrong side of the numeric value.
- SOP/release discipline: Solar remains non-public; no production release or readiness claim was made.
- COMPLETED: corrected the dedicated Solar/Battery extractor to accept `battery, 9.2 kWh usable capacity` while retaining the battery-only `usable storage 6.8 kWh` form. Commit `1d44ad899bf5f7ef74446290f7546fc13ed0e358`. No CI run had appeared at evidence cutoff, so no pass is claimed.
- Primary revenue bottleneck: first-customer acquisition/conversion; latest settled start→upload remains 31%.
- Expected revenue impact: closes a representative battery-capacity extraction defect before public exposure and shortens the route to a trustworthy Solar/Battery paid-intent test without destabilising Heat Pump.
- Learning: no new durable customer/product lesson; this remains parser hardening under the existing technology-readiness correctness gate.
- NEXT: verify the corrected extraction CI; fix any remaining representative failures, harden malformed/partial inputs, then wire the adapter behind non-public technology routing only after green correctness + Heat Pump regression evidence. Continue acquisition/revenue monitoring in parallel.

## 2026-09-21 07:44 Europe/London — second representative Solar parser gap fixed
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: 0 objects, `has_more=false`; genuine monthly revenue £0 / £1,000; cumulative validation revenue £0 / £100; paying customers 0.
- Durable evidence and prior run history continue below unchanged; see Git history for the complete chronological log.
