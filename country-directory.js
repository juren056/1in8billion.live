import {currentGrowthCopy} from './growth-copy.js';
const search=document.querySelector('#countrySearch'),clear=document.querySelector('#countryClear');
function filter(){const q=search.value.trim().toLocaleLowerCase();let count=0;for(const a of document.querySelectorAll('.country-entry')){a.hidden=!a.textContent.toLocaleLowerCase().includes(q);if(!a.hidden)count++;}document.querySelector('#searchEmpty').hidden=count>0;clear.hidden=!q;}
if(search){document.querySelector('#searchEmpty').textContent=currentGrowthCopy().searchEmpty;search.addEventListener('input',filter);clear.onclick=()=>{search.value='';filter();search.focus();};filter();}
