import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,createHmac} from 'node:crypto';
import {supportCents,supportRequest,SUPPORT_PRODUCT} from '../src/author-support.js';
import {webhook} from '../src/worker.js';

test('support amounts are exact cents; invalid, fractional, below-minimum and oversized inputs never reach Stripe',()=>{
 assert.equal(supportCents('0.50'),50);assert.equal(supportCents('12.34'),1234);assert.equal(supportCents('999999.99'),99999999);
 for(const invalid of ['0','0.49','-1','1.234','1e3','NaN','01','1000000','3,50',3,null])assert.equal(supportCents(invalid),null,String(invalid));
});
const req=(path,data,origin='https://1in8billion.live')=>new Request(origin+'/api/support/'+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(data)});
function fixture(){
 let calls=0,forms=[],ids=[];
 const env={AUTHOR_SUPPORT_ENABLED:'true',PUBLIC_ORIGIN:'https://1in8billion.live',ORDER_SIGNING_SECRET:'support-test-secret',STRIPE_SECRET_KEY:'sk_live_mock'};
 const session={id:'cs_live_support123',livemode:true,url:'https://checkout.stripe.com/c/pay/cs_live_support123',mode:'payment',amount_total:735,currency:'usd',metadata:{product_key:SUPPORT_PRODUCT},payment_status:'unpaid',status:'open',payment_intent:{latest_charge:{refunded:false,disputed:false}}};
 const api={configured:()=>true,limited:async()=>true,body:r=>r.text(),hash:async s=>createHash('sha256').update(s).digest('hex'),hmac:async(s,v)=>createHmac('sha256',s).update(v).digest('hex'),json:(body,status=200)=>Response.json(body,{status}),stripe:async(e,path,form,id)=>{calls++;if(form){forms.push(form);ids.push(id);}return session;}};
 return{env,session,api,get calls(){return calls;},forms,ids};
}
test('custom coffee checkout is one-time, idempotent, fixed to creator product and isolated from keepsake claims',async()=>{
 const f=fixture(),input={amount:'7.35',requestId:'12345678-1234-1234-1234-123456789abc'};
 const response=await supportRequest(req('checkout',input),f.env,f.api),order=await response.json();assert.equal(response.status,200);assert.equal(order.amount,735);assert.equal(order.testMode,false);assert.equal(order.orderId,undefined);assert.equal(order.claimSecret,undefined);
 const form=f.forms[0];assert.equal(form.mode,'payment');assert.equal(form['line_items[0][price_data][unit_amount]'],'735');assert.equal(form['metadata[product_key]'],SUPPORT_PRODUCT);assert.equal(form['success_url'],'https://1in8billion.live/support/thanks/');
 await supportRequest(req('checkout',input),f.env,f.api);assert.equal(f.ids[0],f.ids[1]);
 await supportRequest(req('checkout',{...input,amount:'8'}),f.env,f.api);assert.notEqual(f.ids[1],f.ids[2]);
 const paid={sessionId:order.sessionId,receipt:order.receipt,amount:735};
 let status=await(await supportRequest(req('status',paid),f.env,f.api)).json();assert.equal(status.status,'pending');
 f.session.payment_status='paid';status=await(await supportRequest(req('status',paid),f.env,f.api)).json();assert.equal(status.status,'paid');
 f.env.AUTHOR_SUPPORT_ENABLED='false';status=await(await supportRequest(req('status',paid),f.env,f.api)).json();assert.equal(status.status,'paid');f.env.AUTHOR_SUPPORT_ENABLED='true';
 f.session.payment_intent.latest_charge.refunded=true;status=await(await supportRequest(req('status',paid),f.env,f.api)).json();assert.equal(status.status,'refunded');
 assert.equal((await supportRequest(req('status',{...paid,amount:736}),f.env,f.api)).status,403);
 assert.equal((await supportRequest(req('status',{...paid,receipt:'a'.repeat(64)}),f.env,f.api)).status,403);
 f.session.metadata.product_key='keepsake_one_life_v1';assert.equal((await supportRequest(req('status',paid),f.env,f.api)).status,403);
});
test('creator support rejects foreign requests, bad amounts, rate limit, stopped checkout and test/live mismatch',async()=>{
 const f=fixture(),input={amount:'3',requestId:'12345678-1234-1234-1234-123456789abc'};
 assert.equal((await supportRequest(req('checkout',input,'https://evil.example'),f.env,f.api)).status,403);
 assert.equal((await supportRequest(req('checkout',{...input,amount:'0.01'}),f.env,f.api)).status,400);assert.equal(f.calls,0);
 f.api.limited=async()=>false;assert.equal((await supportRequest(req('checkout',input),f.env,f.api)).status,429);
 f.api.limited=async()=>true;f.env.AUTHOR_SUPPORT_ENABLED='false';assert.equal((await supportRequest(req('checkout',input),f.env,f.api)).status,503);
 f.env.AUTHOR_SUPPORT_ENABLED='true';f.session.livemode=false;assert.equal((await supportRequest(req('checkout',input),f.env,f.api)).status,503);
});
test('signed coffee webhook is acknowledged without granting a keepsake entitlement',async()=>{
 let writes=0;const statement={first:async()=>null,run:async()=>writes++,bind:()=>statement};const env={ORDERS:{prepare:()=>statement},ORDER_SIGNING_SECRET:'local',STRIPE_SECRET_KEY:'sk_live_mock',STRIPE_WEBHOOK_SECRET:'whsec_mock'};
 const body=JSON.stringify({id:'evt_coffee',livemode:true,type:'checkout.session.completed',data:{object:{id:'cs_live_support123',metadata:{product_key:SUPPORT_PRODUCT}}}}),time=Math.floor(Date.now()/1000),signature=createHmac('sha256',env.STRIPE_WEBHOOK_SECRET).update(time+'.'+body).digest('hex');
 const result=await webhook(new Request('https://1in8billion.live/api/stripe/webhook',{method:'POST',headers:{'Stripe-Signature':`t=${time},v1=${signature}`},body}),env);assert.equal(result.status,200);assert.equal(writes,0);
});
