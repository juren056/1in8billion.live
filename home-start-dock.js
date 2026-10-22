import{startDockCopy,resumeLabel,dismissDockLabel}from'./start-dock-copy.js';
export async function installStartDock(c){
const root=document.documentElement;
const startLabel=()=>{const start=document.querySelector('#btnStart');if(start)start.textContent=window.ThemeLabels.study[0];};startLabel();window.retentionReady?.then(startLabel);document.addEventListener('site:locale-ready',startLabel);
const primary=document.querySelector('#btnStart'),selected=document.querySelector('#btnStartSelected');if(primary&&selected){const ready=()=>selected.disabled=primary.disabled;ready();new MutationObserver(ready).observe(primary,{attributes:true,attributeFilter:['disabled']});}
document.querySelectorAll('.art-retry').forEach(button=>button.closest('.theme-hero')?.append(button));
document.querySelectorAll('[data-theme-art]').forEach(img=>{const failed=()=>{img.hidden=true;const retry=img.closest('.theme-hero')?.querySelector('.art-retry');if(retry)retry.hidden=false;};img.addEventListener('error',failed);if(img.complete&&!img.naturalWidth)failed();});
document.querySelectorAll('[data-theme-art]').forEach(img=>img.addEventListener('load',()=>{const retry=img.closest('.theme-hero')?.querySelector('.art-retry');if(retry)retry.hidden=true;}));
document.querySelectorAll('.art-retry').forEach(b=>b.addEventListener('click',()=>{const img=b.parentElement.querySelector('[data-theme-art]');img.hidden=false;img.src='/public-assets/themes/'+root.dataset.appearance+(matchMedia('(max-width:760px)').matches?'-mobile':'')+'.webp';b.hidden=true;}));

const dock=document.querySelector('#startDock'),hero=document.querySelector('.theme-hero');
if(dock&&hero){
 const styled=await new Promise(resolve=>{const link=document.createElement('link');link.rel='stylesheet';link.href='/home-start-dock.css';link.onload=()=>resolve(true);link.onerror=()=>resolve(false);document.head.append(link);});if(!styled)return;

 const copy=startDockCopy(document.documentElement.lang),action=dock.querySelector('button'),brand=dock.querySelector('a'),rebirth=document.createElement('button'),dismiss=document.createElement('button');rebirth.type='button';rebirth.className='dock-rebirth';rebirth.textContent=copy[1];rebirth.hidden=true;dismiss.type='button';dismiss.className='dock-dismiss';dismiss.setAttribute('aria-label',dismissDockLabel(document.documentElement.lang));dismiss.title=dismiss.getAttribute('aria-label');dismiss.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 6 12 12M18 6 6 18"/></svg>';dock.append(rebirth,dismiss);
 const key='1in8b:dock-dismissed:v1';let closed=false,up=false,lastY=scrollY,queued=false;try{closed=sessionStorage.getItem(key)==='1';}catch{}
 const visible=e=>!!e&&!e.hidden&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
 const inView=(e,top=0)=>{if(!visible(e))return false;const r=e.getBoundingClientRect();return r.bottom>top&&r.top<innerHeight;};
 const sync=()=>{const intro=document.querySelector('.view.active')?.id==='view-intro',modal=[...document.querySelectorAll('dialog[open],[role="dialog"],#modal,.life-modal,header details[open]')].some(visible)||document.querySelector('header[data-theme-menu="true"],header[data-menu-open="true"]'),typing=/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName),focused=dock.contains(document.activeElement),top=Math.max(0,document.querySelector('.topbar')?.getBoundingClientRect().bottom||0),outside=!['#resumeLife','#reviewCurrentLife','#btnStart','#btnStartSelected'].some(id=>inView(document.querySelector(id),top)),footer=[...document.querySelectorAll('footer,.footer')].some(e=>inView(e,top));dock.hidden=!(intro&&!closed&&!modal&&!typing&&!footer&&outside&&(up||focused));
 const state=window.LaunchLife?.get()||{kind:'empty'},hasProgress=['active','ended'].includes(state.kind),label=state.kind==='active'?resumeLabel(copy,state.country,state.age):state.kind==='ended'?copy[2]:document.querySelector('#btnStart')?.textContent||c[12];
 if(action.textContent!==label)action.textContent=label;action.dataset.action=state.kind==='active'?'resume':state.kind==='ended'?'memory':'start';dock.dataset.hasProgress=String(hasProgress);rebirth.hidden=!hasProgress;brand.hidden=hasProgress;action.disabled=!!document.querySelector('#btnStart')?.disabled;rebirth.disabled=action.disabled;
 const resume=document.querySelector('#resumeLife'),memory=document.querySelector('#reviewCurrentLife'),note=document.querySelector('.resume-note');if(resume&&resume.textContent!==label)resume.textContent=label;if(memory&&memory.textContent!==copy[2])memory.textContent=copy[2];if(state.kind==='invalid'&&note&&note.textContent!==copy[3])note.textContent=copy[3];};
 const trigger=id=>{const button=document.querySelector(id);if(button&&!button.disabled)button.click();};
 action.onclick=()=>trigger(action.dataset.action==='resume'?'#resumeLife':action.dataset.action==='memory'?'#reviewCurrentLife':'#btnStart');rebirth.onclick=()=>trigger('#btnStart');
 const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;sync();});}};
 dismiss.onclick=()=>{closed=true;try{sessionStorage.setItem(key,'1');}catch{}dock.hidden=true;document.querySelector('header .brand')?.focus({preventScroll:true});};
 addEventListener('scroll',()=>{const y=scrollY;if(Math.abs(y-lastY)>=6){up=y<lastY;lastY=y;}schedule();},{passive:true});addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);
 new MutationObserver(rows=>{if(rows.some(row=>!dock.contains(row.target)))schedule();}).observe(document.body,{attributes:true,attributeFilter:['class','hidden','open','style','data-theme-menu','data-menu-open'],childList:true,subtree:true});
 document.addEventListener('launch:updated',sync);document.addEventListener('focusin',sync);document.addEventListener('focusout',()=>requestAnimationFrame(sync));sync();
}

}
