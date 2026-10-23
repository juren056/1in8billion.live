import {catalog} from './catalog-source.mjs';
import {chains,narrativeUI} from './chains-source.mjs';
import {ui} from '../story/decisions-source.mjs';
export function narrativeCopy(language='en'){
 const zh=language==='zh-CN',out={};
 for(const e of catalog)out[e.id]=zh?e.zh:e.en;
 for(const d of chains){
  out[d.id]=zh?d.zh:d.en;out[d.id+'.prompt']=zh?d.promptZh:d.prompt;
  out[d.id+'.preludeTitle']=zh?d.preludeZh:d.preludeEn;
  out[d.id+'.setup']=zh?d.setupZh:d.setupEn;
  for(const o of d.options){out[d.id+'.'+o.id]=zh?o.zh:o.en;out[d.id+'.'+o.id+'.result']=zh?o.resultZh:o.resultEn;out[d.id+'.'+o.id+'.follow']=zh?o.followZh:o.followEn;}
 }
 for(const[k,v]of Object.entries({...ui,...narrativeUI}))out['ui.'+k]=v[zh?1:0];
 return out;
}
