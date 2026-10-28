from pathlib import Path
from playwright.sync_api import sync_playwright
import json,os

base=os.environ.get('SIMULATOR_BASE','http://127.0.0.1:4186');out=Path('audit/author-support-20261029');out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
 errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
 page.route('**/*google-analytics.com/**',lambda route:route.abort());page.route('**/*clarity.ms/**',lambda route:route.abort())
 page.goto(base+'/zh-cn/',wait_until='networkidle');page.wait_for_function('!!window.AuthorInvitation')
 page.locator('#countrySelect').select_option('JPN');page.evaluate("p1Incoming={rulesVersion:6};p1PendingSeed='shell-regression';")
 page.locator('#btnStartSelected').click();page.wait_for_function("!document.querySelector('#birthCertConfirm').disabled && !document.querySelector('.rebirth-stage')",timeout=20000)
 page.locator('#birthCertConfirm').click();page.evaluate('''() => {stopTicker();STATE.autoDecide=true;for(let n=0;n<160&&!STATE.life.died;n++){STATE.paused=false;tick();}stopTicker();}''')
 assert page.evaluate('STATE.view==="end"&&STATE.life.died')
 assert not page.locator('#authorInvitation').is_visible(),'Must not interrupt the beginning of the ending'
 page.locator('#authorSupportInvitation').scroll_into_view_if_needed();page.wait_for_selector('#authorInvitation[open]',timeout=9000)
 layouts=[]
 for width,height in [(320,740),(390,844),(1440,1000)]:
  page.set_viewport_size({'width':width,'height':height})
  for theme in ['blue','journal','editorial','night']:
   page.evaluate('theme=>document.documentElement.dataset.appearance=theme',theme)
   box=page.locator('#authorInvitation').bounding_box();assert box['x']>=0 and box['x']+box['width']<=width+1,box
   assert page.locator('#authorInvitation').evaluate('e=>e.scrollWidth<=e.clientWidth+1')
   if width in [390,1440]:page.screenshot(path=str(out/f'invitation-{width}-{theme}.png'))
   layouts.append({'width':width,'theme':theme})
 page.locator('.author-encourage').click();assert page.locator('.author-encourage').is_disabled();assert page.locator('.author-response').inner_text()
 page.keyboard.press('Escape');assert not page.locator('#authorInvitation').is_visible()
 assert page.evaluate("Number(localStorage.getItem('1in8billion:author-invitation:v1'))>0")
 page.locator('#authorSupportInvitation button').click();assert page.locator('#authorInvitation').is_visible()
 page.locator('#authorInvitation a').click();page.wait_for_url('**/zh-cn/support/')
 assert page.locator('#supportAmount').input_value()=='3'
 requests=[]
 def fail_checkout(route):
  requests.append(route.request.post_data_json);route.fulfill(status=503,content_type='application/json',body='{"error":"unavailable"}')
 page.route('**/api/support/checkout',fail_checkout)
 page.locator('#supportAmount').fill('0.01');page.locator('#supportSubmit').click();assert not requests
 assert page.locator('#supportAmount').get_attribute('aria-invalid')=='true'
 page.locator('#supportAmount').fill('7,35');page.locator('#supportSubmit').click();page.wait_for_function('!document.querySelector("#supportSubmit").disabled')
 assert requests[-1]['amount']=='7.35';page.locator('#supportSubmit').click();page.wait_for_function('!document.querySelector("#supportSubmit").disabled')
 assert requests[-1]['requestId']==requests[-2]['requestId'],'Retries must be idempotent'
 page.locator('#supportEncourage').click();assert page.locator('#supportEncourage').is_disabled()
 for locale in ['', 'zh-cn/','zh-tw/','ja/','ko/','es/','pt-br/','fr/','de/','ru/']:
  page.goto(base+'/'+locale+'support/',wait_until='networkidle')
  for width,height in [(390,844),(1440,1000)]:
   page.set_viewport_size({'width':width,'height':height})
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),locale
  assert page.locator('#supportSubmit').inner_text()
  assert all(href.endswith('/support/') for href in page.locator('.language-menu a').evaluate_all('els=>els.map(e=>e.getAttribute("href"))')),'Language switching must stay on support page'
  if locale=='zh-cn/':
   for theme in ['blue','journal','editorial','night']:
    page.evaluate('theme=>document.documentElement.dataset.appearance=theme',theme)
    page.screenshot(path=str(out/f'page-1440-{theme}.png'))
   page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(out/'page-390-night.png'))
 # A thank-you URL alone never proves payment.
 page.evaluate("localStorage.setItem('1in8billion:author-support:v1',JSON.stringify({sessionId:'cs_live_mock',receipt:'fake',amount:300,locale:'zh-CN'}))")
 page.route('**/api/support/status',lambda route:route.fulfill(content_type='application/json',body='{"status":"pending"}'))
 page.goto(base+'/support/thanks/',wait_until='networkidle');assert page.locator('main').get_attribute('data-payment') is None
 page.unroute('**/api/support/status');page.route('**/api/support/status',lambda route:route.fulfill(content_type='application/json',body='{"status":"paid"}'))
 page.locator('#supportCheck').click();page.wait_for_selector('main[data-payment="paid"]')
 page.screenshot(path=str(out/'verified-thanks-390.png'))
 assert not errors,errors
 (out/'verification.json').write_text(json.dumps({'url':base,'invitationLayouts':layouts,'localeCount':10,'formValidation':True,'idempotentRetry':True,'serverVerifiedReturn':True,'errors':errors},ensure_ascii=False,indent=2),encoding='utf8')
 print(json.dumps({'invitationLayouts':len(layouts),'locales':10,'errors':errors}))
 browser.close()
