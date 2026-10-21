import {calculateComparison,comparisonCSV} from './comparison-core.js';
import {preserveTaskLinks} from './task-navigation.js';
import {comparisonStateCopy} from './comparison-state-copy.js';
(()=>{
 const root=document.querySelector('#comparison');if(!root)return;
 const s=window.SurfaceCopy,lang=document.documentElement.lang;
 const a=document.querySelector('#compareA'),b=document.querySelector('#compareB'),mode=document.querySelector('#compareMode');
 const controls=[a,b,mode,...['swapCountries','copyComparison','downloadComparison'].map(id=>document.getElementById(id))],status=document.querySelector('#compareLoadStatus'),recovery=document.querySelector('#compareLoading'),retry=document.querySelector('#compareRetry'),labels=comparisonStateCopy[lang]||comparisonStateCopy.en;
 retry.textContent=labels[2];let busy=false;
 async function load(){
 if(busy)return;busy=true;
 recovery.hidden=false;root.dataset.state='loading';root.setAttribute('aria-busy','true');controls.forEach(el=>el.disabled=true);retry.hidden=true;status.textContent=labels[0];
 try{
 const response=await fetch('/data/countries.json',{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Data unavailable');const data=await response.json();
 if(!Array.isArray(data)||![a.value,b.value].every(id=>data.some(c=>c.id===id)))throw Error('Invalid comparison data');
 const name=c=>c.iso2?new Intl.DisplayNames([lang],{type:'region'}).of(c.iso2):c.name_en;
 const params=new URLSearchParams(location.search);for(const [el,key] of [[a,'a'],[b,'b']])if(data.some(c=>c.id===params.get(key)))el.value=params.get(key);
 if(params.get('mode')==='population')mode.value='population';
 let current;
 const t=x=>window.translateUI?.(x)||x;
 function update(){
  const A=data.find(c=>c.id===a.value),B=data.find(c=>c.id===b.value);if(!A||!B)return;
  current=calculateComparison(data,A.id,B.id,mode.value);
  const population=mode.value==='population',weight=c=>population?c.pop:c.births,share=c=>current[c.id===A.id?'a':'b'].share;
  root.querySelectorAll('[data-side]').forEach(el=>{const c=el.dataset.side==='a'?A:B;let value;switch(el.dataset.metric){case'name':value=name(c);break;case'share':value=share(c).toFixed(4)+'%';break;case'one':value='1 / '+Math.round(100/share(c));break;case'le':value=c.le+' '+s.years;break;case'eys':value=c.eys==null?s.missing:c.eys+' '+s.years;break;case'ppp':value=c.ppp==null?s.missing:'$'+c.ppp.toLocaleString(lang);break;}el.textContent=value;});
  document.querySelector('#modeShareLabel').textContent=population?s.sharePopulation:s.shareBirth;
  document.querySelector('#modeOddsLabel').textContent=population?s.drawPopulation:s.drawBirth;
  document.querySelector('#compareAnswer').textContent=A.id===B.id?t(s.same):`${name(A)} / ${name(B)}: ${(weight(A)/weight(B)).toFixed(2)}× · ${t(s.ratio)} (${t(population?s.population:s.birth)})`;
  for(const [side,c] of [['a',A],['b',B]]){document.querySelector('#barName'+side).textContent=name(c);document.querySelector('#barValue'+side).textContent=share(c).toFixed(4)+'%';document.querySelector('#bar'+side).style.width=100*weight(c)/Math.max(weight(A),weight(B))+'%';}
  for(const [id,c] of [['playA',A],['playB',B]]){const link=document.querySelector('#'+id);link.href=document.documentElement.dataset.playPath+'?country='+c.id;link.textContent=s.playIn+' '+name(c);}
  const url=new URL(location.href);url.searchParams.set('a',A.id);url.searchParams.set('b',B.id);url.searchParams.set('mode',mode.value);history.replaceState(null,'',url.pathname+url.search);
  preserveTaskLinks(document,url.href);
 }
 update();
 [a,b,mode].forEach(el=>el.addEventListener('change',()=>{update();window.siteEvent?.('compare_used',{mode:mode.value});}));
 document.querySelector('#swapCountries').onclick=()=>{[a.value,b.value]=[b.value,a.value];update();window.siteEvent?.('compare_used',{mode:mode.value,action:'swap'});};
 document.querySelector('#copyComparison').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);document.querySelector('#compareStatus').textContent=s.copied;window.siteEvent?.('comparison_shared',{mode:mode.value});}catch{document.querySelector('#compareStatus').textContent=location.href;}};
 document.querySelector('#downloadComparison').onclick=()=>{if(!current)return;const names=[a.options[a.selectedIndex].text,b.options[b.selectedIndex].text],blob=new Blob([comparisonCSV(current,names,window.MODEL_SNAPSHOT)],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`birthplace-${current.a.id}-${current.b.id}-${current.mode}.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);window.siteEvent?.('comparison_download',{mode:mode.value});};
 document.addEventListener('site:locale-ready',update);root.dataset.state='ready';recovery.hidden=true;controls.forEach(el=>el.disabled=false);status.textContent='';
 }catch{root.dataset.state='failed';status.textContent=labels[1];retry.hidden=false;}
 finally{busy=false;root.setAttribute('aria-busy','false');}
 }
 retry.onclick=load;load();
})();
