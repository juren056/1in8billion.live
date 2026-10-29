const targets=[...document.querySelectorAll('[data-content-ad]')];
async function observe(){
 if(document.querySelector('[data-ad-view]'))(await import('./play-ads-layout.js')).preparePlayAds();
 let loading=false;const observer=new IntersectionObserver(entries=>{
  if(loading||!entries.some(row=>row.isIntersecting))return;loading=true;observer.disconnect();
  const css=document.createElement('link');css.rel='stylesheet';css.href='/content-ads.css';
  css.onload=async()=>{try{const [module,response]=await Promise.all([import('./content-ads.js'),fetch('/api/ads/config',{cache:'no-store',signal:AbortSignal.timeout(5000)})]);const policy=response.ok?await response.json():null;for(const target of targets)module.installAdvertising(target,policy);}catch{for(const target of targets)target.hidden=true;}};
  css.onerror=()=>{for(const target of targets)target.hidden=true;};document.head.append(css);
 },{threshold:.1});for(const target of targets)observer.observe(target);
}
if(targets.length&&!location.search&&!location.hash&&navigator.globalPrivacyControl!==true)observe();else for(const target of targets)target.hidden=true;
