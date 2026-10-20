import {currentCopy,countryStatLabels,panelLabels} from './task-copy.js';
const $=s=>document.querySelector(s);
export function readingNavigation(root=document.querySelector('main')){
 if(!root||root.querySelector('.reading-navigation')||root.querySelector('#view-intro'))return;
 const headings=[...root.querySelectorAll(':scope>section>h2,:scope>h2')].slice(0,9);if(headings.length<2)return;
 const nav=document.createElement('nav');nav.className='reading-navigation';nav.setAttribute('aria-label',currentCopy().contents);
 const title=document.createElement('strong');title.textContent=currentCopy().contents;nav.append(title);
 headings.forEach((h,i)=>{h.id||='reading-section-'+i;const a=document.createElement('a');a.href='#'+h.id;a.textContent=h.textContent;nav.append(a);});
 const first=root.querySelector(':scope>.experience-hero,:scope>h1,:scope>section');first?first.after(nav):root.prepend(nav);
}
readingNavigation();
export function installTaskUI(){
 const c=currentCopy(),lang=document.documentElement.dataset.siteLocale||document.documentElement.lang;
 const seenEvents=new WeakSet();let eventInView=false;
 const markEvent=()=>{const life=STATE.life;if(eventInView&&!document.hidden&&life?.latestEvent?.age>0&&!seenEvents.has(life)){seenEvents.add(life);window.Retention.event('first_event_visible');}};
 new IntersectionObserver(entries=>{eventInView=entries[0].isIntersecting;markEvent();},{threshold:.5}).observe($('#lifeThisYear'));
 const guide=document.createElement('p');guide.id='playbackGuide';guide.className='task-guide';guide.textContent=c.guide;$('#playbackIdentity').after(guide);
 const optional=document.createElement('p');optional.id='optionalChoiceHelp';optional.className='task-help';optional.textContent=c.optional;$('#lifeManualDecisions').append(optional);
 const note=document.createElement('p');note.className='population-unit-note';note.textContent=c.populationNote;
 const stats=$('#lifeCountryStats');stats.after(note);
 const oldBirth=window.buildBirthCertCard;window.buildBirthCertCard=function(country,life){
  const template=document.createElement('template');template.innerHTML=oldBirth(country,life);
  const quartile=template.content.querySelectorAll('.birth-story>p')[1];if(quartile)quartile.textContent=c.quartile.replace('{n}',Number.isFinite(life.stats?.incomeQuartile)?life.stats.incomeQuartile:'—');
  const estimate=template.content.querySelector('.birth-record .muted');if(estimate)estimate.textContent=c.estimate;
  template.content.querySelectorAll('h2').forEach(h=>h.dataset.noTranslate='');return template.innerHTML;
 };
 const modal=$('#birthCertModal'),card=modal.querySelector('.bc-card');modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');card.querySelector('.bc-actions').classList.add('birth-card-actions');
 let opener,inert=[];new MutationObserver(()=>{if(!modal.hidden){opener=document.activeElement;inert=[...document.body.children].filter(el=>el!==modal&&!['SCRIPT','STYLE','LINK'].includes(el.tagName)).map(el=>[el,el.inert]);for(const[el]of inert)el.inert=true;}else{for(const[el,value]of inert)el.inert=value;inert=[];if(STATE.view==='intro')opener?.focus({preventScroll:true});}}).observe(modal,{attributes:true,attributeFilter:['hidden']});
 document.addEventListener('keydown',e=>{if(modal.hidden)return;if(e.key==='Escape'){e.preventDefault();$('#birthCertCancel').click();}if(e.key==='Tab'){const controls=[...modal.querySelectorAll('button,a[href],input,select')].filter(el=>!el.disabled&&el.getClientRects().length),i=controls.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();controls.at(-1)?.focus();}else if(!e.shiftKey&&i===controls.length-1){e.preventDefault();controls[0]?.focus();}}});
 const localizeOptions=()=>{for(const option of $('#countrySelect').options){const country=COUNTRIES.find(row=>row.id===option.value);if(country)option.textContent=country.flag+' '+localize(country).name;}};localizeOptions();new MutationObserver(localizeOptions).observe($('#countrySelect'),{childList:true});
 const sync=()=>{
  const era=$('[data-t="intro.era"]');if(era)era.textContent=(CalendarCopy[document.documentElement.dataset.siteLocale]||CalendarCopy.en).title;
  const duration=$('[data-t="intro.duration"]');if(duration)duration.textContent=window.translateUI?.('Pace')||'Pace';
  for(const[era,year]of[['past',1990],['future',2080]])for(const button of document.querySelectorAll('[data-era="'+era+'"]'))if(!button.textContent.includes(String(year)))button.textContent+=' · '+year;
  const bar=$('.cert-bar-wrap');bar.classList.add('reference-values');bar.setAttribute('aria-label',c.progress);
  $('#lifeBarPct').hidden=true;$('.cert-bar-track').hidden=true;
  for(const el of [$('#lifeAge'),$('#lifeBarNow')])if(STATE.life)el.textContent=STATE.life.age+' '+c.years;
  if(STATE.life)$('#lifeBarEnd').textContent=STATE.life.countryData.le+' '+c.years;
  const summary=$('.speed-menu summary');if(summary&&!STATE.stepMode)summary.textContent=(window.translateUI?.('Pace')||'Pace')+' · '+Number((STATE.tickMs/STATE.speed/1000).toFixed(3))+' '+c.paceUnit;
  if(STATE.life){const rows=[...stats.querySelectorAll('tbody tr')];rows.forEach((row,i)=>{row.querySelector('td').textContent=(countryStatLabels[lang]||countryStatLabels.en)[i];});const comparisonLabels=[2,3,4,8];document.querySelectorAll('#lifeActualVsRandom .ar-k').forEach((el,i)=>{const icon=el.textContent.match(/[🟢🔴⚪]/u)?.[0]||'';el.textContent=(countryStatLabels[lang]||countryStatLabels.en)[comparisonLabels[i]]+' '+icon;});const title=stats.querySelector('h4');if(title)title.textContent=STATE.life.countryData.flag+' '+localize(STATE.life.countryData).name;const source=stats.querySelector('.cs-source');if(source)source.textContent=c.populationNote;}
  const panels=panelLabels[lang]||panelLabels.en;
  ['#lifeStats','#lifeFamilyDetail','#lifeCompanions','#lifeSurvivalCurve','#lifeTrajectory','#lifeMap','#lifeIdentityRecord','#lifeScene'].forEach((selector,i)=>{const h=$(selector+' h4');if(!h)return;const help=h.querySelector('button');h.replaceChildren(document.createTextNode(panels[i]+' '));if(help)h.append(help);});
  for(const selector of ['#lifeSurvivalCurve>p.muted','#lifeMap>p.muted']){const el=$(selector);if(el)el.textContent=selector.includes('lifeMap')?panels[11]:panels[8];}
  for(const el of document.querySelectorAll('#lifeSurvivalCurve svg text,#lifeTrajectory svg text')){if(['Age','年齡'].includes(el.textContent))el.textContent=panels[9];if(/World avg|世界平均/.test(el.textContent))el.textContent=panels[10];}
  document.querySelectorAll('#lifeCompanions .lc-meta').forEach((el,i)=>{const companion=STATE.life?.companions?.[i];const country=companion?.countryData||countryById(companion?.country);if(country)el.textContent=localize(country).name+' · '+companion.sex+' · '+companion.lifeExpectancy+' '+c.years;});
  markEvent();
 };
 const speedMenu=$('.speed-menu');speedMenu.addEventListener('toggle',()=>{if(!speedMenu.open)return;const panel=speedMenu.querySelector('.speed-options');panel.style.left='0px';const r=panel.getBoundingClientRect();panel.style.left=(r.right>innerWidth-12?innerWidth-12-r.right:r.left<12?12-r.left:0)+'px';});
 const oldRender=window.renderLife;window.renderLife=function(...args){const out=oldRender(...args);sync();return out;};
 sync();readingNavigation($('#view-intro'));
}
