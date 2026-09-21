# Run log

Append concise dated run records here. Record only observed evidence and completed work.

## 2026-09-21 16:42 Europe/London — production router release path created
- Revenue: no newer authoritative Stripe object set was available in this execution context; latest verified genuine monthly revenue remains £0 / £1,000, validation revenue £0 / £100, paying customers 0. Missing fresh payment evidence remains null.
- Funnel/acquisition: latest authoritative production snapshot remains 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 durable checkouts. No newer parsed snapshot was available, so these values are not relabelled as fresh.
- Search: no newer authoritative Search Console dataset was available; latest remains 0 clicks / 4 impressions through 2026-09-19.
- COMPLETED: created `.github/workflows/hqc-production-router-release.yml` in commit `c89238ea1c60cc49778eaaac14233c59d9646418`. The production release is deliberately scoped to router/Worker/config changes, not agent-vault documentation, preventing hourly state writes from redeploying production.
- Release gate: workflow runs 9/9 Solar evidence/extraction tests plus technology/request-routing tests before deployment; deploys `hqc-production` with `wrangler.production.toml`; then verifies production health, legacy/default Heat Pump `/api/_healthcheck`, explicit Solar/Battery rejection with `technology_analysis_not_ready`, and durable metrics health. This is a non-UI release and does not expose Solar publicly.
- Evidence cutoff: immediately after commit, GitHub had not yet registered a workflow run for the commit. Production-router LIVE status is therefore not claimed.
- Primary revenue bottleneck remains first-customer acquisition/activation; this independent engineering release reduces risk/time to the second quote-holder vertical.
- Learning: no new durable lesson; release automation is implementation progress under existing technology-readiness learning.
- NEXT: verify the production release run; if green, record router as LIVE while keeping Solar CTA gated, then connect the dedicated Solar executable analysis path and prove single/two-quote + checkout + instrumentation + rendered gates.

## 2026-09-21 15:41 Europe/London — fresh production funnel; no commercial progression
- Revenue: no newer authoritative Stripe object set was available; latest verified genuine monthly revenue remains £0 / £1,000, validation revenue £0 / £100, paying customers 0. Missing fresh payment evidence remained null rather than being relabelled.
- FRESH FUNNEL: successful production metrics workflow `35610517081` fetched at 14:11:58Z: 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; extended cohort 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct is 40 → 16 → 5 → 5. Compared with prior settled evidence, +1 direct landing produced no new start/upload/analysis/checkout.
- Rates: landing→CTA 29%, CTA→upload 31%, upload→genuine 100%, Decision Case→share intent 50%, multi-quote 0/4. Production recommendations continue to flag landing→CTA, share-loop completion and lack of a qualified organic cohort.
- Technology evidence remains partial: Heat Pump 3 landings / 1 CTA / 0 uploads / 0 genuine / 0 checkouts; Solar/Battery remains gated.
- Search: no newer authoritative Search Console dataset; latest through 2026-09-19 remains 0 clicks / 4 impressions / 0% CTR / average position 8.07.
- Health: successful metrics retrieval proves production durable-metrics endpoints healthy at 14:11Z. Production technology-router deployment itself is still not authoritatively verified, so it is not claimed live.
- COMPLETED: refreshed `OPS/CURRENT_STATE.md` against the new authoritative production snapshot and preserved the distinction between raw traffic and qualified progression.
- Primary revenue bottleneck remains first-customer acquisition/activation. The additional landing did not progress, so raw landing volume is not treated as success.
- Solar/Battery: preview routing isolation and 9/9 extraction correctness remain green. Next safe product boundary remains production-router verification, then executable gated Solar analysis and end-to-end journey proof before public CTA.
- Learning: no new durable lesson; one additional non-progressing landing is consistent with existing learning but too small to materially refine it.
- NEXT: continue qualified quote-holder acquisition; verify/deploy the non-UI router in production; then connect the dedicated Solar executable path and complete single/two-quote, checkout, instrumentation and rendered gates.

## Earlier runs
Earlier detailed run history remains available in repository history. The current state and durable learnings carry forward the authoritative operating context.