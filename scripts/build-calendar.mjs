import fs from 'node:fs';
import '../calendar-core.js';
import '../calendar-copy.js';
import {release} from '../release-info.mjs';
import {seoLocales} from '../content/seo-pages.mjs';
export function buildCalendar(routes){
 const samples=JSON.parse(fs.readFileSync('content/life-samples.json','utf8'));
 for(const route of routes){const file='dist'+route+'index.html';let html=fs.readFileSync(file,'utf8');const lang=html.match(/<html lang="([^"]+)"/)?.[1]||'en',c=CalendarCopy[lang]||CalendarCopy.en;
  // Existing sample outcomes keep their recorded month, never today's date.
  html=html.replace(/#run=v1\.([a-z0-9]+)\.([A-Z]{3})\.now\.(en|ja|ko|zh-Hant)\.0/g,(token,seed,country,internal)=>{const s=samples.find(s=>s.seed===seed&&s.country===country&&s.lang===(internal==='zh-Hant'?'zh-TW':internal));return s?.calendarMonth?`#run=v${s.rulesVersion===3?3:2}.${seed}.${country}.now.${internal}.0.${s.calendarMonth.replace('-','')}`:token;});
  const editorial=seoLocales[lang],helpPath='/'+editorial.prefix+'how-it-works/';
  const detailed=route===helpPath||route==='/'+editorial.prefix+'guides/quick-play/';
  const section='<span id="birth-calendar" hidden></span>';
  if(html.includes('id="view-intro"'))html=html.replace('<section class="home-life-intro">',section+'<section class="home-life-intro">');
  else html=html.replace('</main>',section+'</main>');
  html=html.replace(/<button([^>]*data-era="now"[^>]*)>[^<]*<\/button>/g,(_,attrs)=>'<button'+attrs.replace(/ data-t="[^"]*"/,'')+'>'+c.now+'</button>');
  html=html.replaceAll('Replay v1','Replay v1 / v2').replaceAll('replay v1 links','replay v1 / v2 links');
  html=html.replaceAll('seed, country, era, language and education setting','seed, country, era, language, education setting and recorded birth month (v2)');
  if(['zh-CN','es','pt-BR','fr','de'].includes(lang))html=html.replaceAll('/premium/book-en.webp',`/premium/book-${lang}.webp`).replaceAll('/premium/poster-en-',`/premium/poster-${lang}-`);
  fs.writeFileSync(file,html);
 }
 for(const name of ['model-metadata','provenance','retention-config']){const path=`dist/data/${name}.json`;const data=JSON.parse(fs.readFileSync(path,'utf8'));data.calendar={mode:'real-time-month',reviewed:release.calendarReviewed,release:release.version,basis:'device-local month frozen at birth; daily links use UTC',legacy:'v1 and existing saves retain their original year; missing months are not inferred',end:'birth month plus actual simulated lifespan in whole years',statisticalObservationYears:'unchanged'};if(name==='retention-config')data.dailyRules='v2';fs.writeFileSync(path,JSON.stringify(data));}
}
