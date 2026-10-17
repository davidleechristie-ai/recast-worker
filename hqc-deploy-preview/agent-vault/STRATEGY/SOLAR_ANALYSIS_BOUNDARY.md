# Solar/Battery Analysis Boundary

Updated: 2026-09-20
Status: implementation design; non-public

## Revenue purpose
Remove the current heat-pump-only analysis dependency so HQC can acquire and monetise Solar PV + Battery quote holders without destabilising the live Heat Pump path.

## Confirmed current state
- The Cloudflare Worker has reusable anonymous technology dimensions: `heat_pump`, `solar_battery`, `battery`.
- Decision Pack checkout-created telemetry already accepts and records technology.
- Non-payment analysis traffic still uses the heat-pump-specific upstream base `heat-pump-second-opinion-v43csv`.
- Therefore technology instrumentation is ready but Solar/Battery analysis is not.

## Target boundary
The public client sends the selected technology with the existing analysis request. The Worker validates it and routes analysis through a technology adapter. Heat Pump retains the current upstream route initially. Solar/Battery and battery-only must not call heat-pump analysis logic.

### Technology values
- `heat_pump`
- `solar_battery`
- `battery`

Unknown or missing technology must not silently become Solar/Battery. Existing Heat Pump compatibility may default legacy requests to `heat_pump` only where that preserves current behaviour.

## Solar/Battery structured evidence contract
Every extracted field is nullable and carries provenance. Missing evidence stays unknown; never infer zero.

Required fields where evidenced:
- quote price/currency and payment schedule
- panel make/model/count
- array kWp
- inverter make/model/rating
- battery make/model and usable capacity
- annual generation estimate and stated estimation basis
- self-consumption assumption
- export assumption
- shading assumption where stated
- scaffolding and roof works
- DNO/G98/G99/G100 wording/status as stated in the quote
- equipment and workmanship warranties
- MCS claim/status wording as stated
- scope and exclusions

Each finding should distinguish:
- `quote_evidence`: explicitly present in uploaded material
- `homeowner_input`: explicitly supplied by homeowner
- `authoritative_source`: externally verified, with source/date
- `calculation`: deterministic output with visible inputs
- `unknown`: not established

## Guardrails
Do not output electrical/design certification, structural/roof suitability, DNO approval, MCS certification, grant eligibility, guaranteed generation, guaranteed self-consumption or guaranteed savings. Installer performance figures remain installer claims unless independently reconstructed. Generative text may explain structured evidence but must not manufacture missing facts.

## Comparison contract
Normalise two or more quotes onto the same evidence dimensions. A difference is shown only when both sides are evidenced or when one side is explicitly missing. Do not rank installers with an opaque score. Generate installer questions from material evidence gaps or differences.

## Financial Assumptions boundary
Keep deterministic calculations separate from extraction. Initial Solar/Battery calculation inputs should be: quoted annual generation, homeowner annual consumption where supplied, self-consumption assumption, import tariff, export tariff, battery usable capacity/cycling assumptions where relevant. Output ranges/sensitivity and expose every input. This layer is not part of the first extraction gate unless required for a trustworthy finding.

## Implementation sequence
1. Trace current upload/analyse/compare request and response shapes.
2. Add server-side technology validation/routing behind the non-public gate.
3. Preserve Heat Pump routing unchanged.
4. Implement Solar/Battery structured extraction adapter.
5. Add solar-only, solar+battery, battery-only, partial/malformed and two-quote fixtures.
6. Verify no Solar/Battery fixture reaches heat-pump logic.
7. Reuse existing Decision Case/share/checkout plumbing with technology dimension.
8. Run correctness/regression tests.
9. Run preview/canary.
10. Before any public CTA, complete rendered desktop/mobile verification.

## Exit criteria
Representative Solar/Battery fixtures produce technology-specific structured evidence, gaps, comparison dimensions and installer questions; Heat Pump regression remains green; anonymous technology instrumentation and checkout remain intact; no Solar request is handled by heat-pump analysis logic. Public exposure remains separately gated by rendered journey verification.