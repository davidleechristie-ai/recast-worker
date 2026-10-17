import test from 'node:test';
import assert from 'node:assert/strict';
import { normaliseExtractedMedia } from '../lib/solar-battery-media-ingestion.js';

test('accepts evidenced text extracted from a PDF without inventing metadata', () => {
  const r = normaliseExtractedMedia({ sourceMediaType: 'application/pdf', extractionMethod: 'pdfjs-text-v1', pageCount: 4, extractedText: '12 panels. Array size 5.1 kWp. Total price £9,500.' });
  assert.equal(r.ok, true);
  assert.match(r.quoteText, /5\.1 kWp/);
  assert.equal(r.provenance.pageCount, 4);
  assert.equal(r.provenance.extractionConfidence, null);
});

test('accepts OCR text from supported image media with provenance', () => {
  const r = normaliseExtractedMedia({ sourceMediaType: 'image/jpeg', extractionMethod: 'ocr-v1', extractionConfidence: 0.82, extractedText: 'Battery usable capacity 9.5 kWh.' });
  assert.equal(r.ok, true);
  assert.equal(r.provenance.extractionConfidence, 0.82);
});

test('fails closed when extracted text is absent', () => {
  assert.equal(normaliseExtractedMedia({ sourceMediaType: 'application/pdf', extractionMethod: 'pdfjs-text-v1' }).error, 'extracted_text_required');
});

test('fails closed for unsupported media', () => {
  assert.equal(normaliseExtractedMedia({ sourceMediaType: 'text/html', extractionMethod: 'html', extractedText: 'quote' }).error, 'unsupported_source_media_type');
});

test('requires extraction provenance', () => {
  assert.equal(normaliseExtractedMedia({ sourceMediaType: 'image/png', extractedText: 'quote' }).error, 'extraction_method_required');
});
