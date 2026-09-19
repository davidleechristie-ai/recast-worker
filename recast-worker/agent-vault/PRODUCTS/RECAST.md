# Recast

Recast is a browser-based developer data workbench for turning recurring data fixes into reliable, reusable automations across JSON/CSV/XML/API data.

## Product thesis
AI has commoditised one-off transformation code. Recast should not ask technical users to pay merely to format JSON, convert CSV or generate a throwaway transformation that an AI coding agent can create in seconds.

The paid job is operationalising a recurring data task without making the user own another script/service:

**AI gets it working; Recast keeps it working.**

Use AI to interpret intent and construct a visible pipeline. Once the user approves it, execute the repeatable work through Recast's deterministic engine rather than asking an LLM to reinterpret the job on every run.

## Core journey
data → describe outcome → visible deterministic pipeline → result → save/repeat → automate/API → history/failure handling → retained use.

The shortest product promise is:

**Describe it → See the pipeline → Run it → Save it → Automate it.**

## Target customer and job
Primary initial customer: developers, technical founders, product/solutions engineers and technical operations people in small teams who regularly encounter annoying data jobs but do not want to build and maintain infrastructure for them.

Strong jobs include:
- normalising recurring customer/supplier CSV files before import;
- reshaping third-party API responses into application/reporting formats;
- converting webhook payloads between systems;
- recurring JSON → CSV reporting;
- schema/import validation before downstream processing;
- repeated field selection, filtering, flattening, renaming and type cleanup.

Do not initially optimise for sophisticated data-platform teams already committed to dbt/Airflow/custom infrastructure, or for completely non-technical users. The sweet spot is work that is technically easy to script but too small and repetitive to deserve another maintained service.

## Differentiation
The alternative is not another web formatter. The main alternatives are: ask an AI agent to write a script, maintain a small internal service, chain multiple tools, or keep manually repeating the task.

Recast wins when it removes the operational ownership that follows generated code: hosting, scheduling, deployment, configuration, repeatability, run history, failure visibility and reruns. Preserve visible deterministic steps so users can understand, edit and trust what will happen each time.

Privacy-first browser processing remains valuable for interactive work where suitable. Hosted execution is an explicit choice when the user wants API/scheduled automation.

## Commercial boundary
Free proves the transformation works. Monetisation should occur after demonstrated value, especially at **save/repeat/automate** rather than at basic formatting/conversion.

Working pricing hypothesis to validate rather than assume:
- Free £0: acquisition tools, AI pipeline construction, interactive pipeline runs, small saved-pipeline allowance.
- Pro ~£9/month: unlimited/expanded saved pipelines, presets/history and repeat interactive work.
- Automation ~£29/month: hosted API endpoints, schedules/webhooks, run history/error handling and materially higher execution allowance.
- Team ~£79–99/month later, only after demand: shared pipelines, environments/secrets, monitoring/alerts, collaboration/audit and higher limits.

Do not optimise ARPU before customer #1. Test whether users will pay to avoid owning a recurring transformation service. Count revenue only from verified successful non-refunded payments.

## AI product rule
AI is primarily the creation interface, not the runtime dependency:

**AI for creation → deterministic engine for execution → Recast for operation.**

A user can always ask an AI coding agent to build the whole thing. Recast must therefore make the alternative materially easier than owning that generated software. Every Recast 2 feature should answer: **does this make it materially easier to turn a recurring data problem into something the user no longer has to manually fix or maintain?**

## Recast 2 commercial sequence
Recast 2 is the product mechanism for reaching the revenue milestones, not a separate engineering programme.

1. **2A Build & run** — describe outcome → visible pipeline → correct result.
2. **2B Save & repeat** — save approved pipeline → rerun new data with minimal friction.
3. **2C Automate** — turn saved pipeline into API endpoint, webhook or schedule with run/failure visibility.
4. **2D Pay** — expose the paid boundary after successful proof of value; make checkout and entitlement frictionless.
5. **2E Acquire** — high-intent use-case entrances should land users close to a working pipeline rather than a generic tool catalogue.

Until first genuine customer, prioritise 2A/2B correctness and the shortest credible 2B→2C→2D path. Defer broad platform features that do not strengthen problem → pipeline → successful run → save → repeat/automate → payment.

## Product direction
Recast 2 makes the pipeline the product. Reuse the existing deterministic engine and workflow/storage/commercial machinery instead of creating parallel systems.
