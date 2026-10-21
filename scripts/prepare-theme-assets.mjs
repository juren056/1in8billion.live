import fs from'node:fs';import path from'node:path';import{createRequire}from'node:module';
const require=createRequire(import.meta.url),sharp=require(process.env.SHARP_MODULE||'C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const source=process.env.THEME_IMAGE_DIR||'C:/Users/lenovo/.codex/generated_images/01a157cf-c5b1-7111-b577-86a32401e5c6';
const images={blue:'d7df9202-c390-46fb-a1cd-328896e71f5d',journal:'d0edf68c-4b31-49d8-a49d-6068f3da6694',editorial:'05675d67-b37e-4ef6-9a43-b1dab8812315',night:'b3b52932-6d88-4e8e-98ef-e25381812955',canada:'e72fbcd8-939f-472f-9e3f-c99fcbebbecb',india:'4c7b0681-48be-4095-9101-8db39e7bb287',china:'d1af35b6-c72e-4ffb-9cbe-829c873c254a'};
const prompts=JSON.parse(fs.readFileSync('content/theme-art-provenance.json','utf8'));
const dir='public-assets/themes';fs.mkdirSync(dir,{recursive:true});
for(const[id,key]of Object.entries(images)){const input=path.join(source,'exec-'+key+'.png');for(const[suffix,width,quality]of[['',1536,78],['-mobile',768,75],['-thumb',320,70]]){await sharp(input).resize({width,withoutEnlargement:true}).webp({quality}).toFile(dir+'/'+id+suffix+'.webp');}fs.writeFileSync(dir+'/'+id+'.webp.json',JSON.stringify({prompt:prompts[id],origin:'Original artwork generated with image_gen, 2026-10-22',source:'exec-'+key+'.png',purpose:'Symbolic travel scenery; not evidence of a life event or real person',derivatives:'Only resized and WebP-compressed, no semantic edits'},null,2));}
console.log('Prepared seven original scenes, desktop/mobile/thumbnail sizes');
