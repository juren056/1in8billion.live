from pathlib import Path
import os,json
from playwright.sync_api import sync_playwright

base=os.environ.get('SIMULATOR_BASE','http://127.0.0.1:4186')
out=Path(os.environ.get('SIMULATOR_AUDIT_OUT','audit/simulator-shell-20261027'));out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(headless=True)
 checks=[];errors=[]
 for locale in ['', 'zh-cn/','zh-tw/','ja/','ko/','es/','pt-br/','fr/','de/','ru/']:
  context=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce')
  page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(base+'/'+locale,wait_until='networkidle')
  page.wait_for_function('!!window.SimulatorShell',timeout=30000)
  page.locator('#countrySelect').select_option('JPN')
  page.evaluate("p1Incoming={rulesVersion:6};p1PendingSeed='shell-regression';")
  page.locator('#btnStartSelected').click()
  page.wait_for_function("!document.querySelector('#birthCertConfirm').disabled && !document.querySelector('.rebirth-stage')",timeout=15000)
  page.locator('#birthCertConfirm').click()
  page.wait_for_timeout(80)
  page.evaluate('stopTicker();STATE.paused=true;renderLife();')
  assert page.locator('.simulator-summary').is_visible()
  tabs=page.locator('.simulator-tabs button').all_inner_texts()
  assert len(tabs)==4 and all(tabs),tabs
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.set_viewport_size({'width':1440,'height':1000})
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),locale+' desktop overflow'
  assert page.locator('.workbench-masthead #btnAuto').is_visible()
  assert page.locator('.workbench-masthead [data-workbench-rate="16"]').is_visible()
  page.set_viewport_size({'width':390,'height':844})
  page.locator('[data-simulator-panel="people"]').click()
  assert page.locator('#lifeCert').is_visible()
  page.locator('[data-simulator-panel="details"]').click()
  assert page.locator('#lifeSecondary').is_visible()
  page.locator('[data-simulator-panel="story"]').click()
  page.locator('.simulator-more').click()
  assert page.locator('#simulatorSettings[open]').count()==1
  page.keyboard.press('Escape')
  if locale=='zh-cn/':
   page.evaluate('''() => {for(let n=0;n<20&&!STATE.life.storyPending&&!STATE.life.died;n++){STATE.paused=false;tick();}stopTicker();STATE.paused=true;renderLife();}''')
   page.wait_for_selector('#storyMomentDialog[open]');page.keyboard.press('Escape')
   pending=page.evaluate('STATE.life.storyPending.id')
   page.reload(wait_until='networkidle');page.wait_for_function('!!window.SimulatorShell',timeout=30000)
   page.locator('#resumeLife').click()
   assert page.evaluate('STATE.life.storyPending.id')==pending
   page.locator('#simulatorChoose').click();page.locator('[data-option="0"]').click();page.locator('[data-story="continue"]').click()
   page.evaluate('stopTicker();STATE.paused=true;renderLife();')
   page.locator('.simulator-more').click();page.locator('#mdFocusBtn').click()
   assert not page.locator('#simulatorSettings[open]').count()
   assert page.locator('#focusModal').is_visible()
   page.locator('#focusModal [data-focus="study"]').click()
   page.wait_for_selector('#storyMomentDialog[open]');page.locator('[data-story="continue"]').click()
   page.evaluate('stopTicker();STATE.paused=true;renderLife();')
   page.evaluate('''() => {STATE.autoDecide=true;for(let n=0;n<160&&!STATE.life.died;n++){STATE.paused=false;tick();}stopTicker();}''')
   assert page.evaluate('STATE.life.died && STATE.view==="end"')
   page.screenshot(path=str(out/'mobile-completed-life.png'),full_page=True)
   (out/'ending.txt').write_text(page.locator('body').inner_text(),encoding='utf-8')
   assert page.locator('#premiumOffer').is_visible()
   assert not page.locator('.simulator-toolbar').is_visible()
   page.screenshot(path=str(out/'mobile-completed-life.png'))
   checks.append('pending choice refresh, focus action, full life and keepsake offer')
  checks.append({'locale':locale or 'en','tabs':tabs})
  context.close()
 assert not errors,errors
 (out/'regression.json').write_text(json.dumps({'checks':checks,'errors':errors,'url':base},ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps({'checks':checks,'errors':errors},ensure_ascii=True))
 b.close()
