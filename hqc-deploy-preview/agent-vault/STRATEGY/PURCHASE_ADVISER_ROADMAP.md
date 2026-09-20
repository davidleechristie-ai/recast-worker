# HQC Independent Purchase Adviser — Strategy & Delivery Plan

Updated: 2026-09-20

## Objective
Evolve Home Quote Check from a document checker into an independent **pre-commitment home-energy purchase adviser**, while preserving the clear acquisition proposition:

> **Already have a quote? Independently check and compare it before you commit.**

The uploaded installer quote remains the acquisition/input wedge. The paid value expands toward answering the homeowner's real decision: **Is this proposal appropriate, are its assumptions credible, what is uncertain, what should I ask, and what should I do before committing thousands of pounds?**

This plan runs in parallel with first-customer acquisition. Until first genuine revenue, acquisition/conversion remains commercially binding; roadmap work must not destabilise the live Heat Pump path or confound active conversion measurement.

## Product architecture
One reusable decision platform with technology-specific evidence adapters.

Customer journey:
1. Select technology.
2. Upload one or more genuine installer quotes or enter details manually.
3. Quote Check — understand equipment, scope, price, assumptions and omissions.
4. Home/System Fit Check — compare the proposed system with evidence available about the property/usage without claiming survey/design certification.
5. Financial Assumptions Check — reconstruct quoted generation/consumption/savings assumptions and expose sensitivity/uncertainty.
6. Installer/Proposal Evidence Check — verify only evidence that can be independently sourced or is explicitly documented; never create a subjective installer score.
7. Compare — normalise multiple proposals on the same dimensions.
8. Questions to Ask — generate proposal-specific questions from evidence gaps/differences.
9. Pre-Commitment Decision Pack — paid, shareable summary of established facts, assumptions, uncertainties, material differences and next questions.
10. Later validation: Post-installation Check — compare contracted versus supplied/documented system only after pre-commitment demand is proven.

## Technology rollout
### Vertical 1 — Heat Pump
Status: LIVE.
Protect the existing working path. Incrementally migrate reusable decision primitives without destabilising production.

### Vertical 2 — Solar PV + Battery
Status: BUILD / NON-PUBLIC.
Battery-only reuses this adapter where practical.

Required evidence extraction where present:
- panel make/model/count and array kWp
- inverter make/model/rating
- battery make/model and usable capacity
- annual generation estimate and stated estimation basis
- self-consumption/export assumptions
- shading assumptions where stated
- scaffolding/roof works
- DNO/G98/G99/G100 wording
- equipment/workmanship warranties
- MCS claims/status wording
- scope/exclusions
- price/payment differences

Never represent automated output as electrical/design certification, structural/roof suitability, DNO approval, MCS certification, grant eligibility, guaranteed generation or guaranteed savings.

## Workstreams and detailed steps

### WS1 — Shared evidence schema and analysis boundary
Status: IN PROGRESS.
Revenue rationale: reduces cost/time to add Solar/Battery and future validated verticals while making the paid Decision Pack more defensible.

- [ ] Define technology-neutral Quote, EvidenceItem, Claim, Assumption, Gap, ComparisonDimension, Question and DecisionFinding objects.
- [ ] Define provenance for every finding: quote text, homeowner input, authoritative/public source, deterministic calculation, or unknown.
- [ ] Add confidence/evidence-state semantics without presenting opaque consumer-facing scores.
- [ ] Separate extraction from interpretation and deterministic calculations.
- [ ] Ensure unknown/missing remains unknown; never infer zero.
- [ ] Map current Heat Pump fields into the shared schema without changing live output.
- [ ] Implement Solar/Battery adapter against the shared schema.
- [ ] Add fixture-based tests for both technologies.

Exit gate: same infrastructure can represent Heat Pump and Solar/Battery evidence without technology leakage.

### WS2 — Remove Solar dependency on heat-pump upstream
Status: IN PROGRESS — routing contract implemented and unit-tested in source; Worker wiring/CI/preview still required.
Revenue rationale: this is the current hard blocker to acquiring/monetising Solar quote holders.

Current confirmed blocker: production non-payment analysis traffic is still proxied to the heat-pump-specific service.

- [x] Trace current production analysis boundary sufficiently to confirm the heat-pump-only upstream dependency.
- [x] Implement explicit technology-routing contract in `lib/technology-routing.js`: legacy Heat Pump route is explicit; unsupported technology is rejected; Solar/Battery and battery-only cannot fall through to Heat Pump and remain gated unless a dedicated adapter base is configured.
- [x] Add source-level routing tests covering Heat Pump compatibility, unknown technology rejection, Solar/Battery isolation and shared Solar/Battery adapter configuration.
- [ ] Wire technology-aware routing into `worker.js` behind the non-public gate.
- [ ] Preserve Heat Pump production behaviour and regression-test the proxy contract.
- [ ] Build Solar/Battery extraction path independent of heat-pump prompts/logic.
- [ ] Validate PDFs, screenshots/photos and manual-entry payloads.
- [ ] Add malformed/partial quote handling.
- [x] Add battery-only synthetic fixture alongside solar-only, solar+battery, partial and comparison cases in `test/fixtures/solar-battery-cases.json`.
- [ ] Ensure technology is propagated into durable anonymous funnel and checkout events end-to-end.

Exit gate: representative Solar/Battery fixtures produce technology-specific structured evidence without calling heat-pump analysis logic.

### WS3 — Solar/Battery Quote Check MVP
Status: IN PROGRESS (fixture corpus started; still depends on WS2 Worker routing + adapter boundary).
Revenue rationale: creates the minimum trustworthy second vertical capable of producing a genuine paid-intent test.

- [x] Build initial representative synthetic fixtures: solar-only, solar+battery, battery-only, partial quote, two competing quotes. Fixtures deliberately use fictional products/values and are not customer/market evidence.
- [ ] Bind fixtures to extraction tests once the dedicated adapter exists.
- [ ] Extract required equipment/scope/assumption fields.
- [ ] Detect material missing evidence rather than hallucinating values.
- [ ] Produce plain-English findings tied to evidence.
- [ ] Compare two quotes dimension-by-dimension.
- [ ] Generate quote-specific installer questions from gaps/differences.
- [ ] Reuse Decision Case/share infrastructure.
- [ ] Reuse checkout infrastructure with technology dimension.
- [ ] Automated correctness tests.
- [ ] Rendered mobile + desktop verification before public CTA.
- [ ] Preview/canary verification under SHIP_CHANGE.
- [ ] Public exposure only after all gates pass.

Exit gate: one genuine-style Solar/Battery quote and a two-quote comparison complete the journey through a trustworthy Decision Case and checkout.

### WS4 — Home/System Fit Check
Status: NOT STARTED.
Revenue rationale: moves value from “what does my PDF say?” toward “does this proposal make sense for me?”, increasing differentiation from generic AI/PDF tools.

Phase A — low-dependency evidence:
- [ ] Ask only for minimum information needed to materially improve the decision.
- [ ] Solar: household annual electricity use where known, occupancy/usage pattern, EV/heat-pump presence, known roof orientation/shading information.
- [ ] Heat Pump: reuse existing documented heat-loss/flow-temperature/emitter evidence before requesting more data.
- [ ] Compare proposal sizing/assumptions with available evidence using ranges and caveats.
- [ ] Show what cannot be determined without survey/design evidence.

Phase B — external/property technology research:
- [ ] Evaluate UK address/property/roof datasets and licensing/privacy constraints.
- [ ] Evaluate satellite/aerial imagery sources and whether roof geometry/orientation can be derived reliably and commercially.
- [ ] Evaluate deterministic solar-generation modelling options.
- [ ] Prototype only if evidence quality materially improves decisions and unit economics remain viable.
- [ ] Never infer structural suitability from imagery.

Exit gate: fit findings clearly separate observed evidence, modelled range and unresolved survey/design questions.

### WS5 — Financial Assumptions Check
Status: NOT STARTED; begins after trustworthy Solar quote extraction.
Revenue rationale: likely highest-value paid differentiator because installer ROI/savings claims directly influence purchase decisions.

- [ ] Parse installer-stated annual generation, consumption, self-consumption, export, tariff and savings/payback assumptions.
- [ ] Build deterministic calculation layer independent of generative narrative.
- [ ] Solar: generation → self-consumption → avoided import → export → annual benefit.
- [ ] Battery: usable capacity/cycling assumptions → shifted import/export/tariff benefit, with explicit limitations.
- [ ] Heat Pump: identify suitable deterministic assumptions that can be validated without pretending to perform a full design.
- [ ] Research authoritative current methodology/guidance before implementation.
- [ ] Support homeowner tariff/consumption inputs where they materially change result.
- [ ] Present ranges/sensitivity, not false precision.
- [ ] Reconcile installer claim versus HQC evidence-based calculation and explain material assumption differences.
- [ ] Add calculation fixtures and regression tests.

Exit gate: HQC can explain why its reconstructed range differs from an installer claim, with every material input visible.

### WS6 — Installer & Proposal Evidence Check
Status: NOT STARTED.
Revenue rationale: addresses trust/risk at the point of commitment without turning HQC into lead generation.

- [ ] Research authoritative sources/APIs and terms for MCS/company/consumer-code/warranty evidence.
- [ ] Verify only facts available from authoritative/public evidence.
- [ ] Distinguish “not found/unknown” from “not registered”.
- [ ] Check quote wording for deposit/payment schedule, warranties, exclusions and pressure/time-limited claims.
- [ ] Cross-check quoted equipment and documented warranties where reliable product data exists.
- [ ] Do not create a subjective installer score/ranking.
- [ ] Do not recommend an installer for commission.
- [ ] Record source/date for externally verified evidence.

Exit gate: every installer/proposal statement is sourceable, dated and neutrally worded.

### WS7 — Pre-Commitment Decision Pack
Status: IN PROGRESS via existing £4.99 Heat Pump Decision Pack; richer cross-technology pack deferred until structured findings are proven.
Revenue rationale: convert the paid product from PDF parsing into decision support worth paying for.

- [ ] Define free versus paid boundary from genuine observed intent.
- [ ] Free: enough Quote Check value to demonstrate trust and reveal meaningful gaps.
- [ ] Paid pack candidate sections: proposal summary; what is evidenced; material assumptions; system/financial checks; quote comparison; unresolved risks; personalised installer questions; pre-signing checklist.
- [x] Keep current £4.99 Heat Pump boundary stable until genuine willingness-to-pay evidence exists.
- [ ] Test Solar/Battery price only after trustworthy end-to-end usage exists.
- [ ] Make pack shareable without exposing homeowner PII.
- [x] Track checkout-created with technology dimension durably; paid/refunded evidence remains authoritative via Stripe and must not be inferred.

Exit gate: pack contains meaningful decision value not obtainable merely by restating uploaded text.

### WS8 — Decision assistant / conversational layer
Status: DEFERRED.
Revenue rationale: lets consumers interrogate their own evidence, but should not be built before the structured evidence layer is reliable.

- [ ] Add only after structured evidence layer is reliable.
- [ ] Ground responses exclusively in case evidence, deterministic calculations and approved current sources.
- [ ] Provide provenance links/labels for claims.
- [ ] Refuse/qualify design-certification questions outside HQC evidence.
- [ ] Suggested questions derived from actual quote differences/gaps.
- [ ] Measure whether assistant use predicts comparison/checkout rather than shipping as novelty.

Exit gate: answers are grounded, reproducible and do not bypass product guardrails.

### WS9 — Post-installation Check (deferred validation)
Status: DEFERRED.
Revenue rationale: potential repeat/referral product, but does not outrank first purchase.

- [ ] Do not build before pre-commitment demand/revenue evidence.
- [ ] Research consumer job: contracted versus installed equipment/scope; required handover documentation; unresolved snags.
- [ ] Validate willingness to use/pay via existing customers first.

## External technology research backlog
Research before integration; prefer APIs/data with stable UK coverage, clear licensing and low marginal cost.
- MCS authoritative guidance/records and technology standards.
- Energy Saving Trust calculators/methodology/guidance.
- GOV.UK/Ofgem DNO, SEG and consumer guidance.
- DNO/ENA connection rules/data where relevant.
- Product specification datasets for panels/inverters/batteries/heat pumps.
- Electricity tariff/import/export data.
- Solar irradiance/generation modelling.
- Address/property/roof geometry and aerial/satellite imagery.
- Company/installer public evidence.
- Document AI/OCR/vision models for PDFs/photos.
- Deterministic calculation engine separated from LLM interpretation.

For each candidate record: decision value unlocked, evidence quality, API/licence, cost per case, privacy/PII effect, failure mode, fallback and expected revenue impact.

## Measurement
Anonymous aggregate events segmented by technology/source where available:
landing → technology selected → checker start → upload/manual entry → genuine analysis → second quote → comparison → decision case → questions viewed/used → share → checkout created → paid → refunded → referral/repeat.

Additional product-learning events:
- financial_check_viewed
- fit_check_viewed
- material_gap_found
- installer_questions_generated
- decision_pack_previewed
- decision_assistant_used

Exclude QA/demo/bot/headless/smoke/test traffic. Missing evidence is null, not zero.

## Delivery order
P0: Continue first-customer acquisition and revenue monitoring in parallel.
P0: WS2 technology-aware analysis boundary + Solar/Battery extraction.
P0: WS3 Solar/Battery Quote Check MVP through comparison/Decision Case.
P1: WS1 shared evidence schema where required to support P0 safely.
P1: WS5 Financial Assumptions Check prototype for Solar/Battery.
P1: WS7 richer Decision Pack using proven structured findings.
P2: WS4 Home/System Fit Check, beginning with homeowner-supplied low-PII inputs.
P2: WS6 Installer/Proposal Evidence Check.
P3: WS8 grounded conversational decision assistant.
Deferred: WS9 post-installation product until demand evidence.

## Release gates
Every material release follows Measure → Diagnose → Research → Prioritise → Build → Test → Commit → Preview/Canary → Verify → Production → Measure and SOPS/SHIP_CHANGE.md.

Solar/Battery public gate requires:
- technology-specific extraction and evidence logic
- no heat-pump analysis leakage
- representative fixture/regression tests
- single and multi-quote comparison correctness
- guardrail language verified
- anonymous technology instrumentation verified
- checkout path verified
- rendered mobile + desktop verification
- preview + canary health passed

## Progress tracking
Status vocabulary: NOT STARTED / IN PROGRESS / BLOCKED / VERIFIED / LIVE.

At every autonomous run:
1. Refresh authoritative revenue/acquisition/funnel/search/health evidence first.
2. Update this plan only for material progress or changed evidence.
3. Progress at least one independent roadmap item when acquisition evidence has not matured.
4. Record completed implementation and verification in OPS/RUN_LOG.md.
5. Keep OPS/CURRENT_STATE.md focused on current commercial truth and immediate next actions.
6. Never mark a capability LIVE from code existence alone; require its release gate.
