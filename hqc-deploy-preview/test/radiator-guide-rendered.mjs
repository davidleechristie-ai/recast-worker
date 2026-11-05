import {chromium} from 'playwright';
import {readFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const html=await readFile('hqc-deploy-preview/heat-pump-radiator-check.html','utf8');
const css=await readFile('hqc-deploy-preview/editorial-sitewide.css','utf8');
const browser=await chromium.launch({headless:true});
await mkdir('artifacts/radiator-guide',{recursive:true});
try{
 for(const width of [320,390,1440]){
  const page=await browser.newPage({viewport:{width,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.route('https://radiator.test/**',route=>{
   const path=new URL(route.request().url()).pathname;
   if(path==='/heat-pump-radiator-check')return route.fulfill({contentType:'text/html',body:html.replace('</head>','<link rel="stylesheet" href="/editorial-sitewide.css"></head>')});
   if(path==='/editorial-sitewide.css')return route.fulfill({contentType:'text/css',body:css});
   return route.fulfill({contentType:'text/html',body:'<h1>Free checker handoff</h1>'});
  });
  await page.goto('https://radiator.test/heat-pump-radiator-check');
  assert.equal(await page.locator('h1').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'fits '+width);
  assert.equal(await page.locator('#emitter-record li').count(),5);
  const example=page.getByRole('region',{name:'What does radiator ΔT mean?'});
  await example.scrollIntoViewIfNeeded();assert.equal(await example.isVisible(),true);
  assert.ok((await example.innerText()).includes('20°C (ΔT20)'));
  for(const q of JSON.parse(await page.locator('script[type="application/ld+json"]').textContent()).mainEntity){
   assert.equal(await page.getByRole('heading',{name:q.name,exact:true}).isVisible(),true);
   assert.equal(await page.getByText(q.acceptedAnswer.text,{exact:true}).isVisible(),true);
  }
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://homequotecheck.co.uk/heat-pump-radiator-check');
  assert.equal(await page.locator('time').getAttribute('datetime'),'2026-11-05');
  assert.equal(await page.locator('nav.related a').count(),3);
  const ctas=page.getByRole('link',{name:'Check my heat pump quote — free',exact:true});
  assert.equal(await ctas.count(),2);
  for(let i=0;i<2;i++){
   const box=await ctas.nth(i).boundingBox();assert.ok(box&&box.width>=44&&box.height>=44);
   await ctas.nth(i).focus();assert.equal(await ctas.nth(i).evaluate(el=>el===document.activeElement),true);
   const u=new URL(await ctas.nth(i).getAttribute('href'),'https://homequotecheck.co.uk');
   assert.equal(u.searchParams.get('technology'),'heat_pump');assert.equal(u.searchParams.get('hqc_start'),'1');
   assert.equal(u.searchParams.get('src'),i===0?'organic_radiator_top':'organic_radiator_end');
  }
  await page.screenshot({path:'artifacts/radiator-guide/'+width+'-guide.png',fullPage:true});
  await example.screenshot({path:'artifacts/radiator-guide/'+width+'-example.png'});
  await ctas.first().click();assert.equal(new URL(page.url()).searchParams.get('technology'),'heat_pump');
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('RADIATOR_GUIDE_RENDERED: editorial CSS, 320/390/1440, visible schema and attributed heat-pump handoff passed');
}finally{await browser.close()}
