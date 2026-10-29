import{conversionCopy}from'./conversion-copy.js';import{copy as bookCopy}from'./translations.js';
import{studioCopy}from'./template-copy.js';import{templates,getTemplate,templateLabel}from'./templates/index.js';import{assembleTemplateData,recommendTemplate}from'./template-data.js';import{renderCard}from'./render-card.js';import{buildDocument}from'./build-document.js';import{restore,preflight}from'./storage.js';
import{openPreview}from'./preview.js';

const root=document.querySelector('.keepsake-studio'),lang=document.documentElement.lang,c=studioCopy[lang]||studioCopy.en,$=id=>document.getElementById(id);
if(root){
 let snapshot,localRow,samplesPromise,selected='cinematic-poster',revision=0,pending=false,exporting=false,renderPromise;
 const v=conversionCopy(lang),seen=new Set();
 const inputs=['studioTitle','studioNote','studioPalette','studioRatio','studioPaper','studioPrint'];
 const customization=()=>({title:$('studioTitle').value,note:$('studioNote').value,palette:$('studioPalette').value});

 const event=action=>window.siteEvent?.('keepsake_design_action',{language:lang,action});
 const enable=()=>{const locked=exporting;for(const id of['studioPNG','studioPDF'])$(id).disabled=!snapshot||pending||locked||root.dataset.ready!=='true';for(const id of inputs)$(id).disabled=!snapshot||locked;for(const id of['sampleCountry','studioUseOwn','studioReset','premiumOpenSample'])$(id).disabled=locked;root.querySelectorAll('[data-template]').forEach(button=>button.disabled=locked);};
 const status=(text,error=false)=>{$('studioStatus').textContent=text;$('studioRetry').hidden=!error;};
 async function allSamples(){if(!samplesPromise)samplesPromise=fetch('/data/premium-samples.json',{signal:AbortSignal.timeout(15000)}).then(response=>{if(!response.ok)throw Error('sample_unavailable');return response.json();}).catch(error=>{samplesPromise=null;throw error;});return samplesPromise;}
 async function paint(){if(!snapshot)return;const current=++revision;pending=true;root.dataset.ready='false';enable();$('studioCanvas').setAttribute('aria-busy','true');status(c.loading);try{
  const result=await renderCard(snapshot,{templateId:selected,ratio:$('studioRatio').value,customization:customization(),demo:!localRow,preview:true});if(current!==revision)return;
  result.canvas.setAttribute('role','img');result.canvas.setAttribute('aria-label',templateLabel(result.templateId?getTemplate(result.templateId):getTemplate(selected),lang).name+' · '+result.data.summaryLine+(localRow?'':' · '+c.demo));
  $('studioCanvas').replaceChildren(result.canvas);$('studioCaption').textContent=(localRow?c.own:c.sample)+' · '+result.data.name+' · '+result.data.countryName+' · '+result.data.start+' — '+result.data.end+(localRow?'':' · '+c.demo);
  const recommendation=recommendTemplate(result.data);$('studioRecommendation').textContent=c.recommended+': '+templateLabel(getTemplate(recommendation.id),lang).name+' · '+c[recommendation.reason];
  $('studioSource').textContent=(localRow?v.own:v.example)+' · '+result.data.name+' · '+result.data.countryName;$('studioContents').textContent=result.data.recordCount+' '+result.data.copy.events+' · '+buildDocument(snapshot).pages.length+' '+bookCopy[lang].pages;document.querySelector('.studio-sample-label').hidden=!!localRow;$('studioUseOwn').hidden=!!localRow||!location.hash.startsWith('#local=');$('studioShowExamples').hidden=!localRow;if(localRow&&!seen.has(localRow.id)){seen.add(localRow.id);window.siteEvent?.('keepsake_preview_ready',{language:lang,action:'own_life'});}status(c.switched);root.dataset.ready='true';root.dataset.activeTemplate=selected;root.dataset.ratio=$('studioRatio').value;root.dataset.previewRevision=String(current);
 }catch{if(current===revision){root.dataset.ready='false';status(c.renderFailed,true);event('render_error');}}finally{if(current===revision){pending=false;$('studioCanvas').setAttribute('aria-busy','false');enable();}}}
 const repaint=()=>{renderPromise=paint();return renderPromise;};
 async function load(own=false){const current=++revision;pending=true;snapshot=undefined;root.dataset.ready='false';$('studioCanvas').setAttribute('aria-busy','true');enable();status(c.loading);try{
  if(own){const id=new URLSearchParams(location.hash.slice(1)).get('local'),row=await restore(id);if(!row)throw Error('snapshot_missing');await preflight(row);if(current!==revision)return;localRow=row;snapshot=row.snapshot;}
  else{const all=await allSamples();if(current!==revision)return;const country=$('sampleCountry').value;const source=all.find(row=>row.lang===lang&&row.country===country)||all.find(row=>row.lang==='en'&&row.country===country);if(!source)throw Error('sample_unavailable');localRow=null;snapshot={...source,lang,events:source.events.map(event=>({...event,text:window.translateUI?.(event.text)||event.text}))};}
  $('studioTitle').value='';$('studioNote').value='';$('studioNoteCount').textContent='0 / 200';$('premiumOpenSample').onclick=()=>openPreview(!!localRow);$('premiumOpenOwn').hidden=true;await repaint();
 }catch{if(current===revision){pending=false;$('studioCanvas').setAttribute('aria-busy','false');status(c.error,true);enable();}}}
 $('studioBook').onclick=()=>openPreview(!!localRow);$('studioShowExamples').onclick=()=>load(false);
 $('sampleCountry').addEventListener('change',()=>{if(!exporting)load(false);});
 root.querySelectorAll('[data-template]').forEach(button=>button.addEventListener('click',()=>{if(exporting)return;selected=button.dataset.template;root.querySelectorAll('[data-template]').forEach(option=>option.setAttribute('aria-pressed',String(option===button)));repaint();event('style_select');}));
 let timer;for(const id of['studioTitle','studioNote'])$(id).addEventListener('input',()=>{clearTimeout(timer);revision++;root.dataset.ready='false';enable();$('studioNoteCount').textContent=[...$('studioNote').value].length+' / 200';timer=setTimeout(repaint,150);});
 for(const id of['studioPalette','studioRatio'])$(id).addEventListener('change',()=>{repaint();event(id==='studioRatio'?'ratio_select':'palette_select');});
 $('studioReset').onclick=()=>{$('studioTitle').value='';$('studioNote').value='';$('studioNoteCount').textContent='0 / 200';repaint();};
 $('studioRetry').onclick=()=>snapshot?repaint():load(location.hash.startsWith('#local='));
 const localAvailable=location.hash.startsWith('#local=');$('studioUseOwn').hidden=!localAvailable;$('studioUseOwn').onclick=()=>load(true);
 const download=(blob,name)=>{const url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),10000);};
 async function exportDemo(format){if(!snapshot||pending||exporting||root.dataset.ready!=='true')return;clearTimeout(timer);exporting=true;enable();status(c.loading);try{
  if(format==='png'){const result=await renderCard(snapshot,{templateId:selected,ratio:$('studioRatio').value,customization:customization(),demo:!localRow});download(result.blob,'1in8billion-'+(localRow?'keepsake-':'demo-')+selected+'-'+$('studioRatio').value.replace(':','x')+'.png');}
  else{const doc=buildDocument(snapshot);doc.templateId=selected;doc.style=getTemplate(selected).bookStyle;doc.customization=customization();const{renderPDF}=await import('./render-pdf.js');const blob=await renderPDF(doc,{demo:!localRow,paper:$('studioPaper').value,printFriendly:$('studioPrint').checked});download(blob,'1in8billion-'+(localRow?'keepsake-':'demo-')+selected+'-'+$('studioPaper').value+'.pdf');}
  status(c.downloadReady);event((localRow?'free_':'demo_')+(format==='png'?'card_download':'book_download'));
 }catch{status(c.renderFailed,true);event('export_error');}finally{exporting=false;enable();}}
 $('studioPNG').onclick=()=>exportDemo('png');$('studioPDF').onclick=()=>exportDemo('pdf');
 window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#local=')){ $('studioUseOwn').hidden=false;load(true);}});
 enable();load(localAvailable);
}
