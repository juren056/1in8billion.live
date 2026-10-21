import{execFileSync,spawn}from'node:child_process';
if(process.env.CI||process.env.CF_PAGES||process.env.CLOUDFLARE_ACCOUNT_ID)throw Error('Theme batch A is a local preview, not a production release');
execFileSync(process.execPath,['scripts/build.mjs'],{stdio:'inherit',env:{...process.env,THEME_PREVIEW:'1'}});
if(process.argv.includes('--serve')){const server=spawn(process.execPath,['scripts/serve.mjs'],{stdio:'inherit'});server.on('exit',code=>process.exitCode=code||0);}
