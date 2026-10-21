import{studioCopy}from'./template-copy.js';import{templates,getTemplate,templateLabel}from'./templates/index.js';import{assembleTemplateData,recommendTemplate}from'./template-data.js';import{renderCard}from'./render-card.js';import{buildDocument}from'./build-document.js';import{restore,preflight}from'./storage.js';
import{openPreview}from'./preview.js';
import{installTestPurchase}from'./test-purchase.js';
const root=document.querySelector('.keepsake-studio'),lang=document.documentElement.lang,c=studioCopy[lang]||studioCopy.en,$=id=>document.getElementById(id);
if(root){
 let snapshot,localRow,samplesPromise,selected='cinematic-poster',revision=0,pending=false,exporting=false,renderPromise;
 const inputs=['studioTitle','studioNote','studioPalette','studioRatio','studioPaper','studioPrint'];
 const customization=()=>({title:$('studioTitle').value,note:$('studioNote').value,palette:$('studioPalette').value});
 const purchase=installTestPurchase({getLocal:()=>snapshot?localRow:null,getDesign:()=>({templateId:selected,...customization(),ratio:$('studioRatio').value,paper:$('studioPaper').value,printFriendly:$('studioPrint').checked}),isBusy:()=>pending||exporting});
 const event=action=>window.siteEvent?.('keepsake_design_action',{language:lang,action});
 const enable=()=>{for(const id of['studioPNG','studioPDF'])$(id).disabled=!snapshot||pending||exporting;for(const id of inputs)$(id).disabled=!snapshot||exporting;for(const id of['sampleCountry','studioUseOwn','studioReset','premiumOpenSample'])$(id).disabled=exporting;root.querySelectorAll('[data-template]').forEach(button=>button.disabled=exporting);purchase.refresh();};
 const status=(text,error=false)=>{$('studioStatus').textContent=text;$('studioRetry').hidden=!error;};
 async function allSamples(){if(!samplesPromise)samplesPromise=fetch('/data/premium-samples.json',{signal:AbortSignal.timeout(15000)}).then(response=>{if(!response.ok)throw Error('sample_unavailable');return response.json();}).catch(error=>{samplesPromise=null;throw error;});return samplesPromise;}
 async function paint(){if(!snapshot)return;const current=++revision;pending=true;enable();$('studioCanvas').setAttribute('aria-busy','true');status(c.loading);try{
  const result=await renderCard(snapshot,{templateId:selected,ratio:$('studioRatio').value,customization:customization(),demo:true,preview:true});if(current!==revision)return;
  result.canvas.setAttribute('role','img');result.canvas.setAttribute('aria-label',templateLabel(result.templateId?getTemplate(result.templateId):getTemplate(selected),lang).name+' · '+result.data.summaryLine+' · '+c.demo);
  $('studioCanvas').replaceChildren(result.canvas);$('studioCaption').textContent=(localRow?c.own:c.sample)+' · '+result.data.name+' · '+result.data.countryName+' · '+result.data.start+' — '+result.data.end+' · '+c.demo;
  const recommendation=recommendTemplate(result.data);$('studioRecommendation').textContent=c.recommended+': '+templateLabel(getTemplate(recommendation.id),lang).name+' · '+c[recommendation.reason];
  status(c.switched);root.dataset.ready='true';root.dataset.activeTemplate=selected;root.dataset.ratio=$('studioRatio').value;root.dataset.previewRevision=String(current);
 }catch{if(current===revision){root.dataset.ready='false';status(c.renderFailed,true);event('render_error');}}finally{if(current===revision){pending=false;$('studioCanvas').setAttribute('aria-busy','false');enable();}}}
 const repaint=()=>{renderPromise=paint();return renderPromise;};
 async function load(own=false){const current=++revision;pending=true;snapshot=undefined;root.dataset.ready='false';$('studioCanvas').setAttribute('aria-busy','true');enable();status(c.loading);try{
  if(own){const id=new URLSearchParams(location.hash.slice(1)).get('local'),row=await restore(id);if(!row)throw Error('snapshot_missing');await preflight(row);if(current!==revision)return;localRow=row;snapshot=row.snapshot;}
  else{const all=await allSamples();if(current!==revision)return;const country=$('sampleCountry').value;const source=all.find(row=>row.lang===lang&&row.country===country)||all.find(row=>row.lang==='en'&&row.country===country);if(!source)throw Error('sample_unavailable');localRow=null;snapshot={...source,lang,events:source.events.map(event=>({...event,text:window.translateUI?.(event.text)||event.text}))};}
  $('studioTitle').value='';$('studioNote').value='';$('studioNoteCount').textContent='0 / 200';$('premiumOpenSample').onclick=()=>openPreview(!!localRow);$('premiumOpenOwn').hidden=true;await repaint();
 }catch{if(current===revision){pending=false;status(c.error,true);enable();}}}
 $('sampleCountry').addEventListener('change',()=>{if(!exporting)load(false);});
 root.querySelectorAll('[data-template]').forEach(button=>button.addEventListener('click',()=>{if(exporting)return;selected=button.dataset.template;root.querySelectorAll('[data-template]').forEach(option=>option.setAttribute('aria-pressed',String(option===button)));repaint();event('style_select');}));
 let timer;for(const id of['studioTitle','studioNote'])$(id).addEventListener('input',()=>{clearTimeout(timer);$('studioNoteCount').textContent=[...$('studioNote').value].length+' / 200';timer=setTimeout(repaint,150);});
 for(const id of['studioPalette','studioRatio'])$(id).addEventListener('change',()=>{repaint();event(id==='studioRatio'?'ratio_select':'palette_select');});
 $('studioReset').onclick=()=>{$('studioTitle').value='';$('studioNote').value='';$('studioNoteCount').textContent='0 / 200';repaint();};
 $('studioRetry').onclick=()=>snapshot?repaint():load(location.hash.startsWith('#local='));
 const localAvailable=location.hash.startsWith('#local=');$('studioUseOwn').hidden=!localAvailable;$('studioUseOwn').onclick=()=>load(true);
 const download=(blob,name)=>{const url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),10000);};
 async function exportDemo(format){if(!snapshot||pending||exporting)return;clearTimeout(timer);exporting=true;enable();status(c.loading);try{
  if(format==='png'){const result=await renderCard(snapshot,{templateId:selected,ratio:$('studioRatio').value,customization:customization(),demo:true});download(result.blob,'1in8billion-demo-'+selected+'-'+$('studioRatio').value.replace(':','x')+'.png');}
  else{const doc=buildDocument(snapshot);doc.templateId=selected;doc.style=getTemplate(selected).bookStyle;doc.customization=customization();const{renderPDF}=await import('./render-pdf.js');const blob=await renderPDF(doc,{demo:true,paper:$('studioPaper').value,printFriendly:$('studioPrint').checked});download(blob,'1in8billion-demo-'+selected+'-'+$('studioPaper').value+'.pdf');}
  status(c.downloadReady);event(format==='png'?'demo_card_download':'demo_book_download');
 }catch{status(c.renderFailed,true);event('export_error');}finally{exporting=false;enable();}}
 $('studioPNG').onclick=()=>exportDemo('png');$('studioPDF').onclick=()=>exportDemo('pdf');
 window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#local=')){ $('studioUseOwn').hidden=false;load(true);}});
 enable();load(localAvailable);
}
