import fs from 'node:fs';import vm from 'node:vm';import {createHash} from 'node:crypto';
const data=JSON.parse(fs.readFileSync('data/countries.json')),source=fs.readFileSync('app.js','utf8');
const ctx=vm.createContext({COUNTRIES:data});vm.runInContext(fs.readFileSync('replay-core.js','utf8'),ctx);
const fn=source.slice(source.indexOf('function chooseCountry('),source.indexOf('\nfunction ',source.indexOf('function chooseCountry(')+1));vm.runInContext(fn,ctx);
const drawsPerMode=20000,seed='birthplace-audit-v1',rows=[];
for(const mode of ['baby','all']){ctx.simRandom=ctx.ReplayCore.random(seed+':'+mode);const counts={};for(let i=0;i<drawsPerMode;i++){const id=ctx.chooseCountry(mode).id;counts[id]=(counts[id]||0)+1;}const key=mode==='baby'?'births':'pop',total=data.reduce((n,c)=>n+c[key],0);for(const id of ['IND','CHN','NGA','USA','JPN','KOR']){const c=data.find(c=>c.id===id);rows.push({country:id,name:c.name_en,mode:mode==='baby'?'Annual births':'Population',expected:100*c[key]/total,observed:100*(counts[id]||0)/drawsPerMode,count:counts[id]||0});}}
const numericHash=createHash('sha256').update(JSON.stringify(data.map(({id,flag,name_zh,name_en,name_ko,...numeric})=>({id,...numeric})))).digest('hex');
const sourceSnapshotHash=createHash('sha256').update(JSON.stringify(data)).digest('hex');
fs.writeFileSync('content/model-experiment.json',JSON.stringify({seed,drawsPerMode,numericHash,sourceSnapshotHash,rows},null,2));console.log('Recorded actual sampler experiment: 40,000 draws');
