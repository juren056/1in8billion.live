import {gameEntryCopy} from './game-entry-copy.js';
const style=document.createElement('link');style.rel='stylesheet';style.href='/game-entry.css';document.head.append(style);
const lang=document.documentElement.dataset.siteLocale||document.documentElement.lang,c=gameEntryCopy(lang);
const ready=()=>{if(!window.retentionReady)return setTimeout(ready,80);window.retentionReady.then(()=>{
 const render=window.renderLife;if(typeof render!=='function')return;
 window.renderLife=function(...args){const out=render(...args),value=document.querySelector('#lifeLe'),label=document.querySelector('.cert-le');if(label)label.textContent=c[11];if(value){const n=Number(value.textContent);if(Number.isFinite(n))value.textContent=new Intl.NumberFormat(lang,{style:'unit',unit:'year',unitDisplay:'short',maximumFractionDigits:1}).format(n);value.style.fontVariantNumeric='tabular-nums';}
  const note=document.querySelector('#lifeCert .reference-note');if(note&&!note.closest('.reference-details')){const details=document.createElement('details');details.className='reference-details';const summary=document.createElement('summary');summary.textContent='ⓘ';summary.setAttribute('aria-label',note.textContent);note.before(details);details.append(summary,note);}return out;};
}).catch(()=>{});};if(document.querySelector('#view-life'))ready();
