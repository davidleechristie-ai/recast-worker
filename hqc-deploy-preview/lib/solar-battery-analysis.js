import { extractSolarBatteryEvidence } from './solar-battery-extraction.js';

const value = (v, suffix = '') => v == null ? 'not stated' : `${v}${suffix}`;

const gapQuestions = {
  'panel specification': 'Please confirm the panel manufacturer, model and quantity included in this quote.',
  'array size': 'Please confirm the total proposed solar array size in kWp.',
  'inverter specification': 'Please confirm the inverter manufacturer, model and rated output included in this quote.',
  'battery usable capacity': 'Please confirm the battery usable capacity in kWh (not only nominal capacity).',
  'generation estimate and basis': 'Please provide the annual generation estimate and the assumptions or methodology used to produce it.',
  'DNO treatment': 'Please confirm the proposed DNO/grid-connection route and whether notification or approval is expected before commissioning.',
  'warranty detail': 'Please confirm the equipment and workmanship warranty periods and who provides each warranty.',
  'MCS wording': 'Please confirm what MCS certification or MCS-certified installation wording applies to this proposal.',
  'price': 'Please confirm the total quoted price and what is included or excluded from that figure.'
};

function questionsFor(result) {
  return result.gaps.map((gap, index) => ({
    id: `gap_${index + 1}`,
    evidenceGap: gap,
    question: gapQuestions[gap] || `Please confirm the missing quote evidence for: ${gap}.`,
    reason: `The supplied quote does not evidence ${gap}.`,
  }));
}

function findingsFor(result) {
  const e = result.evidence;
  const findings = [];
  if (e.panel) findings.push({ key: 'panels', evidenceState: 'stated', text: `${value(e.panel.count)} × ${[e.panel.make, e.panel.model].filter(Boolean).join(' ') || 'panel model not stated'}` });
  if (e.arrayKwp != null) findings.push({ key: 'array_size', evidenceState: 'stated', text: `${e.arrayKwp} kWp array stated` });
  if (e.inverter) findings.push({ key: 'inverter', evidenceState: 'stated', text: `${[e.inverter.make, e.inverter.model].filter(Boolean).join(' ')}${e.inverter.ratingKw == null ? '' : `, ${e.inverter.ratingKw} kW stated rating`}` });
  if (e.battery) findings.push({ key: 'battery', evidenceState: 'stated', text: `${[e.battery.make, e.battery.model].filter(Boolean).join(' ')}${e.battery.usableCapacityKwh == null ? '' : `, ${e.battery.usableCapacityKwh} kWh usable capacity stated`}` });
  if (e.annualGenerationKwh != null) findings.push({ key: 'generation', evidenceState: 'installer_claim', text: `${e.annualGenerationKwh} kWh annual generation stated${e.generationBasis ? `; ${e.generationBasis}` : '; estimation basis not evidenced'}` });
  if (e.dnoTreatment) findings.push({ key: 'dno', evidenceState: 'quote_wording', text: e.dnoTreatment });
  if (e.priceGbp != null) findings.push({ key: 'price', evidenceState: 'stated', text: `£${e.priceGbp.toLocaleString('en-GB')} stated price` });
  for (const gap of result.gaps) findings.push({ key: `gap:${gap}`, evidenceState: 'missing', text: `${gap} is not evidenced in the supplied quote text` });
  return findings;
}

export function analyseSolarBatteryQuote({ quoteText = '', technology = 'solar_battery', quoteId = null } = {}) {
  const extracted = extractSolarBatteryEvidence(quoteText, technology);
  const base = {
    ok: extracted.ok,
    technology: extracted.evidence.technology,
    quoteId,
    evidence: extracted.evidence,
    gaps: extracted.gaps,
    errors: extracted.errors,
  };
  return {
    ...base,
    findings: findingsFor(base),
    installerQuestions: questionsFor(base),
    guardrails: [
      'This checks written quote evidence; it is not electrical or structural design approval.',
      'DNO, MCS, generation, savings and roof suitability are not certified by this analysis.'
    ]
  };
}

const dimensions = [
  ['panel count', e => e.panel?.count ?? null],
  ['array kWp', e => e.arrayKwp],
  ['inverter rating', e => e.inverter?.ratingKw ?? null],
  ['battery inclusion and usable capacity', e => e.battery ? `${e.battery.usableCapacityKwh ?? 'capacity not stated'} kWh` : 'no evidenced battery'],
  ['annual generation assumption', e => e.annualGenerationKwh],
  ['scaffolding scope', e => e.scaffolding],
  ['DNO treatment', e => e.dnoTreatment],
  ['price', e => e.priceGbp]
];

export function compareSolarBatteryQuotes(quotes = [], technology = 'solar_battery') {
  const analyses = quotes.map((quote, index) => analyseSolarBatteryQuote({ quoteText: typeof quote === 'string' ? quote : quote.quoteText, technology: typeof quote === 'string' ? technology : (quote.technology || technology), quoteId: typeof quote === 'string' ? `quote_${index + 1}` : (quote.quoteId || `quote_${index + 1}`) }));
  const comparison = dimensions.map(([dimension, get]) => ({
    dimension,
    values: analyses.map(a => ({ quoteId: a.quoteId, value: get(a.evidence) ?? null })),
    evidenceOnly: true
  }));
  return {
    ok: analyses.length >= 2 && analyses.every(a => a.ok),
    technology,
    analyses,
    comparison,
    conclusion: 'No automatic winner: compare evidenced scope, assumptions, omissions and price before deciding.',
    guardrails: ['Comparison does not certify design, roof suitability, DNO approval, MCS status, generation or savings.']
  };
}
