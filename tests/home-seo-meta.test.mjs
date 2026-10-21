import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {seoLocales,seoTypes} from '../content/seo-pages.mjs';
import {reviewedUi} from '../content/ui-review.mjs';
const h1Baseline=JSON.parse(fs.readFileSync('content/home-h1-baseline.json'));
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&lt;','<');
for(const [lang,c] of Object.entries(seoLocales))test(lang+' final home and landing metadata express page intent',()=>{
 for(const type of ['',...seoTypes]){
  const route='/'+c.prefix+type,html=fs.readFileSync('dist'+route+'index.html','utf8');
  const expected=type?c.descriptions[seoTypes.indexOf(type)]:c.home;
  for(const marker of ['name="description"','property="og:description"','name="twitter:description"'])assert.equal(decode(html.match(new RegExp('<meta '+marker+' content="([^"]*)"'))?.[1]||''),expected,route+' '+marker);
  assert(html.includes('https://1in8billion.live/public-assets/og.png'));
  if(!type){
   assert.equal(html.match(/<h1[^>]*>(.*?)<\/h1>/s)[1],h1Baseline[route],route+' preserve H1');
   const text=html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g,'').replace(/<[^>]*>/g,' ');
   if(lang!=='en')assert(!/Family Tree|Not started|Past life records|Import GEDCOM|Country B \(compare/.test(text),route+' static untranslated UI');
   assert(!/\{(?:age|le|n)\}|\blab\.(?:country|sex|run|start)\b/.test(text),route+' raw UI template');
   assert.equal(Object.keys(reviewedUi[lang]).length,51);
   assert(reviewedUi[lang]['life.noMajorEvent']);
   if(lang!=='en')assert.notEqual(reviewedUi[lang]['life.noMajorEvent'],reviewedUi.en['life.noMajorEvent']);
  }
 }
});
test('calendar detail is concentrated in help while every public deep link survives',()=>{
 const routes=JSON.parse(fs.readFileSync('dist/routes.json'));
 for(const route of routes){const html=fs.readFileSync('dist'+route+'index.html','utf8');assert(html.includes('id="birth-calendar"'));if(!route.endsWith('/how-it-works/')&&!route.endsWith('/guides/quick-play/'))assert(html.includes('how-it-works/#birth-calendar'));}
});
test('historical crawler 404s redirect only to existing canonical pages',()=>{
 const redirects=JSON.parse(fs.readFileSync('content/legacy-redirects.json'));
 const routes=JSON.parse(fs.readFileSync('dist/routes.json')),rules=fs.readFileSync('dist/_redirects','utf8');
 assert.equal(Object.keys(redirects).length,6);assert(!rules.includes('*'));
 for(const[from,to]of Object.entries(redirects)){assert(rules.includes(`${from} ${to} 301`));assert(routes.includes(to));assert(!routes.includes(from));}
});
