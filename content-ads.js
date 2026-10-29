import{contentAdsCopy}from'./content-ads-copy.js';
const key='1in8billion:advertising-choice:v1',c=contentAdsCopy(document.documentElement.dataset.siteLocale||document.documentElement.lang);
let sdk;
function loadSDK(publisher){
 if(!sdk)sdk=new Promise((resolve,reject)=>{
  const queue=window.adsbygoogle=window.adsbygoogle||[];queue.requestNonPersonalizedAds=1;
  const script=document.createElement('script');script.async=true;script.crossOrigin='anonymous';script.dataset.privacyTreatments='disablePersonalization';
  script.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+encodeURIComponent(publisher);script.onload=resolve;script.onerror=reject;document.head.append(script);
 });
 return sdk;
}
function storedChoice(){try{const value=JSON.parse(localStorage.getItem(key)||'null');return value&&['allow','deny'].includes(value.value)&&Number.isFinite(value.at)&&value.at<=Date.now()&&Date.now()-value.at<180*86400000?value.value:null;}catch{return null;}}
const remember=value=>{try{localStorage.setItem(key,JSON.stringify({value,at:Date.now()}));}catch{}};
export function installAdvertising(slot,policy){
 const zone=slot.closest('[data-ad-view]');let visible=false,loading=false,ready=false,submitted=false,failed=false;
 const controls=document.createElement('div');controls.className='ad-controls';controls.hidden=true;const preferences=document.createElement('button');preferences.type='button';controls.append(preferences);slot.after(controls);slot.setAttribute('aria-label',c.label);
 const active=()=>{if(!zone)return true;const view=document.querySelector('#view-'+zone.dataset.adView+'.active');return !zone.hidden&&!!view&&(zone.dataset.adView!=='life'||view.dataset.panel==='story')&&!document.querySelector('dialog[open],.modal:not([hidden])');};
 const denied=()=>storedChoice()==='deny';
 preferences.onclick=()=>{remember(denied()?'allow':'deny');location.reload();};
 function sync(){
  if(!policy?.allowed||location.search||location.hash||navigator.globalPrivacyControl===true){slot.hidden=true;controls.hidden=true;if(zone){zone.dataset.adUnavailable='true';zone.hidden=true;}return;}
  preferences.textContent=denied()?c.allow:c.withdraw;controls.hidden=!active();
  if(denied()||failed){slot.hidden=true;return;}
  slot.hidden=false;if(!active()||!visible||document.visibilityState!=='visible'||submitted)return;
  if(!loading){loading=true;loadSDK(slot.dataset.publisher).then(()=>{ready=true;sync();}).catch(()=>{failed=true;slot.hidden=true;});}
  if(!ready)return;submitted=true;
  // Create a unit only at submission time; an earlier offscreen unit cannot consume this push.
  const label=document.createElement('p');label.className='content-ad-label';label.textContent=c.label;
  const ad=document.createElement('ins');ad.className='adsbygoogle';ad.style.display='block';ad.dataset.adClient=slot.dataset.publisher;ad.dataset.adSlot=slot.dataset.slot;ad.dataset.restrictDataProcessing='1';slot.replaceChildren(label,ad);
  try{window.adsbygoogle.requestNonPersonalizedAds=1;window.adsbygoogle.push({});}catch{failed=true;slot.hidden=true;}
  new MutationObserver(()=>{if(ad.dataset.adStatus==='unfilled'){failed=true;slot.hidden=true;}}).observe(ad,{attributes:true,attributeFilter:['data-ad-status']});
 }
 new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);sync();},{threshold:.1}).observe(slot);
 document.addEventListener('visibilitychange',sync);document.addEventListener('advertising:context',sync);sync();
}
