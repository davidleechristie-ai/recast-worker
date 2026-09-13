# Home Quote Check validation north star

## Validation goal
Prove genuine homeowner demand before scaling monetisation: reach **100 genuine heat-pump quote analyses**, supported by at least **20 genuine shared-case opens**, **10 meaningful commercial/outbound actions**, and **sustained growth in qualified non-brand organic acquisition**.

At 100 genuine analyses, perform an explicit **SCALE / HOLD / PIVOT** review before materially expanding acquisition, monetisation or product scope.

## Operating loop
Measure → Diagnose → Research → Prioritise → Build → Test → Commit → Deploy Preview/Canary → Verify → Deploy Production → Measure.

Treat genuine acquisition and conversion evidence as authoritative. QA, demo, Playwright, release-probe, smoke-test and other synthetic activity must never count as traction. Never invent unavailable metrics or backfill uncertain historical events.

## Funnel priority
Optimise the earliest adequately sampled constraint in this order:
1. landing / search source → checker start
2. checker start → quote upload or manual entry
3. quote submission → genuine analysis
4. genuine analysis → second quote / comparison
5. genuine analysis → Decision Case
6. Decision Case → installer questions / share
7. share open → recipient checker start
8. genuine analysis → meaningful commercial / outbound action
9. qualified non-brand organic acquisition quality and sustained growth

Do not churn production when the clean sample is below the configured decision threshold. Build only changes tied to a measurable hypothesis.

## Acquisition rule
Research current search intent and competition before adding acquisition pages. Prefer improving substantive existing decision pages, metadata, schema, internal linking and crawl/index discoverability over thin programmatic SEO. Do not treat rankings, impressions or visits as validation unless they lead to qualified non-brand sessions and genuine product use.

## Product and independence guardrails
Home Quote Check is an independent evidence/comparison product. Do not turn nominal kW, installer claims, automated extraction, MCS references or BUS references into system-design certification, installer certification or grant-eligibility determinations. Do not materially expand personal-data collection merely to improve conversion. Keep installer-finding/referral actions clearly separated from quote analysis and never alter comparison results for commercial reasons.

## Commercial evidence
Meaningful commercial/outbound actions are supporting validation evidence, not permission to optimise prematurely for revenue. One-off paid products, checkout experiments or referral economics may be tested only when supported by genuine user behaviour and when they preserve independence, privacy and the product guardrails above.

## Current deployment constraint
Do not deploy through AppDeploy. The production frontend is served by Cloudflare Worker `hqc-production` on `homequotecheck.co.uk` / `www.homequotecheck.co.uk`, with same-origin `/api/*` proxying to the existing backend. Use the established GitHub/Cloudflare preview and canary path before material production releases; preserve the current custom-domain routing and do not recreate the retired AppDeploy DNS CNAMEs.
