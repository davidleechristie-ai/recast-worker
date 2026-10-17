# HQC Durable Learnings

Purpose: preserve evidence-backed lessons that should influence future autonomous decisions. This is not a run log. Add a learning only when observed evidence supports a reusable conclusion.

## Learning format

### YYYY-MM-DD — Short lesson
- **Hypothesis:** What was believed or tested.
- **Action / experiment:** What changed or was observed.
- **Evidence:** Authoritative evidence, including relevant cohort/time period and limitations.
- **Conclusion:** What the evidence supports.
- **Decision rule:** What future runs should do differently because of this.
- **Revisit when:** What new evidence would justify challenging the lesson.

## Current durable learnings

### 2026-09-20 — Acquisition and activation precede checkout as the observed bottleneck
- **Hypothesis:** Lack of purchases might primarily be caused by checkout correctness or observability.
- **Action / experiment:** Repaired the £4.99 purchase CTA/price binding and added durable server-side checkout-created telemetry; production verification passed.
- **Evidence:** Latest settled funnel after the repair remains low-volume: 55 genuine landings → 16 checker starts → 5 uploads → 5 genuine analyses, with no durable checkout observed in the settled snapshot. Direct traffic produced the genuine analyses; measured organic cohorts had not produced a genuine analysis. Sample size remains small.
- **Conclusion:** With the known checkout correctness defect repaired, the earliest adequately observed downstream constraint is currently qualified acquisition and start→upload activation, not a demonstrated payment-processing failure.
- **Decision rule:** Until materially different evidence arrives, prioritise qualified quote-holder acquisition and getting genuine starts through upload/analysis before stacking further checkout/UI experiments.
- **Revisit when:** Genuine analyses materially increase, checkout-created events appear without payment, or authoritative payment evidence changes.

### 2026-09-20 — Technology instrumentation is not Solar/Battery analysis readiness
- **Hypothesis:** Existing technology segmentation might mean Solar/Battery could reuse the current analysis path.
- **Action / experiment:** Inspected the production Worker and analysis handoff.
- **Evidence:** Durable metrics already support heat_pump, solar_battery and battery dimensions, but non-payment analysis traffic is handed to a heat-pump-specific upstream analysis service; no verified Solar/Battery evidence extraction path exists in the Worker.
- **Conclusion:** Measurement plumbing can be reused, but Solar/Battery must remain non-public until technology-specific extraction/evidence/comparison is implemented and verified.
- **Decision rule:** Never infer product readiness from instrumentation readiness. Keep Solar/Battery CTA gated until the roadmap release gates pass.
- **Revisit when:** Technology-aware routing and representative Solar/Battery fixture/journey tests pass.

### 2026-09-20 — Quote Check is the acquisition wedge, not the intended product ceiling
- **Hypothesis:** Consumers making high-value home-energy purchases may need more than document extraction/comparison.
- **Action / experiment:** Expanded product strategy into the Independent Purchase Adviser roadmap while preserving the existing Quote Check proposition.
- **Evidence:** Product analysis identified reusable decision needs around system/home fit, financial assumptions, proposal evidence, comparison and questions before commitment. This is a strategic hypothesis pending genuine usage/revenue validation rather than proven customer demand.
- **Conclusion:** Architect reusable evidence and decision primitives so HQC can test higher-value decision support without weakening the simple acquisition proposition.
- **Decision rule:** Keep “Already have a quote? Independently check and compare it before you commit.” as the acquisition message. Build additional decision capabilities behind measured, trustworthy evidence and test whether they improve commercial intent.
- **Revisit when:** Genuine funnel, qualitative customer evidence or paid behaviour shows which decision capabilities create value.
