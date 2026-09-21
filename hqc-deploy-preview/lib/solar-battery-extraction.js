import { validateSolarBatteryEvidence } from './solar-battery-evidence.js';

const match = (text, re, group = 1) => text.match(re)?.[group] ?? null;
const num = value => value == null ? null : Number(String(value).replace(/,/g, ''));

function equipmentBeforeModel(text, modelPattern) {
  const m = text.match(modelPattern);
  return m ? { make: m[1], model: m[2] } : null;
}

export function extractSolarBatteryEvidence(quoteText = '', technology = 'solar_battery') {
  const text = String(quoteText || '').replace(/\s+/g, ' ').trim();
  const panel = equipmentBeforeModel(text, /(?:\d+\s+)([A-Z][A-Za-z]+)\s+([A-Z]{1,5}\d{2,4})\s+(?:panels|modules)/i);
  const panelCount = num(match(text, /\b(\d+)\s+[A-Z][A-Za-z]+\s+[A-Z]{1,5}\d{2,4}\s+(?:panels|modules)/i));
  const arrayKwp = num(match(text, /\b(\d+(?:\.\d+)?)\s*kWp\b/i));
  const inverterMatch = text.match(/([A-Z][A-Za-z]+)\s+([A-Z]{1,5}\d{1,3})\s+(?:hybrid\s+)?inverter(?:\s+rated)?\s+(\d+(?:\.\d+)?)\s*kW/i);
  const batteryMatch = text.match(/([A-Z][A-Za-z]+)\s+([A-Z]{1,5}\d{1,3})\s+battery(?:,)?(?:\s+usable\s+storage)?(?:,)?\s*(\d+(?:\.\d+)?)\s*kWh\s+usable|([A-Z][A-Za-z]+)\s+([A-Z]{1,5}\d{1,3}),?\s+usable\s+storage\s+(\d+(?:\.\d+)?)\s*kWh/i);
  const battery = batteryMatch ? {
    make: batteryMatch[1] || batteryMatch[4], model: batteryMatch[2] || batteryMatch[5],
    usableCapacityKwh: num(batteryMatch[3] || batteryMatch[6])
  } : null;
  const annualGenerationKwh = num(match(text, /(?:annual\s+(?:PV\s+)?generation(?:\s+estimate)?|generation)\s+(?:estimate\s+)?(?:of\s+)?(\d[\d,]*)\s*kWh/i));
  const selfConsumptionPercent = num(match(text, /(\d+(?:\.\d+)?)%\s+self-consumption/i));
  const exportPercent = num(match(text, /(\d+(?:\.\d+)?)%\s+export/i));
  const priceGbp = num(match(text, /(?:total|installed)\s+£([\d,]+)/i));
  const dnoTreatment = /G99/i.test(text) ? (/approval\s+(?:is\s+)?not\s+(?:stated\s+as\s+)?(?:obtained|evidenced)/i.test(text) ? 'G99 application required; approval not evidenced' : 'G99 application stated') : (/G98/i.test(text) ? 'G98 notification after commissioning' : null);
  const generationBasis = match(text, /(using\s+stated\s+MCS\s+methodology)/i);
  const mcsWording = match(text, /(MCS\s+(?:certificate[^.]*|certified[^.]*))/i);
  const scaffolding = /scaffolding\s+included/i.test(text) ? 'included' : (/scaffolding\s+excluded/i.test(text) ? 'excluded' : null);
  const roofWorks = /roof\s+repairs\s+excluded/i.test(text) ? 'repairs excluded' : (/no\s+roof\s+strengthening\s+included/i.test(text) ? 'strengthening not included' : null);
  const warranties = [...text.matchAll(/(?:panel\s+product\s+warranty|workmanship\s+warranty|battery\s+warranty|inverter)\s*(?:warranty\s*)?(\d+)\s+years?/gi)].map(m => m[0]);

  return validateSolarBatteryEvidence({
    technology,
    panel: panel ? { ...panel, count: panelCount } : (panelCount ? { count: panelCount } : null),
    arrayKwp,
    inverter: inverterMatch ? { make: inverterMatch[1], model: inverterMatch[2], ratingKw: num(inverterMatch[3]) } : null,
    battery,
    annualGenerationKwh, generationBasis, selfConsumptionPercent, exportPercent,
    scaffolding, roofWorks, dnoTreatment, warranties, mcsWording, priceGbp
  });
}
