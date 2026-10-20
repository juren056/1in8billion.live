import {calculateComparison} from './comparison-core.js';
const select=document.querySelector('#oddsCountry'),mode=document.querySelector('#oddsMode');
if(select&&mode){
 const status=document.querySelector('#oddsResult'),play=document.querySelector('#oddsPlay'),search=document.querySelector('#oddsSearch');
 const labels=JSON.parse(document.querySelector('#oddsLabels').textContent);
 fetch('/data/countries.json').then(r=>{if(!r.ok)throw Error('data');return r.json()}).then(data=>{
  const update=()=>{const r=calculateComparison(data,select.value,select.value,mode.value);status.textContent=`${select.selectedOptions[0].textContent}: ${r.a.share.toFixed(4)}% · 1 in ${Math.round(r.total/r.a.weight).toLocaleString()} · ${labels.denominator}: ${r.total.toLocaleString()}`;play.href=labels.home+'?country='+select.value;document.querySelectorAll('[data-odds-country]').forEach(row=>{const c=data.find(c=>c.id===row.dataset.oddsCountry);const weight=mode.value==='population'?c.pop:c.births;row.querySelector('[data-share]').textContent=(100*weight/r.total).toFixed(4)+'%';row.querySelector('[data-one]').textContent=Math.round(r.total/weight).toLocaleString();});};
  select.addEventListener('change',()=>{update();window.siteEvent?.('odds_used',{action:'country',mode:mode.value})});mode.addEventListener('change',()=>{update();window.siteEvent?.('odds_used',{action:'mode',mode:mode.value})});
  search.addEventListener('input',()=>{const q=search.value.trim().toLocaleLowerCase();let n=0;for(const option of select.options){option.hidden=!option.textContent.toLocaleLowerCase().includes(q);if(!option.hidden)n++;}const first=[...select.options].find(x=>!x.hidden);if(first){select.value=first.value;update();}document.querySelector('#oddsEmpty').hidden=n>0;});
  update();
 }).catch(()=>{document.querySelector('#oddsError').hidden=false;});
}
