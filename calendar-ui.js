/* All calendar surfaces share the frozen life month, never the wall clock. */
(function(){
 const c=CalendarCopy[document.documentElement.dataset.siteLocale||document.documentElement.lang]||CalendarCopy.en;
 function sync(){for(const b of document.querySelectorAll('[data-era="now"]')){b.removeAttribute('data-t');b.textContent=c.now+' · '+CalendarCore.currentMonth();}
  for(const el of document.querySelectorAll('[data-current-month]'))el.textContent=CalendarCore.currentMonth();
  if(typeof STATE==='undefined'||!STATE.life)return;const life=STATE.life;
  for(const id of ['lifeYear']){const el=document.getElementById(id);if(el)el.textContent=CalendarCore.at(life,life.age);}
  const end=document.getElementById('endYears');if(end)end.textContent=CalendarCore.range(life);
  const bar=document.getElementById('lifeCommandBar');if(bar){let note=document.getElementById('calendarArchiveNote');if(!note){note=document.createElement('p');note.id='calendarArchiveNote';note.className='muted';bar.append(note);}note.hidden=!!life.calendarMonth||['past','future'].includes(life.replayV1?.era||STATE.era);note.textContent=c.legacy;}
 }
 const birth=window.buildBirthCertCard;if(birth)window.buildBirthCertCard=function(country,life){return birth(country,life)+`<p class="muted calendar-record">${c.birth}: ${CalendarCore.at(life)}${life.calendarMonth?'':' · '+c.legacy}</p>`;};
 const render=window.renderAll;if(render)window.renderAll=function(...args){const r=render(...args);sync();return r;};
 window.addEventListener('focus',sync);document.addEventListener('visibilitychange',sync);setInterval(sync,30000);sync();
})();
