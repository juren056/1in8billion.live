// Validate the selected deliverables before creating an order. Retry only transient
// asset fetches; unsupported records stay blocked rather than charging for bad files.
export async function checkDeliverables(row,design={}){
 const {buildDocument}=await import('./build-document.js'),{renderPDF}=await import('./render-pdf.js');
 const doc=buildDocument(row.snapshot);doc.templateId=design.templateId||'cinematic-poster';doc.style=(await import('./templates/index.js')).getTemplate(doc.templateId).bookStyle;doc.customization=design;
 for(let attempt=0;attempt<2;attempt++)try{await renderPDF(doc,{demo:true,paper:design.paper||'A4',printFriendly:design.printFriendly===true});return;}catch(error){if(attempt||!['font_unavailable','art_unavailable','Failed to fetch'].includes(error.message)&&error.name!=='AbortError')throw error;}
}
