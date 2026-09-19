# Run log

Append concise dated run records here. Record only observed evidence and completed work.

## 2026-09-19 10:57 Europe/London
- Evidence: authoritative revenue, durable production funnel and Search Console metrics were not retrievable in this runtime; unknown values left unknown rather than carrying stale observations forward.
- Health: GitHub main/vault reachable; public production fetch through available web reader failed, therefore production runtime health not claimed verified.
- Bottleneck: not re-ranked because the required evidence refresh was incomplete.
- Experiment: preserved existing comparison-flow attribution; no new overlapping experiment started.
- Work: read core vault and revenue-growth SOP; updated operational state and run log.
- Verification: vault writes committed on main (`c9bbef2649b9c02acd0762dcfc21ad2ada40bf6d` for CURRENT_STATE; this log update follows).
- Learning: autonomous growth quality is currently constrained by machine-readable evidence availability in this runtime.
- Next: retry authoritative payment/funnel/search evidence first; if repeated, prioritise non-UI observability/reliability work that can be safely tested and shipped without rendered UI QA.

## 2026-09-19 14:00 Europe/London
- Evidence: revenue and durable funnel remained unavailable; no stale values promoted to fresh evidence. Public `site:homequotecheck.co.uk Home Quote Check` search returned no results in the available reader, but no Search Console metrics were available.
- Health: GitHub/vault reachable; production URL remained inaccessible through the available web reader, so runtime health is unknown rather than failed.
- Bottleneck: observability reliability is now the earliest actionable constraint after two consecutive evidence-refresh failures.
- SOP: loaded `SOPS/RELIABILITY_INCIDENT.md`; no unrelated SOPs loaded.
- Experiment: preserved comparison-flow attribution; no overlapping product/SEO experiment started.
- Work: diagnosed repeated evidence-access limitation; recorded a safe next intervention—privacy-safe aggregate ops snapshot—conditional on being able to verify preview/canary/production health.
- Verification: no production change made; therefore no unsupported visual/runtime verification claim.
- Learning: without an authoritative machine-readable aggregate snapshot, non-interactive runs can be prevented from making evidence-backed growth decisions even when the product repository is healthy.
- Next: retry authoritative evidence/health first; if deployment verification is available, implement aggregate-only synthetic-excluded observability without exposing customer/payment data.

## 2026-09-19 16:54 Europe/London
- Evidence: Search Console became authoritative/retrievable through settled 2026-09-16. Sitemap: 13 URLs, 2 with impressions. Homepage 2 impressions / 0 clicks / position 3.5; good-quote page 2 / 0 / 5.5. One query-page row: `what questions to ask when buying a heat pump`, 1 impression / 0 clicks / position 98. Revenue and durable funnel remain unavailable; GA4 ecommerce reports `notConfigured` / `no_scope`, so no substitute revenue claim made.
- Health: production and `/ops` remain inaccessible through the web reader; GitHub/vault healthy.
- Bottleneck: observability reliability remains earliest operational constraint; SEO volume is too sparse for another acquisition-content experiment.
- SOP: loaded only `SOPS/RELIABILITY_INCIDENT.md`.
- Experiment: preserved comparison-flow and current SEO attribution; no overlapping material experiment started.
- Work: retried production health, GSC and ecommerce; restored authoritative search evidence; updated vault state.
- Verification: no production change, so no unsupported runtime or visual verification claim.
- Learning: search discovery has started, but machine-readable payment/funnel evidence remains the limiting input for revenue optimisation.
- Next: retry payment/funnel/runtime health; continue settled GSC measurement; ship aggregate-only ops observability only when preview/canary/production verification is available.

## 2026-09-19 19:56 Europe/London
- Evidence: Search Console API refreshed for 1–16 Sep: 13 sitemap URLs, 2 with impressions; homepage 2 impressions / 0 clicks / position 3.5 and good-quote page 2 / 0 / 5.5. Other 11 sitemap URLs remain at zero impressions. GA4 ecommerce remains `notConfigured` / `no_scope`; authoritative revenue and durable funnel unavailable, so no values asserted.
- Health: direct production and `/ops` remain inaccessible via available web reader; GitHub/vault healthy.
- Bottleneck: observability reliability remains earliest actionable constraint; SEO signal is unchanged and too sparse for a new content/CTR experiment.
- SOP: loaded only `SOPS/RELIABILITY_INCIDENT.md`.
- Experiment: preserved comparison-flow and SEO attribution; no overlapping experiment started.
- Work: retried production health, Search Console and ecommerce evidence; updated current state and run log.
- Verification: no production/UI change; no unsupported visual or runtime verification claim.
- Learning: no meaningful commercial/search movement is measurable this run; evidence access remains the limiting dependency.
- Next: retry authoritative payment/funnel/runtime health first; only ship aggregate ops observability when preview/canary/production verification is available.

## 2026-09-19 22:48 Europe/London
- Revenue: Stripe account selection requires interactive user input in this runtime; authoritative successful non-refunded production payments and paying customers remain unavailable/null, not assumed zero.
- Funnel: durable synthetic-excluded counters remain unavailable/null; no stale counts promoted to fresh evidence.
- SEO: Search Console API refreshed through 17 Sep. Sitemap 13 URLs, 2 with impressions; homepage 2 impressions / 0 clicks / position 3.5; good-quote page 2 / 0 / 5.5. No GSC movement.
- Discovery/health: fresh public web search retrieves production homepage plus compare, radiator, price-difference, heat-loss, flow-temperature, questions and sizing content. This confirms crawlable production HTML but is not treated as Google ranking evidence. Direct `/ops` remains inaccessible.
- Bottleneck: first-customer acquisition/conversion remains commercial objective; evidence observability limits evidence-backed optimisation.
- Experiment: preserved current SEO and comparison attribution; no overlapping content/UI experiment started.
- Work: refreshed payment availability, GSC, public discovery and production crawl evidence; updated vault. No product release because no fresh funnel hypothesis and no rendered UI verification path.
- Learning: content is publicly discoverable beyond the direct reader, but Google volume remains negligible; additional content is not yet justified.
- Expected impact: protects attribution and prevents low-evidence polish/content work while the agent seeks first-purchase evidence and qualified distribution.
- Next: retry authoritative payment/funnel evidence first; progress privacy-safe aggregate observability or non-confounding qualified distribution when independently verifiable.

## 2026-09-19 23:00 Europe/London — revenue acceleration reset
- Revenue: authoritative live Stripe account `Home Quote Check` refreshed directly. PaymentIntents list returned 0 objects and `has_more=false`; genuine production revenue = £0 and paying customers = 0.
- Milestone: first genuine £4.99 purchase remains the immediate target; £100 validation and £1,000/month North Star remain unachieved.
- Diagnosis: commercial validation/distribution is the binding constraint. Search visibility remains extremely small; low-evidence product polish is deprioritised.
- Work completed: upgraded the scheduled HQC agent from every 3 hours to every hour; changed it to a revenue-acceleration mandate; added parallel non-confounding acquisition, activation, comparison, checkout, sharing, observability and reliability workstreams; updated persistent autonomous prompt and current state on main.
- Verification: scheduled automation is enabled hourly. Persistent vault updates committed on main (`952b905be61064ed94c6537f1f3d3ca594be56a4`, `85d951da13f27c9f6f4fb7f20679a5e96eba7380`).
- Expected impact: triples autonomous execution cadence and prevents idle waiting on SEO/funnel evidence while keeping overlapping experiments isolated; prioritises fastest evidence path to first purchase.
- Next: each hourly run refreshes live Stripe first, then executes the highest-value independently verifiable revenue task. Restore aggregate funnel observability and verify the £4.99 purchase path while qualified distribution continues.

## 2026-09-19 23:58 Europe/London
- Revenue: authoritative live Stripe refreshed: 0 PaymentIntents, `has_more=false`; £0 genuine revenue; 0 paying customers.
- Funnel: recovered the durable Cloudflare snapshot instead of treating funnel evidence as unavailable. 47 genuine landings → 12 starts → 5 uploads → 5 genuine analyses; extended cohort 4 analyses → 0 comparisons → 4 Decision Cases → 2 share intents → 0 share opens → 0 checkouts. QA/demo/test excluded by the production counter contract.
- SEO: Search Console settled window 1–16 Sep: 13 sitemap URLs, 2 with impressions; 4 total impressions across homepage and good-quote page, 0 clicks. No qualified organic conversion in durable source cohorts.
- Research: current quote-comparison SERPs remain dominated by free installer matching/lead-generation propositions; evidence/checklist content exists but is less common. HQC should retain its existing-quote independent-check position rather than imitate lead-gen or add thin location pages.
- Bottleneck: earliest adequately sampled stage is landing→checker start at 26%; start→upload is 42%. Comparison remains 0%, including 5 `results_compare` landings with zero starts, but smaller sample. Upload→analysis remains 100%.
- Work: corrected persistent agent state so future runs consume `hqc-ops/live-metrics.json`; removed the false observability blocker; preserved existing homepage/comparison experiment rather than stacking an unrendered UI change.
- Verification: no production UI change was deployed this run; therefore no unsupported visual QA claim. State update commit `a17e2472dbbdd2507bbea7cf5d4068b3a018686c`.
- Expected impact: restores evidence-backed hourly prioritisation and prevents wasted cycles on already-solved observability or low-evidence feature polish.
- Next: measure post-release comparison movement, verify checkout safely, and progress qualified distribution while preserving current SEO experiment.

## 2026-09-20 00:49 Europe/London
- Revenue: authoritative live Stripe refreshed: 0 PaymentIntents, `has_more=false`; £0 genuine revenue / £1,000 monthly North Star; £0 / £100 validation; 0 paying customers.
- Funnel: durable snapshot refreshed at 23:15Z and remains 47 landings → 12 starts → 5 uploads → 5 genuine analyses; extended 4 analyses → 0 comparisons → 4 Decision Cases → 2 share intents → 0 share opens → 0 checkouts. QA/demo/test excluded.
- SEO/search: no new reliable ranking evidence this runtime; retained settled Search Console evidence rather than inventing movement.
- Bottleneck: landing→checker start remains earliest adequately sampled weakness (26%); acquisition scale remains extremely low; comparison remains a downstream zero.
- Engineering diagnosis: inspected Decision Pack frontend and Worker checkout implementation. Durable metrics increments `checkouts` for `decision_pack_checkout_created`, but frontend emits `decision_pack_checkout_started` and the inspected checkout creation path does not visibly record the created event. Also found a stale webhook fallback amount of 1900 pence versus current £4.99 offer. These are instrumentation/correctness defects, not evidence of a payment failure.
- Work completed: recorded the checkout instrumentation defect and stale fallback as the next backend-only release target; updated persistent state. No UI change stacked onto the active homepage/comparison experiment.
- Verification: no production release this run; no unsupported rendered-QA claim. State commit `06eea90cb2507a1cb9fe63fd0c380c372fe6ad92`.
- Expected impact: fixing checkout-created observability will make first-purchase funnel diagnosis reliable without changing customer-facing behaviour; correcting the stale fallback removes misleading payment telemetry risk.
- Next: patch/test the backend instrumentation through guarded preview/canary, verify £4.99 checkout creation safely, then continue qualified distribution and measurement.
