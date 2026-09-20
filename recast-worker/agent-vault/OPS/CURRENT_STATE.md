# Current state

Updated: 2026-09-20 07:43 Europe/London
North star: ≥ £1,000 genuine MRR.
Current milestone: first genuine paying customer.

## Evidence refreshed
- Authoritative repository scoreboard remains £0 genuine MRR and 0 genuine paid customers under the strict successful/non-refunded latest-invoice definition. Fresh Recast payment-provider evidence is unavailable in this run, so revenue was not re-estimated.
- Current scoreboard evidence shows 1,512 Search Console impressions, 4 organic clicks, 3 successful tool uses, 0 workflow starts and 0 commercial-intent events; unknown downstream rates remain null.
- Current `public/app.js` still has real Pro/API payment links but placeholder `automation_monthly` and `automation_yearly` links. `startCheckout()` rejects unconfigured links, so Automation cannot currently collect a customer.
- Current Recipe Builder 2.0 still has the exact 2B continuity gap: Automate saves `{schemaVersion:3,name,steps}` to `RecastWorkflowLibrary`, while ordinary Save writes only to legacy `RecastRecipes`.
- Full preview remains async-inconsistent: partial preview awaits `RecastRecipes.runRecipe`, while full preview does not await it.
- The dedicated `recast2-revenue-slice` had fallen 21 commits behind `main`, entirely because main advanced; it had no unique implementation commits. It was safely fast-forwarded to current main commit `fca6e10eb433169823fca46aaf4545146e20cc54` before further product work.

## Earliest revenue bottleneck
Customer #1 remains the immediate milestone. The highest-priority commercial blocker remains **Automation checkout availability**. The product sells the £29 recurring-data-job proposition, but corresponding Automation checkout links are disabled in code. Acquisition cannot produce an Automation customer while this remains unresolved.

The next autonomous product constraint is **2B continuity**: a user who presses Save should have one reusable workflow that can later be repeated and promoted into hosted Automation, rather than a legacy recipe object separate from the workflow library.

## Target customer / value hypothesis
Primary initial target: developers, technical founders, product/solutions engineers and technical operations people in small teams with recurring data jobs that are easy to script but not worth owning as another service. Recast removes operational ownership: repeated setup, hosting, scheduling, configuration, run history, failure visibility and reruns.

Durable thesis: **AI gets it working; Recast keeps it working.** Working pricing hypothesis: Free for proof/interactive use; ~£9 Pro for repeat/saved interactive work; ~£29 Automation for hosted endpoints/schedules/webhooks/run history; Team £79–99 only after demand.

## Recast 2 / commercial-path audit
- Production marketing aligns with the thesis: free browser transformation, visible workflows, Copilot creation, and deliberate transition to hosted automation/API.
- Recipe Builder 2.0 exposes Run, Save and Automate actions.
- `rb2AutomateBtn` creates `{schemaVersion:3,name,steps}` and saves through `RecastWorkflowLibrary.save()` before activating the Automation surface.
- `rb2SaveBtn` validates name/steps then only calls `RecastRecipes.upsert({name,steps})`. It does not create/update the corresponding workflow-library definition.
- Partial preview awaits `RecastRecipes.runRecipe`; full preview currently assigns the returned value without `await`.
- Existing hosted workflow machinery should be reused; do not build a second execution/automation system.
- Automation checkout remains unconfigured in `STRIPE.links` and is blocked by `isLinkConfigured()`/`startCheckout()`.

## Active experiments / attribution guardrail
- JSON Schema Generator content-consolidation experiment remains active; 28-day review due 2026-09-29.
- Flatten JSON search-intent alignment remains active; 14-day review due 2026-09-22 and 28-day review due 2026-10-06.
- No active SEO target was edited this run.

## Work completed this run
- Re-read the required operating vault, scoreboard and shipping SOP before execution.
- Compared `recast2-revenue-slice` against current `main`: main was 21 commits ahead and the slice had zero unique commits.
- Fast-forwarded `recast2-revenue-slice` from `66e9e2aa9c6b3af8536b74094aa5419b59919873` to current main `fca6e10eb433169823fca46aaf4545146e20cc54`, removing branch drift without force or loss of revenue-slice work.
- Re-read the current Recipe Builder implementation and reconfirmed the exact Save-vs-Automate persistence discontinuity and full-preview async defect on the refreshed baseline.
- Preserved all active SEO experiments and made no unverified production UI change.

## Expected revenue impact
- Enabling Automation checkout is prerequisite to collecting the hypothesised £29/month from the recurring-data-job proposition.
- Keeping the revenue slice on current main removes repeated merge/divergence risk and allows the 2B fix to be implemented against the actual production baseline.
- Unifying Save with the workflow library removes a conceptual and technical break between demonstrated value and the paid hosted action, increasing the probability that a successful local workflow can become a paid automation.
- Async-safe preview execution reduces the risk that a successful workflow appears broken at the exact activation point.

## Measurement gaps / blockers
- Recast Stripe account/payment-link creation is not available through the current safe tool context; Automation monthly/yearly payment links cannot be created safely here.
- Fresh Recast payment-provider and GA4/product-event evidence remain unavailable.
- Successful-task rate lacks a usable tool_run_attempt denominator; workflow completion lacks workflow_start traffic.
- Rendered browser verification is unavailable in this run, so UI-affecting production deployment remains blocked by policy.

## Next autonomous execution
1. Keep Automation checkout configuration as P0. If a verified Recast Stripe context becomes available, create/verify £29/month and £290/year Automation recurring prices/payment links, wire them into `STRIPE.links`, then verify checkout attribution/return/entitlement end-to-end.
2. On refreshed `recast2-revenue-slice`, change named Save so the canonical schemaVersion 3 workflow definition is also available through `RecastWorkflowLibrary`, while retaining legacy recipe compatibility; add behavioural regression coverage for Save → reload → Automate.
3. Fix async-safe full pipeline preview/run behaviour and test error propagation.
4. Progress non-UI instrumentation/tests independently while rendered UI verification is unavailable.
5. Preserve active SEO experiment windows.
