import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';

test('private EV upload rejects an image and clears earlier PDF evidence',async()=>{
  const source=fs.readFileSync(new URL('../upload-friction-v3.js',import.meta.url),'utf8');
  const listeners={};
  const values=new Map([['hqc_ev_extracted_media',JSON.stringify([{extractedText:'previous quote'}])]]);
  const help={children:[],querySelector(){return null},appendChild(child){this.children.push(child)}};
  const card={querySelector(selector){return selector==='#hqc-upload-help'?help:null}};
  class Input{constructor(){this.type='file';this.files=[{name:'new-photo.png',type:'image/png'}];this.dataset={};this.value='new-photo.png'}closest(){return card}}
  const document={addEventListener(name,fn){listeners[name]=fn},documentElement:{},createElement(){return {style:{},setAttribute(){},textContent:''}},querySelector(){return null}};
  vm.runInNewContext(source,{document,HTMLInputElement:Input,URLSearchParams,MutationObserver:class{observe(){}},requestAnimationFrame(){},sessionStorage:{getItem:key=>values.get(key)??null,setItem:(key,v)=>values.set(key,v),removeItem:key=>values.delete(key)},location:{search:'?ev_preview=1'},console});
  const input=new Input();let prevented=false,stopped=false;
  await listeners.change({target:input,preventDefault(){prevented=true},stopImmediatePropagation(){stopped=true}});
  assert.equal(prevented,true);
  assert.equal(stopped,true);
  assert.equal(values.has('hqc_ev_extracted_media'),false);
  assert.equal(input.value,'');
  assert.match(help.children.at(-1)?.textContent||'',/text-based.*PDF/i);
});
