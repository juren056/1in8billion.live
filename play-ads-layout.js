export function preparePlayAds(){
 const zones=[...document.querySelectorAll('[data-ad-view]')],intro=document.querySelector('#view-intro');
 if(intro){const top=document.querySelector('[data-placement="home-top"]')?.parentElement,lower=document.querySelector('[data-placement="home-lower"]')?.parentElement;if(top)(intro.querySelector('.theme-hero')||intro.firstElementChild)?.after(top);if(lower)(intro.querySelector('.theme-explore')||intro.lastElementChild)?.after(lower);}
 const sync=()=>{const modal=!!document.querySelector('dialog[open],.modal:not([hidden])');for(const zone of zones){const view=document.querySelector('#view-'+zone.dataset.adView+'.active'),hidden=zone.dataset.adUnavailable==='true'||modal||!view||(zone.dataset.adView==='life'&&view.dataset.panel!=='story');if(zone.hidden!==hidden)zone.hidden=hidden;}document.dispatchEvent(new Event('advertising:context'));};
 new MutationObserver(rows=>{if(rows.some(row=>row.target.matches('.view,dialog,.modal')))sync();}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','open','hidden','data-panel']});sync();
}
