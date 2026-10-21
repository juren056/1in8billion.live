const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.SEO_BASE||'http://127.0.0.1:4186',out='audit/seo-geo-20261021/recovery';
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({channel:'chrome',headless:true}),rows=[];try{
 for(const fault of['script','data','timeout','delay','offline']){
  console.log('TEST',fault);const p=await b.newPage({viewport:{width:390,height:844},serviceWorkers:'block'});await p.goto(base+'/');await p.waitForFunction(()=>document.documentElement.dataset.gameReady==='true');await p.evaluate(()=>window.retentionReady);
  await p.locator('#btnStart').click();await p.waitForFunction(()=>!document.querySelector('#birthCertConfirm').disabled);await p.locator('#birthCertConfirm').click();await p.evaluate(()=>{stopTicker();STATE.paused=true;saveCurrentLife();});
  const saved=await p.evaluate(()=>localStorage.getItem('born-somewhere-v2:current'));assert(saved&&JSON.parse(saved).life,'Actual current-life save must exist');
  if(fault==='script')await p.route('**/app.js',r=>r.abort());
  if(fault==='data')await p.route('**/data/countries.json',r=>r.fulfill({status:503,body:'unavailable'}));
  if(fault==='timeout')await p.route('**/data/countries.json',async r=>{await new Promise(resolve=>setTimeout(resolve,18000));try{await r.continue();}catch{}});
  if(fault==='delay')await p.route('**/data/countries.json',async r=>{await new Promise(resolve=>setTimeout(resolve,1500));await r.continue();});
  if(fault==='offline'){await p.context().setOffline(true);await p.reload().catch(()=>{});await p.context().setOffline(false);}else await p.reload();
  if(['script','data','timeout'].includes(fault)){await p.locator('#gameLoadState button').waitFor({timeout:22000});assert(await p.locator('#btnStart').isDisabled());assert.equal(await p.evaluate(()=>localStorage.getItem('born-somewhere-v2:current')),saved);await p.screenshot({path:out+'/'+fault+'.png'});await p.unrouteAll({behavior:'ignoreErrors'});await p.locator('#gameLoadState button').click();}
  else if(fault==='offline')await p.reload();
  await p.waitForFunction(()=>document.documentElement.dataset.gameReady==='true');assert.equal(await p.evaluate(()=>localStorage.getItem('born-somewhere-v2:current')),saved);await p.locator('#resumeLife').waitFor();await p.locator('#resumeLife').click();assert.equal(await p.evaluate(()=>STATE.life.name.full),JSON.parse(saved).life.name.full);rows.push({fault,saved:true,recovered:true});await p.close();console.log('PASS save-preserving recovery',fault);
 }
 fs.writeFileSync(out+'/report.json',JSON.stringify(rows,null,2));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
