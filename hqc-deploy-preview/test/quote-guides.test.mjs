import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const pages=[
 ['compare-heat-pump-quotes','Compare Heat Pump Quotes Before You Pay a Deposit'],
 ['is-this-a-good-heat-pump-quote','Is This a Good Heat Pump Quote?'],
 ['heat-pump-quote-checklist','Heat Pump Quote Checklist – What to Check Before You Commit'],
 ['what-should-a-heat-pump-quote-include','What Should a Heat Pump Quote Include?'],
 ['heat-pump-heat-loss-calculation-flow-temperature','Heat Pump Heat Loss Calculation &amp; Flow Temperature – Why They Matter'],
];
for(const [slug,title] of pages)test(slug+' gives a complete free-check entry and useful related guides',async()=>{
 const html=await readFile(new URL('../'+slug+'.html',import.meta.url),'utf8').catch(()=> '');
 assert.ok(html.includes('<h1>'+title+'</h1>'),'requested H1 is present');
 assert.equal((html.match(/<h1>/g)||[]).length,1);
 assert.ok(html.includes('No account required'));
 assert.ok((html.match(/Upload your quote for a free gap analysis/g)||[]).length>=2);
 assert.ok(html.includes('technology=heat_pump'));
 assert.ok(html.includes('Frequently asked questions'));
 assert.ok(pages.filter(([s])=>s!==slug&&html.includes('/'+s)).length>=2,'related guides are linked');
 assert.doesNotMatch(html,/£29|£19|£39|guaranteed savings|installer introductions/i);
});
