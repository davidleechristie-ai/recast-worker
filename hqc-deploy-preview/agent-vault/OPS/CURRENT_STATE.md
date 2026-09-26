# Current state

Updated: 2026-09-26 08:55 Europe/London

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
