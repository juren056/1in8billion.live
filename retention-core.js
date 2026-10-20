import './replay-core.js';
export const escapeText=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function lifeMemories(life){
 const first={key:'birth',age:0,text:'',index:-1},choices=new Map();
 for(const [index,e]of (life.log||[]).entries()){if(e.kind!=='milestone')continue;const key=({'🎒':'school','📚':'school','🎓':'school','🔨':'work','💍':'partner','👶':'child','🏖️':'retire'})[e.icon];if(key&&!choices.has(key))choices.set(key,{key,age:e.age,text:e.text,index});}
 const events=[...choices.values()].sort((a,b)=>a.age-b.age);return [first,...events.slice(-2)];
}
export function sampledTrajectory(life){return (life.trajectory||[]).filter(p=>Number.isFinite(p.age)).map(p=>({age:p.age,health:finite(p.health),knowledge:finite(p.knowledge),relationship:finite(p.relationship),income:finite(p.income)}));}
const finite=v=>Number.isFinite(v)?Math.max(0,Math.min(100,v)):null;
export function dailyLife(data,date=new Date()){
 const day=date.toISOString().slice(0,10),seed='daily'+day.replaceAll('-','');let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;
 const total=data.reduce((n,c)=>n+c.births,0);if(!(total>0))throw Error('Invalid daily draw data');let cursor=(h/4294967296)*total;let chosen=data.at(-1);for(const c of data){cursor-=c.births;if(cursor<0){chosen=c;break;}}
 return {day,seed,country:chosen.id,rules:'v2',calendarMonth:day.slice(0,7)};
}
export function replayUrl(run,origin='https://1in8billion.live',source='player'){
 const lang=run.lang==='zh-Hant'?'zh-TW':run.lang,prefix=({en:'/',ja:'/ja/',ko:'/ko/','zh-TW':'/zh-tw/'})[lang];if(!prefix||!/^\w{1,40}$/.test(run.seed)||!(/^[A-Z]{3}$/).test(run.country))throw Error('Invalid replay');
 const url=new URL(prefix,origin);url.searchParams.set('utm_source',source);url.searchParams.set('utm_medium','share');url.searchParams.set('utm_campaign',source==='daily'?'daily_life':'replay');url.hash=ReplayCore.encode({...run,era:run.era||'now'});return url.href;
}
