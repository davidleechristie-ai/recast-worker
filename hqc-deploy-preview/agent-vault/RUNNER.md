# OpenAI runner contract

Preferred runtime: OpenAI Agents SDK / Responses API or ChatGPT Work/automation with equivalent connected tools. Vault files are durable operating memory; model context is disposable.

Bootstrap: load AGENTS.md, PRODUCT.md, CURRENT_STATE, latest RUN_LOG and TOOLS.md; then only the SOP required for the current bottleneck. Execute through authorised tools rather than merely planning. Code path: inspect → edit → test → rendered visual gate where applicable → canary → production → verify → log.

A repository-hosted runner should use least privilege, tracing, bounded model/tool budgets, idempotency/locking to prevent concurrent deployments, explicit dry-run mode and CI/host secret storage. Never put customer data or secrets in the vault.
