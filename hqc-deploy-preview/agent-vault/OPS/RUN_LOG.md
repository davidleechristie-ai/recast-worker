# Run log

Append concise dated run records here. Record only observed evidence and completed work.

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
- Funnel/acquisition: latest successful scheduled metrics workflow ran at 06:23Z, but no newer parsed authoritative funnel counts were available in this execution context; latest settled counts remain 55 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 durable checkouts. Unavailable fresh counts were not converted to zero.
- CI evidence: commit `6a23a110a0265c42118cfad6676e16cdf108dce2` did run and failed at `Test technology evidence models and Solar/Battery extraction`; preview/deploy/verify were correctly skipped.
- Diagnosis: after the price-wording fix, direct fixture/extractor inspection exposed another representative mismatch: complete Solar+Battery wording uses `9.2 kWh usable capacity`, while the battery regex accepted `usable storage` but not `usable capacity` in that form.
- SOP: followed `SOPS/SHIP_CHANGE.md`; no production deployment attempted and Solar remains non-public.
- COMPLETED: extended the dedicated Solar/Battery extractor to accept both `usable storage` and `usable capacity` wording. Commit `671ac93232eb0caf574989ab2cb30721fb72132c`. No CI run had appeared at evidence cutoff, so no pass is claimed.
- Primary revenue bottleneck: first-customer acquisition/conversion; latest settled start→upload remains 31%.
- Expected revenue impact: increases real-world battery specification coverage and continues converting representative fixture failures into hardened extraction behaviour before customer exposure, shortening the path to a trustworthy second vertical without destabilising Heat Pump.
- Learning: no new durable customer/product lesson; this is implementation hardening under the existing correctness-gate lesson.
- NEXT: verify/fix CI for `671ac93232eb0caf574989ab2cb30721fb72132c`; continue malformed/partial hardening; only after green extraction + Heat Pump regression evidence wire technology-aware routing behind the non-public Worker gate. Continue qualified acquisition/revenue monitoring in parallel.

## 2026-09-21 06:44 Europe/London — Solar CI gate catches representative price-parser defect
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: 0 objects, `has_more=false`; genuine monthly revenue £0 / £1,000; cumulative validation revenue £0 / £100; paying customers 0.
- Funnel/acquisition: no newer authoritative production snapshot available; latest settled remains 55 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 durable checkouts. Latest settled direct cohort remains 39 / 16 / 5 / 5. Unavailable fresh evidence was not converted to zero.
- Technology/search: measured technology mix remains partial (`heat_pump` 2 landings / 1 start); Solar/Battery remains non-public. Fresh public HQC brand/solar searches returned no results; no newer authoritative Search Console dataset was available.
- CI evidence: corrected extraction gate for `6156eb44f8293a3d7e706c9a7e84ecc618f3465f` completed with failure at `Test technology evidence models and Solar/Battery extraction`; preview/deploy/verify were skipped. This is the intended fail-closed behaviour.
- Diagnosis: fixture/extractor inspection found a representative complete Solar+Battery quote says `Price £12,400`, while `priceGbp` extraction only accepted `total` or `installed`. That would return null instead of the evidenced quote price.
- SOP: followed `SOPS/SHIP_CHANGE.md`; no production deployment attempted and Solar remains gated.
- COMPLETED: expanded the Solar/Battery price parser to accept explicit `Price £...` wording. Commit `6a23a110a0265c42118cfad6676e16cdf108dce2`. CI had not appeared at evidence cutoff, so no pass is claimed.
- Primary revenue bottleneck: first-customer acquisition/conversion; latest settled start→upload remains 31%.
- Expected revenue impact: the release gate prevented a real extraction defect from advancing and the fix improves representative quote coverage, reducing false/missing price evidence on the path to a trustworthy second vertical.
- Learning: no new durable customer/product lesson; engineering gate value is demonstrated but existing durable commercial lessons remain unchanged.
- NEXT: verify/fix CI for the parser commit, harden malformed/partial extraction, then wire technology routing + adapter behind the non-public Worker gate only after green correctness/regression evidence. Continue acquisition/revenue refresh in parallel.

## 2026-09-21 05:43 Europe/London — Solar extractor made a real CI release gate
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: 0 objects, `has_more=false`; genuine monthly revenue £0 / £1,000; cumulative validation revenue £0 / £100; paying customers 0.
- Funnel/acquisition: no newer authoritative production snapshot available; latest settled remains 55 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 durable checkouts. Latest settled direct cohort remains 39 / 16 / 5 / 5. Unavailable fresh evidence was not converted to zero.
- Technology/search: measured technology mix remains partial (`heat_pump` 2 landings / 1 start); Solar/Battery remains non-public. No newer authoritative Search Console dataset was available; latest settled remains 0 clicks / 4 impressions through 2026-09-18.
- Diagnosis: inspected the cancelled canary for extraction commit `f37d67704a18685e6c5f163194d52c7bee956660`. Deployment completed, but canary verification was cancelled. More importantly, the Cloudflare bridge only executed `solar-evidence-model.test.js`; the new dedicated extraction tests were not in the CI command. Previous bridge success therefore could not establish extractor correctness.
- SOP: loaded `SOPS/SHIP_CHANGE.md`. No production deployment attempted; Solar remains non-public and extractor correctness has not yet passed the corrected gate.
- COMPLETED: updated `.github/workflows/hqc-cloudflare-bridge.yml` to run `node --test solar-evidence-model.test.js test/solar-battery-extraction.test.mjs` before preview deployment. Commit `6156eb44f8293a3d7e706c9a7e84ecc618f3465f`. Workflow had not appeared at the evidence cutoff, so no pass is claimed.
- Primary revenue bottleneck: first-customer acquisition/conversion; latest settled start→upload remains 31%.
- Expected revenue impact: prevents false Solar readiness and makes technology-specific extraction correctness an enforceable release gate, reducing regression risk and time to a trustworthy second vertical while acquisition continues in parallel.
- Learning: no new durable lesson; this is an engineering-control correction rather than customer/product evidence.
- NEXT: verify/fix the new extraction CI gate; then harden malformed/partial cases and wire technology routing + adapter behind the non-public Worker gate, preserving Heat Pump behaviour. Continue revenue/acquisition refresh in parallel.

## 2026-09-21 04:48 Europe/London — dedicated Solar/Battery extraction slice implemented
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: 0 objects, `has_more=false`; genuine monthly revenue £0 / £1,000; cumulative validation revenue £0 / £100; paying customers 0.
- Funnel/acquisition: no newer authoritative production snapshot available; latest settled remains 55 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 durable checkouts. Latest settled direct cohort remains 39 / 16 / 5 / 5. Unavailable fresh evidence was not converted to zero.
- Technology/search: measured technology mix remains partial (`heat_pump` 2 landings / 1 start); Solar/Battery remains non-public. No newer authoritative Search Console dataset was available; latest settled remains 0 clicks / 4 impressions through 2026-09-18.
- Production/CI: prior fixture-contract commit `16fa62bd70103162e4bedf38bddaa989abd32ce0` Cloudflare bridge completed successfully; its custom-domain canary was cancelled, so no canary claim. New extraction-test CI is pending.
- SOP: loaded `SOPS/SHIP_CHANGE.md`. No production deployment attempted because Solar remains behind the non-public correctness gate and the new adapter has not yet passed CI/regression/preview gates.
- COMPLETED: added `lib/solar-battery-extraction.js`, a dedicated Solar/Battery quote-text extractor that feeds the existing validated evidence contract and preserves missing evidence as null/gaps instead of using Heat Pump logic. Added `test/solar-battery-extraction.test.mjs` covering solar-only, solar+battery, battery-only, partial and comparison fixtures. Commits `021c553781d05ac1c3c49754227089ec05e81558` and `f37d67704a18685e6c5f163194d52c7bee956660`.
- Primary revenue bottleneck: first-customer acquisition/conversion; latest settled start→upload remains 31%.
- Expected revenue impact: creates the first executable technology-specific extraction path required for a trustworthy Solar/Battery vertical, shortening time to a second paid-intent market without destabilising Heat Pump; acquisition remains the immediate first-revenue route.
- Learning: no new durable lesson; implementation progress alone does not establish a reusable commercial/product conclusion.
- NEXT: verify/fix extraction CI, harden partial/malformed cases, then wire technology routing + adapter into Worker behind the non-public gate and run Heat Pump regressions before preview/canary. Continue acquisition evidence refresh in parallel.

## Earlier runs
Earlier detailed run history remains available in repository history. The current state and durable learnings carry forward the authoritative operating context.