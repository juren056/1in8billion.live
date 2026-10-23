import {birthPreparingCopy} from './game-entry-copy.js';
let preparing=false;
export const revealSchedule=(reduced,repeat)=>reduced?[250,800,1700]:repeat?[300,800,1800]:[900,1900,3300];
export async function prepareBirth(){
 if(preparing)return false;
 preparing=true;
 const status=document.querySelector?.('#gameLoadState'),previousStatus=status?.textContent;
 if(status)status.textContent=birthPreparingCopy(document.documentElement?.dataset?.siteLocale||document.documentElement?.lang||'en');
 const buttons=[...document.querySelectorAll('#btnStart,#btnStartSelected,#birthCertReroll')],prior=buttons.map(b=>b.disabled);
 buttons.forEach(b=>{b.disabled=true;b.setAttribute('aria-busy','true');});let deadline;const timeout=new Promise((_,reject)=>{deadline=setTimeout(()=>reject(Error('presentation_timeout')),10000);});
 try{
  const bridge=await Promise.race([timeout,new Promise((resolve,reject)=>{let tries=0;const check=()=>{if(window.retentionReady)return resolve(window.retentionReady);if(++tries>200)return reject(Error('presentation_timeout'));setTimeout(check,50);};check();})]);
  if(!bridge)throw Error('presentation_unavailable');
  let sheet=document.querySelector('link[href="/rebirth-reveal.css"]');
  if(!sheet?.sheet)await Promise.race([timeout,new Promise((resolve,reject)=>{
   if(!sheet){sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='/rebirth-reveal.css';}
   sheet.addEventListener('load',resolve,{once:true});sheet.addEventListener('error',()=>{sheet.remove();reject(Error('presentation_styles'));},{once:true});sheet.media='all';if(!sheet.isConnected)document.head.append(sheet);
  })]);
  const {installRebirthReveal}=await Promise.race([import('./rebirth-reveal.js'),timeout]);installRebirthReveal(bridge);
  return true;
 }catch{window.siteEvent?.('birth_prepare_failed',{action:'retry'});window.toast?.(window.SurfaceCopy?.error||'Please try again.',5000);return false;}
 finally{clearTimeout(deadline);buttons.forEach((b,i)=>{b.disabled=prior[i];b.removeAttribute('aria-busy');});if(status)status.textContent=previousStatus;preparing=false;}
}
