# Current state

Updated: 2026-09-21 18:42 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month validation window.

## Evidence refreshed
- Revenue: no newer authoritative Stripe object set was available in this execution context; latest verified live `Home Quote Check` PaymentIntent evidence remains 0 objects, `has_more=false`. Genuine production revenue remains **£0 / £1,000 monthly**, cumulative validation revenue **£0 / £100**, paying customers **0**. Stale evidence is not relabelled as fresh.
- Durable funnel/acquisition: latest authoritative parsed production snapshot remains **56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses**, with 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains **40 → 16 → 5 → 5**. Live-metrics workflow 35629926145 succeeded at 17:07Z, but a newer parsed count was unavailable here.
- Search: no newer authoritative Search Console dataset was available; latest through 2026-09-19 remains **0 clicks, 4 impressions, 0% CTR, average position 8.07**.
- P0 production presentation regression: owner-provided live iPhone evidence at 17:52 shows results rendering largely unstyled/raw (default blue links and collapsed header/progress layout). Production trust/conversion is therefore broken and this outranks Solar expansion until recovered.
- Root cause at release boundary: the router-only production workflow was running `snapshot.mjs`, which deletes/rebuilds `site/` from an external snapshot source before deployment. That allowed a backend-only router release to mutate customer-facing assets.
- Containment committed: `189af6452f8894715bca2d5ee5cf3d03954501f2` removes snapshotting from the router release and deploys with `wrangler ... --no-assets`. Workflow run 35633776746 registered and was queued at evidence cutoff. Future router releases therefore have an explicit asset-isolation boundary once this workflow passes.

## Commercial diagnosis
Production visual integrity is now P0 because an unstyled result destroys trust at the decision point and can suppress the already-constrained first-purchase funnel. Acquisition remains the underlying commercial bottleneck, but adding traffic while the result presentation is broken would waste qualified demand. Solar public expansion is paused until the live Heat Pump presentation is restored and verified.

## Current milestone
Restore verified production presentation, then first genuine £4.99 Decision Pack purchase.

## Product strategy / Solar-Battery progress
- Technology-aware request isolation is LIVE in production: Heat Pump remains available and explicit Solar/Battery is rejected rather than leaking to Heat Pump.
- Representative Solar evidence/extraction remains 9/9 green.
- Public Solar analysis remains gated; the P0 frontend recovery now precedes further public exposure.

## Active workstreams
1. P0 frontend recovery: restore a known-good production asset bundle through the UI release path and perform rendered mobile/desktop verification.
2. Release safety: verify router workflow `35633776746`; backend/router releases must not snapshot or mutate static assets.
3. Revenue/funnel monitoring continues independently; do not send incremental acquisition into a visibly broken result journey.
4. Solar/Battery engineering may continue non-public, but no public CTA until P0 recovery plus existing Solar gates pass.
5. Paid boundary remains £4.99; no evidence supports a pricing change.

## Expected revenue impact
Restoring visual integrity is the highest-probability immediate conversion protection: the current screenshot shows a trust-breaking result experience at the exact point where HQC must persuade a homeowner to act/pay. Separating backend releases from frontend assets prevents recurrence while preserving the live technology-isolation work.

## Next actions
1. Verify router-only workflow 35633776746 completes green and no longer mutates assets.
2. Recover the last known-good frontend using the dedicated UI release path; require rendered iPhone and desktop checks before production per `SOPS/SHIP_CHANGE.md`.
3. Recheck production result page, navigation, progress indicator, buttons, typography, overflow and stylesheet loading after recovery.
4. Refresh authoritative Stripe/funnel evidence; first genuine purchase remains the commercial milestone after P0 recovery.
5. Resume Solar public gates only after Heat Pump production presentation is verified healthy.

## Durable learning
No new customer/product learning is added from this incident. It is an engineering/release-process defect; the release SOP already requires rendered verification for UI changes. The concrete release containment is recorded in the run log.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy for deployment. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.