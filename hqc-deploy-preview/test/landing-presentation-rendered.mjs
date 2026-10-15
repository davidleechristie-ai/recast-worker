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
 console.log('LANDING_PRESENTATION_RENDERED mobile desktop heat_pump solar_battery ev_chargepoint');
}finally{await browser.close()}
