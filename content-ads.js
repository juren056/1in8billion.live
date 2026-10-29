import{contentAdsCopy}from'./content-ads-copy.js';
const slot=document.querySelector('[data-content-ad]');
if(slot){
 const c=contentAdsCopy(document.documentElement.dataset.siteLocale||document.documentElement.lang),key='1in8billion:advertising-choice:v1';
 let visible=false,policy=null,requested=false,stored=null,ready=false,submitted=false;
 try{stored=JSON.parse(localStorage.getItem(key)||'null');if(!stored||!['allow','deny'].includes(stored.value)||!Number.isFinite(stored.at)||stored.at>Date.now()||Date.now()-stored.at>180*86400000)stored=null;}catch{}
 const controls=document.createElement('div');controls.className='ad-controls';controls.hidden=true;
 const preferences=document.createElement('button');preferences.type='button';preferences.textContent=c.preferences;controls.append(preferences);slot.after(controls);
 const remember=value=>{stored={value,at:Date.now()};try{localStorage.setItem(key,JSON.stringify(stored));}catch{}};
 function disable(){slot.hidden=true;controls.hidden=true;}
 function choice(){
  if(!policy?.allowed)return;slot.hidden=false;slot.replaceChildren();
  const panel=document.createElement('div');panel.className='ad-permission';
  const title=document.createElement('h2');title.textContent=c.title;const text=document.createElement('p');text.textContent=c.body;
  const actions=document.createElement('div');actions.className='ad-permission-actions';const allow=document.createElement('button'),decline=document.createElement('button');allow.type=decline.type='button';allow.textContent=c.allow;decline.textContent=c.decline;
  allow.onclick=()=>{remember('allow');render();};decline.onclick=()=>{remember('deny');slot.hidden=true;};
  const privacy=document.createElement('a');privacy.href='/privacy/#google-advertising';privacy.textContent=c.privacy;actions.append(allow,decline);panel.append(title,text,actions,privacy);slot.append(panel);controls.hidden=false;
 }
 function submit(){if(ready&&!submitted&&visible&&document.visibilityState==='visible'&&stored?.value==='allow'){submitted=true;try{window.adsbygoogle.requestNonPersonalizedAds=1;window.adsbygoogle.push({});}catch{slot.hidden=true;}}}
 function render(){
  if(!policy?.allowed||!visible||document.visibilityState!=='visible')return;
  if(requested){submit();return;}
  if(stored?.value==='deny'){slot.hidden=true;controls.hidden=false;return;}
  if(stored?.value!=='allow'){choice();return;}
  requested=true;slot.hidden=false;controls.hidden=false;slot.replaceChildren();
  const label=document.createElement('p');label.className='content-ad-label';label.textContent=c.label;
  const ad=document.createElement('ins');ad.className='adsbygoogle';ad.style.display='block';ad.dataset.adClient=slot.dataset.publisher;ad.dataset.adSlot=slot.dataset.slot;ad.dataset.restrictDataProcessing='1';
  slot.append(label,ad);preferences.textContent=c.withdraw;
  // Only neutral public articles reach this loader; no game state or targeting fields are read.
  const queue=window.adsbygoogle=window.adsbygoogle||[];queue.requestNonPersonalizedAds=1;
  const script=document.createElement('script');script.async=true;script.crossOrigin='anonymous';script.dataset.privacyTreatments='disablePersonalization';script.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+encodeURIComponent(slot.dataset.publisher);
  const failed=()=>{slot.hidden=true;controls.hidden=false;};
  script.onload=()=>{ready=true;submit();};script.onerror=failed;document.head.append(script);
  new MutationObserver(()=>{if(ad.dataset.adStatus==='unfilled')slot.hidden=true;}).observe(ad,{attributes:true,attributeFilter:['data-ad-status']});
 }
 preferences.onclick=()=>{if(requested){remember('deny');location.reload();}else{stored=null;choice();}};
 if(location.search||location.hash||navigator.globalPrivacyControl===true)disable();
 else{
  const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible)render();},{threshold:.1});observer.observe(slot);
  document.addEventListener('visibilitychange',render);
  fetch('/api/ads/config',{cache:'no-store',signal:AbortSignal.timeout(5000)}).then(r=>r.ok?r.json():null).then(value=>{policy=value;if(!policy?.allowed)disable();else render();}).catch(disable);
 }
}
