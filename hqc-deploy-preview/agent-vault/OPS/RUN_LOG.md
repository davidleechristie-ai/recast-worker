# Run log

Append concise dated run records here. Record only observed evidence and completed work.

## 2026-09-22 02:46 Europe/London — guarded known-good frontend recovery committed
- Revenue: no newer authoritative Stripe result available in this execution context; latest authoritative Home Quote Check PaymentIntents remains 0 objects / `has_more=false`: £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers. Fresh unavailable evidence is null.
- Funnel/acquisition: fresh production endpoint evidence unavailable; latest settled remains 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains 40 → 16 → 5 → 5.
- Search: no newer authoritative Search Console dataset available; latest through 2026-09-19 remains 0 clicks / 4 impressions / 0% CTR / average position 8.07.
- P0: owner-provided unstyled iPhone render remains authoritative until recovery passes rendered production verification.
- RECOVERY INVENTORY: run `35673186035` completed successfully. Cloudflare history includes version `1931e05c-439c-474e-9879-9b52b19794cd`, created 2026-09-20 06:38:59Z immediately after the guarded production mobile-repair promotion at 07:38 BST; this is the strongest available mapping to the known-good rendered state.
- COMPLETED: added `.github/workflows/hqc-p0-frontend-recovery.yml` in commit `8800ff1ca690551db71b202677718446cde4f870`. It uses Cloudflare rollback to restore the complete known-good version rather than rebuilding from the broken origin, then requires HTTP checks and Playwright rendered integrity at 390×844 and 1440×1000: stylesheet loaded, non-default typography/link styling, no horizontal overflow, visible single/compare CTAs, and upload entry after click.
- RELEASE STATE: no Actions run had registered for the recovery commit at final check, therefore no rollback or production recovery is claimed yet.
- Solar remains non-public. A rollback to the older complete version may temporarily remove the newer routing boundary; because no Solar CTA is public, safety is preserved while presentation recovery remains P0. Re-establish current isolation only through a method proven to preserve recovered assets.
- OPS/LEARNINGS.md unchanged: this is operational recovery evidence, not a customer/product lesson.
- NEXT: inspect the recovery workflow once registered; close P0 only on successful rendered production evidence, then refresh funnel/revenue and resume qualified acquisition.

## 2026-09-22 01:45 Europe/London — known-good Cloudflare recovery inventory initiated
- REVENUE: fresh authoritative live Stripe `Home Quote Check` PaymentIntents returned 0 objects with `has_more=false`; genuine revenue remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers.
- Funnel/acquisition: fresh production endpoint evidence unavailable; latest settled evidence remains 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains 40 → 16 → 5 → 5. Missing fresh evidence is null.
- Search: no newer authoritative Search Console dataset available; latest through 2026-09-19 remains 0 clicks / 4 impressions / 0% CTR / average position 8.07.
- Production presentation: owner-provided broken iPhone render remains authoritative P0 evidence. Fresh direct health unavailable; latest backend health remains previously verified Heat Pump 200 / explicit Solar 409 / durable metrics 200.
- RECOVERY EVIDENCE: repository history establishes a rendered, guarded, successful mobile production repair on 2026-09-20, including custom-domain canary and production promotion. This gives a concrete known-good recovery epoch rather than requiring a new snapshot from the legacy external origin.
- COMPLETED: added read-only `.github/workflows/hqc-recovery-inventory.yml` in commit `e513190d5a4189c89d44181b3e3757e4dccb0bab`. It lists Cloudflare `hqc-production` deployments and versions using Wrangler and explicitly performs no deployment, rollback or asset mutation. Run `35673186035` queued successfully.
- DECISION: do not rebuild or recover production from AppDeploy. Use Cloudflare's own version/deployment history to identify the last known-good asset-bearing version, then recover through a guarded rollback path and rendered verification. This obeys the GitHub/Cloudflare-only boundary and avoids snapshotting the currently unsafe source.
- Solar remains non-public; no Solar readiness claim changed. Acquisition remains paused while the customer-facing P0 is open.
- OPS/LEARNINGS.md unchanged: no reusable customer/product lesson established.
- NEXT: inspect inventory output, select the last known-good Cloudflare version/deployment before the regression and verify it corresponds to the 2026-09-20 rendered mobile production state.

## 2026-09-22 00:42 Europe/London — P0 UI recovery path gains rendered style gates
- Revenue: latest authoritative Home Quote Check PaymentIntents remains 0 objects / `has_more=false`, so revenue remains £0 / £1,000 monthly, £0 / £100 validation, 0 paying customers.
- Funnel/acquisition: latest settled evidence remains 56 genuine landings → 16 starts → 5 uploads → 5 genuine analyses; 4 Decision Cases → 2 share intents → 0 share opens → 0 durable checkouts. Direct remains 40 → 16 → 5 → 5.
- COMPLETED: strengthened `.github/workflows/hqc-production.yml` in commit `3a3c3bbfd26329b41ac17f7f8053e2be711f653a` with local and production rendered style gates at mobile+desktop widths.
- Solar remains non-public. OPS/LEARNINGS.md unchanged.

## 2026-09-21 21:46 Europe/London — backend release isolation verified in production
- RELEASE EVIDENCE: run `35646864766` completed success; Solar extraction 9/9 and routing/isolation 9/9.
- Router-only production version `fc1888f3-f19f-4b08-aec3-a4957b3fd788` verified Heat Pump/default 200, explicit Solar 409, durable metrics 200.
- DECISION: backend recurrence path contained; frontend P0 remained open.

## Earlier runs
Earlier detailed run history remains available in repository history. The current state and durable learnings carry forward the authoritative operating context.