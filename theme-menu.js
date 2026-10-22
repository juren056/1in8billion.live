export function installThemeMenu(root,label){
const header=document.querySelector('.topbar'),nav=header?.querySelector('.site-links');
if(header&&nav){const toggle=document.createElement('button');toggle.type='button';toggle.className='theme-nav-toggle';toggle.textContent=label;toggle.setAttribute('aria-expanded','false');nav.id='themeNavigation';toggle.setAttribute('aria-controls',nav.id);header.append(toggle);toggle.onclick=()=>{const open=header.dataset.themeMenu!=='true';if(open)header.querySelectorAll('details[open]').forEach(e=>e.open=false);header.dataset.themeMenu=String(open);toggle.setAttribute('aria-expanded',String(open));};document.addEventListener('keydown',e=>{if(e.key==='Escape'&&header.dataset.themeMenu==='true'){header.dataset.themeMenu='false';toggle.setAttribute('aria-expanded','false');toggle.focus();}});}

if(header){
 const locate=()=>root.style.setProperty('--theme-header-bottom',Math.max(12,header.getBoundingClientRect().bottom)+'px');new ResizeObserver(locate).observe(header);addEventListener('resize',locate);locate();
 header.addEventListener('toggle',event=>{const menu=event.target;if(menu.tagName!=='DETAILS'||!menu.open)return;header.querySelectorAll('details[open]').forEach(other=>{if(other!==menu)other.open=false;});header.dataset.themeMenu='false';header.dataset.menuOpen='false';const toggle=header.querySelector('.theme-nav-toggle');if(toggle)toggle.setAttribute('aria-expanded','false');locate();},true);
}

}
