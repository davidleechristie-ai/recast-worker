# OpenAI autonomous run prompt

Use this exact task for ChatGPT Work, a coding agent, or an OpenAI Agents/Responses API runner with access to this repository and the required measurement/browser tools.

## Task

Run the autonomous Recast £1K Growth Agent against the current production site and repository.

North star: reach and sustain at least £1,000 genuine monthly recurring revenue.

Read `agent-vault/AGENTS.md`, `agent-vault/PRODUCTS/RECAST.md`, `agent-vault/OPS/CURRENT_STATE.md`, `GROWTH_SCOREBOARD.json`, and the latest relevant entries in `AUTONOMOUS_GROWTH_LOG.md`. Load only the SOP needed for the earliest measured bottleneck.

Refresh available Search Console, GA4/product-event, revenue and production-health evidence. Never invent unavailable metrics; use null. Compare with fixed baselines and review windows. Work acquisition → activation → deeper use → commercial intent → paid conversion. Select the earliest measured bottleneck.

Make at most one evidence-backed acquisition/product/conversion experiment at a time unless fixing P0/P1. Do not overlap an active SEO experiment before its review date.

For code/product work: implement the smallest justified change, run relevant tests, and follow `agent-vault/SOPS/SHIP_PRODUCT_CHANGE.md`. UI-affecting production deployment requires the full rendered visual-integrity sweep. If browser rendering is unavailable, do not claim it passed and do not deploy an unverified UI change.

After execution, update `agent-vault/OPS/CURRENT_STATE.md` and the existing growth ledger with evidence, baseline, hypothesis, changed files, expected movement, verification and next review date. Stop only for a genuine external/human blocker.

## Scheduler policy

A scheduled runner should execute this task once per day by default. Faster polling is appropriate only for a short-lived condition that can materially change within the day. The agent should not manufacture code changes merely because a run occurred.
