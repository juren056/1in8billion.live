const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({channel:'chrome'}),out='audit/payment-live-ready';fs.mkdirSync(out,{recursive:true});const results=[],errors=[];try{
const locales={en:'','zh-CN':'zh-cn/','zh-TW':'zh-tw/',ja:'ja/',ko:'ko/',es:'es/','pt-BR':'pt-br/',fr:'fr/',de:'de/'};
for(const mode of ['test','live']){const testMode=mode==='test',ctx=await b.newContext({viewport:{width:390,height:844},acceptDownloads:true}),p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));let checkoutCalls=0,claimStatus='paid';
await p.route('**/api/keepsake/health',r=>r.fulfill({json:{checkout:true,testOnly:testMode,mode}}));
await p.route('**/api/keepsake/checkout',r=>{checkoutCalls++;const posted=r.request().postDataJSON();assert.equal(posted.completed,true);assert.equal(posted.commitment.length,64);assert(!JSON.stringify(posted).includes('My private note'));return r.fulfill({json:{orderId:mode+'-mock',claimSecret:'mock-claim',testMode,status:'pending',checkoutUrl:'https://checkout.stripe.com/c/pay/cs_'+mode+'_mock'}});});
await p.route('https://checkout.stripe.com/**',r=>r.fulfill({body:'SIMULATED PROVIDER. NO PAYMENT.'}));
await p.route('**/api/keepsake/entitlement',r=>r.fulfill({status:claimStatus==='paid'?200:403,json:{status:claimStatus,testMode,...claimStatus==='paid'?{exportToken:'mock-not-a-real-payment'}:{}}}));
for(const [lang,prefix]of Object.entries(locales)){
 await p.goto('http://127.0.0.1:4186/'+prefix+'keepsake/');await p.waitForFunction(()=>document.querySelector('.keepsake-studio')?.dataset.ready==='true'&&document.querySelector('#studioCanvas').getAttribute('aria-busy')==='false');
 const label=await p.evaluate(async({lang,mode})=>{const {paymentCopy}=await import('/premium-keepsake/payment-copy.js');return paymentCopy(lang,mode).buy;},{lang,mode});const buy=p.getByRole('button',{name:label,exact:true});await buy.waitFor();assert(await buy.isDisabled(),'public samples cannot buy');
 const row=await p.evaluate(async lang=>{const {preserve}=await import('/premium-keepsake/storage.js'),samples=await fetch('/data/premium-samples.json').then(r=>r.json());return preserve(samples.find(s=>s.lang===lang)||{...samples[0],lang});},lang);
 await p.goto('http://127.0.0.1:4186/'+prefix+'keepsake/#local='+row.id);await p.waitForFunction(()=>document.querySelector('.keepsake-studio')?.dataset.ready==='true'&&document.querySelector('#studioCanvas').getAttribute('aria-busy')==='false');await buy.waitFor();await p.waitForFunction(label=>[...document.querySelectorAll('button')].some(b=>b.textContent===label&&!b.disabled),label);
 if(lang==='zh-CN'){
  await p.locator('#studioNote').fill('My private note');await p.waitForFunction(()=>document.querySelector('#studioCanvas').getAttribute('aria-busy')==='false');await p.screenshot({path:out+'/'+mode+'-390.png',fullPage:true});await buy.click();await p.waitForURL('https://checkout.stripe.com/**',{timeout:120000});
  const saved=await (async()=>{await p.goto('http://127.0.0.1:4186/keepsake/success/');return p.evaluate(()=>JSON.parse(localStorage.getItem(sessionStorage.getItem('keepsake-active-order'))));})();assert.equal(saved.testMode,testMode);await p.locator('[data-paid-format="card"]').waitFor();assert.equal(await p.locator('h1').textContent(),'你的纪念包订单');assert((await p.locator('#testPaymentNotice').textContent()).includes(testMode?'不会真实扣款':'单次购买'));
  if(!testMode){const download=p.waitForEvent('download',{timeout:120000});await p.locator('[data-paid-format="card"]').click();const d=await download;await d.saveAs(out+'/mock-live-authorized.png');assert(fs.statSync(out+'/mock-live-authorized.png').size>1000);claimStatus='refunded';await p.locator('#checkOrder').click();await p.waitForFunction(()=>document.querySelector('#orderStatus').dataset.orderState==='refunded');assert.equal(await p.locator('[data-paid-format]:visible').count(),0);claimStatus='paid';}
 }
 results.push({lang,mode,sampleLocked:true,ownLifeEnabled:true});
}
assert.equal(checkoutCalls,1);await ctx.close();}
assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({results,errors,note:'Simulated provider and entitlement; not a real Stripe transaction.'},null,2));console.log('PASS 18 locale/mode purchase states, test/live redirects, bound local claims, actual PNG export and refund lock. Simulated provider only.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
