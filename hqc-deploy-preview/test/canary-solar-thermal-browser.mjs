import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {PDFDocument,StandardFonts} from 'pdf-lib';

const origin=process.env.HQC_CANARY_ORIGIN||'https://cf-preview.homequotecheck.co.uk';
const browser=await chromium.launch({headless:true});
const pdf=async text=>{const doc=await PDFDocument.create(),page=doc.addPage([612,792]);page.drawText(text,{x:60,y:720,size:11,font:await doc.embedFont(StandardFonts.Helvetica),maxWidth:492});return Buffer.from(await doc.save())};
const media=text=>({sourceMediaType:'application/pdf',extractionMethod:'pdfjs-text-v1',pageCount:1,extractedText:text});
try{
  for(const viewport of [{width:390,height:844},{width:1366,height:900}]){
    const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(String(error)));
    await page.goto(`${origin}/?qa=1&thermal_preview=1`,{waitUntil:'domcontentloaded',timeout:30000});
    await page.locator('#hqc-thermal-preview-badge').waitFor({state:'visible',timeout:20000});
    assert.match(await page.locator('.copy h1,.copy h2').first().innerText(),/solar thermal/i);
    assert.match(await page.locator('#hqc-thermal-preview-badge').innerText(),/NOT PUBLIC/);
    assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=1,'thermal home has no horizontal overflow');
    await page.getByRole('button',{name:/start solar thermal quote check/i}).first().click();
    const choose=page.locator('#hqc-choose-file');await choose.waitFor({state:'visible',timeout:15000});
    const picker=page.waitForEvent('filechooser',{timeout:5000});await choose.click();
    await (await picker).setFiles({name:'solar-thermal-installer.pdf',mimeType:'application/pdf',buffer:await pdf('Solar thermal evacuated tube collectors aperture area 4.2 m2. Solar hot water cylinder 250 litres. Solar heat 1900 kWh/year. Total £6,750.')});
    await page.waitForFunction(()=>{try{return JSON.parse(sessionStorage.getItem('hqc_solar_thermal_extracted_media')||'[]')[0]?.extractedText?.includes('4.2 m2')}catch{return false}},undefined,{timeout:15000});
    const extracted=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('hqc_solar_thermal_extracted_media'))[0]);
    assert.equal(extracted.sourceMediaType,'application/pdf');assert.equal(extracted.extractionMethod,'pdfjs-text-v1');assert.equal(extracted.pageCount,1);
    const analysed=await page.evaluate(async()=>{const r=await fetch('/api/analyse',{method:'POST',body:'native-upstream-body'});return {status:r.status,adapter:r.headers.get('x-hqc-analysis-adapter'),body:await r.json()}});
    assert.equal(analysed.status,200);assert.equal(analysed.adapter,'solar_thermal_internal');assert.equal(analysed.body.evidence.collectorAreaM2,4.2);assert.equal(analysed.body.evidence.cylinderLitres,250);
    const result=page.locator('#hqc-thermal-analysis-result');await result.waitFor({state:'visible',timeout:10000});
    const text=await result.innerText();for(const term of ['4.2 m²','250 litres','1,900 kWh/year','£6,750','installer claim','Questions to ask the installer'])assert.ok(text.includes(term),`missing thermal result: ${term}`);
    assert.equal(await page.locator('#hqc-decision-pack-offer').isVisible(),false);
    await page.evaluate(items=>sessionStorage.setItem('hqc_solar_thermal_extracted_media',JSON.stringify(items)),[media('Solar thermal flat plate collector aperture area 4.2 m2. Solar cylinder 250 litres. Solar heat 1900 kWh/year. Total £6,750.'),media('Solar thermal evacuated tube collector aperture area 3.4 m2. Solar cylinder 200 litres. Solar heat 1600 kWh/year. Total £5,950.')]);
    const compared=await page.evaluate(async()=>{const r=await fetch('/api/analyse',{method:'POST',body:'native-upstream-body'});return {status:r.status,body:await r.json()}});
    assert.equal(compared.status,200);assert.equal(compared.body.analyses.length,2);assert.equal(compared.body.comparison.find(x=>x.dimension==='installed price').values[1].value,5950);
    await result.getByText('Compare quote evidence').waitFor({state:'visible',timeout:10000});
    assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=1,'thermal comparison has no horizontal overflow');
    await page.goto(`${origin}/?qa=1&thermal_preview=1`,{waitUntil:'domcontentloaded',timeout:30000});
    await page.getByRole('button',{name:/start solar thermal quote check/i}).first().click();await choose.waitFor({state:'visible',timeout:15000});
    const picker2=page.waitForEvent('filechooser',{timeout:5000});await choose.click();await (await picker2).setFiles({name:'photo.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2+XkAAAAASUVORK5CYII=','base64')});
    await page.getByText(/Solar thermal checks accept text-based installer PDFs only/i).waitFor({state:'visible',timeout:5000});
    assert.equal(await page.evaluate(()=>sessionStorage.getItem('hqc_solar_thermal_extracted_media')),null,'unsupported image clears stale evidence');
    assert.deepEqual(errors,[]);await context.close();
  }
  const context=await browser.newContext(),page=await context.newPage();
  await page.goto(`${origin}/?qa=1`,{waitUntil:'domcontentloaded',timeout:30000});await page.locator('#hqc-technology-choice').waitFor({state:'visible',timeout:20000});
  assert.equal(await page.locator('#hqc-thermal-preview-badge').count(),0);assert.doesNotMatch(await page.locator('#hqc-technology-choice').innerText(),/solar thermal/i);
  await context.close();
  console.log('Private solar thermal PDF, analysis, comparison, boundary and responsive browser checks passed.');
}finally{await browser.close()}
