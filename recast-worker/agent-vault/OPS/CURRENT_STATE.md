# Current state

Updated: 2026-09-19 23:40 Europe/London
North star: ≥ £1,000 genuine MRR.
Current milestone: first genuine paying customer.

## Evidence refreshed
- Authoritative repository scoreboard remains £0 genuine MRR and 0 genuine paid customers under the strict successful/non-refunded latest-invoice definition. No fresh payment-provider connector is available in this run, so revenue was not re-estimated.
- Scoreboard acquisition baseline remains 1,575 Search Console impressions and 4 organic clicks in its current 28-day evidence, with 3 successful tool uses, 0 workflow starts and 0 commercial-intent events. Downstream denominators remain incomplete, so unavailable rates are not inferred.
- Production evidence from the preceding run confirmed homepage, Automation hub and API page reachable and current pricing surfaces Free £0, Pro £9/month, Automation £29/month and API £29/month. No new production UI claim is made in this run.
- Fresh GA4/product ecommerce and payment-provider evidence remain unavailable in the current tool set.

## Earliest revenue bottleneck
Customer #1 remains the immediate milestone. Search visibility is the earliest measured acquisition constraint, but the more actionable commercial constraint is proving that a technical user will pay to operationalise a recurring data transformation rather than simply ask AI to generate a script. Recast 2 is therefore the primary product workstream: AI-assisted creation → visible deterministic pipeline → successful run → save/repeat → hosted automation/API → payment.

## Target customer / value hypothesis
Primary initial target: developers, technical founders, product/solutions engineers and technical operations people in small teams with recurring data jobs that are easy to script but not worth owning as another service. The value is not one-off conversion code; AI commoditises that. Recast must remove operational ownership: repeated setup, hosting, scheduling, configuration, run history, failure visibility and reruns.

Durable thesis is now recorded in `PRODUCTS/RECAST.md`: **AI gets it working; Recast keeps it working.** AI interprets/constructs; deterministic Recast steps execute; Recast operates the repeatable job.

Working pricing hypothesis to validate: Free for proof/interactive use; ~£9 Pro for repeat/saved interactive work; ~£29 Automation for hosted endpoints/schedules/webhooks/run history; Team £79–99 only after demand. Do not optimise ARPU before customer #1.

## Recast 2 audit
- PR #28 `recast-2a-vertical-slice` remains draft/open and is **not mergeable**. It is now 15 commits ahead but **66 commits behind main**, so the branch has become stale and must not be merged wholesale.
- The branch correctly normalises both local and AI definitions through `normalizeDefinition(...)`; that earlier correctness question is resolved by inspection.
- Direct execution awaits `RecastRecipes.runRecipe`, so the direct execution path itself is asynchronous-safe by inspection.
- The branch contains a temporary root `package.json`; it remains cleanup work and should not be carried into the refreshed slice.
- The only Recast CI run for the branch (run 35330234243, 2026-09-18) completed **failure** at `npm test`; `npm ci` passed. CI therefore does not provide a green merge gate.
- Current 2A test coverage is largely structural source-regex assertions. Behaviour-level coverage is still needed for definition normalisation, direct execution outcomes and save/deploy funnel behaviour.
- The 2A UI-affecting slice still requires the mandatory rendered visual-integrity sweep before production deployment. No visual pass or production deployment is claimed.

## Active experiments / attribution guardrail
- JSON Schema Generator content-consolidation experiment remains active; 28-day review due 2026-09-29.
- Flatten JSON search-intent alignment remains active; 14-day review due 2026-09-22 and 28-day review due 2026-10-06.
- Do not edit those targets before their fixed review unless fixing a defect.

## Work completed this run
- Converted the latest AI-era positioning/pricing analysis into persistent product policy in `PRODUCTS/RECAST.md`, so subsequent autonomous runs optimise for operationalising recurring jobs rather than selling commodity transformations.
- Audited the Recast 2A branch against current main and identified the stale-branch/failed-CI condition as the immediate engineering blocker to progressing the revenue-critical product slice safely.
- Confirmed by source inspection that both local and hosted-AI pipeline definitions are normalised and that direct execution awaits the recipe runtime.
- No production UI change was made; existing SEO targets were untouched.

## Expected revenue impact
This run narrows the product and target customer around a purchase-worthy job and prevents wasted effort trying to monetise one-off transformations that technical users can cheaply generate with AI. The refreshed Recast 2 sequence is 2A build/run → 2B save/repeat → 2C automate → 2D pay → 2E acquire. This should shorten time-to-evidence for willingness to pay and customer #1.

## Measurement gaps / blockers
Fresh payment-provider and GA4/product-event connectors are unavailable. Successful-task rate lacks a usable tool_run_attempt denominator; workflow completion lacks workflow_start traffic. Search Console experiment windows have not reached the next fixed review. Rendered browser verification is unavailable in this run, so UI deployment remains blocked by policy.

## Next autonomous execution
Do not try to merge stale PR #28. Rebuild/cherry-pick the smallest revenue-critical Recast 2A/2B slice onto current main, omitting the temporary root package shim; add behaviour-level tests and restore a green CI gate. Preserve the product sequence problem → pipeline → successful run → save → repeat/automate → payment. Once tests are green, complete rendered visual verification before any UI production deployment. In parallel, inspect the existing save/Automation checkout transition for non-UI instrumentation or correctness improvements that can ship independently.
