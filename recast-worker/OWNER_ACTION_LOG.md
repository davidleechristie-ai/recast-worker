## V32 homepage structure fix
- [x] Rebuild hero DOM from scratch.
- [x] Force quick actions below Copilot.
- [x] Remove Workbench heading overlap risk.
- [x] Preserve current copy and branding.
- [x] Preserve Workbench and Copilot functionality.
- [ ] Verify desktop and iPhone after deployment.

## V31 approved homepage
- [x] Rebuild homepage from clean layout rules.
- [x] Preserve existing RECAST logo/header.
- [x] Use final approved feature-focused supporting copy.
- [x] Align Copilot and quick actions.
- [x] Fix Workbench heading/icon spacing.
- [x] Preserve Workbench functionality.
- [ ] Verify desktop and iPhone after deployment.

## V30 homepage UI cleanup
- [x] Fix hero/quick-action horizontal layout issue.
- [x] Reinstate clear Recast brand hierarchy.
- [x] Keep Copilot immediately below the hero.
- [x] Keep quick actions directly beneath Copilot.
- [x] Add stronger visual separation before Workbench.
- [x] Preserve full Workbench functionality.
- [ ] Verify desktop and iPhone spacing after deployment.

## V29 approved homepage composition
- [x] Restore Recast dark/purple branding.
- [x] White “Fix the data.”
- [x] Purple, non-italic “Then stop fixing it.”
- [x] Copilot immediately beneath hero.
- [x] Four quick actions beneath Copilot.
- [x] Larger gap before Workbench.
- [x] Keep real Workbench with a “Workbench” heading.
- [x] Remove bottom catalogue and proof-strip clutter.
- [ ] Verify final desktop and iPhone appearance after deployment.

## V28 homepage workbench layout
- [x] Preserve latest Recast logo/header.
- [x] Keep Copilot directly below left-aligned hero.
- [x] Remove privacy/live-example panels.
- [x] Remove italic strapline styling.
- [x] Add Workbench heading and spacing before actual interactive workbench.
- [x] Move concise proof points below Workbench.
- [ ] After deployment, verify desktop and iPhone spacing and that all Workbench modes remain easy to reach.

## V27 Google Search Console follow-up
After deployment, request indexing for:
- https://tryrecast.app/tools/json-schema-generator.html
- https://tryrecast.app/tools/validate-json-schema.html
- https://tryrecast.app/tools/json-diff.html
- https://tryrecast.app/tools/xml-diff.html
- https://tryrecast.app/tools/flatten-json.html

Then allow 7–14 days before materially changing these pages again.

## V26 minimal acquisition homepage

- [x] Made “Fix the data. Then stop fixing it.” the main homepage strapline.
- [x] Made the plain-English request the primary interaction.
- [x] Reduced visible homepage to four proof points.
- [x] Removed demo and detailed product feature sections from the acquisition journey.
- [x] Preserved underlying product functionality and Copilot intent hardening.
- [ ] After deployment, compare homepage prompt starts and downstream workflow engagement against V25.

## V25 homepage UI cleanup

- [x] Removed small blue homepage eyebrow headers.
- [x] Left-aligned the interactive-demo heading.
- [x] Removed nested Workflow Builder heading block.
- [x] Removed inner Copilot panel styling while preserving functionality.
- [x] No backend, pricing, entitlement or external configuration changes.
- [ ] After deployment, verify spacing and request-field width on desktop and iPhone.

## V24 Copilot intent hardening

- [x] Expanded plain-English coverage across the supported workflow feature set.
- [x] Added direct-tool routing for non-workflow capabilities.
- [x] Added a no-empty-response fallback for unsupported/ambiguous prompts.
- [x] Added 196-request automated Copilot regression suite.
- [x] Preserved local-only prompt interpretation; no hosted AI service or new secret introduced.
- [ ] After deployment, test 10 spontaneous prompts on desktop and iPhone using wording not present in the automated suite.
- [ ] Review real prompt analytics only if/when privacy-safe prompt telemetry is deliberately introduced; do not capture prompt content silently.

## V23.1 Workflow Copilot comparison fix

- [x] Natural-language CSV comparison requests now generate a valid comparison workflow.
- [x] JSON, XML and API-response comparison language supported.
- [x] “differences only” is understood as the compare result rather than an unsupported filter.
- [x] Incomplete compare workflows cannot be run/saved until a reference is configured.
- [x] Added automated regression tests.
- [ ] After deployment, test the exact homepage request: `compare two csv then output differences only`.

## V23 clean opportunistic homepage

- [x] Made the plain-English request the primary homepage action.
- [x] Moved Workflow Copilot into a prominent always-visible surface.
- [x] Removed duplicate homepage pathway cards already represented in main navigation.
- [x] Preserved interactive demo as immediate proof.
- [x] No backend, entitlement, Stripe or external configuration changes.
- [ ] After deployment, verify hero → plain-English request on desktop and iPhone.
- [ ] Compare `builder_automate_clicked` / workflow starts and interactive-demo engagement against the previous homepage.

## V22 demo suite refresh

- [x] Updated `/demo/` to reflect workflows, hosted API and Automation.
- [x] Added dedicated Workflow, API and Automation guided demos.
- [x] Corrected outdated privacy wording on the Demo page.
- [x] Updated How-To demo description and sitemap.
- [x] No new secrets, price IDs or external configuration introduced.
- [ ] After deployment, open all four demo pages on desktop and iPhone and verify card/link layout.
- [ ] Use the three guided demo URLs as direct destinations for launch content and product-demo videos.

# Recast Owner Action Log

This is the running list of tasks that **must be completed outside the codebase**.  
Do not paste secret values into this file or commit them to Git.

## P0 — required before V7/V8 authenticated automation goes live

- [ ] **Create `CREDENTIAL_ENCRYPTION_KEY` in Cloudflare**
  - Location: Cloudflare Worker → Secrets / Secrets Store.
  - Binding name must be exactly: `CREDENTIAL_ENCRYPTION_KEY`.
  - Generate a long random value (minimum 32 characters; 32+ random bytes preferred).
  - Never put the value in `wrangler.jsonc`, source code, screenshots or support messages.
  - After binding it, redeploy the Worker.
  - Validation: create a test Bearer credential in Recast, list credentials, confirm the secret value is not returned, then run a test authenticated workflow.

- [ ] **Create Stripe Automation Monthly product/price**
  - Recommended launch price: **£29/month**.
  - Copy the Stripe `price_...` ID.
  - Replace `price_AUTOMATION_MONTHLY` in `wrangler.jsonc` `PRICE_MAP` with the real Price ID.
  - Create/update the customer-facing Automation checkout/payment link.
  - Put the real checkout URL into Recast's pricing CTA when ready.

- [ ] **Create Stripe Automation Annual product/price**
  - Recommended launch price: **£290/year**.
  - Replace `price_AUTOMATION_YEARLY` in `wrangler.jsonc`.
  - Create/update the annual checkout/payment link.
  - Put the real checkout URL into Recast's pricing CTA when ready.

- [ ] **Decide API repricing**
  - Current live API price is £29/month.
  - Proposed new price: **£49/month / £490/year**.
  - Decide whether existing API customers are grandfathered at their existing price.
  - Only after that decision, create new Stripe API prices/payment links and update the site.

## P0 — V10 checkout wiring

- [ ] **Paste Automation Monthly Payment Link into `public/app.js`**
  - Replace `REPLACE_AUTOMATION_MONTHLY_PAYMENT_LINK`.
  - Do this only after creating the £29/month Stripe Automation Payment Link.
  - Required success redirect:
    `https://tryrecast.app/?upgraded=1&plan=automation_monthly&session_id={CHECKOUT_SESSION_ID}`

- [ ] **Paste Automation Annual Payment Link into `public/app.js`**
  - Replace `REPLACE_AUTOMATION_YEARLY_PAYMENT_LINK`.
  - Required success redirect:
    `https://tryrecast.app/?upgraded=1&plan=automation_yearly&session_id={CHECKOUT_SESSION_ID}`

- [ ] **Verify GA4 workflow funnel events after deployment**
  - In GA4 DebugView/Realtime, verify:
    `workflow_template_selected`, `workflow_saved`, `workflow_deploy_clicked`, `automation_clicked`, `checkout_start`.
  - No new analytics account/key is required if the existing GA4 configuration remains active.

## P0 — deployment verification

- [ ] **Verify Stripe webhook events after adding Automation**
  - Confirm Checkout/subscription events map the new Stripe Price IDs to `automation_monthly` / `automation_yearly`.
  - Buy a test Automation subscription in Stripe test mode.
  - Confirm Recast issues an entitlement token and Automation scheduling becomes available.
  - Test cancellation/expiry removes the entitlement.

- [ ] **Verify Resend sender/domain**
  - V8 failure alerts use `Recast Automation <contact@tryrecast.app>`.
  - Confirm `tryrecast.app` is verified in Resend and `RESEND_API_KEY` is still valid.
  - Trigger a controlled failed automation and confirm the failure email arrives.
  - Confirm only one alert is sent for a continuous failure episode.

## P1 — commercial launch decisions

- [ ] **Confirm launch plan limits**
  - Proposed Automation: 1,000 scheduled runs/month, 10 active automations.
  - Proposed API: 10,000 API calls/month.
  - Decide whether API includes Automation or whether they remain separate.
  - Decide Team launch timing and final limits.

- [ ] **Update pricing copy/payment CTAs**
  - Target structure currently proposed:
    - Free £0
    - Pro £9/month / £90/year
    - Automation £29/month / £290/year
    - API £49/month / £490/year
    - Team £99/month / £990/year
  - Do not publish prices that do not yet have working Stripe checkout paths.

## P1 — V11 SEO launch checks

- [ ] **Deploy and submit the updated sitemap**
  - V11 adds `/automation/` plus seven high-intent automation use-case pages to `sitemap.xml`.
  - After deployment, submit/re-submit `https://tryrecast.app/sitemap.xml` in Google Search Console.
  - Request indexing for the Automation hub and the strongest initial pages: JSON→CSV automation, API response→CSV, API→API transformation.

- [ ] **Verify GA4 use-case events**
  - Confirm `use_case_template_click` fires from the new landing pages.
  - Confirm `use_case_landed` fires when the homepage opens with a template deep link.
  - Check that the existing workflow funnel continues from there.

## P1 — production smoke test

- [ ] Test a public HTTPS scheduled input.
- [ ] Test Bearer-authenticated input.
- [ ] Test custom API-key-header input.
- [ ] Test unauthenticated webhook output.
- [ ] Test authenticated webhook output.
- [ ] Test hourly, daily and weekly schedules.
- [ ] Test Europe/London schedule across BST/GMT handling.
- [ ] Test pause/resume.
- [ ] Test run-history failure details.
- [ ] Test monthly Automation usage counter and 1,000-run limit.
- [ ] Test 10-active-automation limit.
- [ ] Test mobile Automation setup on iPhone.

## V9 note
- [x] Workflow template/onboarding layer added in code.
- [x] V9 introduces **no new keys, accounts, payment links or external configuration**. Existing P0/P1 tasks remain the launch blockers.

## V12 UI refresh

- [x] New workflow-first homepage product showcase added.
- [x] Workflow, template and Automation surfaces visually refreshed.
- [x] Mobile responsive treatment included.
- [x] V12 adds **no new external keys, services or payment configuration**.
- [ ] After deployment, visually smoke-test the refreshed homepage on iPhone and desktop before public promotion.

## V13 launch hardening

- [x] Hosted workflows now sync back into the local UI when the access token is present.
- [x] Hosted deployments can be removed while retaining the local workflow.
- [x] Browser-only/unsupported steps are blocked with a clear preflight message before deployment.
- [x] `formatJson` is now supported by the hosted executor, fixing the Copilot/server mismatch.
- [x] Automation management UI polished.
- [x] V13 adds **no new external configuration**.
- [ ] After deployment, test hosted-workflow recovery in a fresh browser profile using a valid access token.
- [ ] Test “Remove hosted” against a disposable workflow and confirm the local workflow remains.

## V14 quota, history and vault hardening

- [x] Scheduled Automation runs now consume the Automation quota only; they no longer also consume the general API quota.
- [x] Each scheduled execution now creates one canonical Automation history record rather than an inner schedule record plus wrapper record.
- [x] Successful Automation history now retains real workflow duration and step results.
- [x] Credential vault regression tests added for encryption-at-rest, secret redaction, plan gating, customer isolation and missing-secret fail-closed behaviour.
- [x] V14 adds **no new external configuration**.
- [ ] After production deployment, run one disposable scheduled workflow and confirm Automation usage increases by 1 while API usage is unchanged.
- [ ] Confirm the same run appears once — not twice — in Run History.

## V15 plan-state and upgrade UX

- [x] Automation dashboard now shows the browser's current Free / Pro / API / Automation entitlement state.
- [x] Capability chips explain which layers are active: local tools, Pro limits, API deploy and scheduling.
- [x] API customers are given a contextual path to Automation instead of a generic failure.
- [x] Upgrade impressions are instrumented as `upgrade_shown`.
- [x] V15 adds **no new external configuration**.
- [ ] Production-check each entitlement type after deployment: Free, Pro, API and Automation, confirming the displayed state/capabilities match the token.

## V16 production readiness diagnostics

- [x] Authenticated `/v1/workflows/health` endpoint added; it reports readiness booleans only and never returns secret values.
- [x] Automation UI now includes a clean System Readiness panel for hosted storage, plan entitlement, credential encryption, failure email and scheduler.
- [x] Diagnostics are plan-aware so API customers are not incorrectly shown missing Automation configuration as a product failure.
- [x] Health endpoint regression coverage added.
- [x] V16 adds **no new external configuration**.
- [ ] After deployment with an Automation token, run System Readiness and resolve every red check before marketing hosted Automation as production-ready.

## V17 interactive onboarding

- [x] Interactive workflow demo added to the homepage with three realistic journeys: API→CSV, clean→webhook and JSONPath→CSV.
- [x] Demo output is generated in-browser and each journey deep-links to the matching editable workflow template.
- [x] Demo selection, completion and template CTA events added to the existing funnel.
- [x] Responsive mobile demo treatment included.
- [x] V17 adds **no new external configuration**.
- [ ] After deployment, test all three demos on desktop and iPhone and verify `interactive_demo_selected`, `interactive_demo_completed` and `interactive_demo_template_click` in GA4.

## V18 template-to-Automation onboarding

- [x] All six workflow templates now include realistic sample input.
- [x] `Try example` loads sample data into the real Recast workbench and opens the actual Workflow Builder with the template definition.
- [x] Builder now has an `Automate →` CTA that saves the current workflow and moves the user into Hosted Automation.
- [x] Added `template_sample_loaded` and `builder_automate_clicked` funnel events.
- [x] V18 adds **no new external configuration**.
- [ ] After deployment, test `Try example` on all six templates and confirm the preview/result is sensible for each.
- [ ] Verify the Builder `Automate →` handoff saves the workflow and surfaces it in Hosted Automation on desktop and iPhone.

## V19 focused homepage

- [x] Homepage hierarchy simplified around one primary job: hook the visitor, prove value quickly, then offer a clear next step.
- [x] Replaced the duplicated hero/showcase stack with one concise workflow-first hero and retained the strongest product visual.
- [x] Added three clear pathways: one-off browser tool, repeatable workflow, hosted Automation.
- [x] Templates, Builder, Saved Workflows and Automation now use progressive disclosure instead of appearing as four competing full-width sections.
- [x] Cross-surface links automatically reveal the correct deeper panel before scrolling.
- [x] Header utility controls stay visually quiet during landing-page browsing and return when the workbench is in use.
- [x] Mobile layout simplified for hero, pathways and deeper-product navigation.
- [x] Added `homepage_depth_selected` and `homepage_path_selected` funnel events.
- [x] V19 adds **no new external configuration**.
- [ ] After deployment, visually smoke-test the new hierarchy on desktop and iPhone, particularly hero height, tab switching, deep links and reappearance of workbench utility controls.
- [ ] Compare homepage → demo/template interaction rate against the V18 baseline before adding more homepage content.

## V20 conversion boundary & upgrade clarity

- [x] Added an explicit Local → Hosted disclosure before first deployment.
- [x] Disclosure explains exactly what remains local, what the hosted deployment stores, and when workflow input leaves the browser.
- [x] API vs Automation capability differences are shown at the deploy moment without inventing or changing pricing.
- [x] API-only users attempting to schedule now receive a direct Automation upgrade explanation before the setup form.
- [x] Saved Workflow and Automation empty states now route users back to a proven template instead of presenting passive blank states.
- [x] Added `hosted_disclosure_viewed`, `hosted_deploy_confirmed` and `hosted_plan_compare_clicked` funnel events.
- [x] V20 adds **no new external configuration**.
- [ ] After deployment, verify the disclosure with no token, an API token and an Automation token.
- [ ] Confirm `Deploy` uploads only the workflow definition; verify current editor input remains local until a hosted run or Automation input is explicitly submitted.
- [ ] Test API-user `Automate` behaviour and confirm the user sees the upgrade state without entering an unusable schedule form.

## V21 SEO authority release

- [x] Corrected outdated privacy FAQ wording across 29 indexed tool pages to distinguish local browser processing from explicitly invoked hosted API/Automation processing.
- [x] Strengthened search-intent content on JSON→CSV, CSV Diff, JSON Diff, JSONPath Tester and Flatten JSON without changing the tool-first UX.
- [x] Added focused long-tail pages for `compare CSV files by ID`, `compare JSON arrays by ID`, and `API response to CSV`.
- [x] Added contextual internal links between the long-tail pages and the underlying working tools.
- [x] Added all three new URLs to sitemap.xml and the tool directory.
- [x] V21 adds **no new external configuration**.
- [ ] Deploy V21, submit the updated sitemap in Google Search Console and request indexing for the three new intent pages.
- [ ] Record baseline impressions/positions for the 20-keyword scoreboard before making further title/H1 changes.
- [ ] Build external links directly to the most relevant tool/intent page rather than repeatedly linking only to the homepage.

## P2 — after first paying users

- [ ] Review actual runs/customer and adjust Automation limits.
- [ ] Review support/failure patterns before adding more connector types.
- [ ] Decide whether to add Slack/Teams failure notifications.
- [ ] Add Team/shared workflow permissions only when customer demand validates them.
- [ ] Build integration-specific templates from real customer use cases.

## Completed / already configured in the project

- [x] Stripe secret binding exists.
- [x] Stripe webhook secret binding exists.
- [x] Resend API key binding exists.
- [x] Cloudflare KV entitlement namespace exists.
- [x] Hourly Cloudflare Cron trigger exists.
- [x] Pro/API/day-pass Stripe Price IDs are already mapped in the current source.
- [x] Hosted workflow API implemented.
- [x] Automation entitlement and usage metering implemented.
- [x] Encrypted credential-vault code implemented.
- [x] V8 failure-alert code implemented.

---

### Rule for future builds

Every future build should update this file whenever a new external/manual task is introduced.  
Code work should not be marked production-ready until its corresponding P0 items above are complete.
