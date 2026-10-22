import fs from 'node:fs';
import {growthCopy} from '../growth-copy.js';
export function buildGrowthExperience(routes){
 for(const file of ['growth-copy.js','growth-experience.js','sample-reader.js','country-directory.js'])fs.writeFileSync('dist/'+file,fs.readFileSync(file,'utf8').replace(/^\s*\/\/[^\r\n]*$/gm,'').replace(/^[ \t]+/gm,''));
 for(const route of routes){const path='dist'+route+'index.html';let h=fs.readFileSync(path,'utf8');const lang=h.match(/<html lang="([^"]+)"/)[1],c=growthCopy[lang]||growthCopy.en,base='/'+(route.match(/^\/(ja|ko|zh-tw|zh-cn|es|pt-br|fr|de)\//)?.[1]||'');const home=base==='/'?'/':base+'/';
  if(h.includes('id="oddsSearch"'))h=h.replace('<p id="oddsEmpty" hidden>',`<p class="search-help">${c.searchHelp}</p><button type="button" id="oddsClear" hidden>${c.reset}</button><p id="oddsEmpty" role="status" hidden>`).replace(/(<p id="oddsEmpty"[^>]*>)[\s\S]*?<\/p>/,`$1${c.searchEmpty}</p>`);
  if(h.includes('id="countrySearch"'))h=h.replace('<p id="searchEmpty" hidden>—</p>',`<p id="searchEmpty" role="status" hidden>${c.searchEmpty}</p><button type="button" id="countryClear" hidden>${c.reset}</button>`).replace('<script src="/odds.js" defer></script>','<script type="module" src="/country-directory.js"></script>');
  if(h.includes('id="view-intro"')){
   h=h.replace('<section class="sample-section">','<section class="sample-section" id="completeExamples">');
   h=h.replace('<p class="play-policy">',`<p class="sample-shortcut"><a href="#completeExamples">${c.readSample}</a></p><p class="play-policy">`);
   h=h.replace(/(<a href="[^"]*#run=[^"]*" class="text-link sample-action">)[\s\S]*?<\/a>/g,(_,start)=>start+c.replaySample+'</a>');
   h=h.replace(/(<a href="[^"#]*#run=[^".]+\.[^.]+\.([A-Z]{3})[^\"]*" class="text-link sample-action">)/g,`<button type="button" class="text-button sample-read" data-sample-country="$2">${c.readSample}</button> $1`);
   h=h.replace('</head>','<script type="module" src="/sample-reader.js"></script></head>');
  }
  if(route===home+'how-it-works/'||route===home+'guides/quick-play/'||h.includes('id="view-intro"'))h=h.replace('</main>',`<p class="education-entry"><a href="${home}?edu=1">${c.education}</a></p></main>`);
  fs.writeFileSync(path,h);
 }
}
