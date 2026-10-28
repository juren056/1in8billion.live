export const SUPPORT_PRODUCT='author_coffee_v1';
export function supportCents(amount){
 if(typeof amount!=='string'||!/^(?:0|[1-9]\d{0,5})(?:\.\d{1,2})?$/.test(amount))return null;
 const [whole,fraction='']=amount.split('.'),cents=Number(whole)*100+Number(fraction.padEnd(2,'0'));
 return Number.isSafeInteger(cents)&&cents>=50&&cents<=99999999?cents:null;
}
export async function supportRequest(request,env,api){
 const {stripe,limited,body,hash,hmac,json,configured}=api,url=new URL(request.url);
 const enabled=env.AUTHOR_SUPPORT_ENABLED==='true'&&configured(env),live=env.STRIPE_SECRET_KEY?.startsWith('sk_live_')===true;
 if(url.pathname==='/api/support/health'&&request.method==='GET')return json({enabled,currency:'usd',minimum:50,mode:enabled?(live?'live':'test'):'unavailable'});
 if(!['/api/support/checkout','/api/support/status'].includes(url.pathname)||request.method!=='POST')return json({error:'not_found'},404);
 if(request.headers.get('origin')!==new URL(env.PUBLIC_ORIGIN||'https://1in8billion.live').origin||request.headers.get('content-type')?.split(';')[0]!=='application/json')return json({error:'invalid_origin_or_type'},403);
 if(!configured(env)||(url.pathname.endsWith('checkout')&&!enabled))return json({error:'support_closed'},503);
 try{
  if(!await limited(request,env,url.pathname.endsWith('checkout')?'checkout':'claim'))return json({error:'rate_limited'},429);
  const data=JSON.parse(await body(request));
  if(!data||typeof data!=='object'||Array.isArray(data))return json({error:'invalid_request'},400);
  if(url.pathname.endsWith('checkout')){
   const amount=supportCents(data.amount);
   if(amount===null||typeof data.requestId!=='string'||!/^[a-f0-9-]{36}$/.test(data.requestId))return json({error:'invalid_amount_or_request'},400);
   const origin=new URL(env.PUBLIC_ORIGIN||'https://1in8billion.live').origin,reference=await hash('support:'+data.requestId),idempotency=await hash(`support:${live}:${amount}:${data.requestId}`);
   const session=await stripe(env,'checkout/sessions',{'mode':'payment','branding_settings[display_name]':'1in8billion.live','custom_text[submit][message]':'Voluntary one-time creator support. No subscription. This does not purchase the Life Keepsake Pack.','line_items[0][price_data][currency]':'usd','line_items[0][price_data][unit_amount]':String(amount),'line_items[0][price_data][product_data][name]':'A coffee for the creator — 1in8billion.live','line_items[0][price_data][product_data][metadata][product_key]':SUPPORT_PRODUCT,'line_items[0][quantity]':'1','success_url':origin+'/support/thanks/','cancel_url':origin+'/support/thanks/#canceled','client_reference_id':reference,'metadata[product_key]':SUPPORT_PRODUCT,'payment_intent_data[metadata][product_key]':SUPPORT_PRODUCT},'support:'+idempotency);
   if(session.livemode!==live||session.amount_total!==amount||session.currency!=='usd'||session.mode!=='payment'||session.metadata?.product_key!==SUPPORT_PRODUCT||!new RegExp('^cs_'+(live?'live':'test')+'_[A-Za-z0-9]+$').test(session.id||'')||!/^https:\/\/checkout\.stripe\.com\//.test(session.url||''))return json({error:'provider_unavailable'},503);
   const receipt=await hmac(env.ORDER_SIGNING_SECRET,`support:${session.id}:${amount}`);
   return json({checkoutUrl:session.url,sessionId:session.id,receipt,amount,currency:'usd',testMode:!live});
  }
  if(!/^cs_(?:live|test)_[A-Za-z0-9]{1,255}$/.test(data.sessionId||'')||!Number.isSafeInteger(data.amount)||data.amount<50||data.amount>99999999||typeof data.receipt!=='string')return json({error:'not_authorized'},403);
  const expected=await hmac(env.ORDER_SIGNING_SECRET,`support:${data.sessionId}:${data.amount}`);
  if(expected.length!==data.receipt.length||[...expected].reduce((difference,char,i)=>difference|(char.charCodeAt(0)^data.receipt.charCodeAt(i)),0))return json({error:'not_authorized'},403);
  const session=await stripe(env,'checkout/sessions/'+encodeURIComponent(data.sessionId)+'?expand[]=payment_intent.latest_charge');
  if(session.livemode!==live||session.id!==data.sessionId||session.mode!=='payment'||session.currency!=='usd'||session.amount_total!==data.amount||session.metadata?.product_key!==SUPPORT_PRODUCT)return json({error:'payment_mismatch'},403);
  const charge=session.payment_intent?.latest_charge;
  const status=charge?.refunded||charge?.amount_refunded>0?'refunded':charge?.disputed?'disputed':session.payment_status==='paid'?'paid':session.status==='expired'?'expired':'pending';
  return json({status,amount:session.amount_total,currency:'usd',testMode:!live});
 }catch(error){return json({error:error.message==='body_too_large'?'body_too_large':'request_failed'},error.message==='body_too_large'?413:error instanceof SyntaxError?400:503);}
}
