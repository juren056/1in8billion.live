import test from 'node:test';import assert from 'node:assert/strict';
import {defaultIndex,assetsAfter,clarityCopy} from '../play-clarity.js';
test('default disclosure preserves smallest asset delta and model debt floor',()=>{
 for(const deltas of [[-5000,3000,1000],[8000,-6000,5000],[-50000,-10000,20000],[50000,-10000,-15000]]){
  const choices=deltas.map(net=>({delta:{net}})),before=structuredClone(choices);
  assert.equal(defaultIndex(choices),deltas.indexOf(Math.min(...deltas)));assert.deepEqual(choices,before);
  for(const current of [0,1500.25,-99999,200000])for(const delta of deltas)assert.equal(assetsAfter(current,delta),Math.max(-100000,current+delta));
 }
 assert.equal(defaultIndex([{delta:{net:0}},{delta:{net:0}}]),0);
});
test('disclosures and childhood model wording are authored for all nine locales',()=>{
 assert.equal(Object.keys(clarityCopy).length,9);
 for(const [lang,c]of Object.entries(clarityCopy))for(const [key,text]of Object.entries(c))assert(text.length>1,lang+':'+key);
 assert(clarityCopy['zh-CN'].units.includes('并非真实货币'));assert(clarityCopy['zh-CN'].rule.includes('最负'));
});
