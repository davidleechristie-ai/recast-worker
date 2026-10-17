# Tool contracts

- measure_revenue: authoritative genuine successful non-refunded payments; never infer.
- measure_funnel: privacy-safe production events excluding QA/bots/tests.
- inspect_production: homequotecheck.co.uk key journeys, availability, SEO and mobile/desktop health.
- research_acquisition: current consumer intent/SERPs/competitors with sources.
- modify_repo: scoped HQC changes only.
- run_tests: relevant unit/integration/regression evidence.
- visual_qa: rendered desktop/mobile route and geometry checks; mandatory for UI production changes.
- deploy_canary: existing preview workers.dev / cf-preview route.
- deploy_production: hqc-production only after gates.
- update_vault: persist evidence, decisions and next action every run.

Unavailable capabilities remain explicitly unavailable; never simulate success.
