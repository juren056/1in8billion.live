import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {clarityTag} from '../scripts/clarity.mjs';
test('Clarity adds one asynchronous loader without changing GA4 globals, events or consent',()=>{
 const inserted=[],head={append:s=>inserted.push(s)},document={readyState:'complete',addEventListener:()=>{},documentElement:{lang:'en'},head,querySelector:s=>inserted.find(x=>s.includes(x.src)),createElement:()=>({}),getElementsByTagName:()=>[{parentNode:{insertBefore:s=>inserted.push(s)}}]};
 const ctx=vm.createContext({GA4_ID:'G-NKD2PNDL3P',location:{href:'https://1in8billion.live/',pathname:'/',origin:'https://1in8billion.live',search:''},document,URL,URLSearchParams});ctx.window=ctx;
 vm.runInContext(fs.readFileSync('analytics-url.js','utf8')+'\n'+fs.readFileSync('scripts/analytics.js','utf8'),ctx);
 const before={gtag:ctx.gtag,events:ctx.siteEvent,layer:ctx.dataLayer,commands:JSON.stringify(ctx.dataLayer)},code=clarityTag('z10y02dkut').replace(/^<script[^>]*>|<\/script>$/g,'');
 vm.runInContext(code,ctx);vm.runInContext(code,ctx);
 assert.equal(inserted.filter(s=>s.src==='https://www.clarity.ms/tag/z10y02dkut').length,1);assert.equal(inserted.at(-1).async,1);assert.equal(ctx.gtag,before.gtag);assert.equal(ctx.siteEvent,before.events);assert.equal(ctx.dataLayer,before.layer);assert.equal(JSON.stringify(ctx.dataLayer),before.commands);assert.equal(ctx.GA4_ID,'G-NKD2PNDL3P');assert(!/consent|gtag|dataLayer/.test(code));
 ctx.clarity('event','test');assert.deepEqual(JSON.parse(JSON.stringify(Array.from(ctx.clarity.q,args=>Array.from(args)))),[['event','test']]);
 assert.equal(clarityTag(''),'');assert.throws(()=>clarityTag('bad</script>'));assert.throws(()=>clarityTag('https://evil.test'));
});
test('all public pages contain exactly one Clarity project; private exports and family views are masked',()=>{
 for(const route of JSON.parse(fs.readFileSync('dist/routes.json'))){const html=fs.readFileSync('dist'+route+'index.html','utf8');assert.equal((html.match(/data-site-clarity/g)||[]).length,1,route);assert.equal((html.match(/z10y02dkut/g)||[]).length,1,route);assert.equal((html.match(/src="\/analytics-config.js"/g)||[]).length,1,route);assert(!html.includes('clarity("consent'));if(html.includes('id="view-life"'))for(const id of['view-life','view-end','view-tree','view-shelf','pauseModal','feedbackModal','birthCertModal'])assert.match(html,new RegExp('id="'+id+'" data-clarity-mask="true"'));if(route.endsWith('/keepsake/'))assert.match(html,/id="premiumPreview" data-clarity-mask="true"/);if(route.endsWith('/privacy/'))assert(html.includes('id="clarity-privacy"')&&html.includes('https://privacy.microsoft.com/privacystatement'));}
 for(const path of['404.html','keepsake/success/index.html','keepsake/cancel/index.html'])assert(!fs.readFileSync('dist/'+path,'utf8').includes('data-site-clarity'));
 const lifeReturn=fs.readFileSync('life-return.js','utf8');assert(!lifeReturn.includes('localCollection'));assert(!lifeReturn.includes('collection.setAttribute'));
});
