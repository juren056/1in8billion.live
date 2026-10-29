from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image
import json,os
out=Path('audit/free-keepsake-20261029');out.mkdir(parents=True,exist_ok=True)
base=os.environ.get('SIMULATOR_BASE','http://127.0.0.1:4186')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce',accept_downloads=True)
 errors=[];checkout=[];downloads=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('request',lambda r:checkout.append(r.url) if '/api/keepsake/' in r.url else None)
 page.route('**/*google-analytics.com/**',lambda r:r.abort());page.route('**/*clarity.ms/**',lambda r:r.abort())
 page.goto(base+'/zh-cn/',wait_until='networkidle');page.wait_for_function('!!window.AuthorInvitation')
 page.evaluate("localStorage.setItem('1in8billion:author-invitation:v1',String(Date.now()))")
 page.locator('#countrySelect').select_option('JPN');page.evaluate("p1Incoming={rulesVersion:6};p1PendingSeed='free-keepsake';")
 page.locator('#btnStartSelected').click();page.wait_for_function("!document.querySelector('#birthCertConfirm').disabled&&!document.querySelector('.rebirth-stage')",timeout=30000)
 page.locator('#birthCertConfirm').click();page.evaluate("()=>{stopTicker();STATE.autoDecide=true;for(let n=0;n<160&&!STATE.life.died;n++){STATE.paused=false;tick();}stopTicker();}")
 assert page.evaluate('STATE.view==="end"&&STATE.life.died')
 assert '2.99' not in page.locator('#premiumOffer').inner_text()
 page.locator('#premiumOffer button').click();page.wait_for_url('**/zh-cn/keepsake/**',wait_until='domcontentloaded')
 page.wait_for_selector('.keepsake-studio[data-ready="true"]',timeout=60000)
 assert '#local=' in page.url
 assert page.locator('#keepsakeBuy').count()==0
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 for theme in ['blue','journal','editorial','night']:
  page.evaluate('t=>document.documentElement.dataset.appearance=t',theme)
  assert page.locator('#studioPNG').is_enabled() and page.locator('#studioPDF').is_enabled()
 for template in page.locator('[data-template]').evaluate_all('els=>els.map(e=>e.dataset.template)'):
  page.locator('[data-template="'+template+'"]').click()
  page.wait_for_function('t=>document.querySelector(".keepsake-studio").dataset.activeTemplate===t&&document.querySelector(".keepsake-studio").dataset.ready==="true"',arg=template,timeout=60000)
 page.locator('#studioRatio').select_option('1:1');page.wait_for_function('document.querySelector(".keepsake-studio").dataset.ratio==="1:1"&&document.querySelector(".keepsake-studio").dataset.ready==="true"')
 with page.expect_download(timeout=120000) as dl:page.locator('#studioPNG').click()
 png=dl.value;png.save_as(out/png.suggested_filename);assert 'keepsake-' in png.suggested_filename
 assert Image.open(out/png.suggested_filename).size==(2880,2880);downloads.append(png.suggested_filename)
 for paper in ['A4','Letter']:
  page.locator('#studioPaper').select_option(paper)
  with page.expect_download(timeout=120000) as dl:page.locator('#studioPDF').click()
  pdf=dl.value;pdf.save_as(out/pdf.suggested_filename);assert 'keepsake-' in pdf.suggested_filename
  assert (out/pdf.suggested_filename).read_bytes().startswith(b'%PDF');downloads.append(pdf.suggested_filename)
 page.locator('#studioPNG').scroll_into_view_if_needed();page.screenshot(path=str(out/'free-download-390.png'))
 assert not checkout,checkout
 for locale in ['', 'zh-cn/','zh-tw/','ja/','ko/','es/','pt-br/','fr/','de/','ru/']:
  page.goto(base+'/'+locale+'keepsake/',wait_until='networkidle')
  page.wait_for_selector('.keepsake-studio[data-ready="true"]',timeout=60000)
  assert '2.99' not in page.locator('main').inner_text(),locale
  assert page.locator('#keepsakeBuy').count()==0
 assert not errors,errors
 result={'base':base,'actualCompletedLife':True,'styles':6,'downloads':downloads,'checkoutRequests':checkout,'locales':10,'errors':errors}
 (out/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(result))
 browser.close()
