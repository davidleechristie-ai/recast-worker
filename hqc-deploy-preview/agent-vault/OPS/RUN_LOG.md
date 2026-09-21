# Run log

Append concise dated run records here. Record only observed evidence and completed work.

## 2026-09-21 04:48 Europe/London — dedicated Solar/Battery extraction slice implemented
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: 0 objects, `has_more=false`; genuine monthly revenue £0 / £1,000; cumulative validation revenue £0 / £100; paying customers 0.
- Funnel/acquisition: no newer authoritative production snapshot available; latest settled remains 55 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 durable checkouts. Latest settled direct cohort remains 39 / 16 / 5 / 5. Unavailable fresh evidence was not converted to zero.
- Technology/search: measured technology mix remains partial (`heat_pump` 2 landings / 1 start); Solar/Battery remains non-public. No newer authoritative Search Console dataset was available; latest settled remains 0 clicks / 4 impressions through 2026-09-18.
- Production/CI: prior fixture-contract commit `16fa62bd70103162e4bedf38bddaa989abd32ce0` Cloudflare bridge completed successfully; its custom-domain canary was cancelled, so no canary claim. New extraction-test CI is pending.
- SOP: loaded `SOPS/SHIP_CHANGE.md`. No production deployment attempted because Solar remains behind the non-public correctness gate and the new adapter has not yet passed CI/regression/preview gates.
- COMPLETED: added `lib/solar-battery-extraction.js`, a dedicated Solar/Battery quote-text extractor that feeds the existing validated evidence contract and preserves missing evidence as null/gaps instead of using Heat Pump logic. Added `test/solar-battery-extraction.test.mjs` covering solar-only, solar+battery, battery-only, partial and comparison fixtures. Commits `021c553781d05ac1c3c49754227089ec05e81558` and `f37d67704a18685e6c5f163194d52c7bee956660`.
- Primary revenue bottleneck: first-customer acquisition/conversion; latest settled start→upload remains 31%.
- Expected revenue impact: creates the first executable technology-specific extraction path required for a trustworthy Solar/Battery vertical, shortening time to a second paid-intent market without destabilising Heat Pump; acquisition remains the immediate first-revenue route.
- Learning: no new durable lesson; implementation progress alone does not establish a reusable commercial/product conclusion.
- NEXT: verify/fix extraction CI, harden partial/malformed cases, then wire technology routing + adapter into Worker behind the non-public gate and run Heat Pump regressions before preview/canary. Continue acquisition evidence refresh in parallel.

## 2026-09-20 22:41 Europe/London — authoritative revenue refresh; Purchase Adviser roadmap made executable
- Revenue: authoritative live Stripe `Home Quote Check` PaymentIntents refreshed: 0 objects, `has_more=false`; genuine monthly revenue £0 / £1,000; cumulative validation revenue £0 / £100; paying customers 0.
- Durable funnel/acquisition: fresh production growth evidence was unavailable in this execution context; latest settled snapshot remains 55 landings → 16 starts → 5 uploads → 5 genuine analyses and 0 durable checkouts. Latest settled direct cohort remains 39 landings / 16 starts / 5 uploads / 5 genuine analyses. Unavailable fresh evidence was not converted to zero.
- Technology mix: latest measured segmentation remains partial (`heat_pump` 2 landings / 1 start); Solar/Battery remains non-public.
- Search: fresh public site searches for both heat-pump and solar/battery footprints returned no results; no newer authoritative Search Console dataset was available.
- Production health: fresh direct health/growth evidence was unavailable; latest verified production release remains settled evidence, with fresh health recorded as null.
- SOP: loaded `SOPS/SHIP_CHANGE.md`; no production release was attempted because the routing foundation is not yet wired/CI/preview verified.
- Work completed: converted `STRATEGY/PURCHASE_ADVISER_ROADMAP.md` into explicit execution state: WS1 IN PROGRESS; WS2 IN PROGRESS with routing contract/isolation tests marked complete; WS3 blocked on Worker routing/adapter boundary; WS5 queued after trustworthy extraction; WS7 IN PROGRESS via the existing £4.99 Decision Pack; WS8/WS9 deferred. Commit `0c4ba772b874881e1ccc9b685c297d31dafdc964`. Refreshed `OPS/CURRENT_STATE.md` with authoritative revenue and roadmap state in commit `87d70daf2e309b123a5ee2927e468edef4e25d68`.
- Primary revenue bottleneck: first-customer acquisition/conversion; latest settled start→upload remains 31%.
- Expected revenue impact: future runs can resume at the first incomplete Solar correctness gate instead of rediscovering strategy; completed source work is no longer confused with deployed capability, reducing time/risk to a trustworthy second vertical while acquisition continues in parallel.
- Learning: no new durable learning added; current evidence reinforces existing lessons but does not establish or overturn a reusable conclusion.
- Next autonomous execution: refresh Stripe/durable funnel; continue qualified acquisition/intake activation; wire technology routing into the Worker behind the non-public gate, run Heat Pump/routing regressions, then preview/canary if gates pass; do not expose Solar publicly.

## Earlier runs
Earlier detailed run history remains available in repository history. The current state and durable learnings carry forward the authoritative operating context.