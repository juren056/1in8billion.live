import{startDockCopy,resumeLabel}from'./start-dock-copy.js';
export function installStartDock(c){
const root=document.documentElement;
const startLabel=()=>{const start=document.querySelector('#btnStart');if(start)start.textContent=window.ThemeLabels.study[0];};startLabel();window.retentionReady?.then(startLabel);document.addEventListener('site:locale-ready',startLabel);
const primary=document.querySelector('#btnStart'),selected=document.querySelector('#btnStartSelected');if(primary&&selected){const ready=()=>selected.disabled=primary.disabled;ready();new MutationObserver(ready).observe(primary,{attributes:true,attributeFilter:['disabled']});}
document.querySelectorAll('.art-retry').forEach(button=>button.closest('.theme-hero')?.append(button));
document.querySelectorAll('[data-theme-art]').forEach(img=>{const failed=()=>{img.hidden=true;const retry=img.closest('.theme-hero')?.querySelector('.art-retry');if(retry)retry.hidden=false;};img.addEventListener('error',failed);if(img.complete&&!img.naturalWidth)failed();});
document.querySelectorAll('[data-theme-art]').forEach(img=>img.addEventListener('load',()=>{const retry=img.closest('.theme-hero')?.querySelector('.art-retry');if(retry)retry.hidden=true;}));
document.querySelectorAll('.art-retry').forEach(b=>b.addEventListener('click',()=>{const img=b.parentElement.querySelector('[data-theme-art]');img.hidden=false;img.src='/public-assets/themes/'+root.dataset.appearance+(matchMedia('(max-width:760px)').matches?'-mobile':'')+'.webp';b.hidden=true;}));

const dock=document.querySelector('#startDock'),hero=document.querySelector('.theme-hero');
if(dock&&hero){
 const copy=startDockCopy(document.documentElement.lang),action=dock.querySelector('button'),brand=dock.querySelector('a'),rebirth=document.createElement('button');rebirth.type='button';rebirth.className='dock-rebirth';rebirth.textContent=copy[1];rebirth.hidden=true;dock.append(rebirth);let outside=false;
 const sync=()=>{const intro=!document.body.classList.contains('game-active'),modal=[...document.querySelectorAll('[role="dialog"],#modal,.life-modal')].some(e=>!e.hidden&&e.getClientRects().length),typing=/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName);dock.hidden=!(outside&&intro&&!modal&&!typing);
 const state=window.LaunchLife?.get()||{kind:'empty'},hasProgress=['active','ended'].includes(state.kind),label=state.kind==='active'?resumeLabel(copy,state.country,state.age):state.kind==='ended'?copy[2]:document.querySelector('#btnStart')?.textContent||c[12];
 if(action.textContent!==label)action.textContent=label;action.dataset.action=state.kind==='active'?'resume':state.kind==='ended'?'memory':'start';dock.dataset.hasProgress=String(hasProgress);rebirth.hidden=!hasProgress;brand.hidden=hasProgress;action.disabled=!!document.querySelector('#btnStart')?.disabled;rebirth.disabled=action.disabled;
 const resume=document.querySelector('#resumeLife'),memory=document.querySelector('#reviewCurrentLife'),note=document.querySelector('.resume-note');if(resume&&resume.textContent!==label)resume.textContent=label;if(memory&&memory.textContent!==copy[2])memory.textContent=copy[2];if(state.kind==='invalid'&&note&&note.textContent!==copy[3])note.textContent=copy[3];};
 const trigger=id=>{const button=document.querySelector(id);if(button&&!button.disabled)button.click();};
 action.onclick=()=>trigger(action.dataset.action==='resume'?'#resumeLife':action.dataset.action==='memory'?'#reviewCurrentLife':'#btnStart');rebirth.onclick=()=>trigger('#btnStart');
 const top=Math.ceil(document.querySelector('.topbar')?.getBoundingClientRect().height||0);new IntersectionObserver(([entry])=>{outside=!entry.isIntersecting;sync();},{rootMargin:`-${top}px 0px 0px 0px`}).observe(document.querySelector('.cta-row')||hero);
 new MutationObserver(rows=>{if(rows.some(row=>!dock.contains(row.target)))sync();}).observe(document.body,{attributes:true,attributeFilter:['class','hidden','open'],childList:true,subtree:true});
 document.addEventListener('launch:updated',sync);document.addEventListener('focusin',sync);document.addEventListener('focusout',()=>requestAnimationFrame(sync));sync();
}

}
