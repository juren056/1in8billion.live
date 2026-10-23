import {catalog} from './catalog-source.mjs';
import {allChains,narrativeUI} from './chains-source.mjs';
import {ui} from '../story/decisions-source.mjs';
export function narrativeCopy(language='en'){
 const zh=language==='zh-CN',out={};
 for(const e of catalog)out[e.id]=zh?e.zh:e.en;
 for(const d of allChains){for(const[key,en,cn]of [['',d.en,d.zh],['.prompt',d.prompt,d.promptZh],['.preludeTitle',d.preludeEn,d.preludeZh],['.setup',d.setupEn,d.setupZh]])out[d.id+key]=zh?cn:en;
  for(const o of d.options)for(const[key,en,cn]of [['',o.en,o.zh],['.result',o.resultEn,o.resultZh],['.follow',o.followEn,o.followZh],...(o.laterEn?[['.later',o.laterEn,o.laterZh]]:[])])out[d.id+'.'+o.id+key]=zh?cn:en;
 }
 for(const[k,v]of Object.entries({...ui,...narrativeUI}))out['ui.'+k]=v[zh?1:0];return out;
}
