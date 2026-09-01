You are implementing Release 3 Phase 1 for Recast in repository davidleechristie-ai/recast-worker, project directory recast-worker.

Work only on the current branch. Do not merge, deploy, change production configuration, expose secrets, alter Stripe prices, or weaken privacy/security controls.

Commercial objective: move successful free-tool users into repeat use, workflows, Automation and API plans without damaging the free experience. Preserve all existing tools and browser-local processing. Recast is broader than JSON: conversion, transformation, validation, comparison, inspection, workflows, automation and API.

Before changing code, inspect the current application, tool pages, worker routing, workflow builder, automation UI, API docs, checkout code and tests. Reuse existing architecture rather than adding parallel mock functionality.

Implement this phase:

1. Context-sensitive upgrade journeys
- Upgrade prompts must appear only after relevant value-producing user actions, not as intrusive pre-use popups.
- Tailor prompts where technically supportable to file size/limits, batch use, saved presets, repeated conversions, workflow complexity and API intent.
- Preserve a usable free path and browser-local privacy messaging.
- Avoid fabricated scarcity or unsupported claims.

2. Tool -> workflow conversion
- After a successful eligible tool operation, expose a clear “Turn this into a workflow” action.
- Transfer the current operation/mode/settings into the existing workflow builder so users do not need to recreate it manually.
- Use existing URL/state/preset mechanisms where available; extend safely if necessary.
- Include sensible mappings/templates for high-intent operations such as JSON->CSV, CSV->JSON, validation, JSONPath/extraction, flatten/unflatten, schema generation/validation and diff where the workflow engine supports them.
- If a particular operation cannot be faithfully represented, do not pretend it can; hide/disable the handoff for that operation.

3. Workflow -> Automation conversion
- In the workflow experience, add clear paths to schedule, webhook and hosted execution where those capabilities already exist.
- Explain that normal browser workflows remain local, while hosted/scheduled/webhook execution sends the run input to Recast for server-side processing.
- Require explicit user action/consent before entering hosted execution configuration.
- Position Automation as the next step for recurring jobs, without blocking local workflows.

4. Developer -> API conversion
- On relevant conversion, validation, schema and diff experiences, expose contextual API examples generated from the selected/current tool mode, using real supported endpoints only.
- Link to the existing API documentation and checkout path with campaign/source attribution in the URL where the existing checkout mechanism safely supports it.
- Clearly distinguish browser-local tools from hosted API processing.
- Do not invent endpoints, quotas or capabilities.

5. Analytics hooks required by these journeys
- Add privacy-conscious event hooks for successful tool completion, workflow-created-from-tool, automation configuration started and API documentation viewed where this phase introduces the associated interactions.
- Event payloads must never contain pasted tool data, file contents, raw inputs/outputs, credentials, email addresses, filenames if they could contain sensitive information, or arbitrary user text.
- Keep event properties to safe categorical metadata such as tool/mode/source/path/plan/trigger type.
- Preserve any existing analytics implementation and naming conventions, but align with the growth scoreboard names where safe: successful_tool_use, workflow_created_from_tool, automation_configuration_started, api_documentation_viewed.

Validation requirements:
- Run the full existing npm test suite before and after changes.
- Add focused tests for tool->workflow state transfer, contextual API/Automation routes, post-success prompt timing and analytics payload safety.
- Ensure existing SEO routing, auth, Stripe, API, workflow and entitlement tests still pass.
- Check for obvious mobile/iPhone layout/navigation regressions in changed markup/CSS using responsive-safe implementation; do not claim physical-device testing unless actually performed.
- Do not include pasted user data in analytics under any path.

Implementation quality:
- Prefer a small reusable conversion/funnel layer over copy-pasted markup across every tool page.
- Preserve accessibility: semantic buttons/links, visible focus, readable labels, no keyboard traps.
- Avoid generic SaaS copy and startup clichés.
- Do not modify .github files during the agent run.
- At the end, leave all implementation changes uncommitted for the workflow to test and commit.
- Summarize changed files, tests run and any requirements you deliberately did not implement because the underlying product does not support them.