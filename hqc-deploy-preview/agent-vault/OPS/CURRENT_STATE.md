# Current state

Updated: 2026-09-22 08:48 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase and £100 cumulative validation revenue.

## Evidence refreshed
- Revenue: fresh authoritative live Stripe `Home Quote Check` PaymentIntents returned **0 objects, `has_more=false`**. Genuine production revenue remains **£0 / £1,000 monthly**, cumulative validation revenue **£0 / £100**, paying customers **0**.
- Durable funnel/acquisition: fresh production metrics were unavailable from the current web execution path; latest settled evidence remains **56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses**, with 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains **40 → 16 → 5 → 5**. Unavailable dimensions remain null rather than inferred.
- Search: no newer authoritative Search Console dataset established; latest available 28-day summary remains **0 clicks, 4 impressions, 0% CTR, average position 8.07**. Missing fresh search evidence is null.
- Production health: direct health/metrics retrieval was unavailable from the current web execution path; no production deployment was made this run. Last rendered production recovery and router-isolation proof remain authoritative.

## Commercial diagnosis
The primary commercial bottleneck remains qualified acquisition and conversion to the first genuine £4.99 Decision Pack purchase. Five genuine analyses are insufficient evidence for a pricing or demand conclusion.

## Current milestone
First genuine £4.99 Decision Pack purchase, then £100 cumulative validation revenue.

## Product strategy / Solar-Battery progress
- Added a dedicated non-public JSON request handler over the verified Solar/Battery analysis service for single quote and two-quote comparison.
- Wired it into `worker-entry.js` only when explicit Solar/Battery technology is supplied **and** `HQC_SOLAR_ANALYSIS_INTERNAL=1`; with the gate absent, existing production Solar isolation remains unchanged. Heat Pump does not enter this branch.
- Handler fails closed for malformed JSON, missing quote text, unsupported technology and non-JSON/PDF/image payloads. PDF/image ingestion remains explicitly unverified rather than silently accepted.
- Added request-boundary tests for complete single quote, two-quote comparison, partial evidence, malformed JSON and unverified PDF/image media.
- Solar CI run `35701193912` registered for commit `e51dc504cb7c59ab76598b90f32002de89140621` and was queued at last observation; request integration is therefore **implemented but not yet verified**.
- Nothing was deployed; Solar remains non-public and Heat Pump remains unchanged.

## Active workstreams
1. Continue qualified Heat Pump acquisition toward first purchase.
2. Complete CI verification of the gated Solar request boundary; then validate Worker-level complete/partial/malformed/two-quote behaviour before any deployment.
3. Add verified PDF/image/manual-entry ingestion only after the structured request boundary is green.
4. Then progress Financial Assumptions Check and richer Decision Pack.

## Expected revenue impact
The request integration moves Solar from library-only capability toward an executable second-vertical journey while retaining a hard non-public gate and preserving Heat Pump. This increases speed to a trustworthy Solar paid-intent test without risking the live revenue path.

## Next actions
1. Require Solar CI `35701193912` to pass before treating request integration as verified.
2. Add Worker-level gate/isolation tests and verify Heat Pump remains unchanged.
3. Implement/verify PDF and image ingestion behind the gate; do not expose a public Solar CTA before rendered end-to-end verification.
4. Continue qualified Heat Pump acquisition and measure genuine analysis → checkout → purchase.

## Durable learning
No new reusable customer/product learning established. OPS/LEARNINGS.md remains unchanged.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
