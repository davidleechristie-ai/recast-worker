# Run log

Append concise dated run records here. Record only observed evidence and completed work.

## 2026-09-21 19:45 Europe/London — router asset isolation corrected after safe pre-deploy failure
- Revenue: no newer authoritative Stripe object set was available; latest verified genuine monthly revenue remains £0 / £1,000, validation revenue £0 / £100, paying customers 0. Missing fresh evidence remains null.
- Funnel/acquisition: no newer parsed authoritative snapshot was available; latest settled production evidence remains 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 durable checkouts.
- Production health: direct HQC-domain access was unavailable from this execution environment. Owner-provided iPhone evidence therefore remains the latest authoritative presentation evidence and the P0 unstyled/raw result regression remains open.
- RELEASE EVIDENCE: containment run `35633776746` completed failure. Solar evidence/extraction tests passed 9/9 and technology/request-routing tests passed 9/9. Wrangler failed before deployment because `--no-assets` did not prevent validation of the tracked `[assets] directory = "./site"` configuration and `site/` is absent from the clean repository checkout. Production was not changed by this failed run.
- COMPLETED: commit `82e79256a39056b91c9da959c8aa1621ceb6f149` replaces the ineffective `--no-assets` approach with a generated temporary production Wrangler config that removes the `[assets]` section entirely before deployment. The workflow explicitly asserts the temporary config contains no `[assets]` section. This retains production Worker/routes/vars/Durable Object configuration while preventing backend releases from requiring, snapshotting or uploading frontend assets.
- A workflow run for `82e79256...` had not registered at evidence cutoff, so successful deployment is not claimed.
- Solar public expansion remains paused behind P0 frontend recovery. Non-public Solar engineering can continue independently once release containment is verified.
- NEXT: verify `82e79256...` router workflow; recover known-good frontend through rendered UI release path; verify mobile+desktop production presentation; then resume Solar public gates and qualified acquisition.

## 2026-09-21 18:42 Europe/London — P0 frontend regression contained at release boundary
- Revenue: no newer authoritative Stripe object set was available in this execution context; latest verified genuine monthly revenue remains £0 / £1,000, validation revenue £0 / £100, paying customers 0. Missing fresh evidence remains null.
- Funnel/acquisition: latest authoritative production snapshot remains 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 durable checkouts. Latest live-metrics workflow run 35629926145 completed successfully at 17:07Z, but no parsed newer counts were available here.
- P0 evidence: owner-provided live iPhone screenshot at 17:52 showed production results rendered largely as unstyled/raw HTML (default blue links, collapsed navigation/progress layout). This is a production trust/conversion regression and outranks Solar expansion/acquisition until recovered.
- Root cause found in release architecture: `.github/workflows/hqc-production-router-release.yml` ran `snapshot.mjs` immediately before a supposedly router-only production deploy. `snapshot.mjs` deletes/rebuilds `site/` from an external snapshot source and therefore can mutate customer-facing assets during a backend-only release. This violated the intended non-UI release boundary.
- COMPLETED: commit `189af6452f8894715bca2d5ee5cf3d03954501f2` removes the frontend snapshot step from the router release and attempted to deploy the Worker with `wrangler ... --no-assets`, so future router releases would not replace static frontend assets if supported. Subsequent evidence showed Wrangler still validates the configured asset directory; superseded by the 19:45 correction above.
- Recovery limitation: the repository does not persist the generated `site/` snapshot, and this execution context has no rendered-browser access to reconstruct/visually verify a known-good production asset bundle safely. Per SHIP_CHANGE, no unverified UI deployment was attempted. Existing broken production assets therefore still require a verified frontend recovery release.
- Solar/Battery public expansion is paused behind this P0 until production presentation is restored and rendered mobile/desktop verification passes.

## 2026-09-21 17:42 Europe/London — production technology boundary live; verifier corrected
- Revenue: no newer authoritative Stripe object set was available; latest verified genuine monthly revenue remains £0 / £1,000, validation revenue £0 / £100, paying customers 0. Missing fresh evidence remains null.
- Funnel/acquisition: latest authoritative production snapshot remains 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 durable checkouts. No newer parsed snapshot was available.
- Search: latest authoritative Search Console evidence remains 0 clicks / 4 impressions through 2026-09-19; no newer dataset was available.
- PRODUCTION EVIDENCE: release run `35620826072` passed both 9/9 Solar evidence/extraction and 9/9 technology/request-routing suites and deployed `hqc-production` version `1c0821fd-1864-4ae0-90e8-f899cae8bc87`. Durable Object `HqcMetrics` remained bound. Production default Heat Pump health returned HTTP 200.
- Solar isolation worked: explicit `x-hqc-technology: solar_battery` returned HTTP 409 with `technology_analysis_not_ready`, so Solar did not fall through to Heat Pump. The job failed only because its assertion expected 503.
- COMPLETED: corrected the release verifier to the router's intentional 409 contract in commit `bf3dd66d0fb20df07748960c2655afbedce272ca`.
- Public status: non-UI technology isolation boundary is LIVE; customer-facing Solar remains gated because no executable dedicated Solar analysis endpoint is configured and end-to-end/rendered gates remain incomplete.
- Primary revenue bottleneck remains first-customer acquisition/activation once production visual integrity is healthy.

## Earlier runs
Earlier detailed run history remains available in repository history. The current state and durable learnings carry forward the authoritative operating context.