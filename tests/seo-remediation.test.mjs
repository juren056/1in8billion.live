import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {seoLocales} from '../content/seo-pages.mjs';
const read=route=>fs.readFileSync('dist'+route+'index.html','utf8');
const codes=h=>[...h.matchAll(/<code\b[^>]*>(.*?)<\/code>/g)].map(m=>m[1]);
test('localized provenance preserves every literal field identifier and hash',()=>{
 const original=codes(read('/sources/'));assert(original.includes('pop'));assert(original.includes('eys'));
 for(const c of Object.values(seoLocales))if(fs.existsSync('dist/'+c.prefix+'sources/index.html'))assert.deepEqual(codes(read('/'+c.prefix+'sources/')),original);
});
test('localized structured breadcrumbs match visible parents and current canonical page',()=>{
 for(const route of JSON.parse(fs.readFileSync('dist/routes.json'))){
  const html=read(route),lang=html.match(/<html lang="([^"]+)"/)[1],prefix=seoLocales[lang].prefix;
  for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){
   const data=JSON.parse(match[1]);if(data['@type']!=='BreadcrumbList')continue;
   assert.equal(data.itemListElement.at(-1).item,'https://1in8billion.live'+route);
   if(prefix)for(const item of data.itemListElement)assert(new URL(item.item).pathname.startsWith('/'+prefix),route+' parent locale');
  }
 }
});
test('home counters and their layout styles exist before JavaScript starts',()=>{
 for(const c of Object.values(seoLocales)){
  const html=read('/'+c.prefix);for(const id of ['arrivalBirths','arrivalSeconds','arrivalCountries'])assert.equal([...html.matchAll(new RegExp('id="'+id+'"','g'))].length,1);
  const head=html.slice(0,html.indexOf('</head>'));assert(head.includes('data-home-critical'));assert(head.includes('href="/retention.css" media="print"'));assert(head.includes('href="/experience-media.css" media="print"'));assert(html.includes('class="home-preview-frame"'));
 }
});
test('both short guides contain useful native tasks and a dataset-derived worked example',()=>{
 const data=JSON.parse(fs.readFileSync('data/countries.json')),j=data.find(c=>c.id==='JPN');
 for(const c of Object.values(seoLocales)){
  const example=read('/'+c.prefix+'guides/birth-share-vs-population-share/');
  assert(example.includes('data-worked-example'));assert(!example.includes('undefined'));
  for(const field of ['births','pop'])assert(example.includes((100*j[field]/data.reduce((n,row)=>n+row[field],0)).toFixed(4)+'%'));
  const task=read('/'+c.prefix+'guides/choosing-a-life-simulator/');assert(task.includes('data-task-guide'));assert(task.includes('/'+c.prefix+'guides/quick-play/'));
 }
});
