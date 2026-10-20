import fs from 'node:fs';import assert from 'node:assert/strict';import {test} from 'node:test';import vm from 'node:vm';
import {alpha2,flagFor,countryName} from '../scripts/country-identity.mjs';
import {copy} from '../content/surface-copy.mjs';
test('country presentation uses a complete ISO mapping and leaves simulation inputs unchanged',()=>{
 const source=JSON.parse(fs.readFileSync('data/countries.json')),built=JSON.parse(fs.readFileSync('dist/data/countries.json'));
 assert.equal(Object.keys(alpha2).length,source.length);
 for(const original of source){const current=built.find(c=>c.id===original.id);for(const [key,value]of Object.entries(original))if(key!=='flag')assert.deepEqual(current[key],value,original.id+' '+key);assert.equal(current.flag,flagFor(original.id));for(const lang of Object.keys(copy)){assert(countryName(original,lang));assert.notEqual(countryName(original,lang),original.id);}}
 assert.equal(flagFor('CHN'),'🇨🇳');assert.equal(flagFor('KOR'),'🇰🇷');assert.equal(flagFor('AUT'),'🇦🇹');assert.equal(flagFor('COD'),'🇨🇩');assert.equal(flagFor('TWN'),'🇹🇼');
});
test('all shipped interface languages have the same non-empty surface contract',()=>{const keys=Object.keys(copy.en).sort();for(const s of Object.values(copy)){assert.deepEqual(Object.keys(s).sort(),keys);assert(Object.values(s).every(v=>Array.isArray(v)?v.length>0:typeof v==='string'&&v.length>0));}});
test('analytics separates content from home and discards private fields',()=>{
 const script=fs.readFileSync('scripts/analytics.js','utf8');
 for(const path of ['/','/ja/','/compare/','/guides/replay-links/']){const inserted=[],ctx=vm.createContext({GA4_ID:'G-TEST',location:{pathname:path,origin:'https://example.com',search:''},document:{readyState:'complete',documentElement:{lang:'en'},createElement:()=>({}),head:{append:s=>inserted.push(s)}},URLSearchParams});ctx.window=ctx;vm.runInContext(script,ctx);const events=ctx.dataLayer.filter(x=>x[0]==='event');assert.equal(events[0][1],path==='/'||path==='/ja/'?'home_view':'content_view');ctx.siteEvent('share_replay',{language:'en',name:'Private name',seed:'private',note:'private'});assert.deepEqual(JSON.parse(JSON.stringify(ctx.dataLayer.at(-1)[2])),{language:'en'});assert.equal(inserted.length,1);}
});
