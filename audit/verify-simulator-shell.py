from pathlib import Path
import json, os
from playwright.sync_api import sync_playwright

out=Path('audit/simulator-shell-20261027');out.mkdir(parents=True,exist_ok=True)
base=os.environ.get('SIMULATOR_BASE','http://127.0.0.1:4186')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 page=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce')
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(base+'/zh-cn/',wait_until='networkidle')
 page.wait_for_function('!!window.SimulatorShell',timeout=30000)
 page.locator('#countrySelect').select_option('JPN');page.locator('#btnStartSelected').click()
 page.wait_for_function("!document.querySelector('#birthCertConfirm').disabled && !document.querySelector('.rebirth-stage')",timeout=20000)
 page.locator('#birthCertConfirm').click();page.wait_for_timeout(350)
 assert page.evaluate('!STATE.paused'), 'Birth confirmation must start playback'
 page.evaluate('stopTicker();STATE.paused=true;renderLife();')
 page.screenshot(path=str(out/'mobile-entry.png'))
 assert page.locator('.simulator-summary').is_visible()
 assert not page.locator('#lifeThisYear').is_visible()
 assert page.locator('#btnPause').is_visible()
 assert not page.locator('.game-tools').is_visible()
 metrics=[]
 for width,height in [(320,740),(360,800),(390,844),(430,932),(768,1024),(844,390),(1440,1000)]:
  page.set_viewport_size({'width':width,'height':height})
  for theme in ['blue','journal','editorial','night']:
   page.evaluate('(theme)=>document.documentElement.dataset.appearance=theme',theme)
   m=page.evaluate('''() => ({width:innerWidth,theme:document.documentElement.dataset.appearance,pageWidth:document.documentElement.scrollWidth,storyWidth:Math.round(document.querySelector('.life-play-story').getBoundingClientRect().width),nestedScrollers:[...document.querySelectorAll('#view-life *')].filter(e=>e.getClientRects().length&&['auto','scroll'].includes(getComputedStyle(e).overflowY)&&e.scrollHeight>e.clientHeight+4).map(e=>e.id||e.className)})''')
   assert m['pageWidth']<=width,m
   assert not m['nestedScrollers'],m
   if width<=430:assert m['storyWidth']>=width-34,m
   metrics.append(m)
   if width in [390,1440]:page.screenshot(path=str(out/f'{width}-{theme}.png'))
 page.set_viewport_size({'width':390,'height':844})
 people_box=page.locator('[data-simulator-panel="people"]').bounding_box()
 page.touchscreen.tap(people_box['x']+people_box['width']/2,people_box['y']+people_box['height']/2)
 assert page.locator('#lifeCert').is_visible()
 assert page.locator('.story-family').is_visible()
 assert not page.locator('.life-play-story').is_visible()
 page.screenshot(path=str(out/'mobile-people.png'))
 page.locator('[data-simulator-panel="details"]').click()
 assert page.locator('#lifeSecondary').is_visible()
 assert not page.locator('.life-play-layout').is_visible()
 page.locator('[data-simulator-panel="story"]').click()
 page.locator('[data-keep]').first.click()
 page.locator('[data-simulator-panel="memories"]').click()
 assert page.locator('.simulator-memory').count()==1
 page.locator('.simulator-memory').click()
 assert page.locator('#storyMomentDialog[open]').count()==1
 page.keyboard.press('Escape')
 page.locator('[data-simulator-panel="story"]').click()
 page.evaluate('''() => {stopTicker();STATE.autoDecide=false;for(let n=0;n<30&&!STATE.life.storyPending&&!STATE.life.died;n++){STATE.paused=false;tick();}stopTicker();STATE.paused=true;renderLife();}''')
 page.wait_for_selector('#storyMomentDialog[open]')
 page.screenshot(path=str(out/'mobile-choice.png'))
 option_boxes=page.locator('#storyMomentDialog [data-option]').evaluate_all('els=>els.map(e=>({y:e.getBoundingClientRect().y,bottom:e.getBoundingClientRect().bottom}))')
 assert option_boxes[-1]['bottom']<844,option_boxes
 page.keyboard.press('Escape')
 assert page.locator('#simulatorChoose').is_visible()
 page.locator('#simulatorChoose').click()
 assert page.locator('#storyMomentDialog[open]').count()==1
 page.locator('[data-option="0"]').click()
 page.screenshot(path=str(out/'mobile-result.png'))
 assert page.locator('[data-story="continue"]').is_visible()
 page.locator('[data-story="continue"]').click()
 page.evaluate('stopTicker();STATE.paused=true;renderLife();')
 page.add_style_tag(content='.story-moment p,.story-prose{font-size:22px!important}.simulator-tabs button{font-size:18px!important}')
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'Enlarged reading text must fit'
 page.screenshot(path=str(out/'mobile-large-text.png'))
 page.locator('.simulator-more').click()
 assert page.locator('#simulatorSettings').is_visible()
 page.locator('#simulatorSettings .life-sound>summary').click()
 assert page.locator('#musicPlay').is_visible()
 page.screenshot(path=str(out/'mobile-settings.png'))
 page.keyboard.press('Escape')
 page.locator('.simulator-toolbar .speed-menu>summary').click()
 page.locator('[data-pace="2500"]').click();page.wait_for_timeout(100)
 assert page.locator('.simulator-toolbar .speed-menu>summary').inner_text()=='2×'
 page.locator('.simulator-toolbar .speed-menu>summary').click()
 page.locator('[data-pace="0"]').click();page.wait_for_timeout(100)
 assert page.locator('#nextYear').is_visible()
 assert not page.locator('#btnPause').is_visible()
 page.locator('.simulator-toolbar .speed-menu>summary').click()
 page.locator('[data-pace="2500"]').click();page.wait_for_timeout(100)
 page.evaluate('''() => {STATE.autoDecide=true;for(let n=0;n<18&&!STATE.life.died;n++){STATE.paused=false;tick();}stopTicker();STATE.paused=true;renderLife();}''')
 page.wait_for_timeout(100)
 assert not page.locator('#storyMomentDialog[open]').count()
 target=page.locator('#lifeEventsFeed [data-event-index]').nth(6)
 target.scroll_into_view_if_needed()
 anchor=target.get_attribute('data-event-index');before=target.bounding_box()['y']
 page.evaluate('STATE.paused=false;tick();stopTicker();STATE.paused=true;renderLife();')
 after=page.locator(f'#lifeEventsFeed [data-event-index="{anchor}"]').bounding_box()['y']
 assert abs(before-after)<3,{'before':before,'after':after}
 scroll_before=page.evaluate('scrollY')
 session=page.context.new_cdp_session(page)
 session.send('Input.synthesizeScrollGesture',{'x':190,'y':500,'yDistance':-250,'speed':500,'gestureSourceType':'touch','preventFling':True})
 page.wait_for_timeout(400)
 scroll_after=page.evaluate('scrollY')
 if scroll_after==scroll_before:
  session.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':190,'y':550}]})
  for y in [500,450,400,350,300]:
   session.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':190,'y':y}]})
   page.wait_for_timeout(50)
  session.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
  page.wait_for_timeout(400)
  scroll_after=page.evaluate('scrollY')
 assert scroll_after>scroll_before,{'touchScrollBefore':scroll_before,'touchScrollAfter':scroll_after,'page':page.evaluate('({height:document.documentElement.scrollHeight,overflow:getComputedStyle(document.body).overflow,touch:getComputedStyle(document.body).touchAction})')}
 page.evaluate('window.SimulatorShell.selectPanel("story");')
 page.locator('.simulator-latest').click() if page.locator('.simulator-latest').is_visible() else None
 assert not errors,errors
 result={'layouts':metrics,'choiceOptions':option_boxes,'readingAnchor':[before,after],'touchScroll':[scroll_before,scroll_after],'errors':errors,'url':base}
 (out/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps(result,ensure_ascii=True))
 browser.close()
