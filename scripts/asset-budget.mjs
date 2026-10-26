import fs from 'node:fs';import {gzipSync} from 'node:zlib';import assert from 'node:assert/strict';
const routes=['/','/compare/','/guides/quick-play/'];
export function measureAssets(){return routes.map(route=>{
 const html=fs.readFileSync('dist'+route+'index.html','utf8').replace(/<noscript>[\s\S]*?<\/noscript>/g,''),files=new Set();
 for(const m of html.matchAll(/<(script|link)\b[^>]*>/g)){
  const tag=m[0];if(m[1]==='link'&&(!tag.includes('rel="stylesheet"')||tag.includes('media="print"')))continue;
  const path=tag.match(/(?:src|href)="(\/[^"?]+)"/)?.[1];if(path)files.add(path);
 }
 if(html.includes('id="view-intro"')){files.add('/data/countries.json');files.add('/data/i18n/en.json');}
 if(html.includes('id="comparison"'))files.add('/data/countries.json');
 for(const file of [...files])if(file.endsWith('.js'))for(const m of fs.readFileSync('dist'+file,'utf8').matchAll(/\bfrom\s*['"]\.\/([^'"]+)['"]/g))files.add('/'+m[1]);
 const size=(path,bytes)=>({path,decodedBytes:bytes.length,gzipEstimateBytes:gzipSync(bytes).length});
 const assets=[...files].sort().map(path=>size(path,fs.readFileSync('dist'+path)));
 for(const [i,m]of [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].entries())assets.push(size('inline-style-'+i,Buffer.from(m[1])));
 return {route,decodedBytes:assets.reduce((n,x)=>n+x.decodedBytes,0),gzipEstimateBytes:assets.reduce((n,x)=>n+x.gzipEstimateBytes,0),assets};
});}

if(process.argv.includes('--baseline')){const revision=JSON.parse(fs.readFileSync('dist/release.json')).revision;fs.writeFileSync('content/performance-baseline.json',JSON.stringify({revision,method:'Static critical CSS/JS + game data. Vendor Web Vitals loads later; screenshots and analytics network excluded. Gzip estimates are not measured CDN transfer.',routes:measureAssets()},null,2));console.log('Captured pre-change asset baseline '+revision);}
else{const rows=measureAssets(),baseline=JSON.parse(fs.readFileSync('content/performance-baseline.json'));for(const row of rows){const old=baseline.routes.find(x=>x.route===row.route);const limit=old.decodedBytes+(row.route==='/'?-4400:13000);assert(row.decodedBytes<=limit,`${row.route} exceeds critical asset budget: ${row.decodedBytes} > ${limit}`);}fs.writeFileSync('dist/performance-assets.json',JSON.stringify({baselineRevision:baseline.revision,method:baseline.method,baseline:baseline.routes.map(({route,decodedBytes,gzipEstimateBytes})=>({route,decodedBytes,gzipEstimateBytes})),current:rows},null,2));console.log('Asset budgets passed: '+rows.map(x=>x.route+' '+x.decodedBytes+'B').join(', '));}
