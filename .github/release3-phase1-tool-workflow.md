Implement only Release 3 Phase 1A for Recast in recast-worker: post-success contextual conversion and Tool -> Workflow handoff.

Work only on the current branch. Do not deploy, merge, edit .github files, alter Stripe/pricing/auth/entitlements, expose secrets, or change production configuration.

Inspect the existing tool UI, success/result handling, workflow builder and existing transfer/state mechanisms first. Reuse them.

Scope:
- Add a small reusable post-success conversion layer that appears only after a meaningful successful tool action; never as a pre-use modal.
- Add “Turn this into a workflow” only for operations the current workflow engine can faithfully represent.
- Transfer safe categorical operation/mode/settings into the existing workflow builder. Never transfer pasted data, files, raw input/output, credentials, filenames or arbitrary user text through URLs, analytics or server state.
- Cover high-intent supported mappings such as JSON->CSV, CSV->JSON, validation, extraction/JSONPath, flatten/unflatten, schema generation/validation and diff only where genuinely supported.
- Preserve the free path and browser-local processing/privacy messaging.
- Add safe analytics hooks for successful_tool_use and workflow_created_from_tool using only categorical metadata.
- Add focused tests for post-success timing, supported/unsupported workflow handoff and data-leak prevention.
- Keep changed markup responsive and accessible.

Run relevant focused tests while implementing. Leave implementation changes uncommitted; the workflow will test and commit them.