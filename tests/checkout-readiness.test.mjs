import test from 'node:test';
import assert from 'node:assert/strict';
import {checkDeliverables} from '../premium-keepsake/checkout-preflight.js';
const row={snapshot:{schema:'keepsake-one-life-v1',completed:true,birthYear:2026,endYear:2106,age:80,events:[{age:0,text:'Born'},{age:80,text:'The closing page'}]}};
test('checkout readiness works without downloading fonts, images or rendering a PDF',async()=>{
 const before=globalThis.fetch;globalThis.fetch=()=>{throw Error('Checkout must not wait for export assets');};
 try{for(const templateId of ['clean-modern','cinematic-poster','editorial-magazine','journal-scrapbook','minimal-data','archive-certificate'])assert.equal(await checkDeliverables(row,{templateId,paper:'A4',ratio:'9:16'}),true);}finally{globalThis.fetch=before;}
});
test('fast checkout still rejects incomplete records and unsupported output settings',async()=>{
 await assert.rejects(checkDeliverables({snapshot:{...row.snapshot,completed:false}}),/invalid_snapshot/);
 for(const settings of [{ratio:'bad'},{paper:'bad'},{templateId:'bad'}])await assert.rejects(checkDeliverables(row,settings),/unsupported_/);
});
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fontSHA256} from '../premium-keepsake/font-coverage.js';
test('checkout text coverage stays tied to the actual export font and blocks missing glyphs',async()=>{
 assert.equal(createHash('sha256').update(readFileSync(new URL('../vendor/premium/KeepsakeSans-Regular.ttf',import.meta.url))).digest('hex'),fontSHA256);
 const snapshot={...row.snapshot,events:[{age:0,text:'Unsupported \u{1FAE8}'}]};await assert.rejects(checkDeliverables({snapshot}),/unsupported_glyph/);
});
import {spawnSync} from 'node:child_process';
test('real checkout client reaches provider without export assets, reuses retry key and saves claim before returning',()=>{
 const run=spawnSync(process.execPath,['--input-type=module','-e',`
 import {registerHooks} from 'node:module';import assert from 'node:assert/strict';
 const row=${JSON.stringify(row)};row.id='11111111-1111-4111-8111-111111111111';row.commitment='a'.repeat(64);
 registerHooks({load(url,context,next){if(url.endsWith('/premium-keepsake/storage.js'))return {format:'module',shortCircuit:true,source:'export async function restore(){return '+JSON.stringify(row)+';} export async function preflight(){return true;}'};return next(url,context);}});
 const values=new Map();globalThis.localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};globalThis.sessionStorage={setItem(){}};
 let fail=true,requests=[];globalThis.fetch=async(url,init)=>{assert.equal(url,'/api/keepsake/checkout');requests.push(JSON.parse(init.body));if(fail)return new Response('',{status:503});return Response.json({orderId:'order1',claimSecret:'claim1',status:'pending',testMode:false,checkoutUrl:'https://checkout.stripe.com/c/pay/example'});};
 const {createTestCheckout}=await import('./premium-keepsake/payment-client.js');
 await assert.rejects(createTestCheckout(row.id),/checkout_unavailable/);fail=false;
 const order=await createTestCheckout(row.id);assert.equal(order.orderId,'order1');assert.equal(requests.length,2);assert.equal(requests[0].requestId,requests[1].requestId);assert.equal(JSON.parse(values.get('keepsake-order:'+row.id)).claimSecret,'claim1');assert(!JSON.stringify(requests).includes('events'));
 localStorage.setItem=()=>{throw Error('blocked');};await assert.rejects(createTestCheckout(row.id),/storage_unavailable/);assert.equal(requests.length,2);
 `],{cwd:new URL('..',import.meta.url),encoding:'utf8',timeout:10000});
 assert.equal(run.status,0,run.stderr);
});
test('all 48 shipped sample records pass fast readiness, including Korean zero-width word breaks',async()=>{
 const samples=JSON.parse(readFileSync(new URL('../content/premium-samples.json',import.meta.url),'utf8'));assert.equal(samples.length,48);
 for(const snapshot of samples)await checkDeliverables({snapshot},{templateId:'cinematic-poster',paper:'A4'});
});
