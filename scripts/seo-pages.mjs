import fs from 'node:fs';
import assert from 'node:assert/strict';
import {seoLocales,seoTypes,seoLinks,seoHomeTitles} from '../content/seo-pages.mjs';
import {staticNavigation} from './static-navigation.mjs';
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
export function applyPageSeo(routes){
 fs.copyFileSync('game-load-guard.js','dist/game-load-guard.js');
 for(const route of routes){
  const path='dist'+route+'index.html';let h=fs.readFileSync(path,'utf8');
  const lang=h.match(/<html lang="([^"]+)"/)[1],c=seoLocales[lang];
  h=staticNavigation(h,lang);fs.writeFileSync(path,h);
  const task=route.slice(1+c.prefix.length),i=seoTypes.indexOf(task);
  if(task==='about/'){
   const label=({en:'Maintenance and contact','zh-CN':'维护与联系','zh-TW':'維護與聯絡',ja:'保守とお問い合わせ',ko:'유지 관리 및 문의',es:'Mantenimiento y contacto','pt-BR':'Manutenção e contato',fr:'Maintenance et contact',de:'Pflege und Kontakt'})[lang];
   const body=`<section data-project-identity><h2>${label}</h2><p><a href="https://github.com/juren056/1in8billion.live">GitHub · juren056/1in8billion.live</a> · <a href="mailto:support@1in8billion.live">support@1in8billion.live</a></p><p><a href="https://github.com/juren056/1in8billion.live/commits/main/">Git</a> · <a href="/release.json">release.json</a> · <a href="/${c.prefix}sources/#provenance">${escape(seoLinks[lang][1])}</a></p></section>`;
   h=h.replace('</main>',body+'</main>');fs.writeFileSync(path,h);
  }
  if(task!==''&&i<0)continue;
  const title=task?c.titles[i]:(seoHomeTitles[lang]||h.match(/<title>(.*?)<\/title>/)[1].replace(/ \| 1in8billion\.live$/,'')),description=task?c.descriptions[i]:c.home;
  // One authoritative final pass: search and social descriptions stay in sync.
  if(task||seoHomeTitles[lang])h=h.replace(/<title>.*?<\/title>/,`<title>${escape(title)} | 1in8billion.live</title>`);
  for(const [marker,value] of [['name="description"',description],['property="og:title"',title],['property="og:description"',description],['name="twitter:title"',title],['name="twitter:description"',description]]){
   const tag=`<meta ${marker} content="${escape(value)}">`,re=new RegExp('<meta '+marker+' content="[^"]*">');
   h=re.test(h)?h.replace(re,()=>tag):h.replace('</head>',tag+'</head>');
  }
  if(!task){
   h=h.replace('</head>','<script src="/game-load-guard.js" defer></script></head>');
   const q=c.questions;
   const faq=`<section class="seo-content" data-product-answers><h2>${escape(q[0])}</h2><p>${escape(q[1])} <a href="/${c.prefix}?country=JPN">${escape(seoLinks[lang][0])}</a></p><h2>${escape(q[2])}</h2><p>${escape(q[3])} <a href="https://1in8b.life/">1in8b.life</a></p></section>`;
   h=h.replace('<section class="home-life-intro">',faq+'<section class="home-life-intro">');
   // Initial hidden templates should be readable when extracted; runtime fills actual values.
   h=h.replace(/(<[^>]+data-t="[^"]+"[^>]*>)([^<]*\{(?:age|le|n)\}[^<]*)(<\/[^>]+>)/g,'$1—$3');
   if(!h.includes('"@type":"WebSite"'))h=h.replace('</head>','<script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@type':'WebSite',name:'1in8billion.live',url:'https://1in8billion.live/',inLanguage:lang})+'</script></head>');
  }
  fs.writeFileSync(path,h);
 }
}
export function checkPageSeo(){
 for(const c of Object.values(seoLocales))for(const type of ['',...seoTypes]){
  const route='/'+c.prefix+type,h=fs.readFileSync('dist'+route+'index.html','utf8'),expected=escape(type?c.descriptions[seoTypes.indexOf(type)]:c.home);
  for(const marker of ['name="description"','property="og:description"','name="twitter:description"'])assert(h.includes(`<meta ${marker} content="${expected}">`),route+' metadata intent drift: '+marker);
 }
}
export function sitemapXml(routes,origin='https://1in8billion.live'){
 const sorted=[...new Set(routes)];assert.equal(sorted.length,routes.length,'Duplicate sitemap route');
 return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sorted.map(route=>{
  assert(/^\/(?:[a-z0-9-]+\/)*$/.test(route),'Not a clean public route: '+route);
  const html=fs.readFileSync('dist'+route+'index.html','utf8');
  assert(html.includes(`rel="canonical" href="${origin}${route}"`),'Noncanonical sitemap URL '+route);
  assert(!/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html),'Noindex sitemap URL '+route);
  return `  <url><loc>${origin}${route}</loc></url>`;
 }).join('\n')}\n</urlset>\n`;
}
