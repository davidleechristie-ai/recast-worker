import {chromium} from 'playwright';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
await mkdir('artifacts/conversion-journey',{recursive:true});
const code=n=>readFile('hqc-deploy-preview/'+n,'utf8');
const scripts={'/__hqc_conversion_examples.js':'conversion-examples.js','/__hqc_artwork_fit.js':'artwork-fit.js','/__hqc_landing_conversion.js':'landing-conversion.js','/__hqc_mobile_homepage.js':'mobile-homepage-override.js','/__hqc_approved_layout.js':'approved-home-layout.js','/__hqc_simple_results.js':'simple-results-journey.js','/__hqc_decision_pack.js':'decision-pack.js','/__hqc_paid_comparison.js':'paid-comparison-gate.js'};
const quotes=[{installer:'Illustrative Installer A',price:12400,model:'Model 8',electricalWork:'Electrical work included in quoted price',emitterChanges:'Provisional allowance £500',flowTemperatureC:45},{installer:'Illustrative Installer B',price:11900,model:'Model 8',electricalWork:'Excluded: customer to arrange'},{installer:'Illustrative Installer C',price:13000,roomByRoom:'Not provided'}];
async function layoutEvidence(page,label){
 const data=await page.evaluate(()=>{
  const name=el=>el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(typeof el.className==='string'?'.'+el.className.trim().replaceAll(' ','.'):'');
  const rect=el=>{const b=el.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom}};
  const selectors=['.copy','#hqc-primary-start','.copy .hqc-visible-guides','#hqc-desktop-example','img[data-hqc-hero-image]'];
  const elements=selectors.map(selector=>{const el=document.querySelector(selector);if(!el)return {selector,missing:true};const ancestors=[];for(let p=el;p&&p!==document.body;p=p.parentElement){const c=getComputedStyle(p);ancestors.push({name:name(p),rect:rect(p),display:c.display,order:c.order,overflowX:c.overflowX,overflowY:c.overflowY,inline:p.style.cssText})}return {selector,ancestors}});
  const styles=new Map([...document.querySelectorAll('*')].map(el=>[el.style,name(el)]));
  const writes=(window.__hqcStyleTrace||[]).map(x=>({element:styles.get(x.style)||'detached',property:x.property,value:x.value,stack:x.stack}));
  const images=[...document.querySelectorAll('img')].filter(el=>/homepage-|hqcHero/.test(el.src)||el.dataset.hqcHeroImage).map(el=>({src:el.getAttribute('src'),tagged:el.dataset.hqcHeroImage,insideCopy:!!el.closest('.copy'),ancestors:[el.parentElement,el.parentElement?.parentElement].filter(Boolean).map(name)}));
  return {viewport:{width:innerWidth,height:innerHeight},elements,writes,images};
 });
 await writeFile('artifacts/conversion-journey/layout-'+label+'.json',JSON.stringify(data,null,2));
 return data;
}
function assertFreePath(state,label){
 for(const selector of ['#hqc-primary-start','.copy .hqc-visible-guides']){
  const item=state.elements.find(x=>x.selector===selector);assert.ok(item&&!item.missing,selector+' exists '+label);
  const child=item.ancestors[0].rect;assert.ok(child.width>0&&child.height>0,selector+' is rendered '+label);
  for(const parent of item.ancestors.slice(1))if(['hidden','clip'].includes(parent.overflowY))assert.ok(child.y>=parent.rect.y-1&&child.bottom<=parent.rect.bottom+1,selector+' is not vertically clipped by '+parent.name+' '+label);
 }
}
try{
 for(const width of [320,390,768,1440]){
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.addInitScript(()=>{
   window.__hqcStyleTrace=[];
   const keep=(style,property,value)=>{const stack=new Error().stack||'';if(stack.includes('__hqc')){window.__hqcStyleTrace.push({style,property,value:String(value),stack});if(window.__hqcStyleTrace.length>2000)window.__hqcStyleTrace.shift()}};
   const proto=CSSStyleDeclaration.prototype,original=proto.setProperty,cssText=Object.getOwnPropertyDescriptor(proto,'cssText');
   proto.setProperty=function(property,value,priority){keep(this,property,value);return original.call(this,property,value,priority)};
   Object.defineProperty(proto,'cssText',{...cssText,set(value){keep(this,'cssText',value);return cssText.set.call(this,value)}});
  });
  await page.route('https://homequotecheck.co.uk/**',async route=>{
   const r=route.request(),p=new URL(r.url()).pathname;
   if(r.method()!=='GET')return route.abort();
   if(scripts[p])return route.fulfill({contentType:'application/javascript',body:await code(scripts[p])});
   return route.continue();
  });
  for(const tech of ['heat_pump','solar_battery','ev_chargepoint']){
   if((width===320||width===768)&&tech!=='heat_pump')continue;
   await page.goto('https://homequotecheck.co.uk/?qa=1&technology='+tech+'&src=qa_conversion',{waitUntil:'networkidle'});
   if(tech==='heat_pump'){
    const home=page.locator('#hqc-clean-home');
    await home.waitFor({state:'visible',timeout:10000});
    await page.waitForTimeout(1500);
    assert.equal(await page.locator('h1:visible').count(),1);
    assert.equal(await home.locator('h1').innerText(),'See what’s missing in your quote');
    assert.equal(await home.locator('.hqc-home-guide').count(),4);
    assert.equal(await home.locator('.hqc-home-benefit').count(),4);
    assert.equal(await home.locator('.hqc-home-report').count(),1);
    assert.match(await home.locator('.hqc-home-report').innerText(),/Illustrative example/i);
    assert.match(await home.locator('.hqc-home-report').innerText(),/3 details to clarify/);
    assert.equal(await page.locator('#hqc-desktop-example:visible,#hqc-mobile-landing:visible,.hqc-mob-sample:visible').count(),0,'legacy examples are absent');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'homepage has no horizontal overflow');
    const cta=home.locator('#hqc-primary-start');
    const before=await cta.boundingBox();assert.ok(before.y+before.height<900,'free CTA appears in first screen');
    await page.screenshot({path:'artifacts/conversion-journey/home-'+width+'-'+tech+'.png',fullPage:true});
    await page.setViewportSize({width:width-1,height:900});await page.setViewportSize({width,height:900});
    assert.equal(await cta.evaluate(el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===el}),true,'free CTA remains unoccluded after capture and resize');
    await cta.click();await page.locator('#hqc-choose-file').waitFor({state:'visible'});
    assert.equal(await home.count(),0,'homepage releases ownership on upload');
    assert.match(page.url(),/src=qa_conversion/,'upload preserves attribution');
    await page.getByRole('link',{name:'Home',exact:true}).click();
    await page.locator('#hqc-clean-home').waitFor({state:'visible'});
    await page.locator('#hqc-clean-home [data-home-start="compare"]').click();
    await page.locator('#hqc-choose-file').waitFor({state:'visible'});
    assert.match(await page.locator('body').innerText(),/Add the quotes you want to compare/);
    continue;
   }
   const root=width<760?'#hqc-mobile-landing':'.copy';
   if(tech==='heat_pump')await page.locator(root+' .hqc-visible-guides').waitFor({state:'visible'});else assert.equal(await page.locator(root+' .hqc-visible-guides:visible').count(),0);
   const preview=page.locator(width<760?'#hqc-mobile-landing .hqc-example-output':'#hqc-desktop-example');
   await preview.waitFor({state:'visible'});
   await page.waitForTimeout(3500); // Let legacy layout retries settle before inspecting final state.
   assert.match(await preview.innerText(),/ILLUSTRATIVE EXAMPLE/);
   assert.match(await preview.innerText(),/No account required/);
   if(width>=760){assert.equal(await page.locator('img[data-hqc-hero-image]').isVisible(),false,'legacy hero image stays hidden');assert.equal(await preview.evaluate(el=>[...el.children].every(child=>{const a=child.getBoundingClientRect(),b=el.getBoundingClientRect();return a.left>=b.left-1&&a.right<=b.right+1&&a.top>=b.top-1&&a.bottom<=b.bottom+1;})),true,'complete report content fits inside the preview');}
   const bounds=await preview.boundingBox();assert.ok(bounds.width>250,'report is not squeezed into a legacy illustration slot');assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width,'example stays within viewport');if(width>=760&&await page.locator('#hqc-hero-steps').count())assert.equal(await page.locator('#hqc-hero-steps').isVisible(),false,'old illustration overlay is hidden');
   assert.equal(await preview.evaluate(el=>el.scrollWidth>el.clientWidth),false,'example report is not clipped');
   assert.equal(await preview.evaluate(el=>{const r=el.getBoundingClientRect();for(let p=el;p&&p!==document.body;p=p.parentElement){const b=p.getBoundingClientRect(),c=getComputedStyle(p);if(c.overflowY==='hidden'&&(r.top<b.top-1||r.bottom>b.bottom+1))return false;}return getComputedStyle(el.parentElement).display!=='flex';}),true,'legacy artwork fitter does not crop the report');
   if(tech!=='heat_pump')assert.doesNotMatch(await preview.innerText(),/heat-loss calculation/);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   if(width>=760&&tech==='heat_pump')await layoutEvidence(page,'before-fullpage');
   await page.screenshot({path:'artifacts/conversion-journey/home-'+width+'-'+tech+'.png',fullPage:width>=760});
   if(width>=760&&tech==='heat_pump'){
    assertFreePath(await layoutEvidence(page,'after-fullpage'),'after full-page capture');
    await page.setViewportSize({width:width-1,height:900});await page.setViewportSize({width,height:900});await page.waitForTimeout(500);
    const state=await layoutEvidence(page,'after-resize');
    await page.screenshot({path:'artifacts/conversion-journey/hero-after-resize.png'});
    assertFreePath(state,'after resize');
   }
   if(tech==='heat_pump'){await page.locator(root+' .hqc-visible-guides').scrollIntoViewIfNeeded();await page.screenshot({path:'artifacts/conversion-journey/guides-'+width+'-'+tech+'.png'});}
  }
  if(width===320||width===768){await page.close();continue;}
  await page.setContent(await code('decision-pack.html'));
  assert.match(await page.locator('h1').innerText(),/before you pay a deposit/);
  assert.match(await page.locator('main').innerText(),/£4.99 one-off/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'sales page fits mobile');
  await page.screenshot({path:'artifacts/conversion-journey/sales-'+width+'.png',fullPage:true});
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

