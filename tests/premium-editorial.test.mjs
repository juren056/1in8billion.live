import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildDocument} from '../premium-keepsake/build-document.js';
import {eventGroups,distinctMilestones,groupEntry} from '../premium-keepsake/editorial.js';
import {copy} from '../premium-keepsake/translations.js';

const sample=JSON.parse(fs.readFileSync('content/premium-samples.json')).find(s=>s.lang==='en'&&s.country==='JPN');
test('keepsake overview distinguishes repeated templates while retaining every original dated event',()=>{
 const before=JSON.stringify(sample),doc=buildDocument(sample);
 const groups=eventGroups(sample.events),repeated=groups.filter(g=>g.event.kind==='event'&&g.records.length>1);
 const pages=doc.pages.filter(p=>p.kind==='recurring');
 assert.equal(pages.flatMap(p=>p.entries).length,repeated.length);
 assert.equal(pages[0].intro,doc.copy.readingNote);
 const father=pages.flatMap(p=>p.entries).find(e=>e.text==='Your father is conscripted. Months of silence.');
 assert(father.meta.includes('11'));
 assert(father.meta.includes('2036-10 · Age 10'));
 assert(father.meta.includes('2106-10 · Age 80'));
 assert.deepEqual(doc.pages.filter(p=>p.title===doc.copy.timeline).flatMap(p=>p.paragraphs),sample.events.map(e=>`${e.month} · ${doc.copy.age} ${e.age}  ${e.text}`));
 const highlights=doc.pages.filter(p=>p.kind==='highlights').flatMap(p=>p.entries);
 assert.equal(highlights.filter(e=>e.text==='Affected by local unrest').length,1);
 assert(highlights.find(e=>e.text==='Got married').meta.includes('3'));
 assert.equal(JSON.stringify(sample),before);
});

test('editorial grouping never merges different wording, categories or event kinds and orders true endpoints',()=>{
 const event={age:2,text:'Recorded event.',kind:'event',category:'event'};
 const records=[{...event,age:8,month:'2034-10'},{...event,month:'2028-10'},{...event,text:'Recorded event!'}, {...event,category:'family'}, {...event,kind:'milestone'}];
 const before=JSON.stringify(records),groups=eventGroups(records);
 assert.equal(groups.length,4);
 assert.equal(groups.reduce((count,g)=>count+g.records.length,0),records.length);
 const repeated=groupEntry(groups.find(g=>g.records.length===2),copy.en);
 assert(repeated.meta.includes('2028-10 · Age 2 — 2034-10 · Age 8'));
 assert.equal(JSON.stringify(records),before);
 assert.equal(distinctMilestones(records).length,1);
});

test('all nine keepsake languages label grouped records without inventing missing milestones or months',()=>{
 for(const lang of Object.keys(copy)){
  const s={...sample,lang,events:[{age:1,text:'Actual recorded line',kind:'event',category:'event'},{age:3,text:'Actual recorded line',kind:'event',category:'event'}]};delete s.birthMonth;delete s.endMonth;const doc=buildDocument(s);
  for(const key of ['highlights','recurring','readingNote','repeatCount','recordedSpan'])assert(copy[lang][key],`${lang}:${key}`);
  assert(!doc.pages.some(p=>p.kind==='highlights'));
  const summary=doc.pages.find(p=>p.kind==='recurring');
  assert.equal(summary.entries[0].text,'Actual recorded line');
  assert(!summary.entries[0].meta.includes('2026-10'));
  assert(summary.entries[0].meta.includes(copy[lang].repeatCount));
  assert(summary.entries[0].meta.includes(copy[lang].recordedSpan));
 }
});

test('poster milestone selection retains one actual earliest entry per exact template',()=>{
 const events=sample.events,selected=distinctMilestones(events);
 assert.equal(new Set(selected.map(e=>JSON.stringify([e.kind,e.category,e.text]))).size,selected.length);
 for(const selectedEvent of selected){assert(events.includes(selectedEvent));assert.equal(selectedEvent.age,Math.min(...events.filter(e=>e.kind===selectedEvent.kind&&e.category===selectedEvent.category&&e.text===selectedEvent.text).map(e=>e.age)));}
});
