import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const wrapper = await readFile(new URL('./worker-post-release.js', import.meta.url), 'utf8');
const wrangler = await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
const scoreboardRefresh = await readFile(new URL('../scripts/refresh-growth-scoreboard.mjs', import.meta.url), 'utf8');

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

// Strategic scorecard instrumentation must expose both numerator and denominator
// events without reading or transmitting user input/output content.
assert.match(wrapper, /tool_run_attempt/);
assert.match(wrapper, /successful_tool_use/);
assert.match(wrapper, /workflow_start/);
assert.match(wrapper, /workflow_complete/);
assert.match(wrapper, /upgrade_click/);
assert.match(wrapper, /commercial_intent/);
assert.match(wrapper, /\/automation/);
assert.match(wrapper, /\/api/);
assert.match(wrapper, /recast-funnel-measurement/);
assert.doesNotMatch(wrapper, /textarea\.value|inputEl\.value|outputEl\.value/);

// The daily scorecard must consume the same events and preserve N/A when a
// denominator does not yet exist rather than manufacturing a zero rate.
assert.match(scoreboardRefresh, /tool_run_attempt/);
assert.match(scoreboardRefresh, /commercial_intent/);
assert.match(scoreboardRefresh, /successful_task_rate/);
assert.match(scoreboardRefresh, /workflow_completion_rate/);
assert.match(scoreboardRefresh, /activation_rate/);
assert.match(scoreboardRefresh, /deeper_product_usage_rate/);
assert.match(scoreboardRefresh, /commercial_intent_rate/);
assert.match(scoreboardRefresh, /returning_user_rate/);
assert.match(scoreboardRefresh, /denominator\) > 0/);
assert.match(scoreboardRefresh, /zero_denominator/);
assert.match(wrangler, /"main": "src\/worker-post-release\.js"/);

console.log('post-release search lift and funnel measurement tests passed');
