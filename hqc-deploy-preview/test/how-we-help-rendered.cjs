const {chromium}=require('playwright');
const {readFile,mkdir}=require('node:fs/promises');
const assert=require('node:assert/strict');
(async()=>{
 const root='hqc-deploy-preview/';
 const html=await readFile(root+'how-we-help.html','utf8');
 const snapshot=await readFile(root+'snapshot.mjs','utf8');
 const layout=await readFile(root+'approved-home-layout.js','utf8');
 assert.match(snapshot,/staticGuides=\['how-we-help.html'/);
 assert.match(snapshot,/guideUrls=\[TARGET\+'\/how-we-help'/);
 assert.ok(snapshot.includes('href="/how-we-help"'));
 assert.ok(layout.includes('href="/how-we-help">How We Help</a>'));
 const browser=await chromium.launch({headless:true});
 await mkdir('artifacts/how-we-help',{recursive:true});
 try {
  for(const width of [320,390,1440]){
   const page=await browser.newPage({viewport:{width,height:900}});
   await page.route('https://help.test/**',route=>route.fulfill({contentType:'text/html',body:new URL(route.request().url()).pathname==='/how-we-help'?html:'<h1>Quote checker</h1>'}));
   await page.goto('https://help.test/how-we-help?qa=1');
   assert.equal(await page.locator('h1').innerText(),'Are solar and heat pump quotes a rip off?');
   for(const heading of ['The Red Flags in a Home Energy Quote','3 Signs You Are Being Overcharged','How to Decode the Hidden Maintenance Fees']) assert.equal(await page.getByRole('heading',{name:heading,exact:true}).count(),1);
   assert.equal(await page.locator('h1').count(),1);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://homequotecheck.co.uk/how-we-help');
   assert.equal(await page.locator('section[aria-labelledby] h3').count(),await page.locator('.help').count(),'each scenario explains how HQC helps');
   assert.match(await page.locator('main').innerText(),/text-based installer PDF/);
   assert.doesNotMatch(await page.locator('main').innerText(),/completely anonymous|instantly.*fair deal|guaranteed savings/i);
   const links=await page.locator('a.cta').evaluateAll(xs=>xs.map(x=>x.href));
   assert.equal(links.length,4);
   for(const href of links){const u=new URL(href);assert.equal(u.searchParams.get('qa'),'1');assert.match(u.searchParams.get('src'),/^how_we_help_/);assert.ok(['heat_pump','solar_battery'].includes(u.searchParams.get('technology')));if(u.searchParams.get('technology')==='heat_pump')assert.equal(u.searchParams.get('hqc_start'),'1');else assert.equal(u.searchParams.get('start'),'single');}
   await page.screenshot({path:'artifacts/how-we-help/'+width+'.png',fullPage:true});
   await page.getByRole('link',{name:'Check my solar / battery quote — free',exact:true}).first().click();
   assert.equal(new URL(page.url()).searchParams.get('technology'),'solar_battery');
   assert.equal(new URL(page.url()).searchParams.get('qa'),'1');
   await page.goto('https://help.test/?qa=1');
   await page.setContent('<div class="copy"><h1>Original homepage</h1><button class="primary">Start</button></div>');
   await page.addScriptTag({content:layout});
   await page.locator('#hqc-clean-home').waitFor();
   const helpLink=page.locator('footer a[href="/how-we-help"]');
   assert.equal(await helpLink.count(),1);
   assert.equal(await helpLink.isVisible(),true);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'homepage navigation fits');
   await helpLink.scrollIntoViewIfNeeded();
   await page.screenshot({path:'artifacts/how-we-help/'+width+'-homepage-footer.png'});
   await helpLink.click();
   assert.equal(new URL(page.url()).pathname,'/how-we-help');
   assert.equal(await page.locator('h1').innerText(),'Are solar and heat pump quotes a rip off?');
   await page.close();
  }
  console.log('HOW_WE_HELP_RENDERED page, headings, limits, mobile/desktop and attributed QA handoffs passed');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
