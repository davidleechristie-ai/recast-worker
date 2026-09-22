# HQC Independent Purchase Adviser — Strategy & Delivery Plan

Updated: 2026-09-22

## Objective
Evolve Home Quote Check from a document checker into an independent **pre-commitment home-energy purchase adviser**, while preserving the acquisition proposition: **Already have a quote? Independently check and compare it before you commit.** The uploaded installer quote remains the acquisition/input wedge. This roadmap runs in parallel with first-customer acquisition and must not destabilise Heat Pump.

## Technology rollout
### Vertical 1 — Heat Pump
Status: LIVE. Protect the existing working path.

### Vertical 2 — Solar PV + Battery
Status: BUILD / NON-PUBLIC. Battery-only reuses this adapter where practical. Never represent automated output as design/structural approval, DNO approval, MCS certification, grant eligibility, or guaranteed generation/savings.

## WS1 — Shared evidence schema and analysis boundary
Status: IN PROGRESS.
- [ ] Define technology-neutral Quote/EvidenceItem/Claim/Assumption/Gap/ComparisonDimension/Question/DecisionFinding objects and provenance.
- [x] Ensure unknown/missing remains unknown in Solar evidence.
- [ ] Map Heat Pump fields without changing live output.
- [x] Implement Solar/Battery structured evidence adapter/extractor and representative fixture tests.

## WS2 — Remove Solar dependency on heat-pump upstream
Status: REQUEST INTEGRATION VERIFIED / WORKER ISOLATION TEST PENDING CI.
- [x] Confirm heat-pump-only upstream dependency.
- [x] Explicit technology-routing contract; Solar/Battery cannot fall through to Heat Pump.
- [x] Request-level technology boundary and isolation tests.
- [x] Production router wired with public Solar gate closed; Heat Pump compatibility verified via asset-preserving release.
- [x] Dedicated executable Solar/Battery analysis/comparison service; full trust suite green in run `35696615513`.
- [x] Implement dedicated structured/manual JSON request handler for single and two-quote analysis.
- [x] Wire handler into `worker-entry.js` behind explicit `HQC_SOLAR_ANALYSIS_INTERNAL=1` plus Solar/Battery technology hint; production remains gated with flag absent.
- [x] Add request-boundary cases for complete, partial, malformed and two-quote payloads plus fail-closed unsupported media behaviour.
- [x] Request integration CI run `35701193912` green.
- [x] Add Worker-level gate/isolation tests; CI registration pending for commit `a3661ea47293a0f715ba4647a7f00b35f95866d2`.
- [ ] Require Worker gate/isolation CI green before treating Worker boundary as verified.
- [ ] Validate PDF, screenshot/photo and manual-entry ingestion end-to-end; JSON/manual structured boundary exists, PDF/image deliberately returns 415 until verified.
- [ ] Ensure technology propagates into durable anonymous funnel and checkout events end-to-end.

Production routing evidence: run `35646864766`, attempt 2, passed without frontend assets. Behind-gate service evidence: run `35696615513` passed full trust suite. Request-integration evidence: run `35701193912` passed. Worker-level gate/isolation tests are committed and awaiting CI registration.

## WS3 — Solar/Battery Quote Check MVP
Status: IN PROGRESS.
- [x] Synthetic solar-only, solar+battery, battery-only, partial and two-quote fixtures.
- [x] Structured extraction/evidence checks with missing evidence preserved.
- [x] Plain-English findings and evidence-only two-quote comparison without automatic winner.
- [x] Structured/manual JSON request boundary implemented and verified behind non-public environment gate.
- [ ] Generate quote-specific installer questions from gaps/differences.
- [ ] Reuse Decision Case/share and checkout infrastructure with technology dimension.
- [ ] PDF/image ingestion correctness tests.
- [ ] Automated end-to-end correctness tests.
- [ ] Rendered mobile + desktop and preview/canary verification before public CTA.

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
- [x] Track checkout-created with technology dimension durably; Stripe remains authoritative for paid/refunded evidence.
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
Every material release follows Measure → Diagnose → Research → Prioritise → Build → Test → Commit → Preview/Canary → Verify → Production → Measure and `SOPS/SHIP_CHANGE.md`. Solar public gate requires technology-specific extraction/evidence; no Heat Pump leakage; fixture/regression tests; single/multi-quote correctness; guardrails; technology instrumentation; checkout verification; rendered mobile/desktop verification; preview + canary health.

## Progress tracking
Do not mark capability LIVE from code existence alone. At each run refresh authoritative evidence, progress independent roadmap work where acquisition evidence has not matured, update OPS state/log, and keep Solar non-public until all gates pass.