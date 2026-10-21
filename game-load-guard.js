// Independent of the engine: a missing script must leave a useful recovery path.
(()=>{const show=()=>{if(document.documentElement.dataset.gameReady==='true')return;const box=document.querySelector('#gameLoadState'),c=window.SurfaceCopy;if(!box||!c||box.querySelector('button'))return;box.textContent=c.error;const retry=document.createElement('button');retry.type='button';retry.textContent=c.reload;retry.onclick=()=>location.reload();box.append(retry);};
document.addEventListener('error',e=>{if(e.target?.tagName==='SCRIPT'&&new URL(e.target.src,location.href).pathname==='/app.js')show();},true);
setTimeout(show,16000);
})();
