# Current state

Updated: 2026-09-20 19:50 Europe/London

North star: Sustain at least £1,000 genuine monthly revenue. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month window.

## Evidence refreshed
- Revenue: live Stripe account selection was refreshed and `Home Quote Check` remains available in livemode. This execution context exposed PaymentIntent discovery but not an API execution action, so a fresh PaymentIntent list could not be retrieved. Latest authoritative successful evidence therefore remains the prior live refresh: 0 PaymentIntents, genuine production revenue £0 / £1,000 monthly North Star; cumulative validation revenue £0 / £100; paying customers 0. Unavailable fresh evidence is not treated as zero.
- Durable funnel: fresh production endpoint evidence remains unavailable in this execution context. Latest settled successful snapshot remains 55 genuine landings → 16 checker starts → 5 uploads → 5 genuine analyses. Extended cohort remains 4 genuine analyses → 0 multi-quote analyses → 4 Decision Cases → 0 installer-question actions → 2 share intents → 0 share opens → 0 recipient starts → 0 outbound/commercial clicks → 0 durable checkouts.
- Qualified acquisition: latest settled evidence remains direct 39 landings → 16 starts → 5 uploads → 5 genuine analyses. Organic cohorts have no genuine analyses in the latest settled snapshot.
- Technology segmentation remains partial: most historical activity predates technology instrumentation. Latest classified evidence remains `heat_pump` 2 landings / 1 start / 0 uploads / 0 genuine / 0 checkouts. Solar/Battery remains behind its non-public correctness gate.
- SEO/search: fresh public searches on 2026-09-20 for both HQC heat-pump and solar/battery footprints returned no results. No newer authoritative Search Console dataset was available; latest settled Search Console evidence remains 13 sitemap URLs, 2 receiving impressions, 4 total impressions and 0 clicks.
- Production health: fresh direct production health/funnel evidence was unavailable in this execution context. Latest settled health remains the prior successful production metrics workflow and guarded checkout release; fresh health is null rather than assumed.
- Implementation inspection: `worker.js` confirms reusable anonymous technology dimensions (`heat_pump`, `solar_battery`, `battery`) and technology-aware checkout-created telemetry, but all non-payment analysis still depends on the heat-pump-specific upstream base. Solar/Battery therefore remains correctly non-public.

## Commercial diagnosis
First-customer acquisition/conversion remains binding. Latest settled start→upload remains 31% (5/16), the earliest adequately observed downstream constraint. No new evidence justifies stacking another Heat Pump UI experiment. Qualified distribution remains the fastest route to exercising the verified £4.99 checkout while independent Solar/Battery implementation progresses.

## Current milestone
First genuine £4.99 Decision Pack purchase.

## Product strategy extension
- Tracked roadmap: `STRATEGY/PURCHASE_ADVISER_ROADMAP.md`.
- New implementation boundary: `STRATEGY/SOLAR_ANALYSIS_BOUNDARY.md`, committed as `a991bdbc1b529c75056a2283d60ee782c255745a`. This converts the Solar/Battery blocker into an explicit technology-routing, structured-evidence, provenance, comparison and fixture contract.
- HQC retains Quote Check as the acquisition wedge while evolving toward an independent pre-commitment purchase adviser: Quote Check → Home/System Fit → Financial Assumptions → Installer/Proposal Evidence → Compare → Questions → paid Decision Pack.

## Active workstreams
1. Qualified high-intent distribution: continue channels aimed at homeowners who already hold heat-pump quotes; organic cohorts have not yet produced a genuine analysis.
2. Upload activation: latest settled start→upload remains 5/16; diagnose with durable evidence before changing UI again.
3. Paid boundary: repaired £4.99 checkout remains latest verified production state; do not change price again without genuine commercial-intent evidence.
4. Solar/Battery: implementation boundary is now specified. Next code step is server-side technology validation/routing that preserves Heat Pump unchanged and prevents Solar/Battery from reaching heat-pump logic.
5. Instrumentation: existing anonymous technology dimensions are reusable; do not expand PII.

## Expected revenue impact
The Solar analysis-boundary specification reduces implementation ambiguity and protects the live Heat Pump journey while enabling the second addressable technology vertical. In parallel, keeping Heat Pump conversion UI stable preserves clean measurement and focuses first-revenue effort on qualified quote holders rather than low-evidence polish.

## Next actions
1. Refresh live Stripe PaymentIntents and durable checkout/funnel evidence when execution access is available; first genuine purchase remains the immediate milestone.
2. Progress qualified high-intent distribution and quote-intake activation without overlapping homepage experiments.
3. Implement the first safe code slice from `STRATEGY/SOLAR_ANALYSIS_BOUNDARY.md`: technology validation/routing behind the non-public gate, Heat Pump unchanged, followed by Solar/Battery extraction fixtures.
4. Then prove single/two-quote Solar journeys and begin deterministic Financial Assumptions Check.
5. Re-rank when additional genuine evidence arrives; unavailable metrics remain null rather than assumed zero.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy for deployment. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
