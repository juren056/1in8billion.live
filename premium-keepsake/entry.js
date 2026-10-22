import{copy}from'./translations.js';import{snapshotLife}from'./schema.js';import{preserve,preflight}from'./storage.js';import{conversionCopy}from'./conversion-copy.js';
export function installPremium(bridge){
 const displayLang=document.documentElement.dataset.siteLocale||document.documentElement.lang,c=copy[displayLang]||copy[bridge.lang],v=conversionCopy(displayLang),path=({en:'/',ja:'/ja/',ko:'/ko/','zh-TW':'/zh-tw/','zh-CN':'/zh-cn/',es:'/es/','pt-BR':'/pt-br/',fr:'/fr/',de:'/de/'})[displayLang]+'keepsake/';let seen=new WeakSet(),current;
 const observer=new IntersectionObserver(rows=>{for(const row of rows)if(row.isIntersecting&&current?.died&&!seen.has(current)){seen.add(current);bridge.event('keepsake_offer_view');}},{threshold:.25});
 const render=()=>{
  const life=STATE.life;if(!life?.died)return;const previous=document.querySelector('#premiumOffer');if(previous)observer.unobserve(previous);previous?.remove();
  const offer=document.createElement('section');offer.id='premiumOffer';offer.className='premium-offer';offer.dataset.clarityMask='true';offer.dataset.conversion='personal';
  const art=document.createElement('figure');art.className='keepsake-ending-art';art.setAttribute('aria-label',v.personal);const body=document.createElement('div'),h=document.createElement('h3'),p=document.createElement('p'),status=document.createElement('p'),a=document.createElement('button'),state=document.createElement('p'),sample=document.createElement('a');
  h.textContent=v.headline;p.textContent=v.includes;status.textContent='US$2.99 · '+v.once;a.type='button';a.textContent=v.buy;state.setAttribute('role','status');sample.href=path;sample.textContent=v.example;
  const snapshot=()=>snapshotLife(life,{lang:displayLang,countryName:localize(life.countryData).name,localize:t=>window.translateUI?.(window.localizeStory(t))||window.localizeStory(t)});
  a.onclick=async()=>{a.disabled=true;state.textContent=c.loading;bridge.event('keepsake_preview_click',{action:'ending'});try{const local=await preserve(snapshot());await preflight(local);location.href=path+'#local='+local.id;}catch{state.textContent=c.error;bridge.event('keepsake_render_error',{action:'snapshot_preflight'});a.disabled=false;}};
  body.append(h,p,status,a,sample,state);offer.append(art,body);document.querySelector('#endingIntro').before(offer);current=life;observer.observe(offer);
  import('./render-card.js').then(m=>m.renderCard(snapshot(),{templateId:'cinematic-poster',preview:true,demo:true})).then(result=>{if(offer.isConnected){result.canvas.setAttribute('role','img');result.canvas.setAttribute('aria-label',v.personal);art.replaceChildren(result.canvas);}}).catch(()=>{art.textContent=v.personal;});
 };const old=window.renderEnd;window.renderEnd=function(...args){const out=old(...args);render();return out;};if(STATE.view==='end')render();
 const link=document.createElement('a');link.className='premium-archive-link';link.href=path;link.textContent=c.sample;document.querySelector('#localCollection')?.after(link);
}
