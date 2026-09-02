import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../public/ui-consistency.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../public/ui-consistency.js', import.meta.url), 'utf8');

for (const label of ['Tools','Workflows','Automation','API','Guides','Pricing']) assert.ok(js.includes(`'${label}'`) || js.includes(`>${label}<`), `missing shared nav label ${label}`);
assert.match(js, /normalizeBranding/);
assert.match(js, /normalizeUseCaseNav/);
assert.match(js, /normalizeTechnicalNav/);
assert.doesNotMatch(js, /inputEl\.value|outputEl\.value|textarea\.value|localStorage\.setItem/);
assert.match(css, /--recast-purple:#9164ff/);
assert.match(css, /\.site-header,.titleblock,.uc-nav/);
assert.match(css, /focus-visible/);
assert.match(css, /@media\(max-width:640px\)/);
console.log('site-wide UI consistency tests passed');
