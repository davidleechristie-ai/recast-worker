# Decision Pack release checklist

- Production uses Stripe hosted Checkout for a one-off £19 Decision Pack.
- `STRIPE_SECRET_KEY` remains a Worker secret and is never committed.
- The configured Stripe Price ID is `price_1UER4fCnmTy7aZ0Hp1zMfDYT`.
- Uploaded quote contents are not sent to Stripe; checkout uses an opaque HQC case reference.
- A successful return URL alone does not unlock the pack; payment status is verified server-side.
- QA/release probes must not create genuine traction events.
- The upload and manual-entry canary paths run in independent browser contexts.
- The live verification probe must reject a deliberately invalid case before creating a Stripe Checkout Session.
