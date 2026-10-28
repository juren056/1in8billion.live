from pathlib import Path
import json, os
from playwright.sync_api import sync_playwright

out=Path('audit/reference-workbench-20261028');out.mkdir(parents=True,exist_ok=True)
base=os.environ.get('SIMULATOR_BASE','http://127.0.0.1:4186')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 page=browser.new_page(viewport={'width':1760,'height':1000},reduced_motion='reduce')
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.route('**/*google-analytics.com/**',lambda r:r.abort())
 page.route('**/*clarity.ms/**',lambda r:r.abort())
 page.goto(base+'/zh-cn/',wait_until='networkidle')
 page.wait_for_function('!!window.SimulatorShell')
 assert page.locator('.topbar .appearance-menu').is_visible(),'Homepage appearance control must remain in the header'
 page.evaluate("p1PendingSeed='shell-regression';p1Incoming={rulesVersion:6}")
 page.locator('#countrySelect').select_option('JPN');page.locator('#btnStartSelected').click()
 page.wait_for_function("!document.querySelector('#birthCertConfirm').disabled && !document.querySelector('.rebirth-stage')",timeout=25000)
 page.locator('#birthCertConfirm').click();page.wait_for_timeout(250)
 assert page.evaluate('!STATE.paused')
 page.evaluate('stopTicker();STATE.paused=true;renderLife();')
 page.locator('.workbench-actions .appearance-menu>summary').click()
 assert page.locator('.workbench-actions .appearance-options').is_visible()
 page.locator('.workbench-actions .appearance-menu>summary').click()
 metrics=[]
 for width,height in [(320,740),(390,844),(768,1024),(1100,850),(1440,1000),(1760,1000)]:
  page.set_viewport_size({'width':width,'height':height})
  for theme in ['blue','journal','editorial','night']:
   page.evaluate('(theme)=>document.documentElement.dataset.appearance=theme',theme)
   m=page.evaluate('''() => ({width:innerWidth,theme:document.documentElement.dataset.appearance,pageWidth:document.documentElement.scrollWidth,scene:document.querySelector('#livingScene').getBoundingClientRect().toJSON(),story:document.querySelector('.life-play-story').getBoundingClientRect().toJSON(),left:document.querySelector('.story-identity').getBoundingClientRect().toJSON(),right:document.querySelector('.story-rail').getBoundingClientRect().toJSON(),toolbar:document.querySelector('.simulator-toolbar').getBoundingClientRect().toJSON(),nested:[...document.querySelectorAll('#view-life *')].filter(e=>e.getClientRects().length&&['auto','scroll'].includes(getComputedStyle(e).overflowY)&&e.scrollHeight>e.clientHeight+4).map(e=>e.id||e.className)})''')
   if width in [390,1760]:page.screenshot(path=str(out/f'{width}-{theme}.png'))
   assert m['pageWidth']<=width,m
   assert not m['nested'],m
   assert m['scene']['height']>80,m
   if width>=1200:
    assert abs(m['scene']['top']-m['left']['top'])<4,m
    assert m['story']['width']>m['left']['width']*1.6,m
    assert m['right']['width']>200,m
    assert page.locator('#btnAuto').is_visible()
    assert page.locator('#btnSkip').is_visible()
   if width<761:assert m['story']['width']>=width-34,m
   metrics.append(m)
 page.set_viewport_size({'width':1760,'height':1000})
 for rate in [1,2,4,8,12,16]:
  page.locator(f'[data-workbench-rate="{rate}"]').click()
  assert page.evaluate('STATE.speed')==rate
  assert page.locator(f'[data-workbench-rate="{rate}"]').get_attribute('aria-pressed')=='true'
 page.evaluate('stopTicker();STATE.paused=true;saveCurrentLife();')
 page.reload(wait_until='networkidle');page.wait_for_function('!!window.SimulatorShell')
 if not page.locator('#view-life').is_visible():
  page.locator('#resumeLife').click()
 assert page.evaluate('STATE.speed')==16,'16× must survive reload'
 page.evaluate('stopTicker();STATE.paused=true;renderLife();')
 page.locator('.workbench-actions #writeMemory').click()
 assert page.locator('#pauseModal').is_visible()
 page.keyboard.press('Escape')
 page.locator('.workbench-actions>button').filter(has_text='音乐').click()
 assert page.locator('#simulatorSettings .life-sound[open]').is_visible()
 page.keyboard.press('Escape')
 page.set_viewport_size({'width':390,'height':844})
 page.locator('[data-simulator-panel="people"]').click()
 assert page.locator('#lifeCert').is_visible()
 assert page.locator('.story-family').is_visible()
 assert page.locator('.workbench-map').is_visible()
 page.locator('[data-simulator-panel="details"]').click()
 assert page.locator('#lifeSecondary').is_visible()
 page.locator('[data-simulator-panel="story"]').click()
 page.locator('.simulator-more').click()
 assert page.locator('#simulatorSettings').is_visible()
 assert page.locator('#simulatorSettings #btnAuto').is_visible()
 page.keyboard.press('Escape')
 page.evaluate('''() => {stopTicker();STATE.autoDecide=false;for(let n=0;n<30&&!STATE.life.storyPending&&!STATE.life.died;n++){STATE.paused=false;tick();}stopTicker();STATE.paused=true;renderLife();}''')
 page.wait_for_selector('#storyMomentDialog[open]')
 page.screenshot(path=str(out/'mobile-choice.png'))
 page.locator('[data-option="0"]').click();page.locator('[data-story="continue"]').click()
 page.evaluate('stopTicker();STATE.paused=true;renderLife();')
 page.set_viewport_size({'width':1760,'height':1000})
 page.locator('.workbench-actions>button').filter(has_text='离开').click()
 assert page.locator('#view-intro').is_visible()
 assert page.locator('.topbar .appearance-menu').is_visible(),'Leaving life must restore appearance to home'
 assert not errors,errors
 result={'base':base,'layouts':metrics,'rates':[1,2,4,8,12,16],'restoredRate':16,'errors':errors}
 (out/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8')
 print(json.dumps({'layouts':len(metrics),'errors':errors}))
 browser.close()
