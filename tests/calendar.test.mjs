import test from 'node:test';import assert from 'node:assert/strict';
import '../calendar-core.js';import '../replay-core.js';
import {snapshotLife,validSnapshot} from '../premium-keepsake/schema.js';
import fs from 'node:fs';
import {release} from '../release-info.mjs';
const C=CalendarCore;
test('real-time births freeze the local month; endings use actual age including age zero',()=>{
 assert.equal(C.currentMonth(new Date(2026,11,31,23,59)),'2026-12');assert.equal(C.currentMonth(new Date(2027,0,1)),'2027-01');
 const life={year:2026,calendarMonth:'2026-12',age:68,deathAge:68};assert.equal(C.range(life),'2026-12–2094-12');assert.equal(C.at(life,0),'2026-12');assert.equal(C.range({...life,deathAge:0}),'2026-12–2026-12');assert.deepEqual(C.date(life,68),{year:2094,month:12});
 C.pending='2026-10';assert.deepEqual(C.birthSpec('now'),{year:2026,calendarMonth:'2026-10'});C.pending=null;assert.deepEqual(C.birthSpec('now'),{year:2024});C.pending=undefined;assert.deepEqual(C.birthSpec('past'),{year:1990});assert.deepEqual(C.birthSpec('future'),{year:2080});
});
test('all public descriptions document calendar semantics and all nine demos contain explicit monthly dates',()=>{
 for(const route of JSON.parse(fs.readFileSync('dist/routes.json'))){const html=fs.readFileSync('dist'+route+'index.html','utf8');assert(html.includes('id="birth-calendar"'),route);assert(!/#run=v1\.sample(?:jp|us|in)\./.test(html),route+' uses monthly examples');}
 for(const s of JSON.parse(fs.readFileSync('dist/data/premium-samples.json'))){assert(validSnapshot(s));assert.match(s.birthMonth,/^\d{4}-\d{2}$/);assert.equal(s.endMonth,CalendarCore.addYears(s.birthMonth,s.age));}
 for(const [lang,prefix]of [['zh-CN','zh-cn'],['es','es'],['pt-BR','pt-br'],['fr','fr'],['de','de']]){assert(fs.existsSync(`dist/public-assets/premium/book-${lang}.webp`));assert(fs.readFileSync(`dist/${prefix}/keepsake/index.html`,'utf8').includes('/keepsake/thumbnails/cinematic-poster.png'));}
});
test('v2 replay records a fixed month and v1 shape and legacy date remain supported',()=>{
 const run={seed:'sampleus',country:'USA',era:'now',lang:'en',edu:false,calendarMonth:'2026-12'};assert.deepEqual(ReplayCore.parse(ReplayCore.encode(run)),run);
 for(const m of ['2026-00','2026-13','26-01','202610','2026-1'])assert.throws(()=>ReplayCore.encode({...run,calendarMonth:m}));
 assert.equal(ReplayCore.parse('#run=v2.sampleus.USA.past.en.0.202610'),null);assert.equal(ReplayCore.parse('#run=v1.sampleus.USA.now.en.0.202610'),null);
 assert.deepEqual(ReplayCore.parse('#run=v1.sampleus.USA.now.en.0'),{seed:'sampleus',country:'USA',era:'now',lang:'en',edu:false});
});
test('PDF and poster snapshots validate all monthly dates and still accept legacy year-only snapshots',()=>{
 const life={year:2026,calendarMonth:'2026-10',age:68,died:true,log:[{age:0,text:'Born',kind:'birth'},{age:68,text:'End',kind:'death'}]};const s=snapshotLife(life);assert(validSnapshot(s));assert.equal(s.birthMonth,'2026-10');assert.equal(s.endMonth,'2094-10');assert.equal(s.events[1].month,'2094-10');assert(!validSnapshot({...s,endMonth:'2094-11'}));assert(!validSnapshot({...s,events:[{...s.events[0],month:'2024-10'}]}));assert(validSnapshot(snapshotLife({...life,calendarMonth:undefined,year:2024})));assert.equal(validSnapshot({...s,birthYear:9999,birthMonth:'9999-10',endYear:10067,endMonth:'9999-10'}),false);assert.equal(validSnapshot({...s,events:null}),false);
});

test('replay invitations show their actual era without treating historical and future runs as now',()=>{
 for(const [era,date]of [['past','1990'],['now','2024'],['future','2080']])assert.equal(C.replayDate({era}),date);
 assert.equal(C.replayDate({era:'now',calendarMonth:'2027-01'}),'2027-01');
});
test('calendar material dates distinguish real documentation checks from unverified observation years',()=>{
 for(const route of JSON.parse(fs.readFileSync('dist/routes.json'))){const html=fs.readFileSync('dist'+route+'index.html','utf8');assert(!html.includes('class="calendar-dates"'),route);assert(!html.includes('UI · v1.11.1'),route);}
 for(const name of ['model-metadata','provenance','retention-config']){const data=JSON.parse(fs.readFileSync(`dist/data/${name}.json`));assert.equal(data.calendar.reviewed,release.calendarReviewed);assert.equal(data.calendar.release,release.version);assert.equal(data.calendar.statisticalObservationYears,'unchanged');if(data.records)assert(data.records.every(r=>Object.values(r.observationYears).every(y=>y===null)));}
 assert.equal(JSON.parse(fs.readFileSync('dist/release.json')).version,release.version);assert(fs.readFileSync('app.js','utf8').includes(`APP_VERSION = '${release.version}'`));
});
