import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
test('snapshot packages its local presentation stylesheet before validating references',async()=>{
 const root=new URL('../',import.meta.url),work=await mkdtemp(join(tmpdir(),'hqc-snapshot-'));
 const fixtures=['how-we-help.html','decision-pack.html','compare-heat-pump-quotes.html','is-this-a-good-heat-pump-quote.html','heat-pump-quote-checklist.html','what-should-a-heat-pump-quote-include.html','heat-pump-heat-loss-calculation-flow-temperature.html','heat-pump-quote-questions.html','heat-pump-radiator-check.html'];
 const scripts=['enhancements-browser.js','results-layout-fix.js','quote-facts-polish.js','readability-commercial.js','artwork-fit.js','pdf-compat.js','upload-friction-v3.js','intake-diagnostics.js','desktop-layout-fix.js','decision-entry.js','approved-home-layout.js','simple-results-journey.js','decision-pack.js','paid-comparison-gate.js','landing-conversion.js','mobile-homepage-override.js','metrics-integrity.js','solar-preview-journey.js','ev-chargepoint-preview-journey.js','solar-thermal-preview-journey.js','decision-pack-model.js','conversion-examples.js','homepage-house-approved.png','homepage-house-only.svg','homepage-house-professional.webp'];
 try{
  await writeFile(join(work,'snapshot.mjs'),await readFile(new URL('snapshot.mjs',root)));
  const css=await readFile(new URL('presentation-polish.css',root),'utf8');
  await writeFile(join(work,'presentation-polish.css'),css);
  for(const file of fixtures)await writeFile(join(work,file),'<html><head><title>Fixture</title></head><body><h1>Fixture</h1></body></html>');
  for(const file of scripts)await writeFile(join(work,file),'fixture');
  await mkdir(join(work,'node_modules/pdfjs-dist/build'),{recursive:true});
  for(const file of ['pdf.mjs','pdf.worker.mjs'])await writeFile(join(work,'node_modules/pdfjs-dist/build',file),'fixture');
  const boot=`globalThis.fetch=async url=>{const path=new URL(url).pathname;const body=path==='/'?'<html><head><title>Upstream</title><link rel="stylesheet" href="/assets/base.css"></head><body><h1>Upstream</h1></body></html>':path==='/assets/base.css'?'body{margin:0}':path==='/sitemap.xml'?'<urlset></urlset>':path.endsWith('.html')?'<html><head></head><body>Upstream guide</body></html>':'fixture';return new Response(body,{status:200})};await import('./snapshot.mjs');`;
  await writeFile(join(work,'boot.mjs'),boot);
  const run=spawnSync(process.execPath,['boot.mjs'],{cwd:work,encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
  assert.equal(await readFile(join(work,'site/presentation-polish.css'),'utf8'),css);
  const home=await readFile(join(work,'site/index.html'),'utf8');
  const guide=await readFile(join(work,'site/compare-heat-pump-quotes.html'),'utf8');
  assert.match(home,/data-hqc-presentation="app"/);
  assert.match(guide,/data-hqc-presentation="guide"/);
  for(const html of [home,guide])assert.equal((html.match(/href="\/presentation-polish.css"/g)||[]).length,1);
 }finally{await rm(work,{recursive:true,force:true})}
});
