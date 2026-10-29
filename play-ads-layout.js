export function preparePlayAds(){
 const zones=[...document.querySelectorAll('[data-ad-view]')],intro=document.querySelector('#view-intro');
 if(intro)for(const [name,selector]of [['home-top','.theme-hero'],['home-lower','.theme-explore'],['home-world','.world-clock'],['home-stories','#completeExamples']]){const zone=document.querySelector('[data-placement="'+name+'"]')?.parentElement,anchor=intro.querySelector(selector);if(zone&&anchor)anchor.after(zone);}
 const sync=()=>{const modal=!!document.querySelector('dialog[open],.modal:not([hidden])');for(const zone of zones){const view=document.querySelector('#view-'+zone.dataset.adView+'.active'),hidden=zone.dataset.adUnavailable==='true'||modal||!view||(zone.dataset.adView==='life'&&view.dataset.panel!=='story');if(zone.hidden!==hidden)zone.hidden=hidden;}document.dispatchEvent(new Event('advertising:context'));};
 new MutationObserver(rows=>{if(rows.some(row=>row.target.matches('.view,dialog,.modal')))sync();}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','open','hidden','data-panel']});sync();
}
