# Solar PV + Battery evidence rules — 2026-09-21

Purpose: authoritative inputs for the non-public Solar/Battery adapter and later Financial Assumptions Check. This is product research, not customer evidence and not certification logic.

## Current authoritative findings

1. **DNO treatment is a material quote evidence field.** GOV.UK guidance for England, Scotland and Wales says solar PV and battery storage must be registered/notified with the local Distribution Network Operator. Depending on the connection, notification may be after installation or an apply-to-connect route may require G99 before installation; export-limited systems can involve G100. The quote checker should therefore extract what the installer actually says about DNO/G98/G99/G100 and flag absence/ambiguity, but must not decide that approval has been granted.
   Source: https://www.gov.uk/government/publications/register-energy-devices-in-homes-or-small-businesses-guidance-for-device-owners-and-installation-contractors/register-energy-devices-in-homes-or-small-businesses-guidance-for-device-owners-and-installation-contractors

2. **G98/G99 are current, evolving connection standards.** Ofgem approved DCRP/MP/24/01 changes to G98/G99 in February 2025 and approved DCRP/MP/26/02 in August 2026 to facilitate plug-in microgeneration, with implementation tied to future legislative amendments. HQC must not hard-code a simplistic rule such as “solar under X kW = G98 approved”. Extract quote wording and use current authoritative guidance at interpretation time.
   Sources: https://www.ofgem.gov.uk/publications/distribution-code-modification-dcrpmp2401 and https://www.ofgem.gov.uk/publications/dcrpmp2602-distribution-code-proposed-changes

3. **Self-consumption is an estimate, not a property-specific performance guarantee.** MCS MGD 003 describes a domestic method for estimating PV self-consumption with and without electrical energy storage. It explicitly describes inherent uncertainty from behaviour and generation and says the result is not a performance prediction for an individual property. It can sense-check battery sizing but is not a battery design/sizing tool. HQC Financial Assumptions Check must therefore expose installer assumptions and sensitivity/ranges rather than certify savings or optimal battery size.
   Source: https://mcscertified.com/wp-content/uploads/2022/04/MGD-003-Solar-PV-Self-Consumption-Issue-2.0-Final.pdf

4. **Battery economics are usage/tariff dependent.** Energy Saving Trust's battery guidance, updated 19 August 2026, says batteries can store solar surplus or shift cheap-tariff electricity and that savings may not alone justify the upfront cost. HQC should parse usable capacity, stated cycling/use assumptions, import/export tariff assumptions and claimed annual benefit separately.
   Source: https://energysavingtrust.org.uk/advice/battery-storage/

5. **Multiple quotes, certification, warranties and scope are decision evidence.** Energy Saving Trust recommends at least three quotes, MCS-certified installers for solar, and checking installer qualifications, guarantees/warranties and system detail rather than cost alone. HQC comparison should therefore normalise scope, equipment, warranties, exclusions and price rather than rank on price alone.
   Sources: https://energysavingtrust.org.uk/advice/solar-panels and https://energysavingtrust.org.uk/service/choosing-the-right-installer/

## Adapter requirements derived from evidence

The Solar/Battery adapter should preserve source provenance and nulls for absent evidence. Extract where present:
- panel make/model/count and array kWp
- inverter make/model/rating
- battery make/model and **usable** capacity (distinguish from nominal if both are stated)
- annual generation estimate and stated basis/assumptions
- annual household consumption assumption if present
- self-consumption/export assumptions
- shading/orientation/inclination assumptions where stated
- scaffolding and roof works
- DNO/G98/G99/G100 wording and whether the quote describes notification/application/approval as a claim
- MCS claim/status wording as a claim, not verified certification
- equipment/workmanship warranties
- scope, exclusions, payment schedule and total price

## Interpretation guardrails

- Missing evidence remains null/unknown; never infer zero or “not included”.
- A quote saying “G99 application included” is not evidence of DNO approval.
- MCS wording in a quote is not independent verification of installer/product certification.
- Generation/self-consumption/savings figures are installer estimates unless independently reconstructed from visible assumptions.
- HQC must not infer roof/structural suitability, electrical design compliance, DNO approval, grant eligibility, guaranteed generation, guaranteed savings or optimal battery sizing.
- Deterministic financial calculations must be separate from generative interpretation and show material inputs.

## Next implementation slice

Use these rules as acceptance criteria when binding `test/fixtures/solar-battery-cases.json` to the dedicated Solar/Battery structured extraction adapter. Keep the public CTA gated until routing, extraction, comparison, instrumentation, checkout and rendered journey gates pass.
