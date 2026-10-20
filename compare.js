(async()=>{
 const root=document.querySelector('#comparison');if(!root)return;
 const s=window.SurfaceCopy,lang=document.documentElement.lang;
 const response=await fetch('/data/countries.json');if(!response.ok)throw Error('Data unavailable');const data=await response.json();
 const totals={births:data.reduce((n,c)=>n+c.births,0),population:data.reduce((n,c)=>n+c.pop,0)};
 const a=document.querySelector('#compareA'),b=document.querySelector('#compareB'),mode=document.querySelector('#compareMode');
 const name=c=>c.iso2?new Intl.DisplayNames([lang],{type:'region'}).of(c.iso2):c.name_en;
 const params=new URLSearchParams(location.search);for(const [el,key] of [[a,'a'],[b,'b']])if(data.some(c=>c.id===params.get(key)))el.value=params.get(key);
 if(params.get('mode')==='population')mode.value='population';
 function update(){
  const A=data.find(c=>c.id===a.value),B=data.find(c=>c.id===b.value);if(!A||!B)return;
  const population=mode.value==='population',weight=c=>population?c.pop:c.births,share=c=>weight(c)/totals[mode.value]*100;
  root.querySelectorAll('[data-side]').forEach(el=>{const c=el.dataset.side==='a'?A:B;let value;switch(el.dataset.metric){case'name':value=name(c);break;case'share':value=share(c).toFixed(4)+'%';break;case'one':value='1 / '+Math.round(100/share(c));break;case'le':value=c.le+' '+s.years;break;case'eys':value=c.eys==null?s.missing:c.eys+' '+s.years;break;case'ppp':value=c.ppp==null?s.missing:'$'+c.ppp.toLocaleString(lang);break;}el.textContent=value;});
  document.querySelector('#modeShareLabel').textContent=population?s.sharePopulation:s.shareBirth;
  document.querySelector('#modeOddsLabel').textContent=population?s.drawPopulation:s.drawBirth;
  document.querySelector('#compareAnswer').textContent=A.id===B.id?s.same:`${name(A)} / ${name(B)}: ${(weight(A)/weight(B)).toFixed(2)}× · ${s.ratio} (${population?s.population:s.birth})`;
  for(const [side,c] of [['a',A],['b',B]]){document.querySelector('#barName'+side).textContent=name(c);document.querySelector('#barValue'+side).textContent=share(c).toFixed(4)+'%';document.querySelector('#bar'+side).style.width=100*weight(c)/Math.max(weight(A),weight(B))+'%';}
  for(const [id,c] of [['playA',A],['playB',B]]){const link=document.querySelector('#'+id);link.href=document.documentElement.dataset.playPath+'?country='+c.id;link.textContent=s.playIn+' '+name(c);}
  const url=new URL(location.href);url.searchParams.set('a',A.id);url.searchParams.set('b',B.id);url.searchParams.set('mode',mode.value);history.replaceState(null,'',url.pathname+url.search);
  document.querySelectorAll('[data-locale]').forEach(link=>{const localized=new URL(link.href);localized.search=url.search;link.href=localized.href;});
 }
 [a,b,mode].forEach(el=>el.addEventListener('change',()=>{update();window.siteEvent?.('compare_used',{mode:mode.value});}));
 document.querySelector('#swapCountries').onclick=()=>{[a.value,b.value]=[b.value,a.value];update();window.siteEvent?.('compare_used',{mode:mode.value,action:'swap'});};
 document.querySelector('#copyComparison').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);document.querySelector('#compareStatus').textContent=s.copied;window.siteEvent?.('comparison_shared',{mode:mode.value});}catch{document.querySelector('#compareStatus').textContent=location.href;}};
 update();
})().catch(()=>{const status=document.querySelector('#compareStatus');if(status)status.textContent=window.SurfaceCopy.failed;});
