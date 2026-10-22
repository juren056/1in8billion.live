import{restore,preflight}from'./storage.js';
// Session creation never grants entitlement. Only commitments leave the browser.
export async function createTestCheckout(localId,design={},progress=()=>{}){
 let stage='storage';
 try{
  const row=await restore(localId);await preflight(row,{checkout:true});
  stage='files';progress(stage);const{checkDeliverables}=await import('./checkout-preflight.js');await checkDeliverables(row,design);
  const key='keepsake-order:'+row.id;let saved;
  stage='storage';try{saved=JSON.parse(localStorage.getItem(key)||'null');if(!saved||['expired','canceled'].includes(saved.status)){saved={requestId:crypto.randomUUID()};}localStorage.setItem(key,JSON.stringify(saved));if(JSON.parse(localStorage.getItem(key)).requestId!==saved.requestId)throw Error();}catch{throw Error('storage_unavailable');}
  stage='checkout';progress(stage);const response=await fetch('/api/keepsake/checkout',{method:'POST',signal:AbortSignal.timeout(30000),headers:{'Content-Type':'application/json'},body:JSON.stringify({requestId:saved.requestId,commitment:row.commitment,snapshotVersion:row.snapshot.schema,completed:true,persisted:true})});
  if(!response.ok)throw Error('checkout_unavailable');const order=await response.json();
  if(typeof order.orderId!=='string'||!order.orderId||typeof order.claimSecret!=='string'||!order.claimSecret||!['pending','paid','canceled','expired','refunded','disputed','needs_support'].includes(order.status))throw Error('invalid_order');
  if(typeof order.testMode!=='boolean')throw Error('wrong_payment_mode');
  stage='storage';try{localStorage.setItem(key,JSON.stringify({...saved,...order,localId:row.id,design,lang:row.snapshot.lang}));if(JSON.parse(localStorage.getItem(key)).claimSecret!==order.claimSecret)throw Error();}catch{throw Error('storage_unavailable');}
  try{sessionStorage.setItem('keepsake-active-order',key);}catch{}
  return order;
 }catch(error){error.checkoutStage=error.message==='external_browser_required'?'browser':/storage/.test(error.message)?'storage':stage;throw error;}
}
