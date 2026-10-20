(async()=>{
 const root=document.querySelector('#comparison');if(!root)return;const lang=document.documentElement.lang;const copy=({en:['Annual birth share','Population share','Approximate birth draw','Approximate population draw','Same country: identical model weights.','Comparison link copied'],ja:['年間出生割合','人口割合','出生の抽選確率','人口の抽選確率','同じ国：モデルの重みは同一です。','比較リンクをコピーしました'],ko:['연간 출생 비중','인구 비중','출생 추첨 확률','인구 추첨 확률','같은 국가: 모델 가중치가 같습니다.','비교 링크가 복사되었습니다'],'zh-TW':['年度出生佔比','人口佔比','出生抽籤機率','人口抽籤機率','同一國家：模型權重相同。','已複製比較連結']})[lang]||[];
 const data=await fetch('/data/countries.json').then(r=>r.json());
 const total=data.reduce((s,c)=>s+c.births,0),pop=data.reduce((s,c)=>s+c.pop,0);
 const a=document.querySelector('#compareA'),b=document.querySelector('#compareB'),mode=document.querySelector('#compareMode');
 const params=new URLSearchParams(location.search);for(const [el,key] of [[a,'a'],[b,'b']]){if(data.some(c=>c.id===params.get(key)))el.value=params.get(key);}
 function update(){const A=data.find(c=>c.id===a.value),B=data.find(c=>c.id===b.value);if(!A||!B)return;const population=mode.value==='population';const share=c=>(population?c.pop/pop:c.births/total)*100;
  root.querySelectorAll('[data-side]').forEach(el=>{const c=el.dataset.side==='a'?A:B;let value;switch(el.dataset.metric){case 'name':value=c.name_en;break;case 'share':value=share(c).toFixed(4)+'%';break;case 'one':value='1 / '+Math.round(100/share(c));break;case 'le':value=c.le+' years';break;case 'eys':value=c.eys==null?'Unavailable':c.eys+' years';break;case 'ppp':value=c.ppp==null?'Unavailable':'$'+c.ppp.toLocaleString();break;}el.textContent=value;});
  document.querySelector('#modeShareLabel').textContent=copy[population?1:0];document.querySelector('#modeOddsLabel').textContent=copy[population?3:2];
  const ratio=share(A)/share(B);document.querySelector('#compareAnswer').textContent=A.id===B.id?copy[4]:`${A.name_en} / ${B.name_en}: ${ratio.toFixed(2)}× in ${population?'population':'annual birth'} weight. This is a model comparison, not a personal forecast.`;
  for(const [id,c] of [['playA',A],['playB',B]]){const link=document.querySelector('#'+id);link.href=(document.documentElement.dataset.playPath||'/')+'?country='+c.id;link.textContent=({en:'Play in ',ja:'ここで遊ぶ：',ko:'이 나라에서 플레이: ','zh-TW':'在此出生：'}[document.documentElement.lang]||'Play in ')+c.name_en;}
  const url=new URL(location.href);url.searchParams.set('a',A.id);url.searchParams.set('b',B.id);history.replaceState(null,'',url.pathname+url.search);
 }
 [a,b,mode].forEach(el=>el.addEventListener('change',()=>{update();if(window.gtag)gtag('event','compare_used',{mode:mode.value});}));
 document.querySelector('#swapCountries').onclick=()=>{[a.value,b.value]=[b.value,a.value];update();};
 document.querySelector('#copyComparison').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);document.querySelector('#compareStatus').textContent=copy[5];}catch{document.querySelector('#compareStatus').textContent=location.href;}};update();
})().catch(()=>{document.querySelector('#compareStatus').textContent='Could not load interactive data. The table below remains readable. Reload to retry.';});
