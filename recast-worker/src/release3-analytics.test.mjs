import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const analytics = await readFile(new URL('../public/release3-analytics.js', import.meta.url), 'utf8');
const wrapper = await readFile(new URL('./worker-release3.js', import.meta.url), 'utf8');

for (const event of [
  'tool_opened',
  'source_landing_page',
  'internal_conversion_path',
  'pricing_viewed',
  'checkout_started',
  'api_documentation_viewed',
  'purchase_entitlement_confirmed'
]) assert.match(analytics, new RegExp(event));

assert.match(analytics, /\/api\/verify-session/);
assert.match(analytics, /data\.token && data\.entitled/);
assert.match(wrapper, /release3-analytics\.js/);
assert.match(wrapper, /\.on\('head'/);

// Privacy guardrails: analytics may use URL paths and categorical plan/status,
// but must not read tool textareas, pasted values, file contents or DOM text bodies.
assert.doesNotMatch(analytics, /inputEl|outputEl|inputA|inputB|FileReader|\.value\b/);
assert.doesNotMatch(analytics, /textContent|innerText|innerHTML/);
assert.doesNotMatch(analytics, /sessionStorage\.setItem\([^,]+,\s*document/i);
assert.doesNotMatch(analytics, /localStorage/);

console.log('release3 analytics privacy tests passed');
