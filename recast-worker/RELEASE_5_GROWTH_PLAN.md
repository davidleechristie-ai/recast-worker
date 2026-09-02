# Release 5 — Evidence-driven growth optimisation

## Objective
Move Recast from feature delivery into measured acquisition and conversion optimisation toward £1,000 genuine MRR.

Current measured baseline (2026-09-02): £0 genuine MRR, 1,351 Search Console impressions, 11 organic clicks (0.81% CTR), average position 66.69. The earliest measured constraint remains search visibility.

## Operating principle
Do not add pages or commercial prompts without evidence. Prioritise the earliest measurable funnel constraint, then the highest expected MRR impact within it.

## Phase 1 — Measurement integrity
- Confirm Release 3 funnel events are collectable end-to-end: successful tool use, workflow creation/save, Automation configuration start, API documentation view, pricing view, checkout start, entitlement confirmation.
- Preserve privacy: never capture pasted/input/output data, payloads, session recordings, or user file contents.
- Reconcile event names used by the product with the growth scoreboard collector.
- Keep unavailable measurements null; never estimate.
- Count only genuine paid, non-refunded recurring revenue.

## Phase 2 — Search opportunity engine
- Refresh Search Console page/query evidence before making SEO changes.
- Rank opportunities using impressions, position, CTR, intent and commercial relevance.
- Explicitly identify pages in positions 8–30 as near-term ranking opportunities.
- Identify high-impression/zero-click pages separately as CTR/relevance opportunities.
- Prevent cannibalisation between tool, guide and /seo/ pages.
- Continue the active JSON Schema Generator experiment through its 7/14/28-day checkpoints before drawing conclusions.

## Phase 3 — Funnel optimisation
Once sufficient post-Release-3 event volume exists, calculate:
- landing → successful tool use
- successful tool use → workflow creation
- workflow creation → workflow save
- workflow → Automation configuration
- relevant tool/use case → API documentation
- pricing → checkout
- checkout → genuine paid entitlement

Optimise the largest evidenced leak. Do not infer conversion problems from zero-volume samples.

## Phase 4 — Commercial optimisation
- Attribute genuine Pro, Automation and API revenue to source landing page and internal conversion path where privacy-safe attribution exists.
- Review pricing/checkout abandonment only after measurable traffic reaches those stages.
- Prefer improvements with a credible path to genuine recurring revenue over vanity engagement.

## Release gates
- Full npm test suite passes.
- Wrangler build validation passes.
- SEO guardrails/crawl checks pass.
- No new analytics payload contains user data.
- No unsupported product claims, fabricated limits or speculative pricing.
- Mobile journeys remain functional.
- Production verifier covers representative acquisition and commercial routes.

## Initial priorities from current evidence
1. Search visibility remains the primary bottleneck.
2. JSON Schema Generator experiment remains active; first checkpoint due 2026-09-08.
3. XML diff, flatten JSON, JSON diff and schema validation have meaningful existing impression pools and should be reassessed with fresh query-level evidence before editing.
4. Pages already near page one should be treated separately from low-ranking high-impression pages; small ranking/CTR improvements can have disproportionate value.
5. Release 4 /seo/ pages need time to be discovered/indexed before expansion decisions.

## Success criteria
Release 5 succeeds when Recast has a reliable weekly evidence loop that can state, without inference:
- where acquisition is improving or declining,
- which landing pages and queries are creating useful visits,
- where users progress or drop out of the commercial funnel,
- which experiments are improving measurable outcomes,
- and whether genuine MRR is moving toward £1,000.
