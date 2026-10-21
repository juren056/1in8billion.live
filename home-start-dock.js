export function installStartDock(c){
const root=document.documentElement;
const startLabel=()=>{const start=document.querySelector('#btnStart');if(start)start.textContent=window.ThemeLabels.study[0];};startLabel();window.retentionReady?.then(startLabel);document.addEventListener('site:locale-ready',startLabel);
const primary=document.querySelector('#btnStart'),selected=document.querySelector('#btnStartSelected');if(primary&&selected){const ready=()=>selected.disabled=primary.disabled;ready();new MutationObserver(ready).observe(primary,{attributes:true,attributeFilter:['disabled']});}
document.querySelectorAll('[data-theme-art]').forEach(img=>img.addEventListener('error',()=>{img.hidden=true;const retry=img.parentElement.querySelector('.art-retry');if(retry)retry.hidden=false;}));
document.querySelectorAll('.art-retry').forEach(b=>b.addEventListener('click',()=>{const img=b.parentElement.querySelector('[data-theme-art]');img.hidden=false;img.src='/public-assets/themes/'+root.dataset.appearance+'.webp';b.hidden=true;}));

const dock=document.querySelector('#startDock'),hero=document.querySelector('.theme-hero');
if(dock&&hero){let outside=false;const sync=()=>{const intro=!document.body.classList.contains('game-active'),modal=[...document.querySelectorAll('[role="dialog"],#modal')].some(e=>!e.hidden&&e.getClientRects().length),typing=/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName);dock.hidden=!(outside&&intro&&!modal&&!typing);const resume=document.querySelector('#resumeLife');dock.querySelector('button').textContent=resume?.textContent||document.querySelector('#btnStart')?.textContent||c[12];dock.querySelector('button').disabled=!!document.querySelector('#btnStart')?.disabled;};new IntersectionObserver(([entry])=>{outside=!entry.isIntersecting;sync();}).observe(hero);new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class'],subtree:true});document.addEventListener('focusin',sync);document.addEventListener('focusout',()=>requestAnimationFrame(sync));dock.querySelector('button').onclick=()=>{const b=document.querySelector('#resumeLife')||document.querySelector('#btnStart');if(b&&!b.disabled)b.click();};}

}
