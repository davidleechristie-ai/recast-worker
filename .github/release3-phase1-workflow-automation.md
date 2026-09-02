Implement only Release 3 Phase 1B for Recast in recast-worker: Workflow -> Automation conversion.

Work only on the current branch. Do not deploy, merge, edit .github files, alter Stripe/pricing/auth/entitlements, expose secrets, or change production configuration.

Inspect the existing workflow builder, Automation UI/routes, scheduling/webhook/hosted execution capabilities and tests first. Reuse existing product paths; do not invent unsupported capabilities.

Scope:
- Add clear contextual next-step actions from an existing workflow into schedule, webhook and hosted execution configuration only where those capabilities already exist.
- Make browser-local workflow execution versus hosted/scheduled/webhook server-side processing explicit.
- Require an explicit user action before entering hosted execution configuration; do not silently upload or transfer workflow input.
- Position Automation for recurring jobs without blocking local workflows.
- Add safe analytics hook automation_configuration_started using categorical metadata only (source/path/trigger type). Never include pasted data, files, inputs/outputs, credentials, email addresses, sensitive filenames or arbitrary user text.
- Add focused route/interaction/privacy tests.
- Preserve existing workflow behavior, accessibility and mobile-safe layout.

Run relevant focused tests while implementing. Leave implementation changes uncommitted; the workflow will test and commit them.