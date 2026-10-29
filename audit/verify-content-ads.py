from pathlib import Path
from playwright.sync_api import sync_playwright
import json,os
base=os.environ.get('SIMULATOR_BASE','http://127.0.0.1:4186');out=Path('audit/content-ads-20261030');out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
 errors=[];google=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.route('**/*google-analytics.com/**',lambda r:r.abort());page.route('**/*clarity.ms/**',lambda r:r.abort())
 def ad_script(route):
  google.append(route.request.url)
  route.fulfill(content_type='application/javascript',body='window.adsbygoogle.push=function(){window.testAdPushes=(window.testAdPushes||0)+1;};')
 page.route('https://pagead2.googlesyndication.com/**',ad_script)
 page.route('**/api/ads/config',lambda r:r.fulfill(content_type='application/json',body='{"allowed":true,"personalized":false}'))
 page.goto(base+'/zh-cn/guides/quick-play/',wait_until='networkidle')
 page.locator('[data-content-ad]').scroll_into_view_if_needed();page.wait_for_selector('.ad-permission')
 assert not google
 for width,height in [(320,740),(390,844),(1440,1000)]:
  page.set_viewport_size({'width':width,'height':height})
  for theme in ['blue','journal','editorial','night']:
   page.evaluate('t=>document.documentElement.dataset.appearance=t',theme)
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   assert page.locator('.ad-permission button').count()==2
   if width in [390,1440]:page.screenshot(path=str(out/f'choice-{width}-{theme}.png'))
 page.locator('.ad-permission-actions button').last.click();assert not google
 page.reload(wait_until='networkidle');assert not google
 page.locator('.ad-controls button').click();page.locator('.ad-permission-actions button').first.click()
 page.wait_for_function('window.testAdPushes===1')
 assert len(google)==1 and 'ca-pub-2031710024449901' in google[0]
 assert page.locator('ins.adsbygoogle').get_attribute('data-ad-slot')=='9459958473'
 assert page.locator('ins.adsbygoogle').get_attribute('data-restrict-data-processing')=='1'
 assert page.evaluate('window.adsbygoogle.requestNonPersonalizedAds')==1
 page.locator('.ad-controls button').click();page.wait_for_load_state('networkidle');assert len(google)==1
 page.evaluate('localStorage.clear()');page.unroute('**/api/ads/config')
 page.route('**/api/ads/config',lambda r:r.fulfill(content_type='application/json',body='{"allowed":false}'))
 page.reload(wait_until='networkidle');assert not page.locator('[data-content-ad]').is_visible();assert len(google)==1
 page.unroute('**/api/ads/config');page.route('**/api/ads/config',lambda r:r.fulfill(content_type='application/json',body='{"allowed":true}'))
 for suffix in ['?name=private','#local=private']:
  page.goto(base+'/guides/quick-play/'+suffix,wait_until='networkidle');assert not page.locator('[data-content-ad]').is_visible();assert len(google)==1
 for route in ['zh-cn/','zh-cn/keepsake/','zh-cn/support/','keepsake/success/','privacy/']:
  page.goto(base+'/'+route,wait_until='networkidle');assert page.locator('[data-content-ad]').count()==0;assert len(google)==1
 for locale in ['', 'zh-cn/','zh-tw/','ja/','ko/','es/','pt-br/','fr/','de/','ru/']:
  page.goto(base+'/'+locale+'guides/quick-play/',wait_until='networkidle');page.locator('[data-content-ad]').scroll_into_view_if_needed();page.wait_for_selector('.ad-permission');assert page.locator('.ad-permission h2').inner_text();assert len(google)==1
 assert not errors,errors
 result={'base':base,'viewportThemeChecks':12,'locales':10,'consentBeforeThirdParty':True,'denyPersists':True,'withdrawal':True,'protectedRegionBlocked':True,'privateUrlsBlocked':True,'excludedFlows':5,'mockedAdRequests':len(google),'realAdRequests':0,'errors':errors}
 (out/'verification.json').write_text(json.dumps(result,indent=2),encoding='utf8');print(json.dumps(result));browser.close()
