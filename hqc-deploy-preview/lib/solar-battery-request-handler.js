import { analyseSolarBatteryQuote, compareSolarBatteryQuotes } from './solar-battery-analysis.js';
import { normaliseExtractedMedia } from './solar-battery-media-ingestion.js';
import { normaliseTechnology, HQC_TECHNOLOGIES } from './technology-routing.js';

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

export async function handleSolarBatteryAnalysisRequest(request) {
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const type = (request.headers.get('content-type') || '').toLowerCase();
  if (!type.includes('application/json')) return json({ error: 'unsupported_media_type' }, 415);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'invalid_json' }, 400); }
  const technology = normaliseTechnology(body?.technology || request.headers.get('x-hqc-technology'));
  if (![HQC_TECHNOLOGIES.SOLAR_BATTERY, HQC_TECHNOLOGIES.BATTERY].includes(technology)) return json({ error: 'unsupported_or_missing_technology' }, 400);

  const unpack = (q) => {
    if (!q?.extractedMedia) return { ok: true, quoteText: typeof q === 'string' ? q : q?.quoteText, provenance: null };
    const media = normaliseExtractedMedia(q.extractedMedia);
    return media.ok ? { ok: true, quoteText: media.quoteText, provenance: media.provenance } : media;
  };

  if (Array.isArray(body.quotes)) {
    if (body.quotes.length < 2) return json({ error: 'comparison_requires_two_quotes' }, 400);
    const inputs = body.quotes.map((q, i) => ({ ...unpack(q), quoteId: q?.quoteId || `quote_${i + 1}`, technology: q?.technology || technology }));
    const invalid = inputs.find(q => !q.ok); if (invalid) return json({ error: invalid.error }, 400);
    if (inputs.some(q => typeof q.quoteText !== 'string' || !q.quoteText.trim())) return json({ error: 'quote_text_required' }, 400);
    const result = compareSolarBatteryQuotes(inputs.map(q => ({ quoteId: q.quoteId, quoteText: q.quoteText, technology: q.technology })), technology);
    result.extractionProvenance = inputs.map(q => ({ quoteId: q.quoteId, provenance: q.provenance }));
    return json(result);
  }

  const input = unpack(body); if (!input.ok) return json({ error: input.error }, 400);
  if (typeof input.quoteText !== 'string' || !input.quoteText.trim()) return json({ error: 'quote_text_required' }, 400);
  const result = analyseSolarBatteryQuote({ quoteText: input.quoteText, technology, quoteId: body.quoteId || null });
  if (input.provenance) result.extractionProvenance = input.provenance;
  return json(result);
}
