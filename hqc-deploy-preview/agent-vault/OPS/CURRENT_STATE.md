# Current state

Updated: 2026-09-19 16:54 Europe/London

North star: Validate demand with at least £100 cumulative genuine customer revenue in the first three months, then grow sustainable revenue.

## Evidence refreshed
- Revenue: authoritative payment evidence remains unavailable in this run. GA4 ecommerce cannot substitute: the connected GSC Wizard account reports Analytics `notConfigured` / `no_scope`. No revenue value is asserted.
- Durable funnel: unavailable in this run; no authoritative production counter source is exposed. No funnel counts are asserted or carried forward as fresh evidence.
- SEO/search: authoritative Search Console refreshed through settled 2026-09-16. Sitemap has 13 URLs; 2 have GSC impressions. Homepage: 2 impressions, 0 clicks, avg position 3.5. `/is-this-a-good-heat-pump-quote.html`: 2 impressions, 0 clicks, avg position 5.5. Query/page data exposes one row: `what questions to ask when buying a heat pump` → `/?page=questions&src=organic_questions`, 1 impression, 0 clicks, position 98. Search volume is still too small for CTR conclusions.
- Production health: public production and `/ops` remain inaccessible through the available web reader. GitHub main/vault are reachable. Runtime health is unknown, not asserted failed.

## Bottleneck / experiment
Observability reliability remains the earliest operational constraint because revenue and durable synthetic-excluded funnel evidence cannot be refreshed non-interactively. SEO discovery is beginning but extremely sparse; adding more acquisition content now would confound existing experiments and is not justified.

## Action
Loaded only the reliability SOP. Retried production `/ops`, Search Console and ecommerce evidence. Search Console is now authoritative and available; payment/funnel/production runtime remain unavailable. No UI/product release made because rendered verification is unavailable and production cannot be verified. Preserved comparison-flow and SEO attribution.

## Blockers
Machine-readable authoritative payment and durable funnel evidence are still not exposed to this runtime; GA4 is not connected to the authenticated GSC Wizard account. Production URL verification through the web reader is also unavailable. This is not yet escalated as owner action because no safe production observability change can be verified in the current runtime.

## Next decision
Retry authoritative payment/funnel and production health first. Continue measuring settled Search Console. If a verifiable deployment/runtime path becomes available, ship an aggregate-only privacy-safe synthetic-excluded ops snapshot under SHIP_CHANGE; do not expose customer/payment data. Avoid additional SEO content until current pages accumulate enough impressions to diagnose intent/ranking rather than discovery noise.
