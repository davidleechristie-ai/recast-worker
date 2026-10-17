Implement only Release 3 Phase 1D for Recast in recast-worker: context-sensitive post-value upgrade journeys.

Work only on the current branch. Do not deploy, merge, edit .github files, alter Stripe prices/IDs/auth/entitlements, expose secrets, or change production configuration.

Inspect the existing tool result states, product limits/features, pricing links and analytics conventions first. Reuse only genuine product signals and supported plan capabilities.

Scope:
- Refine post-success upgrade prompts so they appear only after value has been delivered.
- Tailor prompts only when the product exposes a real relevant signal such as batch use, saved presets/repeat use, workflow complexity or API intent. Do not fabricate file-size limits, scarcity, quotas or unsupported features.
- Preserve a fully usable free path and browser-local privacy messaging.
- Ensure prompts route to the correct existing Pro/Automation/API destination with safe source attribution when supported.
- Keep copy specific to Recast and avoid generic SaaS/startup language.
- Ensure analytics from these prompts remain categorical and never contain pasted data, files, raw inputs/outputs, credentials, email addresses, sensitive filenames or arbitrary user text.
- Add focused tests for post-value timing, plan-route selection and analytics payload safety.
- Preserve accessibility and responsive/mobile layout.

Run relevant focused tests while implementing. Leave implementation changes uncommitted; the workflow will test and commit them.