# Current state

Updated: 2026-09-20 12:52 Europe/London

North star: Sustain at least £1,000 genuine monthly revenue. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month window.

## Evidence refreshed
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed this run: 0 objects, `has_more=false`. Genuine production revenue remains £0 / £1,000 monthly North Star; cumulative validation revenue £0 / £100; paying customers 0.
- Durable funnel: latest successful production snapshot fetched 2026-09-20T11:39:40Z = 55 genuine landings → 16 checker starts → 5 uploads → 5 genuine analyses. Extended cohort remains 4 genuine analyses → 0 multi-quote analyses → 4 Decision Cases → 0 installer-question actions → 2 share intents → 0 share opens → 0 recipient starts → 0 outbound/commercial clicks → 0 durable checkouts.
- Qualified acquisition: direct remains the only source with genuine analyses: 39 landings → 16 starts → 5 uploads → 5 genuine analyses. Organic cohorts still have no genuine analyses.
- Technology segmentation has now appeared in durable production metrics: heat_pump = 2 classified landings, 1 checker start, 0 uploads, 0 genuine analyses, 0 checkouts. Most historical events remain unclassified because they predate technology instrumentation; do not infer a complete technology mix from this partial row. Solar/Battery remains behind its non-public correctness gate.
- SEO/search: a fresh public web search for `site:homequotecheck.co.uk Home Quote Check heat pump quote` returned no results this run. No newer authoritative Search Console dataset was available; latest settled Search Console evidence remains 13 sitemap URLs, 2 receiving impressions, 4 total impressions and 0 clicks.
- Production health: the hourly `HQC live metrics snapshot` workflow run 35508451044 completed successfully at 11:39Z and fetched/committed durable production metrics. The prior guarded checkout-observability production release remains verified green.

## Commercial diagnosis
First-customer acquisition/conversion remains binding. There is still no genuine PaymentIntent and no durable checkout. Since the previous state, genuine landings increased 53→55 and checker starts 15→16, while uploads and genuine analyses remained 5. Landing→start is now 29% overall; direct remains 41%. Start→upload fell to 31% (5/16). This is fresh post-release evidence of additional top-funnel activity without downstream progression, but the sample is still very small. Do not stack another homepage UI experiment merely from two landings; progress independent qualified distribution and quote-intake activation work while the repaired checkout path continues to measure.

## Current milestone
First genuine £4.99 Decision Pack purchase.

## Active workstreams
1. Qualified high-intent distribution: continue channels aimed at homeowners who already hold heat-pump quotes; organic cohorts have not yet produced a genuine analysis.
2. Upload activation: start→upload is the earliest adequately observed downstream constraint at 5/16; prioritise non-confounding intake-friction diagnosis before adding feature breadth.
3. Paid boundary: repaired £4.99 checkout remains production-live and observable; wait for genuine commercial intent rather than changing price again without evidence.
4. Solar/Battery: continue technology-specific extraction/evidence correctness behind the non-public gate; no CTA until correctness and rendered journey verification pass.
5. Instrumentation: technology segmentation is now arriving for new events; retain anonymous aggregate dimensions and do not expand PII.

## Expected revenue impact
Fresh durable post-fix measurement narrows the immediate problem away from payment plumbing and toward qualified volume plus checker-start→upload activation. Concentrating execution there increases the probability and speed of producing the first genuine analysis cohort large enough to exercise the now-working £4.99 checkout.

## Next actions
1. Refresh live Stripe and durable checkout/funnel evidence every run; first genuine purchase remains the immediate milestone.
2. Progress qualified high-intent distribution and quote-intake activation without overlapping homepage experiments.
3. Diagnose intake friction from current implementation/instrumentation and ship only if evidence supports a small reusable change with required rendered verification.
4. Continue Solar PV + Battery extraction/evidence completeness behind the non-public gate.
5. Re-rank when additional post-fix genuine evidence arrives; unavailable metrics remain null rather than assumed zero.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
