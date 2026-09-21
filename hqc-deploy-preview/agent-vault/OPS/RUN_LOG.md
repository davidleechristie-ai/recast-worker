# Run log

Append concise dated run records here. Record only observed evidence and completed work.

## 2026-09-21 21:46 Europe/London — backend release isolation verified in production
- Revenue/search/funnel: no newer authoritative Stripe, parsed durable-funnel or Search Console dataset was available; latest verified revenue remains £0 / £1,000 monthly, validation revenue £0 / £100, paying customers 0; latest settled funnel remains 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses and 0 durable checkouts. Missing fresh evidence remains null.
- Production presentation: no fresh rendered evidence supersedes the owner-provided broken iPhone result; P0 frontend recovery remains open.
- RELEASE EVIDENCE: run `35646864766` for commit `be3c4ef823ab0bae3afdef806d859e2aaa59c25b` completed success. Solar evidence/extraction passed 9/9; technology/request routing passed 9/9.
- COMPLETED: router-only config was generated inside `hqc-deploy-preview`, contained no `[assets]` section, resolved `worker-entry.js`, and deployed production version `fc1888f3-f19f-4b08-aec3-a4957b3fd788`. Wrangler reported only Worker/Durable Object/environment bindings and no static asset upload. Live verification passed Heat Pump/default health 200, explicit Solar gate 409 with `technology_analysis_not_ready`, and durable metrics 200.
- DECISION: backend release recurrence path is now contained and verified. Do not treat this as frontend recovery; the public presentation remains P0 until rendered mobile/desktop evidence proves restoration.
- Solar public expansion remains paused behind P0 frontend recovery; non-public engineering may continue independently.
- NEXT: recover a known-good frontend through the dedicated UI release path with rendered iPhone + desktop verification, then resume qualified acquisition and Solar public gates.

## 2026-09-21 20:45 Europe/London — router-only deploy path corrected after second safe pre-deploy failure
- Revenue/search/funnel: no newer authoritative Stripe, parsed durable-funnel or Search Console dataset was available; latest verified revenue remains £0 / £1,000 monthly, validation revenue £0 / £100, paying customers 0; latest settled funnel remains 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses and 0 durable checkouts. Missing fresh evidence remains null.
- Production presentation: no fresh rendered evidence supersedes the owner-provided broken iPhone result; P0 frontend recovery remains open.
- RELEASE EVIDENCE: run `35640563855` for commit `82e79256...` passed 9/9 Solar evidence/extraction and 9/9 routing/isolation tests. The generated config correctly omitted `[assets]`, but deployment failed before touching production because `/tmp/hqc-router-production.toml` caused Wrangler to resolve relative `main = "worker-entry.js"` from `/tmp`; entry point not found.
- COMPLETED: commit `be3c4ef823ab0bae3afdef806d859e2aaa59c25b` writes the router-only config inside `hqc-deploy-preview` instead, retaining correct relative entry-point resolution while still omitting assets. It also asserts `worker-entry.js` exists before deploy. No successful release is claimed until the workflow completes.
- Solar public expansion remains paused behind P0 frontend recovery; backend isolation work remains non-confounding.
- NEXT: verify the corrected router-only workflow, then recover and rendered-verify the known-good frontend before resuming acquisition/Solar public gates.

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

## Earlier runs
Earlier detailed run history remains available in repository history. The current state and durable learnings carry forward the authoritative operating context.