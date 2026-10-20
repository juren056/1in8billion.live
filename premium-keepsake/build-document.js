import{copy}from'./translations.js';import{validSnapshot}from'./schema.js';import{displayCountry}from'../country-labels.js';
export function wrapWords(value,fits){const out=[];for(const paragraph of String(value).split('\n')){let line='';for(const{segment}of new Intl.Segmenter(undefined,{granularity:'word'}).segment(paragraph)){if(fits(line+segment)){line+=segment;continue;}if(line.trim()){out.push(line.trimEnd());line='';}if(fits(segment.trimStart())){line=segment.trimStart();continue;}for(const ch of segment.trimStart()){if(!fits(line+ch)&&line){out.push(line);line='';}line+=ch;}}out.push(line.trimEnd());}return out;}
export function lines(value,width=52){return wrapWords(value,line=>[...line].length<=width);}
export function buildDocument(s){if(!validSnapshot(s))throw Error('invalid_snapshot');s={...s,countryName:displayCountry(s.country,s.lang,s.countryName)};const c=copy[s.lang],pages=[],add=(title,paragraphs,kind='text')=>pages.push({title,paragraphs,lines:paragraphs.flatMap(p=>lines(p)),kind});const event=e=>`${c.age} ${e.age}  ${e.text}`;
 add(c.cover,[s.name,`${s.countryName} | ${s.birthYear} - ${s.endYear}`,`${c.age} ${s.age}`,c.demo], 'cover');
 add(c.profile,[s.name,`${c.country}: ${s.countryName}`,`${c.year}: ${s.birthYear} - ${s.endYear}`,`${c.age}: ${s.age}`,c.origin,c.model]);
 if(s.age>=18&&s.events.length>15){for(const [title,filter]of [[c.early,e=>e.age<18],[c.work,e=>e.category==='work'],[c.family,e=>e.category==='family']]){const selected=s.events.filter(filter);add(title,(selected.length?selected.slice(0,5).map(event):[c.notRecorded]));}}
 let record=[],used=0;for(const e of s.events){const paragraph=event(e),count=lines(paragraph).length;if(used+count>32&&record.length){add(c.timeline,record);record=[];used=0;}record.push(paragraph);used+=count;}if(record.length)add(c.timeline,record);
 add(c.ending,[`${c.age} ${s.age}`,s.cause||c.notRecorded,c.model]);
 add(c.method,[c.model,c.local,c.sampleNote,'https://1in8billion.live/sources/',`${s.model} / ${s.rules} / ${s.schema}`]);return {snapshot:s,copy:c,pages,posterCount:3};
}
