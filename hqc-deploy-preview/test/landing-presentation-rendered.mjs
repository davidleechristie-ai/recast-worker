import {chromium} from 'playwright';
import {readFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
await mkdir('artifacts/landing-presentation',{recursive:true});
const fixture='<!doctype html><html><head></head><body><header><button>Get started</button></header><main><div class="hero"><div class="copy"><h1>Check your quote</h1><p>Understand your quote.</p><button class="primary">Check your quote</button></div><div><img src="/resources/homepage-house-only.svg" alt="Home"></div></div></main></body></html>';
try{
 for(const mode of ['mobile','desktop']){
  const context=await browser.newContext({viewport:mode==='mobile'?{width:390,height:844}:{width:1280,height:900}});
  const page=await context.newPage();
  await page.route('https://presentation.test/**',route=>route.fulfill({contentType:'text/html',body:fixture}));
  for(const tech of ['heat_pump','solar_battery','ev_chargepoint']){
   await page.goto('https://presentation.test/?technology='+tech+'&src=test_kept');
   await page.evaluate(t=>sessionStorage.setItem('hqc_journey_technology',t),tech);
   const file=mode==='mobile'?'mobile-homepage-override.js':'approved-home-layout.js';
   await page.addScriptTag({content:await readFile('hqc-deploy-preview/'+file,'utf8')});
   const scope=mode==='mobile'?'#hqc-mobile-landing':'.copy';
   await page.locator(scope).waitFor();
   if(mode==='mobile')await page.locator(scope+' [data-tech="'+tech+'"]').click();
   await page.waitForTimeout(100);
   const note=await page.locator(mode==='mobile'?scope+' .upload-note':'#hqc-primary-start span').innerText();
   if(tech!=='heat_pump'){
    assert.match(note,/text-based.*PDF/i,mode+' '+tech+' must explain text PDF support');
    assert.doesNotMatch(note,/upload a photo|upload a screenshot/i);
    assert.match(note,/Photos and scanned PDFs are not supported/);
    const visibleHeatPump=await page.locator((mode==='mobile'?scope+' ':'')+'img[src*="homepage-house"]').evaluateAll(imgs=>imgs.some(img=>!!(img.offsetWidth||img.offsetHeight)&&getComputedStyle(img).visibility!=='hidden'&&getComputedStyle(img).display!=='none'&&!!img.closest('body')&&!img.closest('[hidden]')&&(!img.parentElement||getComputedStyle(img.parentElement).display!=='none')));
    assert.equal(visibleHeatPump,false,mode+' '+tech+' must not display heat-pump imagery');
    const heading=await page.locator(scope+' h1').innerText();
    assert.doesNotMatch(heading,/heat pump/i);
   }else{
    assert.match(note,/photo|screenshot/i);
   }
   await page.screenshot({path:'artifacts/landing-presentation/'+mode+'-'+tech+'.png',fullPage:true});
   assert.match(page.url(),/src=test_kept/);
  }
  await context.close();
 }

 // Verify candidate scripts in the real public page without submitting quotes or telemetry.
 for(const mode of ['mobile','desktop']){
  const context=await browser.newContext({viewport:mode==='mobile'?{width:390,height:844}:{width:1280,height:900}});
  const page=await context.newPage();
  const scripts={'/__hqc_mobile_homepage.js':'mobile-homepage-override.js','/__hqc_approved_layout.js':'approved-home-layout.js','/__hqc_landing_conversion.js':'landing-conversion.js'};
  await page.route('https://homequotecheck.co.uk/**',async route=>{
   const request=route.request(),path=new URL(request.url()).pathname;
   if(request.method()!=='GET')return route.abort();
   if(scripts[path])return route.fulfill({contentType:'application/javascript',body:await readFile('hqc-deploy-preview/'+scripts[path],'utf8')});
   return route.continue();
  });
  for(const tech of ['heat_pump','solar_battery','ev_chargepoint']){
   await page.goto('https://homequotecheck.co.uk/?qa=1&technology='+tech+'&src=qa_presentation',{waitUntil:'networkidle'});
   const overlay=page.locator('#hqc-mobile-landing');
   const useOverlay=mode==='mobile'&&await overlay.count();
   const scope=useOverlay?'#hqc-mobile-landing':'.copy';
   if(useOverlay)await page.locator(scope+' [data-tech="'+tech+'"]').click();
   const note=await page.locator(useOverlay?scope+' .upload-note':'#hqc-primary-start span').innerText();
   if(tech!=='heat_pump'){
    assert.match(note,/text-based.*PDF/i,'live '+mode+' '+tech);
    const images=page.locator(useOverlay?scope+' .scene img':'.copy + div img[src*="homepage-house"]');
    for(const img of await images.all())assert.equal(await img.isVisible(),false);
   }
   await page.screenshot({path:'artifacts/landing-presentation/live-'+mode+'-'+tech+'.png',fullPage:true});
  }
  await context.close();
 }

 console.log('LANDING_PRESENTATION_RENDERED mobile desktop heat_pump solar_battery ev_chargepoint');
}finally{await browser.close()}
