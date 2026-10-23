import fs from 'node:fs';import assert from 'node:assert/strict';
const base='https://1in8billion.live',expected=process.env.EXPECTED_REVISION;
assert(/^[a-f0-9]{40}$/.test(expected||''),'EXPECTED_REVISION required');
const release=await fetch(base+'/release.json',{cache:'no-store'}).then(r=>r.json());assert.equal(release.revision,expected);assert.equal(release.version,'1.26.0');
const routes=JSON.parse(fs.readFileSync('dist/routes.json','utf8')),checked=[],queue=[...routes];
await Promise.all(Array.from({length:4},async()=>{while(queue.length){const route=queue.shift(),r=await fetch(base+route),html=await r.text();assert.equal(r.status,200,route);assert(r.headers.get('content-type').includes('text/html'),route);assert(html.includes('rel="canonical" href="'+base+route+'"'),route);checked.push(route);}}));
for(const version of [4,5,6])for(const lang of ['en','zh-CN','zh-TW','ja','ko','es','pt-BR','fr','de']){const r=await fetch(base+`/story-v${version}-locales/${lang}.json`);assert.equal(r.status,200);assert(r.headers.get('content-type').includes('json'));assert.equal(Object.keys(await r.json()).length,version===6?992:version===5?760:399);}
const config=await fetch(base+'/story-config.json').then(r=>r.json());assert.equal(config.newRules,6);
const coverage=await fetch(base+'/story-v6-coverage.json').then(r=>r.json());assert.equal(coverage.narratives,260);assert.equal(coverage.chains.length,42);assert.deepEqual(coverage.legacyRules,[1,2,3,4,5]);
for(const file of ['/story-v6-engine.js','/story-v6-data.js','/story-v4-engine.js'])for(const method of ['GET','HEAD']){const r=await fetch(base+file,{method});assert.equal(r.status,200);assert(/javascript/.test(r.headers.get('content-type')),file);if(method==='GET')assert((await r.text()).includes('export '));}
const provenance=await fetch(base+'/story-v6-provenance.json').then(r=>r.json());assert.equal(provenance.sources.length,10);
const bad=await fetch(base+'/this-page-must-not-exist-20261023/');assert.equal(bad.status,404);assert((await bad.text()).includes('noindex'));
const sm=await fetch(base+'/sitemap.xml');assert.equal(sm.status,200);assert.equal((await sm.text()).match(/<loc>/g).length,226);
const health=await fetch(base+'/api/keepsake/health').then(r=>r.json());assert.equal(health.mode,'live');assert.equal(health.amount,299);assert.equal(health.checkout,true);
fs.mkdirSync('audit/story-v6',{recursive:true});fs.writeFileSync('audit/story-v6/production-http.json',JSON.stringify({release,routes:checked.length,locales:9,keysPerLocale:992,legacyV4Keys:399,legacyV5Keys:760,narratives:260,chains:42,config,scriptMimeGetHead:true,sitemap:226,real404:true,health:{mode:health.mode,amount:health.amount,checkout:health.checkout}},null,2));console.log('PASS exact production release, 226 canonicals, nine v6 packs, legacy v4/v5 packs, scripts, sitemap, true 404 and live billing health');
