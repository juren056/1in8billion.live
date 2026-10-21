// Preload for all browser QA: real vendor telemetry must never receive synthetic players.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const launch=chromium.launch.bind(chromium);
chromium.launch=async(...args)=>{const browser=await launch(...args),page=browser.newPage.bind(browser),context=browser.newContext.bind(browser);
 const quiet=async c=>{c.on('requestfailed',r=>{if(r.url().startsWith('http://127.0.0.1:4186/'))console.log('QA_NETWORK',r.url(),r.failure()?.errorText);});c.on('weberror',e=>console.log('QA_SCRIPT',e.error().message));await c.route(/https:\/\/(?:[^/]+\.)?(?:clarity\.ms|google-analytics\.com|googletagmanager\.com)\//,r=>r.fulfill({body:''}));return c;};
 browser.newContext=async(...a)=>quiet(await context(...a));
 browser.newPage=async(...a)=>{const p=await page(...a);await quiet(p.context());return p;};return browser;};
