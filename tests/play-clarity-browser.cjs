const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.CLARITY_BASE||'http://127.0.0.1:4186',out=process.env.CLARITY_OUTPUT||'audit/clarity-1.14.0';
const locales=[['en',''],['ja','ja/'],['ko','ko/'],['zh-TW','zh-tw/'],['zh-CN','zh-cn/'],['es','es/'],['pt-BR','pt-br/'],['fr','fr/'],['de','de/']];
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true,...(process.env.BROWSER_PROXY?{proxy:{server:process.env.BROWSER_PROXY}}:{})}),errors=[],rows=[];try{
 for(const [lang,prefix]of locales)for(const width of [390,1440]){
  const p=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});await p.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'/'+prefix+'#run=v1.sampleus.USA.now.'+({ja:'ja',ko:'ko','zh-TW':'zh-Hant'}[lang]||'en')+'.0');await p.evaluate(()=>window.retentionReady);await p.locator('#startReplay').click();await p.locator('#readCurrentEvent').click();await p.evaluate(()=>window.localeReady);
  assert.equal(await p.evaluate(()=>STATE.life.age),0);assert((await p.locator('#lifeThisYearBody').innerText()).length>10);assert.equal(await p.locator('#lifeThisYear .muted').count(),0);assert(!(await p.locator('#lifeThisYearBody').innerText()).includes('event.birth'));assert(await p.locator('#btnAuto').evaluate(el=>el.scrollHeight<=el.clientHeight+1));
  assert(await p.evaluate(()=>{const s=document.querySelector('.life-play-story'),ids=[...s.children].map(e=>e.id);return ids.indexOf('lifeThisYear')<ids.indexOf('lifeCommandBar')&&ids.indexOf('warmLifeScene')<ids.indexOf('lifeManualDecisions');}));
  assert(await p.locator('#lifeSecondary').evaluate(d=>d.open));assert(await p.locator('.early-strategy-note').isVisible());assert.equal(await p.locator('.playback-secondary #btnAuto').count(),1);
  if(lang==='zh-CN'||lang==='en')await p.screenshot({path:`${out}/${lang}-${width}-beginning.png`});
  await p.locator('#btnAuto').click();await p.locator('#btnSkip').click();await p.waitForFunction(()=>STATE.life.age===18&&Playback.waiting());
  for(const age of [18,25,35,50]){
   const result=await p.evaluate(()=>{const choices=financialChoices(STATE.life.age),index=choices.reduce((b,x,n)=>x.delta.net<choices[b].delta.net?n:b,0),current=STATE.life.stats.netAssets||0;return{age:STATE.life.age,id:choices[index].id,current,after:Math.max(-100000,current+choices[index].delta.net),rows:choices.map(c=>Math.max(-100000,current+c.delta.net))};});assert.equal(result.age,age);
   assert.equal(Number(await p.locator('[data-current-assets]').getAttribute('data-current-assets')),result.current);assert.deepEqual(await p.locator('[data-after-assets]').evaluateAll(els=>els.map(e=>Number(e.dataset.afterAssets))),result.rows);
   const label=await p.locator('[data-decision="default"]').innerText();assert(!/Use default this time|本次使用默认选项/.test(label));assert(await p.locator('#defaultDecisionRule').isVisible());assert(await p.locator('#btnPause').isDisabled());
   await p.waitForTimeout(150);assert.equal(await p.evaluate(()=>STATE.life.age),age);
   if(age===18&&(lang==='zh-CN'||lang==='en'))await p.screenshot({path:`${out}/${lang}-${width}-decision.png`});
   await p.locator('[data-decision="default"]').click();const chosen=await p.evaluate(()=>({choice:STATE.life.financeDecisions.at(-1),assets:STATE.life.stats.netAssets}));assert.equal(chosen.choice.id,result.id);assert.equal(chosen.assets,result.after);
   if(age<50){await p.locator('#btnSkip').click();await p.waitForFunction(()=>Playback.waiting()||STATE.life.died);assert(!await p.evaluate(()=>STATE.life.died),'sample survives all decisions');}
  }
  assert(await p.locator('.early-strategy-note').isHidden());assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));rows.push({lang,width,defaultAges:[18,25,35,50],sourceYear:await p.evaluate(()=>STATE.life.year)});await p.close();console.log('PASS clarity',lang,width);
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({base,rows,errors},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
