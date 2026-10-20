import fs from 'node:fs';import {execFileSync} from 'node:child_process';
let rev='local';try{rev=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();}catch{}
fs.writeFileSync('dist/release.json',JSON.stringify({revision:rev,build:'2026-10-20',project:'1in8billion.live'}));
