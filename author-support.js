import {supportCopy,supportPrefix,coffeeIcon} from './author-support-copy.js';
const cooldownKey='1in8billion:author-invitation:v1',receiptKey='1in8billion:author-support:v1';
export function installAuthorInvitation(){
 if(document.querySelector('#authorInvitation'))return;
 const lang=document.documentElement.dataset.siteLocale||'en',c=supportCopy[lang]||supportCopy.en,href='/'+(supportPrefix[lang]||'')+'support/';
 const css=document.createElement('link');css.rel='stylesheet';css.href='/author-support.css';document.head.append(css);
 const dialog=document.createElement('dialog');dialog.id='authorInvitation';dialog.className='author-invitation-dialog';dialog.setAttribute('aria-labelledby','authorInvitationTitle');
 dialog.innerHTML=`<button class="author-close" aria-label="${c[4]}"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m6 6 12 12M18 6 6 18"/></svg></button><div class="author-cup">${coffeeIcon}</div><h2 id="authorInvitationTitle"></h2><p class="author-letter"></p><div class="author-invitation-actions"><a class="author-primary"></a><button class="author-encourage"></button></div><p class="author-response" role="status" aria-live="polite"></p><button class="author-later"></button>`;
 dialog.querySelector('h2').textContent=c[0];dialog.querySelector('.author-letter').textContent=c[1];const link=dialog.querySelector('a');link.href=href;link.textContent=c[3];dialog.querySelector('.author-encourage').textContent=c[2];dialog.querySelector('.author-later').textContent=c[4];document.body.append(dialog);
 const anchor=document.createElement('section');anchor.className='author-invitation';anchor.id='authorSupportInvitation';const title=document.createElement('h2');title.textContent=c[27];const text=document.createElement('p');text.textContent=c[24];const open=document.createElement('button');open.type='button';open.textContent=c[3];open.setAttribute('aria-haspopup','dialog');const message=document.createElement('div');message.className='author-invitation-message';message.append(title,text);const cup=document.createElement('span');cup.className='author-invitation-icon';cup.setAttribute('aria-hidden','true');cup.innerHTML=coffeeIcon;anchor.append(cup,message,open);document.querySelector('#view-end').prepend(anchor);
 let trigger=null,timer=null,automaticUsed=false,lastInteraction=0,eligible=false,acknowledged=false;
 const seenAlive=new WeakSet();let eligibleLife=null;
 function stamp(){automaticUsed=true;try{localStorage.setItem(cooldownKey,String(Date.now()));}catch{}}
 function show(){if(document.querySelector('dialog[open],.modal:not([hidden])')||STATE.view!=='end'||STATE.eduMode)return;trigger=document.activeElement;stamp();dialog.showModal();dialog.querySelector('.author-close').focus();window.siteEvent?.('author_support',{action:'invitation_open'});}
 function close(){stamp();dialog.close();trigger?.isConnected&&trigger.focus({preventScroll:true});}
 open.onclick=show;dialog.querySelector('.author-close').onclick=close;dialog.querySelector('.author-later').onclick=close;dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 dialog.querySelector('.author-encourage').onclick=event=>{if(acknowledged)return;acknowledged=true;event.currentTarget.disabled=true;event.currentTarget.textContent=c[31];dialog.querySelector('.author-response').textContent=c[5];window.siteEvent?.('author_support',{action:'encouragement'});};
 dialog.addEventListener('keydown',event=>{if(event.key!=='Escape'&&event.key!=='Tab')event.stopPropagation();});
 const observer=new IntersectionObserver(entries=>{clearTimeout(timer);if(!entries.some(entry=>entry.isIntersecting)||!eligible||automaticUsed)return;timer=setTimeout(()=>{if(eligible&&STATE.view==='end'&&document.visibilityState==='visible'&&Date.now()-lastInteraction>2000)show();},3000);},{threshold:.5});observer.observe(anchor);
 for(const event of ['pointerdown','keydown'])document.addEventListener(event,()=>{lastInteraction=Date.now();},{passive:true});
 const render=window.renderLife;window.renderLife=function(...args){const result=render(...args);if(STATE.life&&!STATE.life.died)seenAlive.add(STATE.life);return result;};
 const end=window.renderEnd;window.renderEnd=function(...args){const result=end(...args);document.querySelector('#view-end').prepend(anchor);anchor.hidden=!!STATE.eduMode;let previous=0;try{previous=Number(localStorage.getItem(cooldownKey))||0;}catch{}eligible=seenAlive.has(STATE.life)&&Date.now()-previous>7*86400000&&!STATE.eduMode&&!new URLSearchParams(location.search).has('edu');if(eligibleLife!==STATE.life){eligibleLife=STATE.life;observer.unobserve(anchor);observer.observe(anchor);}return result;};
 const setView=window.setView;window.setView=function(...args){const result=setView(...args);if(STATE.view!=='end'){clearTimeout(timer);if(dialog.open)dialog.close();}return result;};
 window.AuthorInvitation={open:show};
}

async function request(path,data){const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);try{const response=await fetch('/api/support/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:controller.signal});if(!response.ok)throw Error('request_failed');return await response.json();}finally{clearTimeout(timeout);}}
export function installSupportPage(){
 const page=document.querySelector('[data-author-support-page]');if(!page)return;
 const locale=document.documentElement.dataset.siteLocale||'en',c=supportCopy[locale]||supportCopy.en;
 if(['zh-CN','zh-TW'].includes(locale)&&page.querySelector('.support-letter h1')){const heading=page.querySelector('.support-letter h1');heading.replaceChildren();for(const phrase of c[6].split('，')){const line=document.createElement('span');line.textContent=phrase;heading.append(line);}}
 const amount=page.querySelector('#supportAmount'),submit=page.querySelector('#supportSubmit'),status=page.querySelector('#supportStatus');
 const encourage=page.querySelector('#supportEncourage');encourage.onclick=()=>{encourage.disabled=true;encourage.textContent=c[31];page.querySelector('#encouragementResponse').textContent=c[5];window.siteEvent?.('author_support',{action:'encouragement'});};
 if(amount){
  let attempt=null;
  for(const preset of page.querySelectorAll('[data-support-amount]'))preset.onclick=()=>{amount.value=preset.dataset.supportAmount;amount.dispatchEvent(new Event('input'));};
  amount.addEventListener('input',()=>{attempt=null;for(const preset of page.querySelectorAll('[data-support-amount]'))preset.setAttribute('aria-pressed',String(Number(preset.dataset.supportAmount)===Number(amount.value)));status.textContent='';});
  page.querySelector('form').onsubmit=async event=>{
   event.preventDefault();if(submit.disabled)return;
   const value=amount.value.trim().replace(',','.');if(!/^(?:0|[1-9]\d{0,5})(?:\.\d{1,2})?$/.test(value)||Number(value)<.5||Number(value)>999999.99){status.textContent=c[15];amount.setAttribute('aria-invalid','true');amount.focus();return;}
   amount.removeAttribute('aria-invalid');attempt||={requestId:crypto.randomUUID(),amount:value};const fields=[...page.querySelectorAll('form button,form input')];fields.forEach(field=>field.disabled=true);status.textContent=c[16];
   try{const checkout=await request('checkout',attempt);try{localStorage.setItem(receiptKey,JSON.stringify({...checkout,locale,createdAt:Date.now()}));}catch{throw Error('storage_unavailable');}if(!/^https:\/\/checkout\.stripe\.com\//.test(checkout.checkoutUrl))throw Error('invalid_redirect');window.siteEvent?.('author_support',{action:'checkout_open'});location.assign(checkout.checkoutUrl);}catch{status.textContent=c[17];fields.forEach(field=>field.disabled=false);}
  };
 }
 const check=page.querySelector('#supportCheck');if(check){
  let running=false;
  const verify=async()=>{if(running)return;running=true;check.disabled=true;status.textContent=c[19];try{let receipt;try{receipt=JSON.parse(localStorage.getItem(receiptKey)||'null');}catch{}if(!receipt){status.textContent=c[26];return;}const result=await request('status',{sessionId:receipt.sessionId,receipt:receipt.receipt,amount:receipt.amount});if(result.status==='paid'){page.querySelector('h1').textContent=c[18];status.textContent=c[12];check.hidden=true;page.dataset.payment='paid';}else status.textContent=['refunded','disputed'].includes(result.status)?c[25]:location.hash==='#canceled'?c[21]:c[20];}catch{status.textContent=c[20];}finally{running=false;check.disabled=false;}};
  check.onclick=verify;verify();
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installSupportPage,{once:true});else installSupportPage();
