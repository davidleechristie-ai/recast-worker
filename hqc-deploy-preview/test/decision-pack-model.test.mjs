import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../decision-pack-model.js',import.meta.url),'utf8').catch(()=>'');
const context={};vm.runInNewContext(source,context);
test('normalises only supplied scope and preserves missing evidence',()=>{
 assert.ok(context.HqcPackModel,'pack model exists');
 const r=context.HqcPackModel.build([{installer:'A',electricalWork:'Excluded: customer to arrange',emitterChanges:'Provisional allowance £500',model:'Model 8',flowTemperatureC:45},{installer:'B',electricalWork:'Electrical works included in quoted price'}]);
 assert.equal(r.quotes.length,2);
 assert.equal(r.quotes[0].scope.find(x=>x.key==='electricalWork').status,'Excluded');
 assert.equal(r.quotes[0].scope.find(x=>x.key==='emitterChanges').status,'Provisional');
 assert.equal(r.quotes[1].scope.find(x=>x.key==='electricalWork').status,'Confirmed');
 assert.equal(r.quotes[1].scope.find(x=>x.key==='emitterChanges').status,'Not stated');
 assert.ok(r.quotes[1].questions.some(x=>/flow temperature/i.test(x)));
 assert.match(r.quotes[0].scope.find(x=>x.key==='electricalWork').evidence,/customer to arrange/);
});
test('never silently discards a fourth quote',()=>{
 assert.ok(context.HqcPackModel);
 assert.throws(()=>context.HqcPackModel.build([{}, {}, {}, {}]),/three/i);
});
test('assumptions are labelled and hostile quote text is escaped in markup',()=>{
 assert.ok(context.HqcPackModel);
 const r=context.HqcPackModel.build([{installer:'<img src=x onerror=alert(1)>',electricalWork:'Assumed existing supply suitable'}]);
 assert.equal(r.quotes[0].scope.find(x=>x.key==='electricalWork').status,'Assumed');
 const html=context.HqcPackModel.markup(r);
 assert.ok(html.includes('&lt;img'));
 assert.ok(!html.includes('<img'));
});
test('negative and uncertain scope wording never becomes a confirmed inclusion',()=>{
 const build=value=>context.HqcPackModel.build([{electricalWork:value}]).quotes[0].scope.find(x=>x.key==='electricalWork').status;
 assert.equal(build('Electrical work not covered'),'Excluded');
 assert.equal(build('Assumed electrical work excluded'),'Assumed');
 assert.equal(build('Electrical work included?'),'Assumed');
 assert.equal(build({included:true}),'Not stated');
 assert.equal(context.HqcPackModel.build([{price:'Infinity'}]).quotes[0].price,'Not stated');
});
