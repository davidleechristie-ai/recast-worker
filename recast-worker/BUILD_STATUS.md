# Recast V38 — Real AI Workflow Copilot

Built from V37.

## What changed
- Homepage Workflow Copilot is now AI-first rather than hardcoded-intent-first.
- New public Worker endpoint: POST /api/copilot/interpret
- Uses the OpenAI Responses API with strict structured output.
- Default model is configurable through OPENAI_MODEL; build defaults to gpt-5.6-luna.
- The model receives only the user's request text, not the working dataset.
- AI output is allow-listed and normalised to Recast-supported workflow modes and dedicated tool routes.
- Unsupported/hallucinated modes are discarded.
- Missing required field configuration is never invented.
- HTTPS-only validation is applied to AI-created API request steps.
- 12-second model timeout.
- 1,200-character prompt limit.
- Public Copilot rate limit: 30 interpretations per IP/hour using existing KV.
- Existing deterministic intent engine remains as a browser fallback if AI is unavailable, times out or is rate-limited.
- UI explicitly discloses that AI interprets request text while working data remains local unless hosted features are explicitly used.

## Required deployment configuration
Create OPENAI_API_KEY as a Cloudflare Worker secret / Secrets Store binding. Do not commit the key.
OPENAI_MODEL can be changed in wrangler vars without changing Copilot code.

## Preserved
All V37 link reconciliation, V36/V35 SEO work, homepage structure, Workbench, API, Automation, Stripe and entitlement behaviour.
