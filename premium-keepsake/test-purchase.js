import{paymentCopy}from'./payment-copy.js';
export function installTestPurchase({getLocal,getDesign,isBusy}){
 const c=paymentCopy(document.documentElement.lang),box=document.createElement('section'),notice=document.createElement('p'),state=document.createElement('p'),buy=document.createElement('button'),orders=document.createElement('a');
 box.className='studio-export';box.dataset.clarityMask='true';notice.textContent=c.notice;state.setAttribute('role','status');buy.type='button';buy.textContent=c.buy;orders.href='/keepsake/success/';orders.textContent=c.orders;box.append(notice,buy,state,orders);document.querySelector('.studio-export').after(box);
 let available=false,pending=false;
 const refresh=()=>{buy.disabled=!available||!getLocal()||isBusy()||pending;if(!pending)state.textContent=!available?c.closed:!getLocal()?c.own:'';};
 const health=()=>fetch('/api/keepsake/health',{cache:'no-store',signal:AbortSignal.timeout(10000)}).then(r=>r.ok?r.json():{}).then(r=>{available=r.checkout===true&&r.testOnly===true;refresh();}).catch(()=>{available=false;refresh();});
 buy.onclick=async()=>{if(pending||isBusy()||!getLocal())return;pending=true;refresh();state.textContent=c.opening;try{await health();if(!available)throw Error('checkout_closed');const{createTestCheckout}=await import('./payment-client.js'),order=await createTestCheckout(getLocal().id,getDesign());if(order.checkoutUrl){const url=new URL(order.checkoutUrl);if(url.origin!=='https://checkout.stripe.com'||order.testMode!==true)throw Error('wrong_payment_mode');location.assign(url.href);}else location.assign('/keepsake/success/');}catch{state.textContent=c.error;}finally{pending=false;buy.disabled=!available||!getLocal()||isBusy();}};
 refresh();health();return{refresh};
}
