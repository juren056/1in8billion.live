import{exportText}from'./story.js';
export const SCHEMA='keepsake-one-life-v1';
const text=(s,max=2000)=>String(s??'').normalize('NFC').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g,'').slice(0,max);
export function snapshotLife(life,{lang='en',countryName=life?.country,localize=t=>t}={}){
 if(life?.died!==true||!Number.isFinite(life.age)||life.age<0||life.age>150||!Number.isFinite(life.year)||!Array.isArray(life.log)||!life.log.length||life.log.length>1000)throw Error('incomplete_life');
 const events=life.log.filter(e=>e&&Number.isFinite(e.age)&&e.age>=0&&e.age<=life.age).map(e=>({age:e.age,text:text(exportText(localize(e.text),lang)),kind:['milestone','decision','birth','death'].includes(e.kind)?e.kind:'event',category:({'🎒':'education','📚':'education','🎓':'education','🔨':'work','💍':'family','👶':'family','🏖️':'work'})[e.icon]||'event'}));
 if(!events.length)throw Error('insufficient_record');
 return {schema:SCHEMA,model:'inherited-v1',rules:'replay-v1',lang:['en','ja','ko','zh-TW','zh-CN','es','pt-BR','fr','de'].includes(lang)?lang:'en',country:text(life.country,3),countryName:text(countryName,100),name:text(life.name?.full||life.name?.full_en||life.name||'',180),birthYear:life.year,age:life.age,endYear:life.year+life.age,cause:text(exportText(localize(life.cause||''),lang)),completed:true,events,trajectory:(life.trajectory||[]).filter(p=>Number.isFinite(p.age)&&p.age<=life.age).map(p=>Object.fromEntries(['age','health','knowledge','relationship','income'].map(k=>[k,Number.isFinite(p[k])?p[k]:null])))};
}
export function validSnapshot(s){return s?.schema===SCHEMA&&s.completed===true&&Number.isFinite(s.age)&&s.age>=0&&s.age<=150&&Number.isFinite(s.birthYear)&&s.endYear===s.birthYear+s.age&&Array.isArray(s.events)&&s.events.length>0&&s.events.every(e=>Number.isFinite(e.age)&&e.age<=s.age&&typeof e.text==='string');}
export function canonical(value){if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';return JSON.stringify(value);}
export async function digest(value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(bytes)].map(n=>n.toString(16).padStart(2,'0')).join('');}
