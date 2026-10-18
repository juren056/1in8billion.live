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
  era: 'now',          // 'now' | 'past' | 'future'
  birthMode: 'baby',   // 'baby' | 'all' (此刻出生 vs 80億人活口)
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
  // 語言偏好
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
  // mode: 'baby' 依嬰兒出生人口權重；'all' 依現存人口權重
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
  // q[0..4] 為嬰兒/幼兒段；q[5..110] 為 Gompertz
  const q = new Float64Array(111);
  q[0] = q0;
  for (let i = 1; i <= 4; i++) q[i] = qc[i - 1];
  for (let x = 5; x <= 110; x++) {
    if (x === 110) { q[x] = 1; continue; }
    q[x] = Math.min(1, 1 - Math.exp(-(A + Math.exp(g * (x + 0.5)) * 0.001)));
  }
  // 找 B 讓生命期望 = e0
  let lo = Math.log(1e-9), hi = Math.log(5e-2), r = 0.5;
  for (let i = 0; i < 50; i++) {
    const m = (lo + hi) / 2;
    const B = Math.exp(m);
    // 計算生命期望
    let l = 1, e = 0;
    for (let x = 0; x <= 110; x++) {
      const qx = (x < 5) ? q[x] : Math.min(1, 1 - Math.exp(-(A + B * Math.exp(g * (x + 0.5)))));
      const d = l * qx;
      e += x === 0 ? l - 0.85 * d : l - 0.5 * d;
      l -= d;
    }
    if (e > e0) lo = m; else hi = m;
    r = B;
  }
  // 用最終的 r 重新算
  const qf = new Float64Array(111);
  qf[0] = q0;
  for (let i = 1; i <= 4; i++) qf[i] = qc[i - 1];
  for (let x = 5; x <= 110; x++) {
    if (x === 110) { qf[x] = 1; continue; }
    qf[x] = Math.min(1, 1 - Math.exp(-(A + r * Math.exp(g * (x + 0.5)))));
  }
  // 累計存活率
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

// ==== 死因分布 ====
const CAUSE_BASE = {
  // 嬰兒
  infant:  { '周產期問題':50, '先天異常':20, '感染性疾病':15, '嬰兒猝死':5, '事故':5, '其他':5 },
  // 兒童 1-4
  child:    { '感染性疾病':35, '事故':25, '先天異常':15, '營養不良':10, '溺水':8, '其他':7 },
  // 兒童 5-14
  young:    { '事故':30, '感染性疾病':25, '癌症':12, '溺水':10, '自殺':6, '他殺':5, '其他':12 },
  // 青年 15-29
  young_a:  { '事故':28, '自殺':20, '他殺':15, '癌症':10, '感染性疾病':10, '其他':17 },
  // 中年 30-49
  middle:   { '癌症':22, '心血管':18, '自殺':14, '事故':10, '感染性疾病':10, '他殺':6, '其他':20 },
  // 中老年 50-69
  older:    { '癌症':30, '心血管':25, '呼吸系統':8, '糖尿病':8, '自殺':5, '事故':5, '其他':19 },
  // 老年 70+
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
  // 國家加成
  if (c.hom > 5 && w['他殺']) w['他殺'] *= c.hom / 5;
  else if (w['他殺'] && c.hom < 1) w['他殺'] *= 0.5;
  if (c.road > 15 && w['事故']) w['事故'] *= c.road / 15;
  if (c.hiv > 1 && w['感染性疾病']) w['感染性疾病'] *= c.hiv / 0.5;
  if (c.sm > 30 && w['癌症']) w['癌症'] *= c.sm / 25;
  if (c.sm > 30 && w['心血管']) w['心血管'] *= 1.2;
  if (c.war > 0.1 && (age < 50)) {
    w['戰爭/衝突'] = c.war * 5;
  }
  if (c.mal > 0.5) {
    w['瘧疾'] = (w['感染性疾病'] || 0) * c.mal * 2;
  }
  // 性別調整
  if (sex === 'F') {
    if (w['他殺'] && age >= 15 && age < 30) w['他殺'] *= 0.3;
    if (w['他殺'] && age >= 30 && age < 50) w['他殺'] *= 0.5;
    if (w['事故'] && age >= 15 && age < 50) w['事故'] *= 0.5;
  }
  // 個人條件
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

// ==== 隨機抽樣 ====
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const wpick = (obj) => {
  const keys = Object.keys(obj);
  const total = keys.reduce((s, k) => s + obj[k], 0);
  let r = Math.random() * total;
  for (const k of keys) {
    r -= obj[k];
    if (r <= 0) return k;
  }
  return keys[0];
};
const rand = (a, b) => a + Math.random() * (b - a);
const irand = (a, b) => Math.floor(rand(a, b + 1));
const chance = p => Math.random() < p;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ==== 名字 ====
const FIRST_NAMES_ZH = {
  M: ['志明','俊宏','家豪','建宏','俊傑','浩宇','承恩','柏翰','冠廷','彥廷','俊佑','俊廷','柏宇','宥廷','禹辰','建宇','俊宇','子軒','睿恩','嘉佑','家明','俊宏','志強','志偉','志豪','志遠','家豪','家銘','家祥','家瑞','國華','建國','建華','建民','建志','志強','志明','志偉','志豪','志遠','俊傑','俊宏','俊豪','俊宇','家豪','家銘','家祥','家瑞','家豪','家豪','家豪'],
  F: ['雅婷','怡君','佳穎','怡萱','雅雯','心怡','筱涵','筱萍','雅琪','雅文','郁婷','思妤','雅筑','宜君','詩涵','雅晴','宜臻','雅芳','婉婷','佳蓉','家瑜','家琪','雅琪','雅雯','怡君','佳穎','怡萱','雅雯','心怡','筱涵','筱萍','雅琪','雅文','郁婷','思妤','雅筑','宜君','詩涵','雅晴','宜臻','雅芳','婉婷','佳蓉','婉婷','佳蓉','家瑜','家琪','雅琪','雅雯','美華','美玲','美君','美玉','美麗','淑芬','淑君','淑玲','玉嬌','秀蘭','秀英','秀梅','秀珍','秀珠','秀鳳','麗華','麗君','麗玲','麗娟','麗美','麗珍','麗珠','麗鳳','麗雲','麗霞','麗秋','麗月','麗雪','麗冰','麗卿','麗珊','麗貞','麗蓉','麗蓮','麗萍','麗燕','麗虹','麗鳳','麗鸞','麗雁','麗燕','麗鸞']
};
const FIRST_NAMES_EN = {
  M: ['Wei','Hao','Junjie','Jianhong','Chen','Yu','Haochen','Bohan','Yanting','Yanting','Junjie','Yuchen','Jiayu','Bowen','Yuchen','Junhao','Zixuan','Rui','Jiayou','Minghao','David','James','Michael','John','Robert','William','Daniel','Matthew','Anthony','Mark','Steven','Paul','Andrew','Kenneth','George','Joshua','Kevin','Brian','Edward','Ronald','Timothy','Jason','Jeffrey','Ryan','Jacob','Gary','Nicholas','Eric','Jonathan','Stephen','Larry','Justin','Scott','Brandon','Benjamin','Samuel','Gregory','Alexander','Frank','Patrick','Raymond','Jack','Dennis','Jerry','Tyler','Aaron','Jose','Adam','Nathan','Henry','Douglas','Zachary','Peter','Kyle','Walter','Ethan','Jeremy','Harold','Keith','Christian','Roger','Noah','Gerald','Carl','Terry','Sean','Austin','Arthur','Lawrence','Jesse','Dylan','Bryan','Joe','Jordan','Billy','Bruce','Albert','Willie','Jordan','Dylan','Bryan','Joe','Alan','Ralph','Gabriel','Carl','Howard','Logan','Sean','Juan','Jack','Dean','Felix','Bruce','Peter','Patrick','Harold','Douglas','Jerry','Keith','Roger','Gerald','Carl','Terry','Arthur','Lawrence','Jesse','Christian','Sean','Austin','Noah','Bryan','Billy','Bruce','Albert','Willie','Gabriel','Alan','Ralph','Logan'],
  F: ['Mei','Hua','Lin','Fang','Yan','Ling','Min','Jing','Xia','Xiu','Lan','Ying','Mei','Fang','Yan','Jing','Lili','Min','Jing','Fang','Mei','Lan','Ying','Hua','Lily','Emma','Olivia','Ava','Sophia','Isabella','Mia','Charlotte','Amelia','Harper','Evelyn','Abigail','Emily','Ella','Elizabeth','Camila','Luna','Sofia','Avery','Mila','Aria','Scarlett','Penelope','Layla','Chloe','Victoria','Madison','Eleanor','Grace','Zoe','Nora','Riley','Zoey','Hannah','Hazel','Lily','Ellie','Violet','Aurora','Savannah','Audrey','Brooklyn','Bella','Claire','Skylar','Lucy','Paisley','Everly','Anna','Caroline','Nova','Genesis','Emilia','Kennedy','Samantha','Maya','Willow','Kinsley','Naomi','Aaliyah','Elena','Sarah','Ariana','Allison','Gabriella','Alice','Madelyn','Cora','Ruby','Eva','Serenity','Autumn','Adeline','Hailey','Gianna','Valentina','Isla','Eliana','Quinn','Nevaeh','Ivy','Sadie','Lydia','Piper','Lyla','Maya','Hailey']
};
const LAST_NAMES_ZH = ['張','王','李','陳','林','黃','吳','劉','蔡','楊','許','鄭','謝','洪','郭','邱','曾','廖','賴','徐','周','葉','蘇','莊','呂','江','何','羅','高','蕭','朱','羅','董','余','沈','許','韓','曹','許','鄧','曹','彭','曾','田','丁','杜','傅','范','方','鄒'];
const LAST_NAMES_EN = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Gomez','Phillips','Evans','Turner','Diaz','Parker','Cruz','Edwards','Collins','Reyes','Stewart','Morris','Morales','Murphy','Cook','Rogers','Gutierrez','Ortiz','Morgan','Cooper','Peterson','Bailey','Reed','Kelly','Howard','Ramos','Kim','Cox','Ward','Richardson','Watson','Brooks','Chavez','Wood','James','Bennett','Gray','Mendoza','Ruiz','Hughes','Price','Alvarez','Castillo','Sanders','Patel','Myers','Long','Ross','Foster','Jimenez'];
const FIRST_NAMES_INDIA = {
  M: ['Aarav','Vihaan','Aditya','Arjun','Rohit','Karan','Rahul','Amit','Vikram','Raj','Arun','Suresh','Mohan','Krishna','Ravi','Sanjay','Anil','Manish','Deepak','Pradeep','Rakesh','Sunil','Vinod','Ashok','Rajesh','Ajay','Naveen','Manoj','Dinesh','Pankaj','Sandeep','Mukesh','Anand','Sandeep','Rakesh','Prakash','Mukesh','Vivek','Vikas'],
  F: ['Aadhya','Saanvi','Ananya','Aaradhya','Diya','Pari','Anika','Navya','Myra','Ira','Aarohi','Anvi','Misha','Anaya','Pihu','Riya','Aaradhya','Ananya','Saanvi','Diya','Aadhya','Pari','Navya','Myra','Aarohi','Anvi','Misha','Pihu','Riya','Anaya','Saanvi','Diya','Aadhya','Pari','Navya','Myra','Aarohi','Anvi','Misha','Pihu','Riya','Anaya']
};
const LAST_NAMES_INDIA = {
  SC: ['Kumar','Ram','Lal','Das','Paswan','Choudhary','Valmiki','Korwa','Mochi','Dusadh','Pasi','Khatik','Dhobi','Nai','Kahar','Turi','Bhai','Gandhi','Mallah','Mochi','Dushadh','Mushahar','Rajbhar','Bind','Chamar','Dhanuk','Dobi','Dom','Ghasiya','Goswami','Harijan','Kori','Musahar','Ravidas','Sarang','Singh','Bauri','Daiya','Ghasia','Mahar','Mehtar','Meth','Rawat','Sapera','Saran','Saunta','Bhanwar','Bhanwaria','Bhangi','Bhil','Bhotia','Bhuiya','Boria','Charan','Gadia','Gadaria','Gandhila','Garia','Garoda','Gauda','Gawala','Ghasia','Ghogha','Ghisar','Gola','Gond','Goriya','Gosa','Gulam','Gurjar','Hajam','Halwai','Heliya','Jadugar','Jagal','Jaiswal','Jogi','Kalal','Kalwar','Kamathi','Kandara','Kandra','Kanjar','Kansar','Kansera','Kanth','Kanyal','Karadi','Kareem','Karigar','Karnam','Kashmiri','Kasumbi','Katiyar','Kavadi','Kavutia','Kayasth','Keelara','Keral','Kerkar','Kewat','Khadera','Khagi','Khaimar','Khaiyar','Khajanchi','Khalasi','Khalpa','Khamar','Khan'],
  ST: ['Meena','Munda','Ho','Oraon','Santhal','Bedia','Bhil','Korku','Gond','Kharia','Baiga','Marias','Gadabas','Chenchu','Thoti','Sabaria','Parahiya','Lodha','Birhor','Paharia','Asur','Birjia','Bhotda','Chakma','Gadaba','Gond','Gorait','Halba','Ho','Jatapu','Kamar','Karku','Katkari','Kawar','Khairwar','Kharia','Kharwar','Kol','Kolam','Korku','Koya','Kudubi','Maria','Munda','Nagesia','Nayak','Oraon','Paik','Pardhan','Parengi','Santhal','Saora','Sauka','Savara','Shabar','Toda','Tripuri','Warli'],
  obc: ['Yadav','Kurmi','Patel','Jat','Reddy','Nayak','Gujjar','Kamboj','Rathore','Saini','Khatri','Kayastha','Brahmin','Thakur','Rathod','Mali','Teli','Kumhar','Lohar','Mocha','Nai','Sonar','Bania','Vaishya','Agrawal','Maheshwari','Khandelwal','Mittal','Garg','Jindal','Jain','Porwal','Kasat','Kalani','Bagrecha','Chhajed','Bothra','Singhal','Rathi','Bagaria','Lakhotia','Mundhra','Mangal','Kabra','Bansal','Goyal','Tibrewala','Dang','Hissaria','Bhut','Bhutra','Kothari','Karwa','Kala','Bagla','Asawa','Bagri','Choudhary','Halwai','Modi','Bhoot','Oswal','Kankariya','Porwal','Kansal','Mandhana','Bhandari','Kabra','Jalan','Bajoria','Bhuwalka','Mimani','Bumb','Bhand'],
  jana: ['Thapa','Tamang','Lama','Sherpa','Magar','Gurung','Rai','Limbu','Newar','Yadav','Mahato','Kami','Damai','Sarki','Chhetri','Bhatta','Bohara','Chauhan','Maharjan','Manandhar','Maharjan','Shrestha','Bajracharya','Pradhan','Karmacharya','Tamrakar','Manandhar','Joshi','Regmi','Bohara','Bist','Khatri','Khadka','Rana','Thapa','Bohara','Bist','Khatri','Khadka','Rana','Thapa','Mahato','Tharu','Rajbhar','Mahara','Kurmi','Yadav','Patel','Jat','Reddy','Nayak','Gujjar','Kamboj','Rathore','Saini','Khatri','Kayastha','Brahmin','Thakur','Rathod'],
  madh: ['Yadav','Kurmi','Patel','Jat','Reddy','Nayak','Gujjar','Kamboj','Rathore','Saini','Khatri','Kayastha','Brahmin','Thakur','Rathod','Mali','Teli','Kumhar','Lohar','Mocha','Nai','Sonar','Bania','Vaishya','Agrawal','Maheshwari','Khandelwal','Mittal','Garg','Jindal','Jain','Porwal','Kasat','Kalani','Bagrecha','Chhajed','Bothra','Singhal','Rathi','Bagaria','Lakhotia','Mundhra','Mangal','Kabra','Bansal','Goyal','Tibrewala','Dang','Hissaria','Bhut','Bhutra','Kothari','Karwa','Kala','Bagla','Asawa','Bagri','Choudhary','Halwai','Modi','Bhoot','Oswal','Kankariya','Porwal','Kansal','Mandhana','Bhandari','Kabra','Jalan','Bajoria','Bhuwalka','Mimani','Bumb','Bhand'],
  '': ['Patel','Kumar','Singh','Shah','Sharma','Gupta','Verma','Yadav','Jain','Bansal','Garg','Mittal','Khatri','Kapoor','Mehta','Choudhary','Soni','Patwa','Sharma','Joshi','Bhatt','Pandey','Tiwari','Dubey','Mishra','Saxena','Srivastava','Trivedi','Chaturvedi','Dwivedi','Upadhyay','Pathak','Pandey','Mishra','Saxena','Srivastava','Trivedi','Chaturvedi','Dwivedi','Upadhyay','Pathak']
};

function randomName(country, sex) {
  const lang = country.lang || '';
  if (country.id === 'TWN' || country.id === 'HKG' || country.region === 'eap' && lang === 'zh') {
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
  if (country.id === 'JPN' || country.id === 'KOR') {
    const last = sex === 'F' ? (chance(0.3) ? '김' : '이') : (chance(0.3) ? '박' : '최');
    const first = sex === 'F' ? '영' + pick(['희','은','아','수']) : '준' + pick(['호','혁','영','수']);
    return { last, first, full: last + first, full_en: pick(LAST_NAMES_EN) + ' ' + pick(FIRST_NAMES_EN[sex] || FIRST_NAMES_EN.M) };
  }
  // 預設英文
  const last = pick(LAST_NAMES_EN);
  const first = pick(FIRST_NAMES_EN[sex] || FIRST_NAMES_EN.M);
  return { last, first, full: last + ' ' + first, full_en: last + ' ' + first };
}
function pickIndianCaste() {
  // SC 18%, ST 9%, OBC 44%, General 29% (近似 2024 估算)
  const r = Math.random();
  if (r < 0.18) return 'SC';
  if (r < 0.27) return 'ST';
  if (r < 0.71) return 'obc';
  return '';
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
    // 個人條件
    smoker: chance(c.sm / 100 * 0.5),
    conditions: {
      diabetes: chance(0.05 * (c.sm / 30)),
      heart: chance(0.03),
    },
    // 事件記錄
    log: [],
    quotes: {},
    // 統計
    stats: {
      education: 0,    // 0-4: 無/小/初中/高中/大學
      married: false,
      partner: null,
      kids: [],
      employment: 'none',
      health: 100,
      happiness: 70,
    },
    // 死亡
    died: false,
    cause: null,
    deathAge: null,
    // 族譜（出生時即生成雙親 + 1-2 位手足）
    family: generateFamily(countryCode, sex),
  };
}

/* ==== 族譜：家族生成 ==== */
function generateFamily(countryCode, selfSex, fc) {
  const c = countryById(countryCode);
  if (!c) return { parents: [], siblings: [], grandparents: [], partner: null, kids: [] };
  const baseYear = (STATE.era === 'past' ? 1990 : STATE.era === 'future' ? 2080 : 2024);
  const war = c.war || 0;
  // 戰區孤兒機率：war 高 → 雙親存在率低
  const parentChance = Math.max(0.35, 1 - war * 0.4);
  const haveFather = Math.random() < parentChance;
  const haveMother = Math.random() < parentChance;
  // 寄養/收養：換父母
  let parentCountry = countryCode, parentCountryData = c;
  let parentNote = null;
  if (fc && fc.type === 'adopt') {
    // 從隨機另一個國家收養
    const adopters = ['USA','CAN','GBR','FRA','DEU','AUS','SWE','NOR'];
    const fcode = adopters[Math.floor(Math.random() * adopters.length)];
    parentCountry = fcode;
    parentCountryData = countryById(fcode) || c;
    parentNote = 'adoptive';
  } else if (fc && fc.type === 'foster') {
    parentNote = 'foster';
  }
  const fatherName = haveFather ? randomName(parentCountryData, 'M') : null;
  const motherName = haveMother ? randomName(parentCountryData, 'F') : null;
  const father = haveFather ? {
    id: 'f_' + Math.random().toString(36).slice(2,8),
    name: fatherName.full || fatherName.full_en || '?',
    sex: 'M', country: parentCountry, countryData: parentCountryData,
    note: parentNote,
    birth: { year: baseYear - 30 },
    death: parentNote ? null : { year: baseYear - 30 + (parentNote === 'foster' ? 50 : 70) }
  } : null;
  const mother = haveMother ? {
    id: 'm_' + Math.random().toString(36).slice(2,8),
    name: motherName.full || motherName.full_en || '?',
    sex: 'F', country: parentCountry, countryData: parentCountryData,
    note: parentNote,
    birth: { year: (father?.birth?.year || baseYear-30) + (Math.random() < 0.5 ? -2 : 3) },
    death: parentNote ? null : { year: (father?.birth?.year || baseYear-30) + 75 }
  } : null;
  const parents = [father, mother].filter(Boolean);
  // 手足數：戰區小孩通常更少
  let nSib = 0;
  const sibR = Math.random();
  if (war > 0.5) nSib = sibR < 0.4 ? 0 : sibR < 0.75 ? 1 : 2;
  else nSib = sibR < 0.3 ? 0 : sibR < 0.6 ? 1 : sibR < 0.85 ? 2 : 3;
  const siblings = [];
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
  // 祖父母：有父母才合理；戰區祖父母多半死亡
  const grandparents = [];
  const gpChance = parentNote ? 0.5 : Math.max(0.2, 0.7 - war * 0.3);
  if (father && Math.random() < gpChance) {
    const gf = randomName(parentCountryData, 'M');
    grandparents.push({ id:'gf_'+Math.random().toString(36).slice(2,8), name: gf.full||gf.full_en||'?', sex:'M', country: parentCountry, countryData: parentCountryData, note: parentNote, birth:{year: father.birth.year - 28}, death:{year: father.birth.year + 35} });
  }
  if (mother && Math.random() < gpChance) {
    const gm = randomName(parentCountryData, 'F');
    grandparents.push({ id:'gm_'+Math.random().toString(36).slice(2,8), name: gm.full||gm.full_en||'?', sex:'F', country: parentCountry, countryData: parentCountryData, note: parentNote, birth:{year: mother.birth.year - 26}, death:{year: mother.birth.year + 38} });
  }
  return { parents, siblings, grandparents, partner: null, kids: [], fosterCare: fc?.type || null, adoptedFrom: fc?.type === 'adopt' ? countryCode : null };
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
    if (life.family) {
      life.family.partner = {
        id: 'p_' + Math.random().toString(36).slice(2,8),
        name: partnerName.full || partnerName.full_en || '?',
        nameEn: partnerName.full_en,
        sex: life.sex === 'M' ? 'F' : 'M',
        country: life.country,
        countryData: life.countryData,
        marriageAge: newAge,
        birth: { year: (life.year + life.yearOffset - life.age) - (newAge - Math.floor(Math.random()*5)) }
      };
    }
    events.push({ age: newAge, kind: 'milestone', icon: '💍', text: t('event.marriage', partnerName.full || partnerName.full_en || '') });
  }
  if (life.stats.married && life.stats.kids.length < 3 && newAge >= 25 && newAge <= 45 && chance(0.12)) {
    const sex = Math.random() < 0.5 ? 'M' : 'F';
    const child = { sex, bornAt: newAge };
    life.stats.kids.push(child);
    events.push({ age: newAge, kind: 'milestone', icon: '👶', text: t('event.baby', life.stats.kids.length) });
  }
  if (newAge === 60 && life.stats.employment !== 'none') {
    life.stats.employment = 'retired';
    events.push({ age: 60, kind: 'milestone', icon: '🏖️', text: t('event.retirement') });
  }
  // 偶發事件
  if (newAge >= 18 && newAge <= 65 && chance(0.04)) {
    const cond = pick(['cancer', 'heart', 'stroke', 'diabetes']);
    life.conditions[cond === 'cancer' ? 'cancer' : cond === 'heart' ? 'heart' : cond === 'stroke' ? 'heart' : 'diabetes'] = true;
    events.push({ age: newAge, kind: 'illness', icon: '💊', text: t('event.illness.' + cond) });
  }
  if (newAge >= 12 && newAge <= 25 && chance(0.02)) {
    events.push({ age: newAge, kind: 'social', icon: '🎓', text: t('event.event.school.exam') });
  }
  // 印度種姓相關
  if (life.country === 'IND' && life.name.caste === 'SC' && newAge >= 8 && newAge <= 16 && chance(0.08)) {
    events.push({ age: newAge, kind: 'social', icon: '⚠️', text: t('event.caste.disc') });
  }
  // 紐澳原住民加成
  if ((life.country === 'NZL' || life.country === 'AUS') && newAge === 18 && chance(0.5)) {
    events.push({ age: newAge, kind: 'social', icon: '🌿', text: LANG === 'en' ? 'You identify as indigenous; get education & health support.' : '你被認定為原住民後裔，獲得教育補助與健康資源。' });
  }
  // 戰爭/衝突
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
  // 寄養（美/英/紐/澳/韓/日）
  if (['USA','GBR','NZL','AUS','KOR','JPN'].includes(life.country) && newAge === 0) {
    if (chance(0.04)) {
      life.fc = { in: 1, system: 'state', type: 'foster' };
      life.family = generateFamily(life.country, life.sex, { type: 'foster' });
      events.push({ age: 0, kind: 'heavy', icon: '🏠', text: LANG === 'en' ? 'You enter foster care due to family circumstances.' : '出生後因家庭變故，被送進寄養系統，由寄養父母撫養。' });
    }
  }
  // 國際收養（韓/中/越/柬/泰/印）
  if (['KOR','CHN','VNM','KHM','THA','IND'].includes(life.country) && newAge === 0 && chance(0.005)) {
    life.fc = { in: 1, system: 'international', type: 'adopt' };
    life.family = generateFamily(life.country, life.sex, { type: 'adopt' });
    events.push({ age: 0, kind: 'social', icon: '🌍', text: LANG === 'en' ? 'You are adopted by a foreign family and grow up in another country.' : '你被一對外國夫婦收養，離開出生地到另一個國家長大。' });
  }
  if (life.country === 'IND' && life.name.caste === 'SC' && newAge >= 18 && chance(0.05)) {
    events.push({ age: newAge, kind: 'social', icon: '📋', text: t('event.caste.form') });
  }
  // 5/15/30/50/70 暫停問題
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
  stopTicker();
  startTicker();
  renderSpeedBtns();
}
function tick() {
  if (!STATE.life || STATE.life.died || STATE.paused) return;
  if (STATE.pendingDecision) return; // 暫停等決策
  STATE.life.age += 1;
  STATE.life.yearOffset += 1;
  const c = STATE.life.countryData;
  const sex = STATE.life.sex;
  // 死亡判定
  if (Math.random() < pDie(STATE.life.age, c, sex)) {
    dieNow();
    return;
  }
  // 事件
  const events = milestoneEvents(STATE.life, STATE.life.age);
  for (const e of events) {
    STATE.life.log.push(e);
    if (e.kind === 'birth' || e.kind === 'milestone') {
      logLife(e.text);
    }
  }
  renderLife();
  // 達到當地平均壽命 1.3x 自動死亡
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
  row.textContent = text;
  el.appendChild(row);
  el.scrollTop = el.scrollHeight;
}

// ==== 過去生命 ====
function savePastLife(life) {
  try {
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY + ':past') || '[]');
    const rec = {
      ts: Date.now(),
      country: life.country,
      name: life.name.full || life.name.full_en || '',
      age: life.deathAge || life.age,
      cause: life.cause,
    };
    arr.unshift(rec);
    localStorage.setItem(STORAGE_KEY + ':past', JSON.stringify(arr.slice(0, 50)));
  } catch (e) {}
}
function loadPastLives() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY + ':past') || '[]');
  } catch (e) { return []; }
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
  // 通用翻譯
  $$('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
  $$('[data-t-html]').forEach(el => { el.innerHTML = t(el.dataset.tHtml); });
  // 視圖
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
  // 國家預設
  if (!STATE.selectedCountry) {
    // 預設第一個
    STATE.selectedCountry = 'TWN';
  }
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
  // 進度條
  const pct = Math.min(100, STATE.life.age / c.le * 100);
  $('#lifeBar').style.width = pct + '%';
  // 角色簡介
  const portrait = $('#lifePortrait');
  if (portrait) {
    portrait.className = 'cert-figure';
    portrait.innerHTML = pixelPortraitSVG(STATE.life.countryData, STATE.life.age, STATE.life.sex);
  }
  // 國家資料
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
  // 證書（guilloche）
  const cert = $('#certCanvas');
  if (cert) {
    cert.innerHTML = drawGuilloche(680, 420);
  }
}

function drawGuilloche(w, h) {
  // 簡化 guilloche：多個同心橢圓 + 文字水印
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

// 依國家 + 年齡 + 性別生成 SVG 像素頭像
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
  if (country?.flag) {
    parts.push(`<text x="10" y="${H-10}" font-size="14">${country.flag}</text>`);
  }
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
  // 跑 N 條人生，收集統計
  const deaths = []; // age of death
  const causes = {}; // cause -> count
  const country = countryById(countryCode);
  if (!country) return null;
  const adjustEra = { past: 1990, future: 2080, any: 2024, now: 2024 }[era] || 2024;
  for (let i = 0; i < N; i++) {
    const sex = sexMode === 'random' ? (Math.random() < 0.5 ? 'M' : 'F') : sexMode;
    const life = newLife(countryCode);
    life.sex = sex;
    life.year = adjustEra;
    life.yearOffset = 0;
    // 跑到死
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
  // 直方圖分箱
  const minA = Math.min(...deaths), maxA = Math.max(...deaths);
  const bins = {};
  const binSize = Math.max(1, Math.ceil((maxA - minA) / 20));
  for (let i = 0; i < N; i++) {
    const b = Math.floor(deaths[i] / binSize) * binSize;
    bins[b] = (bins[b] || 0) + 1;
  }
  const sortedBins = Object.keys(bins).map(Number).sort((a, b) => a - b);
  const maxCount = Math.max(...Object.values(bins));
  // 死因排序
  const sortedCauses = Object.entries(causes).sort((a, b) => b[1] - a[1]);
  // 格式化
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

// ==== 事件 ====
function wire() {
  // 導覽
  $$('.navbtn').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  // 語言
  const ls = $('#langSwitcher');
  if (ls) ls.addEventListener('change', e => setLang(e.target.value));
  // 國家選擇
  const sel = $('#countrySelect');
  if (sel) sel.addEventListener('change', e => { STATE.selectedCountry = e.target.value; renderIntro(); });
  // 出生模式
  $$('[data-birth-mode]').forEach(b => b.addEventListener('click', () => {
    $$('[data-birth-mode]').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    STATE.birthMode = b.dataset.birthMode;
  }));
  // 年代
  $$('[data-era]').forEach(b => b.addEventListener('click', () => {
    $$('[data-era]').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    STATE.era = b.dataset.era;
  }));
  // 開始按鈕
  const start = $('#btnStart');
  if (start) start.addEventListener('click', () => {
    const c = chooseCountry(STATE.birthMode);
    if (c) startLife(c.id);
  });
  // 選特定國家開始
  const startSelected = $('#btnStartSelected');
  if (startSelected) startSelected.addEventListener('click', () => {
    if (STATE.selectedCountry) startLife(STATE.selectedCountry);
  });
  // 生命控制
  const pauseBtn = $('#btnPause');
  if (pauseBtn) pauseBtn.addEventListener('click', () => {
    STATE.paused = !STATE.paused;
    pauseBtn.textContent = STATE.paused ? '▶' : '⏸';
  });
  $$('.speed-btn').forEach(b => b.addEventListener('click', () => setSpeed(+b.dataset.speed)));
  // 死亡
  const dieBtn = $('#btnDieNow');
  if (dieBtn) dieBtn.addEventListener('click', () => { if (STATE.life && !STATE.life.died) dieNow('自行結束'); });
  // 結束畫面
  const restart = $('#btnRestart');
  if (restart) restart.addEventListener('click', () => setView('intro'));
  const newLife = $('#btnNewLife');
  if (newLife) newLife.addEventListener('click', () => {
    const c = chooseCountry(STATE.birthMode);
    if (c) startLife(c.id);
  });
  // esc 關閉
  document.addEventListener('keydown', e => {
    if (e.key === ' ') { if (STATE.view === 'life') $('#btnPause')?.click(); e.preventDefault(); }
  });
  // Lab
  const labRun = $('#labRun');
  if (labRun) labRun.addEventListener('click', () => {
    const code = $('#labCountry').value;
    const era = $('#labEra').value;
    const sex = $('#labSex').value;
    const N = +$('#labN').value;
    const result = runLab(code, era, sex, N);
    displayLabResults(result);
  });
  // Tree (族譜)
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
        const parsed = parseGEDCOM(text);
        if (!STATE.life) {
          toast(LANG === 'en' ? 'Start a life first, then import GEDCOM' : '請先開始一段人生，再匯入 GEDCOM');
          return;
        }
        // 把 GEDCOM 解析的「祖上」灌進 family，但保留 self / partner / kids 不變
        const f = STATE.life.family;
        f.parents = [];
        f.grandparents = [];
        f.siblings = [];
        // 找 self 的父母
        const selfParents = (parsed.families || []).filter(fam => fam.children && fam.children.includes('self')).map(fam => ({husb: fam.husb, wife: fam.wife}));
        const selfFamily = selfParents[0];
        if (selfFamily) {
          if (selfFamily.husb && parsed.indis[selfFamily.husb]) {
            const p = parsed.indis[selfFamily.husb];
            f.parents.push({ id: 'f_' + Math.random().toString(36).slice(2,8), name: p.name, sex: 'M', country: p.birthPlace || STATE.life.country, countryData: countryById(p.birthPlace) || STATE.life.countryData, birth: { year: p.birthYear }, death: p.deathYear ? { year: p.deathYear } : null });
          }
          if (selfFamily.wife && parsed.indis[selfFamily.wife]) {
            const p = parsed.indis[selfFamily.wife];
            f.parents.push({ id: 'm_' + Math.random().toString(36).slice(2,8), name: p.name, sex: 'F', country: p.birthPlace || STATE.life.country, countryData: countryById(p.birthPlace) || STATE.life.countryData, birth: { year: p.birthYear }, death: p.deathYear ? { year: p.deathYear } : null });
          }
        }
        // 祖父母：找父母的父母
        f.parents.forEach(par => {
          const parFam = (parsed.families || []).find(fam => fam.children && fam.children.includes(par.id));
          if (parFam) {
            if (parFam.husb && parsed.indis[parFam.husb]) {
              const gp = parsed.indis[parFam.husb];
              f.grandparents.push({ id: 'gf_'+Math.random().toString(36).slice(2,8), name: gp.name, sex: 'M', country: gp.birthPlace || par.country, countryData: countryById(gp.birthPlace) || par.countryData, birth:{year: gp.birthYear}, death: gp.deathYear ? { year: gp.deathYear } : null });
            }
            if (parFam.wife && parsed.indis[parFam.wife]) {
              const gp = parsed.indis[parFam.wife];
              f.grandparents.push({ id: 'gm_'+Math.random().toString(36).slice(2,8), name: gp.name, sex: 'F', country: gp.birthPlace || par.country, countryData: countryById(gp.birthPlace) || par.countryData, birth:{year: gp.birthYear}, death: gp.deathYear ? { year: gp.deathYear } : null });
            }
          }
        });
        TREE_STATE.rootId = 'self';
        renderTree();
        toast(t('io.imported', Object.keys(parsed.indis).length));
      } catch (err) {
        console.error(err);
        toast(LANG === 'en' ? 'GEDCOM parse failed: ' + err.message : 'GEDCOM 解析失敗：' + err.message);
      }
    };
    reader.readAsText(file);
  });
}

/* GEDCOM 5.5.1 簡化解析器
   支援：HEAD / INDI / FAM / TRLR；只讀 NAME / SEX / BIRT-DATE / DEAT-DATE / PLAC / HUSB / WIFE / CHIL */
function parseGEDCOM(text) {
  const lines = text.split(/\r?\n/);
  const indis = {};
  const families = [];
  let curIndi = null, curFam = null, curTag = null, curSub = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^(\d+)\s+(@[^@]+@)?\s*(\w*)(?:\s+(.*))?$/);
    if (!m) continue;
    const [, level, xref, tag, val] = m;
    const lv = +level;
    if (tag === 'INDI' && xref) {
      curIndi = { id: xref, name: '', sex: '', birthYear: null, deathYear: null, birthPlace: null };
      indis[xref] = curIndi;
      curFam = null;
    } else if (tag === 'FAM' && xref) {
      curFam = { id: xref, husb: null, wife: null, children: [] };
      families.push(curFam);
      curIndi = null;
    } else if (tag === 'TRLR') { break; }
    else if (curIndi && lv === 1) {
      if (tag === 'NAME') curIndi.name = (val || '').replace(/\//g, '').trim();
      else if (tag === 'SEX') curIndi.sex = val;
    } else if (curIndi && lv === 2) {
      if (curTag === 'BIRT' && tag === 'DATE') {
        const y = (val || '').match(/(\d{4})/);
        if (y) curIndi.birthYear = +y[1];
      } else if (curTag === 'DEAT' && tag === 'DATE') {
        const y = (val || '').match(/(\d{4})/);
        if (y) curIndi.deathYear = +y[1];
      } else if (tag === 'PLAC') {
        if (curSub === 'BIRT') curIndi.birthPlace = val;
      }
    } else if (curFam && lv === 1) {
      if (tag === 'HUSB') curFam.husb = val;
      else if (tag === 'WIFE') curFam.wife = val;
      else if (tag === 'CHIL') curFam.children.push(val);
    }
    if (lv === 1) { curTag = tag; curSub = null; }
    if (lv === 2) curSub = curTag;
  }
  return { indis, families };
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
  if (f.partner) people[f.partner.id] = f.partner;
  const edges = [];
  if (f.parents[0]) edges.push({ parentId: f.parents[0].id, childId: 'self', kind: 'parent' });
  if (f.parents[1]) edges.push({ parentId: f.parents[1].id, childId: 'self', kind: 'parent' });
  f.siblings.forEach(s => {
    if (f.parents[0]) edges.push({ parentId: f.parents[0].id, childId: s.id, kind: 'parent' });
    if (f.parents[1]) edges.push({ parentId: f.parents[1].id, childId: s.id, kind: 'parent' });
  });
  (f.grandparents||[]).forEach(gp => {
    const par = f.parents.find(p => p.sex === gp.sex && Math.abs((p.birth?.year||0) - (gp.birth?.year||0)) < 35);
    if (par) edges.push({ parentId: gp.id, childId: par.id, kind: 'parent' });
  });
  // 伴侶邊：spouse 不是父子關係，標 kind: spouse
  if (f.partner) edges.push({ parentId: 'self', childId: f.partner.id, kind: 'spouse' });
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
  // root 預設：self
  let rootId = TREE_STATE.rootId || 'self';
  if (!people[rootId]) rootId = 'self';
  TREE_STATE.rootId = rootId;
  // 同步選單
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
    // 語言切換後重畫 option 文字
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
  // 伴侶邊（水平虛線）— 在 self 同層右側
  const spouseEdges = edges.filter(e => e.kind === 'spouse');
  for (const e of spouseEdges) {
    const a = layout.nodes.find(n => n.id === e.parentId);
    const b = layout.nodes.find(n => n.id === e.childId);
    if (!a || !b) continue;
    const ax = marginX + a.xSlot * slotW + slotW - 12;
    const ay = marginY + a.gen * rowH + 40;
    const bx = marginX + b.xSlot * slotW;
    const by = marginY + b.gen * rowH + 40;
    svgEl('line', { x1: ax, y1: ay, x2: bx, y2: by, stroke: '#0F6E68', 'stroke-width': 2, 'stroke-dasharray': '6 4' }, svg);
    svgEl('circle', { cx: (ax+bx)/2, cy: (ay+by)/2, r: 4, fill: '#0F6E68' }, svg);
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
  // 點擊開 detail panel
  g.style.cursor = 'pointer';
  g.addEventListener('click', () => {
    TREE_STATE.selectedId = p.id;
    showPersonDetail(p);
  });
  // head
  const portrait = svgEl('svg', { x: 6, y: 4, width: 56, height: 70, viewBox: '0 0 200 200' }, g);
  portrait.innerHTML = pixelPortraitSVG(p.countryData, computeAge(p), p.sex).match(/<svg[^>]*>(.*)<\/svg>/)?.[1] || '';
  // name
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
  if (p.note === 'adoptive') {
    const m = svgEl('text', { x: w - 14, y: h - 4, 'font-size': 11, fill: '#0F6E68', 'text-anchor': 'end' }, g);
    m.textContent = '🧩';
  } else if (p.note === 'foster') {
    const m = svgEl('text', { x: w - 14, y: h - 4, 'font-size': 11, fill: '#8C1D3C', 'text-anchor': 'end' }, g);
    m.textContent = '🏠';
  }
}

/* ==== 生命交叉事件計算 ==== */
function computeCrossLifeEvents(p) {
  if (!STATE.life || p.id === 'self') return [];
  const self = STATE.life;
  const events = [];
  const selfBirthYear = self.year + self.yearOffset - self.age;
  const selfAgeAt = (year) => Math.max(0, year - selfBirthYear);
  // 他出生時我幾歲
  if (p.birth?.year) {
    const myAge = selfAgeAt(p.birth.year);
    const sexTerm = LANG === 'en' ? (p.sex === 'M' ? 'your brother/brother-in-law' : 'your sister/sister-in-law')
                  : (p.sex === 'M' ? '兄弟/手足' : '姊妹/手足');
    events.push({
      icon: '👶',
      text: LANG === 'en' ? `${p.name} was born when you were ${myAge}.` : `${p.name}出生時，你 ${myAge} 歲。`
    });
  }
  // 他去世時我幾歲
  if (p.death?.year) {
    const myAge = selfAgeAt(p.death.year);
    if (myAge >= 0 && myAge <= self.age) {
      events.push({
        icon: '🕯️',
        text: LANG === 'en' ? `${p.name} passed away when you were ${myAge}.` : `${p.name} 過世時，你 ${myAge} 歲。`,
        kind: 'heavy'
      });
    } else if (myAge > self.age) {
      events.push({
        icon: '🕯️',
        text: LANG === 'en' ? `${p.name} would have been ${p.death.year - selfBirthYear} years older than you.` : `${p.name} 將在你 ${myAge} 歲時離世（在你身後）。`,
        kind: 'forecast'
      });
    }
  }
  // 他出生時自己幾歲（年齡差）
  if (p.birth?.year && selfBirthYear) {
    const diff = p.birth.year - selfBirthYear;
    if (diff > 0 && diff < 30 && p.id !== 'self') {
      const role = p.sex === 'M' ? (LANG === 'en' ? 'elder brother' : '兄長') : (LANG === 'en' ? 'elder sister' : '姊姊');
      events.push({
        icon: '👫',
        text: LANG === 'en' ? `${p.name} is ${diff} years older than you (${role}).` : `${p.name} 比你大 ${diff} 歲（${role}）。`
      });
    } else if (diff < 0 && diff > -30) {
      const role = p.sex === 'M' ? (LANG === 'en' ? 'younger brother' : '弟弟') : (LANG === 'en' ? 'younger sister' : '妹妹');
      events.push({
        icon: '👫',
        text: LANG === 'en' ? `${p.name} is ${-diff} years younger than you (${role}).` : `${p.name} 比你小 ${-diff} 歲（${role}）。`
      });
    }
  }
  return events;
}

function showPersonDetail(p) {
  let panel = $('#personDetail');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'personDetail';
    panel.className = 'person-detail';
    document.querySelector('.tree-canvas')?.parentNode.insertBefore(panel, document.querySelector('#treeCanvas').nextSibling);
  }
  const age = computeAge(p);
  const rel = relationLabel(p);
  const crossEvents = computeCrossLifeEvents(p);
  panel.innerHTML = `
    <div class="pd-head">
      <div class="pd-portrait">${pixelPortraitSVG(p.countryData, age, p.sex)}</div>
      <div class="pd-meta">
        <h3 class="pd-name">${escapeHtml(p.name || '?')} ${deceasedMark(p)}</h3>
        <div class="pd-relation"><span class="badge">${rel}</span> ${p.note === 'adoptive' ? `<span class="badge badge-adopt">🧩 ${t('tree.noteAdoptive')}</span>` : p.note === 'foster' ? `<span class="badge badge-foster">🏠 ${t('tree.noteFoster')}</span>` : ''}</div>
        <div class="pd-life">${p.birth?.year || '?'} – ${p.death?.year || t('legend.m')}</div>
        <div class="pd-country">${p.countryData?.flag || ''} ${p.country || ''}</div>
      </div>
      <button class="pd-close" onclick="document.getElementById('personDetail').remove()">×</button>
    </div>
    ${crossEvents.length ? `<div class="pd-cross"><h4>${t('person.cross')}</h4>${crossEvents.map(e => `<div class="pd-cross-row kind-${e.kind||''}"><span class="pd-cross-icon">${e.icon}</span><span>${escapeHtml(e.text)}</span></div>`).join('')}</div>` : ''}
  `;
  // 高亮選中
  document.querySelectorAll('.tree-node').forEach(n => n.classList.remove('selected'));
  document.querySelectorAll('.tree-node').forEach(n => {
    if (n.querySelector('.node-name')?.textContent === (p.name || '?')) n.classList.add('selected');
  });
}

function relationLabel(p) {
  if (!STATE.life || !STATE.life.family) return '';
  const f = STATE.life.family;
  if (f.parents && f.parents.includes(p)) return t('relation.' + (p.sex === 'M' ? 'father' : 'mother'));
  if (f.siblings && f.siblings.includes(p)) {
    const diff = (p.birth?.year || 0) - (STATE.life.year + STATE.life.yearOffset - STATE.life.age);
    if (diff > 0) return t('relation.' + (p.sex === 'M' ? 'uncle' : 'aunt'));
    return t('relation.' + (p.sex === 'M' ? 'sibling' : 'sibling'));
  }
  if (f.grandparents && f.grandparents.includes(p)) return t('relation.' + (p.sex === 'M' ? 'grandfather' : 'grandmother'));
  if (f.partner === p) return t('relation.' + (p.sex === 'M' ? 'spouse' : 'spouse.f'));
  if (f.kids && f.kids.includes(p)) return t('relation.' + (p.sex === 'M' ? 'child' : 'child.f'));
  return '';
}

function deceasedMark(p) {
  return (p.death && p.death.year) ? '<span class="pd-deceased">†</span>' : '';
}

function escapeHtml(s) {
  return String(s || '').replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
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

/* ==== GEDCOM 5.5.1 簡易版（只匯出） ==== */
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
  // families
  let famI = 1;
  const famIds = [];
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
    famIds.push(fid);
    parents[childId].forEach(pid => lines.push(`1 ${parents[childId].indexOf(pid)===0?'HUSB':'WIFE'} ${idMap[pid]}`));
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
