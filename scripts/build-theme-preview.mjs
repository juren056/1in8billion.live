import{conversionCopy}from'../premium-keepsake/conversion-copy.js';
import {comparisonStateCopy} from '../comparison-state-copy.js';
import fs from'node:fs';
import{themeCopy,themeIds,studyCopy}from'../theme-copy.js';
import{locales}from'../locale-runtime.js';
import{buildDesignGallery}from'./build-design-gallery.mjs';
import{release}from'../release-info.mjs';
import{toolCopy}from'../tool-workspace-copy.js';
import{migrateReadingPages}from'./build-reading-system.mjs';
import{displayCountry}from'../country-labels.js';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const icon='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" stroke="none"/></svg>';
export function buildThemePreview(routes,{preview=false}={}){
 for(const file of['launch-life.js','start-dock-copy.js','table-system.js','table-columns.js','table-system.css','tool-workspace.js','tool-workspace-copy.js','reading-system.css','theme-home.js','theme-studio.js','modern-life-art.js','product-workspaces.css','game-workspace.js','game-workspace-copy.js','theme-copy.js','site-theme.js','home-start-dock.js','home-start-dock.css','theme-menu.js','theme-system.css'])fs.copyFileSync(file,'dist/'+file);
 const init=fs.readFileSync('theme-init.js','utf8');const themeCss=fs.readFileSync('theme-system.css','utf8');fs.writeFileSync('dist/theme-shell.css',(themeCss.slice(0,themeCss.indexOf('html[data-design-system]'))+fs.readFileSync('theme-shell.css','utf8')).replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s*([{}:;,])\s*/g,'$1').trim());
 const ledger=[];
 for(const route of [...routes,'/keepsake/success/','/keepsake/cancel/','/404.html']){const path=route==='/404.html'?'dist/404.html':'dist'+route+'index.html';let h=fs.readFileSync(path,'utf8');const lang=h.match(/<html lang="([^"]+)"/)?.[1]||'en',c=themeCopy[lang]||themeCopy.en,base='/'+(locales[lang]?.[0]||''),home=h.includes('id="view-intro"');
 if(h.includes('id="compareRetry"')){const labels=comparisonStateCopy[lang]||comparisonStateCopy.en;h=h.replace(/(<p id="compareLoadStatus"[^>]*>)[\s\S]*?(<\/p>)/,(_,start,end)=>start+esc(labels[0])+end).replace(/(<button id="compareRetry"[^>]*>)[\s\S]*?(<\/button>)/,(_,start,end)=>start+esc(labels[2])+end);}
 const menu=`<details id="appearanceMenu" class="appearance-menu" data-initially-open="true"><summary>${icon}<span>${c[0]}</span></summary><div class="appearance-options">${themeIds.map((id,i)=>`<button type="button" data-appearance-choice="${id}" aria-pressed="${id==='night'}"><img src="/public-assets/themes/${id}-thumb.webp" alt="" width="160" height="90" loading="lazy"><span>${c[i+1]}</span></button>`).join('')}</div></details><span id="appearanceStatus" class="theme-sr" role="status"></span>`;
 h=h.replace(/(<html[^>]*)(>)/,'$1 data-design-system="1"$2').replace('<head>',`<head><script>${init};window.ThemeLabels=${JSON.stringify({copy:c,study:studyCopy[lang]})};</script>`).replace('</head>',`<link rel="stylesheet" href="/${home?'theme-system':'theme-shell'}.css"><script type="module" src="/site-theme.js"></script></head>`);
 if(['/keepsake/success/','/keepsake/cancel/'].includes(route)){const labels=Object.fromEntries(Object.entries(locales).map(([code,[prefix]])=>{const home=fs.readFileSync('dist/'+prefix+'index.html','utf8'),nav=home.match(/<nav class="site-links"[\s\S]*?<\/nav>/)?.[0]||'';return[code,[...nav.matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map(m=>m[1])];}));h=h.replace('</head>',`<script>window.ThemeNavigation=${JSON.stringify(labels)}</script></head>`);}
 h=h.replace('</head>',`<link rel="stylesheet" href="/table-system.css"${home?' media="print" onload="this.media=\'all\'"':''}></head>`);
 if(route.includes('/keepsake/'))h=h.replace('</head>','<link rel="stylesheet" href="/product-workspaces.css"></head>');
 if(!home)h=h.replace('<link rel="stylesheet" href="/launch.css">',`<link rel="stylesheet" href="/launch.css" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="/launch.css"></noscript>`);
 if(!h.includes('</header>')){const reference=fs.readFileSync('dist'+base+'index.html','utf8'),nav=(reference.match(/<nav class="site-links"[\s\S]*?<\/nav>/)?.[0]||'').replace(/ aria-current="page"/g,'').replace(/<a href="#gameTools">[\s\S]*?<\/a>/g,'')+(reference.match(/<details class="language-menu global-language"[\s\S]*?<\/details>/)?.[0]||'');h=h.replace('<body>',`<body><header class="topbar"><a class="brand" href="${base}">1in8billion.live</a>${nav}</header>`);}
 h=h.replaceAll('<summary>🌐','<summary><svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>');
 h=h.replace('</header>',menu+'</header>').replaceAll(`href="${route}"`, `href="${route}" aria-current="page"`);
 if(home){
 h=h.replace(/(<span class="footer-ver">)v[^<]*/,`$1v${release.version} · `);
 const v=conversionCopy(lang);
 const tools=toolCopy[lang]||toolCopy.en;let buttons=0;const legacy=h.match(/<nav class="topnav"[^>]*>[\s\S]*?<\/nav>/)?.[0];if(legacy){const moved=legacy.replace(/<nav[^>]*>/,`<nav id="gameTools" class="game-tools" aria-label="${esc(tools.nav[0])}">`).replace(/(<button[^>]*)(>)[\s\S]*?<\/button>/g,(_,start,end)=>start.replace(/ data-t="[^"]*"/,'')+end+esc(tools.nav[++buttons])+'</button>');h=h.replace(legacy,'').replace('<section id="view-life"',moved+'<section id="view-life"');h=h.replace(/(<nav class="site-links"[\s\S]*?)(<\/nav>)/,`$1<a href="#gameTools">${esc(tools.nav[0])}</a>$2`);}

 for(const file of ['launch.css','content.css','experience.css','experience-upgrade.css'])h=h.replace('<link rel="stylesheet" href="/'+file+'">',`<link rel="stylesheet" href="/${file}" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="/${file}"></noscript>`);
 h=h.replace(/(<button id="btnStart"[^>]*>)[^<]*(<\/button>)/,`$1${studyCopy[lang][0]}$2`).replace(/(<button id="customizeLife"[^>]*>)[^<]*(<\/button>)/,'$1$2');
 const start=/<div class="hero experience-hero">([\s\S]*?)<aside class="hero-world"[\s\S]*?<\/aside><\/div>/;
 h=h.replace(start,(_,left)=>`<div class="theme-hero"><div class="theme-scenery"><div></div><script>{const image=new Image();image.width=1536;image.height=1024;image.alt=${JSON.stringify(c[15])};image.fetchPriority="high";image.dataset.themeArt="";image.src='/public-assets/themes/'+document.documentElement.dataset.appearance+(matchMedia('(max-width:760px)').matches?'-mobile':'')+'.webp';document.currentScript.previousElementSibling.append(image);}</script><noscript><img src="/public-assets/themes/night-mobile.webp" alt="${c[15]}" width="768" height="512"></noscript><button class="art-retry" hidden>${c[16]}</button></div>${left}<div class="theme-book" aria-hidden="true"><img src="/public-assets/rebirth/thumbs/lake-home.webp" width="720" height="324" alt="" style="display:block;position:static;transform:none;width:100%;max-width:100%;height:auto;max-height:none"><img src="/public-assets/rebirth/people/mei-young.webp" width="140" height="280" alt="" style="display:block;position:absolute;transform:none;width:100px;max-width:35%;height:220px;object-fit:contain;right:8%;bottom:0"></div></div>`);
 h=h.replace('<p class="play-policy">',`<a class="keepsake-hero-link" href="${base}keepsake/">${v.preview} <span aria-hidden="true">→</span></a><p class="keepsake-hero-price">${v.once}</p><p class="play-policy">`);
 // Move the real country selector and action before scripts initialize; there is still one of each.
 h=h.replace(/<select id="countrySelect"[^>]*><\/select>/,'').replace(/<button id="btnStartSelected"[^>]*>[\s\S]*?<\/button>/,'').replace(/<h3 data-t="intro.pick">[^<]*<\/h3>/,'');
 h=h.replace('<p class="play-policy">',`<div class="theme-start"><label for="countrySelect">${c[5]}</label><div><select id="countrySelect" class="country-pick" aria-label="${c[5]}"></select><button id="btnStartSelected" type="button">${c[6]} <span aria-hidden="true">→</span></button></div></div><p class="play-policy">`);
 // Sample cards already carry their own record-derived scene artwork.

 const showcase=`<section class="theme-keepsake"><div><h2>${c[8]}</h2><p>${v.premiumDetail}</p><p>US$2.99 · ${v.once}</p><a class="primary-link" href="${base}keepsake/">${c[10]} <span aria-hidden="true">→</span></a></div><div class="theme-specimens">${['cinematic-poster','journal-scrapbook','minimal-data'].map(id=>`<img src="/public-assets/keepsake/thumbnails/${id}.png" width="270" height="480" alt="${id}" loading="lazy">`).join('')}</div></section>`;
 h=h.replace(/(<div class="theme-hero">[\s\S]*?<div class="theme-book"[\s\S]*?<\/div><\/div>)/,'$1'+showcase);
 const explore=`<section class="theme-explore"><h2>${c[5]}</h2><div>${[['JPN','blue'],['USA','night'],['IND','india'],['CHN','china'],['CAN','canada'],['FRA','editorial']].map(([id,art])=>`<a href="${base}?country=${id}"><img src="/public-assets/themes/${art}-mobile.webp" alt="${c[15]}" width="384" height="216" loading="lazy"><span>${esc(displayCountry(id,lang,id))} <span aria-hidden="true">→</span></span></a>`).join('')}</div></section>`;
 h=h.replace(showcase,showcase+explore);
 h=h.replace('</body>',`<div id="startDock" class="start-dock" hidden><a href="#view-intro">1in8billion.live</a><button type="button">${c[11]}</button></div></body>`);
 }
 if(home||route.includes('/keepsake/'))h=h.replace('</head>',`<link rel="stylesheet" href="/premium-keepsake/conversion.css"${home?' media="print" onload="this.media=\'all\'"':''}></head>`);
 fs.writeFileSync(path,h);
 const group=home?'home':route.includes('/keepsake/')?'keepsake':route.includes('/countries/')?'country':route.includes('/compare/')?'compare':route.includes('/guides/')?'guide':'reading';
 ledger.push({route,language:lang,template:group,source:home?'scripts/build-experience.mjs':group==='keepsake'?'scripts/build-keepsake-studio.mjs':'scripts/build-expansion.mjs',sharedShell:'four-theme',body:home?'home':group==='keepsake'?'product-workspace':'reading-system',browserEvidence:home?{report:'audit/theme-batch-a/browser-report.json',locale:lang,widths:[360,390,768,1440,1920],themes:themeIds,visualCapture:['en','zh-CN'].includes(lang)?'audit/theme-batch-a/'+(lang==='en'?'en':'zh')+'-{theme}-{width}-viewport.png':null}:null,visualStatus:home?(['en','zh-CN'].includes(lang)?'A/B captured':'A layout checked'):group==='keepsake'?'B workspace/export evidence':'C representative template matrix; static coverage all routes'});
 }
 migrateReadingPages(routes);
 fs.mkdirSync('audit/theme-batch-c',{recursive:true});fs.writeFileSync('audit/theme-batch-c/route-coverage.json',JSON.stringify(ledger,null,2));
 if(preview){
 fs.mkdirSync('audit/theme-batch-a',{recursive:true});fs.writeFileSync('audit/theme-batch-a/route-coverage.json',JSON.stringify({baseline:'v1.16.9',routes:ledger,dynamicViews:['birth','life','decision','ending','collection','studio','order','loading','error'].map(view=>({view,prototype:['birth','life','ending','studio'].includes(view)?'interactive-sample-study':'not in A05',productionMigration:'deferred B',source:view==='studio'||view==='order'?'premium-keepsake/':'app.js',prototypeSource:'design-preview.js',evidence:['birth','life','ending','studio'].includes(view)?'audit/theme-batch-a/preview-'+view+'-{width}.png':null}))},null,2));
 fs.writeFileSync('audit/theme-batch-a/study-coverage.json',JSON.stringify({locales:Object.keys(locales),views:['home','birth','life','ending','studio','compare'],report:'audit/theme-batch-a/study-report.json',status:'sample-driven prototype, production migrations deferred B/C'},null,2));
 fs.writeFileSync('dist/design-preview.json',JSON.stringify({batch:'A',published:false,themes:themeIds,routeCount:routes.length}));
 buildDesignGallery();
 }
}
