import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const script = await readFile(new URL('../public/release3-tool-workflow.js', import.meta.url), 'utf8');
const wrapper = await readFile(new URL('./worker-release3.js', import.meta.url), 'utf8');
const wrangler = await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8');

assert.match(script, /successful_tool_use/);
assert.match(script, /workflow_created_from_tool/);
assert.match(script, /workflow_saved/);
assert.match(script, /automation_configuration_started/);
assert.match(script, /api_documentation_viewed/);
assert.match(script, /pricing_viewed/);
assert.match(script, /operation_and_categorical_settings/);
assert.match(script, /recast_tool_workflow_handoff_v1/);
assert.match(script, /recast_workflow_automation_handoff_v1/);
assert.match(script, /SUPPORTED_MODES/);
assert.match(script, /API_MODES/);
assert.match(script, /json2csv/);
assert.match(script, /csv2json/);
assert.match(script, /\/automation\/\?source=workflow/);
assert.match(script, /\/api\/index\.html\?source=tool/);
assert.match(script, /hosted execution/);
assert.match(script, /server-side processing/);
assert.doesNotMatch(script, /inputEl\.value/);
assert.doesNotMatch(script, /outputEl\.value/);
assert.doesNotMatch(script, /inputA/);
assert.doesNotMatch(script, /inputB/);
assert.doesNotMatch(script, /localStorage\.setItem\(HANDOFF_KEY/);
assert.doesNotMatch(script, /sessionStorage\.setItem\([^,]+,\s*(?:input|output|text|data)/i);
assert.match(wrapper, /release3-tool-workflow\.js/);
assert.match(wrapper, /seoWorker\.fetch/);

const mainMatch = wrangler.match(/"main":\s*"([^"]+)"/);
assert.ok(mainMatch, 'Wrangler must declare a Worker entry point');
let active = mainMatch[1].replace(/^src\//, '');
let reachedRelease3 = active === 'worker-release3.js';
for (let depth = 0; !reachedRelease3 && depth < 5; depth += 1) {
  const source = await readFile(new URL(`./${active}`, import.meta.url), 'utf8');
  const importMatch = source.match(/from ['"]\.\/(worker-[^'"]+\.js)['"]/);
  assert.ok(importMatch, `${active} must delegate to a lower Worker wrapper`);
  active = importMatch[1];
  reachedRelease3 = active === 'worker-release3.js';
}
assert.ok(reachedRelease3, 'Active Worker wrapper chain must preserve worker-release3.js');

console.log('release3 commercial journey tests passed');
