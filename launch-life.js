function readCurrentLife(){try{const raw=localStorage.getItem(STORAGE_KEY+':current');if(!raw)return{kind:'empty'};const saved=JSON.parse(raw),life=saved?.life;if(saved?.version!==1||!life||!countryById(life.country)||!Number.isFinite(life.age)||life.age<0||!Number.isFinite(life.year)||!life.stats||!Array.isArray(life.log)||!['F','M'].includes(life.sex)||!life.name)return{kind:'invalid'};return{kind:life.died?'ended':'active',saved};}catch{return{kind:'invalid'};}}

export function installLaunch(){
 const s=window.SurfaceCopy,primary=document.querySelector('#btnStart');
 const resume=document.createElement('button');resume.id='resumeLife';resume.className='cta-btn';resume.textContent=s.resume;
 const memory=document.createElement('button');memory.id='reviewCurrentLife';memory.className='cta-btn';
 const savedNote=document.createElement('p');savedNote.className='resume-note';savedNote.setAttribute('role','status');
 let launchState={kind:'empty'};
 const refreshLaunch=()=>{launchState=readCurrentLife();const kind=launchState.kind,life=launchState.saved?.life;resume.remove();memory.remove();savedNote.remove();primary.className=['active','ended'].includes(kind)?'text-button':'cta-btn';if(life){launchState.country=localize(countryById(life.country)).name;launchState.age=life.age;savedNote.textContent=s.resumeNote+' · '+launchState.country+' · '+s.sampleAge+' '+life.age;document.querySelector('.cta-row').before(savedNote);document.querySelector('.cta-row').prepend(kind==='active'?resume:memory);}else if(kind==='invalid'){document.querySelector('.cta-row').before(savedNote);}document.dispatchEvent(new CustomEvent('launch:updated',{detail:{kind}}));};
 const restoreCurrent=async ended=>{await window.retentionReady;const current=readCurrentLife();if(current.kind!==(ended?'ended':'active')){refreshLaunch();return;}const saved=current.saved;stopTicker();STATE.life=saved.life;if(!ended&&STATE.life.replayV1)STATE.life.replayV1.eligible=false;STATE.life.countryData=countryById(saved.life.country);STATE.era=saved.era;STATE.birthMode=saved.birthMode;STATE.pendingDecision=null;STATE.paused=true;STATE.autoDecide=false;STATE.thoughtsEnabled=true;setView(ended?'end':'life');if(ended){renderAll();launchEvent('life_memory_open');}else{window.Playback?.restore(saved.playback);renderAll();startTicker();launchEvent('life_resumed');}};
 resume.onclick=()=>restoreCurrent(false);memory.onclick=()=>restoreCurrent(true);
 window.LaunchLife={get:()=>launchState,refresh:refreshLaunch};
 document.addEventListener('life:saved',()=>{if(STATE.view==='intro')refreshLaunch();});window.addEventListener('storage',e=>{if(e.key===STORAGE_KEY+':current'||e.key===null)refreshLaunch();});
 const launchView=setView;setView=function(view,...args){if(['intro','end'].includes(view)&&STATE.life)saveCurrentLife();const result=launchView(view,...args);if(view==='intro')refreshLaunch();return result;};
 refreshLaunch();
}
