import {commerceCopy} from '../premium-keepsake/commerce-copy.js';
import {paymentCopy} from '../premium-keepsake/payment-copy.js';
import {arrivalCopy} from '../arrival-copy.js';
const origin='https://1in8billion.live';
const text=s=>s.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim();
export function seoPresentation(html,route,lang,coverage){
 const policy=commerceCopy(lang);
 html=html.replaceAll(paymentCopy('en').notice,paymentCopy(lang).notice);
 html=html.replace('There are no online accounts. Optional Stripe test checkout does not create a real charge.',paymentCopy(lang).notice);
 html=html.replace(/<section data-commerce-policy>[\s\S]*?<\/section>/,`<section data-commerce-policy><h2>${policy.heading}</h2><p>${policy.sales}</p><p>${policy.storage}</p><p><a href="mailto:support@1in8billion.live">support@1in8billion.live</a></p></section>`);
 // Critical dimensions and styles must be present before first paint.
 if(/id="view-intro"/.test(html)){
  html=html.replace('<link rel="stylesheet" href="/experience-upgrade.css">','').replace('</head>','<link rel="stylesheet" href="/retention.css"><link rel="stylesheet" href="/experience-media.css"><link rel="stylesheet" href="/experience-upgrade.css"></head>');
  const labels=arrivalCopy[lang]||arrivalCopy.en;
  const clock=`<section class="world-clock"><dl>${labels.map((label,i)=>`<div><dt>${label}</dt><dd id="arrival${['Births','Seconds','Countries'][i]}">${i===2?coverage:0}</dd></div>`).join('')}</dl></section>`;
  // Insert after the hero, immediately before the controls section that follows it.
  html=html.replace(/<details\b[^>]*id="lifeSettings"/,match=>clock+match);
 }
 const heading=text(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1]||'');
 const crumbs=html.match(/<p class="breadcrumbs">([\s\S]*?)<\/p>/)?.[1];
 let parents=crumbs?[...crumbs.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(m=>({name:text(m[2]),item:new URL(m[1],origin).href})):[];
 // Existing schema without visible crumbs uses the localized home navigation label.
 if(!parents.length&&route!=='/'&&html.includes('BreadcrumbList')){
  const p=route.match(/^\/(ja|ko|zh-tw|zh-cn|es|pt-br|fr|de)\//)?.[0]||'/';
  const name=({en:'Play',ja:'遊ぶ',ko:'플레이','zh-TW':'遊玩','zh-CN':'游玩',es:'Jugar','pt-BR':'Jogar',fr:'Jouer',de:'Spielen'})[lang];
  parents=[{name,item:origin+p}];
 }
 if(heading&&html.includes('BreadcrumbList')){
  const nodes=[...parents,{name:heading,item:origin+route}];
  const schema={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:nodes.map((n,i)=>({'@type':'ListItem',position:i+1,...n}))};
  html=html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(all,json)=>{
   try{return JSON.parse(json)['@type']==='BreadcrumbList'?'<script type="application/ld+json">'+JSON.stringify(schema).replaceAll('<','\\u003c')+'</script>':all;}catch{return all;}
  });
 }
 return html;
}
