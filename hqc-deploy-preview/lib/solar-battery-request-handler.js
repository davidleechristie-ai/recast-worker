import { analyseSolarBatteryQuote, compareSolarBatteryQuotes } from './solar-battery-analysis.js';
import { normaliseTechnology, HQC_TECHNOLOGIES } from './technology-routing.js';

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

export async function handleSolarBatteryAnalysisRequest(request) {
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const type = (request.headers.get('content-type') || '').toLowerCase();
  if (!type.includes('application/json')) {
    return json({ error: 'unsupported_media_type', message: 'Non-public Solar analysis currently accepts structured/manual JSON only; PDF/image ingestion is not yet verified.' }, 415);
  }

  let body;
  try { body = await request.json(); } catch { return json({ error: 'invalid_json' }, 400); }
  const technology = normaliseTechnology(body?.technology || request.headers.get('x-hqc-technology'));
  if (![HQC_TECHNOLOGIES.SOLAR_BATTERY, HQC_TECHNOLOGIES.BATTERY].includes(technology)) {
    return json({ error: 'unsupported_or_missing_technology' }, 400);
  }

  if (Array.isArray(body.quotes)) {
    if (body.quotes.length < 2) return json({ error: 'comparison_requires_two_quotes' }, 400);
    const quotes = body.quotes.map((q, i) => ({
      quoteId: q?.quoteId || `quote_${i + 1}`,
      quoteText: typeof q === 'string' ? q : q?.quoteText,
      technology: q?.technology || technology,
    }));
    if (quotes.some(q => typeof q.quoteText !== 'string' || !q.quoteText.trim())) return json({ error: 'quote_text_required' }, 400);
    return json(compareSolarBatteryQuotes(quotes, technology));
  }

  if (typeof body?.quoteText !== 'string' || !body.quoteText.trim()) return json({ error: 'quote_text_required' }, 400);
  return json(analyseSolarBatteryQuote({ quoteText: body.quoteText, technology, quoteId: body.quoteId || null }));
}
