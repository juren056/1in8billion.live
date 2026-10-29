const target=document.querySelector('[data-content-ad]');
if(target&&!location.search&&!location.hash&&navigator.globalPrivacyControl!==true){
 const observer=new IntersectionObserver(entries=>{
  if(!entries.some(row=>row.isIntersecting))return;observer.disconnect();
  const css=document.createElement('link');css.rel='stylesheet';css.href='/content-ads.css';
  css.onload=()=>import('./content-ads.js').catch(()=>target.hidden=true);css.onerror=()=>target.hidden=true;document.head.append(css);
 },{threshold:.1});observer.observe(target);
}else if(target)target.hidden=true;
