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
   const file=mode==='mobile'&&tech!=='heat_pump'?'mobile-homepage-override.js':'approved-home-layout.js';
   await page.addScriptTag({content:await readFile('hqc-deploy-preview/'+file,'utf8')});
   const scope=tech==='heat_pump'?'#hqc-clean-home':mode==='mobile'?'#hqc-mobile-landing':'.copy';
   await page.locator(scope).waitFor();
   if(tech==='heat_pump'){
    assert.match(await page.locator(scope+' .hqc-home-upload-note').innerText(),/photo.*PDF/);
    assert.equal(await page.locator(scope+' h1').innerText(),'See what’s missing in your quote');
    assert.equal(await page.locator(scope+' .hqc-home-report').count(),1);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.screenshot({path:'artifacts/landing-presentation/'+mode+'-'+tech+'.png',fullPage:true});
    continue;
   }
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
   if(tech==='solar_battery'){
    if(mode==='mobile'){
     await page.locator(scope+' [data-tech="heat_pump"]').click();
     await page.locator(scope+' [data-go="single"]').first().click();
    }else{
     await page.locator('#hqc-technology-choice [data-tech="heat_pump"]').click();
    }
    await page.waitForURL(url=>url.searchParams.get('technology')==='heat_pump');
    assert.equal(new URL(page.url()).searchParams.get('src'),'test_kept','category handoff retains attribution');
   }
  }
  await context.close();
 }

 // Verify candidate scripts in the real public page without submitting quotes or telemetry.
 for(const mode of ['mobile','desktop']){
  const context=await browser.newContext({viewport:mode==='mobile'?{width:390,height:844}:{width:1280,height:900}});
  const page=await context.newPage();
  const scripts={'/__hqc_conversion_examples.js':'conversion-examples.js','/__hqc_artwork_fit.js':'artwork-fit.js','/__hqc_mobile_homepage.js':'mobile-homepage-override.js','/__hqc_approved_layout.js':'approved-home-layout.js','/__hqc_landing_conversion.js':'landing-conversion.js'};
  await page.route('https://homequotecheck.co.uk/**',async route=>{
   const request=route.request(),path=new URL(request.url()).pathname;
   if(request.method()!=='GET')return route.abort();
   if(scripts[path])return route.fulfill({contentType:'application/javascript',body:await readFile('hqc-deploy-preview/'+scripts[path],'utf8')});
   return route.continue();
  });
  for(const tech of ['heat_pump','solar_battery','ev_chargepoint']){
   await page.goto('https://homequotecheck.co.uk/?qa=1&technology='+tech+'&src=qa_presentation',{waitUntil:'networkidle'});
   if(tech==='heat_pump'){
    const home=page.locator('#hqc-clean-home');await home.waitFor({state:'visible'});
    assert.match(await home.locator('.hqc-home-upload-note').innerText(),/photo.*PDF/);
    assert.equal(await page.locator('h1:visible').count(),1);
    assert.equal(await page.locator('#hqc-mobile-landing:visible,#hqc-desktop-example:visible').count(),0);
    await page.screenshot({path:'artifacts/landing-presentation/live-'+mode+'-'+tech+'.png',fullPage:true});
    continue;
   }
   const overlay=page.locator('#hqc-mobile-landing');
   const useOverlay=mode==='mobile'&&await overlay.count();
   const scope=useOverlay?'#hqc-mobile-landing':'.copy';
   if(useOverlay)await page.locator(scope+' [data-tech="'+tech+'"]').click();
   const note=await page.locator(useOverlay?scope+' .upload-note':'#hqc-primary-start span').innerText();
   if(tech!=='heat_pump'){
    assert.match(note,/text-based.*PDF/i,'live '+mode+' '+tech);
    if(mode==='desktop')assert.doesNotMatch(await page.locator('.copy').innerText(),/Compare your heat-pump quotes/i,'renewable secondary heading must match category');
    if(mode==='desktop')assert.doesNotMatch(await page.locator('body').innerText(),/Upload images or enter facts manually\./,'renewable process step must describe supported PDF');
    const images=page.locator(useOverlay?scope+' .scene img':'.copy + div img[src*="homepage-house"]');
    for(const img of await images.all())assert.equal(await img.isVisible(),false);
   }
   await page.screenshot({path:'artifacts/landing-presentation/live-'+mode+'-'+tech+'.png',fullPage:true});
  }
  await context.close();
 }

 console.log('LANDING_PRESENTATION_RENDERED mobile desktop heat_pump solar_battery ev_chargepoint');
}finally{await browser.close()}

