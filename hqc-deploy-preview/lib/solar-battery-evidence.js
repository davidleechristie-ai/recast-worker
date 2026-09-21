// Structured evidence contract for the non-public Solar PV + Battery adapter.
// This module validates adapter output; it does not infer missing facts and does not
// certify design, roof suitability, DNO approval, MCS status, generation or savings.

const numberOrNull = value => Number.isFinite(Number(value)) ? Number(value) : null;
const textOrNull = value => typeof value === 'string' && value.trim() ? value.trim() : null;

const equipment = value => {
  if (!value || typeof value !== 'object') return null;
  const make = textOrNull(value.make);
  const model = textOrNull(value.model);
  return make || model ? { make, model } : null;
};

export function normaliseSolarBatteryEvidence(input = {}) {
  const panelBase = equipment(input.panel);
  const inverterBase = equipment(input.inverter);
  const batteryBase = equipment(input.battery);
  return {
    technology: input.technology === 'battery' ? 'battery' : 'solar_battery',
    panel: panelBase ? { ...panelBase, count: numberOrNull(input.panel?.count) } : null,
    arrayKwp: numberOrNull(input.arrayKwp),
    inverter: inverterBase ? { ...inverterBase, ratingKw: numberOrNull(input.inverter?.ratingKw) } : null,
    battery: batteryBase ? { ...batteryBase, usableCapacityKwh: numberOrNull(input.battery?.usableCapacityKwh) } : null,
    batteryMentioned: input.batteryMentioned === true || Boolean(batteryBase),
    annualGenerationKwh: numberOrNull(input.annualGenerationKwh),
    generationBasis: textOrNull(input.generationBasis),
    selfConsumptionPercent: numberOrNull(input.selfConsumptionPercent),
    exportPercent: numberOrNull(input.exportPercent),
    shadingAssumption: textOrNull(input.shadingAssumption),
    scaffolding: textOrNull(input.scaffolding),
    roofWorks: textOrNull(input.roofWorks),
    dnoTreatment: textOrNull(input.dnoTreatment),
    warranties: Array.isArray(input.warranties) ? input.warranties.map(textOrNull).filter(Boolean) : [],
    mcsWording: textOrNull(input.mcsWording),
    scope: Array.isArray(input.scope) ? input.scope.map(textOrNull).filter(Boolean) : [],
    exclusions: Array.isArray(input.exclusions) ? input.exclusions.map(textOrNull).filter(Boolean) : [],
    priceGbp: numberOrNull(input.priceGbp),
  };
}

export function solarBatteryEvidenceGaps(input = {}) {
  const e = normaliseSolarBatteryEvidence(input);
  const gaps = [];
  if (e.technology !== 'battery' && (!e.panel?.model || !e.panel?.count)) gaps.push('panel specification');
  if (e.technology !== 'battery' && e.arrayKwp === null) gaps.push('array size');
  if (!e.inverter?.model) gaps.push('inverter specification');
  if (e.batteryMentioned && e.battery?.usableCapacityKwh == null) gaps.push('battery usable capacity');
  if (e.technology !== 'battery' && (e.annualGenerationKwh === null || !e.generationBasis)) gaps.push('generation estimate and basis');
  if (!e.dnoTreatment) gaps.push('DNO treatment');
  if (!e.warranties.length) gaps.push('warranty detail');
  if (!e.mcsWording) gaps.push('MCS wording');
  if (e.priceGbp === null) gaps.push('price');
  return gaps;
}

export function validateSolarBatteryEvidence(input = {}) {
  const evidence = normaliseSolarBatteryEvidence(input);
  const errors = [];
  for (const [field, value] of [
    ['arrayKwp', evidence.arrayKwp],
    ['annualGenerationKwh', evidence.annualGenerationKwh],
    ['priceGbp', evidence.priceGbp],
    ['selfConsumptionPercent', evidence.selfConsumptionPercent],
    ['exportPercent', evidence.exportPercent],
  ]) if (value !== null && value < 0) errors.push(`${field} must not be negative`);
  for (const [field, value] of [['selfConsumptionPercent', evidence.selfConsumptionPercent], ['exportPercent', evidence.exportPercent]]) {
    if (value !== null && value > 100) errors.push(`${field} must not exceed 100`);
  }
  if (evidence.panel?.count !== null && evidence.panel?.count <= 0) errors.push('panel count must be positive');
  if (evidence.battery?.usableCapacityKwh !== null && evidence.battery?.usableCapacityKwh <= 0) errors.push('battery usable capacity must be positive');
  return { ok: errors.length === 0, evidence, gaps: solarBatteryEvidenceGaps(evidence), errors };
}
