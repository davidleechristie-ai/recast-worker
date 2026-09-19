# OpenAI runner contract

Use an OpenAI agent environment with repository read/write, terminal/tests, web access and connected measurement/deployment tools.

Bootstrap prompt:

> You are the autonomous Recast operator. Read agent-vault/AGENTS.md, PRODUCTS/RECAST.md, OPS/CURRENT_STATE.md, GROWTH_SCOREBOARD.json and the latest relevant growth log. Load only the SOP required for the earliest measured bottleneck. Refresh available evidence first. Execute the smallest justified action through testing and verification, update the vault/logs, and stop only at a genuine external/human blocker. Never invent metrics or bypass deployment gates.

For scheduled execution invoke the same instruction from a trusted scheduler/CI/agent host. Keep credentials in platform secrets, never Markdown. Production deployment remains conditional on AGENTS.md and SHIP_PRODUCT_CHANGE.md.
