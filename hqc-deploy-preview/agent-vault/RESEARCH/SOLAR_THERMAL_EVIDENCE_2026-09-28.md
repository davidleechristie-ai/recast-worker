# Solar thermal water heating — guarded vertical discovery

Updated: 2026-09-28 Europe/London. Status: private text-PDF analysis and browser result; no public selector, public analysis route or Solar thermal checkout.

## Why this is a separate quote check
Solar thermal collectors heat water through a cylinder/store and generally work with backup heating. Flat plates and evacuated tubes, cylinder and boiler/heat-pump integration, pipe routing, seasonal hot-water assumptions, roof/plumbing scope, warranties and maintenance are material quote questions. The Solar PV/Battery adapter measures electricity generation and cannot safely interpret these fields.

Sources reviewed:
- Energy Saving Trust, *Solar water heating*, updated 20 May 2026: https://energysavingtrust.org.uk/advice/solar-water-heating/
- MCS, *MIS 3001: 2025 Solar Heating Installation Standard*, issue 1.0: https://mcscertified.com/wp-content/uploads/2025/02/MIS-3001-2025-V1.0.pdf . Check the MCS library for a newer applicable issue before any public release.
- Ofgem, *Domestic RHI closure*: https://www.ofgem.gov.uk/environmental-and-social-schemes/domestic-renewable-heat-incentive-domestic-rhi/domestic-renewable-heat-incentive-domestic-rhi-domestic-rhi-closure . The scheme closed to new applicants on 31 March 2022; existing participants and change-of-ownership cases are distinct.

## Evidence model and guardrails
Initial required quote fields: collector technology and labelled aperture/absorber area; cylinder volume and integration; backup heater and control; stated annual solar heat yield and household assumptions; pump/pipework/roof/scaffold/commissioning inclusion and exclusions; water/overheat safeguards as installer confirmation questions; installer/product warranty; VAT-inclusive installed price and contingencies. Preserve exact provenance and separate proposed alternatives. Do not infer electricity generation from thermal yield or claim actual hot-water coverage, roof strength, water safety, planning permission, MCS certification, savings, or grant eligibility.

The private extractor captures unambiguous collector type/area, cylinder size, labelled annual heat and installed price, plus the explicitly stated scope, separate warranty periods and numeric hot-water assumptions described below, preserving quote wording. A historical RHI claim triggers a question; it never becomes a positive benefit. It does not analyse or approve installations. PV-only and mixed PV/thermal descriptions must leave unsupported values unknown.

## Release gates and next build
The private text-PDF analysis, two-quote comparison and mobile/desktop canary have passed on synthetic QA inputs; the public `solar_thermal` route remains 409. Still needed: representative contemporary permissioned/de-identified quote coverage and ≥95% required-field benchmark, broader scope/warranty/assumption wording, durable genuine attribution, technology-correct commercial output and a public real-host journey only after the other gates pass. Keep the public selector and paid product off until these pass. Demand is unmeasured; do not present solar thermal as the next proven revenue lever ahead of Heat Pump activation or Solar financial assumptions.

## Private adapter increment, 2026-09-28
The guarded handler now supports single and two-quote analysis from provenance-bearing text-PDF envelopes on the custom-domain canary only. It keeps annual heat as an installer claim, compares explicit fields without ranking installers, and rejects PV-only, image-only and malformed inputs. Canary `36475701975` and production `36475701880` passed; the real production route remains 409. This does not validate real-browser upload/results or representative real-quote capture. Continue expanding scope and warranty evidence and acquire permissioned/de-identified contemporary quote samples before public consideration.

## Private browser and scope increments, 2026-09-28
PR #58 established a private text-PDF browser bridge and rendered single/two-quote result. Custom-domain canary `36484312713` passed mobile/desktop upload, provenance, analysis, image rejection and layout; production `36484312775` retained public 409. PR #60 added named included/excluded/conditional roof mounting, scaffold, thermal pipework, pump/control and commissioning evidence; separate collector/cylinder/workmanship warranty periods; and numeric occupancy/daily hot-water assumptions. Its red-first tests preserve unknowns for conflicting/optional/PV wording. Canary `36485419156` passed expanded real-PDF mobile/desktop rendering and production `36485419147` retained public 409. These are small synthetic/QA cases, not a representative accuracy benchmark or proof of demand. Public release still requires permissioned contemporary de-identified quotes, ≥95% required-field validation, durable genuine telemetry and technology-correct commercial output.

## Private completion telemetry, 2026-09-28
PR #62 added server-confirmed, QA-excluded text-PDF completion and comparison counters by technology/source without quote text. PRs #63–#65 addressed Worker/Durable Object rollout readiness and paired release workflows. Final canary `36490642305` and production `36490642428` passed; public thermal API stayed 409. The 22:09Z cumulative production snapshot has 0 thermal completions and 0 comparisons, as expected for a non-public product with QA traffic excluded. This closes an instrumentation gate only; representative de-identified contemporary quotes, required-field accuracy and a suitable commercial proposition are still needed.
