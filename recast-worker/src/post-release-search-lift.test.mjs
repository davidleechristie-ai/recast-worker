import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const wrapper = await readFile(new URL('./worker-post-release.js', import.meta.url), 'utf8');
const wrangler = await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8');

assert.match(wrapper, /worker-ui-integrity\.js/);
assert.match(wrapper, /\/tools\/json-formatter\.html/);
assert.match(wrapper, /JSON Formatter Online — Beautify & Minify JSON \| Recast/);
assert.match(wrapper, /\/tools\/json-validator\.html/);
assert.match(wrapper, /\/tools\/json-diff\.html/);

assert.match(wrapper, /\/tools\/flatten-json\.html/);
assert.match(wrapper, /Flatten JSON Online — Nested JSON to Dot Notation \| Recast/);
assert.match(wrapper, /setInnerContent\('Flatten JSON Online'\)/);
assert.match(wrapper, /\/tools\/unflatten-json\.html/);
assert.match(wrapper, /\/tools\/json-to-csv\.html/);
assert.match(wrapper, /\/blog\/flatten-nested-json\.html/);

assert.doesNotMatch(wrapper, /textarea\.value|inputEl\.value|outputEl\.value/);
assert.match(wrangler, /"main": "src\/worker-post-release\.js"/);

console.log('post-release search lift tests passed');
