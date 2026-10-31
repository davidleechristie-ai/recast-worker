import {chromium} from 'playwright';
import {readFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin='https://homequotecheck.co.uk';
const css=await readFile('hqc-deploy-preview/presentation-polish.css','utf8');
const guides=['compare-heat-pump-quotes','how-we-help','decision-pack','heat-pump-heat-loss-calculation-flow-temperature'];
const browser=await chromium.launch({headless:true});
await mkdir('artifacts/presentation-polish',{recursive:true});
const apply=(html,kind)=>html.replace(/<body\b/,'<body data-hqc-presentation="'+kind+'"').replace('</head>','<link rel="stylesheet" href="/presentation-polish.css"></head>');
try{
 for(const width of [320,390,768,1440]){
  const context=await browser.newContext({viewport:{width,height:1000}});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.route('**/*',async route=>{
   const req=route.request(),u=new URL(req.url());
   if(req.method()!=='GET'||u.origin!==origin)return route.abort();
   if(u.pathname==='/presentation-polish.css')return route.fulfill({contentType:'text/css',body:css});
   if(guides.includes(u.pathname.slice(1)))return route.fulfill({contentType:'text/html',body:apply(await readFile('hqc-deploy-preview/'+u.pathname.slice(1)+'.html','utf8'),'guide')});
   if(u.pathname==='/'){
    const response=await route.fetch();return route.fulfill({response,body:apply(await response.text(),'app')});
   }
   return route.continue();
  });
  const fit=async scope=>assert.equal(await scope.evaluate(el=>Math.max(el.ownerDocument.documentElement.scrollWidth,el.ownerDocument.body.scrollWidth)>el.ownerDocument.defaultView.innerWidth),false,'page fits '+width);
  await page.goto(origin+'/?qa=1&technology=heat_pump&src=qa_presentation_polish',{waitUntil:'networkidle'});
  const home=page.locator('#hqc-clean-home');
  await home.waitFor({state:'visible'});
  assert.equal(await page.locator('h1:visible').count(),1);
  assert.equal(await home.locator('header nav').isVisible(),true,'mobile navigation remains available');
  await page.waitForFunction(()=>{const i=document.querySelector('#hqc-clean-home .hqc-home-scene img');return i?.complete&&i.naturalWidth>0});
  assert.ok(await home.locator('.hqc-home-report li').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=14),'report details readable');
  await fit(home);
  await page.screenshot({path:'artifacts/presentation-polish/home-'+width+'.png',fullPage:true});
  await page.locator('#hqc-primary-start').click();
  await page.getByRole('heading',{name:'Upload your quote',exact:true}).waitFor({state:'visible'});
  const next=page.getByRole('button',{name:/^Continue/});
  assert.equal(await next.isEnabled(),false,'presentation cannot enable an incomplete journey');
  assert.ok(await next.evaluate(el=>parseFloat(getComputedStyle(el).opacity)<0.6),'disabled control visually distinct');
  await fit(page.locator('body'));
  await page.screenshot({path:'artifacts/presentation-polish/upload-'+width+'.png',fullPage:true});
  for(const slug of guides){
   await page.goto(origin+'/'+slug,{waitUntil:'networkidle'});
   assert.equal(await page.locator('h1:visible').count(),1);
   await fit(page.locator('body'));
   assert.equal(await page.locator('link[rel="canonical"]').count(),1);
   await page.screenshot({path:'artifacts/presentation-polish/'+slug+'-'+width+'.png',fullPage:true});
  }
  assert.deepEqual(errors,[]);
  await context.close();
 }
 console.log('PRESENTATION_POLISH_RENDERED 320 390 768 1440 home upload guides; native disabled state preserved');
}finally{await browser.close()}
