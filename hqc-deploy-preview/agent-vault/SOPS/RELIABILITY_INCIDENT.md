# SOP — Reliability and incidents

P0: site/payment/core analysis unavailable. P1: upload, compare, navigation, major mobile journey or material evidence output broken. Verify impact, stabilise first and avoid unrelated refactors. Test, canary, production verify, then record cause, affected period, remediation and prevention. Exclude synthetic checks from traction metrics.

## Cloudflare production regression guard
The September 2026 Error 1101 incident established that preview/canary success does **not** prove the apex production custom-domain Worker is healthy. The bridge workflow deployed a valid preview while `homequotecheck.co.uk` was returning HTTP 500/Cloudflare Worker Error 1101; its production check was informational and therefore the overall run still appeared green.

For every future production-affecting build:
- test the real apex hostname after deployment/custom-domain adoption;
- fail closed on HTTP 5xx/1101 or missing HQC health markers;
- verify `/`, `/health`, `/api/_healthcheck`, a representative static route, and referenced CSS/JS;
- verify the browser analysis journey for changes touching Worker/API/upload/analysis routing;
- keep production-domain verification release-gating, not informational;
- if apex fails while preview passes, classify as a production routing/binding incident and use the reversible production recovery/cutover path before feature work resumes.

A build is not complete until the production-domain checks pass.
