import{tools}from'./drawing.js';
export function render(context,w,h,data,assets){
 const t=tools(context,w,h,data,assets),{wide,margin:m,x}=t,square=w===h;
 t.rect(0,0,w,h,'#061b32');t.image('sea',0,0,w,wide?h:h*.48);
 const fade=x.createLinearGradient(0,wide?0:h*.22,wide?w:0,wide?0:h*.52);fade.addColorStop(0,'#061b3200');fade.addColorStop(1,'#061b32');t.rect(0,0,w,h,fade);
 if(assets.actor){const height=wide?h*.89:h*.52,width=height*assets.actor.width/assets.actor.height;x.drawImage(assets.actor,w-width-m*.3,h-height-(wide?92:125),width,height);}
 const shade=x.createLinearGradient(0,0,w,0);shade.addColorStop(0,'#061b32f2');shade.addColorStop(.52,'#061b32bb');shade.addColorStop(1,'#061b3200');t.rect(0,wide?0:h*.4,w,h,shade);
 const y=t.title(wide?36:70,{color:'#fff9ef',font:'display',size:square?84:wide?72:108,width:wide?w*.64:w-m*2});
 t.facts(y+24,{color:'#f8e8cb',width:wide?w*.62:w-m*2});
 t.moments(wide?Math.max(y+105,h*.38):h*.52,{color:'#fff9ef',accent:'#edc791',width:wide?w*.58:w*.52,bottom:h-(wide?100:data.note?360:200),columns:false,all:square});
 t.footer('#f8e8cb',true,{width:w-m*2});
}
