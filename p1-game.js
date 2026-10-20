/* Existing engine, isolated simulation random streams; replay v1 supports Auto choices. */
let p1RandomContext=null;
function simRandom(){return p1RandomContext?p1RandomContext():Math.random();}
function p1Scope(seed,fn){const previous=p1RandomContext;p1RandomContext=seed?ReplayCore.random(seed):null;try{return fn();}finally{p1RandomContext=previous;}}
const p1Incoming=ReplayCore.parse(location.hash);
let p1PendingSeed=null;
const p1Labels={en:['Copy replay link','Replay this life','Automatic decisions reproduce this life. Personal notes and names are not included.','This run was changed manually. Start a new Quick play life to create a reproducible link.'],ja:['再現リンクをコピー','この人生を再現','自動選択で同じ人生を再現します。個人メモや名前はリンクに含めません。','手動操作された人生です。クイックプレイで新しい人生を始めてください。'],ko:['재현 링크 복사','이 삶 재현하기','자동 선택으로 같은 삶을 재현합니다. 개인 메모와 이름은 링크에 포함되지 않습니다.','수동으로 변경된 삶입니다. 빠른 플레이로 새로 시작하세요.'],'zh-Hant':['複製重現連結','重現這段人生','自動抉擇可重現同一段人生。連結不包含個人筆記或姓名。','這段人生曾手動變更，請以快速體驗開始新人生以建立可重現連結。']};
const p1OriginalNewLife=newLife;
newLife=function(country){const seed=p1PendingSeed||crypto.getRandomValues(new Uint32Array(1))[0].toString(36);p1PendingSeed=null;const life=p1Scope(seed+':birth',()=>p1OriginalNewLife(country));if(life)life.replayV1={seed,country,era:['past','future'].includes(STATE.era)?STATE.era:'now',lang:LANG,edu:STATE.eduMode,eligible:false};return life;};
const p1OriginalTick=tick;
tick=function(){const run=STATE.life?.replayV1;return p1Scope(run?run.seed+':year:'+STATE.life.age:null,()=>p1OriginalTick());};
// Rendering and cosmetic randomness must never consume a simulation stream.
for(const key of ['renderLife','renderAll','renderIntro','renderEnd']){const original=window[key];window[key]=function(...args){return p1Scope(null,()=>original.apply(this,args));};}
const p1OriginalStart=startLife;
startLife=function(...args){STATE.pendingDecision=null;STATE.fastForward=false;STATE.autoDecide=false;const result=p1OriginalStart(...args);if(STATE.life?.replayV1){STATE.life.replayV1.eligible=document.querySelector('#lifeDuration').value==='quick'&&['en','ja','ko','zh-Hant'].includes(LANG);if(STATE.life.replayV1.eligible){STATE.autoDecide=true;STATE.thoughtsEnabled=false;}}return result;};
async function p1CopyReplay(){const run=STATE.life?.replayV1,l=p1Labels[LANG]||p1Labels.en;if(!run?.eligible){toast(l[3],5000);return;}const url=new URL({en:'/',ja:'/ja/',ko:'/ko/','zh-Hant':'/zh-tw/'}[run.lang],location.origin);url.hash=ReplayCore.encode(run);try{await navigator.clipboard.writeText(url.href);toast('Replay link copied');launchEvent('share_replay');}catch{window.prompt('Copy replay link',url.href);}}
const p1OriginalSetup=setupLaunch;
setupLaunch=function(){p1OriginalSetup();const l=p1Labels[LANG]||p1Labels.en;const button=document.createElement('button');button.id='btnShareReplay';button.className='ghost';button.textContent=l[0];button.onclick=p1CopyReplay;document.querySelector('#view-end').append(button);const note=document.createElement('p');note.className='muted';note.textContent=l[2];document.querySelector('#view-end').append(note);
 const mark=e=>{if(STATE.view!=='life'||!STATE.life?.replayV1)return;const control=e.target.closest('button,select,input');if(control&&!control.matches('#btnPause,#btnShareCard,[data-speed]'))STATE.life.replayV1.eligible=false;};document.addEventListener('click',mark,true);document.addEventListener('change',mark,true);
 if(location.hash.startsWith('#run=')&&!p1Incoming){toast('Unsupported replay link. Your saved life is unchanged.',6000);return;}
 if(p1Incoming){if(!countryById(p1Incoming.country)||LANG!==p1Incoming.lang){toast('Replay language or country mismatch',5000);return;}const box=document.createElement('section');box.className='replay-invite';const p=document.createElement('p');p.textContent=l[2];const go=document.createElement('button');go.id='startReplay';go.className='primary';go.textContent=l[1];go.onclick=()=>{STATE.era=p1Incoming.era;STATE.eduMode=p1Incoming.edu;p1PendingSeed=p1Incoming.seed;document.querySelector('#lifeDuration').value='quick';startLife(p1Incoming.country);box.remove();};box.append(p,go);document.querySelector('.hero').prepend(box);}
};

const p1OriginalDie=dieNow;dieNow=function(...args){const result=p1OriginalDie(...args);setView('end');return result;};
