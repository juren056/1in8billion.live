import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.js';
import {freeCopy} from '../premium-keepsake/free-copy.js';
import {copy} from '../premium-keepsake/translations.js';
import {conversionCopy} from '../premium-keepsake/conversion-copy.js';
test('public keepsake checkout is retired even with old enabled configuration; health requires no Stripe or database',async()=>{
 const env={KEEPSAKE_CHECKOUT_ENABLED:'true'};
 const health=await (await worker.fetch(new Request('https://1in8billion.live/api/keepsake/health'),env)).json();
 assert.equal(health.free,true);assert.equal(health.checkout,false);assert.equal(health.amount,0);
 const response=await worker.fetch(new Request('https://1in8billion.live/api/keepsake/checkout',{method:'POST'}),env);
 assert.equal(response.status,410);assert.equal((await response.json()).free,true);
});
test('all supported locales expose free keepsakes without a price or purchase claim',()=>{
 for(const lang of ['en','zh-CN','zh-TW','ja','ko','es','pt-BR','fr','de','ru']){
  const f=freeCopy(lang),c=copy[lang],v=conversionCopy(lang);
  assert.ok(f.png&&f.pdf&&f.detail);assert.equal(c.price,f.free);assert.equal(v.buy,f.save);
  assert.doesNotMatch(JSON.stringify([c.price,c.status,c.scope,c.refund,c.limits,c.steps,c.faq,v.buy,v.preview,v.once,v.delivery]),/2\.99|US\$/);
 }
});
