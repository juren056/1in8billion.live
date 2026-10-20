import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync('replay-core.js','utf8'),ctx);const core=ctx.ReplayCore;
test('replay settings roundtrip without character text; unsupported or injected settings rejected',()=>{
const run={seed:'abc123',country:'JPN',era:'past',lang:'ja',edu:true};assert.deepEqual(JSON.parse(JSON.stringify(core.parse(core.encode(run)))),run);
for(const bad of ['#run=v2.abc123.JPN.now.en.0','#run=v1.<script>.JPN.now.en.0','#run=v1.abc.JPN.now.en.0.extra','#run=v1.abc.JPN.now.en.0?name=Alice'])assert.equal(core.parse(bad),null);
assert.throws(()=>core.encode({...run,country:'<img>'}));
});
test('seeded streams repeat and stay in range, independent from other streams',()=>{const a=core.random('fixed'),b=core.random('fixed'),other=core.random('another');for(let i=0;i<1000;i++){other();const v=a();assert.equal(v,b());assert.ok(v>=0&&v<1);}assert.notEqual(core.random('fixed')(),core.random('another')());});
