/* Versioned deterministic random streams. No names or saved records in URLs. */
(function(root){
  function random(seed){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
  function parse(hash){const m=String(hash).match(/^#run=(v1|v2|v3|v4|v5)\.([a-z0-9]{1,16})\.([A-Z]{3})\.(now|past|future)\.(en|ja|ko|zh-Hant)\.([01])(?:\.([1-9]\d{3}(?:0[1-9]|1[0-2])))?$/);if(!m||(m[1]==='v1'&&m[7])||(m[1]==='v2'&&(!m[7]||m[4]!=='now'))||(['v3','v4','v5'].includes(m[1])&&m[4]==='now'&&!m[7]))return null;const run={seed:m[2],country:m[3],era:m[4],lang:m[5],edu:m[6]==='1'};if(['v3','v4','v5'].includes(m[1]))run.rulesVersion=Number(m[1].slice(1));if(m[7])run.calendarMonth=m[7].slice(0,4)+'-'+m[7].slice(4);return run;}
  function encode(run){const month=run.calendarMonth;const hash=`#run=${[3,4,5].includes(run.rulesVersion)?'v'+run.rulesVersion:month?'v2':'v1'}.${run.seed}.${run.country}.${run.era}.${run.lang}.${run.edu?'1':'0'}${month?'.'+month.replace('-',''):''}`;if(!parse(hash)||(month&&parse(hash).calendarMonth!==month))throw Error('Unsupported replay settings');return hash;}
  root.ReplayCore=Object.freeze({random,parse,encode,version:'v5'});
})(globalThis);
