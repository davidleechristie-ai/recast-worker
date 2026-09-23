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
