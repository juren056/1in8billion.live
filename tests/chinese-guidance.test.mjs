import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {setDictionary,translate} from '../locale-runtime.js';
import {startGuide} from '../content/guides.mjs';
import {uxHelp} from '../content/ux-help.mjs';
import {playbackCopy} from '../playback-copy.js';
import {localeCopy} from '../premium-keepsake/locale-copy.js';

const dictionary=JSON.parse(fs.readFileSync('content/locales/zh-CN.json','utf8'));
const visible=html=>html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g,'').replace(/<[^>]*>/g,' ');
const errors=/汽车可以|内存\s*PNG|本地内存|内存对象|手表寿命|比赛开始条件|利息按钮|观看或行走|选择[“「]明年|选择Watch|Live再次/;

test('Chinese guidance names the actual playback controls and treats keepsakes as memories',()=>{
 setDictionary(dictionary,'zh-CN');
 const c=Object.fromEntries(Object.entries(playbackCopy.en).map(([key,value])=>[key,typeof value==='string'?translate(value):value]));
 const intro=translate(startGuide.en[0]),confirm=translate(startGuide.en[1]);
 assert(intro.includes(c.quick));
 assert(confirm.includes(c.pause));
 assert(confirm.includes(c.auto));
 const help=translate(uxHelp.en[1][1]);
 for(const key of ['pause','auto','slow','quick','stepping','step','read'])assert(help.includes(c[key]),key+' is named consistently');
 const memory=translate(uxHelp.en[2][1]);
 assert(memory.includes('回忆 PNG'));
 assert(memory.includes('不能恢复游戏进度'));
 assert(!errors.test(intro+confirm+help+memory));
 assert.equal(translate('Metric'),'对比指标');
 assert(translate('Japan vs United States: Birth Odds & Game Starting Conditions').includes('人生起点条件'));
 const faq=localeCopy['zh-CN'].faq[0][1];
 assert(faq.includes(localeCopy['zh-CN'].intent));
 assert(faq.includes('不会创建订单或扣款'));
 // Computer memory in an engineering changelog retains its correct technical meaning.
 assert.equal(translate('Fix memory issue in large Lab runs'),'修正 Lab 大量模拟时内存问题');
});

test('Traditional Chinese onboarding and help also use the visible automatic-choice label',()=>{
 assert(startGuide['zh-TW'][1].includes(playbackCopy['zh-TW'].auto));
 const help=uxHelp['zh-TW'][1][1];
 for(const key of ['pause','auto','slow','quick','stepping','step','read'])assert(help.includes(playbackCopy['zh-TW'][key]),key+' in traditional help');
});

test('built Simplified Chinese task pages have reviewed operational meanings and comparison terminology',()=>{
 for(const path of ['','guides/quick-play/','guides/auto-mode/','guides/speed-controls/','guides/replay-links/','compare/','compare/japan-vs-united-states/','keepsake/']){
  const html=fs.readFileSync('dist/zh-cn/'+path+'index.html','utf8'),text=visible(html);
  assert(!errors.test(text),path+': obsolete mistranslated operational text');
  assert(!/<th[^>]*>\s*公制\s*<\/th>/.test(html),path+': Metric is a comparison heading');
 }
 const guide=visible(fs.readFileSync('dist/zh-cn/guides/quick-play/index.html','utf8'));
 assert(guide.includes('开启“自动替我选择”'));
 assert(guide.includes('回忆 PNG'));
 const compare=fs.readFileSync('dist/zh-cn/compare/japan-vs-united-states/index.html','utf8');
 assert.match(compare,/<h1[^>]*>[^<]*人生起点条件<\/h1>/);
 assert.match(compare,/<th[^>]*>对比指标<\/th>/);
 const product=visible(fs.readFileSync('dist/zh-cn/keepsake/index.html','utf8'));
 assert(product.includes('免费 · 无需付款'));assert(!product.includes('正式销售尚未开放'));
 assert(!product.includes('US$2.99'));
});

test('Simplified Chinese keepsake copy describes recorded lives, local recovery and the closed preview clearly',()=>{
 const c=localeCopy['zh-CN'],text=JSON.stringify(c);
 assert(!/一生，印刷中|一个完整的生命|每个生命|从未被发明|被贴上标签|索赔凭证|原始海报|生活时间表|额外工作|云复制|结帐/.test(text));
 assert(c.scope.includes('一段已完成的虚构人生'));
 assert(c.posters.includes('原创海报'));
 assert(c.posterNames.includes('人生时间轴'));
 assert(c.recovery.includes('人生记录与领取凭证'));
 assert(c.recovery.includes('重新读取'));
 assert(c.faq[1][1].includes('实际记录的事件'));
 assert(c.faq[1][1].includes('未记录'));
 assert(c.faq[1][1].includes('不会虚构经历'));
 assert(c.price.includes('US$2.99'));
 assert(c.price.includes('非订阅'));
 assert(c.status.includes('尚未开放付款'));
 assert(c.faq[0][1].includes(c.intent));
 assert(c.faq[0][1].includes('不会创建订单或扣款'));
 assert(c.limits.includes('服务器确认付款'));
 assert(c.paidBody.includes('三种不同版式'));
 assert(c.freeBody.includes('仍然免费'));
});
