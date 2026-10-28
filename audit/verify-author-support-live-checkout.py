from pathlib import Path
from playwright.sync_api import sync_playwright
import json,time,re

out=Path('audit/author-support-20261029');out.mkdir(parents=True,exist_ok=True)
base='https://1in8billion.live'
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
 errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
 page.route('**/*google-analytics.com/**',lambda route:route.abort());page.route('**/*clarity.ms/**',lambda route:route.abort())
 page.goto(base+'/zh-cn/support/',wait_until='networkidle')
 health=page.request.get(base+'/api/support/health').json();assert health['enabled'] and health['mode']=='live',health
 page.locator('#supportAmount').fill('7.35')
 checkout_result={}
 def capture_checkout(route):
  response=route.fetch()
  checkout_result.update(status=response.status,body=response.json())
  route.fulfill(response=response)
 page.route('**/api/support/checkout',capture_checkout)
 start=time.monotonic()
 with page.expect_response('**/api/support/checkout') as response:
  page.locator('#supportSubmit').click()
 result=checkout_result['body'];assert checkout_result['status']==200 and result['amount']==735 and result['testMode']==False
 page.wait_for_url('https://checkout.stripe.com/**',wait_until='domcontentloaded',timeout=30000)
 price_visible=True
 try:
  page.get_by_text(re.compile(r'7[.,]35')).first.wait_for(state='visible',timeout=15000)
 except Exception:
  price_visible=False
 checkout_seconds=round(time.monotonic()-start,2)
 page.screenshot(path=str(out/'stripe-live-checkout.png'))
 # No card, bank or identity fields are entered; no pay/submit action is performed.
 page.goto(base+'/support/thanks/#canceled',wait_until='networkidle')
 page.wait_for_function("document.querySelector('#supportStatus').textContent.includes('没有完成付款')")
 assert page.locator('main').get_attribute('data-payment') is None
 page.screenshot(path=str(out/'canceled-return.png'))
 record={'mode':'live','amount':735,'currency':'usd','provider':'Stripe','checkoutSeconds':checkout_seconds,'stripePriceVisible':price_visible,'cancelReturnVerified':True,'paidClaimShown':False,'chargeSubmitted':False,'errors':errors}
 (out/'live-checkout.json').write_text(json.dumps(record,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(record))
 browser.close()
