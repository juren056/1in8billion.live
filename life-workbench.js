// Reference-led placement, using our existing controllers and recorded game facts.
const copy={
 en:['This year’s focus','Family & life','Fellow fictional lives','Life map','One square · one year','Music','Write a thought','Leave','Identity record','Life record','Memories','Details','Changing your focus can shape what happens next.','Childhood · growing at your own pace','Change focus','health','study','work','social','rest','Your story starts here.','Played years','A moment was recorded','No event recorded this year'],
 'zh-CN':['今年的重心','家人与生活','同一刻出发的人','人生地图','一格 · 一年','音乐','写下想法','离开','身份记录','人生记录','回忆','资料','调整生活的重心，看看接下来会发生什么。','童年 · 按自己的节奏慢慢长大','调整重心','健康','学习','工作','人际','休息','你的故事从这里开始。','已走过的岁月','这一年留下了故事','这一年没有记录事件'],
 'zh-TW':['今年的重心','家人與生活','同一刻出發的人','人生地圖','一格 · 一年','音樂','寫下想法','離開','身分紀錄','人生紀錄','回憶','資料','調整生活的重心，看看接下來會發生什麼。','童年 · 按自己的節奏慢慢長大','調整重心','健康','學習','工作','人際','休息','你的故事從這裡開始。','已走過的歲月','這一年留下了故事','這一年沒有記錄事件'],
 ja:['今年の重心','家族と暮らし','同じ時に始まる架空の人生','人生マップ','1マス · 1年','音楽','思いを書く','離れる','人物記録','人生の記録','思い出','資料','暮らしの重心を変えて、次の一歩を見つけましょう。','幼少期 · 自分のペースで育つ','重心を変える','健康','勉強','仕事','交流','休息','ここから物語が始まります。','歩んだ年月','記録された出来事','この年の記録はありません'],
 ko:['올해의 중심','가족과 생활','같은 순간에 시작한 가상 인생','인생 지도','한 칸 · 1년','음악','생각 쓰기','나가기','신분 기록','인생 기록','추억','자료','생활의 중심을 바꾸고 다음 이야기를 만나보세요.','어린 시절 · 나만의 속도로 성장','중심 바꾸기','건강','학습','일','교류','휴식','여기서 이야기가 시작됩니다.','지나온 세월','기록된 순간','이 해에는 기록이 없습니다'],
 es:['El enfoque de este año','Familia y vida','Otras vidas ficticias','Mapa de vida','Un cuadro · un año','Música','Escribir una reflexión','Salir','Identidad','Registro de vida','Recuerdos','Datos','Cambia tu enfoque y descubre lo que sucede después.','Infancia · crecer a tu ritmo','Cambiar enfoque','Salud','Estudios','Trabajo','Relaciones','Descanso','Tu historia empieza aquí.','Años vividos','Un momento registrado','Sin eventos registrados este año'],
 'pt-BR':['O foco deste ano','Família e vida','Outras vidas fictícias','Mapa da vida','Um quadrado · um ano','Música','Escrever uma reflexão','Sair','Identidade','Registro da vida','Memórias','Dados','Mude seu foco e descubra o que acontece depois.','Infância · crescer no seu ritmo','Mudar foco','Saúde','Estudos','Trabalho','Relações','Descanso','Sua história começa aqui.','Anos vividos','Um momento registrado','Nenhum evento registrado neste ano'],
 fr:['La priorité de cette année','Famille et vie','Autres vies fictives','Carte de vie','Une case · un an','Musique','Écrire une pensée','Quitter','Identité','Récit de vie','Souvenirs','Données','Changez de priorité et découvrez la suite.','Enfance · grandir à son rythme','Changer de priorité','Santé','Études','Travail','Relations','Repos','Votre histoire commence ici.','Années vécues','Un moment enregistré','Aucun événement enregistré cette année'],
 de:['Der Schwerpunkt dieses Jahres','Familie und Leben','Weitere fiktive Leben','Lebenskarte','Ein Feld · ein Jahr','Musik','Gedanken aufschreiben','Verlassen','Identität','Lebensgeschichte','Erinnerungen','Daten','Ändere deinen Schwerpunkt und entdecke, was folgt.','Kindheit · im eigenen Tempo wachsen','Schwerpunkt ändern','Gesundheit','Lernen','Arbeit','Beziehungen','Ruhe','Hier beginnt deine Geschichte.','Gelebte Jahre','Ein aufgezeichneter Moment','Kein Ereignis in diesem Jahr aufgezeichnet'],
 ru:['Главное в этом году','Семья и жизнь','Другие вымышленные жизни','Карта жизни','Одна клетка · один год','Музыка','Записать мысль','Выйти','Личность','История жизни','Воспоминания','Данные','Измените приоритет и узнайте, что произойдёт дальше.','Детство · расти в своём темпе','Изменить приоритет','Здоровье','Учёба','Работа','Общение','Отдых','Здесь начинается ваша история.','Прожитые годы','Записанный момент','За этот год событий не записано'],
};
const icon=path=>`<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`;
export function installLifeWorkbench({view,layout,story,left,rail,summary,tabs,controls,settings,secondary,more,speed,c}){
 const locale=document.documentElement.dataset.siteLocale||'en',s=copy[locale]||copy.en;
 const masthead=document.createElement('div');masthead.className='workbench-masthead';
 const home=document.createElement('a');home.className='workbench-home';home.href=document.querySelector('.topbar .brand')?.href||'/';home.textContent='1in8billion.live';
 const clock=document.createElement('div');clock.className='workbench-clock';clock.dataset.clarityMask='true';
 const age=document.createElement('strong'),date=document.createElement('span'),progress=document.createElement('div');progress.className='workbench-time';const fill=document.createElement('i');progress.append(fill);clock.append(age,date,progress);
 view.prepend(masthead);masthead.append(home,clock,controls);summary.classList.add('workbench-mobile-summary');masthead.after(summary);
 const scene=story.querySelector('.simulator-scene');if(scene){scene.open=true;scene.dataset.initiallyOpen='true';story.prepend(scene);}
 const sceneLocation=document.createElement('p');sceneLocation.className='workbench-scene-caption';scene?.append(sceneLocation);
 const focus=document.createElement('section');focus.className='workbench-focus';
 const focusTitle=document.createElement('h3');focusTitle.textContent=s[0];const focusValue=document.createElement('strong'),focusText=document.createElement('p');focusText.textContent=s[12];
 const focusAction=document.createElement('button');focusAction.type='button';focusAction.textContent=s[14];focusAction.onclick=()=>document.querySelector('#mdFocusBtn')?.click();focus.append(focusTitle,focusValue,focusText,focusAction);if(scene)scene.after(focus);else story.prepend(focus);
 const metadata=left.querySelector('.cert-meta'),certBody=document.querySelector('#lifeCert .cert-body');if(metadata&&certBody)certBody.append(metadata);
 const originRows=[];for(const key of ['income','religion']){const row=document.createElement('div');row.className='meta-row';const label=document.createElement('span'),value=document.createElement('b');row.append(label,value);metadata?.append(row);originRows.push({key,label,value});}
 const certTitle=document.createElement('span');certTitle.className='workbench-identity-title';certTitle.textContent=s[8];document.querySelector('#lifeCertBand')?.prepend(certTitle);
 const side=document.createElement('section');side.className='workbench-companions';side.dataset.clarityMask='true';
 const companionTitle=document.createElement('h3');companionTitle.textContent=s[2];const companionList=document.createElement('div');side.append(companionTitle,companionList);rail.append(side);
 const map=document.createElement('section');map.className='workbench-map';const mapHeader=document.createElement('div'),mapTitle=document.createElement('h3'),mapHint=document.createElement('small');mapTitle.textContent=s[3];mapHint.textContent=s[4];mapHeader.append(mapTitle,mapHint);const years=document.createElement('div');years.className='workbench-years';years.setAttribute('aria-label',s[3]);const mapCaption=document.createElement('p');mapCaption.className='workbench-map-caption';mapCaption.textContent=s[21];map.append(mapHeader,years,mapCaption);rail.append(map);
 // The old map projected unrecorded happiness. The new map shows elapsed years only.
 document.querySelector('#lifeMap')?.setAttribute('hidden','');
 const survival=document.querySelector('#lifeSurvivalCurve');if(survival)rail.append(survival);
 const actions=document.createElement('div');actions.className='workbench-actions';
 const rates=document.createElement('div');rates.className='workbench-rates';rates.setAttribute('role','group');rates.setAttribute('aria-label',speed.querySelector('summary').title||c[8]);
 for(const value of [1,2,4,8,12,16]){const button=document.createElement('button');button.type='button';button.dataset.workbenchRate=value;button.textContent=value+'×';button.onclick=()=>{window.Playback.pace(5000);window.setSpeed(value);window.SimulatorShell?.sync();};rates.append(button);}
 const paceOptions=speed.querySelector('.speed-options');paceOptions.querySelectorAll('[data-pace="1000"],[data-pace="500"]').forEach(button=>button.remove());
 for(const value of [4,8,12,16]){const button=document.createElement('button');button.type='button';button.dataset.workbenchMultiplier=value;button.textContent=value+'×';button.onclick=()=>{window.Playback.pace(5000);window.setSpeed(value);speed.open=false;};paceOptions.insertBefore(button,paceOptions.querySelector('[data-pace="0"]'));}
 const make=(label,path,handler)=>{const button=document.createElement('button');button.type='button';button.innerHTML=icon(path);const text=document.createElement('span');text.textContent=label;button.append(text);button.onclick=handler;return button;};
 const music=make(s[5],'M9 18V5l11-2v13M9 8l11-2M9 18c0 2-5 3-5 0s5-3 5 0M20 16c0 2-5 3-5 0s5-3 5 0',()=>{more.click();const sound=settings.querySelector('.life-sound');if(sound){sound.open=true;sound.scrollIntoView({block:'nearest'});sound.querySelector('button')?.focus();}});
 const note=document.querySelector('#writeMemory');if(note)note.textContent=s[6];
 const appearance=document.querySelector('.appearance-menu');
 const appearanceHome=appearance?.parentNode,appearanceNext=appearance?.nextSibling;
 const exit=make(s[7],'M10 5H4v14h6M14 8l4 4-4 4M9 12h9',()=>{window.stopTicker?.();STATE.paused=true;window.saveCurrentLife?.();window.setView('intro');window.scrollTo({top:0});});
 actions.append(rates);controls.insertBefore(actions,more);
 const shortcuts=document.createElement('div');shortcuts.className='workbench-settings-nav';
 for(const [panel,label]of [['memories',s[10]],['details',s[11]],['story',c[0]]]){const button=document.createElement('button');button.type='button';button.textContent=label;button.onclick=()=>{settings.close();window.SimulatorShell.selectPanel(panel,true);};shortcuts.append(button);}settings.append(shortcuts);
 const wide=matchMedia('(min-width:1200px)');
 let placement='';
 function place(){
  const mode=STATE.view==='life'?(wide.matches?'wide':'compact'):'away';if(mode===placement)return;placement=mode;
  if(mode==='away'){if(appearance&&appearanceHome)appearanceHome.insertBefore(appearance,appearanceNext?.parentNode===appearanceHome?appearanceNext:null);return;}
  if(mode==='wide'){actions.append(secondary,music);settings.append(speed);if(note)actions.append(note);if(appearance)actions.append(appearance);actions.append(exit);}
  else{settings.insertBefore(secondary,settings.querySelector('.life-sound'));document.querySelector('#lifeCommandBar').append(speed);if(note)settings.append(note);if(appearance)settings.append(appearance);settings.append(exit);music.remove();}
 }
 wide.addEventListener('change',place);place();
 let lastCompanions='',lastMap='',currentLife;
 const openYear=event=>{const year=Number(event.target.closest('[data-recorded-year]')?.dataset.recordedYear);if(!Number.isFinite(year))return;const row=STATE.life?.log?.findLast(e=>e.age===year);if(row)window.openStoryMoment(STATE.life,row);};years.onclick=openYear;
 function sync(life){
  place();
  if(currentLife!==life){currentLife=life;lastMap='';lastCompanions='';}
  age.textContent=document.querySelector('#lifeAge')?.textContent||String(life.age);date.textContent=CalendarCore.at(life,life.age)+' · '+(life.name?.full||'');
  sceneLocation.textContent=document.querySelector('#lifeCountryInfo')?.textContent||window.localize(life.countryData).name;
  // Elapsed year only; this is not a prediction of remaining life.
  fill.style.width=Math.min(100,life.age)+'%';
  for(const button of rates.children)button.setAttribute('aria-pressed',String(!STATE.stepMode&&Number(button.dataset.workbenchRate)===5000*STATE.speed/STATE.tickMs));
  for(const button of paceOptions.querySelectorAll('[data-workbench-multiplier]'))button.setAttribute('aria-pressed',String(!STATE.stepMode&&Number(button.dataset.workbenchMultiplier)===5000*STATE.speed/STATE.tickMs));
  const heading=rail.querySelector('.story-family h3');if(heading)heading.textContent=s[1];
  for(const row of originRows){const label=window.t?.('intro.bc.'+row.key)||row.key;row.label.textContent=window.translateUI?.(label)||label;row.value.textContent=row.key==='income'?(life.stats.incomeQuartile?'Q'+life.stats.incomeQuartile+'/4':'—'):(window.translateUI?.(life.stats.religion)||life.stats.religion||'—');}
  const reference=document.querySelector('#lifeCert .reference-details');if(reference){if(!reference.dataset.workbenchReference){reference.dataset.workbenchReference='true';reference.dataset.initiallyOpen='false';reference.open=false;}reference.querySelector('summary').textContent=(document.querySelector('#lifeCert .cert-le')?.textContent||s[11])+': '+(document.querySelector('#lifeLe')?.textContent||'—');}
  const feedHeading=document.querySelector('#lifeEventsFeed>h3');if(feedHeading)feedHeading.textContent=s[9];
  const focusNames={health:s[15],study:s[16],education:s[16],work:s[17],social:s[18],family:s[18],rest:s[19]};
  focusValue.textContent=life.focus?(focusNames[life.focus]||window.translateUI?.(life.focus)||life.focus):life.age<6?s[13]:s[12];
  focusText.hidden=!life.focus;focusAction.disabled=!!life.storyPending||!!window.Playback.waiting()||life.died;focusAction.hidden=life.age<6;
  const companionSignature=(life.companions||[]).map(p=>[p.name,p.country,p.sex].join('|')).join(';');
  if(companionSignature!==lastCompanions){lastCompanions=companionSignature;companionList.replaceChildren();for(const person of (life.companions||[]).slice(0,4)){const row=document.createElement('div');row.className='workbench-companion';const name=document.createElement('strong');name.textContent=typeof person.name==='string'?person.name:person.name?.full||'—';const country=document.createElement('span');country.textContent=person.countryData?window.localize(person.countryData).name:person.country||'—';row.append(name,country);companionList.append(row);}}side.hidden=!companionList.childElementCount;
  const signature=life.age+':'+life.log.length;
  if(signature!==lastMap){lastMap=signature;const recorded=new Set(life.log.map(e=>e.age));years.replaceChildren();for(let year=0;year<Math.max(100,life.age+1);year++){const cell=document.createElement(recorded.has(year)?'button':'span');cell.className='workbench-year';cell.dataset.elapsed=String(year<=life.age);cell.dataset.current=String(year===life.age);cell.title=year+' · '+(recorded.has(year)?s[22]:s[23]);if(recorded.has(year)){cell.type='button';cell.dataset.recordedYear=year;cell.setAttribute('aria-label',cell.title);}years.append(cell);}mapCaption.textContent=s[21]+' · '+life.age;}
 }
 return{sync};
}
