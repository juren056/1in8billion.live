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
    if (life.family) {
      life.family.kids = life.family.kids || [];
      const childBirth = { year: (life.year + life.yearOffset) };
      const childNode = {
        id: 'k_' + Math.random().toString(36).slice(2,8),
        name: randomName(life.countryData, sex).full || randomName(life.countryData, sex).full_en || '?',
        sex, country: life.country, countryData: life.countryData,
        birth: childBirth,
        // 依 country.im 機率夭折（5 歲以下死亡率）
        death: chance((life.countryData.im || 5) / 1000 * 0.3) ? { year: childBirth.year + Math.floor(Math.random() * 5) } : null
      };
      life.family.kids.push(childNode);
      if (childNode.death) events.push({ age: newAge, kind: 'heavy', icon: '🕯️', text: LANG === 'en' ? `${childNode.name} died as an infant.` : `${childNode.name} 在嬰幼兒時期夭折了。` });
    }
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
    const oldCountry = life.country;
    const oldFlag = life.countryData?.flag || '';
    life.family = generateFamily(life.country, life.sex, { type: 'adopt' });
    // 遷徙：實際上 self 現在在收養國家
    const newCountry = life.family.parents[0]?.country || 'USA';
    const newCountryData = countryById(newCountry);
    const newFlag = newCountryData?.flag || '🏳️';
    life.country = newCountry;
    life.countryData = newCountryData;
    life.birthOrigin = { country: oldCountry, flag: oldFlag };  // 記錄出生國家
    events.push({ age: 0, kind: 'social', icon: '🌍', text: LANG === 'en' ? `You are adopted by a foreign family (${oldFlag} → ${newFlag}) and grow up in another country.` : `你被一對外國夫婦收養 ${oldFlag} → ${newFlag}，離開出生地到另一個國家長大。` });
    // 遷徙動畫 toast
    setTimeout(() => toast(`${oldFlag} → ${newFlag}  ${LANG==='en'?'Migration':'遷徙'}`), 200);
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
  // 家族摘要
  renderFamilySummary();
}

function renderFamilySummary() {
  const wrap = $('#certFamilyBody');
  const goBtn = $('#certFamilyGo');
  if (!wrap) return;
  if (!STATE.life || !STATE.life.family) { wrap.innerHTML = ''; return; }
  const f = STATE.life.family;
  const parts = [];
  // 父母
  const father = f.parents.find(p => p.sex === 'M');
  const mother = f.parents.find(p => p.sex === 'F');
  if (father && mother) parts.push(`👨 ${father.name} · 👩 ${mother.name}`);
  else if (father) parts.push(`👨 ${father.name}`);
  else if (mother) parts.push(`👩 ${mother.name}`);
  else parts.push(`<span class="fam-orphan">${LANG==='en'?'🕯️ Orphan':'🕯️ 孤兒'}</span>`);
  // 手足
  if (f.siblings && f.siblings.length) {
    const liveSib = f.siblings.filter(s => !s.death?.year);
    const deadSib = f.siblings.filter(s => s.death?.year);
    let sibText = `👫 ${f.siblings.length} ${LANG==='en'?'siblings':'手足'}`;
    if (liveSib.length < f.siblings.length) sibText += `（${liveSib.length} ${LANG==='en'?'alive':'存'}，${deadSib.length} †）`;
    parts.push(sibText);
  }
  // 祖父母
  if (f.grandparents && f.grandparents.length) {
    parts.push(`👴👵 ${f.grandparents.length} ${LANG==='en'?'grandparents':'祖父母'}`);
  }
  // 伴侶
  if (f.partner) parts.push(`💍 ${f.partner.name}`);
  // 子女
  if (f.kids && f.kids.length) {
    const deadKids = f.kids.filter(k => k.death?.year);
    let kidText = `👶 ${f.kids.length} ${LANG==='en'?'children':'子女'}`;
    if (deadKids.length) kidText += `（${deadKids.length} †）`;
    parts.push(kidText);
  }
  // 收養/寄養
  if (f.fosterCare === 'adopt') parts.push(`<span class="fam-flag">🧩 ${LANG==='en'?'Adopted':'收養家庭'}</span>`);
  else if (f.fosterCare === 'foster') parts.push(`<span class="fam-flag">🏠 ${LANG==='en'?'Foster':'寄養家庭'}</span>`);
  // 跨國遷徙
  if (STATE.life.birthOrigin) {
    parts.push(`<span class="fam-flag">${STATE.life.birthOrigin.flag}→${c.flag} ${LANG==='en'?'migrated':'遷徙'}</span>`);
  }
  wrap.innerHTML = parts.map(p => `<div class="fam-row">${p}</div>`).join('');
  if (goBtn) {
    goBtn.onclick = () => {
      document.querySelectorAll('.navbtn').forEach(b => { if (b.dataset.view === 'tree') b.click(); });
    };
  }
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
  // 頂部加「家族全景圖」按鈕
  if (lives.length > 1) {
    const btn = document.createElement('div');
    btn.className = 'shelf-panorama';
    btn.innerHTML = `<button class="primary" id="shelfPanoramaBtn">🌐 ${t('shelf.panorama') || '家族全景圖'}</button><p class="muted">${t('shelf.panoramaSub') || '合併 ' + lives.length + ' 段人生，找出共同親屬'}</p>`;
    shelf.appendChild(btn);
    btn.querySelector('#shelfPanoramaBtn').addEventListener('click', () => renderPanorama(lives));
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
          <div class="shelf-meta">${life.age} 歲 · ${flag}</div>
        </div>
      </div>
    `;
    book.title = `${life.name} · ${life.cause}`;
    book.addEventListener('click', () => showLifeModal(life));
    shelf.appendChild(book);
  }
}

function showLifeModal(life) {
  // 移除舊的
  document.querySelector('#lifeModal')?.remove();
  const c = countryById(life.country);
  const modal = document.createElement('div');
  modal.id = 'lifeModal';
  modal.className = 'life-modal';
  modal.innerHTML = `
    <div class="life-modal-card">
      <button class="lm-close" onclick="document.getElementById('lifeModal').remove()">×</button>
      <h2 class="lm-title">${c?.flag || ''} ${escapeHtml(life.name)}</h2>
      <div class="lm-meta">
        <span>${life.year || ''} → ${life.year + life.yearOffset || ''}</span>
        <span>·</span>
        <span>${life.age} ${t('unit.years')}</span>
        <span>·</span>
        <span>${escapeHtml(life.cause || '')}</span>
        ${life.family?.fosterCare ? `<span class="badge badge-foster">🏠 ${t('tree.noteFoster')}</span>` : ''}
        ${life.family?.adoptedFrom ? `<span class="badge badge-adopt">🧩 ${t('tree.noteAdoptive')}</span>` : ''}
      </div>
      <div id="lifeTree" class="life-tree"></div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  // 渲染該生命的 tree（如果 family 存在）
  if (life.family) {
    renderLifeTreeInto(life, $('#lifeTree'));
  }
}

function renderLifeTreeInto(life, container) {
  if (!container) return;
  const f = life.family;
  // 重建 people + edges（用該 life 為中心）
  const self = {
    id: 'self_life',
    name: life.name,
    sex: life.sex,
    country: life.country,
    countryData: countryById(life.country),
    birth: { year: life.year },
    death: life.died ? { year: life.year + life.yearOffset } : null
  };
  const people = { [self.id]: self };
  (f.parents || []).forEach(p => { people[p.id] = p; });
  (f.siblings || []).forEach(p => { people[p.id] = p; });
  (f.grandparents || []).forEach(p => { people[p.id] = p; });
  const edges = [];
  (f.parents || []).forEach((p, idx) => {
    if (idx === 0) edges.push({ parentId: p.id, childId: self.id });
    else if (idx === 1) edges.push({ parentId: p.id, childId: self.id });
  });
  (f.siblings || []).forEach(s => {
    f.parents.forEach(p => edges.push({ parentId: p.id, childId: s.id }));
  });
  (f.grandparents || []).forEach(gp => {
    const par = (f.parents || []).find(p => p.sex === gp.sex && Math.abs((p.birth?.year||0) - (gp.birth?.year||0)) < 35);
    if (par) edges.push({ parentId: gp.id, childId: par.id });
  });
  // 簡化版：只渲染祖上 1 層（父母 + 祖父母），避免 modal 太大
  renderMiniTree(container, self.id, 2, people, edges);
}

function renderMiniTree(container, rootId, maxGen, people, edges) {
  container.innerHTML = '';
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
  const slotW = 200, rowH = 110, marginX = 30, marginY = 30;
  const totalSlots = Math.pow(2, maxGen);
  const w = marginX * 2 + totalSlots * slotW;
  const h = marginY * 2 + (maxGen + 1) * rowH;
  const svg = svgEl('svg', { width: w, height: h, viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: 'xMidYMid meet', style:'max-width:100%;height:auto;' });
  for (const { from, to } of links) {
    const fn = nodes.find(n => n.xSlot === from.xSlot && n.gen === from.gen);
    const tn = nodes.find(n => n.xSlot === to.xSlot && n.gen === to.gen);
    if (!fn || !tn) continue;
    const fx = marginX + fn.xSlot * slotW + slotW/2;
    const fy = marginY + fn.gen * rowH + 40;
    const tx = marginX + tn.xSlot * slotW + slotW/2;
    const ty = marginY + tn.gen * rowH + 80;
    svgEl('path', { d: `M ${fx} ${fy} L ${fx} ${fy + (ty-fy)/2} L ${tx} ${fy + (ty-fy)/2} L ${tx} ${ty}`, class: 'tree-link' }, svg);
  }
  for (const n of nodes) {
    drawPersonNode(svg, people[n.id], marginX + n.xSlot * slotW, marginY + n.gen * rowH, slotW - 12, 70, n.id === rootId);
  }
  container.appendChild(svg);
}

function renderPanorama(lives) {
  // 合併多段人生的 family，找出共同祖先
  // 合併邏輯：同一個人以 name+birthYear+deathYear 為 key
  const allPeople = {};
  const allEdges = [];
  const selfNodes = [];
  function keyOf(p) {
    return `${p.name}|${p.birth?.year || '?'}|${p.death?.year || ''}|${p.sex || ''}|${p.country || ''}`;
  }
  const idMap = {};
  for (const life of lives) {
    if (!life.family) continue;
    const f = life.family;
    const selfId = 'self_' + Math.random().toString(36).slice(2,9);
    const selfNode = {
      id: selfId,
      name: life.name,
      sex: life.sex,
      country: life.country,
      countryData: countryById(life.country),
      birth: { year: life.year },
      death: life.died ? { year: life.year + life.yearOffset } : null,
      isSelf: true,
      lifeAge: life.age,
      lifeCause: life.cause
    };
    allPeople[selfId] = selfNode;
    selfNodes.push(selfNode);
    const upsertPerson = (p) => {
      const k = keyOf(p);
      if (idMap[k]) return idMap[k];
      const newId = 'p_' + Math.random().toString(36).slice(2,9);
      idMap[k] = newId;
      allPeople[newId] = { ...p, id: newId };
      return newId;
    };
    (f.parents || []).forEach(p => {
      const pid = upsertPerson(p);
      allEdges.push({ parentId: pid, childId: selfId });
    });
    (f.siblings || []).forEach(s => {
      const sid = upsertPerson(s);
      (f.parents || []).forEach(p => {
        const pid = upsertPerson(p);
        allEdges.push({ parentId: pid, childId: sid });
      });
    });
    (f.grandparents || []).forEach(gp => {
      const gpid = upsertPerson(gp);
      const par = (f.parents || []).find(p => p.sex === gp.sex && Math.abs((p.birth?.year||0) - (gp.birth?.year||0)) < 35);
      if (par) {
        const pid = upsertPerson(par);
        allEdges.push({ parentId: gpid, childId: pid });
      }
    });
  }
  const commonAncestors = findCommonAncestors(selfNodes, allEdges, allPeople);
  const modal = document.createElement('div');
  modal.id = 'lifeModal';
  modal.className = 'life-modal';
  modal.innerHTML = `
    <div class="life-modal-card life-modal-wide">
      <button class="lm-close" onclick="document.getElementById('lifeModal').remove()">×</button>
      <h2 class="lm-title">🌐 ${t('shelf.panorama') || '家族全景圖'}</h2>
      <p class="muted">${t('shelf.panoramaSub') || '合併 ' + lives.length + ' 段人生的族譜。共同祖先以紅框標示。'}</p>
      ${commonAncestors.length ? `<div class="panorama-common"><b>${t('shelf.commonAncestors') || '共同親屬'}：</b> ${commonAncestors.map(c => escapeHtml(c.name)).join('、')}</div>` : `<div class="panorama-common"><span class="muted">${t('shelf.noCommon') || '無共同親屬'}</span></div>`}
      <div id="lifeTree" class="life-tree"></div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  renderMiniTree($('#lifeTree'), selfNodes[0].id, 2, allPeople, allEdges);
  setTimeout(() => {
    document.querySelectorAll('#lifeTree .tree-node').forEach(n => {
      const name = n.querySelector('.node-name')?.textContent;
      if (commonAncestors.some(c => c.name === name)) {
        n.querySelector('.node-rect')?.setAttribute('stroke', '#a04040');
        n.querySelector('.node-rect')?.setAttribute('stroke-width', '3');
      }
    });
  }, 100);
}

function findCommonAncestors(selfNodes, edges, allPeople) {
  // 共同親屬：直接出現在 ≥2 個 self 的「家族清單」（parents + grandparents + siblings）
  // 注意：不要走 parent-of-parent 路徑，因為那會把 A 的祖父錯算成 B 的祖父（除非 B 也明確收錄）
  const counts = new Map();
  for (const self of selfNodes) {
    const ancestors = edges.filter(e => e.childId === self.id).map(e => e.parentId);
    ancestors.forEach(a => {
      if (!counts.has(a)) counts.set(a, new Set());
      counts.get(a).add(self.id);
    });
  }
  const common = [];
  counts.forEach((selves, pid) => {
    if (selves.size >= 2 && allPeople[pid] && !allPeople[pid].isSelf) {
      common.push({ id: pid, name: allPeople[pid].name, count: selves.size });
    }
  });
  return common;
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
  // 家族統計
  const famStats = runFamilyLab(countryCode, Math.min(N, 200));
  return { deaths, causes, avg, median, country, N, era: adjustEra, famStats };
}

/* ==== Lab 家族統計：批次產生 N 個家族，看孤兒率/手足數/收養率 ==== */
function runFamilyLab(countryCode, N) {
  const c = countryById(countryCode);
  if (!c) return null;
  let adopted = 0, fostered = 0, orphan = 0, withFather = 0, withMother = 0, twoParents = 0;
  let sibTotal = 0, gpTotal = 0;
  for (let i = 0; i < N; i++) {
    const f = generateFamily(countryCode, Math.random() < 0.5 ? 'M' : 'F');
    if (f.fosterCare === 'adopt') adopted++;
    if (f.fosterCare === 'foster') fostered++;
    if (f.parents.length === 0) orphan++;
    const hasFather = f.parents.some(p => p.sex === 'M');
    const hasMother = f.parents.some(p => p.sex === 'F');
    if (hasFather) withFather++;
    if (hasMother) withMother++;
    if (hasFather && hasMother) twoParents++;
    sibTotal += f.siblings.length;
    gpTotal += (f.grandparents || []).length;
  }
  return {
    N,
    adoptedPct: (adopted / N * 100).toFixed(1),
    fosteredPct: (fostered / N * 100).toFixed(1),
    orphanPct: (orphan / N * 100).toFixed(1),
    twoParentsPct: (twoParents / N * 100).toFixed(1),
    withFatherPct: (withFather / N * 100).toFixed(1),
    withMotherPct: (withMother / N * 100).toFixed(1),
    avgSib: (sibTotal / N).toFixed(2),
    avgGP: (gpTotal / N).toFixed(2)
  };
}

function renderLab() {
  const countrySel = $('#labCountry');
  const countryBSel = $('#labCountryB');
  if (countrySel && countrySel.children.length !== COUNTRIES.length) {
    countrySel.innerHTML = '';
    for (const c of COUNTRIES) {
      const loc = localize(c);
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.flag} ${loc.name}`;
      countrySel.appendChild(opt);
    }
    if (countryBSel) {
      countryBSel.innerHTML = '<option value="">—</option>';
      for (const c of COUNTRIES) {
        const loc = localize(c);
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.flag} ${loc.name}`;
        countryBSel.appendChild(opt);
      }
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
  // 家族統計
  if (result.famStats) {
    const fs = result.famStats;
    html += `<div class="lab-section"><h3>${t('lab.familyStats')}</h3><div class="fam-stats-grid">
      <div class="lab-stat"><div class="k">${t('lab.famOrphan')}</div><div class="v">${fs.orphanPct}%</div><div class="sub">${fs.N} 個家族</div></div>
      <div class="lab-stat"><div class="k">${t('lab.famTwoParents')}</div><div class="v">${fs.twoParentsPct}%</div><div class="sub">${t('lab.famFull')}</div></div>
      <div class="lab-stat"><div class="k">${t('lab.famAdopted')}</div><div class="v">${fs.adoptedPct}%</div><div class="sub">${t('lab.famAdoptedHint')}</div></div>
      <div class="lab-stat"><div class="k">${t('lab.famAvgSib')}</div><div class="v">${fs.avgSib}</div><div class="sub">${t('lab.famAvgSibHint')}</div></div>
      <div class="lab-stat"><div class="k">${t('lab.famAvgGP')}</div><div class="v">${fs.avgGP}</div><div class="sub">${t('lab.famAvgGPHint')}</div></div>
      <div class="lab-stat"><div class="k">${t('lab.famFostered')}</div><div class="v">${fs.fosteredPct}%</div><div class="sub">${t('lab.famFosteredHint')}</div></div>
    </div></div>`;
  }
  target.innerHTML = html;
}

/* ==== Lab 國家比較模式 ==== */
function displayLabResultsCompare(rA, rB) {
  const target = $('#labResults');
  if (!target) return;
  const flag = (c) => c.flag || '🏳️';
  const stat = (label, a, b, fmt, lowerBetter) => {
    const da = (a ?? 0), db = (b ?? 0);
    const wa = lowerBetter ? (da < db ? '▲' : da > db ? '▼' : '=') : (da > db ? '▲' : da < db ? '▼' : '=');
    const wb = lowerBetter ? (db < da ? '▲' : db > da ? '▼' : '=') : (db > da ? '▲' : db < da ? '▼' : '=');
    return `<tr><td>${label}</td><td>${fmt(da)} ${wa}</td><td>${fmt(db)} ${wb}</td></tr>`;
  };
  const fmt1 = x => x?.toFixed ? x.toFixed(1) : x;
  const fmt0 = x => Math.round(x ?? 0);
  const html = `
    <div class="lab-section"><h3>${flag(rA.country)} ${rA.country.name_zh} vs ${flag(rB.country)} ${rB.country.name_zh}</h3>
      <p class="muted">${rA.N} ${LANG==='en'?'lives per country':'人/國家'} · ${LANG==='en'?'avg lifespan, family stats':'平均壽命、家庭統計'}</p>
      <table class="lab-compare">
        <thead><tr><th></th><th>${flag(rA.country)} ${rA.country.name_zh}</th><th>${flag(rB.country)} ${rB.country.name_zh}</th></tr></thead>
        <tbody>
          ${stat(t('lab.avg_age'), rA.avg, rB.avg, fmt1)}
          ${stat(t('lab.median_age'), rA.median, rB.median, fmt0)}
          ${stat('5歲以下死亡%', (rA.deaths.filter(d => d < 5).length / rA.N * 100), (rB.deaths.filter(d => d < 5).length / rB.N * 100), fmt1, true)}
          ${stat(t('lab.famOrphan'), parseFloat(rA.famStats.orphanPct), parseFloat(rB.famStats.orphanPct), fmt1, true)}
          ${stat(t('lab.famTwoParents'), parseFloat(rA.famStats.twoParentsPct), parseFloat(rB.famStats.twoParentsPct), fmt1)}
          ${stat(t('lab.famAdopted'), parseFloat(rA.famStats.adoptedPct), parseFloat(rB.famStats.adoptedPct), fmt1)}
          ${stat(t('lab.famAvgSib'), parseFloat(rA.famStats.avgSib), parseFloat(rB.famStats.avgSib), fmt1)}
          ${stat(t('lab.famAvgGP'), parseFloat(rA.famStats.avgGP), parseFloat(rB.famStats.avgGP), fmt1)}
        </tbody>
      </table>
    </div>
    <div class="lab-section"><h3>${LANG==='en'?'Top causes':'死因分布對比'}</h3>
      <div class="lab-compare-causes">
        <div><h4>${flag(rA.country)} ${rA.country.name_zh}</h4>${renderCauseList(rA.causes)}</div>
        <div><h4>${flag(rB.country)} ${rB.country.name_zh}</h4>${renderCauseList(rB.causes)}</div>
      </div>
    </div>`;
  target.innerHTML = html;
}

function renderCauseList(causes) {
  const sorted = Object.entries(causes).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const total = Object.values(causes).reduce((a, b) => a + b, 0);
  return '<ol class="lab-causes">' + sorted.map(([c, n]) =>
    `<li><span class="lab-cause">${c}</span><span class="lab-cause-n">${(n/total*100).toFixed(1)}%</span></li>`
  ).join('') + '</ol>';
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
    const codeB = $('#labCountryB')?.value;
    const era = $('#labEra').value;
    const sex = $('#labSex').value;
    const N = +$('#labN').value;
    const result = runLab(code, era, sex, N);
    if (codeB) {
      const resultB = runLab(codeB, era, sex, N);
      displayLabResultsCompare(result, resultB);
    } else {
      displayLabResults(result);
    }
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
  $('#treeShare')?.addEventListener('click', shareTreeLink);
  $('#lifeExport')?.addEventListener('click', exportLifeJSON);
  $('#lifeImport')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) importLifeJSON(file);
    e.target.value = '';
  });
}

/* ==== URL hash 分享：序列化 life 到 LZ-string-ish JSON base64 ==== */
function shareTreeLink() {
  if (!STATE.life) { toast(LANG === 'en' ? 'Start a life first' : '請先開始一段人生'); return; }
  const { people, edges } = treePeopleGraph();
  const payload = {
    meta: { title: '族譜 · ' + (STATE.life.name.full || 'born-somewhere'), ts: Date.now() },
    people: Object.values(people).map(p => ({
      id: p.id, name: p.name, sex: p.sex, country: p.country,
      birth: p.birth, death: p.death, note: p.note, family: p.family
    })),
    edges
  };
  const json = JSON.stringify(payload);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  const url = `${location.origin}${location.pathname}#tree=${b64}`;
  navigator.clipboard?.writeText(url).then(() => {
    toast(t('share.copied') || '已複製');
  }, () => {
    prompt(LANG === 'en' ? 'Copy this URL:' : '複製此連結：', url);
  });
}

/* ==== 完整生涯 JSON 匯出/匯入 ==== */
function exportLifeJSON() {
  if (!STATE.life) { toast(LANG === 'en' ? 'Start a life first' : '請先開始一段人生'); return; }
  const payload = {
    type: 'born-somewhere-life',
    version: 1,
    exportedAt: new Date().toISOString(),
    state: {
      life: STATE.life,
      pastLives: loadPastLives(),
      importedFamily: STATE.importedFamily || null
    }
  };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (STATE.life.name?.full || STATE.life.name?.full_en || 'life').replace(/[^\w]/g, '_');
  a.href = url; a.download = `born-somewhere-${safeName}-${Date.now()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(LANG === 'en' ? 'Life exported' : '已匯出生涯');
}

function importLifeJSON(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      if (payload.type !== 'born-somewhere-life') throw new Error(LANG === 'en' ? 'Invalid format' : '格式不正確');
      if (payload.state?.life) {
        STATE.life = payload.state.life;
        if (payload.state.pastLives) localStorage.setItem(STORAGE_KEY + ':past', JSON.stringify(payload.state.pastLives));
        if (payload.state.importedFamily) STATE.importedFamily = payload.state.importedFamily;
        stopTicker();
        setView('life');
        renderAll();
        toast(LANG === 'en' ? 'Life imported — press ⏸/▶ to resume' : '已匯入生涯，按 ⏸/▶ 繼續');
      } else { throw new Error('No life data'); }
    } catch (e) {
      console.error(e);
      toast(LANG === 'en' ? 'Import failed: ' + e.message : '匯入失敗：' + e.message);
    }
  };
  reader.readAsText(file);
}

function loadFromHash() {
  const m = location.hash.match(/#tree=([^&]+)/);
  if (!m) return false;
  try {
    const json = decodeURIComponent(escape(atob(m[1])));
    const payload = JSON.parse(json);
    if (!payload.people || !payload.people.length) return false;
    STATE.importedFamily = { _meta: payload.meta, people: {} };
    payload.people.forEach(p => { STATE.importedFamily.people[p.id] = p; });
    const self = payload.people.find(p => p.id === 'self') || payload.people[0];
    STATE.life = {
      country: self.country || 'TWN',
      countryData: countryById(self.country || 'TWN'),
      name: { full: self.name, full_en: self.nameEn || '' },
      sex: self.sex || 'U',
      age: 30, year: new Date().getFullYear(),
      yearOffset: 0,
      family: { parents: [], siblings: [], grandparents: [], partner: null, kids: [] }
    };
    TREE_STATE.rootId = 'self';
    setView('tree');
    renderTree();
    toast(LANG === 'en' ? 'Loaded from URL' : '已從連結載入');
    return true;
  } catch (e) { console.error(e); return false; }
}
  $('#treeImport')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result;
        const parsed = window.Gedcom.import(text);
        STATE.importedFamily = parsed;  // 存到 STATE 供 GEDCOM.parse 之後用
        if (!STATE.life) {
          toast(LANG === 'en' ? 'Start a life first, then import GEDCOM' : '請先開始一段人生，再匯入 GEDCOM');
          return;
        }
        const f = STATE.life.family;
        f.parents = [];
        f.grandparents = [];
        f.siblings = [];
        // 自動找 self：用 @self@ xref 或姓名/出生年匹配現有 self
        const selfP = findSelfInGedcom(parsed);
        if (!selfP) {
          toast(LANG === 'en' ? 'GEDCOM imported — pick a person from Tree dropdown' : '已匯入 GEDCOM，請從族譜中心人物選擇');
        } else {
          // 灌入 self 的家族
          const fMembers = buildFamilyAround(selfP, parsed);
          f.parents = fMembers.parents;
          f.siblings = fMembers.siblings;
          f.grandparents = fMembers.grandparents;
        }
        TREE_STATE.rootId = selfP ? 'self' : Object.keys(parsed.people)[0];
        renderTree();
        const n = Object.keys(parsed.people).length;
        toast(t('io.imported', n));
      } catch (err) {
        console.error(err);
        toast(LANG === 'en' ? 'GEDCOM parse failed: ' + err.message : 'GEDCOM 解析失敗：' + err.message);
      }
    };
    reader.readAsText(file);
  });

/* 從 zu-pu/gedcom.js 解析結果找 self：
   1) 先看有沒有 xref "@self@" 標記的
   2) 否則用 STATE.life 的名字 + 出生年匹配 */
function findSelfInGedcom(parsed) {
  const ps = Object.values(parsed.people);
  const selfTagged = ps.find(p => p.notes && p.notes.includes('@self@'));
  if (selfTagged) return selfTagged;
  if (!STATE.life) return ps[0];
  const lifeName = STATE.life.name.full || STATE.life.name.full_en || '';
  const lifeYear = STATE.life.year + STATE.life.yearOffset - STATE.life.age;
  return ps.find(p => p.name === lifeName && p.birth && p.birth.year === lifeYear) || ps[0];
}

function buildFamilyAround(selfP, parsed) {
  const ps = parsed.people;
  const parents = (selfP.parents || []).map(pid => ps[pid]).filter(Boolean);
  const siblings = [];
  // 同父母的其他人 = 手足
  parents.forEach(par => {
    (par.spouses || []).forEach(spid => {
      // 找所有 children of FAM(parents)
    });
  });
  // 直接從 parents 的 children 找
  const allSibs = new Set();
  ps[parents[0]?.id] && (ps[parents[0].id].spouses || []).forEach(spid => {
    // 這對配偶的 FAM 的 children
  });
  // 簡化：找自我以外的所有人，其 parents 包含自我任一 parent
  Object.values(ps).forEach(p => {
    if (p.id === selfP.id) return;
    if ((p.parents || []).some(pid => parents.find(par => par.id === pid))) {
      siblings.push(p);
    }
  });
  const grandparents = [];
  parents.forEach(par => {
    (par.parents || []).forEach(gpid => {
      const gp = ps[gpid];
      if (gp && !grandparents.find(g => g.id === gp.id)) grandparents.push(gp);
    });
  });
  // 轉成 born-somewhere family 格式
  return {
    parents: parents.map(p => ({
      id: 'g_' + p.id,
      name: p.name || p.nameEn || '?',
      sex: p.gender === 'F' ? 'F' : 'M',
      country: p.birthPlace || STATE.life.country,
      countryData: countryById(p.birthPlace) || STATE.life.countryData,
      birth: p.birth ? { year: p.birth.year } : null,
      death: p.death ? { year: p.death.year } : null,
      note: null,
      sourceGedcomId: p.id
    })),
    siblings: siblings.map(p => ({
      id: 'g_' + p.id,
      name: p.name || p.nameEn || '?',
      sex: p.gender === 'F' ? 'F' : 'M',
      country: p.birthPlace || STATE.life.country,
      countryData: countryById(p.birthPlace) || STATE.life.countryData,
      birth: p.birth ? { year: p.birth.year } : null,
      death: p.death ? { year: p.death.year } : null,
      note: null,
      sourceGedcomId: p.id
    })),
    grandparents: grandparents.map(p => ({
      id: 'g_' + p.id,
      name: p.name || p.nameEn || '?',
      sex: p.gender === 'F' ? 'F' : 'M',
      country: p.birthPlace || STATE.life.country,
      countryData: countryById(p.birthPlace) || STATE.life.countryData,
      birth: p.birth ? { year: p.birth.year } : null,
      death: p.death ? { year: p.death.year } : null,
      note: null,
      sourceGedcomId: p.id
    }))
  };
}

async function init() {
  await loadData();
  document.documentElement.lang = LANG;
  wire();
  renderAll();
  if (location.hash.includes('tree=')) loadFromHash();
}
init();

/* =====================================================================
   族譜模組 (zu-pu 移植)：以目前人生為中心，產生祖上/子孫 SVG 樹
   ===================================================================== */
const TREE_STATE = { rootId: null, mode: 'ancestor', depth: 3 };

function treePeopleGraph() {
  if (!STATE.life || !STATE.life.family) return { people: {}, edges: [] };
  const f = STATE.life.family;
  const selfCaste = STATE.life.country === 'IND' ? STATE.life.name.caste : null;
  const self = {
    id: 'self',
    name: STATE.life.name.full || STATE.life.name.full_en || 'You',
    nameEn: STATE.life.name.full_en || '',
    sex: STATE.life.sex,
    country: STATE.life.country,
    countryData: STATE.life.countryData,
    birthOrigin: STATE.life.birthOrigin,
    birth: { year: STATE.life.year + STATE.life.yearOffset - STATE.life.age },
    death: STATE.life.died ? { year: (STATE.life.year + STATE.life.yearOffset - STATE.life.age) + STATE.life.deathAge } : null,
    family: selfCaste
  };
  const people = { [self.id]: self };
  f.parents.forEach(p => { 
    if (selfCaste && p.country === 'IND' && !p.family) p.family = selfCaste;
    people[p.id] = p; 
  });
  f.siblings.forEach(p => { 
    if (selfCaste && !p.family) p.family = selfCaste;
    people[p.id] = p; 
  });
  (f.grandparents||[]).forEach(p => { 
    if (selfCaste && p.country === 'IND' && !p.family) p.family = selfCaste;
    people[p.id] = p; 
  });
  if (f.partner) people[f.partner.id] = f.partner;
  (f.kids || []).forEach(p => { 
    if (selfCaste && !p.family) p.family = selfCaste;
    people[p.id] = p; 
  });
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
  if (f.partner) edges.push({ parentId: 'self', childId: f.partner.id, kind: 'spouse' });
  (f.kids || []).forEach(k => {
    edges.push({ parentId: 'self', childId: k.id, kind: 'parent' });
    if (f.partner) edges.push({ parentId: f.partner.id, childId: k.id, kind: 'parent' });
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
  // 跨國遷徙：顯示原國旗
  if (p.birthOrigin) {
    const ob = svgEl('text', { x: 4, y: 14, 'font-size': 12 }, g);
    ob.textContent = p.birthOrigin.flag + '→';
    ob.setAttribute('fill', '#a04040');
    const c = svgEl('text', { x: 32, y: 14, 'font-size': 12 }, g);
    c.textContent = (p.countryData?.flag || '🏳️');
  }
  // 印度種姓標記（依 p.family 或 self.country='IND' + 隨機 caste）
  if (p.family || p._caste) {
    const caste = p.family || p._caste;
    const cw = svgEl('rect', { class: 'caste-marker caste-' + caste, x: 70, y: h - 22, width: 50, height: 12, rx: 3 }, g);
    const ct = svgEl('text', { x: 95, y: h - 12, 'font-size': 9, fill: 'white', 'text-anchor': 'middle', 'font-weight': 600 }, g);
    ct.textContent = t('tree.caste.' + caste);
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
  // 轉成 zu-pu/gedcom.js 的 DB 格式
  const DB = { _meta: { title: '族譜 · ' + (STATE.life?.name?.full || 'born-somewhere') }, people: {} };
  for (const id of Object.keys(people)) {
    const p = people[id];
    DB.people[id] = {
      id,
      name: p.name || '',
      nameEn: p.nameEn || '',
      gender: p.sex || 'U',
      birth: p.birth ? { year: p.birth.year, month: p.birth.month, day: p.birth.day } : null,
      death: p.death ? { year: p.death.year } : null,
      birthPlace: p.country || '',
      deathPlace: '',
      notes: id === 'self' ? '@self@' : (p.note || ''),
      parents: edges.filter(e => e.childId === id && e.kind !== 'spouse').map(e => e.parentId),
      spouses: edges.filter(e => (e.childId === id || e.parentId === id) && e.kind === 'spouse').map(e => e.parentId === id ? e.childId : e.parentId)
    };
  }
  const ged = window.Gedcom.export(DB);
  const blob = new Blob([ged], { type: 'text/plain' });
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
