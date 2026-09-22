# Current state

Updated: 2026-09-22 07:50 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase and £100 cumulative validation revenue.

## Evidence refreshed
- Revenue: fresh authoritative live Stripe `Home Quote Check` PaymentIntents returned **0 objects, `has_more=false`**. Genuine production revenue remains **£0 / £1,000 monthly**, cumulative validation revenue **£0 / £100**, paying customers **0**.
- Durable funnel/acquisition: no newer qualified technology/source cohort was established this run; latest settled evidence remains **56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses**, with 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains **40 → 16 → 5 → 5**. Unavailable dimensions remain null rather than inferred.
- Search: no newer authoritative Search Console dataset was established this run; latest available 28-day summary remains **0 clicks, 4 impressions, 0% CTR, average position 8.07**. Missing fresh search evidence is null.
- Production health: no new customer-facing regression was established. Last rendered production proof remains the successful 390×844 mobile and 1440×1000 desktop recovery verification; production technology isolation remains the last authoritative router proof.

## Commercial diagnosis
The primary commercial bottleneck remains qualified acquisition and conversion to the first genuine £4.99 Decision Pack purchase. Five genuine analyses are insufficient evidence for a pricing or demand conclusion. Search visibility is still extremely small, so acquisition remains binding.

## Current milestone
First genuine £4.99 Decision Pack purchase, then £100 cumulative validation revenue.

## Product strategy / Solar-Battery progress
- The dedicated **non-public executable Solar/Battery analysis module** remains behind the gate at `lib/solar-battery-analysis.js`.
- The previously failing Solar fixture contract was diagnosed as a fixture-state mismatch: the partial quote explicitly mentions a battery while the fixture-to-evidence mapper discarded that mention when make/model/capacity were unknown. This incorrectly suppressed the required `battery usable capacity` gap.
- Fixed the fixture to preserve `batteryMentioned: true` and propagated that state through the fixture contract. No evidence rule was weakened and no unknown value was invented.
- GitHub Actions run `35696615513` then passed executable Solar analysis, extraction, evidence contract, fixture contract and technology-isolation checks. This closes the complete behind-gate trust-suite blocker.
- Solar remains non-public and is not yet wired into the executable production request path. Heat Pump was not changed.
- Next boundary: connect the dedicated Solar analysis service behind the existing non-public technology gate, validate malformed/partial payload handling and single/two-quote request behaviour, then progress Financial Assumptions Check.

## Active workstreams
1. Continue qualified acquisition into the healthy Heat Pump journey and measure genuine analyses → Decision Pack checkout/purchase.
2. Wire the now-green Solar analysis service behind the non-public route without altering Heat Pump; verify end-to-end request behaviour before any public CTA.
3. Then implement Financial Assumptions Check and richer Decision Pack on proven structured findings.
4. Paid Heat Pump boundary remains £4.99; no evidence supports a pricing change.

## Expected revenue impact
Heat Pump can acquire and convert customers now. The fully green Solar analysis trust suite removes a material engineering blocker to testing a second high-intent quote-holder cohort, while preserving the public gate until request-level correctness is proven.

## Next actions
1. Connect the dedicated Solar service behind the existing non-public route and add request-level tests for complete, partial/malformed and two-quote analysis.
2. Verify Heat Pump isolation remains intact and do not deploy UI assets for backend-only work.
3. Continue qualified Heat Pump acquisition toward the first purchase; use source/technology evidence rather than aggregate traffic for decisions.
4. Progress Financial Assumptions Check after Solar extraction/comparison is executable end-to-end.

## Durable learning
No new reusable customer/product learning established. OPS/LEARNINGS.md remains unchanged.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
