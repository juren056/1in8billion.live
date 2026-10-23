import{wrapWords}from'../build-document.js';
export const palettes={blue:{accent:'#076f91',wash:'#e5f1f7'},sage:{accent:'#28634f',wash:'#eaf2e9'},amber:{accent:'#80551c',wash:'#fbefda'}};
export function tools(context,width,height,data,assets){
 const x=context,w=width,h=height,p=palettes[data.palette]||palettes.blue,wide=h<1300,small=h<1200,margin=wide?42:64;
 const text=(value,left,top,{size=36,width=w-margin*2,color='#102d45',font='sans',weight=400,lines=3,italic=false,min=18}={})=>{
  value=String(value??'');const family=font==='display'?'KeepsakeDisplay, Georgia, NotoKeepsake, serif':font==='condensed'?'KeepsakeCondensed, NotoKeepsake, sans-serif':'NotoKeepsake, "Segoe UI", sans-serif';
  const split=()=>wrapWords(value,line=>x.measureText(line).width<=width);
  let rows;do{x.font=`${italic?'italic ':''}${weight} ${size}px ${family}`;rows=split();if(rows.length<=lines||size<=min)break;size-=2;}while(size>=min);
  if(rows.length>lines){rows=rows.slice(0,lines);let last=rows.at(-1);while(x.measureText(last+'…').width>width&&last)last=last.slice(0,-1);rows[rows.length-1]=last+'…';}
  x.fillStyle=color;x.textBaseline='top';for(const [i,line]of rows.entries())x.fillText(line,left,top+i*size*1.22);return top+rows.length*size*1.22;
 };
 const rect=(left,top,width,height,color)=>{x.fillStyle=color;x.fillRect(left,top,width,height);};
 const rule=(left,top,width,color=p.accent)=>rect(left,top,width,1.5,color);
 const image=(key,left,top,width,height)=>{const img=assets[key];if(!img)return;const factor=Math.max(width/img.width,height/img.height),sw=width/factor,sh=height/factor;x.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,left,top,width,height);};
 const title=(top,{left=margin,width=w-margin*2,color='#102d45',font='display',size=wide?72:104,nameOnly=false}={})=>{const bottom=text(nameOnly?data.name:data.headline,left,top,{size,width,color,font,weight:600,lines:2,min:wide?24:34});return nameOnly?bottom:text(data.name,left,bottom+(wide?10:20),{size:wide?28:44,width,color,weight:600,lines:wide?1:2,min:20});};
 const facts=(top,{left=margin,width=w-margin*2,color='#102d45',size=wide?22:30}={})=>text(data.summaryLine,left,top,{size,width,color,lines:2});
 const picks=data.rules==='replay-v5'?data.featuredMilestones.slice(0,3):data.featuredMilestones.length<=3?data.featuredMilestones:[data.featuredMilestones[0],data.featuredMilestones[Math.floor(data.featuredMilestones.length/2)],data.featuredMilestones.at(-1)];
 const moments=(top,{left=margin,width=w-margin*2,color='#102d45',accent=p.accent,bottom=h-180,columns=false,all=false}={})=>{
  const shown=all&&data.rules!=='replay-v5'?data.featuredMilestones:picks;
  bottom=Math.min(bottom,h-(data.note?(wide?225:350):(wide?110:155)));
  const gap=columns?28:20,cellWidth=columns?(width-gap*(shown.length-1))/Math.max(1,shown.length):width;
  const available=bottom-top,cellHeight=columns?available:available/Math.max(1,shown.length);
  for(const [i,event]of shown.entries()){
   const px=columns?left+i*(cellWidth+gap):left,py=columns?top:top+i*cellHeight;
   rule(px,py,cellWidth,accent);text(`${data.copy.age} ${event.age}${event.month?' · '+event.month:''}`,px,py+12,{size:wide?18:24,width:cellWidth,color:accent,lines:1});
   const room=Math.max(20,cellHeight-(wide?42:56)),size=Math.min(wide?24:small?30:36,room/1.22);
   text(event.text,px,py+(wide?40:52),{size,width:cellWidth,color,lines:Math.max(1,Math.min(3,Math.floor(room/(size*1.22)))),min:wide?16:20});
  }
 };
 const footer=(color='#38586b',art=false,noteOptions={})=>{
  if(data.note)note(h-(wide?205:330),{color,...noteOptions});
  const y=h-(wide?88:120);rule(margin,y-12,w-margin*2,color);
  text('1in8billion.live',margin,y,{size:wide?17:23,width:w-margin*2,color,lines:1});
  text(data.copy.fiction+(art?' · '+data.copy.illustration:''),margin,y+(wide?28:36),{size:wide?18:23,width:w-margin*2,color,lines:2,min:wide?16:20});
 };
 const note=(top,{left=margin,width=w-margin*2,color='#102d45'}={})=>{
  if(!data.note)return top;text(data.copy.noteLabel,left,top,{size:wide?15:21,width,color,lines:1});return text(data.note,left,top+(wide?24:32),{size:wide?24:34,width,color,font:'display',italic:true,lines:4,min:wide?16:18});
 };
 return{x,w,h,p,wide,small,margin,text,rect,rule,image,title,facts,moments,footer,note,picks};
}
