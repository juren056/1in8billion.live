/* Versioned deterministic random streams. No names or saved records in URLs. */
(function(root){
  function random(seed){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
  function parse(hash){const m=hash.match(/^#run=v1\.([a-z0-9]{1,16})\.([A-Z]{3})\.(now|past|future)\.(en|ja|ko|zh-Hant)\.([01])$/);return m?{seed:m[1],country:m[2],era:m[3],lang:m[4],edu:m[5]==='1'}:null;}
  function encode(run){const hash=`#run=v1.${run.seed}.${run.country}.${run.era}.${run.lang}.${run.edu?'1':'0'}`;if(!parse(hash))throw Error('Unsupported replay settings');return hash;}
  root.ReplayCore=Object.freeze({random,parse,encode,version:'v1'});
})(globalThis);
