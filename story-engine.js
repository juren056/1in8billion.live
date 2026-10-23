// New fictional narrative rules. The legacy engine never calls this catalog.
export const storyHash=value=>[...String(value)].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261);
export function livingPeople(life,age=life.age){const year=Number(life.year)+Number(age||0);return[...(life.family?.parents||[]),...(life.family?.siblings||[]),...(life.family?.grandparents||[]),...(life.family?.partner?[life.family.partner]:[]),...(life.family?.kids||[])].filter(p=>p.birth?.year<=year&&(!p.death?.year||p.death.year>year));}
export function createStoryEngine({catalog,decisions,dictionary,supportsRulesVersion=3}){
 const text=key=>dictionary[key]||key,values=s=>Object.fromEntries(['health','happiness','knowledge','social','netAssets'].map(k=>[k,Number(s?.[k])||0]));
 const event=(row,age)=>({eventId:row.id,age,category:row.category,scene:row.scene,interaction:row.interaction||'moment',kind:'story',icon:'',en:text(row.id),zh:text(row.id),text:text(row.id),effects:{},effectsRecorded:true});
 function year(life,age=life.age){const previous=life.storyHistory?.find(e=>e.age===age);if(previous){const row=catalog.find(e=>e.id===previous.id);return row?{...event(row,age),...(previous.actorId?{actorId:previous.actorId}:{})}:null;}const people=livingPeople(life,age),history=life.storyHistory||[],eligible=catalog.filter(e=>age>=e.min&&age<=e.max&&(e.category!=='work'||life.stats?.employment==='employed')&&(e.category!=='family'||people.length)&&!history.some(h=>h.id===e.id&&age-h.age<e.cooldown));if(!eligible.length)return null;const unseen=eligible.filter(e=>!history.some(h=>h.id===e.id));const pool=unseen.length?unseen:eligible;const row=pool[storyHash((life.replayV1?.seed||life.name?.full||'life')+':narrative:'+age)%pool.length];const out=event(row,age);if(row.category==='family')out.actorId=people[storyHash(row.id+age)%people.length].id;(life.storyHistory||=[]).push({age,id:row.id,...(out.actorId?{actorId:out.actorId}:{})});return out;}
 function pending(life){return life.storyPending?decisions.find(d=>d.id===life.storyPending.id):null;}
 function resolve(life,index,{automatic=false}={}){const d=pending(life);if(!d||life.died||life.storyChoices?.some(e=>e.id===d.id))return false;const option=d.options[index];if(!option)return false;const before=values(life.stats);for(const[k,v]of Object.entries(option.effects))life.stats[k]=Math.max(0,Math.min(100,(Number(life.stats[k])||0)+v));const after=values(life.stats),effects=Object.fromEntries(Object.keys(before).map(k=>[k,+(after[k]-before[k]).toFixed(4)]).filter(([,v])=>v));const choice={id:d.id,optionId:option.id,age:life.age,automatic,effects};(life.storyChoices||=[]).push(choice);life.storyPending=null;(life.log||=[]).push({eventId:d.id,age:life.age,category:d.category,scene:d.scene,kind:'choice',icon:'',text:text(d.id)+': '+text(d.id+'.'+option.id),choiceId:option.id,effects,effectsRecorded:true,automatic});if(!automatic&&life.replayV1)life.replayV1.eligible=false;return choice;}
 function afterYear(life,previousAge,before){if(life.rulesVersion!==supportsRulesVersion||life.age===previousAge)return;const after=values(life.stats);(life.storyYearChanges||={})[life.age]=Object.fromEntries(Object.keys(after).map(k=>[k,+(after[k]-(Number(before?.[k])||0)).toFixed(4)]).filter(([,v])=>v));
  // Only record a death when its scheduled year has actually arrived.
  // Synchronize actual recorded milestones, without changing mortality or adding income assumptions.
  const recorded=id=>life.log.some(e=>e.age===life.age&&e.eventId===id),work=()=>{life.stats.employment='employed';life.plannedStudy=false;if(!recorded('core.event.work.start'))life.log.push({eventId:'core.event.work.start',age:life.age,kind:'milestone',icon:'🔨',category:'work',scene:'work',interaction:'explore',text:typeof window!=='undefined'&&window.t?window.t('event.work.start'):'Started working',effectsRecorded:false});};
  if(life.age===6){life.stats.education=1;life.stats.employment='student';}if(life.age===12)life.stats.education=2;if(life.age===15&&life.stats.education>=2)life.stats.education=3;
  if(life.age===18){if(recorded('core.event.school.graduate'))life.plannedStudy=true;else if(recorded('core.event.work.start'))work();}
  if(life.age===22&&life.plannedStudy){if(!recorded('core.event.education.university'))work();else life.plannedStudy=false;}if(life.age===26&&life.stats.employment==='university')work();
  for(const e of life.log.filter(e=>e.age===life.age)){if(e.eventId==='core.event.marriage')e.actorId=life.family?.partner?.id;if(e.eventId==='core.event.baby')e.actorId=life.family?.kids?.at(-1)?.id;}
  const year=Number(life.year)+Number(life.age);for(const p of [...(life.family?.parents||[]),...(life.family?.siblings||[]),...(life.family?.grandparents||[]),...(life.family?.kids||[]),...(life.family?.partner?[life.family.partner]:[])])if(p.death?.year===year&&!(life.storyDeaths||[]).includes(p.id)){(life.storyDeaths||=[]).push(p.id);const infant=life.family?.kids?.includes(p)&&p.birth?.year===year?life.log.find(e=>e.age===life.age&&e.kind==='heavy'&&e.icon==='🕯️'):null;if(infant){Object.assign(infant,{eventId:'family.death.'+p.id,actorId:p.id,category:'family',scene:'memory',effectsRecorded:false});continue;}life.log.push({eventId:'family.death.'+p.id,age:life.age,kind:'family',category:'family',scene:'memory',actorId:p.id,text:(typeof p.name==='string'?p.name:p.name?.full||'')+' · '+text('ui.death'),effectsRecorded:false});}
  for(const c of life.storyChoices||[]){const d=decisions.find(d=>d.id===c.id);if(!d)continue;if(life.age>=d.followAge&&!life.log.some(e=>e.eventId===c.id+'.follow'))life.log.push({eventId:c.id+'.follow',linkedEventId:c.id,age:life.age,category:d.category,scene:d.scene,kind:'story',text:text('ui.follow')+' '+text(c.id+'.'+c.optionId),effects:{},effectsRecorded:true});}
  if(!life.died&&!life.storyPending){const d=decisions.find(d=>d.age===life.age&&!life.storyChoices?.some(c=>c.id===d.id));if(d)life.storyPending={id:d.id,age:life.age};}
 }
 return{catalog,decisions,dictionary,text,year,pending,resolve,afterYear,values,japaneseName(sex,pick){const last=pick(['佐藤','鈴木','高橋','田中','伊藤','渡辺']),first=pick(sex==='F'?['結衣','葵','美咲','陽菜','凛','七海']:['蓮','悠人','大輝','直人','海斗','陽太']);return{last,first,full:last+' '+first,full_en:last+' '+first};}};
}
// Required simulation hooks install with the catalog, independently of optional UI modules.
export function installStoryRuntime(engine){
 if(window.storyRulesReady)return;window.storyRulesReady=true;let context=null;
 const die=window.dieNow;window.dieNow=function(...args){const life=STATE.life;if(life?.rulesVersion===3&&context){life.died=true;engine.afterYear(life,context.age,context.before);life.died=false;}return die(...args);};
 const tick=window.tick;window.tick=function(...args){const life=STATE.life;if(!life||![3,4,5,6].includes(life.rulesVersion))return tick(...args);if(life.storyPending)return;const age=life.age,before=engine.values(life.stats);context={age,before};let out;try{out=tick(...args);}finally{context=null;}if(life!==STATE.life||life.age===age||life.died)return out;engine.afterYear(life,age,before);if(life.storyPending){if(STATE.autoDecide)engine.resolve(life,engine.pending(life).defaultIndex,{automatic:true});else{STATE.paused=true;window.stopTicker?.();}}window.renderLife?.();window.saveCurrentLife?.();if(life.storyPending&&!window.storyPresentationReady){let note=document.getElementById('storyRuntimeFallback');if(!note){note=document.createElement('section');note.id='storyRuntimeFallback';const label=document.createElement('p'),retry=document.createElement('button');label.textContent=engine.text('ui.pending');retry.textContent=window.SurfaceCopy?.reload||'Reload';retry.onclick=()=>location.reload();note.append(label,retry);document.querySelector('#view-life')?.prepend(note);}}return out;};
}
export async function prepareStoryEngine(lang){
 const{catalog,decisions}=await import('./story-data.js');
 lang=['en','zh-CN','zh-TW','ja','ko','es','pt-BR','fr','de'].includes(lang)?lang:'en';
 const[r,c]=await Promise.all([fetch('/story-locales/'+lang+'.json'),fetch('/story-config.json')]);
 if(!r.ok||!c.ok)throw Error('story_copy_unavailable');const config=await c.json();
 if(![2,3,4,5,6].includes(config.newRules)||typeof config.workspace!=='boolean')throw Error('story_config_invalid');
 const dictionary=await r.json(),legacy=createStoryEngine({catalog,decisions,dictionary});
 let engine=legacy;
 // Load the new rules as a separate pack; never mutate legacy copy or seeds.
 {
  const[m,data,response]=await Promise.all([import('./story-v4-engine.js'),import('./story-v4-data.js'),fetch('/story-v4-locales/'+lang+'.json')]);
  if(!response.ok)throw Error('story_v4_copy_unavailable');
  const modern=m.createNarrativeEngine({base:createStoryEngine({catalog,decisions:[],dictionary:data.canonical,supportsRulesVersion:4}),catalog:data.catalog,chains:data.chains,dictionary:await response.json(),canonical:data.canonical,hash:storyHash,livingPeople,nameFactory:(life,role)=>p1Scope((life.replayV1?.seed||life.regNumber)+':narrative-person:'+role,()=>{const sex=storyHash((life.replayV1?.seed||life.regNumber)+role)%2?'F':'M';return{name:randomName(life.countryData,sex),sex};})});
  engine=m.versionedEngine(legacy,modern,()=>typeof STATE!=='undefined'?STATE.life:null,config);
 }
 {
  const[m,data,response]=await Promise.all([import('./story-v5-engine.js'),import('./story-v5-data.js'),fetch('/story-v5-locales/'+lang+'.json')]);
  if(!response.ok)throw Error('story_v5_copy_unavailable');
  const modern=m.createNarrativeEngine({base:createStoryEngine({catalog,decisions:[],dictionary:data.canonical,supportsRulesVersion:5}),catalog:data.catalog,chains:data.chains,dictionary:await response.json(),canonical:data.canonical,hash:storyHash,livingPeople,nameFactory:(life,role)=>p1Scope((life.replayV1?.seed||life.regNumber)+':narrative-person:'+role,()=>{const sex=storyHash((life.replayV1?.seed||life.regNumber)+role)%2?'F':'M';return{name:randomName(life.countryData,sex),sex};})});
  engine=m.versionedEngine(engine,modern,()=>typeof STATE!=='undefined'?STATE.life:null,config);
 }
 {
  const[m,data,response]=await Promise.all([import('./story-v6-engine.js'),import('./story-v6-data.js'),fetch('/story-v6-locales/'+lang+'.json')]);
  if(!response.ok)throw Error('story_v6_copy_unavailable');
  const modern=m.createNarrativeEngine({base:createStoryEngine({catalog,decisions:[],dictionary:data.canonical,supportsRulesVersion:6}),catalog:data.catalog,chains:data.chains,dictionary:await response.json(),canonical:data.canonical,hash:storyHash,livingPeople,nameFactory:(life,role)=>p1Scope((life.replayV1?.seed||life.regNumber)+':narrative-person:'+role,()=>{const sex=storyHash((life.replayV1?.seed||life.regNumber)+role)%2?'F':'M';return{name:randomName(life.countryData,sex),sex};})});
  engine=m.versionedEngine(engine,modern,()=>typeof STATE!=='undefined'?STATE.life:null,config);
 }
 engine.config=config;window.StoryEngine=engine;installStoryRuntime(engine);return engine;
}
