import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareBirth,revealSchedule} from '../birth-entry.js';

test('every reveal has ordered world, arrival, person and confirmation stages, including reduced motion',()=>{
 for(const reduced of [false,true])for(const repeat of [false,true]){const [arrival,person,end]=revealSchedule(reduced,repeat);assert(arrival>0&&arrival<person&&person<end);assert(end>=1000&&end<4500);}
 assert(revealSchedule(false,false)[2]>=3000,'first draw must include a full introduction');
 assert(revealSchedule(false,true)[2]<revealSchedule(false,false)[2],'repeat draws can be shorter');
 assert(revealSchedule(true,false)[2]>=1500,'quiet presentation must still be perceptible');
});

test('a pending birth preparation rejects repeated activation, and failure restores controls for retry',async t=>{
 const before={window:globalThis.window,document:globalThis.document};
 t.after(()=>{for(const[k,v]of Object.entries(before)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}});
 const buttons=[false,false,true].map(disabled=>({disabled,attributes:{},setAttribute(k,v){this.attributes[k]=v;},removeAttribute(k){delete this.attributes[k];}}));
 const status={textContent:'Ready'};let settle,errors=0;globalThis.document={querySelectorAll:()=>buttons,querySelector:()=>status};
 globalThis.window={retentionReady:new Promise(resolve=>settle=resolve),SurfaceCopy:{error:'Retry'},toast:()=>errors++};
 const first=prepareBirth();assert(buttons.every(b=>b.disabled&&b.attributes['aria-busy']==='true'));assert.equal(status.textContent,'Preparing a new life…');
 assert.equal(await prepareBirth(),false,'another click must not prepare another draw');
 settle(null);assert.equal(await first,false,'a failed presentation must not authorize a birth');
 assert.deepEqual(buttons.map(b=>b.disabled),[false,false,true]);assert(buttons.every(b=>!('aria-busy'in b.attributes)));assert.equal(errors,1);assert.equal(status.textContent,'Ready');
 window.retentionReady=Promise.resolve(null);assert.equal(await prepareBirth(),false);assert.equal(errors,2,'retry is available after failure');
});
