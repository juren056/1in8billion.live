// Noncritical presentation loads after the game is ready; never blocks a start.
window.retentionReady=new Promise(resolve=>{
 let attempts=0;const load=()=>{if(document.documentElement.dataset.gameReady!=='true'){if(++attempts>1000){resolve(null);return;}return setTimeout(load,60);}const css=document.createElement('link');css.rel='stylesheet';css.href='/retention.css';document.head.append(css);import('/retention.js').then(m=>m.installRetention()).then(resolve).catch(error=>{document.documentElement.dataset.retentionError='true';console.warn('Optional life presentation unavailable',error.message);resolve(null);});};
 if(document.readyState==='complete')load();else window.addEventListener('load',load,{once:true});
});
