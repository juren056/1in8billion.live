import fs from 'node:fs';import {execFileSync} from 'node:child_process';
import {release} from '../release-info.mjs';
let rev='local';try{rev=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();}catch{}
fs.writeFileSync('dist/release.json',JSON.stringify({revision:rev,version:release.version,calendarReviewed:release.calendarReviewed,build:'2026-10-22',project:'1in8billion.live'}));
