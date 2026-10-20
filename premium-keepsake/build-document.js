import{copy}from'./translations.js';import{validSnapshot}from'./schema.js';import{displayCountry}from'../country-labels.js';
export function wrapWords(value,fits){const out=[];for(const paragraph of String(value).split('\n')){let line='';for(const{segment}of new Intl.Segmenter(undefined,{granularity:'word'}).segment(paragraph)){if(fits(line+segment)){line+=segment;continue;}if(line.trim()){out.push(line.trimEnd());line='';}if(fits(segment.trimStart())){line=segment.trimStart();continue;}for(const ch of segment.trimStart()){if(!fits(line+ch)&&line){out.push(line);line='';}line+=ch;}}out.push(line.trimEnd());}return out;}
// Full-width CJK glyphs occupy more space than Latin characters. This estimate
// deliberately reserves more room than the PDF's measured line wrapping needs.
export function lines(value,width=52){return wrapWords(value,line=>[...line].reduce((n,ch)=>n+(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\uFF01-\uFF60]/u.test(ch)?2:1),0)<=width);}
export function buildDocument(s){if(!validSnapshot(s))throw Error('invalid_snapshot');s={...s,countryName:displayCountry(s.country,s.lang,s.countryName)};const c=copy[s.lang],pages=[],add=(title,paragraphs,kind='text')=>pages.push({title,paragraphs,lines:paragraphs.flatMap(p=>lines(p)),kind});const event=e=>`${e.month?e.month+' · ':''}${c.age} ${e.age}  ${e.text}`;
 add(c.cover,[s.name,`${s.countryName} | ${s.birthMonth||s.birthYear} - ${s.endMonth||s.endYear}`,`${c.age} ${s.age}`,c.demo], 'cover');
 add(c.profile,[s.name,`${c.country}: ${s.countryName}`,`${c.year}: ${s.birthMonth||s.birthYear} - ${s.endMonth||s.endYear}`,`${c.age}: ${s.age}`,c.origin,c.model]);
 if(s.age>=18&&s.events.length>15){for(const [title,filter]of [[c.early,e=>e.age<18],[c.work,e=>e.category==='work'],[c.family,e=>e.category==='family']]){const selected=s.events.filter(filter);add(title,(selected.length?selected.slice(0,5).map(event):[c.notRecorded]));}}
 // Include paragraph gaps in the vertical budget; 32 short rows otherwise run
 // below the footer. Reserve space for the larger first line of the warm style.
 let record=[],used=0;for(const e of s.events){const paragraph=event(e),height=lines(paragraph).length*17+5;if(used+height>520&&record.length){add(c.timeline,record);record=[];used=0;}record.push(paragraph);used+=height;}if(record.length)add(c.timeline,record);
 add(c.ending,[`${s.endMonth||s.endYear} · ${c.age} ${s.age}`,s.cause||c.notRecorded,c.model]);
 add(c.method,[c.model,c.local,c.sampleNote,'https://1in8billion.live/sources/',`${s.model} / ${s.rules} / ${s.schema}`]);return {snapshot:s,copy:c,pages,posterCount:3};
}
