import fs from 'node:fs';
// Select existing rules rather than maintain a second, drifting set of dimensions.
function selectRules(css){
 let out='',at=0;css=css.replace(/\/\*[\s\S]*?\*\//g,'');
 while(at<css.length){
  const open=css.indexOf('{',at);if(open<0)break;
  const selector=css.slice(at,open).trim();let depth=1,end=open+1;
  while(end<css.length&&depth){if(css[end]==='{')depth++;if(css[end]==='}')depth--;end++;}
  const body=css.slice(open+1,end-1);
  if(selector.startsWith('@media')){const selected=selectRules(body);if(selected)out+=selector+'{'+selected+'}';}
  else if(!selector.startsWith('@')&&/\.world-clock|\.home-life-intro|\.home-preview-frame|\.pixel-stage|\.life-settings (?:\.seg|select)/.test(selector))out+=selector+'{'+body+'}';
  at=end;
 }
 return out;
}
export const homeCriticalCss=['retention.css','experience-media.css'].map(file=>selectRules(fs.readFileSync(file,'utf8'))).join('').replace(/\s+/g,' ');
