Implement only Release 3 Phase 1C for Recast in recast-worker: Developer -> API conversion.

Work only on the current branch. Do not deploy, merge, edit .github files, alter Stripe prices/auth/entitlements, expose secrets, or change production configuration.

Inspect the existing conversion/validation/schema/diff tools, API docs, supported endpoints and checkout/link attribution mechanisms first. Reuse only real supported endpoints and existing architecture.

Scope:
- Add contextual API next-step actions/examples on relevant conversion, validation, schema and diff experiences, derived from the selected/current tool mode using safe categorical state only.
- Link to existing API documentation and, where safely supported, existing checkout path with source/campaign attribution.
- Clearly distinguish browser-local tools from hosted API processing.
- Do not invent endpoints, quotas, payload capabilities or pricing.
- Add safe analytics hook api_documentation_viewed using categorical metadata only. Never include pasted data, files, raw inputs/outputs, credentials, email addresses, sensitive filenames or arbitrary user text.
- Add focused tests ensuring generated examples/routes map to supported API behavior and do not leak user data.
- Preserve accessibility, mobile layout and all existing free-tool behavior.

Run relevant focused tests while implementing. Leave implementation changes uncommitted; the workflow will test and commit them.