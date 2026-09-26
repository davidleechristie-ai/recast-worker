# HQC Independent Purchase Adviser — Strategy & Delivery Plan

Updated: 2026-09-24

## Objective
Evolve Home Quote Check from a document checker into an independent **pre-commitment home-energy purchase adviser**, while preserving the acquisition proposition: **Already have a quote? Independently check and compare it before you commit.** The uploaded installer quote remains the acquisition/input wedge. This roadmap runs in parallel with first-customer acquisition and must not destabilise Heat Pump.

## Technology rollout
### Vertical 1 — Heat Pump
Status: LIVE. Protect the existing working path.

### Vertical 2 — Solar PV + Battery
Status: BUILD / NON-PUBLIC. Battery-only reuses this adapter where practical. Never represent automated output as design/structural approval, DNO approval, MCS certification, grant eligibility, or guaranteed generation/savings.

## Renewable Vertical MVP Production Benchmark
A new technology is eligible for iterative production release only when **all** of these gates are green. Passing means MVP-quality and safe to expose publicly; it does not require feature parity with mature Heat Pump.

1. **Technology isolation:** explicit routing; no fallback into another technology; mixed quotes preserve per-technology provenance.
2. **Evidence model:** technology-specific checklist covers the material equipment, capacity/specification, price/scope, assumptions, exclusions, warranties and relevant UK scheme/regulatory wording. Missing evidence remains unknown, never invented.
3. **Extraction quality:** representative complete, partial, malformed and multi-quote fixtures pass. For the benchmark fixture set, ≥95% of required material fields are correctly captured when explicitly present, with **0 fabricated material values**. Any unsupported media/path fails clearly and safely.
4. **Decision correctness:** single-quote findings, gaps and installer questions are evidence-backed; comparison accurately describes material differences without inventing a winner. Zero known P0/P1 correctness defects.
5. **Guardrails:** current authoritative UK sources researched for that technology; output clearly separates quote evidence from estimates/advice and does not claim certification, approval, eligibility, structural/electrical/design safety or guaranteed savings/performance unless independently evidenced.
6. **Journey completeness:** real customer upload/manual entry → technology detection/selection → analysis → results works end-to-end. Two quotes → comparison works where comparison is offered. No dead-end primary CTA.
7. **Commercial boundary:** free/paid features are explicit. If Decision Pack/checkout is enabled, content is technology-specific and checkout metadata records the technology; otherwise paid CTA stays hidden rather than reusing incorrect content.
8. **Observability/privacy:** durable synthetic-excluded funnel events carry technology + source from landing/start through genuine analysis and checkout where applicable; no new unnecessary PII.
9. **Regression:** Heat Pump and every already-live vertical remain green; representative cross-technology isolation tests pass.
10. **Rendered release gate:** mobile + desktop preview/canary journey passes, then production deployment follows `SOPS/SHIP_CHANGE.md`; production hostname/routes and the new technology journey are verified after binding. P0/P1 blocks or any production 5xx/routing failure require rollback/fix.
11. **Post-release watch:** release behind a technology flag/kill switch where practical; monitor genuine analyses, failures and support signals. A material correctness/safety regression disables only that vertical without destabilising others.

### Iterative release policy
- Do **not** wait for every renewable technology to be finished. Build the highest-priority not-yet-live vertical, take it through the MVP benchmark, deploy it to production, measure it, then continue to the next vertical.
- Release order is continuously re-ranked by observed quote demand × revenue potential × speed-to-MVP ÷ implementation/risk, while Solar PV + Battery remains next because it is already closest to the benchmark.
- A vertical becomes **LIVE MVP** only after production verification, not when code/CI exists. Record benchmark evidence and production run IDs in this roadmap and OPS/RUN_LOG.md.
- MVP release does not require OCR for every possible document type if supported text-PDF/manual paths are clearly disclosed and unsupported paths fail closed; broaden ingestion iteratively after launch.

## WS1 — Shared evidence schema and analysis boundary
Status: IN PROGRESS.
- [ ] Define technology-neutral Quote/EvidenceItem/Claim/Assumption/Gap/ComparisonDimension/Question/DecisionFinding objects and provenance.
- [x] Ensure unknown/missing remains unknown in Solar evidence.
- [ ] Map Heat Pump fields without changing live output.
- [x] Implement Solar/Battery structured evidence adapter/extractor and representative fixture tests.

## WS2 — Remove Solar dependency on heat-pump upstream
Status: REQUEST + WORKER ISOLATION VERIFIED / INGESTION IN PROGRESS.
- [x] Confirm heat-pump-only upstream dependency.
- [x] Explicit technology-routing contract; Solar/Battery cannot fall through to Heat Pump.
- [x] Request-level technology boundary and isolation tests.
- [x] Production router wired with public Solar gate closed; Heat Pump compatibility verified via asset-preserving release.
- [x] Dedicated executable Solar/Battery analysis/comparison service; full trust suite green in run `35696615513`.
- [x] Implement dedicated structured/manual JSON request handler for single and two-quote analysis.
- [x] Wire handler into `worker-entry.js` behind explicit `HQC_SOLAR_ANALYSIS_INTERNAL=1` plus Solar/Battery technology hint; production remains gated with flag absent.
- [x] Add request-boundary cases for complete, partial, malformed and two-quote payloads plus fail-closed unsupported media behaviour.
- [x] Request integration CI run `35701193912` green.
- [x] Add Worker-level gate/isolation tests.
- [x] Worker gate/isolation CI run `35706680835` green for commit `a3661ea47293a0f715ba4647a7f00b35f95866d2`.
- [x] PDF/image extracted-media provenance contract and correctness tests verified by `HQC Solar analysis CI` run `35798847121` for commit `7593955a07378842bf77d1bf77b21a136f41114c`.
- [x] Wire verified extracted-text envelopes into gated handler and verify PDF-derived/image-OCR-derived handler fixtures: `HQC Solar analysis CI` run `35823816580` green for commit `c4dca3dbd1d95cb64f8e33774f5787f8a8afc40b`.
- [x] Custom-domain canary now runs `worker-entry.js` with the internal Solar gate enabled only on canary; live extracted-media analysis, raw-media isolation, and existing rendered browser regression gates all passed in run `36057638281`.
- [x] Private browser bridge converts stored provenance-bearing Solar extracted media into the gated Solar request and renders Solar-specific evidence gaps/questions; mobile canary run `36058643609` green. Canary Worker is isolated from the generic preview Worker to remove deployment races.
- [x] Text-based PDF selection → PDF.js text extraction/provenance → gated Solar analysis → Solar-specific rendered result is verified in one mobile browser flow; custom-domain canary run `36060001899` green. Image-only/OCR remains deliberately fail-closed.
- [x] Validate representative extracted PDF and screenshot/photo envelopes end-to-end through the gated handler. `HQC Solar analysis CI` run `35849623161` green for `e1cd6e9`; direct raw-media HTTP remains a separate closed boundary.
- [~] Ensure technology propagates into durable anonymous funnel and checkout events end-to-end. Decision Pack client events + checkout request carry `hqc_journey_technology` with Heat Pump safe default; contract CI run `35850406399` is green for `ad5f43a8b9e0029ab6d97ef1f6f606215efa60f1`. Full durable event-path reconciliation remains to verify.

## WS3 — Solar/Battery Quote Check MVP
Status: IN PROGRESS.
- [x] Synthetic solar-only, solar+battery, battery-only, partial and two-quote fixtures.
- [x] Structured extraction/evidence checks with missing evidence preserved.
- [x] Plain-English findings and evidence-only two-quote comparison without automatic winner.
- [x] Structured/manual JSON request boundary implemented and verified behind non-public environment gate.
- [x] Generate quote-specific installer questions from gaps/differences — verified by successful `HQC Solar analysis CI` run `35717861021`.
- [~] Reuse Decision Case/share and checkout infrastructure with technology dimension. Technology-aware client telemetry/checkout plumbing is CI-verified; Solar-specific Decision Pack content remains deliberately gated because current pack analysis is Heat-Pump-specific.
- [~] PDF/image ingestion: provenance/normalisation, extracted-media → gated-handler integration, and representative PDF/screenshot/photo extractor-output fixtures are CI-verified (`35849623161`). Direct raw-media HTTP ingestion remains disabled pending the customer-facing extraction path and rendered end-to-end verification.
- [x] Automated rendered/browser correctness for gated Solar preview and non-preview Heat Pump isolation is now verified after render-order fix `a7f5b3c6`. Custom-domain canary run `35983345210` completed snapshot, binding, domain/static/API and mobile-browser journey stages successfully; workflow-level cancellation was concurrency cleanup after substantive steps passed.
- [x] Rendered mobile + desktop preview/isolation gate for the private Solar journey passed via the custom-domain browser canary after `a7f5b3c6`.
- [ ] Wire the verified extracted-media path into the private customer-facing upload → analyse → results journey and verify end-to-end before any public CTA.

## WS4 — Home/System Fit Check
Status: NOT STARTED. Deferred behind P0/P1 work.

## WS5 — Financial Assumptions Check
Status: NOT STARTED; begins after trustworthy Solar quote extraction is executable end-to-end.
- [ ] Parse stated generation, consumption, self-consumption, export, tariff and savings/payback assumptions.
- [ ] Deterministic calculation layer separated from narrative.
- [ ] Solar generation → self-consumption → avoided import → export → annual benefit.
- [ ] Battery usable capacity/cycling assumptions → shifted import/export/tariff benefit with limitations.
- [ ] Research authoritative methodology before implementation; expose ranges/sensitivity and all material inputs.

## WS6 — Installer & Proposal Evidence Check
Status: NOT STARTED.

## WS7 — Pre-Commitment Decision Pack
Status: IN PROGRESS via existing £4.99 Heat Pump Decision Pack.
- [x] Keep current £4.99 Heat Pump boundary stable until willingness-to-pay evidence exists.
- [~] Track checkout-created with technology dimension durably; client propagation contract is CI-verified, full end-to-end durable event verification pending.
- [ ] Richer cross-technology pack after structured findings are proven.

## WS8 — Decision assistant
Status: DEFERRED until structured evidence is reliable.

## WS9 — Post-installation Check
Status: DEFERRED until pre-commitment demand/revenue evidence exists.

## Measurement
Anonymous aggregate events segmented by technology/source where available: landing → technology selected → checker start → upload/manual entry → genuine analysis → second quote → comparison → decision case → questions → share → checkout created → paid → refunded → referral/repeat. Exclude QA/demo/bot/headless/smoke/test traffic. Missing evidence is null, not zero.

## Delivery order
P0: first-customer acquisition/revenue monitoring in parallel.
P0: WS2 gated Solar request integration and verified ingestion.
P0: WS3 Solar Quote Check through comparison/Decision Case.
P1: WS1 shared schema as required safely.
P1: WS5 Financial Assumptions Check.
P1: WS7 richer Decision Pack.

## Release gates
Every material release follows Measure → Diagnose → Research → Prioritise → Build → Test → Commit → Preview/Canary → Verify → Production → Measure and `SOPS/SHIP_CHANGE.md`. Solar public gate requires technology-specific extraction/evidence; no Heat Pump leakage; fixture/regression tests; single/multi-quote correctness; guardrails; technology instrumentation; checkout verification; rendered mobile/desktop verification; preview + canary health. The private rendered preview/isolation gate is green; customer-facing raw-media ingestion and Solar-specific paid output remain closed.

## Progress tracking
Do not mark capability LIVE from code existence alone. At each run refresh authoritative evidence, progress independent roadmap work where acquisition evidence has not matured, update OPS state/log, and keep Solar non-public until all gates pass.

## 2026-09-26 milestone
Solar PV + Battery has passed the LIVE MVP production gate for the supported text-PDF journey: rendered custom-domain canary 36231458276 passed; production release 36240154137 returned Heat Pump/default 200, Solar production analysis 200 with expected 5.1 kWp evidence, and durable metrics 200. Unsupported image-only/photo inputs remain fail-closed. WS3 now moves from gated MVP delivery into production observation/refinement. WS5 Financial Assumptions Check is the next Purchase Adviser build priority; richer WS7 cross-technology Decision Pack follows once assumptions are evidence-backed.

## Vertical 3 — EV Chargepoint + Smart Charging
Status: BUILD / NON-PUBLIC.

Selected as the next iterative vertical after Solar PV + Battery reached LIVE MVP. Initial benchmark scope is domestic GB chargepoint installer quotes, with Scotland-specific grant wording treated separately where relevant. Evidence model covers charger model/power, tethering/connector, smart/connectivity features, load management, PV integration, supply/consumer-unit/cabling/earthing scope, DNO treatment, warranties, price/exclusions, and grant/installer/model claims. Current authoritative guardrails are GOV.UK smart-chargepoint regulations and OZEV chargepoint/grant specifications plus Energy Saving Trust consumer charging guidance. The technology route is registered fail-closed at 409 until a dedicated adapter passes fixtures, comparison, rendered journey and production gates.
