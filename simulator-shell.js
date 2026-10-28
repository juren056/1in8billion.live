import { installLifeWorkbench } from './life-workbench.js';
// The shell owns placement; existing controllers still own the life and its controls.
const labels = {
  en:['Story','People','Memories','Details','Settings','Close','Keep a moment from your story to find it here.','Latest story','Life settings','Choose','More','Current scene'],
  'zh-CN':['故事','人物','回忆','资料','设置','关闭','珍藏故事中的一个瞬间，它会留在这里。','最新故事','人生设置','作出选择','更多','此刻的场景'],
  'zh-TW':['故事','人物','回憶','資料','設定','關閉','珍藏故事中的一個瞬間，它會留在這裡。','最新故事','人生設定','作出選擇','更多','此刻的場景'],
  ja:['物語','人物','思い出','資料','設定','閉じる','物語のひとときを保存すると、ここに残ります。','最新の物語','人生の設定','選択する','その他','今の風景'],
  ko:['이야기','인물','추억','자료','설정','닫기','이야기의 한순간을 간직하면 여기에 남습니다.','최신 이야기','인생 설정','선택하기','더 보기','지금의 풍경'],
  es:['Historia','Personas','Recuerdos','Datos','Ajustes','Cerrar','Guarda un momento de tu historia para encontrarlo aquí.','Historia reciente','Ajustes de vida','Elegir','Más','Escena actual'],
  'pt-BR':['História','Pessoas','Memórias','Dados','Ajustes','Fechar','Guarde um momento da sua história para encontrá-lo aqui.','História recente','Ajustes da vida','Escolher','Mais','Cena atual'],
  fr:['Histoire','Personnes','Souvenirs','Données','Réglages','Fermer','Gardez un moment de votre histoire pour le retrouver ici.','Dernier récit','Réglages de la vie','Choisir','Plus','Scène actuelle'],
  de:['Geschichte','Personen','Erinnerungen','Daten','Einstellungen','Schließen','Bewahre einen Moment deiner Geschichte, um ihn hier wiederzufinden.','Neueste Geschichte','Lebenseinstellungen','Entscheiden','Mehr','Aktuelle Szene'],
  ru:['История','Люди','Воспоминания','Данные','Настройки','Закрыть','Сохраните момент своей истории, чтобы найти его здесь.','Последняя история','Настройки жизни','Сделать выбор','Ещё','Текущая сцена'],
};
const help={
  en:'Pause or continue with the bottom button. Time waits for your choices. Open More for automatic choices and music.',
  'zh-CN':'底部按钮可暂停或继续。遇到选择时，时间会等待你回答；打开“更多”可设置自动选择和音乐。',
  'zh-TW':'底部按鈕可暫停或繼續。遇到選擇時，時間會等待你回答；打開「更多」可設定自動選擇和音樂。',
  ja:'下のボタンで一時停止・再開できます。選択中は時間が止まります。「その他」から自動選択と音楽を設定できます。',
  ko:'아래 버튼으로 일시 정지하거나 계속하세요. 선택할 때는 시간이 멈춥니다. 더 보기에서 자동 선택과 음악을 설정하세요.',
  es:'Pausa o continúa con el botón inferior. El tiempo espera tus decisiones. Abre Más para elegir automáticamente y ajustar la música.',
  'pt-BR':'Pause ou continue pelo botão inferior. O tempo espera suas escolhas. Abra Mais para escolhas automáticas e música.',
  fr:'Mettez en pause ou reprenez avec le bouton du bas. Le temps attend vos choix. Ouvrez Plus pour les choix automatiques et la musique.',
  de:'Mit der unteren Taste pausieren oder fortsetzen. Die Zeit wartet auf deine Wahl. Unter Mehr findest du automatische Entscheidungen und Musik.',
  ru:'Нижняя кнопка ставит жизнь на паузу или продолжает её. Время ждёт вашего выбора. В разделе «Ещё» — автоматический выбор и музыка.',
};

export function installSimulatorShell(){
  if(window.SimulatorShell)return;
  const root=document.documentElement,view=document.querySelector('#view-life');
  const layout=view?.querySelector('.story-workspace'),story=layout?.querySelector('.life-play-story');
  if(!story)return;
  const c=labels[root.dataset.siteLocale]||labels.en;
  const left=layout.querySelector('.story-identity'),rail=layout.querySelector('.story-rail');
  const controls=rail.querySelector('.story-controls'),bar=document.querySelector('#lifeCommandBar');
  const css=document.createElement('link');css.rel='stylesheet';css.href='/simulator-shell.css';document.head.append(css);
  root.dataset.simulatorShell='true';view.dataset.panel='story';
  const summary=document.createElement('header');summary.className='simulator-summary';summary.dataset.clarityMask='true';
  const portrait=document.createElement('canvas');portrait.width=80;portrait.height=80;portrait.className='simulator-avatar';portrait.setAttribute('aria-hidden','true');
  const live=story.querySelector('.story-live');summary.append(portrait,live);
  const tabs=document.createElement('nav');tabs.className='simulator-tabs';tabs.setAttribute('aria-label',c[8]);
  const panels=['story','people','memories','details'];
  for(const [i,panel]of panels.entries()){
    const button=document.createElement('button');button.type='button';button.dataset.simulatorPanel=panel;button.textContent=c[i];button.setAttribute('aria-pressed',String(i===0));
    button.onclick=()=>selectPanel(panel,true);tabs.append(button);
  }
  const memories=document.createElement('section');memories.id='simulatorMemories';memories.className='simulator-memories';memories.dataset.clarityMask='true';
  const details=document.querySelector('#lifeSecondary');details.open=true;
  const scene=document.querySelector('#warmLifeScene');
  if(scene){const disclosure=document.createElement('details');disclosure.className='simulator-scene';disclosure.dataset.initiallyOpen='false';const title=document.createElement('summary');title.textContent=c[11];disclosure.append(title,scene);story.append(disclosure);}
  const settings=document.createElement('dialog');settings.id='simulatorSettings';settings.className='simulator-settings';settings.dataset.clarityMask='true';settings.setAttribute('aria-labelledby','simulatorSettingsTitle');
  const settingsTitle=document.createElement('h2');settingsTitle.id='simulatorSettingsTitle';settingsTitle.textContent=c[8];
  const close=document.createElement('button');close.type='button';close.className='simulator-settings-close';close.textContent=c[5];close.onclick=()=>settings.close();
  settings.append(close,settingsTitle);document.body.append(settings);
  const guide=document.querySelector('#playbackGuide');if(guide){guide.textContent=help[root.dataset.siteLocale]||help.en;settings.append(guide);}
  const secondary=bar.querySelector('.playback-secondary'),speed=bar.querySelector('.speed-menu'),sound=controls.querySelector('.life-sound');
  if(secondary)settings.append(secondary);
  if(sound){sound.open=false;settings.append(sound);}
  const manual=document.querySelector('#lifeManualDecisions');if(manual)settings.append(manual);
  const tools=document.createElement('div');tools.className='simulator-tool-links';const toolButtons=[];
  for(const original of document.querySelectorAll('.game-tools button')){
    if(original.dataset.view==='life')continue;
    const button=document.createElement('button');button.type='button';button.textContent=original.textContent;
    button.onclick=()=>{settings.close();original.click();};tools.append(button);toolButtons.push([button,original]);
  }
  settings.append(tools);
  controls.querySelector('.dock-toggle')?.remove();controls.classList.add('simulator-toolbar');
  const choiceButton=document.createElement('button');choiceButton.type='button';choiceButton.id='simulatorChoose';choiceButton.textContent=c[9];choiceButton.hidden=true;
  choiceButton.onclick=()=>{selectPanel('story');const trigger=document.querySelector('#storyPendingNotice button');if(STATE.life?.storyPending)trigger?.click();else{const finance=document.querySelector('#pendingChoice');finance.hidden=false;finance.scrollIntoView({block:'center'});finance.querySelector('button')?.focus({preventScroll:true});}};
  const more=document.createElement('button');more.type='button';more.className='simulator-more';more.textContent=c[10];more.setAttribute('aria-haspopup','dialog');more.setAttribute('aria-controls',settings.id);
  let pausedBeforeSettings=true;
  more.onclick=()=>{pausedBeforeSettings=STATE.paused;STATE.paused=true;window.stopTicker?.();window.Playback?.sync();settings.showModal();close.focus();};
  settings.addEventListener('close',()=>{if(STATE.view==='life'&&!STATE.life?.storyPending&&!window.Playback?.waiting()){STATE.paused=pausedBeforeSettings;window.startTicker?.();}sync();more.focus({preventScroll:true});});
  settings.addEventListener('click',event=>{if(event.target.closest('#mdFocusBtn,#mdSpendBtn,#mdQuickDecideBtn,#mdFinanceBtn')){pausedBeforeSettings=true;settings.close();}},true);
  settings.addEventListener('keydown',event=>{if(event.key!=='Escape'&&event.key!=='Tab'&&!event.ctrlKey&&!event.metaKey)event.stopPropagation();});
  const primary=bar.querySelector('.cert-controls');primary.append(choiceButton);if(speed)bar.append(speed);controls.append(more);
  const latest=document.createElement('button');latest.type='button';latest.className='simulator-latest';latest.textContent=c[7];latest.hidden=true;
  latest.onclick=()=>{selectPanel('story');document.querySelector('#lifeEventsFeed')?.scrollIntoView({block:'start',behavior:'instant'});latest.hidden=true;};
  view.querySelector('.workspace-title')?.remove();view.prepend(summary,tabs,controls);view.append(memories,latest);
  const workbench=installLifeWorkbench({view,layout,story,left,rail,summary,tabs,controls,settings,secondary,more,speed,c});
  let currentLife=null,memorySignature='';
  function selectPanel(panel,scroll=false){
    view.dataset.panel=panel;
    for(const button of tabs.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.simulatorPanel===panel));
    latest.hidden=true;
    if(panel!=='story'&&STATE.life&&!STATE.life.died){STATE.paused=true;window.stopTicker?.();window.Playback?.sync();}
    if(scroll)tabs.scrollIntoView({block:'start',behavior:'instant'});
    sync();
  }
  function sync(){
    root.dataset.simulatorView=STATE.view;
    const life=STATE.life;if(!life)return;
    for(const [button,original]of toolButtons)button.disabled=original.disabled;
    const feed=document.querySelector('#lifeEventsFeed'),rect=feed?.getBoundingClientRect();
    if(STATE.view==='life'&&life.log?.some(event=>event.age>0)&&rect&&rect.top<innerHeight-80&&rect.bottom>100)window.Retention?.event('first_event_visible');
    if(currentLife!==life){currentLife=life;view.dataset.panel='story';memorySignature='';for(const button of tabs.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.simulatorPanel==='story'));}
    const source=document.querySelector('#lifePortrait canvas');if(source)portrait.getContext('2d').drawImage(source,0,0,80,80);
    const name=live.querySelector('strong');if(name)name.textContent=`${life.name?.full||''} · ${window.localize(life.countryData).name} · ${window.StoryEngine.text('ui.age')} ${life.age}`;
    const waiting=!!life.storyPending||!!window.Playback?.waiting();choiceButton.hidden=!waiting;
    const pause=document.querySelector('#btnPause');pause.hidden=waiting||!!STATE.stepMode;
    more.setAttribute('aria-expanded',String(settings.open));
    const pace=speed?.querySelector('summary');if(pace){pace.title=pace.textContent;pace.textContent=STATE.stepMode?document.querySelector('#nextYear')?.textContent||'1×':`${+(5000*STATE.speed/STATE.tickMs).toFixed(2)}×`;}
    const step=document.querySelector('#nextYear');if(step)step.hidden=!STATE.stepMode||waiting;
    const kept=(life.log||[]).filter(event=>event.starred),signature=kept.map(event=>(life.log||[]).indexOf(event)).join(',');
    if(signature!==memorySignature||!memories.childElementCount){
      memorySignature=signature;memories.replaceChildren();const title=document.createElement('h2');title.textContent=c[2];memories.append(title);
      if(!kept.length){const empty=document.createElement('p');empty.className='simulator-empty';empty.textContent=c[6];memories.append(empty);}
      for(const event of kept){const item=document.createElement('button');item.type='button';item.className='simulator-memory';const age=document.createElement('span');age.textContent=CalendarCore.at(life,event.age);const text=document.createElement('strong');text.textContent=window.storyEventText(event,life);item.append(age,text);item.onclick=()=>window.openStoryMoment(life,event);memories.append(item);}
    }
    layout.hidden=view.dataset.panel==='memories'||view.dataset.panel==='details';memories.hidden=view.dataset.panel!=='memories';details.hidden=view.dataset.panel!=='details';
    const originalNotice=document.querySelector('#returnPendingChoice');if(originalNotice)originalNotice.hidden=true;
    workbench.sync(life);
    if(STATE.view!=='life'&&settings.open)settings.close();
  }
  const oldRender=window.renderLife;window.renderLife=function(...args){const result=oldRender(...args);sync();return result;};
  const oldView=window.setView;window.setView=function(...args){const result=oldView(...args);sync();if(STATE.view==='life')requestAnimationFrame(()=>summary.scrollIntoView({block:'start',behavior:'instant'}));return result;};
  const oldSync=window.Playback.sync;window.Playback.sync=function(...args){const result=oldSync(...args);sync();return result;};
  document.addEventListener('click',event=>{if(event.target.closest('#btnPause,#btnAuto,[data-pace],#nextYear'))requestAnimationFrame(sync);});
  window.SimulatorShell={left,rail,controls,live,latest,sync,selectPanel};sync();
}
