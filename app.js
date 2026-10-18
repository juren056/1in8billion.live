/* born-somewhere v2
   人生模擬遊戲：選一個出生地（172 國真實統計），從 0 歲活到當地平均壽命。
   參考原作 1in8b.life 的生命表、死因分布、決策點等核心機制。
   引擎是獨立重寫，不含原作程式碼。
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
  const nav = navigator.language;
  if (nav.startsWith('zh')) return nav.includes('Hans') ? 'zh-Hans' : 'zh-Hant';
  if (nav.startsWith('en')) return 'en';
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
  let lo = Math.log(1e-9), hi = Math.log(5e-2);
  for (let i = 0; i < 50; i++) {
    const m = (lo + hi) / 2;
    const B = Math.exp(m);
    let l = 1, e = 0;
    for (let x = 0; x <= 110; x++) {
      const qx = (x < 5) ? q[x] : Math.min(1, 1 - Math.exp(-(A + B * Math.exp(g * (x + 0.5)))));
      const d = l * qx;
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
    qf[x] = Math.min(1, 1 - Math.exp(-(A + Math.exp(g * (x + 0.5)) * 0.001)));
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
  infant:  { '周產期問題':50, '先天異常':20, '感染性疾病':15, '嬰兒猝死':5, '事故':5, '其他':5 },
  child:    { '感染性疾病':35, '事故':25, '先天異常':15, '營養不良':10, '溺水':8, '其他':7 },
  young:    { '事故':30, '感染性疾病':25, '癌症':12, '溺水':10, '自殺':6, '他殺':5, '其他':12 },
  young_a:  { '事故':28, '自殺':20, '他殺':15, '癌症':10, '感染性疾病':10, '其他':17 },
  middle:   { '癌症':22, '心血管':18, '自殺':14, '事故':10, '感染性疾病':10, '他殺':6, '其他':20 },
  older:    { '癌症':30, '心血管':25, '呼吸系統':8, '糖尿病':8, '自殺':5, '事故':5, '其他':19 },
  elderly:  { '心血管':35, '癌症':25, '呼吸系統':12, '中風':8, '糖尿病':5, '其他':15 },
};

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
  if (c.hiv > 1 && w['感染性疾病']) w['感染性疾病'] *= c.hiv / 0.5;
  if (c.sm > 30 && w['癌症']) w['癌症'] *= c.sm / 25;
  if (c.sm > 30 && w['心血管']) w['心血管'] *= 1.2;
  if (c.wh > 0.1 && (age < 50)) {
    w['戰爭/衝突'] = c.wh * 5;
  }
  if (c.mal > 0.5) {
    w['瘧疾'] = (w['感染性疾病'] || 0) * c.mal * 2;
  }
  if (sex === 'F') {
    if (w['他殺'] && age >= 15 && age < 30) w['他殺'] *= 0.3;
    if (w['他殺'] && age >= 30 && age < 50) w['他殺'] *= 0.5;
    if (w['事故'] && age >= 15 && age < 50) w['事故'] *= 0.5;
  }
  if (STATE.life && STATE.life.smoker) {
    w['癌症'] *= 1.4; w['心血管'] *= 1.3; w['呼吸系統'] *= 1.5;
  }
  if (STATE.life && STATE.life.conditions) {
    if (STATE.life.conditions.diabetes) w['糖尿病'] = (w['糖尿病'] || 1) * 3;
    if (STATE.life.conditions.heart) w['心血管'] *= 1.5;
  }
  return w;
}

function pickCause(c, age, sex) {
  const w = causeWeights(c, age, sex);
  const keys = Object.keys(w);
  const weights = keys.map(k => Math.max(0.001, w[k]));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < keys.length; i++) {
    r -= weights[i];
    if (r <= 0) return keys[i];
  }
  return keys[0];
}

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const wpick = (obj) => {
  const keys = Object.keys(obj);
  const total = keys.reduce((s, k) => s + obj[k], 0);
  let r = Math.random() * total;
  for (const k of keys) { r -= obj[k]; if (r <= 0) return k; }
  return keys[0];
};
const rand = (a, b) => a + Math.random() * (b - a);
const irand = (a, b) => Math.floor(rand(a, b + 1));
const chance = p => Math.random() < p;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const FIRST_NAMES_ZH = {
  M: ['志明','俊宏','家豪','建宏','俊傑','浩宇','承恩','柏翰','冠廷','彥廷','俊佑','俊廷','柏宇','宥廷','禹辰','建宇','俊宇','子軒','睿恩','嘉佑','家明','俊宏','志強','志偉','志豪','志遠','家豪','家銘','家祥','家瑞','國華','建國','建華','建民','建志','志強','志明','志偉','志豪','志遠','俊傑','俊宏','俊豪','俊宇','家豪','家銘','家祥','家瑞'],
  F: ['雅婷','怡君','佳穎','怡萱','雅雯','心怡','筱涵','筱萍','雅琪','雅文','郁婷','思妤','雅筑','宜君','詩涵','雅晴','宜臻','雅芳','婉婷','佳蓉','家瑜','家琪','雅琪','雅雯','怡君','佳穎','怡萱','雅雯','心怡','筱涵','筱萍','雅琪','雅文','郁婷','思妤','雅筑','宜君','詩涵','雅晴','宜臻','雅芳','婉婷','佳蓉','婉婷','佳蓉','家瑜','家琪','雅琪','雅雯','美華','美玲','美君','美玉','美麗','淑芬','淑君','淑玲','玉嬌','秀蘭','秀英','秀梅','秀珍','秀珠','秀鳳','麗華','麗君','麗玲','麗娟','麗美','麗珍','麗珠','麗鳳','麗雲','麗霞','麗秋','麗月','麗雪','麗冰','麗卿','麗珊','麗貞','麗蓉','麗蓮','麗萍','麗燕','麗虹','麗鳳','麗鸞','麗雁','麗燕','麗鸞']
};
const FIRST_NAMES_EN = {
  M: ['Wei','Hao','Junjie','Jianhong','Chen','Yu','Haochen','Bohan','Yanting','Yanting','Junjie','Yuchen','Jiayu','Bowen','Yuchen','Junhao','Zixuan','Rui','Jiayou','Minghao','David','James','Michael','John','Robert','William','Daniel','Matthew','Anthony','Mark','Steven','Paul','Andrew','Kenneth','George','Joshua','Kevin','Brian','Edward','Ronald','Timothy','Jason','Jeffrey','Ryan','Jacob','Gary','Nicholas','Eric','Jonathan','Stephen','Larry','Justin','Scott','Brandon','Benjamin','Samuel','Gregory','Alexander','Frank','Patrick','Raymond','Jack','Dennis','Jerry','Tyler','Aaron','Jose','Adam','Nathan','Henry','Douglas','Zachary','Peter','Kyle','Walter','Ethan','Jeremy','Harold','Keith','Christian','Roger','Noah','Gerald','Carl','Terry','Sean','Austin','Arthur','Lawrence','Jesse','Dylan','Bryan','Joe','Jordan','Billy','Bruce','Albert','Willie','Gabriel','Alan','Ralph','Logan'],
  F: ['Mei','Hua','Lin','Fang','Yan','Ling','Min','Jing','Xia','Xiu','Lan','Ying','Mei','Fang','Yan','Jing','Lili','Min','Jing','Fang','Mei','Lan','Ying','Hua','Lily','Emma','Olivia','Ava','Sophia','Isabella','Mia','Charlotte','Amelia','Harper','Evelyn','Abigail','Emily','Ella','Elizabeth','Camila','Luna','Sofia','Avery','Mila','Aria','Scarlett','Penelope','Layla','Chloe','Victoria','Madison','Eleanor','Grace','Zoe','Nora','Riley','Zoey','Hannah','Hazel','Lily','Ellie','Violet','Aurora','Savannah','Audrey','Brooklyn','Bella','Claire','Skylar','Lucy','Paisley','Everly','Anna','Caroline','Nova','Genesis','Emilia','Kennedy','Samantha','Maya','Willow','Kinsley','Naomi','Aaliyah','Elena','Sarah','Ariana','Allison','Gabriella','Alice','Madelyn','Cora','Ruby','Eva','Serenity','Autumn','Adeline','Hailey','Gianna','Valentina','Isla','Eliana','Quinn','Nevaeh','Ivy','Sadie','Lydia','Piper','Lyla','Maya','Hailey']
};
const LAST_NAMES_ZH = ['張','王','李','陳','林','黃','吳','劉','蔡','楊','許','鄭','謝','洪','郭','邱','曾','廖','賴','徐','周','葉','蘇','莊','呂','江','何','羅','高','蕭','朱','羅','董','余','沈','許','韓','曹','許','鄧','曹','彭','曾','田','丁','杜','傅','范','方','鄒'];
const LAST_NAMES_EN = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Gomez','Phillips','Evans','Turner','Diaz','Parker','Cruz','Edwards','Collins','Reyes','Stewart','Morris','Morales','Murphy','Cook','Rogers','Gutierrez','Ortiz','Morgan','Cooper','Peterson','Bailey','Reed','Kelly','Howard','Ramos','Kim','Cox','Ward','Richardson','Watson','Brooks','Chavez','Wood','James','Bennett','Gray','Mendoza','Ruiz','Hughes','Price','Alvarez','Castillo','Sanders','Patel','Myers','Long','Ross','Foster','Jimenez'];
const FIRST_NAMES_INDIA = {
  M: ['Aarav','Vihaan','Aditya','Arjun','Rohit','Karan','Rahul','Amit','Vikram','Raj','Arun','Suresh','Mohan','Krishna','Ravi','Sanjay','Anil','Manish','Deepak','Pradeep','Rakesh','Sunil','Vinod','Ashok','Rajesh','Ajay','Naveen','Manoj','Dinesh','Pankaj','Sandeep','Mukesh','Anand','Sandeep','Rakesh','Prakash','Mukesh','Vivek','Vikas'],
  F: ['Aadhya','Saanvi','Ananya','Aaradhya','Diya','Pari','Anika','Navya','Myra','Ira','Aarohi','Anvi','Misha','Anaya','Pihu','Riya','Aaradhya','Ananya','Saanvi','Diya','Aadhya','Pari','Navya','Myra','Aarohi','Anvi','Misha','Pihu','Riya','Anaya','Saanvi','Diya','Aadhya','Pari','Navya','Myra','Aarohi','Anvi','Misha','Pihu','Riya','Anaya']
};
const LAST_NAMES_INDIA = {
  SC: ['Kumar','Ram','Lal','Das','Paswan','Choudhary','Valmiki','Korwa','Mochi','Dusadh','Pasi','Khatik','Dhobi','Nai','Kahar','Turi','Bhai','Gandhi','Mallah'],
  ST: ['Meena','Munda','Ho','Oraon','Santhal','Bedia','Bhil','Korku','Gond','Kharia','Baiga'],
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
    name,
    sex,
    age: 0,
    year: STATE.era === 'past' ? 1990 : STATE.era === 'future' ? 2080 : 2024,
    yearOffset: 0,
    smoker: chance(c.sm / 100 * 0.5),
    conditions: { diabetes: chance(0.05 * (c.sm / 30)), heart: chance(0.03) },
    log: [],
    quotes: {},
    stats: { education: 0, married: false, partner: null, kids: [], employment: 'none', health: 100, happiness: 70 },
    died: false, cause: null, deathAge: null,
  };
}

function milestoneEvents(life, newAge) {
  const events = [];
  if (newAge === 6) events.push({ age: 6, kind: 'milestone', icon: '🎒', text: t('event.school.start') });
  if (newAge === 12) events.push({ age: 12, kind: 'milestone', icon: '📚', text: t('event.school.middle') });
  if (newAge === 15 && life.stats.education < 2 && chance(0.4)) {
    life.stats.education = 1;
    events.push({ age: 15, kind: 'milestone', icon: '📖', text: t('event.education.low') });
  }
  if (newAge === 18) {
    if (life.stats.education === 4 || (life.stats.education === 3 && chance(0.5))) {
      events.push({ age: 18, kind: 'milestone', icon: '🎓', text: t('event.school.graduate') });
    } else if (life.stats.education >= 2) {
      events.push({ age: 18, kind: 'milestone', icon: '🔨', text: t('event.work.start') });
    }
  }
  if (newAge >= 25 && newAge <= 35 && !life.stats.married && chance(0.15)) {
    life.stats.married = true;
    const partnerName = randomName(life.countryData, life.sex === 'M' ? 'F' : 'M');
    life.stats.partner = { name: partnerName, sex: life.sex === 'M' ? 'F' : 'M' };
    events.push({ age: newAge, kind: 'milestone', icon: '💍', text: t('event.marriage', partnerName.full || partnerName.full_en || '') });
  }
  if (life.stats.married && life.stats.kids.length < 3 && newAge >= 25 && newAge <= 45 && chance(0.12)) {
    const sex = Math.random() < 0.5 ? 'M' : 'F';
    life.stats.kids.push({ sex, bornAt: newAge });
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
  if (life.country === 'IND' && life.name.caste === 'SC' && newAge >= 8 && newAge <= 16 && chance(0.08)) {
    events.push({ age: newAge, kind: 'social', icon: '⚠️', text: t('event.caste.disc') });
  }
  if ([5, 15, 30, 50, 70].includes(newAge) && !life.quotes[newAge]) {
    STATE.pendingDecision = { age: newAge, type: 'pause' };
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
  if (STATE.pendingDecision) return;
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
    if (STATE.life.age < 5) portrait.textContent = '👶';
    else if (STATE.life.age < 18) portrait.textContent = STATE.life.sex === 'M' ? '👦' : '👧';
    else if (STATE.life.age < 60) portrait.textContent = STATE.life.sex === 'M' ? '🧑' : '👩';
    else portrait.textContent = STATE.life.sex === 'M' ? '👴' : '👵';
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
  $('#endPortrait').textContent = portraitFor(life.age, life.sex);
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

function portraitFor(age, sex) {
  if (age < 5) return '👶🏻';
  if (age < 18) return sex === 'M' ? '👦' : '👧';
  if (age < 60) return sex === 'M' ? '🧑' : '👩';
  return sex === 'M' ? '👴' : '👵';
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

function renderSpeedBtns() {
  $$('.speed-btn').forEach(b => { b.classList.toggle('active', +b.dataset.speed === STATE.speed); });
}
function updateLangSwitcher() { const sel = $('#langSwitcher'); if (sel) sel.value = LANG; }

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
}

async function init() {
  await loadData();
  document.documentElement.lang = LANG;
  wire();
  renderAll();
}
init();
