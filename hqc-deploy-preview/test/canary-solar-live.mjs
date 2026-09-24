const base = process.env.HQC_CANARY_ORIGIN || 'https://cf-preview.homequotecheck.co.uk';

const extracted = {
  technology: 'solar_battery',
  extractedMedia: {
    sourceMediaType: 'application/pdf',
    extractionMethod: 'pdfjs-text-v1',
    pageCount: 2,
    extractedText: '12 panels. Array size 5.1 kWp. Annual generation 4200 kWh. Total price £9,500.'
  }
};

const analysed = await fetch(base + '/api/analyse', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-hqc-technology': 'solar_battery' },
  body: JSON.stringify(extracted)
});
if (analysed.status !== 200) throw new Error('Gated Solar extracted-media request returned ' + analysed.status);
const result = await analysed.json();
if (result.technology !== 'solar_battery') throw new Error('Solar technology response missing');
if (result.evidence?.arrayKwp !== 5.1) throw new Error('Solar array evidence was not extracted');
if (result.extractionProvenance?.sourceMediaType !== 'application/pdf') throw new Error('Solar extraction provenance missing');

const raw = await fetch(base + '/api/analyse', {
  method: 'POST',
  headers: { 'content-type': 'application/pdf', 'x-hqc-technology': 'solar_battery' },
  body: new Uint8Array([37, 80, 68, 70])
});
if (raw.status !== 415) throw new Error('Raw Solar media did not fail closed: ' + raw.status);

console.log('Gated Solar extracted-media custom-domain boundary verified; raw media remains fail-closed.');
