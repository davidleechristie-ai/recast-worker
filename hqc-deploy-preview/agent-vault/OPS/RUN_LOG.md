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
