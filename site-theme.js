const $=s=>document.querySelector(s);
const themeIds=['blue','journal','editorial','night'];
const c=window.ThemeLabels.copy;
const root=document.documentElement,selector=$('#appearanceMenu');
const header=$('.topbar'),nav=header?.querySelector('.site-links');
if(header&&nav){const toggle=document.createElement('button');toggle.type='button';toggle.className='theme-nav-toggle';toggle.textContent=c[17];toggle.setAttribute('aria-expanded','false');nav.id='themeNavigation';toggle.setAttribute('aria-controls',nav.id);header.append(toggle);toggle.onclick=()=>{const open=header.dataset.themeMenu!=='true';header.dataset.themeMenu=String(open);toggle.setAttribute('aria-expanded',String(open));};document.addEventListener('keydown',e=>{if(e.key==='Escape'&&header.dataset.themeMenu==='true'){header.dataset.themeMenu='false';toggle.setAttribute('aria-expanded','false');toggle.focus();}});}
function update(id){root.dataset.appearance=id;document.querySelectorAll('[data-appearance-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.appearanceChoice===id)));document.querySelectorAll('[data-theme-art]').forEach(img=>{img.src='/public-assets/themes/'+id+(matchMedia('(max-width:760px)').matches?'-mobile':'')+'.webp';img.alt=c[15];img.hidden=false;});$('#appearanceStatus').textContent=c[themeIds.indexOf(id)+1];}
document.querySelectorAll('[data-appearance-choice]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.appearanceChoice;try{localStorage.setItem('1in8b:appearance:v1',id);}catch{}update(id);selector.open=false;selector.querySelector('summary').focus();}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&selector?.open){selector.open=false;selector.querySelector('summary').focus();}});
document.addEventListener('click',e=>{if(selector?.open&&!selector.contains(e.target))selector.open=false;});
window.addEventListener('storage',e=>{if(e.key==='1in8b:appearance:v1')update(themeIds.includes(e.newValue)?e.newValue:'blue');});
update(root.dataset.appearance||'blue');
if($('#startDock'))import('./home-start-dock.js').then(m=>m.installStartDock(c));

if($('#view-life,.keepsake-studio'))import($('#view-life')?'./theme-home.js':'./theme-studio.js');
