# Current state

Updated: 2026-09-20 08:50 Europe/London

North star: Sustain at least £1,000 genuine monthly revenue. Immediate milestone: first genuine purchase, then £100 cumulative validation revenue within the original three-month window.

## Evidence refreshed
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed this run: 0 objects, `has_more=false`. Genuine production revenue remains £0 / £1,000 monthly North Star; cumulative validation revenue £0 / £100; paying customers 0.
- Durable funnel: no newer authoritative production Cloudflare snapshot was retrievable this runtime. Latest available baseline remains 48 genuine landings → 12 checker starts → 5 uploads → 5 genuine analyses. Extended cohort: 4 genuine analyses → 0 multi-quote analyses → 4 Decision Cases → 0 installer-question actions → 2 share intents → 0 share opens → 0 recipient starts → 0 outbound/commercial clicks → 0 durable checkouts. This predates the 07:42 mobile landing repair and 07:58 Decision Pack CTA repair, so it must not be treated as post-release performance.
- SEO/search: no newer authoritative Search Console dataset was available this run; latest settled evidence remains 13 sitemap URLs, 2 receiving impressions, 4 total impressions and 0 clicks.
- Production health: direct production fetch is unavailable in the current web reader. The most recent authoritative release evidence remains the 07:58 guarded production deploy and mobile journey smoke passing for commit `42f7817dbfef503f5f55fe0f014567c062feffb9`. Do not claim a fresher runtime health check.

## Technology mix
- Heat pump: live product; all currently classified durable funnel evidence belongs to the pre-solar product.
- Solar PV + battery: vertical #2 remains behind the non-public correctness gate; no genuine solar funnel activity yet.

## Commercial diagnosis
First-customer acquisition/conversion remains the binding objective. The two highest-value commercial defects discovered overnight — advertised £4.99 vs £19 checkout and the non-working Decision Pack purchase CTA — are now repaired. The next evidence requirement is a genuine post-fix checkout/purchase. Landing → checker start was 25% overall (12/48) in the pre-repair baseline; acquisition scale remains extremely low. Do not stack another homepage UI experiment until post-release evidence matures.

## Solar/battery research refreshed 2026-09-20
- GOV.UK guidance confirms solar PV and battery storage must be registered with the DNO and distinguishes connect-and-notify G98 from apply-to-connect G99, with G100 relevant where export is limited. The checker should therefore report what the quote says about DNO treatment and flag missing/ambiguous treatment, not assert approval.
- Energy Saving Trust guidance, updated 19 Aug 2026 for battery storage, recommends at least three MCS-certified installer quotes and warns battery savings may not alone justify cost. This supports comparison and assumption-transparency rather than deterministic ROI claims.
- MCS MGD 003 states solar self-consumption is an estimate, not a property-specific performance prediction, and is not an EESS design/sizing tool. Solar analysis must preserve installer assumptions and avoid certifying generation, savings or battery sizing.
- Ofgem approved a G98 amendment for plug-in microgeneration on 11 Aug 2026 but implementation depends on legislative changes. Do not generalise that change into ordinary rooftop quote logic until it is in force and relevant to the quoted system.

## Engineering debt / next safe backend change
- Durable metrics counts `decision_pack_checkout_created`, but checkout creation still does not record it, so durable checkout counts can understate created sessions.
- Stripe webhook retains a stale 1900-pence fallback if `amount_total` is absent; it should be 499 for the current Decision Pack.
- These are backend-only observability/correctness changes and should go through SHIP_CHANGE preview/canary/production gates.

## Next actions
1. Refresh Stripe and post-fix durable checkout/funnel evidence; first genuine £4.99 purchase is the immediate commercial milestone.
2. Patch checkout-created durable instrumentation and webhook fallback to 499 through guarded backend release when the relevant Worker file can be safely located, edited, tested and deployed.
3. Continue Solar PV + Battery extraction/evidence completeness behind the non-public gate using the refreshed DNO/performance-assumption rules; then comparison and Decision Pack reuse. No production CTA until correctness + rendered journey gates pass.
4. Continue qualified distribution and existing high-intent decision-page visibility without thin content.

## Guardrails
Use GitHub + Cloudflare only; never AppDeploy. UI-affecting production changes require rendered verification. Preserve independence, privacy and evidence/certification guardrails.
