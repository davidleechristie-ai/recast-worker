import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const js = read('public/workflow-usability.js');
const css = read('public/workflow-usability.css');
const wrapper = read('src/worker-ui-integrity.js');
const app = read('public/app/index.html');

const checks = [
  ['worker injects workflow usability stylesheet', wrapper.includes('/workflow-usability.css?v=1')],
  ['worker injects workflow usability script', wrapper.includes('/workflow-usability.js?v=1')],
  ['modern builder exists in app', app.includes('id="recipeBuilder2Panel"')],
  ['legacy recipe toggle still exists for compatibility', app.includes('id="recipeToggleBtn"')],
  ['legacy transform toggle still exists for compatibility', app.includes('id="transformBuilderToggleBtn"')],
  ['enhancement hides overlapping legacy toggles', css.includes('#recipeToggleBtn') && css.includes('#transformBuilderToggleBtn') && css.includes('display: none !important')],
  ['modern builder is labelled Workflow Builder', js.includes("toggle.textContent = 'Workflow Builder'")],
  ['real workflowBuilder anchor is created', js.includes("anchor.id = 'workflowBuilder'")],
  ['tool handoff captures current input locally', js.includes("input: input.length <= MAX_LOCAL_HANDOFF ? input : ''")],
  ['tool handoff uses sessionStorage', js.includes("sessionStorage.setItem(HANDOFF_KEY")],
  ['tool handoff restores input', js.includes('input.value = payload.input')],
  ['handoff opens modern builder', js.includes('window.RecastRecipeBuilder2.openWithDefinition')],
  ['empty state offers starter workflows', js.includes('JSON → CSV') && js.includes('Flatten JSON → CSV') && js.includes('Validate JSON')],
  ['add-step choices are grouped', js.includes("['Input & extract'") && js.includes("['Clean & transform'") && js.includes("['Validate & compare'")],
  ['workflow output can be copied', js.includes('workflowCopyOutput') && js.includes('navigator.clipboard.writeText')],
  ['workflow output can be downloaded', js.includes('workflowDownloadOutput') && js.includes('URL.createObjectURL')],
  ['workflow errors announce accessibly', js.includes("errors.setAttribute('role', 'alert')") && js.includes("aria-live', 'assertive")],
  ['automation is gated until workflow succeeds', js.includes('automate.disabled = !successful')],
  ['privacy/local-vs-hosted distinction is explicit', js.includes('Runs stay in this browser by default') && js.includes('hosted API or Automation')],
  ['step summaries can wrap instead of truncating', css.includes('.rb2-step-summary') && css.includes('white-space: normal')],
  ['mobile touch targets are increased', css.includes('min-height: 42px') && css.includes('min-height: 36px')],
  ['keyboard focus treatment is explicit', css.includes(':focus-visible') && css.includes('outline: 2px solid #8b5cf6')],
  ['builder becomes dominant while open', css.includes('body.workflow-builder-open .minimal-home') && css.includes('display: none !important')],
];

let failed = 0;
for (const [name, ok] of checks) {
  if (ok) console.log('✓', name);
  else { console.error('✗', name); failed++; }
}

if (failed) {
  console.error(`\n${failed} workflow usability regression check(s) failed`);
  process.exit(1);
}

console.log(`\n${checks.length} workflow usability regression checks passed`);
