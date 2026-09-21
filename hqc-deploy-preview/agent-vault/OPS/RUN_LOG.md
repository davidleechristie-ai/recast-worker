# Run log

Append concise dated run records here. Record only observed evidence and completed work.

## 2026-09-22 00:42 Europe/London — P0 UI recovery path gains rendered style gates
- Revenue: no newer authoritative Stripe result was available in this execution context; latest authoritative Home Quote Check PaymentIntents remains 0 objects / `has_more=false`, so revenue remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers. Fresh unavailable evidence is null.
- Funnel/acquisition: no fresh production endpoint evidence available; latest settled evidence remains 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains 40 → 16 → 5 → 5.
- Search: no newer authoritative Search Console dataset available; latest through 2026-09-19 remains 0 clicks / 4 impressions / 0% CTR / average position 8.07.
- Production presentation: owner-provided broken iPhone render remains authoritative; P0 is not closed. Latest backend health remains the previously verified Heat Pump 200 / explicit Solar 409 / durable metrics 200 state.
- COMPLETED: strengthened `.github/workflows/hqc-production.yml` in commit `3a3c3bbfd26329b41ac17f7f8053e2be711f653a`. Before any UI production deploy, a local rendered snapshot is now tested at 390×844 and 1440×1000. Gate requires at least one CSS stylesheet, rejects browser-default link/body styling, checks visible commercial CTAs, horizontal overflow and failed stylesheet requests. After deploy, production receives the same mobile+desktop computed-style integrity checks plus interaction verification.
- RELEASE DECISION: no frontend recovery deployment was triggered in this run because the known broken production origin is still the snapshot source. The new gate must be used with a known-good recoverable asset source; P0 remains open rather than replacing broken assets blindly.
- Solar remains non-public. No roadmap status changed; existing 9/9 extraction and 9/9 routing evidence remains valid.
- OPS/LEARNINGS.md unchanged: this is release-engineering progress, not authoritative customer/product learning.
- NEXT: recover a known-good frontend bundle through the strengthened UI path, require pre-deploy rendered pass, deploy, then require rendered production mobile+desktop pass before resuming acquisition and Solar public exposure.

## 2026-09-21 22:45 Europe/London — revenue refreshed; P0 recovery gate tightened in diagnosis
- REVENUE EVIDENCE: authoritative live Stripe `Home Quote Check` PaymentIntents returned 0 objects with `has_more=false`. Genuine monthly revenue remains £0 / £1,000; cumulative validation revenue £0 / £100; paying customers 0.
- Funnel/acquisition: fresh production endpoint access was unavailable in this execution environment; latest settled evidence remains 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Missing fresh evidence remains null.
- Search: no newer authoritative Search Console dataset was available; latest through 2026-09-19 remains 0 clicks / 4 impressions / 0% CTR / average position 8.07.
- Production presentation: no fresh rendered evidence supersedes the owner-provided broken iPhone result; P0 frontend recovery remains open. Latest verified backend production state remains healthy from the prior asset-free router release.
- RECOVERY DIAGNOSIS: inspected `snapshot.mjs`, the historical stylesheet diagnostic and `.github/workflows/hqc-production.yml`. The snapshot code verifies that a referenced stylesheet is fetched and non-empty, while the production workflow checks asset presence and a headless mobile interaction. It does not currently prove meaningful computed styling/layout before a UI production release. Historical diagnostic shows the expected `/assets/index-*.css` pattern but predates the regression and is not recovery proof.
- DECISION: do not trigger a blind full frontend redeploy. First strengthen preview/canary rendered-style verification, then recover through the dedicated UI release path and verify iPhone + desktop before resuming acquisition or public Solar exposure.
- Solar remains non-public; existing 9/9 extraction and 9/9 routing evidence is retained but does not outrank the P0.
- OPS/LEARNINGS.md unchanged: no new authoritative reusable customer/product lesson was established.

## 2026-09-21 21:46 Europe/London — backend release isolation verified in production
- Revenue/search/funnel: no newer authoritative Stripe, parsed durable-funnel or Search Console dataset was available; latest verified revenue remains £0 / £1,000 monthly, validation revenue £0 / £100, paying customers 0; latest settled funnel remains 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses and 0 durable checkouts. Missing fresh evidence remains null.
- Production presentation: no fresh rendered evidence supersedes the owner-provided broken iPhone result; P0 frontend recovery remains open.
- RELEASE EVIDENCE: run `35646864766` for commit `be3c4ef823ab0bae3afdef806d859e2aaa59c25b` completed success. Solar evidence/extraction passed 9/9; technology/request routing passed 9/9.
- COMPLETED: router-only config was generated inside `hqc-deploy-preview`, contained no `[assets]` section, resolved `worker-entry.js`, and deployed production version `fc1888f3-f19f-4b08-aec3-a4957b3fd788`. Wrangler reported only Worker/Durable Object/environment bindings and no static asset upload. Live verification passed Heat Pump/default health 200, explicit Solar gate 409 with `technology_analysis_not_ready`, and durable metrics 200.
- DECISION: backend release recurrence path is now contained and verified. Do not treat this as frontend recovery; the public presentation remains P0 until rendered mobile/desktop evidence proves restoration.
- Solar public expansion remains paused behind P0 frontend recovery; non-public engineering may continue independently.
- NEXT: recover a known-good frontend through the dedicated UI release path with rendered iPhone + desktop verification, then resume qualified acquisition and Solar public gates.

## Earlier runs
Earlier detailed run history remains available in repository history. The current state and durable learnings carry forward the authoritative operating context.