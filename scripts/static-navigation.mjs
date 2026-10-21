import {taskCopy} from '../task-copy.js';
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
export function staticNavigation(html,lang){
 const menuLabel=({en:'Menu',ja:'メニュー',ko:'메뉴','zh-TW':'選單','zh-CN':'菜单',es:'Menú','pt-BR':'Menu',fr:'Menu',de:'Menü'})[lang];
 html=html.replace(/<header\b[^>]*>[\s\S]*?<\/header>/,header=>{
  const nav=header.match(/<nav class="site-links"[\s\S]*?<\/nav>/)?.[0];if(!nav)return header;
  const menu=nav.match(/<details class="language-menu">[\s\S]*?<\/details>/)?.[0];if(!menu)return header;
  const language=menu.replace('class="language-menu"','class="language-menu global-language"').replace(/<summary>.*?<\/summary>/,`<summary>🌐 ${lang}</summary>`);
  return header.replace(nav,`<button class="global-menu-toggle" type="button" aria-expanded="false" aria-controls="globalNavigation">${menuLabel}</button>`+nav.replace(menu,'').replace('class="site-links"','class="site-links" id="globalNavigation"')+language).replace('class="topbar"',html.includes('id="view-intro"')?'class="topbar game-header"':'class="topbar"');
 });
 html=html.replace(/(<html lang="[^"]+")/,'$1 class="enhanced-nav"').replace('</head>','<noscript><style>.topbar>.site-links{display:flex}.global-menu-toggle{display:none}</style></noscript></head>');
 if(html.includes('id="view-intro"'))return html;
 // Preserve source bytes and IDs; select the same direct h2 / section>h2 hierarchy as task-ui.
 return html.replace(/(<main\b[^>]*>)([\s\S]*?)(<\/main>)/,(all,start,body,end)=>{
  const stack=[],headings=[],voids=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  for(const m of body.matchAll(/<\/?([a-z][\w:-]*)\b[^>]*>/gi)){
   const name=m[1].toLowerCase(),closing=m[0][1]==='/';
   if(['script','style'].includes(stack.at(-1))&&!(closing&&name===stack.at(-1)))continue;
   if(closing){const at=stack.lastIndexOf(name);if(at>=0)stack.length=at;continue;}
   if(name==='h2'&&(stack.length===0||stack.length===1&&stack[0]==='section')&&headings.length<9){const close=body.indexOf('</h2>',m.index),text=body.slice(m.index+m[0].length,close).replace(/<[^>]*>/g,'');headings.push({at:m.index,tag:m[0],id:m[0].match(/\bid="([^"]+)"/)?.[1]||'reading-section-'+headings.length,text});}
   if(!voids.has(name)&&!m[0].endsWith('/>'))stack.push(name);
  }
  if(headings.length<2)return all;
  for(const h of [...headings].reverse())if(!h.tag.includes(' id='))body=body.slice(0,h.at)+h.tag.replace('>',' id="'+h.id+'">')+body.slice(h.at+h.tag.length);
  const nav=`<nav class="reading-navigation" aria-label="${esc(taskCopy[lang].contents)}"><strong>${esc(taskCopy[lang].contents)}</strong>${headings.map(h=>`<a href="#${h.id}">${h.text}</a>`).join('')}</nav>`;
  body=body.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/,h=>h+nav);return start+body+end;
 });
}
