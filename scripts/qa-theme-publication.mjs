import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const routes=JSON.parse(fs.readFileSync('dist/routes.json'));
assert.equal(routes.length,226);
assert(!fs.existsSync('dist/__design'));
assert(!fs.existsSync('dist/design-preview.json'));
assert(!fs.readFileSync('dist/_headers','utf8').includes('X-Robots-Tag'));
for(const route of routes){
 const h=fs.readFileSync('dist'+route+'index.html','utf8');
 assert(h.includes('data-design-system="1"'),route+' design system');
 assert(!h.includes('data-design-preview'),route+' obsolete attribute');
 assert.equal((h.match(/data-appearance-choice=/g)||[]).length,4,route+' appearances');
 assert.equal((h.match(/data-locale=/g)||[]).length,9,route+' language paths');
 assert(!/name="robots" content="[^"]*noindex/.test(h),route+' unintended noindex');
 if(!h.includes('id="view-intro"')&&!route.includes('/keepsake/'))assert(h.includes('reading-flow'),route+' body migration');
}
for(const route of['keepsake/success/index.html','keepsake/cancel/index.html','404.html']){
 const h=fs.readFileSync('dist/'+route,'utf8');assert(/name="robots" content="[^"]*noindex/.test(h),route+' private noindex');assert.equal((h.match(/data-locale=/g)||[]).length,9);
}
const before=execFileSync('git',['show','da8941e0155ccd5c12bedfdebc9bfcf0facfcdf1:data/countries.json']),after=fs.readFileSync('data/countries.json');assert.equal(before.toString().replaceAll('\r\n','\n'),after.toString().replaceAll('\r\n','\n'),'Statistical inputs must remain identical after checkout line endings');
const source=fs.readFileSync('app.js','utf8'),old=execFileSync('git',['show','da8941e0155ccd5c12bedfdebc9bfcf0facfcdf1:app.js'],{encoding:'utf8'});assert.equal(source.replaceAll('\r\n','\n').replace("APP_VERSION = '1.17.0'","APP_VERSION = '1.16.9'"),old.replaceAll('\r\n','\n'),'Original simulation source differs beyond release label');
const result={publicRoutes:routes.length,privateAnd404:3,appearanceChoices:4,languagePaths:9,productionOnlyDistribution:true,statisticalInputSha256:createHash('sha256').update(after).digest('hex'),simulationSource:'identical after checkout line endings except APP_VERSION',calendar:'Existing calendar tests and replay proof required separately'};fs.writeFileSync('audit/theme-batch-c/publication-report.json',JSON.stringify(result,null,2));console.log(result);
