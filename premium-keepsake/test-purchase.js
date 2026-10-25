import{createTestCheckout}from'./payment-client.js';
import{paymentCopy}from'./payment-copy.js';import{conversionCopy}from'./conversion-copy.js';
export function installTestPurchase({getLocal,getDesign,isBusy,onPendingChange=()=>{}}){
 const lang=document.documentElement.lang,words=conversionCopy(lang);let c=paymentCopy(lang);
 const box=document.createElement('section'),price=document.createElement('p'),notice=document.createElement('p'),detail=document.createElement('p'),state=document.createElement('p'),buy=document.createElement('button'),orders=document.createElement('a');
 box.className='studio-export keepsake-purchase';box.dataset.clarityMask='true';box.setAttribute('aria-label',words.premium);price.className='purchase-price';price.textContent='US$2.99 · '+words.once;notice.textContent=words.includes;detail.dataset.detail='';detail.textContent=words.delivery;state.setAttribute('role','status');state.setAttribute('aria-live','polite');buy.type='button';buy.id='keepsakeBuy';buy.textContent=c.buy;orders.href='/keepsake/success/';orders.textContent=c.orders;box.append(price,notice,buy,state,detail,orders);document.querySelector('.studio-controls h2').after(box);
 let available=false,pending=false,failed=false,testMode=true,lastError='';
 const event=action=>window.siteEvent?.('keepsake_checkout_step',{language:lang,action});
 const refresh=()=>{buy.disabled=!available||!getLocal()||isBusy()||pending;box.dataset.eligible=String(!!getLocal());if(!pending)state.textContent=failed?lastError:!available?c.closed:!getLocal()?words.sampleOnly:'';};
 const health=()=>fetch('/api/keepsake/health',{cache:'no-store',signal:AbortSignal.timeout(10000)}).then(r=>r.ok?r.json():{}).then(r=>{available=r.checkout===true&&typeof r.testOnly==='boolean';testMode=r.testOnly!==false;c=paymentCopy(lang,testMode?'test':'live');price.textContent=testMode?c.notice:'US$2.99 · '+words.once;buy.textContent=c.buy;orders.textContent=c.orders;refresh();}).catch(()=>{available=false;refresh();});
 buy.onclick=async()=>{
  if(pending||isBusy()||!getLocal())return;const localId=getLocal().id,design={...getDesign()};pending=true;failed=false;onPendingChange();refresh();state.textContent=words.connecting;event(testMode?'test_click':'live_click');
  try{if(!available)throw Object.assign(Error('checkout_closed'),{checkoutStage:'checkout'});const order=await createTestCheckout(localId,design,stage=>{state.textContent=words.connecting;});
   event(order.testMode?'test_session_created':'live_session_created');
   if(order.checkoutUrl){const url=new URL(order.checkoutUrl);if(url.origin!=='https://checkout.stripe.com'||order.testMode!==testMode)throw Object.assign(Error('wrong_payment_mode'),{checkoutStage:'checkout'});location.assign(url.href);}else location.assign('/keepsake/success/');
  }catch(error){failed=true;const stage=['files','storage','browser','checkout'].includes(error.checkoutStage)?error.checkoutStage:'checkout';lastError=words[stage==='files'?'fileError':stage==='storage'?'storageError':stage==='browser'?'browserError':'checkoutError'];state.textContent=lastError;event((testMode?'test_':'live_')+stage+'_error');}
  finally{pending=false;onPendingChange();refresh();}
 };
 refresh();health();return{refresh,isPending:()=>pending};
}
