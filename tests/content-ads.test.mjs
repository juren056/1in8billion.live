import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import{buildAdSense}from'../scripts/build-adsense.mjs';import worker from'../src/worker.js';
test('content advertising excludes personal workflows, utility pages and index lists',()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'content-ads-'));
 try{
  const include=['guides/quick-play/','zh-cn/countries/japan/','ru/how-it-works/'];
  const exclude=['','guides/','countries/','compare/','keepsake/','support/','keepsake/success/','privacy/'];
  for(const route of [...include,...exclude]){fs.mkdirSync(directory+'/'+route,{recursive:true});fs.writeFileSync(directory+'/'+route+'index.html','<html><head></head><body><main><h1>Content</h1><p>Public article</p></main></body></html>');}
  buildAdSense({directory,publisherId:'ca-pub-2031710024449901',adsEnabled:true,contentSlot:'9459958473'});
  for(const route of include){const html=fs.readFileSync(directory+'/'+route+'index.html','utf8');assert.equal((html.match(/data-content-ad/g)||[]).length,1);assert.match(html,/data-slot="9459958473"/);assert.doesNotMatch(html,/<script[^>]+googlesyndication/);}
  for(const route of exclude)assert.doesNotMatch(fs.readFileSync(directory+'/'+route+'index.html','utf8'),/data-content-ad|src="\/content-ads/);
  assert.match(fs.readFileSync(directory+'/privacy/index.html','utf8'),/No custom permission popup substitutes for a certified CMP/);
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
test('home pages provide four home placements and one outside the simulator; long articles are capped at two',()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'play-ads-'));
 try{
  fs.writeFileSync(directory+'/index.html','<html><head></head><body><main><section id="view-intro" class="view active"><div class="theme-hero">Home</div></section><section id="view-life" class="view"><section>Story</section></section><section id="view-end"></section></main></body></html>');
  fs.mkdirSync(directory+'/guides/long',{recursive:true});fs.writeFileSync(directory+'/guides/long/index.html','<html><head></head><body><main>'+Array.from({length:6},(_,i)=>'<section><h2>Chapter '+i+'</h2><p>'+'Content '.repeat(100)+'</p></section>').join('')+'</main></body></html>');
  buildAdSense({directory,publisherId:'ca-pub-2031710024449901',adsEnabled:true,contentSlot:'9459958473'});
  const home=fs.readFileSync(directory+'/index.html','utf8');assert.equal((home.match(/data-content-ad/g)||[]).length,5);assert.match(home,/<\/section><\/section><div class="play-ad-zone" data-ad-view="life"/);assert.equal((fs.readFileSync(directory+'/guides/long/index.html','utf8').match(/data-content-ad/g)||[]).length,2);
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
test('edge ad eligibility fails closed for unknown location, protected regions, GPC and disabled deployment',async()=>{
 const request=(country,gpc)=>{const r=new Request('https://1in8billion.live/api/ads/config',{headers:gpc?{'Sec-GPC':'1'}:{}});if(country)Object.defineProperty(r,'cf',{value:{country}});return r;};
 for(const country of [undefined,'XX','GB','CH','DE','FR','IS','NO','LI','RU']){const response=await worker.fetch(request(country),{CONTENT_ADS_ENABLED:'true'});assert.equal((await response.json()).allowed,false);assert.equal(response.headers.get('Cache-Control'),'no-store');}
 for(const country of ['US','JP','CN','IN','AU'])assert.equal((await(await worker.fetch(request(country),{CONTENT_ADS_ENABLED:'true'})).json()).allowed,true);
 assert.equal((await(await worker.fetch(request('US',true),{CONTENT_ADS_ENABLED:'true'})).json()).allowed,false);
 assert.equal((await(await worker.fetch(request('JP'),{})).json()).allowed,false);
});
