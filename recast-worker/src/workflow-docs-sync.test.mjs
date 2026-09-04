import fs from 'node:fs';
import assert from 'node:assert/strict';

const worker = fs.readFileSync(new URL('./worker-ui-integrity.js', import.meta.url), 'utf8');
const sync = fs.readFileSync(new URL('../public/workflow-docs-sync.js', import.meta.url), 'utf8');

assert.match(worker, /workflow-docs-sync\.js\?v=1/);
assert.match(worker, /\/how-to\/automate\.html/);
assert.match(worker, /\/demo\/workflows\.html/);
assert.match(sync, /Tool → Workflow → Automation/);
assert.match(sync, /Start from scratch/);
assert.match(sync, /Recipes are ready-made workflow starting points/);
assert.match(sync, /Automation is offered after a successful run/);
assert.match(sync, /legacy Recipe panel/);
assert.match(sync, /Open Workflow Builder/);
assert.match(sync, /data-demo="orders_recipe"/);
assert.match(sync, /badge\.textContent = 'WORKFLOW'/);
assert.doesNotMatch(sync, /Upgrade now|Upgrade to unlock/);

console.log('workflow documentation sync regression checks passed');
