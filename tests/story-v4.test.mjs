import test from 'node:test';import assert from 'node:assert/strict';
import {createStoryEngine,storyHash,livingPeople} from '../story-engine.js';
import {createNarrativeEngine,versionedEngine} from '../story-v4-engine.js';
import {catalog} from '../content/story-v4/catalog-source.mjs';
import {chains} from '../content/story-v4/chains-source.mjs';
import {narrativeCopy} from '../content/story-v4/copy-source.mjs';
const dictionary=narrativeCopy(),base=createStoryEngine({catalog:[],decisions:[],dictionary,supportsRulesVersion:4});
const engine=createNarrativeEngine({base,catalog,chains,dictionary,canonical:dictionary,hash:storyHash,livingPeople,nameFactory:()=>({name:{full:'Local school contact'},sex:'F'})});
const make=seed=>({rulesVersion:4,year:2026,age:0,country:'JPN',name:{full:'Test'},replayV1:{seed:String(seed),eligible:true},stats:{health:100,happiness:70,knowledge:50,social:50,netAssets:0,employment:'none',education:0},log:[],family:{parents:[{id:'p',name:'Parent',birth:{year:1990},death:{year:2110}}]}});
function advance(life,age){const old=life.age;life.age=age;if(age===18)life.log.push({age,eventId:'core.event.work.start',text:'Started work'});if(age===60)life.stats.employment='retired';engine.afterYear(life,old,base.values(life.stats));}
test('v4 catalog supplies 160 distinct situations and 12 complete three-branch chapters',()=>{
 assert.equal(catalog.length,160);assert.equal(new Set(catalog.map(e=>e.id)).size,160);assert.equal(chains.length,12);
 for(const d of chains){assert(d.max>d.min);assert(d.artCell>=0&&d.artCell<16);assert.equal(d.options.length,3);assert.equal(new Set(d.options.map(o=>o.resultEn)).size,3);assert.equal(new Set(d.options.map(o=>o.followEn)).size,3);for(const o of d.options){assert(o.action);assert(dictionary[d.id+'.'+o.id+'.result']);assert(dictionary[d.id+'.'+o.id+'.follow']);}}
});
test('full lives are deterministic, cooldown bounded, age guarded and contain no unresolved placeholders',()=>{
 const seen=new Set(),choices=new Set();for(let n=0;n<350;n++){
  const a=make(n),b=make(n);for(let age=1;age<=105;age++)for(const life of[a,b]){
   advance(life,age);const row=engine.year(life);if(row){seen.add(row.eventId);const spec=catalog.find(e=>e.id===row.eventId);assert(age>=spec.min&&age<=spec.max);assert(!/[{}]/.test(row.text));const history=life.storyHistory.filter(e=>e.id===row.eventId);if(history.length>1)assert(age-history.at(-2).age>=spec.cooldown);assert.deepEqual(row,engine.year(life));row.starred=age%13===0;life.log.push(row);}
   const d=engine.pending(life);if(d){choices.add(d.id);const setup=life.log.find(e=>e.eventId===d.id+'.setup');assert(setup.age<age);assert(![18,25,35,50].includes(age));const c=engine.resolve(life,n%3,{automatic:true});assert(c);assert.equal(engine.resolve(life,0),false);assert.equal(life.replayV1.eligible,true);}
  }assert.deepEqual(a,b);
 }assert.equal(seen.size,160);assert(choices.has('s4.return-interest'));assert(choices.has('s4.old-friend'));assert(choices.has('s4.family-time'));
});
test('three prototype chains require actual prior facts and retain branch-specific results and later outcomes',()=>{
 for(const id of['s4.return-interest','s4.old-friend','s4.family-time'])for(let option=0;option<3;option++){
  let found=false;for(let seed=0;seed<100&&!found;seed++){const life=make(seed);for(let age=1;age<=60;age++){
   advance(life,age);const d=engine.pending(life);if(d){const selected=d.id===id?option:1,c=engine.resolve(life,selected,{automatic:true});if(d.id===id){const setup=life.log.find(e=>e.eventId===id+'.setup');assert(setup);if(id==='s4.return-interest')assert(life.narrative.interest.pausedAge<age);if(id==='s4.old-friend')assert(life.log.some(e=>e.eventId==='s4.friend.met'&&e.actorId===c.actorId));if(id==='s4.family-time')assert.equal(c.actorId,'p');const result=life.log.find(e=>e.eventId===id);assert.equal(result.textKey,id+'.'+['a','b','c'][option]+'.result');advance(life,age+1);assert(!life.log.some(e=>e.eventId===id+'.follow'));advance(life,age+2);const follow=life.log.find(e=>e.eventId===id+'.follow');assert(follow);assert.equal(follow.linkedEventId,id);assert.equal(follow.outcome,['a','b','c'][option]);found=true;break;}}
  }}assert(found,id+':'+option);
 }
});
test('death, refresh and repeated callbacks never invent or double-settle a later meeting',()=>{
 const life=make(9);for(let age=1;age<50&&!life.storyPending;age++)advance(life,age);const ready=engine.pending(life);assert(ready);
 const restored=JSON.parse(JSON.stringify(life));assert.deepEqual(engine.pending(restored),ready);assert.deepEqual(engine.resolve(life,0),engine.resolve(restored,0));assert.equal(life.replayV1.eligible,false);
 const resultCount=life.log.length;engine.afterYear(life,life.age-1,{});assert.equal(life.log.length,resultCount);
 life.died=true;const before=JSON.stringify(life);life.age++;const atDeath=JSON.stringify(life);engine.afterYear(life,life.age-1,{});assert.equal(JSON.stringify(life),atDeath);assert.equal(engine.resolve(life,0),false);assert(before);
});
test('version router preserves legacy engine and does not silently upgrade saved lives',()=>{
 const legacy=createStoryEngine({catalog:[],decisions:[],dictionary:{'ui.story':'Legacy'}}),r=versionedEngine(legacy,engine,()=>null,{newRules:4});assert.equal(r.forLife({rulesVersion:3}),legacy);assert.equal(r.forLife({rulesVersion:2}),legacy);assert.equal(r.forLife({}),legacy);assert.equal(r.forLife({rulesVersion:4}),engine);assert.equal(r.forLife(),engine);
});
test('all 36 branches retain an actual prelude, unique settlement and traceable later outcome',()=>{
 const covered=new Set();for(let seed=0;seed<120;seed++)for(let option=0;option<3;option++){
  const life=make(seed);for(let age=1;age<=108;age++){
   if(age===30){life.family.partner={id:'partner',name:'Recorded partner',birth:{year:2024}};life.log.push({age,eventId:'core.event.marriage',actorId:'partner',kind:'milestone',text:'Married'});}
   advance(life,age);const d=engine.pending(life);if(d){assert(d.min<=age&&age<=d.max);const row=life.log.find(e=>e.eventId===d.id+'.setup');assert(row&&row.age<age);const selected=d.condition==='reconnect'&&option===2&&seed%2?1:option;engine.resolve(life,selected,{automatic:true});covered.add(d.id+'.'+['a','b','c'][selected]);}
  }
  for(const c of life.storyChoices){assert.equal(life.log.filter(e=>e.eventId===c.id).length,1);const follow=life.log.find(e=>e.eventId===c.id+'.follow');assert(follow);assert.equal(follow.linkedEventId,c.id);assert(follow.age>=c.age+2);}
 }assert.equal(covered.size,36);
});
test('an actor who has died cannot participate in a later visit; the earlier choice is retained',()=>{
 const life=make(9);for(let age=1;age<6&&!life.storyPending;age++)advance(life,age);assert.equal(engine.pending(life).id,'s4.small-courage');const chosen=engine.resolve(life,1);life.family.parents[0].death.year=life.year+life.age+2;advance(life,life.age+1);advance(life,life.age+1);const follow=life.log.find(e=>e.eventId===chosen.id+'.follow');assert.equal(follow.outcome,'interrupted');assert.equal(follow.textKey,'ui.interrupted');assert(life.log.some(e=>e.eventId===chosen.id));
});
test('v4 paid snapshot, six-template data and book chapters use the same actual choice and followup',async()=>{
 const{snapshotLife}=await import('../premium-keepsake/schema.js'),{assembleTemplateData}=await import('../premium-keepsake/template-data.js'),{buildDocument}=await import('../premium-keepsake/build-document.js');
 const life=make(9);for(let age=1;age<=12;age++){advance(life,age);if(engine.pending(life))engine.resolve(life,1,{automatic:true});}life.died=true;
 const snapshot=snapshotLife(life,{localize:(text,e)=>e?engine.render(e,life):text}),before=JSON.stringify(snapshot),data=assembleTemplateData(snapshot),doc=buildDocument(snapshot);
 const chosen=snapshot.events.find(e=>e.chapterPart==='choice'),follow=snapshot.events.find(e=>e.chapter===chosen.chapter&&e.chapterPart==='follow');assert(chosen.context);assert(follow);assert(data.featuredMilestones.some(e=>e.text===chosen.text));assert(data.featuredMilestones.some(e=>e.text===follow.text));assert(doc.pages.some(p=>p.entries?.some(e=>e.text.includes(chosen.context)&&e.text.includes(chosen.text)&&e.text.includes(follow.text))));assert.equal(JSON.stringify(snapshot),before);
 const noLater={...life,age:chosen.age,log:life.log.filter(e=>e.age<=chosen.age)};const shorter=snapshotLife(noLater,{localize:(text,e)=>e?engine.render(e,noLater):text});assert(!shorter.events.some(e=>e.chapterPart==='follow'));
});
