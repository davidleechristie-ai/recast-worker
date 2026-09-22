const ALLOWED_MEDIA_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const MAX_EXTRACTED_TEXT = 120000;

export function normaliseExtractedMedia(input = {}) {
  const sourceMediaType = String(input.sourceMediaType || '').toLowerCase().split(';')[0].trim();
  if (!ALLOWED_MEDIA_TYPES.has(sourceMediaType)) {
    return { ok: false, error: 'unsupported_source_media_type' };
  }
  if (typeof input.extractedText !== 'string' || !input.extractedText.trim()) {
    return { ok: false, error: 'extracted_text_required' };
  }
  if (input.extractedText.length > MAX_EXTRACTED_TEXT) {
    return { ok: false, error: 'extracted_text_too_large' };
  }
  const extractionMethod = String(input.extractionMethod || '').trim();
  if (!extractionMethod) return { ok: false, error: 'extraction_method_required' };

  return {
    ok: true,
    quoteText: input.extractedText.trim(),
    provenance: {
      sourceMediaType,
      extractionMethod,
      pageCount: Number.isInteger(input.pageCount) && input.pageCount > 0 ? input.pageCount : null,
      // Confidence is descriptive metadata only; never use it to invent missing evidence.
      extractionConfidence: Number.isFinite(input.extractionConfidence)
        ? Math.max(0, Math.min(1, Number(input.extractionConfidence)))
        : null,
    },
  };
}
