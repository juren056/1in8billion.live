import fs from'node:fs';import assert from'node:assert/strict';import{catalog}from'../content/story/catalog-source.mjs';import{decisions,ui}from'../content/story/decisions-source.mjs';
assert.equal(catalog.length,160);assert.equal(new Set(catalog.map(e=>e.id)).size,160);
const metadata=catalog.map(({en,zh,...r})=>r),choices=decisions.map(({en,zh,prompt,promptZh,options,...r})=>({...r,options:options.map(({en,zh,...o})=>o)}));
fs.writeFileSync('dist/story-data.js','export const catalog='+JSON.stringify(metadata)+';export const decisions='+JSON.stringify(choices)+';');
fs.mkdirSync('dist/story-locales',{recursive:true});const keys=[...catalog.map(e=>e.id),...decisions.flatMap(d=>[d.id,d.id+'.prompt',...d.options.map(o=>d.id+'.'+o.id)]),...Object.keys(ui).map(k=>'ui.'+k)].sort();
for(const lang of ['en','zh-CN','zh-TW','ja','ko','es','pt-BR','fr','de']){const d=JSON.parse(fs.readFileSync('content/story/locales/'+lang+'.json'));assert.deepEqual(Object.keys(d).sort(),keys,lang);fs.writeFileSync('dist/story-locales/'+lang+'.json',JSON.stringify(d));}
for(const file of ['story-engine.js','story-experience.js','story-experience.css','story-occupations.js'])fs.copyFileSync(file,'dist/'+file);
const core=[...new Set([...fs.readFileSync('app.js','utf8').matchAll(/eventId:'(core.[^']+)'/g)].map(m=>m[1]))];
fs.writeFileSync('dist/story-coverage.json',JSON.stringify({version:3,total:catalog.length,decisions:decisions.length,core,adapters:['birth','death','focus','finance','family','legacy-unknown'],interactions:['moment','people','explore','letter','choice'],events:metadata,locales:9,art:{atlas:'/public-assets/story/moments-atlas-v1.webp',cells:16,scenes:48},legacyAdapter:true},null,2));

fs.copyFileSync('content/story/config.json','dist/story-config.json');
