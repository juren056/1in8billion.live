#!/usr/bin/env node
/* born-somewhere v4
   人生模擬遊戲：選一個出生地（172 國真實統計），從 0 歲活到當地平均壽命。
   參考原作 1in8b.life 的生命表、死因分布、決策點等核心機制。
   引擎是獨立重寫，不含原作程式碼。
   v4: 從 zu-pu 移植族譜模組 — 自動生成雙親、手足、祖父母、SVG 樹狀圖、GEDCOM 5.5.1。
*/

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const STORAGE_KEY = 'born-somewhere-v2';

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
  pendingDecision: null,
  pastLives: [],
  modal: null,
};

// ==== i18n ====
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

// ==== 國家 ====
function countryById(id) { return COUNTRIES.find(c => c.id === id) || null; }
function localize(c) {
  if (!c) return null;
  return {
    ...c,
    name: LANG === 'en' ? c.name_en : (LANG === 'zh-Hans' ? (c.name_zh_cn || c.name_zh) : c.name_zh),
    region_name: LANG === 'en' ? c.region_en : c.region_zh,
  };
}

// ==== 出生選擇 ====
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

// ==== 生命表 (Gompertz) ====
const LT_CACHE = {};
function lifeTable(c, sex) {
  const key = c.id + sex + (c.yr || '');
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
  let lo = Math.log(1e-9), hi = Math.log(5e-2), r = 0.5;
  for (let i = 0; i < 50; i++) {
    const m = (lo + hi) / 2;
    q[110] = 1;
    const B = Math.exp(m);
    let surv = 1;
    for (let x = 0; x < 110; x++) {
      surv *= (1 - q[x]);
      const halfSurv = Math.sqrt(surv * surv * (1 - q[x]));
      let e = 0;
      for (let xx = 0; xx < 110; xx++) {
        let s = 1;
        for (let yy = 0; yy < xx; yy++) s *= (1 - q[yy]);
        e += s * q[Math.min(xx, 109)] * (xx + 0.5);
      }
    }
    let eCalc = 0;
    let s = 1;
    for (let xx = 0; xx < 110; xx++) {
      eCalc += s * q[xx] * (xx + 0.5);
      s *= (1 - q[xx]);
    }
    if (eCalc > e0) lo = m; else hi = m;
  }
  q[110] = 1;
  let B = Math.exp((lo + hi) / 2);
  LT_CACHE[key] = { q, e0, B };
  return LT_CACHE[key];
}

function pDie(age, c, sex) {
  const lt = lifeTable(c, sex);
  return lt.q[Math.min(age, 110)];
}

// ==== 死因分布 ====
const CAUSE_TABLE = {
  infant: ['早產','出生窒息','新生兒感染','產程傷害','先天缺陷','SIDS'],
  child: ['溺水','交通事故','瘧疾','腹瀉','肺炎','麻疹','交通事故','營養不良','瘧疾','交通事故'],
  teen: ['交通事故','自殺','他殺','溺水','戰傷','交通事故','自殺'],
  adult: ['心血管疾病','癌症','中風','糖尿病','交通事故','自殺','愛滋病','他殺','肝硬化','呼吸道疾病'],
  elder: ['心血管疾病','癌症','中風','糖尿病','呼吸道疾病','失智症','老人跌倒','腎衰竭'],
};
function causeWeights(c, age, sex) {
  if (age < 1) return { '早產': 30, '出生窒息': 20, '新生兒感染': 20, '產程傷害': 10, '先天缺陷': 15, 'SIDS': 5 };
  if (age < 5) return { '腹瀉': 25, '肺炎': 30, '瘧疾': c.region === 'ssa' ? 30 : 5, '麻疹': 5, '營養不良': c.region === 'ssa' ? 15 : 3, '交通事故': 5, '溺水': 5, '先天缺陷': 10 };
  if (age < 15) return { '溺水': c.region === 'ssa' ? 25 : 15, '交通事故': 30, '瘧疾': c.region === 'ssa' ? 20 : 3, '腹瀉': 10, '肺炎': 8, '麻疹': 3, '營養不良': 5, '交通事故': 5 };
  if (age < 25) return { '交通事故': c.region === 'mena' ? 35 : 25, '自殺': c.su / 100 * 20, '他殺': c.ho / 100 * 30, '溺水': 8, '戰傷': (c.wh || 0) * 20, '交通事故': 15 };
  if (age < 60) {
    const cvd = 25, cancer = 25, stroke = 12, diabetes = 6, resp = 8, hiv = c.region === 'ssa' ? 15 : 1, suicide = c.su / 100 * 6, homicide = c.ho / 100 * 5, liver = 5, kidney = 3;
    return { '心血管疾病': cvd, '癌症': cancer, '中風': stroke, '糖尿病': diabetes, '交通事故': 8, '自殺': suicide, '他殺': homicide, '肝硬化': liver, '呼吸道疾病': resp, '愛滋病': hiv, '腎衰竭': kidney };
  }
  return { '心血管疾病': 32, '癌症': 25, '中風': 14, '糖尿病': 6, '呼吸道疾病': 8, '失智症': 6, '老人跌倒': 5, '腎衰竭': 4 };
}

function pickCause(c, age, sex) {
  const weights = causeWeights(c, age, sex);
  const entries = Object.entries(weights);
  const total = entries.reduce((s, [k, v]) => s + v, 0);
  let r = Math.random() * total;
  for (const [k, v] of entries) {
    r -= v;
    if (r <= 0) return k;
  }
  return entries[0][0];
}

// ==== 隨機抽樣 ====
function chance(p) { return Math.random() < p; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ==== 名字 ====
function randomName(country, sex) {
  const c = country;
  const region = c?.region || 'eap';
  const lastNames = {
    'eap': ['張','李','王','陳','林','黃','趙','周','吳','徐','孫','朱','馬','胡','郭','高橋','佐藤','田中','鈴木','伊藤','金','朴','崔','李'],
    'sa': ['Kumar','Singh','Patel','Sharma','Khan','Yadav','Das','Bibi','Roy','Halwai','Patwa','Birjia','Warli'],
    'eca': ['Smith','Johnson','Brown','Garcia','Ivanov','Petrov','Schmidt','Dubois','Kowalski','Jones'],
    'mena': ['Al-Saud','Hassan','Mahmoud','Cohen','Levi','Mansour','Karim','Ahmadi'],
    'ssa': ['Adeyemi','Okafor','Mwangi','Ndlovu','Diallo','Mensah','Okeke','Sankara','Mandela'],
    'lac': ['García','Rodríguez','González','Pérez','Silva','Santos','Mendoza','Hernández','Gutierrez','Jimenez'],
    'na': ['Smith','Johnson','Williams','Brown','Jones','Miller','Davis','Wilson','Moore','Taylor'],
  }[region] || ['Lee','Patel','Garcia'];
  const maleFirsts = {
    'eap': ['志明','建國','俊傑','浩然','志偉','翔太','拓海','蓮','민준','서준','현우','지훈','Andrew','Jason','Michael','Daniel'],
    'sa': ['Saanvi','Aarav','Vihaan','Aditya','Arjun','Rohan','Rahul','Priya','Ananya'],
    'eca': ['Oliver','George','Harry','Jack','Theo','Hugo','Mason','Lucas','Liam','Noah','Ivan','Dmitri','Nikolai','Alexander','Maxim'],
    'mena': ['Mohammed','Ahmed','Youssef','Omar','Hassan','Mahmoud','Yusuf','Tariq','Karim'],
    'ssa': ['Kofi','Kwame','Tunde','Chidi','Emeka','Tendai','Sekou','Bongani','Mandla','Femi'],
    'lac': ['Santiago','Mateo','Sebastián','Diego','Luis','Carlos','Miguel','Alejandro','Eduardo','Javier','Joaquín','Harris','Bryan'],
    'na': ['James','John','Robert','Michael','William','David','Richard','Joseph','Thomas','Howard','Minghao','Wei','Hiroshi'],
  }[region] || ['Alex'];
  const femaleFirsts = {
    'eap': ['雅婷','怡君','心怡','淑芬','美玲','結衣','美咲','陽菜','지아','서연','지유','Emma','Olivia','Sophia','Isabella','Chloe'],
    'sa': ['Priya','Ananya','Saanvi','Aanya','Ishita','Kavya','Meera','Diya','Riya'],
    'eca': ['Olivia','Emma','Charlotte','Amelia','Sophia','Mia','Isabella','Ava','Anastasia','Maria','Olga','Tatiana','Natasha'],
    'mena': ['Fatima','Aisha','Layla','Zainab','Maryam','Noor','Salma','Yasmin','Leila'],
    'ssa': ['Amina','Nia','Zuri','Asha','Imani','Ngozi','Funmi','Tendai','Chipo','Adaeze'],
    'lac': ['Valentina','Camila','Sofía','Isabella','Valeria','Ximena','Luciana','Andrea','Renata','Jimena'],
    'na': ['Mary','Patricia','Jennifer','Linda','Elizabeth','Barbara','Susan','Jessica','Sarah','Karen','Mei','Yuki','Aiko'],
  }[region] || ['Sam'];
  const first = sex === 'M' ? pick(maleFirsts) : pick(femaleFirsts);
  const last = pick(lastNames);
  return { full: (region === 'eca' || region === 'mena' || region === 'ssa' || region === 'lac' || region === 'na' || region === 'sa') ? `${first} ${last}` : `${last}${first}`, full_en: `${first} ${last}`, sex };
}

function pickIndianCaste() {
  const r = Math.random();
  if (r < 0.18) return 'SC';
  if (r < 0.10) return 'ST';
  if (r < 0.45) return 'OBC';
  return 'GEN';
}

// ==== 角色生成 ====
function newLife(countryCode) {
  const c = countryById(countryCode);
  if (!c) return null;
  const sex = Math.random() < 0.5 ? 'M' : 'F';
  const name = randomName(c, sex);
  return {
    country: countryCode,
    countryData: c,
    name,
    sex,
    age: 0,
    year: STATE.era === 'past' ? 1990 : STATE.era === 'future' ? 2080 : 2024,
    yearOffset: 0,
    smoker: chance(c.sm / 100 * 0.5),
    conditions: { diabetes: chance(0.05 * (c.sm / 30)), heart: chance(0.03) },
    log: [],
    quotes: {},
    stats: {
      education: 0,
      married: false,
      partner: null,
      kids: [],
      employment: 'none',
      health: 100,
      happiness: 70,
    },
    died: false,
    cause: null,
    deathAge: null,
    family: generateFamily(countryCode, sex),
  };
}

function generateFamily(countryCode, selfSex) {
  const c = countryById(countryCode);
  if (!c) return { parents: [], siblings: [] };
  const baseYear = (STATE.era === 'past' ? 1990 : STATE.era === 'future' ? 2080 : 2024);
  const fatherName = randomName(c, 'M');
  const motherName = randomName(c, 'F');
  const father = { 
    id: 'f_' + Math.random().toString(36).slice(2,8), 
    name: fatherName.full || fatherName.full_en || '?',
    sex: 'M', country: countryCode, countryData: c,
    birth: { year: baseYear - 30 },
    death: { year: baseYear - 30 + 70 }
  };
  const mother = { 
    id: 'm_' + Math.random().toString(36).slice(2,8),
    name: motherName.full || motherName.full_en || '?',
    sex: 'F', country: countryCode, countryData: c,
    birth: { year: father.birth.year + (Math.random() < 0.5 ? -2 : 3) },
    death: { year: father.birth.year + 75 }
  };
  const siblings = [];
  const nSib = Math.random() < 0.3 ? 0 : Math.random() < 0.6 ? 1 : Math.random() < 0.85 ? 2 : 3;
  for (let i = 0; i < nSib; i++) {
    const sibSex = Math.random() < 0.5 ? 'M' : 'F';
    const nm = randomName(c, sibSex);
    siblings.push({
      id: 's_' + Math.random().toString(36).slice(2,8),
      name: nm.full || nm.full_en || '?',
      sex: sibSex, country: countryCode, countryData: c,
      birth: { year: baseYear - (Math.floor(Math.random()*8)+1) }
    });
  }
  const grandparents = [];
  if (Math.random() < 0.7) {
    const gf = randomName(c, 'M');
    grandparents.push({ id:'gf_'+Math.random().toString(36).slice(2,8), name: gf.full||gf.full_en||'?', sex:'M', country: countryCode, countryData: c, birth:{year: father.birth.year - 28}, death:{year: father.birth.year + 35} });
  }
  if (Math.random() < 0.7) {
    const gm = randomName(c, 'F');
    grandparents.push({ id:'gm_'+Math.random().toString(36).slice(2,8), name: gm.full||gm.full_en||'?', sex:'F', country: countryCode, countryData: c, birth:{year: father.birth.year - 26}, death:{year: father.birth.year + 38} });
  }
  return { parents: [father, mother], siblings, grandparents, partner: null, kids: [] };
}

// ==== 事件 ====
function milestoneEvents(life, newAge) {
  const events = [];
  if (newAge === 6) events.push({ age: 6, kind: 'milestone', icon: '🎒', text: t('event.school.start') });
  if (newAge === 12) events.push({ age: 12, kind: 'milestone', icon: '📚', text: t('event.school.middle') });
  if (newAge === 15) {
    if (life.stats.education < 2 && chance(0.4)) {
      life.stats.education = 1;
      events.push({ age: 15, kind: 'milestone', icon: '📖', text: t('event.education.low') });
    }
  }
  if (newAge === 18) {
    if (life.stats.education === 4 || (life.stats.education === 3 && chance(0.5))) {
      events.push({ age: 18, kind: 'milestone', icon: '🎓', text: t('event.school.graduate') });
    } else if (life.stats.education >= 2) {
      events.push({ age: 18, kind: 'milestone', icon: '🔨', text: t('event.work.start') });
    }
  }
  if (newAge === 22 && life.stats.education === 4 && chance(0.5)) {
    life.stats.education = 4;
    life.stats.employment = 'university';
    events.push({ age: 22, kind: 'milestone', icon: '🎓', text: t('event.education.university') });
  }
  if (newAge >= 25 && newAge <= 35 && !life.stats.married && chance(0.15) && (life.stats.employment === 'university' || life.stats.employment === 'employed')) {
    life.stats.married = true;
    const partnerName = randomName(life.countryData, life.sex === 'M' ? 'F' : 'M');
    life.stats.partner = { name: partnerName, sex: life.sex === 'M' ? 'F' : 'M' };
    events.push({ age: newAge, kind: 'milestone', icon: '💍', text: t('event.marriage', partnerName.full || partnerName.full_en || '') });
  }
  if (life.stats.married && life.stats.kids.length < 3 && newAge >= 25 && newAge <= 45 && chance(0.12)) {
    const sex = Math.random() < 0.5 ? 'M' : 'F';
    const child = { sex, bornAt: newAge };
    life.stats.kids.push(child);
    if (life.family) life.family.kids = life.family.kids || [], life.family.kids.push({ id:'k_'+Math.random().toString(36).slice(2,8), name: randomName(life.countryData, sex).full || '?', sex, country: life.country, countryData: life.countryData, birth:{year: (life.year + life.yearOffset)} });
    events.push({ age: newAge, kind: 'milestone', icon: '👶', text: t('event.baby', life.stats.kids.length) });
  }
  if (newAge === 60 && life.stats.employment !== 'none') {
    life.stats.employment = 'retired';
    events.push({ age: 60, kind: 'milestone', icon: '🏖️', text: t('event.retirement') });
  }
  if (newAge >= 18 && newAge <= 65 && chance(0.04)) {
    const cond = pick(['cancer', 'heart', 'stroke', 'diabetes']);
    life.conditions[cond === 'cancer' ? 'cancer' : cond === 'heart' ? 'heart' : cond === 'stroke' ? 'heart' : 'diabetes'] = true;
    events.push({ age: newAge, kind: 'illness', icon: '💊', text: t('event.illness.' + cond) });
  }
  if (newAge >= 12 && newAge <= 25 && chance(0.02)) {
    events.push({ age: newAge, kind: 'social', icon: '🎓', text: t('event.event.school.exam') });
  }
  if (life.country === 'IND' && life.name.caste === 'SC' && newAge >= 8 && newAge <= 16 && chance(0.08)) {
    events.push({ age: newAge, kind: 'social', icon: '⚠️', text: t('event.caste.disc') });
  }
  if ((life.country === 'NZL' || life.country === 'AUS') && newAge === 18 && chance(0.5)) {
    events.push({ age: newAge, kind: 'social', icon: '🌿', text: LANG === 'en' ? 'You identify as indigenous; get education & health support.' : '你被認定為原住民後裔，獲得教育補助與健康資源。' });
  }
  const wh = life.countryData?.wh || 0;
  if (wh > 0.1 && newAge >= 1 && chance(wh * 0.1)) {
    const warEvt = pick([
      LANG === 'en' ? 'Air raid sirens. The family shelters in the basement.' : '空襲警報響起，全家躲進防空洞。',
      LANG === 'en' ? 'A neighbor dies in the fighting. You witness the scene.' : '鄰居在衝突中喪生，你目睹了場面。',
      LANG === 'en' ? 'Your father is conscripted. Months of silence.' : '父親被徵召上前線，數月無音訊。',
      LANG === 'en' ? 'The neighborhood is evacuated; supplies run short.' : '鄰里被疏散到臨時營地，物資匱乏。',
      LANG === 'en' ? 'Fighting blocks the roads. School closes for a week.' : '武裝衝突封鎖道路，學校關閉一週。',
    ]);
    events.push({ age: newAge, kind: 'heavy', icon: '⚔️', text: warEvt });
  }
  if (['USA','GBR','NZL','AUS','KOR','JPN'].includes(life.country) && newAge === 0) {
    if (chance(0.04)) {
      life.fc = { in: 1, system: 'state' };
      events.push({ age: 0, kind: 'heavy', icon: '🏠', text: LANG === 'en' ? 'You enter foster care due to family circumstances.' : '出生後因家庭變故，被送進寄養系統。' });
    }
  }
  if (['KOR','CHN','VNM','KHM','THA','IND'].includes(life.country) && newAge === 0 && chance(0.005)) {
    events.push({ age: 0, kind: 'social', icon: '🌍', text: LANG === 'en' ? 'You are adopted by a foreign family and grow up in another country.' : '你被一對外國夫婦收養，離開出生地到另一個國家長大。' });
  }
  if (life.country === 'IND' && life.name.caste === 'SC' && newAge >= 18 && chance(0.05)) {
    events.push({ age: newAge, kind: 'social', icon: '📋', text: t('event.caste.form') });
  }
  if ([5, 15, 30, 50, 70].includes(newAge) && !life.quotes[newAge]) {
    STATE.pendingDecision = { age: newAge, type: 'pause' };
  }
  return events;
}

// ==== 主迴圈 ====
function startLife(countryCode) {
  stopTicker();
  STATE.life = newLife(countryCode);
  if (!STATE.life) return;
  STATE.life.log.push({ age: 0, kind: 'birth', icon: '👶', text: t('event.birth', '') });
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
  startTicker();
}
function tick() {
  if (!STATE.life || STATE.life.died || STATE.paused) return;
  const life = STATE.life;
  life.age += 1;
  life.yearOffset += 1;
  const events = milestoneEvents(life, life.age);
  events.forEach(e => life.log.push(e));
  if (STATE.pendingDecision) return;
  const p = pDie(life.age, life.countryData, life.sex);
  if (Math.random() < p) dieNow();
}
function dieNow(forcedCause) {
  if (!STATE.life || STATE.life.died) return;
  const life = STATE.life;
  life.died = true;
  life.deathAge = life.age;
  life.cause = forcedCause || pickCause(life.countryData, life.age, life.sex);
  if (life.family && life.family.kids) life.family.kids.forEach(k => { k.death = { year: (life.year + life.yearOffset - life.age) + life.deathAge }; });
  stopTicker();
  savePastLife(life);
  setView('end');
  renderAll();
}
function logLife(text) {
  if (!STATE.life) return;
  STATE.life.log.push({ age: STATE.life.age, kind: 'log', icon: '📜', text });
  renderLife();
}

// ==== 過去生命 ====
function savePastLife(life) {
  const past = JSON.parse(localStorage.getItem(STORAGE_KEY + ':past') || '[]');
  past.push({
    country: life.country,
    name: life.name.full || life.name.full_en || '?',
    sex: life.sex,
    age: life.deathAge,
    cause: life.cause,
    family: life.family,
    year: life.year,
    yearOffset: life.yearOffset,
  });
  localStorage.setItem(STORAGE_KEY + ':past', JSON.stringify(past));
}
function loadPastLives() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY + ':past') || '[]'); }
  catch (e) { return []; }
}

// ==== 路由 ====
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
  else if (v === 'tree') renderTree();
}

// ==== 渲染 ====
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
  else if (STATE.view === 'tree') renderTree();
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
  $('#lifeName2').textContent = (STATE.life.name.full || STATE.life.name.full_en) || '...';
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
  $('#endBorn').textContent = life.year + '/' + t('event.born_in2', life.sex === 'M' ? t('sex.male') : t('sex.female'));
  $('#endAge').textContent = life.deathAge + ' ' + t('unit.years');
  $('#endCause').textContent = life.cause;
  $('#endName').textContent = life.name.full || life.name.full_en || '—';
  $('#endPortrait').innerHTML = pixelPortraitSVG(life.countryData, life.age, life.sex);
  $('#endLe').textContent = t('end.le', c.le, life.deathAge);
  const past = loadPastLives();
  $('#endPastCount').textContent = past.length;
  const cert = $('#certCanvas');
  if (cert) cert.innerHTML = drawGuilloche(680, 420);
}

function drawGuilloche(w, h) {
  const cx = w / 2, cy = h / 2;
  let svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:0;left:0;pointer-events:none;opacity:0.08;">`;
  for (let r = 30; r < w; r += 18) {
    const rx = r, ry = r * 0.6;
    svg += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#8C1D3C" stroke-width="0.5" />`;
  }
  for (let r = 24; r < w; r += 22) {
    const rx = r, ry = r * 0.5;
    svg += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#0F6E68" stroke-width="0.4" />`;
  }
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    const x = cx + Math.cos(a) * 200;
    const y = cy + Math.sin(a) * 100;
    svg += `<text x="${x}" y="${y}" text-anchor="middle" font-size="10" fill="#8C1D3C" transform="rotate(${a*180/Math.PI} ${x} ${y})">8 億 分 之 1</text>`;
  }
  svg += `</svg>`;
  return svg;
}

function portraitFor(age, sex) {
  if (age < 5) return sex === 'M' ? '👶🏻' : '👶🏻';
  if (age < 18) return sex === 'M' ? '👦' : '👧';
  if (age < 60) return sex === 'M' ? '🧑' : '👩';
  return sex === 'M' ? '👴' : '👵';
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
  if (lives.length === 0) {
    shelf.innerHTML = `<div class="shelf-empty">${t('shelf.empty')}</div>`;
    return;
  }
  for (const life of lives) {
    const c = countryById(life.country);
    const flag = c ? c.flag : '🏳️';
    const book = document.createElement('div');
    book.className = 'shelf-book';
    book.innerHTML = `
      <div class="shelf-cover">
        <div class="shelf-flag">${flag}</div>
        <div class="shelf-spine"></div>
        <div class="shelf-info">
          <div class="shelf-name">${life.name || '—'}</div>
          <div class="shelf-meta">${life.age} 歲</div>
        </div>
      </div>
    `;
    book.title = `${life.name} · ${life.cause}`;
    book.addEventListener('click', () => {
      alert(`${life.name}\n${life.age} 歲 · ${life.cause}`);
    });
    shelf.appendChild(book);
  }
}

function renderSpeedBtns() {
  $$('.speed-btn').forEach(b => {
    b.classList.toggle('active', +b.dataset.speed === STATE.speed);
  });
}

function updateLangSwitcher() {
  const sel = $('#langSwitcher');
  if (sel) sel.value = LANG;
}

// ==== Lab 模式：批次模擬 ====
function runLab(countryCode, era, sexMode, N) {
  const deaths = [];
  const causes = {};
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
        const cause = pickCause(life.countryData, life.age, sex);
        life.cause = cause;
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
  const avg = deaths.reduce((a, b) => a + b, 0) / deaths.length;
  const median = deaths[Math.floor(deaths.length / 2)];
  return { deaths, causes, avg, median, country, N, era: adjustEra };
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
  let html = `<div class="lab-section"><h3>${flag} ${country.name_zh} · ${N} 條人生 · 平均 ${avg.toFixed(1)} 歲（中位 ${median}）</h3></div>`;
  html += '<div class="lab-bins">';
  for (const b of sortedBins) {
    const h = Math.max(2, Math.round((bins[b] / maxCount) * 100));
    html += `<div class="lab-bin"><div class="lab-bar" style="height:${h}px"></div><div class="lab-bin-l">${b}</div><div class="lab-bin-n">${bins[b]}</div></div>`;
  }
  html += '</div>';
  html += '<div class="lab-section"><h3>死因分布</h3><ol class="lab-causes">';
  for (const [c, n] of sortedCauses) {
    const pct = (n / N * 100).toFixed(1);
    html += `<li><span class="lab-cause">${c}</span><span class="lab-cause-n">${n} (${pct}%)</span></li>`;
  }
  html += '</ol></div>';
  target.innerHTML = html;
}

// ==== 事件 ====
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
  if (start) start.addEventListener('click', () => {
    const c = chooseCountry(STATE.birthMode);
    if (c) startLife(c.id);
  });
  const startSelected = $('#btnStartSelected');
  if (startSelected) startSelected.addEventListener('click', () => {
    if (STATE.selectedCountry) startLife(STATE.selectedCountry);
  });
  const pauseBtn = $('#btnPause');
  if (pauseBtn) pauseBtn.addEventListener('click', () => {
    STATE.paused = !STATE.paused;
    pauseBtn.textContent = STATE.paused ? '▶' : '⏸';
  });
  $$('.speed-btn').forEach(b => b.addEventListener('click', () => setSpeed(+b.dataset.speed)));
  const dieBtn = $('#btnDieNow');
  if (dieBtn) dieBtn.addEventListener('click', () => { if (STATE.life && !STATE.life.died) dieNow('自行結束'); });
  const restart = $('#btnRestart');
  if (restart) restart.addEventListener('click', () => setView('intro'));
  const newLife = $('#btnNewLife');
  if (newLife) newLife.addEventListener('click', () => {
    const c = chooseCountry(STATE.birthMode);
    if (c) startLife(c.id);
  });
  document.addEventListener('keydown', e => {
    if (e.key === ' ') { if (STATE.view === 'life') $('#btnPause')?.click(); e.preventDefault(); }
  });
  const labRun = $('#labRun');
  if (labRun) labRun.addEventListener('click', () => {
    const code = $('#labCountry').value;
    const era = $('#labEra').value;
    const sex = $('#labSex').value;
    const N = +$('#labN').value;
    const result = runLab(code, era, sex, N);
    displayLabResults(result);
  });
  $('#treeRoot')?.addEventListener('change', e => { TREE_STATE.rootId = e.target.value; renderTree(); });
  $('#treeMode')?.addEventListener('change', e => { TREE_STATE.mode = e.target.value; renderTree(); });
  $('#treeDepth')?.addEventListener('change', e => { TREE_STATE.depth = +e.target.value; renderTree(); });
  $('#treeRefresh')?.addEventListener('click', () => {
    if (STATE.life) {
      STATE.life.family = generateFamily(STATE.life.country, STATE.life.sex);
      TREE_STATE.rootId = 'self';
      renderTree();
    }
  });
  $('#treeExport')?.addEventListener('click', exportGEDCOM);
  $('#treeImport')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result;
        const n = (text.match(/^0 .* INDI/gm) || []).length;
        toast(t('io.imported', n));
      } catch (err) { toast('GEDCOM 解析失敗'); }
    };
    reader.readAsText(file);
  });
}

async function init() {
  await loadData();
  document.documentElement.lang = LANG;
  wire();
  renderAll();
}
init();

/* =====================================================================
   族譜模組 (zu-pu 移植)：以目前人生為中心，產生祖上/子孫 SVG 樹
   ===================================================================== */
const TREE_STATE = { rootId: null, mode: 'ancestor', depth: 3 };

function treePeopleGraph() {
  if (!STATE.life || !STATE.life.family) return { people: {}, edges: [] };
  const f = STATE.life.family;
  const self = {
    id: 'self',
    name: STATE.life.name.full || STATE.life.name.full_en || 'You',
    nameEn: STATE.life.name.full_en || '',
    sex: STATE.life.sex,
    country: STATE.life.country,
    countryData: STATE.life.countryData,
    birth: { year: STATE.life.year + STATE.life.yearOffset - STATE.life.age },
    death: STATE.life.died ? { year: (STATE.life.year + STATE.life.yearOffset - STATE.life.age) + STATE.life.deathAge } : null,
    family: STATE.life.country === 'IND' ? STATE.life.name.caste : null
  };
  const people = { [self.id]: self };
  f.parents.forEach(p => { people[p.id] = p; });
  f.siblings.forEach(p => { people[p.id] = p; });
  (f.grandparents||[]).forEach(p => { people[p.id] = p; });
  (f.kids||[]).forEach(p => { people[p.id] = p; });
  const edges = [];
  if (f.parents[0]) edges.push({ parentId: f.parents[0].id, childId: 'self' });
  if (f.parents[1]) edges.push({ parentId: f.parents[1].id, childId: 'self' });
  f.siblings.forEach(s => {
    if (f.parents[0]) edges.push({ parentId: f.parents[0].id, childId: s.id });
    if (f.parents[1]) edges.push({ parentId: f.parents[1].id, childId: s.id });
  });
  (f.grandparents||[]).forEach(gp => {
    const par = f.parents.find(p => p.sex === gp.sex && Math.abs((p.birth?.year||0) - (gp.birth?.year||0)) < 35);
    if (par) edges.push({ parentId: gp.id, childId: par.id });
  });
  (f.kids||[]).forEach(k => {
    edges.push({ parentId: 'self', childId: k.id });
    if (f.parents[0]) edges.push({ parentId: f.parents[0].id, childId: k.id });
    if (f.parents[1]) edges.push({ parentId: f.parents[1].id, childId: k.id });
  });
  return { people, edges };
}

function renderTree() {
  const canvas = $('#treeCanvas');
  if (!canvas) return;
  canvas.innerHTML = '';
  if (!STATE.life) {
    canvas.innerHTML = `<div class="muted" style="padding:24px;text-align:center;">${t('intro.cta.hint')}</div>`;
    return;
  }
  const { people, edges } = treePeopleGraph();
  const ids = Object.keys(people);
  if (!ids.length) {
    canvas.innerHTML = `<div class="muted" style="padding:24px;text-align:center;">—</div>`;
    return;
  }
  let rootId = TREE_STATE.rootId || 'self';
  if (!people[rootId]) rootId = 'self';
  TREE_STATE.rootId = rootId;
  const sel = $('#treeRoot');
  if (sel && sel.children.length !== ids.length) {
    sel.innerHTML = '';
    for (const id of ids) {
      const p = people[id];
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = `${p.name}${p.birth?.year ? ' ('+p.birth.year+')' : ''}${id==='self'?' · '+t('label.center',''):''}`;
      if (id === rootId) opt.selected = true;
      sel.appendChild(opt);
    }
  } else if (sel) {
    Array.from(sel.options).forEach((opt) => {
      const id = opt.value;
      const p = people[id];
      if (!p) return;
      opt.textContent = `${p.name}${p.birth?.year ? ' ('+p.birth.year+')' : ''}${id==='self'?' · '+t('label.center',''):''}`;
    });
    sel.value = rootId;
  }
  const mode = TREE_STATE.mode;
  const depth = +TREE_STATE.depth;
  if (mode === 'ancestor') renderAncestorTree(canvas, rootId, depth, people, edges);
  else if (mode === 'descendant') renderDescendantTree(canvas, rootId, depth, people, edges);
  else renderBothTree(canvas, rootId, depth, people, edges);
}

function getAncestorLayout(rootId, maxGen, people, edges) {
  const nodes = [];
  const links = [];
  function recurse(id, gen, xSlot) {
    if (!id || !people[id]) return;
    if (gen > maxGen) return;
    if (nodes.find(n => n.id === id)) return;
    nodes.push({ id, gen, xSlot });
    if (gen < maxGen) {
      const parents = edges.filter(e => e.childId === id).map(e => e.parentId);
      const slotW = Math.pow(2, maxGen - gen - 1);
      recurse(parents[0], gen + 1, xSlot);
      if (parents[1]) recurse(parents[1], gen + 1, xSlot + slotW);
      else recurse(parents[0], gen + 1, xSlot);
      const slotW2 = Math.pow(2, maxGen - gen - 1);
      if (parents[0]) links.push({ from: { gen: gen+1, xSlot }, to: { gen, xSlot } });
      if (parents[1]) links.push({ from: { gen: gen+1, xSlot: xSlot + slotW2 }, to: { gen, xSlot } });
    }
  }
  recurse(rootId, 0, Math.pow(2, maxGen) / 2 - 0.5);
  return { nodes, links, totalSlots: Math.pow(2, maxGen) };
}

function renderAncestorTree(canvas, rootId, maxGen, people, edges) {
  const layout = getAncestorLayout(rootId, maxGen, people, edges);
  const slotW = 220, rowH = 130, marginX = 30, marginY = 30;
  const w = marginX * 2 + layout.totalSlots * slotW;
  const h = marginY * 2 + (maxGen + 1) * rowH;
  const svg = svgEl('svg', { width: w, height: h, viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: 'xMidYMid meet', style:'max-width:100%;height:auto;' });
  for (const { from, to } of layout.links) {
    const fn = layout.nodes.find(n => n.xSlot === from.xSlot && n.gen === from.gen);
    const tn = layout.nodes.find(n => n.xSlot === to.xSlot && n.gen === to.gen);
    if (!fn || !tn) continue;
    const fx = marginX + fn.xSlot * slotW + slotW/2;
    const fy = marginY + fn.gen * rowH + 40;
    const tx = marginX + tn.xSlot * slotW + slotW/2;
    const ty = marginY + tn.gen * rowH + 90;
    svgEl('path', { d: `M ${fx} ${fy} L ${fx} ${fy + (ty-fy)/2} L ${tx} ${fy + (ty-fy)/2} L ${tx} ${ty}`, class: 'tree-link' }, svg);
  }
  for (const n of layout.nodes) {
    drawPersonNode(svg, people[n.id], marginX + n.xSlot * slotW, marginY + n.gen * rowH, slotW - 12, 80, n.id === TREE_STATE.rootId);
  }
  canvas.appendChild(svg);
}

function renderDescendantTree(canvas, rootId, maxGen, people, edges) {
  const nodes = [{ id: rootId, gen: 0 }];
  const subEdges = [];
  function recurse(id, gen) {
    if (gen >= maxGen) return;
    const kids = edges.filter(e => e.parentId === id).map(e => e.childId);
    for (const k of kids) {
      nodes.push({ id: k, gen: gen + 1 });
      subEdges.push({ parentId: id, childId: k });
      recurse(k, gen + 1);
    }
  }
  recurse(rootId, 0);
  const genCounts = [];
  for (let g = 0; g <= maxGen; g++) genCounts.push(nodes.filter(n => n.gen === g).length);
  const maxInGen = Math.max(...genCounts, 1);
  const slotW = 240, rowH = 130, marginX = 30, marginY = 30;
  const totalW = marginX * 2 + maxInGen * slotW;
  const totalH = marginX * 2 + (maxGen + 1) * rowH;
  const genOffsets = genCounts.map(c => (maxInGen - c) * slotW / 2);
  const nodePos = {};
  for (let g = 0; g <= maxGen; g++) {
    nodes.filter(n => n.gen === g).forEach((n, i) => {
      nodePos[n.id] = { x: marginX + genOffsets[g] + i * slotW, y: marginY + g * rowH };
    });
  }
  const svg = svgEl('svg', { width: totalW, height: totalH, viewBox: `0 0 ${totalW} ${totalH}`, preserveAspectRatio: 'xMidYMid meet', style:'max-width:100%;height:auto;' });
  for (const e of subEdges) {
    const a = nodePos[e.parentId], b = nodePos[e.childId];
    if (!a || !b) continue;
    svgEl('path', { d: `M ${a.x + slotW/2} ${a.y + 80} L ${a.x + slotW/2} ${a.y + (b.y-a.y)/2} L ${b.x + slotW/2} ${a.y + (b.y-a.y)/2} L ${b.x + slotW/2} ${b.y}`, class: 'tree-link' }, svg);
  }
  for (const n of nodes) drawPersonNode(svg, people[n.id], nodePos[n.id].x, nodePos[n.id].y, slotW - 12, 80, n.id === TREE_STATE.rootId);
  canvas.appendChild(svg);
}

function renderBothTree(canvas, rootId, maxGen, people, edges) {
  renderAncestorTree(canvas, rootId, Math.max(1, Math.floor(maxGen/2)), people, edges);
}

function drawPersonNode(svg, p, x, y, w, h, selected) {
  const g = svgEl('g', { class: 'tree-node' + (selected ? ' selected' : ''), transform: `translate(${x}, ${y})` }, svg);
  const genderColor = p.sex === 'M' ? '#4a6da8' : p.sex === 'F' ? '#b86998' : '#c2b693';
  const deceased = !!(p.death && p.death.year);
  const dash = deceased ? '4 5' : '';
  const op = deceased ? 0.6 : 1;
  svgEl('rect', { class: 'node-rect ' + (p.sex === 'M' ? 'node-m' : p.sex === 'F' ? 'node-f' : 'node-u'),
    x: 0, y: 0, width: w, height: h, rx: 8, ry: 8,
    fill: '#faf7f0', stroke: genderColor, 'stroke-width': selected ? 2.5 : 1.5, 'stroke-dasharray': dash, opacity: op }, g);
  const portrait = svgEl('svg', { x: 6, y: 4, width: 56, height: 70, viewBox: '0 0 200 200' }, g);
  portrait.innerHTML = pixelPortraitSVG(p.countryData, computeAge(p), p.sex).match(/<svg[^>]*>(.*)<\/svg>/)?.[1] || '';
  const nameY = 22;
  const nameEl = svgEl('text', { class: 'node-name', x: 70, y: nameY, 'font-size': 14, 'font-weight': 500, fill: '#1a1a1a' }, g);
  nameEl.textContent = p.name || '?';
  if (p.nameEn && p.nameEn !== p.name) {
    const ne = svgEl('text', { class: 'node-en', x: 70, y: nameY + 14, 'font-size': 10, fill: '#7a7a7a' }, g);
    ne.textContent = p.nameEn;
  }
  const lifeText = p.birth?.year ? `${p.birth.year || '?'} – ${p.death?.year || ''}` : '';
  if (lifeText) {
    const lt = svgEl('text', { class: 'node-life', x: 70, y: h - 8, 'font-size': 10, fill: '#7a7a7a' }, g);
    lt.textContent = lifeText;
  }
  if (deceased) {
    const c = svgEl('text', { x: w - 12, y: 16, 'font-size': 14, fill: '#a04040', 'text-anchor': 'end' }, g);
    c.textContent = '†';
  }
}

function svgEl(tag, attrs, parent) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const k in attrs) {
    if (Object.prototype.hasOwnProperty.call(attrs, k)) {
      const v = attrs[k];
      if (v !== undefined && v !== null) el.setAttribute(k, String(v));
    }
  }
  if (parent) parent.appendChild(el);
  return el;
}

function computeAge(p) {
  const by = p.birth?.year || 1990;
  const ey = p.death?.year || 2024;
  return Math.max(0, ey - by);
}

function exportGEDCOM() {
  const { people, edges } = treePeopleGraph();
  const lines = ['0 HEAD','1 SOUR born-somewhere','2 VERS 4','1 GEDC','2 VERS 5.5.1','2 FORM LINEAGE-LINKED','1 CHAR UTF-8'];
  const idMap = {};
  let i = 1;
  for (const id of Object.keys(people)) idMap[id] = 'I' + (i++);
  for (const id of Object.keys(people)) {
    const p = people[id];
    const gid = idMap[id];
    lines.push(`0 ${gid} INDI`);
    lines.push(`1 NAME ${p.name || '?'}`);
    if (p.sex) lines.push(`1 SEX ${p.sex}`);
    if (p.birth?.year) {
      lines.push(`1 BIRT`);
      lines.push(`2 DATE ${p.birth.year}`);
      if (p.country) lines.push(`2 PLAC ${p.country}`);
    }
    if (p.death?.year) {
      lines.push(`1 DEAT`);
      lines.push(`2 DATE ${p.death.year}`);
    }
  }
  let famI = 1;
  const parents = {};
  edges.forEach(e => {
    if (!parents[e.childId]) parents[e.childId] = [];
    parents[e.childId].push(e.parentId);
  });
  const seenFamilies = new Set();
  for (const childId of Object.keys(parents)) {
    const key = [...parents[childId]].sort().join('+') + '>' + childId;
    if (seenFamilies.has(key)) continue;
    seenFamilies.add(key);
    const fid = 'F' + (famI++);
    parents[childId].forEach((pid, idx) => lines.push(`1 ${idx === 0 ? 'HUSB' : 'WIFE'} ${idMap[pid]}`));
    lines.push(`1 CHIL ${idMap[childId]}`);
  }
  lines.push('0 TRLR');
  const blob = new Blob([lines.join('\r\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `born-somewhere-${Date.now()}.ged`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(t('io.exported', Object.keys(people).length));
}

function toast(msg, ms=2200) {
  let el = $('#toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.hidden = false;
  setTimeout(() => { el.hidden = true; }, ms);
}