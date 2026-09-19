# SOP — Ship change

Tie work to a measured bottleneck, P0/P1 defect or active approved experiment. Run relevant tests.

For UI changes render representative desktop/tablet/mobile widths and key commercial journey routes. Check navigation/logo parity, typography, containers, grid/flex sizing, clipping, overflow/horizontal scroll, text wrapping, cards/children containment, overlaps, cut-off text, forms/CTAs and responsive collapse. Use screenshots and DOM geometry where possible. P0/P1 blocks release. If rendered browser QA is unavailable, perform structural fallback checks, record the limitation and do not deploy an unverified UI change.

Use GitHub/Cloudflare via hqc-deploy-preview and Worker hqc-production, with preview/canary for material releases. Never use AppDeploy. Preserve homequotecheck.co.uk and www routing.
After release verify production and log evidence.
