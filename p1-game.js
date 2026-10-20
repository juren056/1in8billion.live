/* Existing engine, isolated simulation random streams; replay v1 supports Auto choices. */
let p1RandomContext=null;
function simRandom(){return p1RandomContext?p1RandomContext():Math.random();}
function p1Scope(seed,fn){const previous=p1RandomContext;p1RandomContext=seed?ReplayCore.random(seed):null;try{return fn();}finally{p1RandomContext=previous;}}
let p1Incoming=ReplayCore.parse(location.hash);
const p1SeenInvitations=new Set();
let p1PendingSeed=null;
const p1Labels=Object.fromEntries(['en','ja','ko','zh-Hant'].map(lang=>[lang,[SurfaceCopy.replayCopy,SurfaceCopy.replayStart,SurfaceCopy.replayInfo,SurfaceCopy.ineligible]]));
const p1OriginalNewLife=newLife;
newLife=function(country){const seed=p1PendingSeed||crypto.getRandomValues(new Uint32Array(1))[0].toString(36);p1PendingSeed=null;const life=p1Scope(seed+':birth',()=>p1OriginalNewLife(country));if(life)life.replayV1={seed,country,era:['past','future'].includes(STATE.era)?STATE.era:'now',lang:LANG,edu:STATE.eduMode,eligible:false};return life;};
const p1OriginalTick=tick;
tick=function(){const run=STATE.life?.replayV1;return p1Scope(run?run.seed+':year:'+STATE.life.age:null,()=>p1OriginalTick());};
// Rendering and cosmetic randomness must never consume a simulation stream.
for(const key of ['renderLife','renderAll','renderIntro','renderEnd']){const original=window[key];window[key]=function(...args){return p1Scope(null,()=>original.apply(this,args));};}
const p1OriginalStart=startLife;
startLife=function(...args){STATE.pendingDecision=null;STATE.fastForward=false;STATE.autoDecide=!!STATE.eduMode;const result=p1OriginalStart(...args);if(STATE.life?.replayV1){STATE.life.replayV1.eligible=document.querySelector('#lifeDuration').value==='quick'&&['en','ja','ko','zh-Hant'].includes(LANG);if(STATE.life.replayV1.eligible){STATE.autoDecide=true;STATE.thoughtsEnabled=false;}}return result;};
async function p1CopyReplay(){const run=STATE.life?.replayV1,l=p1Labels[LANG]||p1Labels.en;if(!run?.eligible){toast(l[3],5000);return;}const url=new URL({en:'/',ja:'/ja/',ko:'/ko/','zh-Hant':'/zh-tw/'}[run.lang],location.origin);url.searchParams.set('utm_source','player');url.searchParams.set('utm_medium','share');url.searchParams.set('utm_campaign','replay');url.hash=ReplayCore.encode(run);try{await navigator.clipboard.writeText(url.href);toast(SurfaceCopy.replayCopied);launchEvent('share_replay');}catch{window.prompt(SurfaceCopy.replayCopy,url.href);}}
const p1OriginalSetup=setupLaunch;
setupLaunch=function(){p1OriginalSetup();document.querySelector('#resumeLife')?.addEventListener('click',()=>{if(STATE.life?.replayV1)STATE.life.replayV1.eligible=false;});const l=p1Labels[LANG]||p1Labels.en;const button=document.createElement('button');button.id='btnShareReplay';button.className='ghost';button.textContent=l[0];button.onclick=p1CopyReplay;document.querySelector('#view-end').append(button);const note=document.createElement('p');note.className='muted';note.textContent=l[2];document.querySelector('#view-end').append(note);
 const mark=e=>{if(STATE.view!=='life'||!STATE.life?.replayV1)return;const control=e.target.closest('button,select,input');if(control&&!control.matches('#btnPause,#btnShareCard,[data-speed]'))STATE.life.replayV1.eligible=false;};document.addEventListener('click',mark,true);document.addEventListener('change',mark,true);
 p1PresentReplay();
};

const p1OriginalDie=dieNow;dieNow=function(...args){const result=p1OriginalDie(...args);setView('end');return result;};


function p1PresentReplay(){
 document.querySelector('.replay-invite')?.remove();
 p1Incoming=ReplayCore.parse(location.hash);const l=p1Labels[LANG]||p1Labels.en;
 if(p1Incoming&&countryById(p1Incoming.country)&&LANG===p1Incoming.lang&&!p1SeenInvitations.has(location.hash)){p1SeenInvitations.add(location.hash);launchEvent('replay_invitation_view');}
 if(location.hash.startsWith('#run=')&&!p1Incoming){toast(SurfaceCopy.unsupported,6000);return;}
 if(p1Incoming){if(STATE.view!=='intro')setView('intro');if(!countryById(p1Incoming.country)||LANG!==p1Incoming.lang){toast(SurfaceCopy.mismatch,5000);return;}const box=document.createElement('section');box.className='replay-invite';const p=document.createElement('p');p.textContent=l[2];const go=document.createElement('button');go.id='startReplay';go.className='primary';go.textContent=l[1];go.onclick=()=>{STATE.era=p1Incoming.era;STATE.eduMode=p1Incoming.edu;p1PendingSeed=p1Incoming.seed;document.querySelector('#lifeDuration').value='quick';launchEvent('replay_started');startLife(p1Incoming.country);box.remove();};box.append(p,go);document.querySelector('.hero').prepend(box);}
}
window.addEventListener('hashchange',()=>{if(document.documentElement.dataset.gameReady==='true')p1PresentReplay();});
document.addEventListener('click',e=>{const link=e.target.closest('a[href]');if(!link)return;const url=new URL(link.href);if(url.origin===location.origin&&url.pathname===location.pathname&&url.search===location.search&&url.hash===location.hash&&url.hash.startsWith('#run=')){e.preventDefault();p1PresentReplay();}});
