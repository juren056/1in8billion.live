const $=s=>document.querySelector(s);
const themeIds=['blue','journal','editorial','night'];
const c=window.ThemeLabels.copy;
const root=document.documentElement,selector=$('#appearanceMenu');
function update(id){root.dataset.appearance=id;document.querySelectorAll('[data-appearance-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.appearanceChoice===id)));document.querySelectorAll('[data-theme-art]').forEach(img=>{img.src='/public-assets/themes/'+id+(matchMedia('(max-width:760px)').matches?'-mobile':'')+'.webp';img.alt=c[15];img.hidden=false;});$('#appearanceStatus').textContent=c[themeIds.indexOf(id)+1];}
document.querySelectorAll('[data-appearance-choice]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.appearanceChoice;try{localStorage.setItem('1in8b:appearance:v1',id);}catch{}update(id);selector.open=false;selector.querySelector('summary').focus();}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&selector?.open){selector.open=false;selector.querySelector('summary').focus();}});
document.addEventListener('click',e=>{if(selector?.open&&!selector.contains(e.target))selector.open=false;});
window.addEventListener('storage',e=>{if(e.key==='1in8b:appearance:v1')update(themeIds.includes(e.newValue)?e.newValue:'night');});
update(root.dataset.appearance||'night');
if($('#startDock'))import('./home-start-dock.js').then(m=>m.installStartDock(c));

if($('#view-life,.keepsake-studio'))import($('#view-life')?'./theme-home.js':'./theme-studio.js');

import('./table-system.js');

import('./theme-menu.js').then(m=>m.installThemeMenu(root,c[17])).catch(()=>{document.querySelector('.site-links')?.setAttribute('style','display:flex;flex-wrap:wrap');});
