import test from 'node:test';import assert from 'node:assert/strict';
import {lifeMemories,sampledTrajectory,dailyLife,replayUrl} from '../retention-core.js';
import {ageStage,sceneKind} from '../life-scene.js';
import {retentionCopy} from '../retention-copy.js';
test('presentation stages and memories never invent unrecorded life milestones',()=>{
 assert.deepEqual([0,5,12,18,60].map(ageStage),[0,1,2,3,4]);assert.equal(sceneKind({age:6,stats:{}}),'school');assert.equal(sceneKind({age:26,stats:{employment:'employed'}}),'work');assert.equal(sceneKind({age:2,died:true}),'memory');
 const life={age:2,log:[{kind:'birth',icon:'👶',age:0}]};const copy=JSON.stringify(life);assert.deepEqual(lifeMemories(life).map(x=>x.key),['birth']);assert.equal(JSON.stringify(life),copy);
 const adult={log:[{age:6,kind:'milestone',icon:'🎒',text:'School'},{age:18,kind:'milestone',icon:'🔨',text:'Work'},{age:25,kind:'milestone',icon:'💍',text:'Married'}]};assert.deepEqual(lifeMemories(adult).map(x=>x.key),['birth','work','partner']);assert(lifeMemories(adult).every(x=>x.index<0||adult.log[x.index].text===x.text));
});
test('trajectory preserves recorded asset index once, with no synthetic yearly or happiness samples',()=>{
 const life={trajectory:[{age:5,health:75,income:60},{age:10,health:70,income:80}]};assert.deepEqual(sampledTrajectory(life).map(x=>[x.age,x.income]),[[5,60],[10,80]]);assert.equal(sampledTrajectory(life)[0].knowledge,null);assert.deepEqual(sampledTrajectory({}),[]);
});
test('daily invitations use a fixed UTC cohort without personal data or engine RNG',()=>{
 const data=[{id:'JPN',births:25},{id:'USA',births:75}],a=dailyLife(data,new Date('2026-10-20T23:59:00Z')),b=dailyLife(data,new Date('2026-10-21T07:59:00+08:00'));assert.deepEqual(a,b);assert.equal(a.day,'2026-10-20');assert.notEqual(a.seed,dailyLife(data,new Date('2026-10-21T00:01Z')).seed);
 const url=new URL(replayUrl({...a,lang:'ja'},'https://1in8billion.live','daily'));assert.equal(url.pathname,'/ja/');assert.equal(url.searchParams.get('utm_source'),'daily');assert(url.hash.includes(a.seed));assert(!url.search.includes(a.seed));
});
test('retention controls have matching four-language coverage',()=>{for(const s of Object.values(retentionCopy)){assert.deepEqual(Object.keys(s).sort(),Object.keys(retentionCopy.en).sort());assert.equal(s.steps.length,3);assert.equal(s.stages.length,5);}});
