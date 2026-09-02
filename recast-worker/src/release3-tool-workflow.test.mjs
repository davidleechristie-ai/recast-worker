import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const script = await readFile(new URL('../public/release3-tool-workflow.js', import.meta.url), 'utf8');
const wrapper = await readFile(new URL('./worker-release3.js', import.meta.url), 'utf8');
const wrangler = await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8');

assert.match(script, /successful_tool_use/);
assert.match(script, /workflow_created_from_tool/);
assert.match(script, /operation_and_categorical_settings/);
assert.match(script, /recast_tool_workflow_handoff_v1/);
assert.match(script, /SUPPORTED_MODES/);
assert.match(script, /json2csv/);
assert.match(script, /csv2json/);
assert.doesNotMatch(script, /inputEl\.value/);
assert.doesNotMatch(script, /outputEl\.value/);
assert.doesNotMatch(script, /inputA/);
assert.doesNotMatch(script, /inputB/);
assert.doesNotMatch(script, /localStorage\.setItem\(HANDOFF_KEY/);
assert.match(wrapper, /release3-tool-workflow\.js/);
assert.match(wrapper, /seoWorker\.fetch/);
assert.match(wrangler, /"main": "src\/worker-release3\.js"/);

console.log('release3 tool-workflow handoff tests passed');
