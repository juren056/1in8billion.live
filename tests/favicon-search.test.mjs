import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
test('every public page declares one stable Google-supported PNG favicon',()=>{
 const routes=JSON.parse(fs.readFileSync('dist/routes.json'));
 for(const route of routes){const html=fs.readFileSync('dist'+route+'index.html','utf8'),icons=[...html.matchAll(/<link\b[^>]*\brel="icon"[^>]*>/g)].map(m=>m[0]);assert.equal(icons.length,1,route);assert(icons[0].includes('href="/public-assets/icon-96.png"'));assert(icons[0].includes('type="image/png"'));assert(icons[0].includes('sizes="96x96"'));assert(!/name="robots" content="[^"]*(?:noindex|nosnippet)/.test(html));}
 const png=fs.readFileSync('dist/public-assets/icon-96.png');assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),96);assert.equal(png.readUInt32BE(20),96);assert.deepEqual(fs.readFileSync('dist/favicon.ico'),fs.readFileSync('public-assets/favicon.ico'));assert(fs.readFileSync('dist/robots.txt','utf8').includes('Allow: /'));
});
test('loading and no-JavaScript fallback states are excluded from snippets in all nine homes',()=>{
 for(const prefix of['','ja/','ko/','zh-tw/','zh-cn/','es/','pt-br/','fr/','de/']){const html=fs.readFileSync('dist/'+prefix+'index.html','utf8');assert.match(html,/<div[^>]*id="gameLoadState"[^>]*data-nosnippet[^>]*>/);assert.match(html,/<noscript><div data-nosnippet><p>[\s\S]*?<\/p><\/div><\/noscript>/);assert.match(html,/<p class="hero-sub">[^<]+<\/p>/);}
});
