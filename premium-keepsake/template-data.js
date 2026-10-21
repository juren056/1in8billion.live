import {validSnapshot} from './schema.js';
import {displayCountry} from '../country-labels.js';
import {studioCopy} from './template-copy.js';
const safe=(value,max)=>String(value??'').normalize('NFC').replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,max);
export function assembleTemplateData(snapshot,customization={}){
 if(!validSnapshot(snapshot))throw Error('invalid_snapshot');
 const lang=studioCopy[snapshot.lang]?snapshot.lang:'en',c=studioCopy[lang];
 const events=snapshot.events.map((event,index)=>({...event,sourceIndex:index}));
 const unique=events.filter((event,index)=>events.findIndex(e=>e.kind===event.kind&&e.category===event.category&&e.text===event.text)===index);
 const milestones=unique.filter(e=>e.kind==='milestone');let selected=milestones;
 if(milestones.length>5){selected=['education','work','family'].map(category=>milestones.find(e=>e.category===category)).filter(Boolean);const rest=milestones.filter(e=>!selected.includes(e)).sort((a,b)=>b.text.length-a.text.length||a.sourceIndex-b.sourceIndex);selected=[...selected,...rest.slice(0,5-selected.length)];}
 if(selected.length<3){const rest=unique.filter(e=>!selected.includes(e)).sort((a,b)=>b.text.length-a.text.length||a.sourceIndex-b.sourceIndex);selected=[...selected,...rest.slice(0,3-selected.length)];}
 const featuredMilestones=selected.sort((a,b)=>a.sourceIndex-b.sourceIndex);
 const country=typeof snapshot.country==='string'?snapshot.country:'',display=displayCountry(country,lang,typeof snapshot.countryName==='string'?snapshot.countryName:''),countryName=typeof display==='string'&&display.trim()?display:c.fallback,name=safe(snapshot.name,180)||c.fallback;
 const latest=[...(snapshot.trajectory||[])].sort((a,b)=>b.age-a.age)[0];
 const metrics=['health','knowledge','relationship'].flatMap(key=>Number.isFinite(latest?.[key])&&latest[key]>=0&&latest[key]<=100?[{key,label:c[key],value:latest[key],unit:'/100',age:latest.age}]:[]);
 const recorded=category=>{const e=[...events].reverse().find(e=>e.category===category);return e?{text:e.text,age:e.age,sourceIndex:e.sourceIndex}:null;};
 const start=snapshot.birthMonth||String(snapshot.birthYear),end=snapshot.endMonth||String(snapshot.endYear);
 return{lang,copy:c,name,country,countryName,birthMonth:snapshot.birthMonth??null,endMonth:snapshot.endMonth??null,start,end,age:snapshot.age,cause:snapshot.cause||null,education:recorded('education'),career:recorded('work'),city:null,
 headline:safe(customization.title,100)||countryName,isCustomTitle:!!safe(customization.title,100),summaryLine:`${countryName} · ${start} — ${end} · ${snapshot.age} ${c.years}`,note:safe(customization.note,200),palette:['blue','sage','amber'].includes(customization.palette)?customization.palette:'blue',featuredMilestones,metrics,events,recordCount:events.length,
 model:snapshot.model,rules:snapshot.rules,schema:snapshot.schema,completed:true};
}
export function recommendTemplate(data){
 if(data.featuredMilestones.length>=5&&data.events.filter(e=>e.kind==='milestone').length>=8)return{id:'cinematic-poster',reason:'recommendEvents'};
 if(data.metrics.length===3)return{id:'minimal-data',reason:'recommendMetrics'};
 if(data.events.filter(e=>e.category==='family').length>=2)return{id:'journal-scrapbook',reason:'recommendFamily'};
 return{id:'clean-modern',reason:'recommendDefault'};
}
