import{characterProfiles,visualCandidates}from'./character-library.js';
// Stable presentation choices, independent from engine seeds and random calls.
export const environments=['urban','oldtown','rural','coast','mountain','lake','tropical','northern'];
export const chapters=['home','school','work','outside','quiet','memory'];
const legacyIdentities=['aria','lina','sora','noah','mateo','amir'];
export const identities=characterProfiles.map(p=>p.id);
export const ages=['baby','young','adult','elder'];
export const artHash=value=>[...String(value)].reduce((h,c)=>(Math.imul(h,31)+c.charCodeAt(0))>>>0,7);
const nameOf=life=>typeof life.name==='object'?(life.name.full||life.name.full_en||''):life.name||'';
export function environmentFor(life={}){if(environments.includes(life.visual?.environment))return life.visual.environment;const id=typeof life.country==='string'?life.country:life.country?.id||'';let pool=['urban','oldtown','lake','rural'];
 if(['CAN','NOR','SWE','FIN','ISL','RUS','EST','LVA','LTU'].includes(id))pool=['northern','lake','urban','oldtown'];
 else if(['BRA','IDN','IND','THA','MYS','PHL','NGA','KEN','COD','GHA','VNM','LKA','BGD','COL'].includes(id))pool=['tropical','rural','urban','oldtown'];
 else if(['NPL','BTN','CHE','AUT','ETH','PER','BOL','GEO'].includes(id))pool=['mountain','rural','oldtown','urban'];
 else if(['JPN','KOR','USA','GBR','FRA','ESP','PRT','ITA','AUS','NZL','CHL','TWN','GRC','TUR'].includes(id))pool=['coast','urban','oldtown','lake'];
 return pool[artHash(id+nameOf(life))%pool.length];
}
export function personFor(life={}){if(identities.includes(life.visual?.person))return life.visual.person;if(life.visual?.version===2)return newVisualIdentity(life).person;const pool=life.sex==='F'?legacyIdentities.slice(0,3):legacyIdentities.slice(3);return pool[artHash(nameOf(life)+String(life.country))%pool.length];}
export const visualAge=age=>age<2?'baby':age<18?'young':age<60?'adult':'elder';
export const sceneAsset=(life,kind='home')=>'/public-assets/rebirth/scenes/'+environmentFor(life)+'-'+(chapters.includes(kind)?kind:'home')+'.webp';
export const sceneThumb=(life,kind='home')=>sceneAsset(life,kind).replace('/scenes/','/thumbs/');
export const personAsset=life=>'/public-assets/rebirth/people/'+personFor(life)+'-'+(([3,4,5,6].includes(life.rulesVersion)||life.visual?.agePolicy===3)?visualAge((life.age||0)<4?0:(life.age||0)>=13&&life.age<18?18:life.age||0):visualAge(life.age||0))+'.webp';
export function recordedScenes(life={}){const max=Number(life.age)||0,events=life.log||life.events||[],out=[{age:0,kind:'home'}];const school=events.find(e=>/school|学校|學校|上学|上學|école|escuela|escola|Schule|学校|학교/i.test(e.text||''));if(school&&school.age>0&&school.age<=max)out.push({age:school.age,kind:'school'});const work=events.find(e=>/first job|started.*work|开始工作|開始工作|第一份工作|primer trabajo|premier emploi|erste.*Arbeit|primeiro emprego|첫.*직장/i.test(e.text||''));if(work&&work.age<=max)out.push({age:work.age,kind:'work'});else if(max>=18)out.push({age:18,kind:'outside'});if(max>=60)out.push({age:60,kind:'quiet'});return out;}

export const visualIdentity=(life={})=>({...([3,4,5,6].includes(life.rulesVersion)||life.visual?.agePolicy===3?{agePolicy:3}:{}),...(life.visual?.version===2?{version:2}:{}),environment:environmentFor(life),...(identities.includes(life.visual?.person)||['M','F'].includes(life.sex)?{person:personFor(life)}:{})});

export function newVisualIdentity(life={}){if(identities.includes(life.visual?.person))return visualIdentity(life);const country=typeof life.country==='string'?life.country:life.country?.id||'',pool=visualCandidates(country,life.sex);return{version:2,...([3,4,5,6].includes(life.rulesVersion)?{agePolicy:3}:{}),environment:environmentFor(life),person:pool[artHash(nameOf(life)+country+':appearance-v2')%pool.length]};}
