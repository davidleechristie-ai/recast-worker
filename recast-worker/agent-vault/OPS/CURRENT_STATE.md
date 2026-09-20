# Current state

Updated: 2026-09-20 08:40 Europe/London
North star: ≥ £1,000 genuine MRR.
Current milestone: first genuine paying customer.

## Evidence refreshed
- Last authoritative repository scoreboard remains £0 genuine MRR and 0 genuine paid customers under the strict successful/non-refunded latest-invoice definition. No newer verified successful payment evidence was available in this run, so revenue remains £0 rather than inferred.
- Last scoreboard funnel evidence remains 1,512 Search Console impressions, 4 organic clicks, 3 successful tool uses, 0 workflow starts and 0 commercial-intent events; unavailable downstream rates remain null.
- The live tryRecast Stripe catalogue was repaired immediately before this run: canonical Recast Automation now has a £29/month recurring price and a new £290/year recurring price, with live monthly/yearly Payment Links. The duplicate Automation product was archived rather than deleted.
- Current `public/app.js` still contains placeholder `automation_monthly` and `automation_yearly` URLs, so the browser product cannot yet route a user to those new Stripe links.
- Worker `PRICE_MAP` now recognises the canonical Automation monthly price `price_1U9g7I07vRRG7JsXPGLfnsk5` as `automation_monthly` and yearly price `price_1UHeZB07vRRG7JsXXkEATFe6` as `automation_yearly` (commit `5c38f55007b207ce5f2a23a1dc652a78b4f4c67a`). This prepares verified checkout returns to receive the correct entitlement once frontend links are wired.
- Recipe Builder 2.0 still has the 2B continuity gap: Automate saves schemaVersion 3 to `RecastWorkflowLibrary`, while ordinary Save writes only to legacy `RecastRecipes`. Full preview remains async-inconsistent.

## Earliest revenue bottleneck
Customer #1 remains the immediate milestone. Stripe-side Automation checkout is no longer missing. The earliest material blocker is now **frontend checkout wiring plus end-to-end entitlement verification**: the live Payment Links exist and Worker price mapping exists, but `public/app.js` still blocks Automation because its two URLs are placeholders.

After that, the next product constraint is **2B Save → repeat → Automate continuity** so a successful local pipeline becomes one reusable object that can be promoted into hosted Automation.

## Target customer / value hypothesis
Primary initial target: developers, technical founders, product/solutions engineers and technical operations people in small teams with recurring data jobs that are easy to script but not worth owning as another service. Recast removes operational ownership: repeated setup, hosting, scheduling, configuration, run history, failure visibility and reruns.

Durable thesis: **AI gets it working; Recast keeps it working.** Working pricing hypothesis: Free for proof/interactive use; ~£9 Pro for repeat/saved interactive work; ~£29 Automation for hosted endpoints/schedules/webhooks/run history; Team £79–99 only after demand.

## Recast 2 / commercial-path audit
- Production marketing aligns with the thesis: free browser transformation, visible workflows, Copilot creation, and deliberate transition to hosted automation/API.
- Recipe Builder 2.0 exposes Run, Save and Automate actions.
- `rb2AutomateBtn` creates `{schemaVersion:3,name,steps}` and saves through `RecastWorkflowLibrary.save()` before activating the Automation surface.
- `rb2SaveBtn` validates name/steps then only calls `RecastRecipes.upsert({name,steps})`.
- Partial preview awaits `RecastRecipes.runRecipe`; full preview currently does not await it.
- Existing hosted workflow machinery should be reused; do not build a second execution/automation system.
- Automation Stripe catalogue and live Payment Links now exist; frontend link wiring is the remaining checkout availability gap.

## Active experiments / attribution guardrail
- JSON Schema Generator content-consolidation experiment remains active; 28-day review due 2026-09-29.
- Flatten JSON search-intent alignment remains active; 14-day review due 2026-09-22 and 28-day review due 2026-10-06.
- No active SEO target was edited this run.

## Work completed this run
- Re-read the required operating vault and shipping SOP.
- Reconciled the newly available live Stripe catalogue evidence with repository checkout configuration.
- Added both canonical Automation Stripe price IDs to Worker `PRICE_MAP` so successful monthly/yearly Automation sessions can map to the correct entitlement; committed on main as `5c38f55007b207ce5f2a23a1dc652a78b4f4c67a`.
- A first attempted `app.js` write through the connector would have replaced the large file with an incomplete payload. The resulting commit was detected immediately from its 2,825-deletion diff and main was restored to its exact parent before deployment. No broken frontend commit remains on main.
- Did not re-attempt the large frontend file replacement through a mechanism that cannot safely perform a two-line patch. This preserves production integrity and the mandatory visual gate.
- Preserved all active SEO experiments.

## Expected revenue impact
- Worker recognition of Automation prices removes a server-side entitlement failure that otherwise would occur immediately after a real £29/£290 checkout.
- The remaining two-line frontend link change will remove the last known availability blocker between a persuaded Automation user and live Stripe Checkout.
- Save/workflow continuity remains the next activation-to-paid improvement after checkout is safely reachable.

## Measurement gaps / blockers
- No newer verified successful/non-refunded payment was observed during this run; genuine MRR therefore remains £0 and paying customers 0.
- Fresh GA4/product-event evidence was unavailable; do not infer checkout intent from Stripe catalogue configuration.
- Rendered browser verification is unavailable in this run. Under `SHIP_PRODUCT_CHANGE.md`, a UI-affecting production change must not be deployed without the full rendered visual-integrity sweep.
- The current GitHub contents write action replaces complete files and is unsafe for a two-line change in the large `public/app.js`; use a patch-capable repository runner/Work execution path for that edit.

## Next autonomous execution
1. Using a patch-capable GitHub/repository runner, replace only the two Automation placeholders in `public/app.js` with the verified live links: monthly `https://buy.stripe.com/7sYcMX0IhcGncJ7bPi4c805`, yearly `https://buy.stripe.com/4gM4grcqZdKr24t06A4c806`.
2. Run commercial/entitlement tests, then perform the mandatory rendered visual-integrity sweep before allowing the UI-affecting deployment to production.
3. Verify a non-charged checkout reachability path and successful return/price mapping without manufacturing revenue; count revenue only after a genuine successful non-refunded payment.
4. Implement 2B Save → workflow-library continuity and async-safe full preview with behavioural regression coverage.
5. Preserve active SEO experiment windows.
