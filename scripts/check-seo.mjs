import fs from 'node:fs';
import assert from 'node:assert/strict';
import {checkPageSeo} from './seo-pages.mjs';
checkPageSeo();
const routes=JSON.parse(fs.readFileSync('dist/routes.json')),titles=new Set();
for(const route of routes){const html=fs.readFileSync('dist'+route+'index.html','utf8');
assert.ok(html.includes(`rel="canonical" href="https://1in8billion.live${route}"`),route+' canonical');
const title=html.match(/<title>(.*?)<\/title>/)[1],titleKey=html.match(/<html lang="([^"]+)"/)[1]+'|'+title;assert.ok(!titles.has(titleKey),'Duplicate title within language '+title);titles.add(titleKey);
assert.equal((html.match(/<h1[ >]/g)||[]).length,1,route+' h1');
assert.ok(/<html lang="[^"]+"/.test(html));assert.ok(html.includes('name="description"'));
for(const m of html.matchAll(/<link rel="alternate" hreflang="[^"]+" href="https:\/\/1in8billion.live([^"?]+)"/g))assert.ok(routes.includes(m[1]),'Missing alternate '+m[1]);
for(const m of html.matchAll(/(?:src|href)="(\/[^"#?]*)"/g)){const target=m[1];assert.ok(fs.existsSync('dist'+target)||fs.existsSync('dist'+target+'index.html'),route+' missing '+target);}
assert.ok(!html.includes('contact@born-somewhere'));
assert.ok(!/(?:src|href)="[^"]*\/undefined(?:\/|["?#])/.test(html),route+' invalid locale link');
for(const match of html.matchAll(/href="(\/[^"?#]*)#([^"=]+)"/g)){const [,target,id]=match;const file='dist'+target+(target.endsWith('/')?'index.html':'');if(fs.existsSync(file)&&file.endsWith('.html'))assert.ok(fs.readFileSync(file,'utf8').includes(`id="${id}"`),route+' missing fragment '+target+'#'+id);}
const currentLang=html.match(/<html lang="([^"]+)"/)[1];for(const match of html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="https:\/\/1in8billion.live([^"?]+)"/g)){if(match[1]==='x-default')continue;const other=fs.readFileSync('dist'+match[2]+'index.html','utf8');assert.ok(other.includes(`hreflang="${currentLang}" href="https://1in8billion.live${route}"`),route+' missing reciprocal alternate '+match[2]);}
}
assert.equal((fs.readFileSync('dist/sitemap.xml','utf8').match(/<loc>/g)||[]).length,routes.length);
assert.ok(fs.readFileSync('dist/404.html','utf8').includes('noindex'));
console.log(`SEO passed for ${routes.length} pages: unique titles, canonical, H1, existing alternates and local resources`);
