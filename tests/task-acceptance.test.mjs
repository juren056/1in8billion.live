import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {preserveTaskLinks} from '../task-navigation.js';import {taskCopy,presentationDictionary} from '../task-copy.js';
test('language changes preserve public task inputs and discard private parameters and fragments',()=>{
 const links=['/zh-cn/compare/','/de/compare/'].map(href=>({href}));preserveTaskLinks({querySelectorAll:()=>links},'https://example.org/compare/?a=CHN&b=NGA&mode=population&country=JPN&note=private#secret');
 for(const link of links){const u=new URL(link.href,'https://example.org');assert.equal(u.searchParams.get('a'),'CHN');assert.equal(u.searchParams.get('b'),'NGA');assert.equal(u.searchParams.get('mode'),'population');assert.equal(u.searchParams.get('country'),'JPN');assert(!u.searchParams.has('note'));assert.equal(u.hash,'');}
 preserveTaskLinks({querySelectorAll:()=>links},'https://example.org/?a=private&mode=bad');assert.equal(links[0].href,'/zh-cn/compare/');
});
test('task guidance has complete nine-language contracts and no unsupported population conversions',()=>{
 for(const c of Object.values(taskCopy)){assert.deepEqual(Object.keys(c),Object.keys(taskCopy.en));assert(Object.values(c).every(v=>typeof v==='string'&&v.length));assert(c.quartile.includes('{n}'));}
 assert.equal(presentationDictionary('zh-CN')['Game estimates · not a personal forecast'],'虚构模型 · 并非个人命运预测');
});
test('all sitemap pages are unique, canonical public routes and reachable through static links',()=>{
 const routes=JSON.parse(fs.readFileSync('dist/routes.json')),xml=fs.readFileSync('dist/sitemap.xml','utf8'),urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 assert.equal(new Set(urls).size,routes.length);assert.deepEqual(urls,routes.map(r=>'https://1in8billion.live'+r));assert(!urls.some(u=>/[?#]/.test(u)||/\/(api|success|cancel)\//.test(u)));
 const map=new Map(routes.map(r=>[r,fs.readFileSync('dist'+r+'index.html','utf8')])),depth=new Map([['/',0]]),queue=['/'];
 while(queue.length){const r=queue.shift();for(const m of map.get(r).matchAll(/<a\b[^>]*href="([^"#]+)"/g)){let target;try{target=new URL(m[1],'https://1in8billion.live'+r);}catch{continue;}if(target.origin!=='https://1in8billion.live'||!map.has(target.pathname)||depth.has(target.pathname))continue;depth.set(target.pathname,depth.get(r)+1);queue.push(target.pathname);}}
 assert.equal(depth.size,routes.length,'Every public page must be discoverable from home');for(const r of routes)assert(depth.get(r)<=3,r+' exceeds three links');
});
