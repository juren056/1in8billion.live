import {numericColumn} from './table-columns.js';
const hints={en:'Scroll horizontally to see all columns.','zh-CN':'左右滑动，查看全部列。','zh-TW':'左右滑動，查看全部欄位。',ja:'横にスクロールしてすべての列を表示します。',ko:'좌우로 스크롤하여 모든 열을 확인하세요.',es:'Desliza horizontalmente para ver todas las columnas.','pt-BR':'Deslize para os lados para ver todas as colunas.',fr:'Faites défiler horizontalement pour voir toutes les colonnes.',de:'Seitlich scrollen, um alle Spalten zu sehen.'};
const lang=document.documentElement.lang,copy=hints[lang]||hints.en;
const comparison={en:['Better than random','Worse than random','Same'], 'zh-CN':['优于随机出生地','低于随机出生地','相同'],'zh-TW':['優於隨機出生地','低於隨機出生地','相同'],ja:['ランダムな出生地より良い','ランダムな出生地より低い','同じ'],ko:['무작위 출생지보다 좋음','무작위 출생지보다 낮음','동일'],es:['Mejor que el lugar aleatorio','Peor que el lugar aleatorio','Igual'],'pt-BR':['Melhor que o local aleatório','Pior que o local aleatório','Igual'],fr:['Mieux que le lieu aléatoire','Moins bien que le lieu aléatoire','Identique'],de:['Besser als der Zufallsort','Schlechter als der Zufallsort','Gleich']};
const tracked=new WeakSet();
const size=new ResizeObserver(entries=>{for(const {target}of entries){const hint=target.previousElementSibling;if(hint?.classList.contains('table-scroll-hint'))hint.hidden=target.scrollWidth<=target.clientWidth+1;}});
function enhance(){for(const table of document.querySelectorAll('table')){
 const columns=Math.max(0,...[...table.rows].map(row=>[...row.cells].reduce((n,c)=>n+c.colSpan,0)));if(table.dataset.columns!==String(columns))table.dataset.columns=columns;
 for(const cell of table.querySelectorAll('.ar-k')){const index=['🟢','🔴','⚪'].findIndex(dot=>cell.textContent.includes(dot));if(index>=0&&!cell.querySelector('.table-comparison')){cell.textContent=cell.textContent.replace(/[🟢🔴⚪]/gu,'').trim();const note=document.createElement('span');note.className='table-comparison';note.dataset.noTranslate='true';note.textContent=(comparison[lang]||comparison.en)[index];cell.append(note);}}
 const body=Array.from({length:columns},()=>[]);for(const row of [...table.tBodies].flatMap(b=>[...b.rows])){let col=0;for(const cell of row.cells){if(cell.tagName==='TD'&&cell.colSpan===1)body[col]?.push(cell);col+=cell.colSpan;}}
 const numeric=body.map(cells=>numericColumn(cells.map(c=>c.textContent),cells.some(c=>c.matches('.ar-v,.cs-v,[data-side][data-metric]:not([data-metric="name"])'))));
 for(const row of table.rows){let col=0;for(const cell of row.cells){cell.toggleAttribute('data-numeric',cell.colSpan===1&&numeric[col]===true);col+=cell.colSpan;}}
 if(tracked.has(table))continue;tracked.add(table);
 let frame=table.parentElement;if(!frame.classList.contains('table-scroll')){frame=document.createElement('div');frame.className='table-scroll';table.before(frame);frame.append(table);}
 frame.tabIndex=0;frame.setAttribute('role','region');const caption=table.caption?.textContent.trim();frame.setAttribute('aria-label',caption||copy);
 const hint=document.createElement('p');hint.className='table-scroll-hint';hint.textContent=copy;hint.hidden=true;frame.before(hint);size.observe(frame);
 for(const head of table.querySelectorAll('thead th'))head.scope='col';for(const head of table.querySelectorAll('tbody th'))head.scope='row';
}}
let queued=false;new MutationObserver(rows=>{if(!rows.some(r=>r.target.closest?.('table')||[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches('table')||n.querySelector('table')))))return;if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;enhance();});}}).observe(document.body,{childList:true,subtree:true});
enhance();
