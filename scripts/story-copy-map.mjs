import fs from 'node:fs';
import {decisions} from '../content/story/decisions-source.mjs';
export function storyCopyMap(lang){
 const en=JSON.parse(fs.readFileSync('content/story/locales/en.json'));
 const target=JSON.parse(fs.readFileSync('content/story/locales/'+lang+'.json'));
 const out=Object.fromEntries(Object.keys(en).map(key=>[en[key],target[key]]));
 for(const d of decisions)for(const option of d.options){out[en[d.id]+': '+en[d.id+'.'+option.id]]=target[d.id]+': '+target[d.id+'.'+option.id];out[en['ui.follow']+' '+en[d.id+'.'+option.id]]=target['ui.follow']+' '+target[d.id+'.'+option.id];}
 return out;
}
