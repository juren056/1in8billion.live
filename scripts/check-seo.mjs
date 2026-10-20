import fs from 'node:fs';
import assert from 'node:assert/strict';
const routes=JSON.parse(fs.readFileSync('dist/routes.json')),titles=new Set();
for(const route of routes){const html=fs.readFileSync('dist'+route+'index.html','utf8');
assert.ok(html.includes(`rel="canonical" href="https://1in8billion.live${route}"`),route+' canonical');
const title=html.match(/<title>(.*?)<\/title>/)[1];assert.ok(!titles.has(title),'Duplicate title '+title);titles.add(title);
assert.equal((html.match(/<h1[ >]/g)||[]).length,1,route+' h1');
assert.ok(/<html lang="[^"]+"/.test(html));assert.ok(html.includes('name="description"'));
for(const m of html.matchAll(/<link rel="alternate" hreflang="[^"]+" href="https:\/\/1in8billion.live([^"?]+)"/g))assert.ok(routes.includes(m[1]),'Missing alternate '+m[1]);
for(const m of html.matchAll(/(?:src|href)="(\/[^"#?]*)"/g)){const target=m[1];assert.ok(fs.existsSync('dist'+target)||fs.existsSync('dist'+target+'index.html'),route+' missing '+target);}
assert.ok(!html.includes('contact@born-somewhere'));
}
assert.equal((fs.readFileSync('dist/sitemap.xml','utf8').match(/<loc>/g)||[]).length,routes.length);
assert.ok(fs.readFileSync('dist/404.html','utf8').includes('noindex'));
console.log(`SEO passed for ${routes.length} pages: unique titles, canonical, H1, existing alternates and local resources`);
