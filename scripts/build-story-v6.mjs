import fs from 'node:fs';
import assert from 'node:assert/strict';
import {catalog} from '../content/story-v6/catalog-source.mjs';
import {allChains as chains} from '../content/story-v6/chains-source.mjs';
import {narrativeCopy} from '../content/story-v6/copy-source.mjs';
assert.equal(catalog.length,260);assert.equal(chains.length,42);
const canonical=narrativeCopy(),keys=Object.keys(canonical).sort();
const clean=chains.map(({en,zh,prompt,promptZh,preludeEn,preludeZh,setupEn,setupZh,options,...d})=>({...d,options:options.map(({en,zh,resultEn,resultZh,followEn,followZh,laterEn,laterZh,...o})=>o)}));
fs.writeFileSync('dist/story-v6-data.js','export const catalog='+JSON.stringify(catalog.map(({en,zh,...r})=>r))+';export const chains='+JSON.stringify(clean)+';export const canonical='+JSON.stringify(canonical)+';');
fs.mkdirSync('dist/story-v6-locales',{recursive:true});
for(const lang of ['en','zh-CN','zh-TW','ja','ko','es','pt-BR','fr','de']){
 const source='content/story-v6/locales/'+lang+'.json',d=JSON.parse(fs.readFileSync(source));
 assert.deepEqual(Object.keys(d).sort(),keys,lang);
 for(const k of keys){assert(d[k]?.trim(),lang+':'+k);assert.deepEqual([...(canonical[k].matchAll(/\{[A-Za-z]+\}/g))].map(m=>m[0]).sort(),[...d[k].matchAll(/\{[A-Za-z]+\}/g)].map(m=>m[0]).sort(),lang+':'+k);}
 fs.copyFileSync(source,'dist/story-v6-locales/'+lang+'.json');
}
fs.copyFileSync('story-v6-engine.js','dist/story-v6-engine.js');
fs.writeFileSync('dist/story-v6-coverage.json',JSON.stringify({version:6,narratives:catalog.length,chains:clean,locales:9,art:{atlas:'/public-assets/story/moments-atlas-v1.webp',cells:16},legacyRules:[1,2,3,4,5]},null,2));

fs.copyFileSync('content/story-v6/provenance.json','dist/story-v6-provenance.json');
