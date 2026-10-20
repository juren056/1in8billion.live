import{copy}from'./translations.js';import{validSnapshot}from'./schema.js';
export function lines(value,width=52){const out=[];for(const paragraph of String(value).split('\n')){let line='';for(const ch of paragraph){if([...line].length===width){out.push(line);line='';}line+=ch;}out.push(line);}return out;}
export function buildDocument(s){if(!validSnapshot(s))throw Error('invalid_snapshot');const c=copy[s.lang],pages=[],add=(title,paragraphs,kind='text')=>pages.push({title,lines:paragraphs.flatMap(p=>lines(p)),kind});const event=e=>`${c.age} ${e.age}  ${e.text}`;
 add(c.cover,[s.name,`${s.countryName} | ${s.birthYear} - ${s.endYear}`,`${c.age} ${s.age}`,c.demo], 'cover');
 add(c.profile,[s.name,`${c.country}: ${s.countryName}`,`${c.year}: ${s.birthYear} - ${s.endYear}`,`${c.age}: ${s.age}`,c.origin,c.model]);
 if(s.age>=18&&s.events.length>15){for(const [title,filter]of [[c.early,e=>e.age<18],[c.work,e=>e.category==='work'],[c.family,e=>e.category==='family']]){const selected=s.events.filter(filter);add(title,(selected.length?selected.slice(0,5).map(event):[c.notRecorded]));}}
 let record=[];for(const e of s.events){const ls=lines(event(e));for(const line of ls){if(record.length===32){pages.push({title:c.timeline,lines:record});record=[];}record.push(line);}}if(record.length)pages.push({title:c.timeline,lines:record});
 add(c.ending,[`${c.age} ${s.age}`,s.cause||c.notRecorded,c.model]);
 add(c.method,[c.model,c.local,c.sampleNote,'https://1in8billion.live/sources/',`${s.model} / ${s.rules} / ${s.schema}`]);return {snapshot:s,copy:c,pages,posterCount:3};
}
