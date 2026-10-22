import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const app=fs.readFileSync('app.js','utf8'),p1=fs.readFileSync('p1-game.js','utf8');
test('new-rule yearly stories never interpret wh as a conflict probability',()=>{
 const code=app.slice(app.indexOf('function generateYearlyEvent('),app.indexOf('function applyEventEffects('));
 for(const lang of ['en','zh-Hant'])for(const age of [4,8,15,22,40,60,80])for(let draw=0;draw<100;draw++){
  const ctx={LANG:lang,simRandom:()=>draw/100};vm.createContext(ctx);vm.runInContext(code,ctx);
  const event=ctx.generateYearlyEvent({rulesVersion:3,age,countryData:{wh:9,war:0},stats:{}});assert.notEqual(event.icon,'⚔️');
 }
});
test('old-rule yearly unrest remains reproducible for existing playback',()=>{
 const code=app.slice(app.indexOf('function generateYearlyEvent('),app.indexOf('function applyEventEffects('));const ctx={LANG:'en',simRandom:()=>.8};vm.createContext(ctx);vm.runInContext(code,ctx);
 assert.equal(ctx.generateYearlyEvent({age:8,countryData:{wh:9},stats:{}}).en,'Affected by local unrest');
});
test('only fresh births receive new rules; explicit old seeds retain legacy rules',()=>{
 const wrapper=p1.slice(p1.indexOf('newLife=function(country)'),p1.indexOf('const p1OriginalTick'));
 for(const incoming of [null,'oldseed']){const ctx={p1PendingSeed:incoming,p1PendingCalendar:undefined,CalendarCore:{},p1Scope:(_,fn)=>fn(),p1OriginalNewLife:()=>({calendarMonth:'2026-10'}),STATE:{era:'now',eduMode:false},LANG:'en',crypto:{getRandomValues:xs=>{xs[0]=123;return xs;}}};vm.createContext(ctx);vm.runInContext(wrapper,ctx);assert.equal(ctx.newLife('CHN').rulesVersion,incoming?2:3);}
});
test('birth confirmation starts the clock rather than imposing another reading pause',()=>{
 const handler=app.slice(app.indexOf('const birthCertConfirm ='),app.indexOf('const birthCertCancel ='));assert(!handler.includes('STATE.paused=true'));assert(!handler.includes('stopTicker()'));
 assert(p1.includes("eligible=STATE.life.rulesVersion!==3&&"),'new rules cannot be shared under an old replay URL');
});
