import{assembleTemplateData}from'./template-data.js';
import{copy}from'./translations.js';import{validSnapshot}from'./schema.js';
import{eventGroups,groupEntry}from'./editorial.js';
export function wrapWords(value,fits){const out=[];for(const paragraph of String(value).split('\n')){let line='';for(const{segment}of new Intl.Segmenter(undefined,{granularity:'word'}).segment(paragraph)){if(fits(line+segment)){line+=segment;continue;}if(line.trim()){out.push(line.trimEnd());line='';}if(fits(segment.trimStart())){line=segment.trimStart();continue;}for(const ch of segment.trimStart()){if(!fits(line+ch)&&line){out.push(line);line='';}line+=ch;}}out.push(line.trimEnd());}return out;}
// Full-width CJK glyphs occupy more space than Latin characters. This estimate
// deliberately reserves more room than the PDF's measured line wrapping needs.
export function lines(value,width=52){return wrapWords(value,line=>[...line].reduce((n,ch)=>n+(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\uFF01-\uFF60]/u.test(ch)?2:1),0)<=width);}
export function buildDocument(s){if(!validSnapshot(s))throw Error('invalid_snapshot');const mapped=assembleTemplateData(s);s={...s,name:mapped.name,countryName:mapped.countryName};const c=copy[mapped.lang],pages=[],add=(title,paragraphs,kind='text')=>pages.push({title,paragraphs,lines:paragraphs.flatMap(p=>lines(p)),kind});const event=e=>`${e.month?e.month+' · ':''}${c.age} ${e.age}  ${e.text}`;
 add(c.cover,[s.name,`${s.countryName} | ${s.birthMonth||s.birthYear} - ${s.endMonth||s.endYear}`,`${c.age} ${s.age}`,c.demo], 'cover');
 add(c.profile,[s.name,`${c.country}: ${s.countryName}`,`${c.year}: ${s.birthMonth||s.birthYear} - ${s.endMonth||s.endYear}`,`${c.age}: ${s.age}`,c.origin,c.model]);
 // Lead with recorded milestones; repeated templates have a separate reading
 // summary. Exact chronological rows below remain the authoritative catalog.
 const addEntries=(title,groups,kind,intro='')=>{let entries=[],used=intro?lines(intro).length*17+24:0;const flush=()=>{if(!entries.length)return;const paragraphs=[...(intro?[intro]:[]),...entries.map(e=>e.meta+'\n'+e.text)];add(title,paragraphs,kind);Object.assign(pages.at(-1),{entries,...(intro?{intro}:{})});entries=[];intro='';used=0;};for(const group of groups){const entry=groupEntry(group,c),height=lines(entry.meta).length*17+lines(entry.text).length*21+22;if(used+height>480&&entries.length)flush();entries.push(entry);used+=height;}flush();};
 const groups=eventGroups(s.events),milestones=groups.filter(g=>g.event.kind==='milestone'),repeated=groups.filter(g=>g.event.kind==='event'&&g.records.length>1);
 if(s.rules==='replay-v4'){const chapters=s.events.filter(e=>e.chapterPart==='choice').map(choice=>{const later=s.events.filter(e=>e.chapter===choice.chapter&&e.chapterPart==='follow'),summary={age:choice.contextAge??choice.age,month:choice.contextMonth||choice.month,text:[choice.context,event(choice),...later.map(event)].filter(Boolean).join('\n\n')};return{event:summary,records:[summary]};});if(chapters.length)addEntries(c.highlights,chapters,'chapter-highlights');}
 if(s.rules==='replay-v5'){const chapters=s.events.filter(e=>e.chapterPart==='choice').flatMap(choice=>{const prior=choice.context?{age:choice.contextAge,month:choice.contextMonth,text:choice.context}:null;return [prior,choice,...s.events.filter(e=>e.chapter===choice.chapter&&e.chapterPart==='follow')].filter(Boolean).map(event=>({event,records:[event]}));});if(chapters.length)addEntries(c.highlights,chapters,'chapter-highlights');}
 if(milestones.length)addEntries(c.highlights,milestones,'highlights');
 if(repeated.length)addEntries(c.recurring,repeated,'recurring',c.readingNote);
 if(s.age>=18&&s.events.length>15){for(const [title,filter]of [[c.early,e=>e.age<18],[c.work,e=>e.category==='work'],[c.family,e=>e.category==='family']]){const selected=eventGroups(s.events.filter(filter));if(selected.length)addEntries(title,selected.slice(0,5),'chapter-highlights');else add(title,[c.notRecorded]);}}
 // Include paragraph gaps in the vertical budget; 32 short rows otherwise run
 // below the footer. Reserve space for the larger first line of the warm style.
 let record=[],used=0;for(const e of s.events){const paragraph=event(e),height=lines(paragraph).length*17+5;if(used+height>520&&record.length){add(c.timeline,record);record=[];used=0;}record.push(paragraph);used+=height;}if(record.length)add(c.timeline,record);
 add(c.ending,[`${s.endMonth||s.endYear} · ${c.age} ${s.age}`,s.cause||c.notRecorded,c.model]);
 add(c.method,[c.model,c.local,c.sampleNote,'https://1in8billion.live/sources/',`${s.model} / ${s.rules} / ${s.schema}`]);return {snapshot:s,copy:c,pages,posterCount:3};
}
