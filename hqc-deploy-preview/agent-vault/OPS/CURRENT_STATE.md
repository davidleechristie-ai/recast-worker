# Current state

Updated: 2026-09-20 18:49 Europe/London

North star: Sustain at least £1,000 genuine monthly revenue. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month window.

## Evidence refreshed
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed this run: 0 objects, `has_more=false`. Genuine production revenue remains £0 / £1,000 monthly North Star; cumulative validation revenue £0 / £100; paying customers 0.
- Durable funnel: fresh production endpoint access remains unavailable in this execution context. Latest settled successful snapshot remains 55 genuine landings → 16 checker starts → 5 uploads → 5 genuine analyses. Extended cohort remains 4 genuine analyses → 0 multi-quote analyses → 4 Decision Cases → 0 installer-question actions → 2 share intents → 0 share opens → 0 recipient starts → 0 outbound/commercial clicks → 0 durable checkouts. Unavailable fresh evidence is not treated as zero.
- Qualified acquisition: latest settled evidence remains direct 39 landings → 16 starts → 5 uploads → 5 genuine analyses. Organic cohorts have no genuine analyses in the latest settled snapshot.
- Technology segmentation remains partial: most historical activity predates technology instrumentation. Latest classified evidence remains `heat_pump` 2 landings / 1 start / 0 uploads / 0 genuine / 0 checkouts. Solar/Battery remains behind its non-public correctness gate; do not infer a complete technology mix.
- SEO/search: fresh public searches for the HQC heat-pump and solar/battery site footprint returned no results this run. No newer authoritative Search Console dataset was available; latest settled Search Console evidence remains 13 sitemap URLs, 2 receiving impressions, 4 total impressions and 0 clicks.
- Production health: direct `/health`, www `/health` and `/api/growth-report` fetches were attempted but unavailable in this web execution context. Latest settled health remains the prior successful production metrics workflow and guarded checkout release; fresh health is null rather than assumed.
- Implementation inspection: `worker.js` directly confirms the Cloudflare Worker proxies all non-payment `/api/*` analysis traffic to `https://api-v2.appdeploy.ai/app/heat-pump-second-opinion-v43csv`. The Worker contains technology-segmented metrics/checkout plumbing but no Solar/Battery evidence extraction or analysis logic. Solar/Battery therefore remains gated; replacing or extending this upstream dependency is the concrete correctness task before public exposure.

## Commercial diagnosis
First-customer acquisition/conversion remains binding. There is still no genuine PaymentIntent. Latest settled start→upload remains 31% (5/16), the earliest adequately observed downstream constraint. Current upload implementation already supports screenshot/photo/PDF and one genuine installer quote; no new evidence justifies stacking another UI experiment. Qualified distribution remains the fastest route to exercising the now-observable £4.99 checkout.

## Current milestone
First genuine £4.99 Decision Pack purchase.

## Product strategy extension
- Detailed tracked roadmap created at `STRATEGY/PURCHASE_ADVISER_ROADMAP.md` (commit `941537c2c6c11d4b0d80ae66cafbd521bd5fb8c4`). HQC will retain Quote Check as the acquisition wedge while evolving toward an independent pre-commitment purchase adviser: Quote Check → Home/System Fit → Financial Assumptions → Installer/Proposal Evidence → Compare → Questions → paid Decision Pack.
- Immediate product execution remains non-confounding with acquisition monitoring: first engineering target is technology-aware analysis routing plus Solar/Battery extraction behind the non-public gate; first higher-value differentiator after trustworthy Solar quote checking is deterministic Financial Assumptions Check.

## Active workstreams
1. Qualified high-intent distribution: continue channels aimed at homeowners who already hold heat-pump quotes; organic cohorts have not yet produced a genuine analysis.
2. Upload activation: latest settled start→upload remains 5/16; diagnose with durable evidence before changing UI again.
3. Paid boundary: repaired £4.99 checkout remains latest verified production state; do not change price again without genuine commercial-intent evidence.
4. Solar/Battery: technology measurement is reusable, but actual analysis is still handed to a heat-pump-specific upstream service. Build/prove a solar-specific extraction/evidence path before exposing Solar/Battery publicly.
5. Instrumentation: retain anonymous aggregate technology dimensions and do not expand PII.

## Expected revenue impact
Keeping conversion UI stable avoids confounding a tiny post-fix sample. Concentrating execution on qualified quote-holders and intake completion increases the probability and speed of producing enough genuine analyses to exercise the working £4.99 checkout. Pinning Solar/Battery's blocker to the actual upstream analysis handoff prevents premature launch and makes the second-vertical implementation target explicit.

## Next actions
1. Refresh live Stripe and durable checkout/funnel evidence every run; first genuine purchase remains the immediate milestone.
2. Progress qualified high-intent distribution and quote-intake activation without overlapping homepage experiments.
3. Execute `STRATEGY/PURCHASE_ADVISER_ROADMAP.md`: first replace/prove the heat-pump-specific upstream analysis handoff with technology-aware routing and Solar PV + Battery extraction/evidence completeness behind the non-public gate; then prove single/two-quote Solar journeys and Financial Assumptions Check.
4. Re-rank when additional genuine evidence arrives; unavailable metrics remain null rather than assumed zero.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy for deployment. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
