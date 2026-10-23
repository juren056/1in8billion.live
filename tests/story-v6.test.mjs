import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {createStoryEngine,storyHash,livingPeople} from '../story-engine.js';
import {createNarrativeEngine,versionedEngine} from '../story-v6-engine.js';
import {catalog} from '../content/story-v6/catalog-source.mjs';
import {allChains as chains} from '../content/story-v6/chains-source.mjs';
import {narrativeCopy} from '../content/story-v6/copy-source.mjs';
const dictionary=narrativeCopy(),base=createStoryEngine({catalog:[],decisions:[],dictionary,supportsRulesVersion:6});
const engine=createNarrativeEngine({base,catalog,chains,dictionary,canonical:dictionary,hash:storyHash,livingPeople,nameFactory:()=>({name:{full:'Recorded school contact'},sex:'F'})});
const countries=['CHN','JPN','IND','USA','BRA','NGA','FRA','TWN','HKG','SGP'];
const make=(country='JPN',seed='1')=>({rulesVersion:6,year:2026,calendarMonth:'2026-10',age:0,country,name:{full:'Synthetic'},replayV1:{seed:String(seed),eligible:true},stats:{health:100,happiness:70,knowledge:50,social:50,netAssets:0,employment:'none',education:0,incomeQuartile:2,birthPlaceType:'rural'},log:[],family:{parents:[{id:'parent',name:'Recorded parent',birth:{year:1990},death:{year:2150}}]}});
function advance(life,age){const old=life.age;life.age=age;if(age===18)life.log.push({age,eventId:'core.event.work.start',text:'Started work'});if(age===30){life.family.partner={id:'partner',name:'Recorded partner',birth:{year:2024}};life.log.push({age,eventId:'core.event.marriage',actorId:'partner',text:'Married'});}if(age===60)life.stats.employment='retired';engine.afterYear(life,old,base.values(life.stats));}
test('v6 has ten distinct ten-scene packs, 30 local adaptations, and complete two-echo prototypes',()=>{
 assert.equal(catalog.length,260);assert.equal(chains.length,42);assert.equal(new Set(catalog.map(e=>e.en)).size,260);
 for(const country of countries){assert.equal(catalog.filter(e=>e.country===country).length,10);assert.equal(chains.filter(d=>d.country===country).length,3);}
 for(const d of chains){assert.equal(d.options.length,3);for(const o of d.options){assert(dictionary[d.id+'.'+o.id+'.result']);assert(dictionary[d.id+'.'+o.id+'.follow']);if(d.laterYears)assert(dictionary[d.id+'.'+o.id+'.later']);}if(d.laterYears){assert.equal(d.laterYears,5);assert.equal(new Set(d.options.map(o=>o.laterEn)).size,3);}}
 for(const lang of ['en','zh-CN','zh-TW','ja','ko','es','pt-BR','fr','de']){const copy=JSON.parse(fs.readFileSync('content/story-v6/locales/'+lang+'.json'));assert.equal(Object.keys(copy).length,992);for(const[k,s]of Object.entries(dictionary))assert.deepEqual((copy[k].match(/\{[A-Za-z]+\}/g)||[]).sort(),(s.match(/\{[A-Za-z]+\}/g)||[]).sort(),lang+':'+k);}
});
test('country matching is exclusive, real history is required, other countries retain the shared fallback',()=>{
 for(const country of [...countries,'ETH']){const life=make(country);life.age=35;engine.year(life);life.narrative.interest={kind:'drawing',pausedAge:18};life.stats.employment='employed';for(const d of chains.filter(d=>d.condition==='return'))assert.equal(engine.eligible(life,d),d.country?d.country===country:!countries.includes(country));
 life.narrative.interest=null;for(const d of chains.filter(d=>d.condition==='return'))assert.equal(engine.eligible(life,d),false);}
});
test('ten countries and shared fallback remain deterministic, guarded, and cover every local scene and branch',()=>{
 const seen=new Set(),branches=new Set();for(const country of [...countries,'ETH'])for(let seed=0;seed<80;seed++){
  const a=make(country,seed),b=make(country,seed);for(let age=1;age<=108;age++)for(const life of [a,b]){
   advance(life,age);const row=engine.year(life);if(row){const spec=catalog.find(e=>e.id===row.eventId);assert(!spec.country||spec.country===country);assert(!/[{}]/.test(row.text));const h=life.storyHistory.filter(e=>e.id===row.eventId);if(h.length>1)assert(age-h.at(-2).age>=spec.cooldown);assert.deepEqual(row,engine.year(life));seen.add(row.eventId);life.log.push(row);}
   const d=engine.pending(life);if(d){assert(d.min<=age&&age<=d.max);assert(![18,25,35,50].includes(age));assert(life.log.some(e=>e.eventId===d.id+'.setup'&&e.age<age));const option=d.condition==='reconnect'&&seed%3===2&&seed%2?1:seed%3;engine.resolve(life,option,{automatic:true});branches.add(d.id+'.'+d.options[option].id);}
  }
  assert.deepEqual(a,b);for(const c of a.storyChoices||[]){const d=chains.find(d=>d.id===c.id);assert.equal(a.log.filter(e=>e.eventId===c.id).length,1);assert(a.log.some(e=>e.eventId===c.id+'.follow'&&e.age===c.age+2));if(d.laterYears)assert(a.log.some(e=>e.eventId===c.id+'.later'&&e.age===c.age+5&&e.sourceChoice===c.id));}
 }
 for(const e of catalog.filter(e=>e.country))assert(seen.has(e.id),e.id);for(const d of chains)for(const o of d.options)assert(branches.has(d.id+'.'+o.id),d.id+'.'+o.id);
});
test('refresh, duplicate callbacks, deceased actors and the end of life cannot invent or double-settle later contact',()=>{
 const life=make('JPN');for(let age=1;age<=28;age++){advance(life,age);if(engine.pending(life))engine.resolve(life,0,{automatic:true});}
 const d=chains.find(d=>d.id==='s6.JPN.reconnect');life.age=31;life.narrative.chapters[d.id]={status:'ready',setupAge:30,actorId:life.narrative.people[0].id,lastContactAge:11};life.storyPending={id:d.id,age:31};life.storyChoices=life.storyChoices.filter(c=>c.id!==d.id);life.log=life.log.filter(e=>!e.eventId?.startsWith(d.id));life.log.push({eventId:d.id+'.setup',age:30,text:'Recorded prelude'});
 const restored=structuredClone(life);assert.deepEqual(engine.resolve(life,0),engine.resolve(restored,0));assert.equal(engine.resolve(life,1),false);life.narrative.people[0].death={year:life.year+32};for(let age=32;age<=36;age++)advance(life,age);for(const suffix of ['follow','later']){const row=life.log.find(e=>e.eventId===d.id+'.'+suffix);assert.equal(row.outcome,'interrupted');assert.equal(row.textKey,'ui.interrupted');}
 const before=JSON.stringify(life);engine.afterYear(life,35,{});assert.equal(JSON.stringify(life),before);life.died=true;life.age++;const ended=JSON.stringify(life);engine.afterYear(life,36,{});assert.equal(JSON.stringify(life),ended);
});
test('v6 snapshots and books retain both actual echoes; old snapshots remain unchanged',async()=>{
 const{snapshotLife}=await import('../premium-keepsake/schema.js'),{buildDocument}=await import('../premium-keepsake/build-document.js'),{assembleTemplateData}=await import('../premium-keepsake/template-data.js');const life=make('BRA');for(let age=1;age<=80;age++){advance(life,age);if(engine.pending(life))engine.resolve(life,1,{automatic:true});}life.died=true;
 const snapshot=snapshotLife(life,{localize:(text,e)=>e?engine.render(e,life):text}),frozen=JSON.stringify(snapshot),doc=buildDocument(snapshot);assert.equal(snapshot.rules,'replay-v6');const d=chains.find(d=>d.id==='s6.BRA.return'),choice=snapshot.events.find(e=>e.chapter===d.id&&e.chapterPart==='choice'),follows=snapshot.events.filter(e=>e.chapter===d.id&&e.chapterPart==='follow');assert(choice.context);assert.equal(follows.length,2);for(const e of follows)assert(doc.pages.some(p=>p.entries?.some(row=>row.text.includes(e.text))));assert.equal(JSON.stringify(snapshot),frozen);
 const featured=assembleTemplateData(snapshot).featuredMilestones;assert.equal(featured[0].chapter,d.id);assert.equal(featured[0].chapterPart,'choice');assert(featured.slice(0,3).every(e=>e.chapter===d.id));assert.equal(featured.filter(e=>e.chapter===d.id&&e.chapterPart==='follow').length,2);
 const{tools}=await import('../premium-keepsake/templates/drawing.js');const shown=tools({},1080,1920,assembleTemplateData(snapshot),{}).picks;assert.equal(shown.length,3);assert.deepEqual(shown.map(e=>e.age),[choice.age,choice.age+2,choice.age+5]);assert(shown.every(e=>e.chapter===d.id));
 const legacy={values:()=>{},japaneseName:()=>{}},router=versionedEngine(legacy,engine,()=>null,{newRules:6});for(const version of [1,2,3,4,5])assert.equal(router.forLife({rulesVersion:version}),legacy);assert.equal(router.forLife({rulesVersion:6}),engine);
});
