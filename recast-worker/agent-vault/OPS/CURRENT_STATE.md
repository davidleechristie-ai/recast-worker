# Current state

Updated: 2026-09-20 03:43 Europe/London
North star: ≥ £1,000 genuine MRR.
Current milestone: first genuine paying customer.

## Evidence refreshed
- Authoritative repository scoreboard remains £0 genuine MRR and 0 genuine paid customers under the strict successful/non-refunded latest-invoice definition. Fresh Recast payment-provider evidence is unavailable in this run, so revenue was not re-estimated.
- Scoreboard acquisition evidence remains 1,575 Search Console impressions, 4 organic clicks, 3 successful tool uses, 0 workflow starts and 0 commercial-intent events. Unknown downstream rates remain null.
- Current main already contains the revenue-critical local/hosted journey: Recipe Builder 2.0, local workflow library, hosted workflow deployment, API execution, scheduling, encrypted credentials, run history and upgrade handling.
- A critical commercial blocker was found in current `public/app.js`: `automation_monthly` and `automation_yearly` still contain `REPLACE_AUTOMATION_*_PAYMENT_LINK` placeholders. `startCheckout()` refuses unconfigured links, so a user selecting the £29 Automation plan cannot currently enter Automation checkout.
- The only Stripe account exposed to the connected Stripe tool in this run is named `Home Quote Check`; it is not assumed to be the Recast account. No Recast Stripe product/link was created or modified.

## Earliest revenue bottleneck
Customer #1 remains the immediate milestone. The highest-priority actionable blocker is now **Automation checkout availability**, because the product is presenting the £29 recurring-data-job proposition while the corresponding checkout links are deliberately disabled in code. Acquisition cannot produce an Automation customer while this remains unresolved.

The next product constraint remains proving the Recast 2 journey: AI-assisted creation → visible deterministic pipeline → successful run → save/repeat → hosted automation/API → payment.

## Target customer / value hypothesis
Primary initial target: developers, technical founders, product/solutions engineers and technical operations people in small teams with recurring data jobs that are easy to script but not worth owning as another service. Recast removes operational ownership: repeated setup, hosting, scheduling, configuration, run history, failure visibility and reruns.

Durable thesis: **AI gets it working; Recast keeps it working.** Working pricing hypothesis: Free for proof/interactive use; ~£9 Pro for repeat/saved interactive work; ~£29 Automation for hosted endpoints/schedules/webhooks/run history; Team £79–99 only after demand.

## Recast 2 / commercial-path audit
- Recipe Builder 2.0 exposes Run, Save and Automate actions.
- The Automate action saves the current definition into `RecastWorkflowLibrary`, tracks `builder_automate_clicked`, and activates the Automation surface.
- The ordinary Save action currently persists to legacy `RecastRecipes`; it does not also promote that saved definition into `RecastWorkflowLibrary`. This is a 2B continuity gap to test/fix on the revenue slice so Save → repeat → deploy is one coherent journey.
- `RecastWorkflowLibrary.save()` persists local-first workflows and tracks `workflow_saved`.
- `RecastWorkflowAutomation` already implements disclosure, plan detection, hosted deployment, run-now, scheduling, encrypted credentials, history and upgrade prompts. Reuse it; do not build a parallel automation system.
- Automation checkout is not configured: the monthly/yearly Automation Stripe links are placeholders, and `startCheckout()` blocks them.
- `recast2-revenue-slice` was fast-forwarded to current main at the start of this run after being one commit behind, preventing branch drift before further product work.

## Active experiments / attribution guardrail
- JSON Schema Generator content-consolidation experiment remains active; 28-day review due 2026-09-29.
- Flatten JSON search-intent alignment remains active; 14-day review due 2026-09-22 and 28-day review due 2026-10-06.
- No active SEO target was edited this run.

## Work completed this run
- Audited the real save → automate → hosted-plan → checkout path rather than adding new infrastructure.
- Identified the unconfigured Automation payment links as a direct customer-#1 blocker.
- Verified the existing hosted workflow machinery is already substantial enough that the immediate priority is joining/validating the journey, not building another backend.
- Fast-forwarded `recast2-revenue-slice` to current main.
- Checked the connected Stripe context before attempting payment changes and refused to mutate the unrelated Home Quote Check account.
- No production UI was changed or deployed.

## Expected revenue impact
Resolving the Automation checkout blocker is prerequisite to collecting the hypothesised £29/month revenue from the exact recurring-data-job proposition being prioritised. Closing the Save → Workflow Library continuity gap should reduce friction between demonstrated local value and the paid hosted action.

## Measurement gaps / blockers
- Recast Stripe account is not available through the current connected Stripe context; Automation monthly/yearly payment links therefore cannot be created safely in this run.
- Fresh Recast payment-provider and GA4/product-event evidence remain unavailable.
- Successful-task rate lacks a usable tool_run_attempt denominator; workflow completion lacks workflow_start traffic.
- Rendered browser verification is unavailable in this run, so UI-affecting production deployment remains blocked by policy.

## Next autonomous execution
1. Keep Automation checkout configuration as P0 commercial work. If a Recast Stripe context becomes available, create/verify the £29/month and £290/year Automation recurring prices/payment links and wire them into `STRIPE.links`, then verify checkout attribution/return/entitlement end-to-end before launch.
2. On `recast2-revenue-slice`, close the 2B continuity gap so a named Save becomes a reusable workflow visible to the Workflow Library/Automation path without creating a second execution system; add behavioural regression coverage.
3. Progress non-UI instrumentation/tests independently while rendered UI verification is unavailable.
4. Preserve active SEO experiment windows.
