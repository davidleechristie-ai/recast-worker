import {chromium} from 'playwright';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
await mkdir('artifacts/conversion-journey',{recursive:true});
const code=n=>readFile('hqc-deploy-preview/'+n,'utf8');
const scripts={'/__hqc_landing_conversion.js':'landing-conversion.js','/__hqc_mobile_homepage.js':'mobile-homepage-override.js','/__hqc_approved_layout.js':'approved-home-layout.js','/__hqc_simple_results.js':'simple-results-journey.js','/__hqc_decision_pack.js':'decision-pack.js','/__hqc_paid_comparison.js':'paid-comparison-gate.js'};
const quotes=[{installer:'Illustrative Installer A',price:12400,model:'Model 8',electricalWork:'Electrical work included in quoted price',emitterChanges:'Provisional allowance £500',flowTemperatureC:45},{installer:'Illustrative Installer B',price:11900,model:'Model 8',electricalWork:'Excluded: customer to arrange'},{installer:'Illustrative Installer C',price:13000,roomByRoom:'Not provided'}];
try{
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.route('https://homequotecheck.co.uk/**',async route=>{
   const r=route.request(),p=new URL(r.url()).pathname;
   if(r.method()!=='GET')return route.abort();
   if(scripts[p])return route.fulfill({contentType:'application/javascript',body:await code(scripts[p])});
   return route.continue();
  });
  for(const tech of ['heat_pump','solar_battery','ev_chargepoint']){
   await page.goto('https://homequotecheck.co.uk/?qa=1&technology='+tech+'&src=qa_conversion',{waitUntil:'networkidle'});
   await page.addScriptTag({content:await code('conversion-examples.js')});
   const root=width<760?'#hqc-mobile-landing':'.copy';
   if(tech==='heat_pump')await page.locator(root+' .hqc-visible-guides').waitFor({state:'visible'});else assert.equal(await page.locator(root+' .hqc-visible-guides:visible').count(),0);
   const preview=page.locator(width<760?'#hqc-mobile-landing .hqc-example-output':'#hqc-desktop-example');
   await preview.waitFor({state:'visible'});
   assert.match(await preview.innerText(),/ILLUSTRATIVE EXAMPLE/);
   assert.match(await preview.innerText(),/No account required/);
   const bounds=await preview.boundingBox();assert.ok(bounds.width>250,'report is not squeezed into a legacy illustration slot');assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width,'example stays within viewport');if(width>=760&&await page.locator('#hqc-hero-steps').count())assert.equal(await page.locator('#hqc-hero-steps').isVisible(),false,'old illustration overlay is hidden');
   assert.equal(await preview.evaluate(el=>el.scrollWidth>el.clientWidth),false,'example report is not clipped');
   assert.equal(await preview.evaluate(el=>{const r=el.getBoundingClientRect();for(let p=el;p&&p!==document.body;p=p.parentElement){const b=p.getBoundingClientRect(),c=getComputedStyle(p);if(c.overflowY==='hidden'&&(r.top<b.top-1||r.bottom>b.bottom+1))return false;}return getComputedStyle(el.parentElement).display!=='flex';}),true,'legacy artwork fitter does not crop the report');
   if(tech!=='heat_pump')assert.doesNotMatch(await preview.innerText(),/heat-loss calculation/);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.screenshot({path:'artifacts/conversion-journey/home-'+width+'-'+tech+'.png',fullPage:width>=760});
   if(tech==='heat_pump'){await page.locator(root+' .hqc-visible-guides').scrollIntoViewIfNeeded();await page.screenshot({path:'artifacts/conversion-journey/guides-'+width+'-'+tech+'.png'});}
  }
  await page.close();
  for(const tech of ['heat_pump','solar_battery','ev_chargepoint']){
   const p=await browser.newPage({viewport:{width,height:900},acceptDownloads:true});
   await p.route('https://fixture.test/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><head></head><body><main><div class="resultsTop">Your quote check</div><section class="questions"><h2>Your free questions</h2></section></main></body></html>'}));
   await p.goto('https://fixture.test/?qa=1&technology='+tech);
   await p.evaluate(({quotes,tech})=>{localStorage.setItem('hqc_case',JSON.stringify(quotes));sessionStorage.setItem('hqc_journey_technology',tech);localStorage.setItem('hqcDecisionPackCaseId','fixture-case-123456')},{quotes,tech});
   await p.addScriptTag({content:await code('decision-pack-model.js')});
   await p.addScriptTag({content:await code('decision-pack.js')});
   await p.addScriptTag({content:await code('paid-comparison-gate.js')});
   await p.addScriptTag({content:await code('conversion-examples.js')});
   await p.waitForTimeout(1200);
   if(tech!=='heat_pump'){assert.equal(await p.locator('#hqc-decision-pack-offer').count(),0);await p.close();continue;}
   assert.match(await p.locator('#hqc-decision-pack-offer').innerText(),/£4.99/);
   await p.screenshot({path:'artifacts/conversion-journey/offer-'+width+'.png',fullPage:true});
   await p.evaluate(()=>localStorage.setItem('hqcDecisionPackPaid',JSON.stringify({caseId:'fixture-case-123456',sessionId:'cs_fixture'})));
   await p.evaluate(()=>document.body.appendChild(document.createElement('span')));
   await p.getByRole('button',{name:'Download PDF decision summary',exact:true}).waitFor();
   assert.equal(await p.locator('#hqc-decision-pack-offer table thead th').count(),4);
   assert.match(await p.locator('#hqc-decision-pack-offer table').innerText(),/Excluded/);
   assert.match(await p.locator('#hqc-decision-pack-offer table').innerText(),/Not stated/);
   const download=p.waitForEvent('download');
   await p.getByRole('button',{name:'Download PDF decision summary',exact:true}).click();
   const file=await download;await file.saveAs('artifacts/conversion-journey/decision-pack-'+width+'.pdf');
   const bytes=await readFile('artifacts/conversion-journey/decision-pack-'+width+'.pdf');assert.equal(bytes.subarray(0,8).toString(),'%PDF-1.4');
   assert.ok(bytes.includes(Buffer.from('/Type /Page')));
   await p.screenshot({path:'artifacts/conversion-journey/paid-'+width+'.png',fullPage:true});
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await p.evaluate(()=>{const qs=JSON.parse(localStorage.getItem('hqc_case'));qs.push({installer:'Illustrative Installer D'});localStorage.setItem('hqc_case',JSON.stringify(qs));document.getElementById('hqc-decision-pack-offer').remove();document.body.appendChild(document.createElement('span'))});
   await p.locator('#hqc-pack-selection').waitFor();
   for(const box of await p.locator('#hqc-pack-selection input').all())await box.check();
   await p.locator('#hqc-pack-selection button').click();
   assert.match(await p.locator('#hqc-pack-selection [role=status]').innerText(),/Select one, two or three/);
   await p.evaluate(()=>{history.replaceState({},'', '/?qa=1&technology=solar_battery');sessionStorage.setItem('hqc_journey_technology','solar_battery');document.body.appendChild(document.createElement('span'))});
   await p.locator('#hqc-pack-selection').waitFor({state:'detached'});
   assert.equal(await p.locator('#hqc-decision-pack-offer').count(),0);
   await p.evaluate(()=>{history.replaceState({},'', '/?qa=1&technology=heat_pump');sessionStorage.setItem('hqc_journey_technology','heat_pump');document.body.appendChild(document.createElement('span'))});
   await p.locator('#hqc-pack-selection').waitFor();
   for(const box of (await p.locator('#hqc-pack-selection input').all()).slice(0,3))await box.check();
   await p.locator('#hqc-pack-selection button').click();
   await p.locator('#hqc-decision-pack-offer table').waitFor();
   assert.doesNotMatch(await p.locator('#hqc-decision-pack-offer table').innerText(),/Illustrative Installer D/);
   await p.close();
  }
 }
 console.log('CONVERSION_JOURNEY_RENDERED mobile/desktop all technologies, visible guides, illustrative previews, offers, three-quote fulfilment and PDF downloads passed');
}finally{await browser.close()}
