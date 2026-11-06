import {chromium} from 'playwright';
import {readFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin='https://homequotecheck.co.uk';
const slugs=['how-we-help','decision-pack','compare-heat-pump-quotes','is-this-a-good-heat-pump-quote','heat-pump-quote-checklist','what-should-a-heat-pump-quote-include','heat-pump-heat-loss-calculation-flow-temperature','heat-pump-quote-questions','heat-pump-radiator-check'];
const script=await readFile('hqc-deploy-preview/shared-header.js','utf8');
const css=await readFile('hqc-deploy-preview/editorial-sitewide.css','utf8');
const browser=await chromium.launch({headless:true});
await mkdir('artifacts/shared-header',{recursive:true});
try{
 for(const width of [320,390,1440]){
  const context=await browser.newContext({viewport:{width,height:900}});
  const page=await context.newPage();
  await page.route('**/*',async route=>{
   const req=route.request(),u=new URL(req.url());
   if(req.method()!=='GET'||u.origin!==origin)return route.abort();
   if(u.pathname==='/__hqc_shared_header.js')return route.fulfill({contentType:'application/javascript',body:script});
   if(u.pathname==='/editorial-sitewide.css')return route.fulfill({contentType:'text/css',body:css});
   if(slugs.includes(u.pathname.slice(1))){
    const html=await readFile('hqc-deploy-preview/'+u.pathname.slice(1)+'.html','utf8');
    return route.fulfill({contentType:'text/html',body:html.replace('</head>','<link rel="stylesheet" href="/editorial-sitewide.css"></head>').replace('</body>','<script src="/__hqc_shared_header.js" defer></script></body>')});
   }
   return route.continue();
  });
  for(const slug of slugs){
   await page.goto(origin+'/'+slug,{waitUntil:'networkidle'});
   const brand=page.getByRole('link',{name:'Home Quote Check home',exact:true});
   assert.equal(await brand.count(),1,slug+' has one accessible shared brand');
   assert.equal(await brand.getAttribute('href'),'/');
   assert.equal(await brand.locator('.hqc-shared-mark svg').count(),1);
   assert.equal(await brand.locator('.hqc-shared-tagline').innerText(),'Be sure before you sign.');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,slug+' header fits '+width);
   if(slug==='how-we-help')assert.equal(await page.locator('header a[aria-current="page"]').count(),1,'existing current-page navigation remains');
   const header=page.locator('header');
   await header.screenshot({path:'artifacts/shared-header/'+slug+'-'+width+'.png'});
  }
  await page.goto(origin+'/?qa=1&technology=heat_pump',{waitUntil:'networkidle'});
  const home=page.locator('#hqc-clean-home');await home.waitFor({state:'visible'});
  assert.equal(await home.locator('header .hqc-home-mark svg').evaluate(el=>getComputedStyle(el).color),'rgb(255, 255, 255)','home mark has contrasting white stroke');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'home fits '+width);
  await page.screenshot({path:'artifacts/shared-header/home-'+width+'.png',fullPage:true});
  await page.locator('#hqc-primary-start').click();
  await page.getByRole('heading',{name:'Upload your quote',exact:true}).waitFor({state:'visible'});
  await page.locator('header.hqc-unified-app-header').waitFor({state:'visible'});
  assert.equal(await page.getByRole('link',{name:'Home Quote Check home',exact:true}).count(),1);
  assert.equal(await page.getByRole('button',{name:/^Continue/}).isEnabled(),false,'header changes do not advance incomplete journey');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'upload fits '+width);
  await page.screenshot({path:'artifacts/shared-header/upload-'+width+'.png',fullPage:true});
  await context.close();
 }
 console.log('SHARED_HEADER_RENDERED nine guides + home + native upload at320/390/1440');
}finally{await browser.close()}
