const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.SEO_BASE||'http://127.0.0.1:4186',out=process.env.SEO_OUTPUT||'audit/seo-geo-20261021/browser';
const locales=[['en',''],['ja','ja/'],['ko','ko/'],['zh-TW','zh-tw/'],['zh-CN','zh-cn/'],['es','es/'],['pt-BR','pt-br/'],['fr','fr/'],['de','de/']];
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({channel:'chrome',headless:true}),rows=[],errors=[];
try{for(const[lang,prefix]of locales)for(const width of[360,390,1440]){
 const p=await b.newPage({viewport:{width,height:width===360?800:width===390?844:900},reducedMotion:'reduce',acceptDownloads:true});p.on('pageerror',e=>errors.push({lang,width,message:e.message}));
 for(const type of['','birth-odds/','compare/','countries/','guides/quick-play/','keepsake/']){
  const res=await p.goto(base+'/'+prefix+type);assert.equal(res.status(),200);
  if(!type){await p.waitForFunction(()=>document.documentElement.dataset.gameReady==='true');await p.evaluate(()=>window.retentionReady);await p.evaluate(()=>window.localeReady);assert(await p.locator('#btnStart').isEnabled());const rect=await p.locator('#btnStart').boundingBox();assert(rect.y+rect.height<=p.viewportSize().height);}
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),lang+type+' overflow '+width);
  const visible=await p.locator('body').innerText();assert(!/\b(?:lab\.(?:country|sex|run|start))\b|\{(?:age|le|n)\}/.test(visible),lang+type+' bare interpolation');
  if(lang!=='en')assert(!/Family Tree|Past life records|Not started|Import GEDCOM|Country B \(compare/.test(visible),lang+type+' untranslated UI');
  if(width!==360)await p.screenshot({path:out+'/'+lang+'-'+width+'-'+(type.replaceAll('/','')||'home')+'.png',fullPage:false});
  rows.push({lang,width,type,status:res.status()});
 }
 await p.goto(base+'/'+prefix+'birth-odds/?country=IND&mode=population');await p.waitForFunction(()=>!document.querySelector('#oddsMode').disabled);
 assert.equal(await p.locator('#oddsCountry').inputValue(),'IND');assert.equal(await p.locator('#oddsMode').inputValue(),'population');
 await p.locator('#oddsCountry').selectOption('JPN');await p.locator('#oddsMode').selectOption('births');assert((await p.locator('#oddsPlay').getAttribute('href')).endsWith('?country=JPN'));
 await p.locator('#oddsSearch').fill('no-country-xyz');assert(await p.locator('#oddsEmpty').isVisible());await p.locator('#oddsSearch').fill('');
 await p.locator('#oddsCountry').selectOption('JPN');await p.locator('#oddsMode').selectOption('population');await p.locator('.language-menu summary').click();const target=p.locator('.language-menu a[lang="'+(lang==='fr'?'en':'fr')+'"]');console.log('language target',lang,width,await target.getAttribute('href'));await target.click();await p.waitForFunction(()=>document.querySelector('#oddsMode')&&!document.querySelector('#oddsMode').disabled);assert.equal(await p.locator('#oddsCountry').inputValue(),'JPN');assert.equal(await p.locator('#oddsMode').inputValue(),'population');
 await p.close();console.log('PASS localized landings, viewport and odds persistence',lang,width);
}
// Static answers and the complete table survive unavailable JavaScript.
const no=await b.newPage({javaScriptEnabled:false});await no.goto(base+'/birth-odds/');assert.equal(await no.locator('tbody tr').count(),172);assert(await no.locator('#oddsCountry').isDisabled());await no.close();
const fail=await b.newPage();await fail.route('**/data/countries.json',r=>r.fulfill({status:503,body:'unavailable'}));await fail.goto(base+'/birth-odds/');await fail.locator('#oddsRetry').waitFor();assert.equal(await fail.locator('tbody tr').count(),172);await fail.unroute('**/data/countries.json');await fail.locator('#oddsRetry').click();await fail.waitForFunction(()=>!document.querySelector('#oddsMode').disabled);assert(await fail.locator('#oddsError').isHidden());await fail.close();
assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({base,rows,errors,staticTableRows:172,retryRecovered:true},null,2));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
