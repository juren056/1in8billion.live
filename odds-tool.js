import {calculateComparison} from './comparison-core.js';
const select=document.querySelector('#oddsCountry'),mode=document.querySelector('#oddsMode');
if(select&&mode){
 const status=document.querySelector('#oddsResult'),play=document.querySelector('#oddsPlay'),search=document.querySelector('#oddsSearch');
 const labels=JSON.parse(document.querySelector('#oddsLabels').textContent);
 fetch('/data/countries.json',{signal:AbortSignal.timeout(15000)}).then(r=>{if(!r.ok)throw Error('data');return r.json()}).then(data=>{
  const params=new URLSearchParams(location.search),country=params.get('country'),drawMode=params.get('mode');
  if(data.some(c=>c.id===country))select.value=country;
  if(['births','population'].includes(drawMode))mode.value=drawMode;
  for(const el of [select,mode,search])el.disabled=false;
  const update=()=>{const r=calculateComparison(data,select.value,select.value,mode.value);status.textContent=`${select.selectedOptions[0].textContent}: ${r.a.share.toFixed(4)}% · 1 / ${Math.round(r.total/r.a.weight).toLocaleString()} · ${labels.denominator}: ${r.total.toLocaleString()}`;play.href=labels.home+'?country='+select.value;play.textContent=labels.playIn+' '+select.selectedOptions[0].textContent;document.querySelectorAll('[data-odds-country]').forEach(row=>{const c=data.find(c=>c.id===row.dataset.oddsCountry);const weight=mode.value==='population'?c.pop:c.births;row.querySelector('[data-share]').textContent=(100*weight/r.total).toFixed(4)+'%';row.querySelector('[data-one]').textContent=Math.round(r.total/weight).toLocaleString();});};
  const remember=()=>{history.replaceState(null,'',location.pathname+'?country='+select.value+'&mode='+mode.value+location.hash);document.dispatchEvent(new Event('site:task-change'));};
  select.addEventListener('change',()=>{update();remember();window.siteEvent?.('odds_used',{action:'country',mode:mode.value})});mode.addEventListener('change',()=>{update();remember();window.siteEvent?.('odds_used',{action:'mode',mode:mode.value})});
  search.addEventListener('input',()=>{const q=search.value.trim().toLocaleLowerCase();let n=0;for(const option of select.options){option.hidden=!option.textContent.toLocaleLowerCase().includes(q);if(!option.hidden)n++;}const first=[...select.options].find(x=>!x.hidden);if(first){select.value=first.value;update();remember();}document.querySelector('#oddsEmpty').hidden=n>0;});
  update();
 }).catch(()=>{document.querySelector('#oddsError').hidden=false;});
}
document.querySelector('#oddsRetry')?.addEventListener('click',()=>location.reload());
