const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const base=process.env.SEO_BASE||'http://127.0.0.1:4186';
const out=process.env.SEO_STORY_OUT||'audit/seo-geo-20261021';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',...(process.env.BROWSER_PROXY?{proxy:{server:process.env.BROWSER_PROXY}}:{})}),rows=[],errors=[];
 fs.mkdirSync(out+'/browser',{recursive:true});
 try{
  for(const[lang,prefix,internal]of[['en','','en'],['ja','ja/','ja'],['ko','ko/','ko'],['zh-TW','zh-tw/','zh-Hant'],['zh-CN','zh-cn/','en'],['es','es/','en'],['pt-BR','pt-br/','en'],['fr','fr/','en'],['de','de/','en']])for(const width of[390,1440]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(base+'/'+prefix+'#run=v2.sampleus.USA.now.'+internal+'.0.202610');
   await page.evaluate(()=>window.retentionReady);
   await page.waitForSelector('#playbackGuide',{state:'attached'});
   await page.locator('#startReplay').click();
   await page.evaluate(()=>{stopTicker();for(let i=0;i<5&&!STATE.life.died;i++)tick();});
   const lifeText=await page.locator('body').innerText();
   if(lang!=='en')assert(!/no major event this year yet/i.test(lifeText),lang+' untranslated empty event');
   assert(!/life\.noMajorEvent/.test(lifeText));
   await page.screenshot({path:out+'/browser/life-'+lang+'-'+width+'.png'});
   await page.evaluate(()=>{let i=0;while(!STATE.life.died&&i++<200)tick();});
   assert(await page.locator('#view-end').isVisible());
   const visible=await page.locator('body').innerText();
   assert(!/\{(?:age|le|n)\}|\blab\.(?:country|sex|run|start)\b/.test(visible));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:out+'/browser/ending-'+lang+'-'+width+'.png'});
   rows.push({lang,width,age:await page.evaluate(()=>STATE.life.age),completed:true});
   await page.close();
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(out+'/story-states.json',JSON.stringify({base,rows,errors},null,2));
  console.log('PASS 18 actual localized life/ending journeys and 36 screenshots');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
