import fs from 'node:fs';
import assert from 'node:assert/strict';
const data=JSON.parse(fs.readFileSync('data/countries.json'));
assert.equal(new Set(data.map(c=>c.id)).size,data.length);
for(const c of data)for(const key of ['pop','births','le'])assert.ok(Number.isFinite(c[key])&&c[key]>0,`${c.id} ${key}`);
for(const key of ['births','pop']){const total=data.reduce((s,c)=>s+c[key],0);assert.ok(Math.abs(data.reduce((s,c)=>s+c[key]/total,0)-1)<1e-12);}
console.log(`${data.length} unique countries; finite positive weights; both probability sums equal 1`);
