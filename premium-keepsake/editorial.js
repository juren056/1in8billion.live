// Exact grouping preserves differences in wording, event kind and category.
// References are read only: the signed/stored snapshot and its order stay intact.
export function eventGroups(events){const groups=new Map();for(const event of events){const key=JSON.stringify([event.kind,event.category,event.text]);let group=groups.get(key);if(!group){group={event,records:[]};groups.set(key,group);}group.records.push(event);if(event.age<group.event.age)group.event=event;}return [...groups.values()].sort((a,b)=>a.event.age-b.event.age);}
export function distinctMilestones(events){return eventGroups(events.filter(e=>e.kind==='milestone')).map(group=>group.event);}
export function eventPosition(event,c){return `${event.month?event.month+' · ':''}${c.age} ${event.age}`;}
export function groupEntry(group,c){const first=group.event,last=group.records.reduce((latest,event)=>event.age>latest.age?event:latest,first),repeated=group.records.length>1;return {text:group.event.text,meta:repeated?`${c.repeatCount}: ${group.records.length} · ${c.recordedSpan}: ${eventPosition(first,c)} — ${eventPosition(last,c)}`:eventPosition(first,c)};}
