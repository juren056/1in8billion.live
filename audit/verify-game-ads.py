from pathlib import Path
from playwright.sync_api import sync_playwright
import json,os
base=os.environ.get('SIMULATOR_BASE','http://127.0.0.1:4186');out=Path('audit/no-ad-switches-20261030');out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True);page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
 errors=[];requests=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.route('**/*google-analytics.com/**',lambda r:r.abort());page.route('**/*clarity.ms/**',lambda r:r.abort())
 page.route('**/api/ads/config',lambda r:r.fulfill(content_type='application/json',body='{"allowed":true,"personalized":false}'))
 def mock(route):
  requests.append(route.request.url);route.fulfill(content_type='application/javascript',body="window.adsbygoogle.push=function(){window.adPushes=(window.adPushes||0)+1;const a=[...document.querySelectorAll('ins.adsbygoogle')].find(e=>!e.dataset.mock);if(a){a.dataset.mock='1';a.textContent='TEST AD PLACEMENT';a.style.background='#dde5e9';a.style.color='#172333';a.style.textAlign='center';}};")
 page.route('https://pagead2.googlesyndication.com/**',mock)
 page.goto(base+'/zh-cn/',wait_until='networkidle');page.wait_for_function('document.documentElement.dataset.gameWorkspace==="ready"')
 top=page.locator('[data-placement="home-top"]');lower=page.locator('[data-placement="home-lower"]');game=page.locator('[data-placement="simulator"]')
 top.scroll_into_view_if_needed();page.wait_for_selector('[data-placement="home-top"] ins');assert page.locator('.ad-permission,.ad-controls').count()==0
 lower.scroll_into_view_if_needed();page.wait_for_selector('[data-placement="home-lower"] ins');assert len(requests)==1
 for name in ['home-world','home-stories']:
  extra=page.locator('[data-placement="'+name+'"]');extra.scroll_into_view_if_needed();page.wait_for_selector('[data-placement="'+name+'"] ins');assert len(requests)==1;page.screenshot(path=str(out/f'{name}-390.png'))
 assert page.locator('[data-ad-view="intro"]').count()==4
 assert page.evaluate("document.querySelector('[data-placement=home-world]').parentElement.previousElementSibling.matches('.world-clock')&&document.querySelector('[data-placement=home-stories]').parentElement.previousElementSibling.id==='completeExamples'")
 for width,height in [(320,740),(390,844),(1440,1000)]:
  page.set_viewport_size({'width':width,'height':height})
  for theme in ['blue','journal','editorial','night']:
   page.evaluate('t=>document.documentElement.dataset.appearance=t',theme);top.scroll_into_view_if_needed();assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   if width in [390,1440] and theme=='night':top.screenshot(path=str(out/f'home-{width}.png'))
 page.set_viewport_size({'width':390,'height':844});page.locator('#countrySelect').select_option('JPN');page.evaluate("p1Incoming={rulesVersion:6};p1PendingSeed='game-ads';")
 page.locator('#btnStartSelected').click();page.wait_for_function("!!document.querySelector('dialog[open],.modal:not([hidden])')");page.wait_for_function("[...document.querySelectorAll('[data-ad-view]')].every(e=>e.hidden)")
 page.wait_for_function("!document.querySelector('#birthCertConfirm').disabled&&!document.querySelector('.rebirth-stage')",timeout=30000)
 page.locator('#birthCertConfirm').click();assert page.evaluate('STATE.view==="life"&&!STATE.paused');page.evaluate('stopTicker();STATE.paused=true;')
 game.scroll_into_view_if_needed();page.wait_for_selector('[data-placement="simulator"] ins');assert len(requests)==1
 gap=page.evaluate("document.querySelector('[data-placement=simulator]').getBoundingClientRect().top-document.querySelector('#view-life').getBoundingClientRect().bottom")
 assert gap>=150,gap
 for width,height in [(390,844),(1440,1000)]:
  page.set_viewport_size({'width':width,'height':height})
  for theme in ['blue','journal','editorial','night']:
   page.evaluate('t=>document.documentElement.dataset.appearance=t',theme);game.scroll_into_view_if_needed();assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   if theme=='night':game.screenshot(path=str(out/f'simulator-{width}.png'))
 before=page.evaluate('window.adPushes');page.evaluate("setView('shelf')");page.wait_for_function("document.querySelector('[data-placement=simulator]').closest('[data-ad-view]').hidden");page.evaluate("setView('life');stopTicker();STATE.paused=true;");game.scroll_into_view_if_needed();assert page.evaluate('window.adPushes')==before
 page.set_viewport_size({'width':390,'height':844});page.locator('[data-simulator-panel="memories"]').click();page.wait_for_function("document.querySelector('[data-placement=simulator]').closest('[data-ad-view]').hidden");page.locator('[data-simulator-panel="story"]').click();game.scroll_into_view_if_needed();assert page.evaluate('window.adPushes')==before
 # Existing visitor opt-out remains effective without showing a new question.
 page.evaluate("localStorage.setItem('1in8billion:advertising-choice:v1',JSON.stringify({value:'deny',at:Date.now()}))")
 page.goto(base+'/zh-cn/guides/quick-play/',wait_until='networkidle');page.locator('[data-content-ad]').first.scroll_into_view_if_needed();page.wait_for_function("[...document.querySelectorAll('[data-content-ad]')].every(e=>e.hidden)");assert page.locator('ins.adsbygoogle').count()==0 and page.locator('.ad-controls,.ad-permission').count()==0
 page.goto(base+'/zh-cn/privacy/',wait_until='networkidle');page.locator('#advertisingPrivacyChoice').click();assert page.evaluate("localStorage.getItem('1in8billion:advertising-choice:v1')===null")
 page.evaluate('localStorage.clear()')
 page.goto(base+'/zh-cn/guides/quick-play/',wait_until='networkidle')
 slots=page.locator('[data-content-ad]');assert 1<=slots.count()<=2
 for slot in slots.all():slot.scroll_into_view_if_needed();page.wait_for_function('e=>!!e.querySelector("ins")',arg=slot.element_handle())
 assert page.locator('.ad-permission,.ad-controls').count()==0
 page.unroute('**/api/ads/config');page.route('**/api/ads/config',lambda r:r.fulfill(content_type='application/json',body='{"allowed":false}'))
 page.goto(base+'/zh-cn/',wait_until='networkidle');page.locator('[data-placement="home-top"]').scroll_into_view_if_needed();page.wait_for_function("[...document.querySelectorAll('[data-ad-view]')].every(e=>e.hidden)")
 assert not errors,errors
 result={'base':base,'homeSlots':4,'simulatorSlots':1,'simulatorGap':gap,'sharedSdk':True,'noPermissionPrompt':True,'noPlayPageSwitches':True,'privacyPageControl':True,'noAutoRefresh':True,'privatePanelsExcluded':True,'priorOptOutHonored':True,'protectedRegionsBlocked':True,'realAdRequests':0,'errors':errors}
 (out/'verification.json').write_text(json.dumps(result,indent=2),encoding='utf8');print(json.dumps(result));browser.close()
