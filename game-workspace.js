// Layout adapters only. The existing controllers retain every action and save key.
import {installToolWorkspace} from './tool-workspace.js';
import {workspaceCopy} from './game-workspace-copy.js';
import {installStoryExperience} from './story-experience.js';
import {installSimulatorShell} from './simulator-shell.js';
export function installGameWorkspace(){
 const root=document.documentElement,lang=root.dataset.siteLocale||root.lang,c=workspaceCopy[lang]||workspaceCopy.en;
 const sound=document.querySelector('.life-sound'),story=document.querySelector('.life-play-story');
 if(sound&&story){sound.classList.add('workspace-sound');sound.dataset.initiallyOpen='true';sound.open=false;document.querySelector('#lifeCommandBar').append(sound);}
 const reroll=document.querySelector('#birthCertReroll');if(reroll){reroll.textContent=reroll.textContent.replace(/^[\s🎲]+/u,'');reroll.insertAdjacentHTML('afterbegin','<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 7h4l10 10h4m-4-4 4 4-4 4M3 17h4l10-10h4m-4-4 4 4-4 4"/></svg> ');}
 const view=document.querySelector('#view-life');if(view){view.dataset.workspace='life';const heading=document.createElement('h2');heading.className='workspace-title';heading.textContent=c[3];view.prepend(heading);}
 const secondary=document.querySelector('#lifeSecondary');if(secondary)secondary.open=true;
 const apply=()=>{const end=document.querySelector('#endingIntro');if(end){end.dataset.workspace='ending';const reference=document.querySelector('#endLe');if(reference)reference.textContent=String(STATE.life.countryData.le);const more=document.querySelector('#endShowMore9');if(more)more.disabled=loadPastLives().length<=5;const offer=end.querySelector('.premium-offer-prominent');if(offer){const title=offer.querySelector('h2,h3');if(title)title.textContent=c[4];}}};
 const old=window.renderEnd;window.renderEnd=function(...args){const result=old(...args);apply();return result;};apply();
 installToolWorkspace();
 installStoryExperience();
 installSimulatorShell();
 root.dataset.gameWorkspace='ready';
}
