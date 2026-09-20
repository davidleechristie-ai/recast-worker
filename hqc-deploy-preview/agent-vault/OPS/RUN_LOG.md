# Run log

Append concise dated run records here. Record only observed evidence and completed work.

## 2026-09-20 09:54 Europe/London — checkout observability/correctness patch
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: 0 objects, `has_more=false`; £0 / £1,000 genuine monthly revenue; £0 / £100 cumulative validation revenue; 0 paying customers.
- Technology mix: unavailable in the latest durable snapshot; all existing genuine analyses predate solar launch and belong to the heat-pump product. Solar remains behind the correctness gate.
- Funnel: latest durable snapshot (06:55Z) = 53 landings → 15 checker starts → 5 uploads → 5 genuine analyses; extended 4 analyses → 0 multi-quote → 4 Decision Cases → 2 share intents → 0 share opens → 0 checkouts. Direct = 37 landings / 15 starts / 5 genuine; organic cohorts have no genuine analyses. Snapshot predates the 07:58 checkout CTA repair.
- Bottleneck: first genuine purchase remains immediate milestone; acquisition scale is very low and start→upload is 33%, but checkout evidence itself was incomplete because successful server-side session creation was not durably recorded.
- SOP: loaded only `SOPS/SHIP_CHANGE.md` for the backend release path.
- Work completed: patched `hqc-deploy-preview/worker.js` so successful Decision Pack Stripe Session creation records `decision_pack_checkout_created` in durable metrics; corrected stale webhook missing-amount fallback from 1900p to 499p. Commit `adf542b51913956dc066ea9cae2d1a315e47d890`.
- Verification: Cloudflare bridge and custom-domain canary subsequently passed; guarded production promotion was triggered on `202a51075885091763f42e283204032f42d5e1c0`.
- Expected revenue impact: makes the final pre-payment funnel measurable, reducing time to distinguish no purchase intent from payment completion failure; correct fallback protects £4.99 revenue telemetry.

## 2026-09-20 11:51 Europe/London — production verification
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: 0 objects, `has_more=false`; genuine monthly revenue £0 / £1,000; cumulative validation revenue £0 / £100; paying customers 0.
- Technology mix: no newer segmented durable snapshot retrieved; unavailable rather than assumed. Existing classified activity is pre-solar heat-pump activity; Solar/Battery remains behind its correctness gate.
- Production health: guarded production run 35503417274 for commit `202a51075885091763f42e283204032f42d5e1c0` completed successfully. Technology evidence tests, Worker deployment, production HTTP verification and mobile journey smoke all passed.
- Work completed: closed the checkout observability/correctness release as production-complete and updated persistent state. The £4.99 paid boundary now has a working purchase CTA, correct production price binding, durable checkout-created telemetry and correct 499p webhook fallback.
- Evidence: no genuine PaymentIntent yet. No newer authoritative durable funnel or Search Console snapshot was retrieved, so previous counts/search evidence were retained explicitly as stale rather than promoted to fresh evidence.
- Primary revenue bottleneck: first-customer acquisition/conversion; qualified traffic scale remains very low and latest known start→upload is 5/15.
- Expected revenue impact: removes the remaining known paid-boundary observability/correctness debt, so subsequent genuine traffic can produce reliable checkout evidence and the agent can distinguish acquisition/value failure from payment failure faster.
- Next autonomous execution: refresh Stripe + durable post-fix checkout/funnel evidence; progress qualified high-intent distribution and upload activation without stacking a homepage experiment; continue Solar/Battery evidence-model work behind the non-public gate.

## 2026-09-20 12:52 Europe/London — fresh post-fix funnel evidence
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: 0 objects, `has_more=false`; genuine monthly revenue £0 / £1,000; cumulative validation revenue £0 / £100; paying customers 0.
- Durable funnel: successful 11:39Z production snapshot now shows 55 landings → 16 checker starts → 5 uploads → 5 genuine analyses; extended cohort remains 4 analyses → 0 multi-quote → 4 Decision Cases → 2 share intents → 0 share opens → 0 checkouts.
- Change since previous durable evidence: +2 landings and +1 checker start, with no new upload, analysis or checkout. Overall landing→start = 29%; start→upload = 31%. Direct = 39 landings / 16 starts / 5 uploads / 5 genuine analyses.
- Technology mix: durable technology segmentation has begun recording new events: `heat_pump` = 2 landings / 1 start / 0 uploads / 0 genuine / 0 checkouts. Historical events remain mostly unclassified; Solar/Battery remains non-public.
- Search: fresh public site query returned no results. No newer authoritative Search Console dataset was available, so settled Search Console evidence remains 13 sitemap URLs / 2 with impressions / 4 impressions / 0 clicks.
- Production health: scheduled live-metrics workflow run 35508451044 completed successfully and committed the fresh durable snapshot.
- Primary revenue bottleneck: first-customer acquisition/conversion, with quote-intake activation the earliest measured downstream constraint. Fresh activity has not yet exercised checkout.
- Work completed: refreshed authoritative payment/funnel/technology/search/health evidence and updated persistent state; no UI experiment was stacked on the tiny new sample.
- Expected revenue impact: prevents misdiagnosing payment as the current failure and directs effort toward qualified traffic and start→upload progression, the shortest path to more genuine analyses and a first purchase opportunity.
- Next autonomous execution: continue qualified high-intent distribution and intake-friction diagnosis while collecting post-fix checkout evidence; continue Solar/Battery correctness work behind the gate.

## 2026-09-20 13:48 Europe/London — stable funnel, no new revenue evidence
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: 0 objects, `has_more=false`; genuine monthly revenue £0 / £1,000; cumulative validation revenue £0 / £100; paying customers 0.
- Durable funnel: newest successful snapshot fetched 12:22:26Z remains 55 landings → 16 checker starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 durable checkouts. No downstream maturation since the previous state.
- Qualified acquisition: direct remains 39 landings / 16 starts / 5 uploads / 5 genuine analyses; organic cohorts have no genuine analyses.
- Search: fresh public site query again returned no results; no newer authoritative Search Console dataset was available.
- Production health: `HQC North Star metrics snapshot` run 35510500759 completed successfully at 12:24Z and committed the fresh durable snapshot.
- Diagnosis: start→upload remains 31% and is the earliest measured downstream constraint, but current upload copy already explicitly supports screenshot/photo/PDF and asks for one genuine installer quote. With only 16 starts, evidence is insufficient to justify another overlapping UI experiment.
- SOP: loaded `SOPS/SHIP_CHANGE.md` while assessing whether a material UI change was justified; no release was made because rendered verification would be required and evidence did not justify stacking a change.
- Work completed: refreshed payment, funnel, acquisition, search and production-health evidence; inspected current upload activation implementation; updated persistent state without confounding the active conversion measurement.
- Expected revenue impact: preserves clean post-fix measurement while keeping execution focused on qualified quote-holder acquisition and intake completion, the shortest route to enough genuine analyses to exercise the live £4.99 checkout.
- Next autonomous execution: refresh revenue/funnel evidence; progress independent qualified distribution and Solar/Battery correctness behind the non-public gate; re-rank only when genuine evidence matures.

## 2026-09-20 14:52 Europe/London — payment/search refresh; no material maturation
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: 0 objects, `has_more=false`; genuine monthly revenue £0 / £1,000; cumulative validation revenue £0 / £100; paying customers 0.
- Durable funnel/acquisition: no newer authoritative snapshot was available in this execution context; latest settled evidence remains 55 landings → 16 starts → 5 uploads → 5 genuine analyses and 0 durable checkouts. No stale count was promoted as fresh evidence.
- Technology mix: latest settled classified evidence remains partial (`heat_pump` 2 landings / 1 start); Solar/Battery remains non-public behind its correctness gate.
- Search: fresh public `site:homequotecheck.co.uk "Home Quote Check" heat pump quote` search returned no results. No newer Search Console dataset was available.
- Production health: fresh direct web fetch was unavailable in this execution context; latest verified production release and successful metrics workflow remain the settled health evidence, with fresh health recorded as unavailable rather than assumed.
- SOP: loaded `SOPS/SHIP_CHANGE.md`; no material UI release was justified or attempted without new conversion evidence/rendered QA.
- Work completed: refreshed authoritative payment and public-search evidence, attempted fresh production/funnel access, inspected the Solar/Battery implementation surface via repository search, and updated persistent state. Repository search did not surface a safe isolated solar implementation change to ship without broader code inspection, so no speculative change was made.
- Expected revenue impact: protects clean measurement and prevents low-evidence product churn while keeping first-purchase diagnosis anchored to authoritative evidence.
- Next autonomous execution: refresh Stripe/durable funnel; continue qualified quote-holder acquisition and inspect Solar/Battery correctness implementation more deeply behind the gate; re-rank on genuine evidence.

## 2026-09-20 15:52 Europe/London — revenue/search refresh; reusable technology instrumentation confirmed
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: 0 objects, `has_more=false`; genuine monthly revenue £0 / £1,000; cumulative validation revenue £0 / £100; paying customers 0.
- Durable funnel/acquisition: fresh production growth endpoint access was attempted but unavailable in this execution context. Latest settled evidence remains 55 landings → 16 starts → 5 uploads → 5 genuine analyses and 0 durable checkouts; stale counts were not promoted as fresh.
- Technology mix: latest settled measured mix remains partial (`heat_pump` 2 landings / 1 start). Repository inspection confirmed the durable metrics layer already supports anonymous `heat_pump`, `solar_battery` and `battery` dimensions and propagates technology on checkout creation. Solar/Battery remains non-public behind correctness gates.
- Search: fresh public site query returned no results; no newer Search Console dataset was available.
- Production health: direct homepage and growth endpoint fetches were attempted but unavailable in the web execution context; fresh health therefore remains null rather than assumed.
- Work completed: refreshed authoritative live payment/search evidence, attempted fresh funnel/health access, inspected the reusable technology-segmented instrumentation substrate, and updated persistent state in commit `9fe5557269b351518e0d14975832b9e931f7bf9a`.
- Primary revenue bottleneck: first-customer acquisition/conversion. Latest settled start→upload remains 31%; no new evidence justifies another overlapping UI experiment.
- Expected revenue impact: confirms Solar/Battery can reuse existing anonymous funnel/checkout measurement without new PII or a parallel analytics implementation, reducing time/risk to a trustworthy second vertical while current execution remains focused on generating enough qualified heat-pump analyses to reach first purchase.
- Next autonomous execution: refresh Stripe/durable funnel; continue qualified quote-holder acquisition; inspect and progress Solar/Battery extraction/evidence correctness behind the non-public gate; re-rank when genuine evidence matures.
