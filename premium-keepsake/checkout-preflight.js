import{buildDocument}from'./build-document.js';
import{supportsText}from'./font-coverage.js';
import{validSnapshot}from'./schema.js';
// Checkout validates the persisted record and requested formats, not a full PDF.
// Font downloads, HD drawing and PDF serialization belong to preview/export.
export async function checkDeliverables(row,design={}){
 if(!validSnapshot(row?.snapshot))throw Error('invalid_snapshot');
 if(design.ratio&&!['9:16','1:1','16:9'].includes(design.ratio))throw Error('unsupported_ratio');
 if(design.paper&&!['A4','Letter'].includes(design.paper))throw Error('unsupported_paper');
 if(design.templateId&&!['clean-modern','cinematic-poster','editorial-magazine','journal-scrapbook','minimal-data','archive-certificate'].includes(design.templateId))throw Error('unsupported_template');
 const doc=buildDocument(row.snapshot);
 for(const page of doc.pages){const text=[page.title,...(page.paragraphs||page.lines||[]),page.intro||'',...(page.entries||[]).flatMap(e=>[e.meta,e.text]),doc.copy.demo,doc.copy.model];if(text.some(value=>!supportsText(String(value).replace(/\r?\n/g,' '))))throw Error('unsupported_glyph');}
 return true;
}
