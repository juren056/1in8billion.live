import{sceneAsset,personAsset,identities}from'../rebirth-art.js';
import{getTemplate}from'./templates/index.js';import{assembleTemplateData}from'./template-data.js';import{prepareFont}from'./font.js';
let fonts,fullFont;const imageCache=new Map();
async function loadFonts(hd){fonts??=Promise.all([['KeepsakeDisplay','/vendor/keepsake/BodoniModa.ttf'],['KeepsakeCondensed','/vendor/keepsake/Oswald.ttf']].map(async([name,url])=>{const face=await new FontFace(name,`url(${url})`,{weight:'100 900'}).load();document.fonts.add(face);})).catch(error=>{fonts=null;throw error;});await fonts;if(hd){fullFont??=prepareFont().then(bytes=>new FontFace('NotoKeepsake',bytes).load()).then(face=>document.fonts.add(face)).catch(error=>{fullFont=null;throw error;});await fullFont;}}
async function art(key){if(!imageCache.has(key))imageCache.set(key,new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{imageCache.delete(key);reject(Error('art_unavailable'));};img.src=key.startsWith('/')?key:'/public-assets/keepsake/'+(key==='sea'?'cinematic-sea.png':'watercolor-garden.png');}));return imageCache.get(key);}
export const cardDimensions={'9:16':[2160,3840],'1:1':[2880,2880],'16:9':[3840,2160]};
export async function renderCard(snapshot,{templateId='clean-modern',ratio='9:16',customization={},demo=true,preview=false}={}){
 if(!cardDimensions[ratio])throw Error('unsupported_ratio');await loadFonts(!preview);
 const template=getTemplate(templateId),data=assembleTemplateData(snapshot,customization),logicalWidth=1080,logicalHeight=1080*cardDimensions[ratio][1]/cardDimensions[ratio][0],canvas=document.createElement('canvas');
 const scale=preview?.46:cardDimensions[ratio][0]/logicalWidth;canvas.width=Math.round(logicalWidth*scale);canvas.height=Math.round(logicalHeight*scale);const context=canvas.getContext('2d');if(!context)throw Error('canvas_unavailable');context.scale(scale,scale);
 const assets={};if(['clean-modern','journal-scrapbook','cinematic-poster','editorial-magazine'].includes(template.id)){
 const scene=await art(sceneAsset(snapshot,'memory'));let backdrop=scene;if(identities.includes(snapshot.visual?.person)){const actor=await art(personAsset(snapshot)),composite=document.createElement('canvas');composite.width=1440;composite.height=648;const ctx=composite.getContext('2d');ctx.drawImage(scene,0,0,1440,648);const h=snapshot.age<2?400:580,w=h*actor.width/actor.height;ctx.drawImage(actor,720-w/2,648-h,w,h);backdrop=composite;}if(['clean-modern','journal-scrapbook'].includes(template.id))assets.garden=backdrop;if(['cinematic-poster','editorial-magazine'].includes(template.id))assets.sea=backdrop;
 }
 template.render(context,logicalWidth,logicalHeight,data,assets);
 if(demo){const label=data.copy.demo;context.save();context.fillStyle=template.id==='cinematic-poster'?'#edf5f8':'#102d45';context.globalAlpha=.72;context.textAlign='center';context.textBaseline='middle';context.translate(logicalWidth/2,logicalHeight/2);context.rotate(-.38);context.font='600 40px "Segoe UI",sans-serif';context.fillText(label,0,0,logicalWidth-80);context.restore();}
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('poster_failed');
 return{blob,canvas,data,templateId:template.id,ratio,demo,width:canvas.width,height:canvas.height};
}
