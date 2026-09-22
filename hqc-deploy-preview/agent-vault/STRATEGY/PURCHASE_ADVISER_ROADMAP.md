# HQC Independent Purchase Adviser — Strategy & Delivery Plan

Updated: 2026-09-22

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

Required evidence extraction where present: panel make/model/count and array kWp; inverter make/model/rating; battery make/model and usable capacity; annual generation estimate and stated estimation basis; self-consumption/export assumptions; shading assumptions where stated; scaffolding/roof works; DNO/G98/G99/G100 wording; equipment/workmanship warranties; MCS claims/status wording; scope/exclusions; price/payment differences.

Never represent automated output as electrical/design certification, structural/roof suitability, DNO approval, MCS certification, grant eligibility, guaranteed generation or guaranteed savings.

## Workstreams and detailed steps

### WS1 — Shared evidence schema and analysis boundary
Status: IN PROGRESS.
Revenue rationale: reduces cost/time to add Solar/Battery and future validated verticals while making the paid Decision Pack more defensible.

- [ ] Define technology-neutral Quote, EvidenceItem, Claim, Assumption, Gap, ComparisonDimension, Question and DecisionFinding objects.
- [ ] Define provenance for every finding: quote text, homeowner input, authoritative/public source, deterministic calculation, or unknown.
- [ ] Add confidence/evidence-state semantics without presenting opaque consumer-facing scores.
- [ ] Separate extraction from interpretation and deterministic calculations.
- [x] Ensure unknown/missing remains unknown; never infer zero in the Solar evidence contract/extractor.
- [ ] Map current Heat Pump fields into the shared schema without changing live output.
- [x] Implement initial Solar/Battery structured evidence adapter/extractor against the technology-specific schema.
- [x] Add representative fixture-based Solar/Battery extraction tests.

Exit gate: same infrastructure can represent Heat Pump and Solar/Battery evidence without technology leakage.

### WS2 — Remove Solar dependency on heat-pump upstream
Status: VERIFIED ROUTING BOUNDARY / DEDICATED SOLAR SERVICE STILL IN PROGRESS.
Revenue rationale: this is the current hard blocker to acquiring/monetising Solar quote holders.

- [x] Trace current production analysis boundary sufficiently to confirm the heat-pump-only upstream dependency.
- [x] Implement explicit technology-routing contract in `lib/technology-routing.js`: legacy Heat Pump route is explicit; unsupported technology is rejected; Solar/Battery and battery-only cannot fall through to Heat Pump and remain gated unless a dedicated adapter base is configured.
- [x] Add source-level routing tests covering Heat Pump compatibility, unknown technology rejection, Solar/Battery isolation and shared Solar/Battery adapter configuration.
- [x] Implement request-level routing boundary in `lib/analysis-request-routing.js` without consuming PDF/form-data bodies; technology can be supplied by `x-hqc-technology` or query hint, with legacy Heat Pump default preserved.
- [x] Add request-level isolation tests proving explicit Solar/Battery cannot silently fall through to Heat Pump and a configured adapter is the only Solar route.
- [x] Wire request-level routing into production `worker-entry.js` behind the non-public gate.
- [x] Preserve Heat Pump production behaviour and verify the proxy contract through the asset-preserving production-router workflow.
- [ ] Build/wire the complete Solar/Battery analysis service independent of heat-pump prompts/logic.
- [ ] Validate PDFs, screenshots/photos and manual-entry payloads end-to-end.
- [ ] Add malformed/partial quote handling at the executable service boundary.
- [x] Add battery-only synthetic fixture alongside solar-only, solar+battery, partial and comparison cases in `test/fixtures/solar-battery-cases.json`.
- [ ] Ensure technology is propagated into durable anonymous funnel and checkout events end-to-end.

Production evidence: workflow run `35646864766`, attempt 2, completed successfully on 2026-09-22; tests, router-only deployment, Heat Pump compatibility, explicit Solar isolation and durable metrics verification all passed without deploying frontend assets.

Exit gate: representative Solar/Battery fixtures produce technology-specific structured evidence without calling heat-pump analysis logic.

### WS3 — Solar/Battery Quote Check MVP
Status: IN PROGRESS (fixture corpus + extraction/evidence adapter + verified routing boundary exist; complete executable Solar analysis service still required).
Revenue rationale: creates the minimum trustworthy second vertical capable of producing a genuine paid-intent test.

- [x] Build initial representative synthetic fixtures: solar-only, solar+battery, battery-only, partial quote, two competing quotes. Fixtures deliberately use fictional products/values and are not customer/market evidence.
- [x] Bind representative text fixtures to the dedicated extraction tests.
- [x] Extract initial equipment/price/generation/DNO/warranty/scope evidence fields from representative text fixtures.
- [x] Detect material missing evidence rather than hallucinating zero/default values in the structured evidence contract.
- [ ] Produce plain-English findings tied to evidence.
- [ ] Compare two quotes dimension-by-dimension in the executable customer analysis path.
- [ ] Generate quote-specific installer questions from gaps/differences.
- [ ] Reuse Decision Case/share infrastructure.
- [ ] Reuse checkout infrastructure with technology dimension.
- [ ] Automated end-to-end correctness tests.
- [ ] Rendered mobile + desktop verification before public CTA.
- [ ] Preview/canary verification under SHIP_CHANGE.
- [ ] Public exposure only after all gates pass.

Exit gate: one genuine-style Solar/Battery quote and a two-quote comparison complete the journey through a trustworthy Decision Case and checkout.

### WS4 — Home/System Fit Check
Status: NOT STARTED.
Revenue rationale: moves value from “what does my PDF say?” toward “does this proposal make sense for me?”, increasing differentiation from generic AI/PDF tools.

Phase A: minimum homeowner information that materially improves the decision; compare proposal sizing/assumptions with available evidence using ranges/caveats; clearly show what cannot be determined without survey/design evidence. Phase B: evaluate UK address/property/roof datasets, imagery, deterministic generation modelling, licensing/privacy and unit economics; never infer structural suitability from imagery.

### WS5 — Financial Assumptions Check
Status: NOT STARTED; begins after trustworthy Solar quote extraction is executable end-to-end.
Revenue rationale: likely highest-value paid differentiator because installer ROI/savings claims directly influence purchase decisions.

- [ ] Parse installer-stated annual generation, consumption, self-consumption, export, tariff and savings/payback assumptions.
- [ ] Build deterministic calculation layer independent of generative narrative.
- [ ] Solar: generation → self-consumption → avoided import → export → annual benefit.
- [ ] Battery: usable capacity/cycling assumptions → shifted import/export/tariff benefit, with explicit limitations.
- [ ] Research authoritative current methodology/guidance before implementation.
- [ ] Support homeowner tariff/consumption inputs where they materially change result.
- [ ] Present ranges/sensitivity, not false precision.
- [ ] Reconcile installer claim versus HQC evidence-based calculation and explain material assumption differences.
- [ ] Add calculation fixtures and regression tests.

Exit gate: HQC can explain why its reconstructed range differs from an installer claim, with every material input visible.

### WS6 — Installer & Proposal Evidence Check
Status: NOT STARTED.
Revenue rationale: addresses trust/risk at the point of commitment without turning HQC into lead generation.

Research authoritative sources/APIs and terms for MCS/company/consumer-code/warranty evidence; verify only sourceable facts; distinguish unknown from not registered; inspect quote payment/warranty/exclusion/pressure wording; never create a subjective installer score or commission-influenced recommendation.

### WS7 — Pre-Commitment Decision Pack
Status: IN PROGRESS via existing £4.99 Heat Pump Decision Pack; richer cross-technology pack deferred until structured findings are proven.
Revenue rationale: convert the paid product from PDF parsing into decision support worth paying for.

- [ ] Define free versus paid boundary from genuine observed intent.
- [ ] Paid candidate: proposal summary, evidenced facts, material assumptions, system/financial checks, comparison, unresolved risks, personalised questions, pre-signing checklist.
- [x] Keep current £4.99 Heat Pump boundary stable until genuine willingness-to-pay evidence exists.
- [ ] Test Solar/Battery price only after trustworthy end-to-end usage exists.
- [ ] Make pack shareable without exposing homeowner PII.
- [x] Track checkout-created with technology dimension durably; paid/refunded evidence remains authoritative via Stripe and must not be inferred.

### WS8 — Decision assistant / conversational layer
Status: DEFERRED until structured evidence is reliable.

### WS9 — Post-installation Check
Status: DEFERRED until pre-commitment demand/revenue evidence exists.

## External technology research backlog
Prefer stable UK coverage, clear licensing and low marginal cost: MCS standards/records; Energy Saving Trust methodology; GOV.UK/Ofgem/DNO/SEG guidance; ENA connection data; product specifications; import/export tariffs; solar irradiance/generation modelling; address/property/roof data and imagery; company/installer evidence; document AI/OCR/vision; deterministic calculation engine separated from LLM interpretation.

For each candidate record: decision value unlocked, evidence quality, API/licence, cost per case, privacy/PII effect, failure mode, fallback and expected revenue impact.

## Measurement
Anonymous aggregate events segmented by technology/source where available: landing → technology selected → checker start → upload/manual entry → genuine analysis → second quote → comparison → decision case → questions viewed/used → share → checkout created → paid → refunded → referral/repeat. Exclude QA/demo/bot/headless/smoke/test traffic. Missing evidence is null, not zero.

## Delivery order
P0: Continue first-customer acquisition and revenue monitoring in parallel.
P0: WS2 dedicated Solar/Battery analysis service behind the verified technology-aware boundary.
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

Solar/Battery public gate requires technology-specific extraction/evidence logic; no heat-pump leakage; representative fixture/regression tests; single/multi-quote comparison correctness; guardrail language; anonymous technology instrumentation; checkout verification; rendered mobile/desktop verification; preview + canary health.

## Progress tracking
Status vocabulary: NOT STARTED / IN PROGRESS / BLOCKED / VERIFIED / LIVE.

At every autonomous run: refresh authoritative evidence first; update this plan only for material progress; progress at least one independent roadmap item when acquisition evidence has not matured; record completed implementation/verification in OPS/RUN_LOG.md; keep OPS/CURRENT_STATE.md focused on current commercial truth; never mark capability LIVE from code existence alone.