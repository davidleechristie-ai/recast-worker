# SOP — Ship product change

Tie every change to a measured bottleneck, P0/P1 defect or active approved experiment. Define expected metric movement. Run relevant unit/regression/route tests.

## Mandatory visual gate
Inspect homepage, /demo/, a dedicated tool page, app/workflow builder, automation, API, pricing and guides at about 1920, 1440, 1280, 1024, 768, 430 and 390 px.

Verify shared design/integrity CSS/JS loads and executes where required; header/logo/nav parity; typography/colors/container widths; grid/flex sizing and min-width/minmax; containment; clipping/overflow/horizontal scrolling; natural wrapping; cards inside parents; no unintended overlaps; no cut-off text/descenders; first-load submenu chevrons; responsive collapse/navigation.

Use rendered bounding boxes/DOM geometry where possible. Flag scrollWidth materially above viewport, visible children outside intended parents, tiny primary columns and unintended sibling overlap. Compare screenshots across breakpoints when possible.

If browser rendering is unavailable, perform structural stylesheet/script/media-rule/width/overflow checks, explicitly record the limitation, and block deployment of an unverified UI change.

After all gates pass, use the existing GitHub → Cloudflare path, verify production, then log commit/deployment evidence and review date.
