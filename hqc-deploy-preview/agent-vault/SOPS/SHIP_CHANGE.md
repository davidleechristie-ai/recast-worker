# SOP — Ship change

Tie work to a measured bottleneck, P0/P1 defect or active approved experiment. Run relevant tests.

## Mandatory release test suite
Every build or deployment-capable change must prove both the candidate Worker and the real production hostname. A green preview/canary is not production verification.

Before declaring a release healthy:
1. Run the relevant unit/contract/regression suite.
2. Deploy and verify preview/canary.
3. For a production release, verify **https://homequotecheck.co.uk** itself after the production Worker/custom-domain binding is active.
4. Treat any Cloudflare 5xx, Worker Error 1101, routing/binding failure, or non-200 response on a required production route as a P0 release failure even when preview/canary is green.
5. Do not allow diagnostic/inspection steps to mask failure with `|| true` for release-gating production checks.

Mandatory production smoke routes:
- `/`
- `/health` and body must identify the HQC Cloudflare Worker/assets
- `/api/_healthcheck` and body must show success
- `/is-this-a-good-heat-pump-quote.html`
- the primary CSS and JS assets referenced by the homepage

For each route require HTTP 200. Also require the homepage to contain the current HQC enhancement bundle and reject stale AppDeploy bootstrap/origin references. Where the release changes analysis/upload behaviour, run the same-origin browser journey and confirm `/api/analyse` succeeds through `https://homequotecheck.co.uk`.

If production verification fails, the workflow/build is failed. Stabilise or roll back before unrelated work. Never report the release as fixed merely because GitHub Actions, preview, canary, or `workers.dev` passed.

For UI changes render representative desktop/tablet/mobile widths and key commercial journey routes. Check navigation/logo parity, typography, containers, grid/flex sizing, clipping, overflow/horizontal scroll, text wrapping, cards/children containment, overlaps, cut-off text, forms/CTAs and responsive collapse. Use screenshots and DOM geometry where possible. P0/P1 blocks release. If rendered browser QA is unavailable, perform structural fallback checks, record the limitation and do not deploy an unverified UI change.

Use GitHub/Cloudflare via hqc-deploy-preview and Worker hqc-production, with preview/canary for material releases. Never use AppDeploy. Preserve homequotecheck.co.uk and www routing.
After release verify production and log evidence.


## Fast production lane
Optimise for hours-to-production, not ceremony. Classify each change before work starts:
- **Fast lane:** isolated copy, SEO, telemetry, guarded backend logic, technology adapter, or low-risk UI change with existing regression coverage. Run targeted tests and deploy straight to the production Worker after they pass; production verification is the final gate. Preview/canary may run in parallel and must not serially delay production unless the change touches routing, bindings, checkout/payment, shared upload plumbing, privacy/security, or an existing live technology's analysis correctness.
- **Full lane:** routing/bindings, payments, shared upload/analysis infrastructure, privacy/security, destructive data changes, or changes capable of breaking an already-live vertical. Require targeted tests plus canary before production.

For a new renewable vertical behind an independent kill switch, build and deploy dormant production code/assets early. Passing tests may put the implementation into production with the public flag OFF; do not wait for the entire vertical benchmark. Once the vertical independently passes its MVP benchmark and rendered journey verification, enable its public flag immediately, verify the real hostname, and disable only that flag on a vertical-specific P0/P1 regression. Do not redeploy unrelated code merely to toggle a vertical where a safe environment flag is available.

Do not repeat equivalent gates serially. Reuse fresh evidence from the same commit/release candidate. Targeted test + rendered canary + production smoke are sufficient where applicable; avoid waiting for duplicate broad workflows that do not cover additional risk.

## New renewable vertical release gate
For every new HQC technology, apply the Renewable Vertical MVP Production Benchmark in `STRATEGY/PURCHASE_ADVISER_ROADMAP.md` in addition to this SOP. A technology cannot be marked LIVE until its benchmark evidence is recorded, preview/canary rendered verification is green, production is deployed, and the real production hostname journey is re-verified. Prefer a per-technology kill switch so one vertical can be disabled without affecting existing live technologies.
