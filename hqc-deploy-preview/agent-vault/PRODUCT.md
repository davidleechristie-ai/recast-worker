# Home Quote Check

## Objective
Build a sustainable independent consumer quote-checking business reaching at least **£1,000 genuine monthly revenue**. Immediate validation path: first genuine purchase → £100 cumulative revenue in the original three-month window → £250/month → £500/month → £1,000/month sustained.

## Strategic scope
Home Quote Check is an **independent home-energy quote checking platform**, not a permanently heat-pump-only product.

Vertical rollout:
1. **Heat pumps** — live vertical #1.
2. **Solar PV + battery storage** — vertical #2 now in build/validation. Battery-only should reuse this capability where practical.
3. Further technologies such as EV charging or insulation are deferred until measured demand justifies expansion.

Do not become a generic home-improvement quote marketplace. The reusable consumer job is: **Already have a quote? Independently check and compare it before you commit.**

## Positioning
For UK homeowners who already have one or more home-energy installer quotes and want to understand or compare the written proposals before committing. HQC checks documented evidence, scope, assumptions and differences. It does not sell installer leads and homeowner details are not the commercial product.

## Heat-pump evidence model
Check written evidence around price/scope, heat loss, nominal capacity, flow temperature, emitters/radiators, efficiency claims, equipment, exclusions and relevant MCS/BUS wording. Automated extraction is not design certification, MCS certification or grant eligibility.

## Solar + battery evidence model
Where evidenced in the quote, extract/compare:
- panel make/model/count and array kWp
- inverter make/model/rating
- battery make/model and usable capacity
- annual generation estimate and the stated estimation basis
- self-consumption/export assumptions
- shading assumptions where stated
- scaffolding, roof works and other material scope/exclusions
- DNO/grid-connection treatment (including G98/G99/G100 wording where present)
- equipment/workmanship warranties
- MCS certification claims/wording
- price and payment/scope differences

Guardrails: do not certify electrical design, roof/structural suitability, DNO approval, MCS status, savings, generation, self-consumption or export outcomes. Treat performance figures as installer/quote estimates and surface the assumptions. Current MCS MIS 3002 requires pre-sale annual-generation and self-consumption estimates and explicitly warns that performance cannot be predicted with certainty. Current GOV.UK guidance confirms solar PV and battery storage require DNO notification and that connection treatment varies by system. Energy Saving Trust recommends obtaining at least three installer quotes.

## Commercial model
Free initial quote analysis and free multi-quote comparison demonstrate value. Current heat-pump paid boundary is a one-off **£4.99 Decision Pack**. Solar/battery pricing must be tested from genuine demand rather than assumed; reuse the paid decision-report pattern only once the solar analysis is trustworthy.

## Commercial journey
qualified acquisition → technology selected → understands independent value → checker start → quote upload/manual entry → technology-specific genuine analysis → comparison → decision value → checkout → genuine purchase → privacy-safe share/referral.

Anonymous aggregate funnel evidence should be segmented by technology without expanding PII.

## Guardrails
Preserve independence and privacy. Commercial relationships must never influence analysis or comparison results. Never imply installer endorsement merely from a quote. Do not launch a solar upload/check CTA until the analysis behind it is technology-specific and passes correctness + rendered journey gates.

## Deployment
Use GitHub/Cloudflare via hqc-deploy-preview and Worker hqc-production with preview/canary before material releases. Never use AppDeploy. Preserve homequotecheck.co.uk and www routing.
