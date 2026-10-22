import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const app=fs.readFileSync('app.js','utf8'),p1=fs.readFileSync('p1-game.js','utf8');
test('new-rule yearly stories never interpret wh as a conflict probability',()=>{
 const code=app.slice(app.indexOf('function generateYearlyEvent('),app.indexOf('function logLife('));
 for(const lang of ['en','zh-Hant'])for(const age of [4,8,15,22,40,60,80])for(let draw=0;draw<100;draw++){
  const ctx={window:{},LANG:lang,simRandom:()=>draw/100};vm.createContext(ctx);vm.runInContext(code,ctx);
  const event=ctx.generateYearlyEvent({rulesVersion:3,age,countryData:{wh:9,war:0},stats:{}});assert.notEqual(event.icon,'⚔️');
 }
});
test('old-rule yearly unrest remains reproducible for existing playback',()=>{
 const code=app.slice(app.indexOf('function generateYearlyEvent('),app.indexOf('function logLife('));const ctx={LANG:'en',simRandom:()=>.8};vm.createContext(ctx);vm.runInContext(code,ctx);
 assert.equal(ctx.generateYearlyEvent({age:8,countryData:{wh:9},stats:{}}).en,'Affected by local unrest');
});
test('only fresh births receive new rules; explicit old seeds retain legacy rules',()=>{
 const wrapper=p1.slice(p1.indexOf('newLife=function(country)'),p1.indexOf('const p1OriginalTick'));
 for(const incoming of [null,'oldseed']){const ctx={window:{},p1PendingSeed:incoming,p1Incoming:null,p1PendingCalendar:undefined,CalendarCore:{},p1Scope:(_,fn)=>fn(),p1OriginalNewLife:()=>({calendarMonth:'2026-10'}),STATE:{era:'now',eduMode:false},LANG:'en',crypto:{getRandomValues:xs=>{xs[0]=123;return xs;}}};vm.createContext(ctx);vm.runInContext(wrapper,ctx);assert.equal(ctx.newLife('CHN').rulesVersion,incoming?2:3);}
});
test('birth confirmation starts the clock rather than imposing another reading pause',()=>{
 const handler=app.slice(app.indexOf('const birthCertConfirm ='),app.indexOf('const birthCertCancel ='));assert(!handler.includes('STATE.paused=true'));assert(!handler.includes('stopTicker()'));
 assert(p1.includes('rulesVersion:3'),'new replays carry explicit rule version');
});

import '../replay-core.js';
test('v3 replays carry new rules while legacy links retain their original shape',()=>{for(const era of ['now','past','future']){const run={rulesVersion:3,seed:'newseed',country:'CHN',era,lang:'en',edu:false,...(era==='now'?{calendarMonth:'2026-10'}:{})};assert.deepEqual(ReplayCore.parse(ReplayCore.encode(run)),run);}assert.equal(ReplayCore.parse('#run=v2.old.CHN.now.en.0.202610').rulesVersion,undefined);});
