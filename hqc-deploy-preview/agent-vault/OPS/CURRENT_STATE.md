# Current state

Updated: 2026-09-28 Europe/London

## 2026-09-28 commercial activation measurement
- Initial production/canary workflows (`36416543633`, `36416543978`) failed their newly added immediate intake verification after deployment while existing Heat Pump, Solar and durable metrics checks passed. Subsequent direct live checks found the new asset on both hosts and an excluded QA intake event returned `{"recorded":false,"test":true}`. The bounded readiness correction passed production release `36416967831` and rendered custom-domain canary `36416967892`. The intake counters are deployed; genuine stage counts will require fresh traffic.
- Latest durable synthetic-excluded commercial snapshot (`hqc-ops/commercial-live.json`, fetched 06:54:32Z): **97 landings → 57 checker starts → 6 uploads → 6 genuine analyses → 0 checkouts**. Start→upload is **6/57 (10.5%)**. This remains the earliest measured constraint; a higher landing count has not yet produced another genuine analysis.
- Live durable growth report refreshed 2026-09-28 12:41 Europe/London confirms 97 landings, 57 starts, 6 uploads, 6 genuine analyses and 0 checkouts. The newly deployed picker-open, file-selected and manual-open counters each read 0 at that initial post-release instant; this is an instrumentation baseline with no subsequent genuine intake sample, not evidence of user rejection.
- Added anonymous intake-stage counters for file-picker opens, file selections and manual-entry opens, segmented by source and technology. The dedicated Cloudflare metrics path stores only those event dimensions; it excludes QA traffic and no filename, file body or homeowner detail is recorded. Existing upload and genuine-analysis counters remain unchanged.
- Local contract and browser-event tests pass. Production observations for the new counters are pending deployment and genuine traffic; do not treat zero immediately after launch as user behaviour or infer a conversion improvement from instrumentation alone.
- Next decision: after a useful sample of genuine checker starts, compare picker-open, file-selected and manual-open counts with uploads to locate the precise abandonment point. Maintain the current £4.99 Heat Pump offer and first-purchase priority while EV stays non-public.

## Latest development update — EV evidence correctness
- 2026-09-27 benchmark expansion: two additional synthetic installer-quote patterns cover multiword charger models, compact kW notation, Type 2 tethered cable/untethered socket wording and excluded PV/smart features. The fixture benchmark fell to 44/50 (88%) before the extractor change and reached 50/50 afterward; local EV suite passed 17/17 including evidence-only comparison. These are synthetic fixtures, not a measured real-world 95% extraction result. EV remains BUILD / NON-PUBLIC pending the remaining MVP gates.
- 2026-09-27 follow-up: EV browser file selection now passed the custom-domain canary (`36301218274`): a text PDF was selected, extracted, analysed by the EV adapter, and rendered on mobile; a later image selection in the same session cleared old extracted evidence and showed the supported-format message. EV CI (`36301117657`), production router release (`36301117668`) and Cloudflare bridge (`36301117720`) succeeded for the upload boundary change. EV remains non-public.
- The first expanded canary (`36301117711`) failed because its test tried to reopen a picker from the results screen. The corrected test starts a new check in the same session and passed; no product fix was required for that test navigation.
- Remaining EV release gates include broader representative quote fixtures/decision correctness, complete comparison and commercial boundary, durable technology telemetry, and a production-host public journey verification before enabling the EV flag. These results do not yet establish real-world extraction accuracy.
- EV Chargepoint + Smart Charging remains BUILD / NON-PUBLIC. The extractor now leaves smart charging, dynamic load management and solar/PV integration unknown when the quote explicitly excludes them; an unrelated mention of existing solar panels is no longer treated as charger integration.
- Local EV test suite passed 13/13, including the new exclusion regression and existing request-gate/isolation cases. The fixture benchmark remains 30/30, but this small synthetic set does not establish real-world extraction quality or satisfy the rendered customer-journey release gate.
- No public EV CTA or production flag was enabled. Revenue, funnel and production metrics were not refreshed in this development session; the figures below are the last recorded snapshot, not current measurements.
- Next EV step: expand representative quote fixtures across included/excluded scope and compare outcomes, then verify actual upload → analysis → result on mobile and desktop canary before considering release.

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase and £100 cumulative validation revenue.

## Evidence refreshed
- Revenue: authoritative live Home Quote Check Stripe PaymentIntents refreshed 2026-09-26; `data=[]`, `has_more=false`. Genuine revenue remains **£0 / £1,000 monthly, £0 / £100 validation, 0 paying customers**.
- Durable funnel/acquisition: fresh synthetic-excluded Cloudflare snapshot fetched 2026-09-24 15:16:11Z is **82 landings → 56 checker starts/CTA → 6 uploads → 6 genuine analyses**, 5 extended genuine analyses → **1 multi-quote analysis** → 5 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct produced all 6 genuine analyses. Start→upload remains **6/56 (11%)**. Landings increased to 83 while starts/uploads/analyses stayed flat, reinforcing the current start→upload constraint without establishing a new reusable lesson.
- Technology evidence: Heat Pump records 30 landings, 41 CTA events, 1 upload, 1 genuine analysis, 1 multi-quote analysis, 1 Decision Case and 0 checkouts. The unsegmented remainder remains unknown; no qualified Solar production cohort exists while the public gate is closed.
- Search: current refresh unavailable because the connected GSC Wizard subscription is inactive; latest vault evidence remains 0 clicks / 5 impressions, but current position is **null pending authoritative refresh** rather than carrying forward the disputed 7.06 value.
- Production health: **GREEN** from fresh production metrics workflows: HQC commercial metrics run `36227539921` and HQC North Star metrics snapshot `36227715656` both completed successfully on 2026-09-26. Latest durable production metrics endpoint was read successfully and persisted by the workflow.

## Commercial diagnosis
The earliest measured revenue constraint remains checker-start/CTA → quote submission at **11%**. Six genuine analyses remain too few to conclude that £4.99 pricing or checkout demand is the problem. Organic-labelled cohorts have not yet produced a genuine analysis. The latest extra landing without a start is not sufficient evidence to add a new landing-page experiment alongside the active upload-activation hypothesis.

## Current milestone
First genuine £4.99 Decision Pack purchase, then £100 cumulative validation revenue.

## Solar/Battery progress
- Private Solar text-PDF ingestion is now end-to-end verified on the isolated custom-domain canary: real browser file selection → PDF.js text extraction with provenance → gated Solar analysis → Solar-specific evidence/gaps/questions render. Run `36060001899` green. Image-only/photo OCR remains deliberately fail-closed.
- Canary Worker is now isolated as `hqc-custom-domain-canary`, preventing the generic preview deployment from overwriting its internal Solar gate. Vault-only commits are excluded from both HQC preview deployment workflows to avoid unnecessary deploy churn.

- Custom-domain canary now executes `worker-entry.js` with the internal Solar gate enabled only on canary. Run `36057638281` is fully green, including live extracted-media Solar analysis, raw-media fail-closed isolation, and rendered browser regression checks.

- Technology-aware Decision Pack telemetry CI remains verified green (`35850406399`).
- Gated Solar/Battery routing, analysis/comparison, evidence preservation, installer questions and representative extracted PDF/screenshot/photo envelopes remain CI-verified behind the non-public gate.
- Private rendered Solar preview + default Heat Pump isolation has an unambiguous workflow-level green custom-domain canary (`36007880323`).
- Customer-ingestion boundary remains: browser intake supplies media to the existing journey, while the private Solar handler accepts JSON `quoteText` / provenance-bearing `extractedMedia`. The next safe product implementation remains trusted extraction-output → JSON `extractedMedia` → Solar handler → rendered results, never Solar fallback to Heat Pump.
- Solar Decision Pack content remains Heat-Pump-specific and gated.

## Renewable release policy
Each new home renewable/low-carbon technology now ships independently as soon as it passes the documented Renewable Vertical MVP Production Benchmark: explicit isolation, technology-specific evidence model, ≥95% required-field fixture extraction when explicitly present with zero fabricated material values, evidence-backed decision correctness, UK guardrails, complete customer journey, correct commercial boundary, durable technology telemetry, regression coverage, rendered mobile/desktop canary verification, and post-deploy production-host verification. P0/P1 correctness/safety defects block release. Per-technology kill switches are preferred. Solar PV + Battery is first in this iterative queue because it is closest to MVP.

## Active workstreams
1. **P0 commercial activation:** reduce Heat Pump checker-start → upload friction; measured boundary remains 11%.
2. Continue qualified Heat Pump acquisition while measuring upload → genuine analysis → checkout → purchase.
3. Take Solar PV + Battery through the remaining MVP benchmark gates and release to production immediately when all are green; then progress the next ranked renewable vertical.
4. Verify technology propagation into durable funnel/checkout events end-to-end.
5. Begin Financial Assumptions Check only after trustworthy Solar customer ingestion is executable end-to-end.

## Expected revenue impact
No genuine-revenue advance this run. GitHub repository authorization was repaired and authoritative Stripe + durable production evidence refreshed. The direct first-purchase lever remains Heat Pump start→upload activation; private Solar remains non-public.

## Next actions
1. Continue the measured Heat Pump upload-activation experiment without overlapping conversion hypotheses.
2. Implement/test the private Solar extracted-media JSON bridge without enabling public Solar or allowing Heat Pump fallback.
3. Require end-to-end rendered private upload → Solar analysis → results verification before any public CTA.
4. Verify technology propagation into durable funnel/checkout events end-to-end.
5. Keep £4.99 pricing stable until materially more genuine analyses reach the paid boundary.

## Durable learning
No OPS/LEARNINGS.md update this run. The new evidence does not establish, overturn or materially refine a reusable lesson; GSC is unavailable and therefore treated as null for the current refresh.

## Guardrails
GitHub + Cloudflare only; never AppDeploy. UI production changes require rendered verification. Preserve independence/privacy/evidence guardrails.

## 2026-09-26 production milestone — Solar PV + Battery LIVE MVP
Production release run 36240154137 passed on the real homequotecheck.co.uk hostname. Heat Pump/default health returned HTTP 200, Solar PV + Battery production analysis returned HTTP 200 and the release assertion verified the expected 5.1 kWp evidence, and durable metrics returned HTTP 200. The renewable-generic rendered canary had already passed in run 36231458276. Solar therefore clears the production-host release gate and is now LIVE MVP for the supported text-PDF journey; unsupported image-only/photo inputs remain fail-closed.

Commercial priority remains first genuine purchase. Do not change the £4.99 Heat Pump price without willingness-to-pay evidence. Next Purchase Adviser priority is Financial Assumptions Check for Solar, using explicit assumptions/ranges and authoritative UK methodology, followed by a technology-correct richer Decision Pack.

## 2026-09-28 EV private scope/comparison increment
EV quote evidence now models explicit cabling, consumer-unit and earthing inclusion, exclusion or survey condition with original quote text; conflicting sentence-level claims remain unknown. The private two-quote preview exposes each dimension side by side. EV CI passed (`36417811227`); rendered custom-domain canary `36417811250` and dormant production release `36417988515` passed. The real hostname served the EV asset and kept the EV route closed at 409. Keep EV public access closed pending representative extraction, commercial boundary, durable funnel/checkout and full production-host journey gates.

## 2026-09-28 renewable commercial boundary
The existing £4.99 Decision Pack still contains Heat Pump-specific advice. PR #43 suppresses it for Solar/Battery and the private EV journey and makes explicit renewable checkout requests fail closed before Stripe; Heat Pump checkout remains available. Custom-domain canary `36423276671` and production-host release `36423276665` passed, including explicit renewable checkout 409 before Stripe. Solar free quote analysis remains live, EV remains non-public. A technology-correct paid pack and durable funnel attribution remain open renewable MVP gates.

## 2026-09-28 EV durable completion increment
PR #45 adds anonymous server-side completed EV text-PDF analysis and comparison counters by technology/source. QA, failed and raw-text-only requests are excluded; they are not treated as genuine customer analyses. Local regressions and EV/Solar CI passed; custom-domain canary `36445629648` and production-host release `36445629626` passed. EV remains non-public. Representative real-quote accuracy and EV-specific paid output remain the release blockers.
