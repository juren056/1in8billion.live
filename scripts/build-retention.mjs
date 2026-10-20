import fs from 'node:fs';
import {copy} from './build-experience.mjs';
import {retentionCopy} from '../retention-copy.js';
export function buildRetention({write,langs}){
 const stage=1;write('data/retention-config.json',JSON.stringify({stage,version:'1.5.0',dailyRules:'v1',timeZone:'UTC'}));
 for(const [lang,l]of Object.entries(langs)){
  const s=retentionCopy[lang],path='dist/'+l.prefix+'index.html';let html=fs.readFileSync(path,'utf8');
  html=html.replace('</body>','<script src="/retention-bootstrap.js" defer></script></body>');
  const illustration=fs.existsSync('public-assets/life-preview.png')?'<img src="/public-assets/life-preview.png" alt="'+s.scene+'" width="768" height="432" loading="lazy">':'';
  html=html.replace('<section class="sample-section">',`<section class="home-life-intro"><div><h2>${s.intro}</h2><ol>${s.steps.map(text=>`<li>${text}</li>`).join('')}</ol><a href="/${l.prefix}guides/quick-play/">${copy[lang].how}</a></div><figure><div id="warmPreview"></div>${illustration}<figcaption>${s.illustration}</figcaption></figure></section><section class="sample-section">`);
  fs.writeFileSync(path,html);
 }
}
