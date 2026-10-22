module.exports=function auditContrast(){
 const color=value=>{const v=value.match(/[\d.]+/g)?.map(Number)||[0,0,0,0];if(value.startsWith('color(srgb'))for(let i=0;i<3;i++)v[i]*=255;return v;},lum=c=>c.slice(0,3).map(v=>(v/=255)<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
 function background(el){let result=[255,255,255],layers=[];for(let e=el;e;e=e.parentElement)layers.unshift(color(getComputedStyle(e).backgroundColor));for(const v of layers)result=result.map((n,i)=>v[i]*(v[3]??1)+n*(1-(v[3]??1)));return result;}
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),failures=[];let node,checked=0,imageBacked=0;
 while(node=walker.nextNode()){
  if(!node.textContent.trim())continue;const el=node.parentElement;if(!el||el.closest('script,style,option,canvas,svg,button:disabled,[aria-disabled=true]'))continue;
  if(!el.checkVisibility({checkVisibilityCSS:true})||!el.getClientRects().length||getComputedStyle(el).visibility==='hidden')continue;const range=document.createRange();range.selectNodeContents(node);if(!range.getBoundingClientRect().height)continue;
  if(el.closest('.theme-hero,.sample-life,.theme-keepsake,.theme-book,.shelf-cover,.daily-invitation')){imageBacked++;continue;}
  const s=getComputedStyle(el),fg=color(s.color),bg=background(el),a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);checked++;
  const large=parseFloat(s.fontSize)>=24||parseFloat(s.fontSize)>=18.66&&Number(s.fontWeight)>=700;
  if(ratio<(large?3:4.5)-.02)failures.push({selector:el.id?'#'+el.id:el.tagName.toLowerCase()+'.'+[...el.classList].join('.'),text:node.textContent.trim().slice(0,70),ratio:+ratio.toFixed(2),color:s.color,bg});
 }
 for(const el of document.querySelectorAll('.model-chart svg text,.survival-svg text,.keepsake-chart text,.world-map text,.tree-node text')){
  if(!el.checkVisibility({checkVisibilityCSS:true})||!el.getClientRects().length||!/[\p{L}\p{N}]/u.test(el.textContent))continue;
  const svg=el.closest('svg'),group=el.closest('.tree-node'),rect=group?.querySelector('.node-rect')||svg.querySelector('rect[x="0"][y="0"]');let bg=background(svg);
  if(rect){const fill=color(getComputedStyle(rect).fill),alpha=(fill[3]??1)*Number(getComputedStyle(rect).opacity);bg=bg.map((n,i)=>fill[i]*alpha+n*(1-alpha));}
  const fg=color(getComputedStyle(el).fill),a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);checked++;
  if(ratio<4.48)failures.push({selector:'svg text.'+el.getAttribute('class'),text:el.textContent.slice(0,70),ratio:+ratio.toFixed(2),color:getComputedStyle(el).fill,bg});
 }
 return{checked,imageBacked,failures,overflow:document.documentElement.scrollWidth>innerWidth+1};
};
