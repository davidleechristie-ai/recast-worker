import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../upload-friction-v3.js', import.meta.url), 'utf8');

test('public renewable intake remains text-PDF only and never opens the heat-pump manual form', () => {
  assert.match(source, /const renewableTextPdf=\(\)=>solarPreview\(\)\|\|evPreview\(\)\|\|thermalPreview\(\)/);
  assert.match(source, /if\(renewableTextPdf\(\)&&files\.some\(file=>!isPdf\(file\)\)\)/);
  assert.match(source, /if\(renewableTextPdf\(\)\)input\.setAttribute\('accept','application\/pdf,\.pdf'\)/);
  assert.match(source, /if\(manual&&renewableTextPdf\(\)\)/);
  assert.match(source, /manual\.disabled=true/);
  assert.match(source, /manual\.style\.setProperty\('display','none','important'\)/);
});

test('solar upload guidance names its supported input instead of promising photos', () => {
  assert.match(source, /solarPreview\(\)\?'<div[^']*Upload a text-based solar or battery PDF/);
  assert.match(source, /Solar and battery checks accept text-based installer PDFs only\./);
  assert.match(source, /const title=\[\.\.\.help\.children\]\.find\(node=>node\.tagName==='B'\)/);
  assert.match(source, /cardIntro\.textContent=renewableTextPdf\(\)\?\(comparing\(\)\?'Upload two or more text-based installer PDFs\./);
  assert.match(source, /:'Upload one text-based installer PDF\. Image-only scans and photos are not supported\.'/);
});
