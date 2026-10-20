import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('app.js','utf8');
const data=JSON.parse(fs.readFileSync('data/countries.json'));
test('actual sampler selects correct interval in both modes and handles empty data',()=>{
const fn=source.slice(source.indexOf('function chooseCountry('),source.indexOf('\nfunction ',source.indexOf('function chooseCountry(')+1));
const context=vm.createContext({COUNTRIES:data,Math:Object.create(Math)});vm.runInContext(fn,context);
for(const mode of ['baby','all']){context.Math.random=()=>0;assert.equal(context.chooseCountry(mode).id,data[0].id);context.Math.random=()=>1-Number.EPSILON;assert.equal(context.chooseCountry(mode).id,data.at(-1).id);const key=mode==='baby'?'births':'pop';const total=data.reduce((s,c)=>s+c[key],0);let acc=0;for(const c of data){context.Math.random=()=>(acc+c[key]/2)/total;assert.equal(context.chooseCountry(mode).id,c.id);acc+=c[key];}}
context.COUNTRIES=[];assert.equal(context.chooseCountry('baby'),null);
});
