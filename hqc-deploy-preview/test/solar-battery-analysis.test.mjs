import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { analyseSolarBatteryQuote, compareSolarBatteryQuotes } from '../lib/solar-battery-analysis.js';

const fixtures = JSON.parse(fs.readFileSync(new URL('./fixtures/solar-battery-cases.json', import.meta.url), 'utf8')).cases;

test('complete solar quote produces evidence-tied findings without certification claims', () => {
  const f = fixtures.find(x => x.id === 'solar_only_complete');
  const result = analyseSolarBatteryQuote({ quoteText: f.quoteText, technology: f.technology, quoteId: 'a' });
  assert.equal(result.ok, true);
  assert.equal(result.evidence.panel.count, 10);
  assert.equal(result.evidence.arrayKwp, 4.5);
  assert.equal(result.evidence.priceGbp, 7850);
  assert.ok(result.findings.some(x => x.key === 'generation' && x.evidenceState === 'installer_claim'));
  assert.equal(result.installerQuestions.length, result.gaps.length);
  const text = JSON.stringify(result).toLowerCase();
  assert.ok(text.includes('not electrical or structural design approval'));
  assert.ok(!text.includes('electrically approved'));
});

test('partial quote preserves unknowns and turns missing evidence into explicit findings and installer questions', () => {
  const f = fixtures.find(x => x.id === 'partial_quote_missing_evidence');
  const result = analyseSolarBatteryQuote({ quoteText: f.quoteText, technology: f.technology });
  assert.equal(result.evidence.arrayKwp, null);
  assert.equal(result.evidence.inverter, null);
  assert.equal(result.evidence.annualGenerationKwh, null);
  for (const gap of f.expected.requiredGaps) {
    assert.ok(result.gaps.includes(gap), `missing gap ${gap}`);
    const question = result.installerQuestions.find(x => x.evidenceGap === gap);
    assert.ok(question, `missing installer question for ${gap}`);
    assert.match(question.reason, /does not evidence/i);
  }
  assert.ok(result.findings.some(x => x.evidenceState === 'missing'));
  assert.ok(result.installerQuestions.some(x => x.evidenceGap === 'DNO treatment' && /DNO\/grid-connection/.test(x.question)));
  assert.ok(result.installerQuestions.some(x => x.evidenceGap === 'generation estimate and basis' && /annual generation estimate/.test(x.question)));
});

test('battery-only does not invent solar panel or generation evidence', () => {
  const f = fixtures.find(x => x.id === 'battery_only');
  const result = analyseSolarBatteryQuote({ quoteText: f.quoteText, technology: f.technology });
  assert.equal(result.technology, 'battery');
  assert.equal(result.evidence.panel, null);
  assert.equal(result.evidence.arrayKwp, null);
  assert.equal(result.evidence.annualGenerationKwh, null);
  assert.equal(result.evidence.battery.usableCapacityKwh, 6.8);
  assert.ok(!result.installerQuestions.some(x => x.evidenceGap === 'panel specification' || x.evidenceGap === 'array size' || x.evidenceGap === 'generation estimate and basis'));
});

test('two-quote comparison exposes required evidence dimensions and quote-specific questions without an automatic winner', () => {
  const f = fixtures.find(x => x.id === 'comparison_pair');
  const result = compareSolarBatteryQuotes(f.quotes, f.technology);
  assert.equal(result.analyses.length, 2);
  const names = result.comparison.map(x => x.dimension);
  for (const dimension of f.expectedComparisonDimensions) assert.ok(names.includes(dimension), `missing dimension ${dimension}`);
  for (const analysis of result.analyses) {
    assert.ok(Array.isArray(analysis.installerQuestions));
    assert.equal(analysis.installerQuestions.length, analysis.gaps.length);
  }
  assert.match(result.conclusion, /No automatic winner/);
  const text = JSON.stringify(result);
  for (const forbidden of f.mustNotConclude) assert.ok(!text.includes(forbidden), `forbidden conclusion: ${forbidden}`);
});
