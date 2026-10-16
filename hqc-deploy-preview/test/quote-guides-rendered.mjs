import {chromium} from 'playwright';
import {readFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const slugs=['compare-heat-pump-quotes','is-this-a-good-heat-pump-quote','heat-pump-quote-checklist','what-should-a-heat-pump-quote-include','heat-pump-heat-loss-calculation-flow-temperature'];
const browser=await chromium.launch({headless:true});
await mkdir('artifacts/quote-guides',{recursive:true});
try{
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.route('https://guides.test/**',async route=>{
   const path=new URL(route.request().url()).pathname.replace(/\.html$/,'').slice(1);
   if(slugs.includes(path))return route.fulfill({contentType:'text/html',body:await readFile('hqc-deploy-preview/'+path+'.html','utf8')});
   return route.fulfill({contentType:'text/html',body:'<h1>Free checker handoff</h1>'});
  });
  for(const slug of slugs){
   await page.goto('https://guides.test/'+slug);
   assert.equal(await page.locator('h1').count(),1);
   assert.ok((await page.locator('h1').innerText()).length>20);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,slug+' fits viewport');
   assert.ok(await page.getByRole('link',{name:'Upload your quote for a free gap analysis',exact:true}).count()>=2);
   const related=await page.locator('nav.related a').evaluateAll(xs=>xs.map(x=>x.href));
   for(const href of related){await page.goto(href);assert.equal(await page.locator('h1').count(),1);assert.notEqual(await page.locator('h1').innerText(),'Free checker handoff');}
   await page.goto('https://guides.test/'+slug);
   await page.screenshot({path:'artifacts/quote-guides/'+width+'-'+slug+'.png',fullPage:true});
   await page.getByRole('link',{name:'Upload your quote for a free gap analysis',exact:true}).first().click();
   const u=new URL(page.url());assert.equal(u.searchParams.get('technology'),'heat_pump');assert.equal(u.searchParams.get('hqc_start'),'1');assert.match(u.searchParams.get('src'),/^organic_/);
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('QUOTE_GUIDES_RENDERED five pages, mobile/desktop, links and attributed free-check handoffs passed');
}finally{await browser.close()}
