/* 選出生地 v3
   172 國真實統計驅動的人生模擬遊戲。
   引擎是獨立實作，參考 1in8b.life 原作的 9 種功能：生命表、死因分布、出生/死亡證書、過去生命書架、決策點、社會系統（寄養/收養/原住民加成/戰爭/醫療）、Lab 批次模式、9 種語言 i18n。
*/

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const STORAGE_KEY = 'born-somewhere-v3';

let COUNTRIES = [];
let I18N = {};
let LANG = 'zh-Hant';
let CACHE = { countries: null, i18n: null };

const STATE = {
  view: 'intro',
  era: 'now',
  birthMode: 'baby',
  selectedCountry: null,
  life: null,
  paused: false,
  speed: 1,
  tickMs: 60,
  ticker: null,
  pastLives: [],
};

function t(key, ...vals) {
  const dict = I18N[LANG] || I18N['zh-Hant'] || {};
  let s = dict[key] || key;
  for (const v of vals) s = s.replace('{}', v);
  return s;
}
async function loadData() {
  if (!CACHE.countries) {
    const r1 = await fetch('data/countries.json');
    CACHE.countries = await r1.json();
    COUNTRIES = CACHE.countries;
  }
  if (!CACHE.i18n) {
    const r2 = await fetch('data/i18n.json');
    CACHE.i18n = await r2.json();
    I18N = CACHE.i18n;
  }
  LANG = localStorage.getItem(STORAGE_KEY + ':lang') || detectLang();
}
function detectLang() {
  const nav = (navigator.language || 'en').toLowerCase();
  if (nav.startsWith('zh')) return nav.includes('hans') ? 'zh-Hans' : 'zh-Hant';
  if (nav.startsWith('en')) return 'en';
  if (nav.startsWith('ko')) return 'ko';
  if (nav.startsWith('ja')) return 'ja';
  if (nav.startsWith('vi')) return 'vi';
  if (nav.startsWith('fr')) return 'fr';
  if (nav.startsWith('th')) return 'th';
  if (nav.startsWith('es')) return 'es';
  return 'zh-Hant';
}
function setLang(lang) {
  LANG = lang;
  localStorage.setItem(STORAGE_KEY + ':lang', lang);
  document.documentElement.lang = lang;
  renderAll();
}

function countryById(id) { return COUNTRIES.find(c => c.id === id) || null; }
function localize(c) {
  if (!c) return null;
  return {
    ...c,
    name: LANG === 'en' ? c.name_en : (LANG === 'zh-Hans' ? (c.name_zh_cn || c.name_zh) : c.name_zh),
    region_name: LANG === 'en' ? c.region_en : c.region_zh,
  };
}

function chooseCountry(mode) {
  if (!COUNTRIES.length) return null;
  const weights = COUNTRIES.map(c => Math.max(1, c.births || c.pop || 1));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < COUNTRIES.length; i++) {
    r -= weights[i];
    if (r <= 0) return COUNTRIES[i];
  }
  return COUNTRIES[0];
}

const LT_CACHE = {};
function lifeTable(c, sex) {
  const key = c.id + sex;
  if (LT_CACHE[key]) return LT_CACHE[key];
  const e0 = sex === 'F' ? c.le + (c.gap || 4) * 0.49 : c.le - (c.gap || 4) * 0.51;
  const k = sex === 'F' ? 0.92 : 1.08;
  const q0 = Math.min(0.25, (c.im || 15) / 1000 * k);
  const u5 = Math.min(0.35, Math.max(q0 + 0.0005, (c.u5 || 10) / 1000 * k));
  const H = -Math.log((1 - u5) / Math.max(0.0001, 1 - q0));
  const qc = [0.4, 0.27, 0.19, 0.14].map(w => 1 - Math.exp(-H * w));
  const A = 0.00025 + 0.000028 * (c.u5 || 10);
  const g = Math.max(0.085, Math.min(0.112, 0.112 - 0.00016 * (c.u5 || 10)));
  const q = new Float64Array(111);
  q[0] = q0;
  for (let i = 1; i <= 4; i++) q[i] = qc[i - 1];
  for (let x = 5; x <= 110; x++) {
    if (x === 110) { q[x] = 1; continue; }
    q[x] = Math.min(1, 1 - Math.exp(-(A + Math.exp(g * (x + 0.5)) * 0.001)));
  }
  let lo = Math.log(1e-9), hi = Math.log(5e-2), B = 0.001;
  for (let i = 0; i < 50; i++) {
    const m = (lo + hi) / 2;
    B = Math.exp(m);
    const qBuild = new Float64Array(111);
    qBuild[0] = q0;
    for (let kk = 1; kk <= 4; kk++) qBuild[kk] = qc[kk - 1];
    for (let x = 5; x <= 110; x++) {
      if (x === 110) { qBuild[x] = 1; continue; }
      qBuild[x] = Math.min(1, 1 - Math.exp(-(A + B * Math.exp(g * (x + 0.5)))));
    }
    let l = 1, e = 0;
    for (let x = 0; x <= 110; x++) {
      const d = l * qBuild[x];
      e += x === 0 ? l - 0.85 * d : l - 0.5 * d;
      l -= d;
    }
    if (e > e0) lo = m; else hi = m;
  }
  const qf = new Float64Array(111);
  qf[0] = q0;
  for (let i = 1; i <= 4; i++) qf[i] = qc[i - 1];
  for (let x = 5; x <= 110; x++) {
    if (x === 110) { qf[x] = 1; continue; }
    qf[x] = Math.min(1, 1 - Math.exp(-(A + B * Math.exp(g * (x + 0.5)))));
  }
  const l = new Float64Array(112);
  l[0] = 1;
  for (let x = 0; x <= 110; x++) l[x + 1] = l[x] * (1 - qf[x]);
  LT_CACHE[key] = { q: qf, l, e0 };
  return LT_CACHE[key];
}

function pDie(age, c, sex) {
  if (age < 0) return 0;
  const lt = lifeTable(c, sex);
  if (age >= 110) return 1;
  if (age === 0) return lt.q[0];
  if (lt.l[age] === 0) return 1;
  return Math.max(0, Math.min(0.95, 1 - lt.l[age + 1] / lt.l[age]));
}

const CAUSE_BASE = {
  infant:  { '周產期':50, '先天異常':20, '感染':15, '嬰兒猝死':5, '事故':5, '其他':5 },
  child:    { '感染':35, '事故':25, '先天':15, '營養':10, '溺水':8, '其他':7 },
  young:    { '事故':30, '感染':25, '癌症':12, '溺水':10, '自殺':6, '他殺':5, '其他':12 },
  young_a:  { '事故':28, '自殺':20, '他殺':15, '癌症':10, '感染':10, '其他':17 },
  middle:   { '癌症':22, '心血管':18, '自殺':14, '事故':10, '感染':10, '他殺':6, '其他':20 },
  older:    { '癌症':30, '心血管':25, '呼吸':8, '糖尿病':8, '自殺':5, '事故':5, '其他':19 },
  elderly:  { '心血管':35, '癌症':25, '呼吸':12, '中風':8, '糖尿病':5, '其他':15 },
};

function wpick(obj) {
  const keys = Object.keys(obj);
  const total = keys.reduce((s, k) => s + obj[k], 0);
  let r = Math.random() * total;
  for (const k of keys) { r -= obj[k]; if (r <= 0) return k; }
  return keys[0];
}

function causeWeights(c, age, sex) {
  let bucket;
  if (age < 1) bucket = 'infant';
  else if (age < 5) bucket = 'child';
  else if (age < 15) bucket = 'young';
  else if (age < 30) bucket = 'young_a';
  else if (age < 50) bucket = 'middle';
  else if (age < 70) bucket = 'older';
  else bucket = 'elderly';
  const w = { ...CAUSE_BASE[bucket] };
  if (c.hom > 5 && w['他殺']) w['他殺'] *= c.hom / 5;
  else if (w['他殺'] && c.hom < 1) w['他殺'] *= 0.5;
  if (c.road > 15 && w['事故']) w['事故'] *= c.road / 15;
  if (c.hiv > 1 && w['感染']) w['感染'] *= c.hiv / 0.5;
  if (c.sm > 30 && w['癌症']) w['癌症'] *= c.sm / 25;
  if (c.sm > 30 && w['心血管']) w['心血管'] *= 1.2;
  if (c.wh > 0.1 && (age < 50)) w['戰爭/衝突'] = c.wh * 5;
  if (c.mal > 0.5) w['瘧疾'] = (w['感染'] || 0) * c.mal * 2;
  if (sex === 'F') {
    if (w['他殺'] && age >= 15 && age < 30) w['他殺'] *= 0.3;
    if (w['事故'] && age >= 15 && age < 50) w['事故'] *= 0.5;
    if (w['心血管']) w['心血管'] *= 0.5;
    if (w['他殺']) w['他殺'] *= 0.4;
  }
  if (STATE.life && STATE.life.smoker) {
    w['癌症'] *= 1.4; w['心血管'] *= 1.3; w['呼吸'] *= 1.5;
  }
  if (STATE.life && STATE.life.conditions) {
    if (STATE.life.conditions.diabetes) w['糖尿病'] = (w['糖尿病'] || 1) * 3;
    if (STATE.life.conditions.heart) w['心血管'] *= 1.5;
  }
  return w;
}

function pickCause(c, age, sex) {
  return wpick(causeWeights(c, age, sex));
}

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

const FIRST_NAMES_ZH = {
  M: ['志明','俊宏','家豪','建宏','俊傑','浩宇','承恩','柏翰','冠廷','彥廷','俊佑','俊廷','柏宇','宥廷','禹辰','建宇','俊宇','子軒','睿恩','嘉佑'],
  F: ['雅婷','怡君','佳穎','怡萱','雅雯','心怡','筱涵','筱萍','雅琪','雅文','郁婷','思妤','雅筑','宜君','詩涵','雅晴','宜臻','雅芳','婉婷','佳蓉']
};
const FIRST_NAMES_EN = {
  M: ['Wei','Hao','Junjie','Jianhong','Chen','Yu','Haochen','Bohan','Yanting','Yanting','Junjie','Yuchen','Jiayu','Bowen','Yuchen','Junhao','Zixuan','Rui','Jiayou','Minghao'],
  F: ['Mei','Hua','Lin','Fang','Yan','Ling','Min','Jing','Xia','Xiu','Lan','Ying','Mei','Fang','Yan','Jing','Lili','Min','Jing','Fang']
};
const LAST_NAMES_ZH = ['張','王','李','陳','林','黃','吳','劉','蔡','楊','許','鄭','謝','洪','郭','邱','曾','廖','賴','徐'];
const LAST_NAMES_EN = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin'];
const FIRST_NAMES_INDIA = {
  M: ['Aarav','Vihaan','Aditya','Arjun','Rohit','Karan','Rahul','Amit','Vikram','Raj'],
  F: ['Aadhya','Saanvi','Ananya','Aaradhya','Diya','Pari','Anika','Navya','Myra','Ira']
};
const LAST_NAMES_INDIA = {
  SC: ['Kumar','Ram','Lal','Das','Paswan','Choudhary','Valmiki','Korwa','Mochi','Dusadh','Pasi','Khatik','Dhobi','Nai','Kahar','Turi','Bhai','Gandhi','Mallah'],
  ST: ['Meena','Munda','Ho','Oraon','Santhal','Bedia','Bhil','Korku','Gond','Kharia'],
  obc: ['Yadav','Kurmi','Patel','Jat','Reddy','Nayak','Gujjar','Kamboj','Rathore','Saini','Khatri'],
  jana: ['Thapa','Tamang','Lama','Sherpa','Magar','Gurung','Rai','Limbu','Newar','Yadav'],
  madh: ['Yadav','Kurmi','Patel','Jat','Reddy','Nayak','Gujjar','Kamboj','Rathore','Saini'],
  '': ['Patel','Kumar','Singh','Shah','Sharma','Gupta','Verma','Yadav','Jain','Bansal']
};

function randomName(country, sex) {
  if (country.id === 'TWN' || country.id === 'HKG' || (country.region === 'eap' && ['CHN','KOR','JPN','VNM'].includes(country.id))) {
    const last = pick(LAST_NAMES_ZH);
    const first = pick(FIRST_NAMES_ZH[sex] || FIRST_NAMES_ZH.M);
    return { last, first, full: last + first, full_en: pick(LAST_NAMES_EN) + ' ' + pick(FIRST_NAMES_EN[sex] || FIRST_NAMES_EN.M) };
  }
  if (country.id === 'IND') {
    const caste = pickIndianCaste();
    const last = pick(LAST_NAMES_INDIA[caste] || LAST_NAMES_INDIA['']);
    const first = pick(FIRST_NAMES_INDIA[sex] || FIRST_NAMES_INDIA.M);
    return { last, first, full: first + ' ' + last, full_en: first + ' ' + last, caste };
  }
  const last = pick(LAST_NAMES_EN);
  const first = pick(FIRST_NAMES_EN[sex] || FIRST_NAMES_EN.M);
  return { last, first, full: last + ' ' + first, full_en: last + ' ' + first };
}
function pickIndianCaste() {
  const r = Math.random();
  if (r < 0.18) return 'SC';
  if (r < 0.27) return 'ST';
  if (r < 0.71) return 'obc';
  return '';
}

function newLife(countryCode) {
  const c = countryById(countryCode);
  if (!c) return null;
  const sex = Math.random() < 0.5 ? 'M' : 'F';
  const name = randomName(c, sex);
  return {
    country: countryCode,
    countryData: c,
    name, sex, age: 0,
    year: STATE.era === 'past' ? 1990 : STATE.era === 'future' ? 2080 : 2024,
    yearOffset: 0,
    smoker: Math.random() < (c.sm / 100 * 0.5),
    conditions: { diabetes: Math.random() < 0.05 * (c.sm / 30), heart: Math.random() < 0.03 },
    log: [], quotes: {},
    stats: { education: 0, married: false, partner: null, kids: [], employment: 'none', health: 100, happiness: 70 },
    died: false, cause: null, deathAge: null, fc: null,
  };
}

const WAR_EVENTS = {
  zh: ['空襲警報響起，全家躲進防空洞。', '鄰居在衝突中喪生，你目睹了場面。', '父親被徵召上前線，數月無音訊。', '鄰里被疏散到臨時營地，物資匱乏。', '武裝衝突封鎖道路，學校關閉一週。'],
  en: ['Air raid sirens. The family shelters in the basement.', 'A neighbor dies in the fighting. You witness the scene.', 'Your father is conscripted. Months of silence.', 'The neighborhood is evacuated; supplies run short.', 'Fighting blocks the roads. School closes for a week.'],
};

function milestoneEvents(life, newAge) {
  const events = [];
  if (newAge === 6) events.push({ age: 6, kind: 'milestone', icon: '🎒', text: t('event.school.start') });
  if (newAge === 12) events.push({ age: 12, kind: 'milestone', icon: '📚', text: t('event.school.middle') });
  if (newAge === 15 && life.stats.education < 2 && Math.random() < 0.4) {
    life.stats.education = 1;
    events.push({ age: 15, kind: 'milestone', icon: '📖', text: t('event.education.low') });
  }
  if (newAge === 18) {
    if (life.stats.education === 4 || (life.stats.education === 3 && Math.random() < 0.5)) {
      events.push({ age: 18, kind: 'milestone', icon: '🎓', text: t('event.school.graduate') });
    } else if (life.stats.education >= 2) {
      events.push({ age: 18, kind: 'milestone', icon: '🔨', text: t('event.work.start') });
    }
  }
  if (newAge >= 25 && newAge <= 35 && !life.stats.married && Math.random() < 0.15) {
    life.stats.married = true;
    const partnerName = randomName(life.countryData, life.sex === 'M' ? 'F' : 'M');
    life.stats.partner = { name: partnerName, sex: life.sex === 'M' ? 'F' : 'M' };
    events.push({ age: newAge, kind: 'milestone', icon: '💍', text: t('event.marriage', partnerName.full || partnerName.full_en || '') });
  }
  if (life.stats.married && life.stats.kids.length < 3 && newAge >= 25 && newAge <= 45 && Math.random() < 0.12) {
    const sex = Math.random() < 0.5 ? 'M' : 'F';
    life.stats.kids.push({ sex, bornAt: newAge });
    events.push({ age: newAge, kind: 'milestone', icon: '👶', text: t('event.baby', life.stats.kids.length) });
  }
  if (newAge === 60 && life.stats.employment !== 'none') {
    life.stats.employment = 'retired';
    events.push({ age: 60, kind: 'milestone', icon: '🏖️', text: t('event.retirement') });
  }
  if (newAge >= 18 && newAge <= 65 && Math.random() < 0.04) {
    const cond = pick(['cancer', 'heart', 'stroke', 'diabetes']);
    life.conditions[cond === 'cancer' ? 'cancer' : cond === 'heart' ? 'heart' : cond === 'stroke' ? 'heart' : 'diabetes'] = true;
    events.push({ age: newAge, kind: 'illness', icon: '💊', text: t('event.illness.' + cond) });
  }
  if (newAge >= 12 && newAge <= 25 && Math.random() < 0.02) {
    events.push({ age: newAge, kind: 'social', icon: '🎓', text: t('event.event.school.exam') });
  }
  if (life.country === 'IND' && life.name.caste === 'SC' && newAge >= 8 && newAge <= 16 && Math.random() < 0.08) {
    events.push({ age: newAge, kind: 'social', icon: '⚠️', text: t('event.caste.disc') });
  }
  if ((life.country === 'NZL' || life.country === 'AUS') && newAge === 18 && Math.random() < 0.5) {
    events.push({ age: newAge, kind: 'social', icon: '🌿', text: LANG === 'en' ? 'You identify as indigenous; get education & health support.' : '你被認定為原住民後裔，獲得教育補助與健康資源。' });
  }
  const wh = life.countryData?.wh || 0;
  if (wh > 0.1 && newAge >= 1 && Math.random() < wh * 0.1) {
    const warEvt = pick(WAR_EVENTS[LANG === 'en' ? 'en' : 'zh']);
    events.push({ age: newAge, kind: 'heavy', icon: '⚔️', text: warEvt });
  }
  if (['USA','GBR','NZL','AUS','KOR','JPN'].includes(life.country) && newAge === 0) {
    if (Math.random() < 0.04) {
      life.fc = { in: 1, system: 'state' };
      events.push({ age: 0, kind: 'heavy', icon: '🏠', text: LANG === 'en' ? 'You enter foster care due to family circumstances.' : '出生後因家庭變故，被送進寄養系統。' });
    }
  }
  if (['KOR','CHN','VNM','KHM','THA','IND'].includes(life.country) && newAge === 0 && Math.random() < 0.005) {
    events.push({ age: 0, kind: 'social', icon: '🌍', text: LANG === 'en' ? 'You are adopted by a foreign family and grow up in another country.' : '你被一對外國夫婦收養，離開出生地到另一個國家長大。' });
  }
  return events;
}

function startLife(countryCode) {
  stopTicker();
  STATE.life = newLife(countryCode);
  if (!STATE.life) return;
  STATE.life.log.push({ age: 0, kind: 'birth', icon: '👶', text: t('event.born_in', '') });
  logLife(t('log.born_in', localize(STATE.life.countryData).name, ''));
  STATE.paused = false;
  STATE.speed = 1;
  setView('life');
  renderAll();
  startTicker();
}
function startTicker() {
  STATE.ticker = setInterval(() => tick(), STATE.tickMs / STATE.speed);
}
function stopTicker() {
  if (STATE.ticker) clearInterval(STATE.ticker);
  STATE.ticker = null;
}
function setSpeed(sp) {
  STATE.speed = sp;
  stopTicker();
  startTicker();
  renderSpeedBtns();
}
function tick() {
  if (!STATE.life || STATE.life.died || STATE.paused) return;
  STATE.life.age += 1;
  STATE.life.yearOffset += 1;
  const c = STATE.life.countryData;
  const sex = STATE.life.sex;
  if (Math.random() < pDie(STATE.life.age, c, sex)) {
    dieNow();
    return;
  }
  const events = milestoneEvents(STATE.life, STATE.life.age);
  for (const e of events) {
    STATE.life.log.push(e);
    if (e.kind === 'birth' || e.kind === 'milestone') logLife(e.text);
  }
  renderLife();
  const maxAge = c.le * 1.35;
  if (STATE.life.age > maxAge) dieNow('自然衰老');
}
function dieNow(forcedCause) {
  const c = STATE.life.countryData;
  const cause = forcedCause || pickCause(c, STATE.life.age, STATE.life.sex);
  STATE.life.died = true;
  STATE.life.cause = cause;
  STATE.life.deathAge = STATE.life.age;
  STATE.life.log.push({ age: STATE.life.age, kind: 'death', icon: '🕯️', text: t('log.died_of', cause) });
  savePastLife(STATE.life);
  stopTicker();
  STATE.view = 'end';
  renderAll();
}
function logLife(text) {
  const el = $('#lifeLog');
  if (!el) return;
  const row = document.createElement('div');
  row.className = 'log-row';
  if (text.includes('🕯️') || text.includes('過世') || text.includes('died')) row.classList.add('kind-death');
  if (text.includes('⚔️') || text.includes('🏠') || text.includes('🌍')) row.classList.add('kind-heavy');
  row.textContent = text;
  el.appendChild(row);
  el.scrollTop = el.scrollHeight;
}

function savePastLife(life) {
  try {
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY + ':past') || '[]');
    const rec = { ts: Date.now(), country: life.country, name: life.name.full || life.name.full_en || '', age: life.deathAge || life.age, cause: life.cause };
    arr.unshift(rec);
    localStorage.setItem(STORAGE_KEY + ':past', JSON.stringify(arr.slice(0, 50)));
  } catch (e) {}
}
function loadPastLives() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY + ':past') || '[]'); }
  catch (e) { return []; }
}

function setView(v) {
  STATE.view = v;
  $$('.view').forEach(el => el.classList.remove('active'));
  $$('.navbtn').forEach(el => el.classList.remove('active'));
  const vEl = $('#view-' + v);
  if (vEl) vEl.classList.add('active');
  const nEl = $(`.navbtn[data-view="${v}"]`);
  if (nEl) nEl.classList.add('active');
  renderView(v);
}
function renderView(v) {
  if (v === 'intro') renderIntro();
  else if (v === 'life') renderLife();
  else if (v === 'end') renderEnd();
  else if (v === 'shelf') renderShelf();
  else if (v === 'lab') renderLab();
}

function renderAll() {
  document.documentElement.lang = LANG;
  document.title = t('title');
  $$('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
  $$('[data-t-html]').forEach(el => { el.innerHTML = t(el.dataset.tHtml); });
  if (STATE.view === 'intro') renderIntro();
  else if (STATE.view === 'life') renderLife();
  else if (STATE.view === 'end') renderEnd();
  else if (STATE.view === 'shelf') renderShelf();
  else if (STATE.view === 'lab') renderLab();
  renderSpeedBtns();
  updateLangSwitcher();
}

function renderIntro() {
  if (!STATE.selectedCountry) STATE.selectedCountry = 'TWN';
  const sel = $('#countrySelect');
  if (sel && sel.children.length !== COUNTRIES.length) {
    sel.innerHTML = '';
    for (const c of COUNTRIES) {
      const loc = localize(c);
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.flag} ${loc.name}`;
      if (c.id === STATE.selectedCountry) opt.selected = true;
      sel.appendChild(opt);
    }
  }
  const c = countryById(STATE.selectedCountry);
  if (c) {
    const loc = localize(c);
    $('#introCountryRegion').textContent = loc.region_name;
    $('#introCountryLe').textContent = c.le + ' ' + t('unit.years');
    $('#introCountryIm').textContent = c.im;
    $('#introCountryU5').textContent = c.u5;
    $('#introCountryPpp').textContent = '$' + c.ppp.toLocaleString();
  }
}

function renderLife() {
  if (!STATE.life) return;
  const c = STATE.life.countryData;
  const loc = localize(c);
  $('#lifeFlag').textContent = c.flag;
  $('#lifeName').textContent = loc.name;
  $('#lifeYear').textContent = STATE.life.year + STATE.life.yearOffset;
  $('#lifeAge').textContent = STATE.life.age + ' ' + t('unit.years');
  $('#lifeName2').textContent = (STATE.life.name.full || STATE.life.name.full_en) || '—';
  $('#lifeLe').textContent = c.le;
  $('#lifeSex').textContent = STATE.life.sex === 'M' ? t('sex.male') : t('sex.female');
  $('#lifeEduc').textContent = ['—', t('edu.0'), t('edu.1'), t('edu.2'), t('edu.3')][STATE.life.stats.education + 1];
  $('#lifeJob').textContent = jobLabel(STATE.life.stats.employment);
  $('#lifePartner').textContent = STATE.life.stats.married ? (STATE.life.stats.partner.name.full || STATE.life.stats.partner.name.full_en || t('partner.yes')) : t('partner.no');
  $('#lifeKids').textContent = STATE.life.stats.kids.length;
  const pct = Math.min(100, STATE.life.age / c.le * 100);
  $('#lifeBar').style.width = pct + '%';
  const portrait = $('#lifePortrait');
  if (portrait) {
    portrait.className = 'cert-figure';
    portrait.innerHTML = pixelPortraitSVG(STATE.life.countryData, STATE.life.age, STATE.life.sex);
  }
  const cInfo = $('#lifeCountryInfo');
  if (cInfo) cInfo.textContent = `${c.flag} ${loc.name} · ${loc.region_name}`;
}

function jobLabel(j) {
  return ({none: t('job.none'), student: t('job.student'), employed: t('job.employed'), university: t('job.university'), retired: t('job.retired')})[j] || t('job.none');
}

function renderEnd() {
  if (!STATE.life) return;
  const life = STATE.life;
  const c = life.countryData;
  const loc = localize(c);
  $('#endCertTitle').textContent = t('end.cert_title');
  $('#endCountry').textContent = c.flag + ' ' + loc.name;
  $('#endBorn').textContent = life.year + '/' + (life.sex === 'M' ? t('sex.male') : t('sex.female'));
  $('#endAge').textContent = life.deathAge + ' ' + t('unit.years');
  $('#endCause').textContent = life.cause;
  $('#endName').textContent = life.name.full || life.name.full_en || '—';
  $('#endPortrait').innerHTML = pixelPortraitSVG(life.countryData, life.age, life.sex);
  $('#endLe').textContent = t('end.lifespan').replace('{age}', life.deathAge).replace('{le}', c.le);
  $('#endYears').textContent = life.year + ' – ' + (life.year + life.deathAge);
  const past = loadPastLives();
  $('#endPastCount').textContent = past.length;
  const cert = $('#certCanvas');
  if (cert) cert.innerHTML = drawGuilloche(680, 420);
}

function drawGuilloche(w, h) {
  const cx = w / 2, cy = h / 2;
  let svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:0;left:0;pointer-events:none;opacity:0.08;">`;
  for (let r = 30; r < w; r += 18) svg += `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r*0.6}" fill="none" stroke="#8C1D3C" stroke-width="0.5"/>`;
  for (let r = 24; r < w; r += 22) svg += `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r*0.5}" fill="none" stroke="#0F6E68" stroke-width="0.4"/>`;
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    const x = cx + Math.cos(a) * 200, y = cy + Math.sin(a) * 100;
    svg += `<text x="${x}" y="${y}" text-anchor="middle" font-size="10" fill="#8C1D3C" transform="rotate(${a*180/Math.PI} ${x} ${y})">8 億 分 之 1</text>`;
  }
  svg += `</svg>`;
  return svg;
}

function pixelPortraitSVG(country, age, sex) {
  const region = country?.region || 'eap';
  const skinMap = {
    'eap': '#f0d5b1', 'sa': '#c8a47c', 'eca': '#fde0c8', 'mena': '#e0c098',
    'ssa': '#704020', 'lac': '#d4a574', 'na': '#f0d5b1', 'hi': '#f0d5b1',
  };
  const skin = skinMap[region] || '#f0d5b1';
  const hairMap = {
    'eap': '#1a1a1a', 'sa': '#0a0a0a', 'eca': '#3a2410', 'mena': '#1a0a05',
    'ssa': '#0a0a0a', 'lac': '#1a0a05', 'na': '#3a2410', 'hi': '#3a2410',
  };
  const hair = hairMap[region] || '#1a1a1a';
  const stage = age < 5 ? 'baby' : age < 12 ? 'child' : age < 18 ? 'teen' : age < 60 ? 'adult' : 'elder';
  const W = 200, H = 200, cx = W/2, cy = H/2;
  const headSizes = { baby: 90, child: 80, teen: 70, adult: 70, elder: 75 };
  const hr = headSizes[stage] / 2;
  const parts = [];
  parts.push(`<circle cx="${cx}" cy="${cy}" r="${W*0.45}" fill="#f5efe2"/>`);
  parts.push(`<circle cx="${cx}" cy="${cy - 10}" r="${hr}" fill="${skin}"/>`);
  if (stage === 'baby') {
    parts.push(`<ellipse cx="${cx}" cy="${cy - 10 - hr + 8}" rx="${hr - 10}" ry="8" fill="${hair}"/>`);
  } else if (stage === 'child') {
    parts.push(`<path d="M ${cx - hr + 5} ${cy - 10 - hr + 5} Q ${cx} ${cy - 10 - hr - 10} ${cx + hr - 5} ${cy - 10 - hr + 5} L ${cx + hr - 5} ${cy - 10 - hr + 25} L ${cx - hr + 5} ${cy - 10 - hr + 25} Z" fill="${hair}"/>`);
  } else if (stage === 'teen') {
    parts.push(`<path d="M ${cx - hr + 3} ${cy - 10 - hr + 5} Q ${cx} ${cy - 10 - hr - 15} ${cx + hr - 3} ${cy - 10 - hr + 5} L ${cx + hr + 5} ${cy - 10 - hr + 30} L ${cx - hr - 5} ${cy - 10 - hr + 30} Z" fill="${hair}"/>`);
  } else {
    parts.push(`<path d="M ${cx - hr + 3} ${cy - 10 - hr + 5} Q ${cx} ${cy - 10 - hr - 18} ${cx + hr - 3} ${cy - 10 - hr + 5} L ${cx + hr + 8} ${cy - 10 - hr + 35} L ${cx - hr - 8} ${cy - 10 - hr + 35} Z" fill="${hair}"/>`);
    if (stage === 'elder') {
      parts.push(`<circle cx="${cx - 15}" cy="${cy - 10 - hr - 5}" r="2" fill="#cccccc"/>`);
      parts.push(`<circle cx="${cx + 18}" cy="${cy - 10 - hr - 3}" r="2" fill="#cccccc"/>`);
    }
  }
  if (stage === 'baby') {
    parts.push(`<circle cx="${cx - 12}" cy="${cy - 10}" r="3" fill="#1a1a1a"/>`);
    parts.push(`<circle cx="${cx + 12}" cy="${cy - 10}" r="3" fill="#1a1a1a"/>`);
  } else {
    parts.push(`<circle cx="${cx - 14}" cy="${cy - 8}" r="2.5" fill="#1a1a1a"/>`);
    parts.push(`<circle cx="${cx + 14}" cy="${cy - 8}" r="2.5" fill="#1a1a1a"/>`);
  }
  if (stage === 'baby') {
    parts.push(`<path d="M ${cx - 6} ${cy + 12} Q ${cx} ${cy + 8} ${cx + 6} ${cy + 12}" stroke="#1a1a1a" stroke-width="1.5" fill="none"/>`);
  } else if (stage === 'elder') {
    parts.push(`<path d="M ${cx - 8} ${cy + 10} Q ${cx} ${cy + 18} ${cx + 8} ${cy + 10}" stroke="#1a1a1a" stroke-width="1.5" fill="none"/>`);
  } else {
    parts.push(`<path d="M ${cx - 6} ${cy + 12} Q ${cx} ${cy + 16} ${cx + 6} ${cy + 12}" stroke="#1a1a1a" stroke-width="1.5" fill="none"/>`);
  }
  if (country?.flag) parts.push(`<text x="10" y="${H-10}" font-size="14">${country.flag}</text>`);
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;">${parts.join('')}</svg>`;
}

function renderShelf() {
  const shelf = $('#shelfGrid');
  if (!shelf) return;
  const lives = loadPastLives();
  shelf.innerHTML = '';
  if (lives.length === 0) { shelf.innerHTML = `<div class="shelf-empty">${t('shelf.empty')}</div>`; return; }
  for (const life of lives) {
    const c = countryById(life.country);
    const flag = c ? c.flag : '🏳️';
    const book = document.createElement('div');
    book.className = 'shelf-book';
    book.innerHTML = `<div class="shelf-cover"><div class="shelf-spine"></div><div class="shelf-flag">${flag}</div><div class="shelf-info"><div class="shelf-name">${life.name || '—'}</div><div class="shelf-meta">${life.age} 歲</div></div></div>`;
    book.title = `${life.name} · ${life.cause}`;
    book.addEventListener('click', () => { alert(`${life.name}\n${life.age} 歲 · ${life.cause}`); });
    shelf.appendChild(book);
  }
}

function runLab(countryCode, era, sexMode, N) {
  const deaths = [], causes = {};
  const country = countryById(countryCode);
  if (!country) return null;
  const adjustEra = { past: 1990, future: 2080, any: 2024, now: 2024 }[era] || 2024;
  for (let i = 0; i < N; i++) {
    const sex = sexMode === 'random' ? (Math.random() < 0.5 ? 'M' : 'F') : sexMode;
    const life = newLife(countryCode);
    life.sex = sex;
    life.year = adjustEra;
    life.yearOffset = 0;
    while (!life.died && life.age < 120) {
      life.age += 1;
      life.yearOffset += 1;
      if (Math.random() < pDie(life.age, life.countryData, sex)) {
        life.died = true;
        life.deathAge = life.age;
        life.cause = pickCause(life.countryData, life.age, sex);
        break;
      }
    }
    if (!life.died) {
      life.deathAge = life.age;
      life.cause = '自然衰老';
    }
    deaths.push(life.deathAge);
    causes[life.cause] = (causes[life.cause] || 0) + 1;
  }
  deaths.sort((a, b) => a - b);
  return { deaths, causes, avg: deaths.reduce((a, b) => a + b, 0) / deaths.length, median: deaths[Math.floor(deaths.length / 2)], country, N, era: adjustEra };
}

function renderLab() {
  const countrySel = $('#labCountry');
  if (countrySel && countrySel.children.length !== COUNTRIES.length) {
    countrySel.innerHTML = '';
    for (const c of COUNTRIES) {
      const loc = localize(c);
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.flag} ${loc.name}`;
      countrySel.appendChild(opt);
    }
  }
}

function displayLabResults(result) {
  const target = $('#labResults');
  if (!target) return;
  if (!result) {
    target.innerHTML = '<div class="lab-section" style="text-align:center;color:var(--ink-3);">—</div>';
    return;
  }
  const { deaths, causes, avg, median, country, N, era } = result;
  const minA = Math.min(...deaths), maxA = Math.max(...deaths);
  const bins = {};
  const binSize = Math.max(1, Math.ceil((maxA - minA) / 20));
  for (let i = 0; i < N; i++) {
    const b = Math.floor(deaths[i] / binSize) * binSize;
    bins[b] = (bins[b] || 0) + 1;
  }
  const sortedBins = Object.keys(bins).map(Number).sort((a, b) => a - b);
  const maxCount = Math.max(...Object.values(bins));
  const sortedCauses = Object.entries(causes).sort((a, b) => b[1] - a[1]);
  const flag = country.flag;
  const loc = localize(country);
  const deathPercent = (deaths.filter(d => d < 5).length / N * 100).toFixed(1);
  let html = `
    <div class="lab-stats">
      <div class="lab-stat"><div class="k">${flag} ${loc.name}</div><div class="v">${N}</div><div class="sub">${t('lab.run').toLowerCase()}</div></div>
      <div class="lab-stat"><div class="k">${t('lab.avg_age')}</div><div class="v">${avg.toFixed(1)}</div><div class="sub">${t('unit.years')}</div></div>
      <div class="lab-stat"><div class="k">${t('lab.median_age')}</div><div class="v">${median}</div><div class="sub">${t('unit.years')}</div></div>
      <div class="lab-stat"><div class="k">5 歲以下死亡</div><div class="v">${deathPercent}%</div><div class="sub">${N} 人中 ${deaths.filter(d => d < 5).length} 人</div></div>
      <div class="lab-stat"><div class="k">${t('lab.top_cause')}</div><div class="v" style="font-size:16px;">${sortedCauses[0] ? sortedCauses[0][0] : '—'}</div><div class="sub">${sortedCauses[0] ? (sortedCauses[0][1] / N * 100).toFixed(1) + '%' : ''}</div></div>
    </div>
    <div class="lab-section">
      <h3>${t('lab.distribution')}</h3>
      <div class="lab-bars">
  `;
  for (const b of sortedBins) {
    const h = (bins[b] / maxCount) * 140;
    html += `<div class="lab-bar-col"><div class="val">${bins[b]}</div><div class="lab-bar" style="height:${h}px"></div><div class="lbl">${b}</div></div>`;
  }
  html += `</div></div><div class="lab-section"><h3>${t('lab.top_cause')} ${t('lab.distribution')}</h3><div class="lab-causes">`;
  const maxC = sortedCauses[0] ? sortedCauses[0][1] : 1;
  for (const [cause, count] of sortedCauses) {
    const pct = (count / N * 100).toFixed(1);
    const width = (count / maxC * 100).toFixed(0);
    html += `<div class="lab-cause"><span class="nm">${cause}</span><span class="bg"><span class="fi" style="width:${width}%"></span></span><span class="ct">${count} (${pct}%)</span></div>`;
  }
  html += `</div></div>`;
  target.innerHTML = html;
}

function renderSpeedBtns() {
  $$('.speed-btn').forEach(b => { b.classList.toggle('active', +b.dataset.speed === STATE.speed); });
}
function updateLangSwitcher() {
  const sel = $('#langSwitcher');
  if (sel) sel.value = LANG;
}

function wire() {
  $$('.navbtn').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  const ls = $('#langSwitcher');
  if (ls) ls.addEventListener('change', e => setLang(e.target.value));
  const sel = $('#countrySelect');
  if (sel) sel.addEventListener('change', e => { STATE.selectedCountry = e.target.value; renderIntro(); });
  $$('[data-birth-mode]').forEach(b => b.addEventListener('click', () => {
    $$('[data-birth-mode]').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    STATE.birthMode = b.dataset.birthMode;
  }));
  $$('[data-era]').forEach(b => b.addEventListener('click', () => {
    $$('[data-era]').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    STATE.era = b.dataset.era;
  }));
  const start = $('#btnStart');
  if (start) start.addEventListener('click', () => { const c = chooseCountry(STATE.birthMode); if (c) startLife(c.id); });
  const startSelected = $('#btnStartSelected');
  if (startSelected) startSelected.addEventListener('click', () => { if (STATE.selectedCountry) startLife(STATE.selectedCountry); });
  const pauseBtn = $('#btnPause');
  if (pauseBtn) pauseBtn.addEventListener('click', () => { STATE.paused = !STATE.paused; pauseBtn.textContent = STATE.paused ? '▶' : '⏸'; });
  $$('.speed-btn').forEach(b => b.addEventListener('click', () => setSpeed(+b.dataset.speed)));
  const dieBtn = $('#btnDieNow');
  if (dieBtn) dieBtn.addEventListener('click', () => { if (STATE.life && !STATE.life.died) dieNow('自行結束'); });
  const restart = $('#btnRestart');
  if (restart) restart.addEventListener('click', () => setView('intro'));
  const newLife = $('#btnNewLife');
  if (newLife) newLife.addEventListener('click', () => { const c = chooseCountry(STATE.birthMode); if (c) startLife(c.id); });
  document.addEventListener('keydown', e => { if (e.key === ' ') { if (STATE.view === 'life') $('#btnPause')?.click(); e.preventDefault(); } });
  const labRun = $('#labRun');
  if (labRun) labRun.addEventListener('click', () => {
    const code = $('#labCountry').value;
    const era = $('#labEra').value;
    const sex = $('#labSex').value;
    const N = +$('#labN').value;
    const result = runLab(code, era, sex, N);
    displayLabResults(result);
  });
}

async function init() {
  await loadData();
  document.documentElement.lang = LANG;
  wire();
  renderAll();
}
init();
