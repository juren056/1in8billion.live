import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {countryPages} from '../content/growth.mjs';
import {calculateComparison} from '../comparison-core.js';
test('growth routes are linked, indexable static answers with honest model calculations',()=>{
 const routes=JSON.parse(fs.readFileSync('dist/routes.json')),all=routes.map(r=>[r,fs.readFileSync('dist'+r+'index.html','utf8')]);
 const baseline=JSON.parse(fs.readFileSync('content/growth-baseline-routes.json'));for(const r of baseline)assert(routes.includes(r),'lost existing '+r);
 const targets=JSON.parse(fs.readFileSync('content/growth-delivery-targets.json'));assert.equal(targets.length,21);assert.equal(targets.filter(x=>!baseline.includes(x.route)).length,13);if((process.env.GROWTH_STAGE||'B')==='B')for(const target of targets)assert(routes.includes(target.route),'unfulfilled workbook target '+target.route);
 assert.equal(routes.length,(process.env.GROWTH_STAGE||'B')==='B'?62:52);assert.equal(new Set(routes).size,routes.length);
 for(const r of routes.filter(r=>!baseline.includes(r))){const h=all.find(([route])=>route===r)[1];assert(!h.includes('name="robots" content="noindex"'));assert(all.some(([other,text])=>other!==r&&text.includes('href="'+r+'"')),'orphan '+r);assert(h.includes('BreadcrumbList'));}
 const data=JSON.parse(fs.readFileSync('data/countries.json'));
 for(const c of countryPages){const r='/countries/'+c.slug+'/';if(!routes.includes(r))continue;const html=all.find(([route])=>route===r)[1],v=calculateComparison(data,c.id,c.id);assert(html.includes(v.a.share.toFixed(4)+'%'));assert(html.includes('unverified observation years'));assert(html.includes('<svg'));assert(html.includes('?country='+c.id));assert(html.includes(c.question));}
 for(const [route,html]of all.filter(([r])=>r.startsWith('/compare/')))assert(html.includes('data-play-path="/"'),'comparison missing game path '+route);
 assert(!fs.readFileSync('dist/sitemap.xml','utf8').includes('<lastmod>'));
});
