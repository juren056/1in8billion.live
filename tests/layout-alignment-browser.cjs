const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const base=process.env.LAYOUT_BASE||'http://127.0.0.1:4186',phase=process.env.LAYOUT_PHASE||'after',out='audit/layout-alignment-20261023';
function inspect(){
 const failures=[],alignments=[];
 const visible=e=>e.checkVisibility({checkVisibilityCSS:true})&&e.getClientRects().length;
 const right=s=>s.textAlign==='right'||s.textAlign==='end';
 for(const table of document.querySelectorAll('table')){
  if(!visible(table))continue;
  const heads=[...(table.tHead?.rows[0]?.cells||[])];
  heads.forEach((h,index)=>{
   if(h.colSpan!==1)return;
   const cells=[...table.tBodies].flatMap(body=>[...body.rows].map(r=>r.cells[index])).filter(c=>c?.colSpan===1&&c.tagName==='TD');
   const nums=cells.filter(c=>c.hasAttribute('data-numeric'));
   if(!nums.length)return;
   const expected=right(getComputedStyle(nums[0]));
   if(right(getComputedStyle(h))!==expected)alignments.push({table:table.className||table.id||'table',column:index,heading:h.textContent.trim(),header:getComputedStyle(h).textAlign,value:getComputedStyle(nums[0]).textAlign});
  });
 }
 for(const e of document.querySelectorAll('button,a.primary-link,.story-person,.state-row,.compare-controls label')){
  if(!visible(e)||!e.textContent.trim())continue;
  const r=e.getBoundingClientRect();
  if(r.width<1||e.closest('.table-scroll,.sample-grid,.life-events-feed,dialog:not([open])'))continue;
  if(r.left < -2||r.right>innerWidth+2)failures.push({kind:'outside',element:e.id||e.className,text:e.textContent.trim().slice(0,60),left:Math.round(r.left),right:Math.round(r.right)});
  if(e.tagName==='BUTTON'&&(e.scrollWidth>e.clientWidth+2||e.scrollHeight>e.clientHeight+2))failures.push({kind:'control-clipped',element:e.id||e.className,text:e.textContent.trim().slice(0,60)});
 }
 return{overflow:document.documentElement.scrollWidth>innerWidth+1,alignments,failures,tables:[...document.querySelectorAll('table')].filter(visible).length};
}
(async()=>{
 if(base.includes('127.0.0.1'))await require('./story-test-server.cjs')();
 fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({channel:'chrome'}),rows=[],errors=[];
 const widths=[320,390,768,1024,1440],themes=['blue','journal','editorial','night'];
 let cursor=0;const routes=JSON.parse(fs.readFileSync('dist/routes.json','utf8'));
 if(process.env.LAYOUT_DYNAMIC_ONLY){const saved=JSON.parse(fs.readFileSync(out+'/'+phase+'-routes.json','utf8'));rows.push(...saved.rows);errors.push(...saved.errors);cursor=routes.length;}
 async function context(){const c=await b.newContext({serviceWorkers:'block',reducedMotion:'reduce'});await c.route(/google-analytics|googletagmanager|clarity\.ms/,r=>r.fulfill({status:204,body:''}));return c;}
 async function matrix(p,route){for(const width of widths){await p.setViewportSize({width,height:1000});for(const theme of themes){await p.evaluate(t=>document.documentElement.dataset.appearance=t,theme);const result={route,width,theme,...await p.evaluate(inspect)};rows.push(result);}}}
 try{
  const publicContext=await context();while(cursor<routes.length){const p=await publicContext.newPage();p.on('pageerror',e=>errors.push(e.message));const route=routes[cursor++];await p.goto(base+route);if(await p.locator('table').count())await p.waitForFunction(()=>[...document.querySelectorAll('table')].every(t=>t.dataset.columns));await p.evaluate(()=>document.fonts.ready);await matrix(p,route);await p.close();fs.writeFileSync(out+'/'+phase+'-routes.json',JSON.stringify({rows,errors}));if(cursor%40===0)console.log('LAYOUT routes',cursor,'/',routes.length);}
  await publicContext.close();const c=await context(),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'/zh-cn/');await p.waitForFunction(()=>document.documentElement.dataset.storyExperience==='ready');
  await p.evaluate(()=>{p1Incoming={rulesVersion:3};p1PendingSeed='story-ui';startLife('JPN');stopTicker();STATE.autoDecide=true;while(STATE.life.age<20&&!STATE.life.died){STATE.paused=false;tick();}stopTicker();STATE.paused=true;renderLife();});
  for(const state of ['life','end','lab','shortcuts']){
   if(state==='end'){await p.goto(base+'/zh-cn/');await p.waitForFunction(()=>document.documentElement.dataset.storyExperience==='ready');await p.evaluate(()=>{p1Incoming={rulesVersion:3};p1PendingSeed='story-ui';startLife('JPN');stopTicker();STATE.autoDecide=true;let count=0;while(!STATE.life.died&&count++<160){STATE.paused=false;tick();}if(!STATE.life.died)throw Error('Layout fixture did not finish');stopTicker();});}
   if(state==='lab')await p.evaluate(()=>{setView('lab');displayLabResultsCompare(runLab('JPN','now','random',100),runLab('IND','now','random',100));});
   if(state==='shortcuts')await p.evaluate(()=>showShortcutsModal());
   await p.evaluate(()=>document.querySelectorAll('.view.active details').forEach(e=>e.open=true));
   await p.waitForFunction(()=>[...document.querySelectorAll('table')].every(t=>t.dataset.columns));
   await matrix(p,'dynamic-'+state);
   await p.setViewportSize({width:1440,height:1000});await p.evaluate(()=>document.documentElement.dataset.appearance='night');
   const table=p.locator('table:visible').first();if(await table.count())await table.locator('..').screenshot({path:out+'/'+phase+'-'+state+'-1440.png'});
  }
  await c.close();
  fs.writeFileSync(out+'/'+phase+'.json',JSON.stringify({base,routes:routes.length,rows,errors},null,2));
  const bad=rows.filter(r=>r.overflow||r.alignments.length||r.failures.length);console.log(JSON.stringify({states:rows.length,bad:bad.length,examples:bad.slice(0,5),errors:errors.slice(0,4)}));
  if(phase!=='before'){assert.equal(bad.length,0);assert.deepEqual(errors,[]);}
 }finally{fs.writeFileSync(out+'/'+phase+'-partial.json',JSON.stringify({rows,errors},null,2));await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
