import{contentAdsCopy}from'./content-ads-copy.js';
const button=document.querySelector('#advertisingPrivacyChoice');
if(button){
 const key='1in8billion:advertising-choice:v1',c=contentAdsCopy(document.documentElement.dataset.siteLocale||document.documentElement.lang);
 function denied(){try{const value=JSON.parse(localStorage.getItem(key)||'null');return value?.value==='deny'&&Number.isFinite(value.at)&&Date.now()>=value.at&&Date.now()-value.at<180*86400000;}catch{return false;}}
 const update=()=>{button.textContent=denied()?c.allow:c.withdraw;};
 button.onclick=()=>{try{if(denied())localStorage.removeItem(key);else localStorage.setItem(key,JSON.stringify({value:'deny',at:Date.now()}));update();}catch{button.disabled=true;}};
 update();
}
