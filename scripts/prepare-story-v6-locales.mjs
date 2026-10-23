// Public author-written fiction only. No player records are sent to this authoring service.
import fs from 'node:fs';
import {narrativeCopy} from '../content/story-v6/copy-source.mjs';
import {narrativeCopy as priorCopy} from '../content/story-v5/copy-source.mjs';
const en=narrativeCopy(),zh=narrativeCopy('zh-CN');
fs.mkdirSync('content/story-v6/locales',{recursive:true});
for(const[lang,d]of Object.entries({en,'zh-CN':zh}))fs.writeFileSync('content/story-v6/locales/'+lang+'.json',JSON.stringify(d,null,2)+'\n');
async function translate(source,lang){const url=new URL('https://translate.googleapis.com/translate_a/single');for(const[k,v]of Object.entries({client:'gtx',sl:lang==='zh-TW'?'zh-CN':'en',tl:lang==='pt-BR'?'pt':lang,dt:'t',q:source}))url.searchParams.set(k,v);for(let n=0;n<4;n++){try{const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('http_'+r.status);return(await r.json())[0].map(x=>x[0]).join('');}catch(e){if(n===3)throw e;await new Promise(r=>setTimeout(r,1000*(n+1)));}}}
for(const lang of(process.env.STORY_LANGS||'zh-TW,ja,ko,es,pt-BR,fr,de').split(',')){
 const path='content/story-v6/locales/'+lang+'.json',source=lang==='zh-TW'?zh:en,previous=priorCopy(lang==='zh-TW'?'zh-CN':'en'),old=JSON.parse(fs.readFileSync('content/story-v5/locales/'+lang+'.json')),cache=new Map(Object.entries(previous).map(([k,s])=>[s,old[k]])),dict=fs.existsSync(path)?JSON.parse(fs.readFileSync(path)):{};
 for(const[k,s]of Object.entries(source))if(!dict[k]&&cache.has(s))dict[k]=cache.get(s);
 const unique=[...new Set(Object.entries(source).filter(([k])=>!dict[k]).map(([,s])=>s))];
 for(let i=0;i<unique.length;i+=10){const part=unique.slice(i,i+10),query=part.map((s,n)=>'[[['+n+']]] '+s).join('\n'),answer=await translate(query,lang),matches=[...answer.matchAll(/\[\[\[\s*(\d+)\s*\]\]\]\s*([\s\S]*?)(?=\[\[\[|$)/g)];
  for(let j=0;j<part.length;j++){let value=matches.length===part.length?matches.find(m=>+m[1]===j)?.[2]?.trim():await translate(part[j],lang);if(!value)throw Error('missing_translation');const tokens=part[j].match(/\{[A-Za-z]+\}/g)||[],found=value.match(/\{[^}]*\}/g)||[];if(tokens.length!==found.length)throw Error('placeholder_'+lang);let n=0;value=value.replace(/\{[^}]*\}/g,()=>tokens[n++]);cache.set(part[j],value);}
  for(const[k,s]of Object.entries(source))if(!dict[k]&&cache.has(s))dict[k]=cache.get(s);fs.writeFileSync(path,JSON.stringify(dict,null,2)+'\n');if(i%50===0)console.log(lang,i+part.length,'/',unique.length);
 }console.log('READY',lang,Object.keys(dict).length);
}

const{editorialFrench}=await import('../content/story-v6/editorial-fr-source.mjs');const frPath='content/story-v6/locales/fr.json';const fr=JSON.parse(fs.readFileSync(frPath));Object.assign(fr,editorialFrench());fs.writeFileSync(frPath,JSON.stringify(fr,null,2)+'\n');
