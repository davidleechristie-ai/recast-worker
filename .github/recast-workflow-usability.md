Act as a senior SaaS product designer, UX researcher, developer-tools specialist, frontend engineer, conversion specialist, accessibility specialist, visual QA engineer and release engineer.

Your task is to perform a deep usability assessment of Recast's Workflow / Recipe Builder, implement every justified P0/P1 and low-risk P2 improvement, add regression tests, and leave the repository in a release-ready state. Do not deploy directly; the surrounding GitHub Actions workflow will run the release gate and push the tested commit to main, which triggers the existing production deployment workflow.

PRODUCT
Production: https://tryrecast.app
Repository root project: recast-worker/
North Star: £1,000+ genuine MRR.

COMMERCIAL JOURNEY TO OPTIMISE
Free one-off tool → useful result → repeatable workflow/recipe → saved workflow → repeated use → automation/API need → paid customer.

Do not optimise merely for visual polish. Optimise for first-time comprehension, successful completion, repeat use and contextual monetisation.

FIRST-TIME USER TEST
Assess the builder as if you have never seen Recast. Inspect the current product structure and implementation, and use the strongest available live-site/HTTP evidence. Do not pretend you have rendered-browser evidence if you do not.

Walk these journeys conceptually and through the implementation:
A. CSV cleanup: input CSV → remove fields → rename → filter → output/download.
B. API/JSON: input data → extract → transform → convert to CSV → output.
C. JSON processing: input → validate → transform → flatten → output.
D. Tool progression: complete a normal tool task → turn it into a reusable workflow without needless restarting.

Evaluate whether users can understand within seconds what Tools, Workflows, Recipes and Automations mean; start easily; see input/steps/output; add/configure/reorder/remove/duplicate steps; understand step errors; run the full workflow; inspect results; copy/download; save/reuse; and discover Automation only after value is demonstrated. Confirm privacy/local-vs-hosted execution is understandable.

INFORMATION ARCHITECTURE
Prefer this hierarchy if compatible with the implementation:
Tools = one-off operations.
Workflows = multiple operations chained together.
Recipes = ready-made workflow templates.
Automations = saved workflows triggered or run repeatedly.
Remove conflicting or overlapping terminology where low risk.

BUILDER HIERARCHY
The builder must dominate its page. The user should always understand: What goes in? What happens next? What comes out?
Prefer a clear Input → Step 1 → Step 2 → Add step → Output hierarchy. Reduce unrelated cards, marketing or navigation that competes with the active task.

EMPTY STATE
A blank canvas is not sufficient. Ensure users can meaningfully start in one or two interactions. Provide a clear Start from scratch / Start with a recipe path where appropriate, with a small set of useful examples rather than an overwhelming catalogue.

STEP CREATION
Make Add Step obvious. Group/search actions if justified. Use human-readable categories such as Transform, Extract, Clean, Validate, Convert, Compare, Output. Explain each action briefly and avoid implementation jargon.

LIVE DATA FLOW
Where safe and lightweight, expose compact feedback for Input → step result → final output, such as row/property counts or validation state. Use progressive disclosure; do not turn it into a debugging IDE.

ERRORS
Audit invalid JSON/CSV, incompatible operations, missing configuration, empty input, validation failures and malformed expressions. Errors must identify the affected step, explain the problem plainly, suggest a fix where possible, preserve the workflow and never silently discard input/configuration.

RECIPES
Recipes should behave as executable templates rather than documentation: recipe → populated workflow → user/sample data → run → edit → save → automate. Improve this path where justified. Do not create thin SEO pages.

TOOL → WORKFLOW
This is a critical differentiator. After a successful one-off tool task, make it natural to continue with Add another step / Turn this into a workflow / Do this repeatedly. Preserve relevant input/configuration where technically safe. Do not damage the simplicity of individual tools.

WORKFLOW → AUTOMATION
After a successful workflow, make the progression clear: Run once → Save → Reuse → Automate. Introduce Automation contextually after success. Avoid premature or aggressive upgrade prompts. Explain capability, not just 'Upgrade'.

RESPONSIVE / VISUAL QA
Inspect CSS, DOM structure and existing tests for 1920, 1440, 1280, 1024, 768, 430 and 390 CSS px. Fix material clipping, truncation, horizontal scrolling, overlaps, collapsed grids, tiny columns, excessive whitespace, button wrapping, modal/dropdown overflow, connector misalignment, poor touch targets, inconsistent header/logo/nav and missing focus visibility. Use programmatic geometry tests where feasible. Do not claim rendered visual PASS without rendered evidence.

ACCESSIBILITY
Fix material issues involving keyboard access, focus order/visibility, labels, ARIA, contrast, disabled states, validation announcements, touch targets, semantic headings and screen-reader-friendly step ordering.

PRODUCT SIMPLIFICATION
For every element ask whether it helps build or run the workflow. If not, remove, move, collapse or defer it. Prefer less cognitive load over more features.

PRIORITISATION
Classify findings:
P0 = workflow cannot be completed/data loss/serious failure.
P1 = major usability/responsive problem.
P2 = meaningful friction/confusion.
P3 = cosmetic/minor.
Rank by user impact × frequency × commercial relevance ÷ implementation risk.
Implement all justified P0/P1, low-risk high-value P2, and only trivial P3.

IMPLEMENTATION CONSTRAINTS
Preserve existing working tools, client-side/privacy behaviour, saved workflows, URLs, API behaviour, analytics, auth and billing. Do not introduce unnecessary dependencies. You may edit application/UI code and tests under recast-worker/. Avoid unrelated SEO experiments, especially the active JSON Schema Generator search experiment. Do not modify Cloudflare secrets or billing configuration.

TESTING
Run and extend the test suite. Add targeted regression coverage for material changes, including as applicable: new workflow, recipe launch, add/configure/remove/reorder/duplicate step, invalid workflow, input preservation, output generation, responsive structural constraints, navigation, tool→workflow progression and workflow→automation progression. Run the full site-wide regression suite and `npx wrangler deploy --dry-run`.

RELEASE GATE
Do not leave a proposed change if tests fail, P0/P1 regressions remain, existing saved workflows are broken, mobile structure is materially broken or unrelated Recast functionality regresses. Fix and rerun instead.

MANDATORY REPORT
Write `/tmp/recast-workflow-usability-report.md` with these exact sections:
# Recast Workflow / Recipe Usability Report
## Usability score before
## Key problems found
## Prioritisation
## Changes implemented
## Usability score after
## First-time user journey
## Commercial impact
## Files changed
## Test results
## Production verification plan
## Remaining P2/P3 opportunities
## Limitations

Scores must be reasoned 0–10 assessments, not invented analytics. In Limitations, explicitly state whether rendered-browser validation was available. The production verification plan must list the exact live checks the release workflow should perform after main deployment.

Make the improvements now. Do not merely recommend them.