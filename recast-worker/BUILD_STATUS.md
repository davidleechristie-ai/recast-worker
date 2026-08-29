# Recast Revenue Build V18 — Template → Builder → Automation

## Conversion journey
The template layer now proves the workflow inside the real product rather than merely opening an empty definition.

- Six templates include realistic sample inputs.
- `Try example` preloads the sample and opens the actual Workflow Builder.
- Existing live preview executes against that sample.
- Builder adds a prominent `Automate →` action.
- That action saves the workflow to the Workflow Library and takes the user to Hosted Automation.
- Funnel events measure sample loading and the Automation handoff.

## External work
No new configuration. Production UX checks are recorded in `OWNER_ACTION_LOG.md`.

## Next
V19 should concentrate on conversion polish: better empty states, clearer hosted-vs-local disclosure at the exact deploy moment, and pricing/checkout readiness once the real Automation Stripe links are available.
