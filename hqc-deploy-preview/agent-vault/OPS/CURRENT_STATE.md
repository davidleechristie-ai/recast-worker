# Current state

Updated: 2026-09-20 07:49 Europe/London

North star: Sustain at least £1,000 genuine monthly revenue. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month window.

## Evidence refreshed
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed this run: 0 objects, `has_more=false`. Genuine production revenue remains £0; cumulative validation revenue £0; paying customers 0.
- Durable funnel: latest available production Cloudflare snapshot remains 48 genuine landings → 12 checker starts → 5 uploads → 5 genuine analyses. Extended cohort: 4 genuine analyses → 0 multi-quote analyses → 4 Decision Cases → 0 installer-question actions → 2 share intents → 0 share opens → 0 recipient starts → 0 outbound/commercial clicks → 0 durable checkouts. This snapshot predates the 07:42 mobile landing repair, so it is baseline rather than post-release evidence.
- SEO/search: latest settled authoritative Search Console evidence remains 13 sitemap URLs, 2 receiving impressions, 4 total impressions and 0 clicks. No newer authoritative GSC evidence was available this run.
- Production/payment path: £4.99 production price correction is deployed and the mobile landing repair was successfully promoted immediately before this run. No PaymentIntent exists after either release yet.

## Technology mix
- Heat pump: live product; all currently classified durable funnel evidence belongs to the pre-solar product.
- Solar PV + battery: vertical #2 is in build/validation. No production solar CTA and therefore no genuine solar funnel activity yet. This is intentional until technology-specific analysis passes correctness and rendered journey gates.

## Commercial diagnosis
First-customer acquisition/conversion remains the binding objective. Landing → checker start is the earliest adequately sampled weakness at 25% overall (12/48); checker start → upload is 42%; upload → genuine analysis is 100%. Acquisition scale remains extremely low. The newly deployed mobile landing repair directly targets the earliest weakness, so do not stack another homepage UI experiment before post-release evidence matures.

## Strategic execution
- Persistent operator instructions are now aligned to the home-energy platform strategy: Heat Pumps vertical #1; Solar PV + Battery Storage vertical #2; battery-only reuses that capability where practical.
- Solar must remain technology-specific and evidence-led. Do not route solar quotes through heat-pump analysis and do not expose a production solar upload/check CTA prematurely.
- Anonymous aggregate funnel instrumentation should carry technology once solar launches so willingness-to-pay and conversion can be compared without collecting more PII.

## Engineering debt / next safe backend change
- Durable metrics counts `decision_pack_checkout_created`, but checkout creation still does not record it, so durable checkout counts can understate created sessions.
- Stripe webhook retains a stale 1900-pence fallback if `amount_total` is absent; it should be 499 for the current Decision Pack.
- These are backend-only observability/correctness changes and should go through SHIP_CHANGE preview/canary/production gates.

## Next actions
1. Measure genuine mobile checker starts/uploads after the newly deployed landing repair; preserve attribution until enough post-release evidence exists.
2. Patch checkout-created durable instrumentation and webhook fallback to 499 through guarded backend release when the relevant Worker file can be safely edited/tested/deployed.
3. Build Solar PV + Battery technology-specific extraction/evidence completeness behind a non-public gate, then comparison and Decision Pack reuse; no production CTA until correctness + rendered journey gates pass.
4. Continue qualified distribution and existing high-intent decision-page visibility without thin content.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
