// Controlled laboratory regression. Vendor telemetry is blocked by the preload.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.SEO_BASE||'http://127.0.0.1:4186',out=process.env.SEO_OUTPUT||'audit/seo-20261021/fixed-browser';
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({channel:'chrome',headless:true,...(process.env.BROWSER_PROXY?{proxy:{server:process.env.BROWSER_PROXY}}:{})}),rows=[],errors=[];
try{
 for(const prefix of ['', 'zh-cn/'])for(const width of [390,1440]){
  const p=await b.newPage({viewport:{width,height:900},serviceWorkers:'block'});p.on('pageerror',e=>errors.push(e.message));
  await (await p.context().newCDPSession(p)).send('Emulation.setCPUThrottlingRate',{rate:4});
  await p.route('**/experience-upgrade.js',async r=>{await new Promise(resolve=>setTimeout(resolve,1200));await r.continue();});
  await p.addInitScript(()=>{window.qaShifts=[];new PerformanceObserver(list=>{for(const s of list.getEntries())if(!s.hadRecentInput)qaShifts.push({value:s.value,time:s.startTime,sources:s.sources.map(x=>x.node?.id||x.node?.className||x.node?.tagName)});}).observe({type:'layout-shift',buffered:true});});
  await p.goto(base+'/'+prefix);await p.waitForFunction(()=>document.documentElement.dataset.gameReady==='true');await p.evaluate(()=>window.retentionReady);await p.evaluate(()=>window.localeReady);await p.waitForTimeout(1600);
  assert.equal(await p.locator('.world-clock').count(),1);assert.equal(await p.locator('#view-intro .reading-navigation').count(),0);
  assert(await p.locator('#btnStart').isEnabled());assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const shifts=await p.evaluate(()=>qaShifts),total=shifts.reduce((n,s)=>n+s.value,0);assert(total<.1,JSON.stringify({prefix,width,total,shifts}));
  if(prefix)assert(!(await p.locator('body').innerText()).includes('Stripe test mode only.'));
  await p.screenshot({path:out+'/home-'+(prefix?'zh-cn':'en')+'-'+width+'.png'});
  await p.locator('#countrySelect').selectOption('JPN');await p.locator('#btnStartSelected').click();await p.waitForFunction(()=>!document.querySelector('#birthCertConfirm').disabled);await p.locator('#birthCertConfirm').click();
  assert.equal(await p.evaluate(()=>STATE.life.country),'JPN');assert(await p.locator('#view-life').isVisible());
  const frame=await p.locator('.home-preview-frame').evaluate(el=>({width:el.style.width,aspect:getComputedStyle(el).aspectRatio}));assert.equal(frame.aspect,'16 / 9');
  rows.push({prefix,width,layoutShiftSum:total,shifts,gameStart:'JPN'});await p.close();console.log('PASS layout and game start',prefix||'en',width,total);
 }
 let expected;
 for(const prefix of ['', 'zh-cn/','es/','pt-br/','fr/','de/']){
  const p=await b.newPage();await p.goto(base+'/'+prefix+'sources/');if(prefix)await p.waitForFunction(()=>document.documentElement.dataset.localeReady==='true');
  const codes=await p.locator('code').allTextContents();if(!prefix)expected=codes;else assert.deepEqual(codes,expected,prefix+' runtime field identifiers');
  await p.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({base,method:'Chrome, 4x CPU, delayed enhancement module, 390/1440px; layout shift sum in laboratory only, not CrUX p75.',rows,errors,literalFieldParity:true},null,2));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
