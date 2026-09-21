# Current state

Updated: 2026-09-21 14:44 Europe/London

North star: Sustain at least **£1,000 genuine monthly revenue**. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month validation window.

## Evidence refreshed
- Revenue: no newer authoritative Stripe object set was available in this execution context; latest verified live `Home Quote Check` PaymentIntent evidence remains 0 objects, `has_more=false`. Genuine production revenue remains **£0 / £1,000 monthly**, cumulative validation revenue **£0 / £100**, paying customers **0**. Stale evidence is not relabelled as fresh.
- Durable funnel/acquisition: no newer parsed authoritative snapshot was available; latest settled remains 55 genuine landings → 16 starts → 5 uploads → 5 genuine analyses, with 4 Decision Cases → 2 share intents → 0 durable checkouts. Direct remains 39 → 16 → 5 → 5. Unavailable fresh evidence is null, not zero.
- Search: no newer authoritative Search Console dataset was available; latest evidence through 2026-09-19 remains 0 clicks, 4 impressions, 0% CTR, average position 8.07.
- Production: authoritative bridge logs confirm the production domain returned HTTP 200 during routing inspection at 2026-09-21 13:04Z. This is health evidence only; the new router has not yet been deployed to production.
- Preview: workflow `35603189156` for `6c436d8b082f402da12fb70463fcf211a02518b6` completed successfully. Solar evidence/extraction tests passed **9/9**; `hqc-migration-preview` deployed version `daf09043-fa92-4cc9-8798-4b8d9a747b9a`; preview verification passed all checked routes/assets/API health. The Durable Object export regression is fixed.

## Commercial diagnosis
First-customer acquisition/conversion remains binding. Latest settled start→upload is 31% (5/16). No new customer evidence justifies another Heat Pump UI experiment. Public product expansion can now proceed incrementally because the technology-routing preview gate is green.

## Current milestone
First genuine £4.99 Decision Pack purchase.

## Product strategy / Solar-Battery progress
- Technology-aware request isolation is now **VERIFIED IN PREVIEW**. Heat Pump delegates to the existing path; explicit Solar/Battery cannot silently fall through to Heat Pump.
- Representative Solar evidence/extraction remains 9/9 green.
- Cloudflare Durable Object compatibility is preserved by re-exporting `HqcMetrics` from `worker-entry.js`; preview deployment and verification prove the previous error 10064 is resolved without deleting/migrating metrics data.
- Production config has now been changed on main to use the verified `worker-entry.js` (`f753ac9a85e74b6dc9268f365445bb9a0880f93e`). This prepares the safe non-UI production boundary; it does not expose a Solar CTA and does not configure a Solar analysis service.
- Public Solar analysis remains gated because the dedicated Solar extraction adapter is not yet an executable configured HTTP analysis path and the required single/two-quote, checkout and rendered UI gates are not complete.

## Active workstreams
1. Qualified high-intent acquisition: continue quote-holder distribution; this remains the immediate route to first revenue.
2. Upload activation: diagnose from durable evidence before further UI change.
3. Paid boundary: retain £4.99 until genuine willingness-to-pay evidence changes.
4. Solar/Battery: move verified routing boundary into production safely, then connect a dedicated executable Solar adapter and prove complete journeys before public CTA.
5. Instrumentation: reuse anonymous technology dimensions; do not expand PII.

## Expected revenue impact
The preview-verified routing boundary removes the dangerous Solar→Heat Pump leakage failure and is now prepared for production. This enables progressive public expansion without destabilising the existing Heat Pump journey. The next revenue-enabling product step is executable Solar analysis behind that boundary, while acquisition continues in parallel.

## Next actions
1. Refresh authoritative Stripe/funnel evidence on every run.
2. Deploy/verify the non-UI technology router to production using the existing GitHub/Cloudflare release route; confirm Heat Pump regression, durable metrics and explicit Solar rejection before enabling any Solar CTA.
3. Connect the verified Solar extraction adapter to an executable gated analysis path.
4. Prove single/two-quote Solar journeys, guardrails, technology instrumentation and checkout.
5. Complete rendered mobile/desktop verification before exposing Solar publicly.
6. Begin deterministic Financial Assumptions Check after trustworthy end-to-end Solar analysis.

## Durable learning
No new durable customer/product lesson. Preview success is implementation/release evidence under the existing technology-readiness lesson.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy for deployment. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
