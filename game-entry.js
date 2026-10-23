import {gameEntryCopy} from './game-entry-copy.js';
const style=document.createElement('link');style.rel='stylesheet';style.href='/game-entry.css';document.head.append(style);
const lang=document.documentElement.dataset.siteLocale||document.documentElement.lang,c=gameEntryCopy(lang);
function lobby(){
 const book=document.querySelector('.theme-book');if(!book)return;
 const box=document.createElement('section');box.className='game-lobby';box.setAttribute('aria-label',c[0]);
 const scene=document.createElement('div');scene.className='lobby-scene';
 const canvas=document.createElement('canvas');canvas.setAttribute('role','img');canvas.setAttribute('aria-label',c[1]);const actor=document.createElement('canvas');actor.className='lobby-actor';actor.setAttribute('aria-hidden','true');scene.append(canvas,actor);
 const title=document.createElement('h2');title.textContent=c[0];const label=document.createElement('p');label.className='lobby-demo-label';label.textContent=c[1];
 const question=document.createElement('p');question.className='lobby-question';question.textContent=c[2];
 const actions=document.createElement('div');actions.className='lobby-actions';const result=document.createElement('p');result.className='lobby-result';result.setAttribute('role','status');
 for(let i=0;i<2;i++){const button=document.createElement('button');button.type='button';button.textContent=c[3+i];button.setAttribute('aria-pressed','false');button.onclick=()=>{actions.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));result.textContent=c[5+i];window.siteEvent?.('entry_demo_choice',{action:i?'help':'repair',mode:'preview'});};actions.append(button);}
 const journey=document.createElement('ol');journey.className='lobby-journey';for(const text of c.slice(7,11)){const item=document.createElement('li');item.textContent=text;journey.append(item);}
 box.append(scene,title,label,question,actions,result,journey);book.replaceWith(box);const mini=document.createElement('img');mini.className='lobby-mobile-person';mini.src='/public-assets/rebirth/people/mei-young.webp';mini.alt='';mini.setAttribute('aria-hidden','true');mini.width=90;mini.height=135;document.querySelector('.hero-copy')?.prepend(mini);
 import('./modern-life-art.js').then(m=>{const life={rulesVersion:6,country:'JPN',age:4,name:{full:'Demo'},visual:{version:2,person:'mei',environment:'lake'}};m.paintModernScene(canvas,life,'home');m.paintModernActor(actor,life);}).catch(()=>canvas.hidden=true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',lobby,{once:true});else lobby();
const ready=()=>{if(!window.retentionReady)return setTimeout(ready,80);window.retentionReady.then(()=>{
 const render=window.renderLife;if(typeof render!=='function')return;
 window.renderLife=function(...args){const out=render(...args),value=document.querySelector('#lifeLe'),label=document.querySelector('.cert-le');if(label)label.textContent=c[11];if(value){const n=Number(value.textContent);if(Number.isFinite(n))value.textContent=new Intl.NumberFormat(lang,{style:'unit',unit:'year',unitDisplay:'short',maximumFractionDigits:1}).format(n);value.style.fontVariantNumeric='tabular-nums';}
  const note=document.querySelector('#lifeCert .reference-note');if(note&&!note.closest('.reference-details')){const details=document.createElement('details');details.className='reference-details';const summary=document.createElement('summary');summary.textContent='ⓘ';summary.setAttribute('aria-label',note.textContent);note.before(details);details.append(summary,note);}return out;};
}).catch(()=>{});};if(document.querySelector('#view-life'))ready();
