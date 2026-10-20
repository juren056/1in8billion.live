export function calculateComparison(data,a,b,mode='births'){
 if(!['births','population'].includes(mode))throw Error('Unsupported comparison mode');
 const A=data.find(c=>c.id===a),B=data.find(c=>c.id===b);if(!A||!B)throw Error('Unknown country');
 const key=mode==='population'?'pop':'births',total=data.reduce((n,c)=>n+c[key],0);
 if(!Number.isFinite(total)||total<=0||![A,B].every(c=>Number.isFinite(c[key])&&c[key]>0))throw Error('Invalid model weight');
 const entry=c=>({id:c.id,weight:c[key],share:100*c[key]/total,oneIn:Math.round(total/c[key]),le:c.le??null,eys:c.eys??null,ppp:c.ppp??null});
 return {a:entry(A),b:entry(B),mode,total,ratio:A[key]/B[key]};
}
export function comparisonCSV(result,names,snapshot={}){
 const safe=value=>{let text=value==null?'Unavailable':String(value);if(/^[=+@\-]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';};
 const rows=[['Model comparison','Country A','Country B','Unit','Observation year'],['Country',names[0],names[1],'label','not applicable'],['Code',result.a.id,result.b.id,'ISO alpha-3','not applicable'],[result.mode,result.a.share,result.b.share,'% of covered weights','unverified'],['Approximate draw',result.a.oneIn,result.b.oneIn,'1 in N','unverified'],['Life expectancy input',result.a.le,result.b.le,'years','unverified'],['Schooling input',result.a.eys,result.b.eys,'years','unverified'],['PPP income input',result.a.ppp,result.b.ppp,'PPP base unverified','unverified'],['Covered weight total',result.total,result.total,'model units','unverified'],['Dataset','inherited-v1','inherited-v1','game estimates','unverified'],['Provenance','https://1in8billion.live/data/provenance.json','','source snapshot; not official verification',''],['Limit','Fictional game inputs, not current official statistics or personal predictions','','','']];
 if(snapshot.hash)rows.push(['Snapshot SHA-256',snapshot.hash,'','source input identity','']);if(snapshot.revision)rows.push(['Source revision','https://github.com/juren056/1in8billion.live/blob/'+snapshot.revision+'/data/countries.json','','immutable input file','']);
 return '\ufeff'+rows.map(row=>row.map(safe).join(',')).join('\r\n')+'\r\n';
}
