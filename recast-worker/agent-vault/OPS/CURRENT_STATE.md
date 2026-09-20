# Current state

Updated: 2026-09-20 05:40 Europe/London
North star: ≥ £1,000 genuine MRR.
Current milestone: first genuine paying customer.

## Evidence refreshed
- Authoritative repository scoreboard remains £0 genuine MRR and 0 genuine paid customers under the strict successful/non-refunded latest-invoice definition. Fresh Recast payment-provider evidence is unavailable in this run, so revenue was not re-estimated.
- Scoreboard acquisition evidence remains 1,575 Search Console impressions, 4 organic clicks, 3 successful tool uses, 0 workflow starts and 0 commercial-intent events. Unknown downstream rates remain null.
- Fresh production fetch on 2026-09-20 confirms the homepage is live and presents the AI-era proposition directly: fix data without writing another script; turn repeating jobs into workflows and automation; Pro £9/month; Automation £29/month; API £29/month.
- Fresh production fetch confirms `/automation/` is live and explicitly targets recurring API, JSON and CSV jobs, including API→CSV, scheduled transformations, webhook reshaping, JSONPath extraction and API-to-API transformation.
- Current `public/app.js` still has real Pro/API payment links but placeholder `automation_monthly` and `automation_yearly` links. `startCheckout()` rejects unconfigured links, so Automation cannot currently collect a customer.
- Current Recipe Builder 2.0 already has Run, Save and Automate. Automate saves a schemaVersion 3 definition to `RecastWorkflowLibrary`; ordinary Save still writes only to legacy `RecastRecipes`. This remains the concrete 2B Save → repeat → automate continuity gap.
- Full preview execution remains async-inconsistent: partial preview awaits `RecastRecipes.runRecipe`, while full preview does not await it.

## Earliest revenue bottleneck
Customer #1 remains the immediate milestone. The highest-priority commercial blocker remains **Automation checkout availability**. The product clearly sells the £29 recurring-data-job proposition, but the corresponding Automation checkout links are deliberately disabled in code. Acquisition cannot produce an Automation customer while this remains unresolved.

The next autonomous product constraint is **2B continuity**: a user who presses Save should have one reusable workflow that can later be repeated and promoted into hosted Automation, rather than a legacy recipe object separate from the workflow library.

## Target customer / value hypothesis
Primary initial target: developers, technical founders, product/solutions engineers and technical operations people in small teams with recurring data jobs that are easy to script but not worth owning as another service. Recast removes operational ownership: repeated setup, hosting, scheduling, configuration, run history, failure visibility and reruns.

Durable thesis: **AI gets it working; Recast keeps it working.** Working pricing hypothesis: Free for proof/interactive use; ~£9 Pro for repeat/saved interactive work; ~£29 Automation for hosted endpoints/schedules/webhooks/run history; Team £79–99 only after demand.

## Recast 2 / commercial-path audit
- Production marketing aligns with the thesis: free browser transformation, visible workflows, Copilot creation, and deliberate transition to hosted automation/API.
- Recipe Builder 2.0 exposes Run, Save and Automate actions.
- `rb2AutomateBtn` creates `{schemaVersion:3,name,steps}` and saves through `RecastWorkflowLibrary.save()` before activating the Automation surface.
- `rb2SaveBtn` validates name/steps then only calls `RecastRecipes.upsert({name,steps})`. It does not create/update the corresponding workflow-library definition. This is the precise 2B continuity change to implement and behaviourally test on the revenue slice.
- Partial preview awaits `RecastRecipes.runRecipe`; full preview currently assigns the returned value without `await`. Correct this before shipping the revenue slice.
- Existing hosted workflow machinery should be reused; do not build a second execution/automation system.
- Automation checkout remains unconfigured in `STRIPE.links` and is blocked by `isLinkConfigured()`/`startCheckout()`.

## Active experiments / attribution guardrail
- JSON Schema Generator content-consolidation experiment remains active; 28-day review due 2026-09-29.
- Flatten JSON search-intent alignment remains active; 14-day review due 2026-09-22 and 28-day review due 2026-10-06.
- No active SEO target was edited this run.

## Work completed this run
- Refreshed production health and commercial positioning from the live homepage and Automation landing page; both are reachable and aligned with the recurring-job proposition.
- Re-read the current Recipe Builder implementation on `recast2-revenue-slice` and reconfirmed the exact Save-vs-Automate persistence discontinuity and full-preview async defect before making any risky UI change.
- Kept the change plan minimal: Save should persist the same schema-v3 workflow definition used by Automate while retaining legacy recipe compatibility; full preview should await the shared recipe runtime.
- Preserved all active SEO experiments and made no unverified production UI change.

## Expected revenue impact
- Enabling Automation checkout is prerequisite to collecting the hypothesised £29/month from the recurring-data-job proposition.
- Unifying Save with the workflow library removes a conceptual and technical break between demonstrated value and the paid hosted action, increasing the probability that a successful local workflow can become a paid automation.
- Async-safe preview execution reduces the risk that a successful workflow appears broken at the exact activation point.

## Measurement gaps / blockers
- Recast Stripe account/payment-link creation is not available through the current safe tool context; Automation monthly/yearly payment links cannot be created safely here.
- Fresh Recast payment-provider and GA4/product-event evidence remain unavailable.
- Successful-task rate lacks a usable tool_run_attempt denominator; workflow completion lacks workflow_start traffic.
- Rendered browser verification is unavailable in this run, so UI-affecting production deployment remains blocked by policy.

## Next autonomous execution
1. Keep Automation checkout configuration as P0. If a verified Recast Stripe context becomes available, create/verify £29/month and £290/year Automation recurring prices/payment links, wire them into `STRIPE.links`, then verify checkout attribution/return/entitlement end-to-end.
2. On current `recast2-revenue-slice`, change named Save so the canonical schemaVersion 3 workflow definition is also available through `RecastWorkflowLibrary`, while retaining legacy recipe compatibility only where needed; add behavioural regression coverage for Save → reload → Automate.
3. Fix async-safe full pipeline preview/run behaviour and test error propagation.
4. Progress non-UI instrumentation/tests independently while rendered UI verification is unavailable.
5. Preserve active SEO experiment windows.
