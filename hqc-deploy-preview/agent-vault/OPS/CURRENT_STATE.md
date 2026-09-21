# Current state

Updated: 2026-09-21 20:45 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month validation window.

## Evidence refreshed
- Revenue: no newer authoritative Stripe object set was available in this execution context; latest verified live `Home Quote Check` PaymentIntent evidence remains 0 objects, `has_more=false`. Genuine production revenue remains **£0 / £1,000 monthly**, cumulative validation revenue **£0 / £100**, paying customers **0**. Fresh payment evidence is null rather than inferred.
- Durable funnel/acquisition: no newer parsed authoritative production snapshot was available; latest settled evidence remains **56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses**, with 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains **40 → 16 → 5 → 5**.
- Search: no newer authoritative Search Console dataset was available; latest through 2026-09-19 remains **0 clicks, 4 impressions, 0% CTR, average position 8.07**.
- Production presentation: fresh rendered production evidence remains unavailable in this execution context. Owner-provided iPhone evidence still establishes the P0 unstyled/raw result regression until verified recovery supersedes it.
- Release-safety verification: run `35640563855` for `82e79256...` again failed safely before deployment. Both 9/9 Solar evidence/extraction and 9/9 routing/isolation suites passed. The generated no-assets config worked, but because it was written to `/tmp`, Wrangler resolved relative `main = "worker-entry.js"` against `/tmp` and could not find the entry point. Production was not touched by this run.
- COMPLETED correction: commit `be3c4ef823ab0bae3afdef806d859e2aaa59c25b` now writes `wrangler.router-only.toml` inside `hqc-deploy-preview`, asserts no `[assets]` section and asserts `worker-entry.js` exists before deployment. This preserves relative entry-point resolution while keeping backend releases asset-free. Workflow registration/completion was not yet available at evidence cutoff.

## Commercial diagnosis
Production visual integrity remains P0 because an unstyled result destroys trust at the decision point and can suppress the already-constrained first-purchase funnel. Acquisition remains the underlying commercial bottleneck, but incremental traffic should not be pushed into a visibly broken result journey. Solar public expansion remains paused until the live Heat Pump presentation is restored and verified.

## Current milestone
Restore verified production presentation, then first genuine £4.99 Decision Pack purchase.

## Product strategy / Solar-Battery progress
- Technology-aware request isolation is LIVE in production from the earlier verified release: Heat Pump remains available and explicit Solar/Battery is rejected rather than leaking to Heat Pump.
- Representative Solar evidence/extraction remains 9/9 green; routing/isolation remains 9/9 green.
- Public Solar analysis remains gated; P0 frontend recovery precedes further public exposure.

## Active workstreams
1. P0 frontend recovery: restore a known-good production asset bundle through the UI release path and perform rendered mobile/desktop verification.
2. Release safety: verify commit `be3c4ef...` workflow; backend/router releases must neither require nor mutate static assets.
3. Revenue/funnel monitoring continues independently; do not send incremental acquisition into a visibly broken result journey.
4. Solar/Battery engineering may continue non-public, but no public CTA until P0 recovery plus existing Solar gates pass.
5. Paid boundary remains £4.99; no evidence supports a pricing change.

## Expected revenue impact
Restoring visual integrity remains the highest-probability immediate conversion protection. Correctly separating backend releases from frontend assets prevents recurrence and lets Solar/analysis work continue without risking the live customer presentation.

## Next actions
1. Verify the router-only workflow for `be3c4ef...` completes green and demonstrably deploys without static assets.
2. Recover the last known-good frontend using the dedicated UI release path; require rendered iPhone and desktop checks before production per `SOPS/SHIP_CHANGE.md`.
3. Recheck production result page, navigation, progress indicator, buttons, typography, overflow and stylesheet loading after recovery.
4. Refresh authoritative Stripe/funnel evidence; first genuine purchase remains the commercial milestone after P0 recovery.
5. Resume Solar public gates only after Heat Pump production presentation is verified healthy.

## Durable learning
No new durable customer/product lesson this run. The Wrangler config-path resolution issue is engineering release detail and remains in the run log rather than durable customer/product learning.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy for deployment. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
