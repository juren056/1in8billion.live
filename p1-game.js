/* Existing engine, isolated simulation random streams; replay v1 supports Auto choices. */
let p1RandomContext=null;
function simRandom(){return p1RandomContext?p1RandomContext():Math.random();}
function p1Scope(seed,fn){const previous=p1RandomContext;p1RandomContext=seed?ReplayCore.random(seed):null;try{return fn();}finally{p1RandomContext=previous;}}
let p1Incoming=ReplayCore.parse(location.hash);
const p1SeenInvitations=new Set();
let p1PendingSeed=null,p1PendingCalendar=undefined;
const p1Labels=Object.fromEntries(['en','ja','ko','zh-Hant'].map(lang=>[lang,[SurfaceCopy.replayCopy,SurfaceCopy.replayStart,SurfaceCopy.replayInfo,SurfaceCopy.ineligible]]));
const p1OriginalNewLife=newLife;
newLife=function(country){const legacy=!!p1PendingSeed&&!usesStoryRules(p1Incoming),rules=legacy?2:p1PendingSeed&&usesStoryRules(p1Incoming)?p1Incoming.rulesVersion:window.StoryEngine?.config?.newRules||3,seed=p1PendingSeed||crypto.getRandomValues(new Uint32Array(1))[0].toString(36);p1PendingSeed=null;CalendarCore.pending=p1PendingCalendar;p1PendingCalendar=undefined;let life;const previousBirthRules=window.newBirthRulesVersion;window.newBirthRulesVersion=rules;try{life=p1Scope(seed+':birth',()=>p1OriginalNewLife(country));}finally{CalendarCore.pending=undefined;window.newBirthRulesVersion=previousBirthRules;}if(life)life.rulesVersion=rules;if(life)life.replayV1={...(usesStoryRules(life)?{rulesVersion:life.rulesVersion}:{}),...(life.calendarMonth?{calendarMonth:life.calendarMonth}:{}),seed,country,era:['past','future'].includes(STATE.era)?STATE.era:'now',lang:LANG,edu:STATE.eduMode,eligible:false};return life;};
const p1OriginalTick=tick;
tick=function(){const run=STATE.life?.replayV1;return p1Scope(run?run.seed+':year:'+STATE.life.age:null,()=>p1OriginalTick());};
// Rendering and cosmetic randomness must never consume a simulation stream.
for(const key of ['renderLife','renderAll','renderIntro','renderEnd']){const original=window[key];window[key]=function(...args){return p1Scope(null,()=>original.apply(this,args));};}
const p1OriginalStart=startLife;
startLife=function(...args){STATE.pendingDecision=null;STATE.fastForward=false;STATE.autoDecide=!!STATE.eduMode;const result=p1OriginalStart(...args);if(STATE.life?.replayV1){STATE.life.replayV1.eligible=document.querySelector('#lifeDuration').value==='quick'&&['en','ja','ko','zh-Hant'].includes(LANG);if(STATE.life.replayV1.eligible){STATE.autoDecide=true;STATE.thoughtsEnabled=false;}}return result;};
async function p1CopyReplay(){const run=STATE.life?.replayV1,l=p1Labels[LANG]||p1Labels.en;if(!run?.eligible){toast(l[3],5000);return;}const displayPrefix=({'zh-CN':'/zh-cn/',es:'/es/','pt-BR':'/pt-br/',fr:'/fr/',de:'/de/'})[document.documentElement.dataset.siteLocale];const url=new URL(displayPrefix||{en:'/',ja:'/ja/',ko:'/ko/','zh-Hant':'/zh-tw/'}[run.lang],location.origin);url.searchParams.set('utm_source','player');url.searchParams.set('utm_medium','share');url.searchParams.set('utm_campaign','replay');url.hash=ReplayCore.encode(run);try{await navigator.clipboard.writeText(url.href);toast(SurfaceCopy.replayCopied);launchEvent('share_replay');}catch{window.prompt(SurfaceCopy.replayCopy,url.href);}}
const p1OriginalSetup=setupLaunch;
setupLaunch=function(){p1OriginalSetup();document.querySelector('#resumeLife')?.addEventListener('click',()=>{if(STATE.life?.replayV1)STATE.life.replayV1.eligible=false;});const l=p1Labels[LANG]||p1Labels.en;const button=document.createElement('button');button.id='btnShareReplay';button.className='ghost';button.textContent=l[0];button.onclick=p1CopyReplay;document.querySelector('#view-end').append(button);const note=document.createElement('p');note.className='muted';note.textContent=l[2];document.querySelector('#view-end').append(note);
 const mark=e=>{if(STATE.view!=='life'||!STATE.life?.replayV1)return;const control=e.target.closest('button,select,input');if(control&&!control.closest('.life-sound,.replay-dialog,.story-dialog,.story-moment,.story-person')&&!control.matches('#btnPause,#btnShareCard,#nextYear,#btnSkip,[data-pace],[data-speed],#mdMusicBtn,#toggleMusicBtn,#readCurrentEvent'))STATE.life.replayV1.eligible=false;};document.addEventListener('click',mark,true);document.addEventListener('change',mark,true);
 p1PresentReplay();
};

const p1OriginalDie=dieNow;dieNow=function(...args){const result=p1OriginalDie(...args);setView('end');return result;};


let p1Entry=null,p1EntryToken=0,p1ReturnUrl=null;
function p1PresentReplay({source,trigger}={}){
 const token=++p1EntryToken;p1Incoming=ReplayCore.parse(location.hash);
 if(!p1Incoming){p1Entry?.closeReplay();if(location.hash.startsWith('#run='))toast(SurfaceCopy.unsupported,6000);return;}
 if(!countryById(p1Incoming.country)||LANG!==p1Incoming.lang){p1Entry?.closeReplay();toast(SurfaceCopy.mismatch,5000);return;}
 const run={...p1Incoming},hash=location.hash;source=source||(new URLSearchParams(location.search).get('utm_source')==='daily'?'daily':'shared');
 import('./replay-entry.js').then(entry=>{if(token!==p1EntryToken||hash!==location.hash)return;p1Entry=entry;entry.openReplay({run,source,trigger,onCancel:()=>{p1EntryToken++;p1Incoming=null;if(history.state?.replayEntry)history.back();else{const url=new URL(location.href);url.hash='';history.replaceState(null,'',p1ReturnUrl||url.href);}},onStart:()=>{STATE.era=run.era;STATE.eduMode=run.edu;p1PendingSeed=run.seed;p1PendingCalendar=run.calendarMonth??(usesStoryRules(run)?undefined:null);document.querySelector('#lifeDuration').value='quick';launchEvent('replay_started',{action:source});startLife(run.country);}});}).catch(()=>toast(SurfaceCopy.error,6000));
}
window.addEventListener('hashchange',()=>{if(document.documentElement.dataset.gameReady==='true')p1PresentReplay();});
window.addEventListener('popstate',()=>{if(document.documentElement.dataset.gameReady==='true')p1PresentReplay();});
document.addEventListener('click',e=>{const link=e.target.closest('a[href]');if(!link||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const url=new URL(link.href);if(url.origin!==location.origin||url.pathname!==location.pathname||!url.hash.startsWith('#run='))return;e.preventDefault();const source=link.closest('.sample-life')?'sample':link.closest('.daily-life')?'daily':link.closest('.local-record')?'archive':'shared';p1ReturnUrl=location.href;launchEvent('replay_entry_click',{action:source});if(url.href!==location.href)history.pushState({replayEntry:true},'',url);p1PresentReplay({source,trigger:link});});
