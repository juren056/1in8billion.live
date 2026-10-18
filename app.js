/* 選出生地 — 人生模擬 v1.0
   根據 1in8b.life 原作的二次創作，差別在出生地由使用者主動選擇。
   死亡、沉重事件按真實統計分布發生，不描寫畫面。
*/

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const rand = (a=1, b=0) => a + Math.random() * (b - a);
const irand = (a, b) => Math.floor(rand(a, b+1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const weighted = (entries) => {
  const total = entries.reduce((s, [,w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [v, w] of entries) { r -= w; if (r <= 0) return v; }
  return entries[entries.length-1][0];
};
const fmt = (n) => n.toLocaleString('zh-Hant');
const fmtMoney = (amount, currency, ppp) => {
  const local = Math.round(amount * (ppp || 1));
  return `${currency} ${fmt(local)}`;
};

const STORAGE_KEY = 'born-somewhere-v1';
let COUNTRIES = {};
let COUNTRY_LIST = [];

const STATE = {
  screen: 'home',
  settings: { era: 'now', pace: 60, gender: 'random', currency: 'auto', music: false, auto: false },
  selectedCountry: null,
  life: null,
  paused: false,
  speed: 1,
  running: false,
  timer: null,
  memorial: null,
};

const CAUSE_LABELS = {
  comm: '心血管疾病', cancer: '癌症', resp: '呼吸系統疾病', infect: '感染性疾病',
  acc: '意外事故', suicide: '自殺', homicide: '他殺', other: '其他',
  maternal: '孕產相關', perinatal: '周產期問題', war: '衝突傷亡', famine: '營養不良',
};

/* === Gompertz 死亡模型 === */
function gompertzParams(L) {
  // 選擇 β = 0.085，搭配 α 讓中位壽命接近 L
  const beta = 0.085;
  const alpha = beta * Math.log(2) / (Math.exp(beta * L) - 1);
  return { alpha, beta };
}
function survivalProb(age, L) {
  if (age < 0) return 1;
  const { alpha, beta } = gompertzParams(L);
  if (age < 15) {
    // 0-15 用一條簡化曲線：嬰兒 + 兒童死亡率
    return 1 - (age === 0 ? 0.005 : 0.005 + (age - 1) * 0.0003);
  }
  return Math.exp(-(alpha/beta) * (Math.exp(beta * age) - Math.exp(beta * 15)) * 0.9 - 0.06);
}
function pDieThisYear(age, L) {
  if (age < 1) {
    // 嬰兒死亡率（每千活產）
    return Math.min(0.5, (COUNTRIES[STATE.life.country.code].infantMort / 1000) + 0.001);
  }
  if (age < 5) {
    return Math.min(0.1, 0.0008 + (COUNTRIES[STATE.life.country.code].infantMort / 100000));
  }
  if (age < 15) return 0.0003;
  const s1 = survivalProb(age, L);
  const s0 = survivalProb(age - 1, L);
  return Math.max(0, Math.min(0.95, 1 - s1/s0));
}

/* === 死因加權 === */
function ageCauseWeights(age) {
  if (age < 1) return { perinatal: 60, infect: 25, comm: 3, other: 12 };
  if (age < 5) return { infect: 55, acc: 12, perinatal: 8, comm: 2, other: 23 };
  if (age < 15) return { acc: 35, infect: 22, cancer: 10, comm: 4, suicide: 6, other: 23 };
  if (age < 30) return { acc: 28, suicide: 22, homicide: 14, comm: 6, cancer: 6, infect: 8, other: 16 };
  if (age < 50) return { cancer: 18, comm: 18, suicide: 14, acc: 12, infect: 8, homicide: 4, other: 26 };
  if (age < 70) return { comm: 30, cancer: 28, resp: 10, suicide: 5, acc: 4, infect: 5, other: 18 };
  return { comm: 35, cancer: 22, resp: 14, infect: 6, acc: 3, suicide: 4, other: 16 };
}
function pickCauseOfDeath(age, country, gender) {
  const weights = ageCauseWeights(age);
  // 國家調整：把對應的 cause 用 country.deathCauses 比例替換
  const cc = country.deathCauses || {};
  const adj = { ...weights };
  if (age >= 15) {
    adj.comm = (weights.comm || 0) * ((cc.comm || 25) / 25);
    adj.cancer = (weights.cancer || 0) * ((cc.cancer || 20) / 20);
    adj.resp = (weights.resp || 0) * ((cc.resp || 8) / 8);
    adj.infect = (weights.infect || 0) * ((cc.infect || 15) / 15);
    adj.acc = (weights.acc || 0) * ((cc.acc || 8) / 8);
    adj.suicide = (weights.suicide || 0) * ((gender === 'M' ? country.suicideM : country.suicideF) / 12);
    adj.homicide = (weights.homicide || 0) * ((cc.homicide || 1) / 1);
  } else {
    // 兒童以 infectious 為主
    adj.infect = (weights.infect || 0) * 1.5;
  }
  return weighted(Object.entries(adj).map(([k,v]) => [k, Math.max(0.1, v)]));
}

/* === 教育 / 收入 / 家庭 抽樣 === */
function educationOutcome(country, gender) {
  const r = Math.random() * 100;
  if (r < country.college) {
    const years = Math.min(country.edu + 4, 18);
    return { level: 'college', years, label: '大學' };
  }
  if (r < country.college + (100 - country.college) * 0.55) {
    return { level: 'highschool', years: 12, label: '高中' };
  }
  if (r < country.college + (100 - country.college) * 0.85) {
    return { level: 'middle', years: 9, label: '初中' };
  }
  return { level: 'primary', years: 6, label: '小學' };
}
function jobFor(country, edu, age) {
  if (age < 18) return null;
  if (edu.level === 'primary') {
    return weighted([['農牧業', country.agriculturalEmp], ['建築工', 25], ['清潔/家務', 30], ['餐飲服務', 25], ['工廠作業員', 25]]);
  }
  if (edu.level === 'middle') {
    return weighted([['餐飲服務', 22], ['零售店員', 20], ['司機', 15], ['工廠技工', 18], ['建築工', 12], ['農牧業', country.agriculturalEmp/2]]);
  }
  if (edu.level === 'highschool') {
    return weighted([['文書/行政', 25], ['銷售/業務', 22], ['技術員', 20], ['護理/醫技', 13], ['軍警/消防', 10], ['教師', 10]]);
  }
  // college
  return weighted([['工程師', 18], ['教師', 14], ['醫療專業', 13], ['商業/金融', 18], ['公務員', 12], ['資訊/科技', 14], ['研究/學術', 6], ['藝術/設計', 5]]);
}
function incomeFor(country, edu, gender) {
  // 以 GDP PPP 為基準，按教育程度和吉尼係數分配
  const gini = country.gini;
  const baseGdp = country.gdp;
  const eduMul = { primary: 0.15, middle: 0.30, highschool: 0.55, college: 1.3 }[edu.level];
  const genderMul = gender === 'F' ? 0.7 : 1.0;
  const median = baseGdp * eduMul * genderMul;
  // 用對數常態分佈（粗略）
  const sigma = gini / 60;
  const ln = Math.log(median) + (Math.random() - 0.5) * sigma * 2;
  return Math.max(800, Math.round(Math.exp(ln)));
}
function marriageAge(country, gender) {
  const base = gender === 'F' ? 24 : 27;
  const offset = Math.round((40 - country.satisfaction * 5) * 0.5) + irand(-3, 4);
  const fertOffset = (country.fertility - 1.5) * 3;
  return Math.max(16, Math.min(45, base + offset + Math.round(fertOffset)));
}
function childrenCount(country, gender) {
  // 簡化：以國家生育率為期望，圍繞它波動
  const f = country.fertility;
  return Math.max(0, Math.round(f + (Math.random() - 0.5) * 2.2));
}

/* === 一次性抽樣：建立角色 === */
function buildLife(countryCode, year, gender) {
  const country = COUNTRIES[countryCode];
  if (!country) throw new Error('unknown country');
  const edu = educationOutcome(country, gender);
  const marAge = marriageAge(country, gender);
  const kids = childrenCount(country, gender);
  const life = {
    country: countryCode,
    countryData: country,
    year,
    gender,
    age: 0,
    name: null, // 隨機給個當地風格名
    edu,
    marAge,
    kids: kids,
    job: null,
    income: 0,
    wealth: 0,        // 累積
    health: 100,      // 0-100
    mental: 70,       // 0-100
    married: false,
    partnerName: null,
    kidsBorn: 0,
    moves: 0,
    parentsAlive: [true, true],
    parentsAge: [irand(20, 38), irand(20, 38)],
    milestones: [],
    quotes: [],
    log: [],
    died: false,
    cause: null,
    deathAge: null,
  };
  return life;
}

const NAME_BY_REGION = {
  'Asia': { M: ['志明','俊宏','家豪','建宏','俊傑','浩宇','承恩','柏翰','冠廷','彥廷','俊佑','俊廷','柏宇','宥廷','禹辰','建宇','俊宇','子軒','睿恩','嘉佑'],
             F: ['雅婷','怡君','佳穎','怡萱','雅雯','心怡','筱涵','筱萍','雅琪','雅文','郁婷','思妤','雅筑','宜君','詩涵','雅晴','宜臻','雅芳','婉婷','佳蓉'] },
  'Middle East': { M: ['阿里','哈立德','穆罕默德','歐瑪','哈山','阿布','法赫德','薩利赫','約瑟夫','伊布拉希姆'],
                   F: ['法蒂瑪','艾莎','瑪麗亞姆','努拉','萊拉','扎伊納布','哈南','薩拉','胡達','葉海拉'] },
  'Europe': { M: ['Liam','Noah','Lucas','Oliver','James','Theo','Hugo','Leon','Mateo','Ethan','Adam','Daniel','Jack','Henry','Oscar'],
              F: ['Olivia','Emma','Mia','Sofia','Ella','Ava','Luna','Maja','Nora','Clara','Eva','Lea','Julia','Anastasia','Marie'] },
  'Americas': { M: ['Liam','Mateo','Sebastián','Santiago','Diego','Samuel','Miguel','Daniel','David','Carlos','James','Ethan','Logan','Lucas','Aiden'],
                F: ['Sofía','Isabella','Emma','Camila','Valentina','Lucía','Victoria','Martina','Ximena','Sarah','Emily','Olivia','Ava','Mia','Hannah'] },
  'Africa': { M: ['Kofi','Kwame','Tendai','Sipho','Tariro','Emeka','Chidi','Sekou','Ousmane','Mosi','Jabari','Kato','Sekuru','Bongani','Thabo'],
              F: ['Amina','Zara','Nia','Amara','Kira','Sade','Nuru','Imani','Asha','Zola','Mosi','Lerato','Thandi','Aisha','Folami'] },
  'Oceania': { M: ['Jack','Liam','Noah','William','Oliver','James','Henry','Thomas','Lucas','Ethan'],
                F: ['Charlotte','Olivia','Mia','Amelia','Isla','Ava','Grace','Ella','Zoe','Sophie'] },
};
function pickName(country, gender) {
  const region = country.region;
  const list = NAME_BY_REGION[region]?.[gender] || NAME_BY_REGION.Asia[gender];
  return pick(list);
}

/* === UI: 國家列表 === */
function renderCountries() {
  COUNTRY_LIST = Object.entries(COUNTRIES).map(([code, c]) => ({ code, ...c }));
  const grid = $('#countryGrid');
  grid.innerHTML = '';
  for (const c of COUNTRY_LIST) {
    const card = document.createElement('button');
    card.className = 'country-card';
    card.dataset.code = c.code;
    card.dataset.region = c.region;
    card.innerHTML = `
      <div class="cc-row1">
        <span class="cc-flag">${c.flag}</span>
        <span class="cc-name">${c.name}</span>
        <span class="cc-en">${c.nameEn}</span>
      </div>
      <div class="cc-stats">
        <span>人均壽命</span><b>${Math.round((c.lifeM + c.lifeF)/2)} 歲</b>
        <span>人均GDP</span><b>$${fmt(c.gdp)}</b>
        <span>吸菸率</span><b>${c.smokingM}% / ${c.smokingF}%</b>
        <span>吉尼</span><b>${c.gini.toFixed(1)}</b>
        <span>生活滿意度</span><b>${c.satisfaction} / 10</b>
        <span>兇殺率</span><b>${c.homicide}/10萬</b>
      </div>
    `;
    card.addEventListener('click', () => selectCountry(c.code));
    grid.appendChild(card);
  }
  $('#countrySearch').addEventListener('input', filterCountries);
  $$('#regionTabs .region-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#regionTabs .region-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterCountries();
    });
  });
}
function selectCountry(code) {
  STATE.selectedCountry = code;
  $$('.country-card').forEach(c => c.classList.toggle('selected', c.dataset.code === code));
}
function filterCountries() {
  const q = $('#countrySearch').value.trim().toLowerCase();
  const region = $('#regionTabs .region-tab.active').dataset.region;
  let visible = 0;
  $$('.country-card').forEach(c => {
    const name = c.querySelector('.cc-name').textContent.toLowerCase();
    const en = c.querySelector('.cc-en').textContent.toLowerCase();
    const ok = (!q || name.includes(q) || en.includes(q)) && (region === 'all' || c.dataset.region === region);
    c.style.display = ok ? '' : 'none';
    if (ok) visible++;
  });
  // empty state
  let empty = $('#countryGrid .cc-empty');
  if (visible === 0) {
    if (!empty) {
      empty = document.createElement('div');
      empty.className = 'cc-empty';
      empty.textContent = '找不到符合的國家。試試其他關鍵字或換個地區。';
      $('#countryGrid').appendChild(empty);
    }
  } else if (empty) {
    empty.remove();
  }
}

/* === seg buttons === */
function wireSegs() {
  $$('.seg').forEach(seg => {
    seg.addEventListener('click', (e) => {
      const btn = e.target.closest('.seg-btn');
      if (!btn) return;
      const group = seg.dataset.group;
      $$('.seg-btn', seg).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.settings[group] = btn.dataset.val;
    });
  });
}

/* === 開始遊戲 === */
function startLife() {
  let code = STATE.selectedCountry;
  if (!code) {
    code = pick(COUNTRY_LIST).code;
  }
  const country = COUNTRIES[code];
  const year = STATE.settings.era === 'past' ? 1950 : STATE.settings.era === 'future' ? 2080 : 2024;
  const gender = STATE.settings.gender === 'random' ? pick(['M','F']) : STATE.settings.gender;
  STATE.life = buildLife(code, year, gender);
  STATE.life.name = pickName(country, gender);
  STATE.life.paceMs = STATE.settings.pace === 30 ? 30 : STATE.settings.pace === 60 ? 50 : 75;
  STATE.paused = false;
  STATE.speed = 1;
  $('#lifeFlag').textContent = country.flag;
  $('#lifeName').textContent = country.name;
  $('#lifeYear').textContent = year;
  showScreen('life');
  $('#lifeLog').innerHTML = '';
  logEvent(0, `在 ${country.name} 出生`, `${STATE.life.name} 來到世界上，是這個家庭的一份子。`);
  STATE.running = true;
  setControlsState();
  runLoop();
}

/* === 事件系統 === */
function maybeEvent(age) {
  const L = STATE.life.countryData;
  const gender = STATE.life.gender;
  const life = STATE.life;

  // 死亡判定
  const lifeExp = gender === 'F' ? L.lifeF : L.lifeM;
  const pd = pDieThisYear(age, lifeExp);
  if (Math.random() < pd) {
    dieNow(age);
    return;
  }

  // 5/15/30/50/70 暫停問題
  if ([5,15,30,50,70].includes(age) && !life.quotes.find(q => q.age === age)) {
    pauseForQuestion(age);
    return;
  }

  // 其他事件
  if (age === 6) logEvent(age, '開始上學', '走進小學的第一天，背著書包，在家門口回頭看了一眼。');
  if (age === 12) {
    if (Math.random() < 0.05) logEvent(age, '搬家', '家裡搬到城市的另一邊，換了學校。');
    else logEvent(age, '升上國中', '進入青春期，功課開始變難，開始有自己的想法。');
  }
  if (age === 15 && life.edu.level === 'primary') {
    if (Math.random() < 0.6) {
      logEvent(age, '中輟', '家裡需要幫忙，也不太想讀了，決定不再升學。', 'heavy');
    } else {
      logEvent(age, '就讀高職', '進入技職學校，學一技之長。');
    }
  }
  if (age === 18) {
    if (life.edu.level === 'college' && Math.random() < 0.7) {
      logEvent(age, '上大學', '考上大學，準備離家到另一個城市。');
    } else if (life.edu.level === 'highschool' && Math.random() < 0.5) {
      logEvent(age, '開始工作', '高中畢業，先去工作。');
    } else if (life.edu.level === 'middle') {
      logEvent(age, '開始工作', '初中念完，先去工作幫忙家計。');
    }
    if (life.edu.level === 'college') {
      life.job = '大學生';
    } else {
      life.job = jobFor(L, life.edu, age);
      life.income = incomeFor(L, life.edu, gender);
      logEvent(age, '第一份工作', `在 ${life.job} 開始第一份工作，月收入 ${fmtMoney(life.income, getCurrency(), L.pppFactor)}。`);
    }
  }
  if (age === 22 && life.edu.level === 'college') {
    life.job = jobFor(L, life.edu, age);
    life.income = incomeFor(L, life.edu, gender);
    logEvent(age, '大學畢業', `進入職場，第一份正職是 ${life.job}，月收入 ${fmtMoney(life.income, getCurrency(), L.pppFactor)}。`);
  }
  if (age === life.marAge && !life.married) {
    if (Math.random() < 0.85) {
      const pname = pickName(L, gender === 'M' ? 'F' : 'M');
      life.partnerName = pname;
      life.married = true;
      logEvent(age, '結婚', `與 ${pname} 結婚，開始一起生活。`, 'good');
    } else {
      logEvent(age, '選擇不婚', '決定不結婚，把時間留給自己和工作。');
    }
  }
  // 孩子
  if (life.married && life.kidsBorn < life.kids && age >= 18 && Math.random() < 0.15) {
    life.kidsBorn++;
    if (life.kidsBorn === 1) logEvent(age, '第一個孩子', '第一個孩子出生，家裡多了一個人。', 'good');
    else if (life.kidsBorn === 2) logEvent(age, '第二個孩子', '第二個孩子出生，熱鬧的兩人世界變成三人行。');
    else if (life.kidsBorn >= 3) logEvent(age, `第 ${life.kidsBorn} 個孩子`, '家裡繼續擴大。');
  }
  // 父母過世
  for (let i = 0; i < 2; i++) {
    if (life.parentsAlive[i]) {
      life.parentsAge[i]++;
      const parentL = (L.lifeM + L.lifeF) / 2 - 25;
      if (Math.random() < pDieThisYear(life.parentsAge[i], parentL)) {
        life.parentsAlive[i] = false;
        const tag = i === 0 ? '父親' : '母親';
        if (age >= 10) logEvent(age, `${tag}過世`, `${tag}在 ${life.parentsAge[i]} 歲時離開了。`, 'heavy');
      }
    }
  }
  // 升遷、換工作
  if (life.job && age >= 25 && Math.random() < 0.08) {
    const newJob = jobFor(L, life.edu, age);
    if (newJob !== life.job) {
      life.job = newJob;
      life.income = Math.round(life.income * (0.9 + Math.random() * 0.4));
      logEvent(age, '換工作', `換到 ${newJob}，月收入調整為 ${fmtMoney(life.income, getCurrency(), L.pppFactor)}。`);
    } else if (Math.random() < 0.5) {
      life.income = Math.round(life.income * 1.1);
      logEvent(age, '加薪', `月收入調整為 ${fmtMoney(life.income, getCurrency(), L.pppFactor)}。`);
    }
  }
  // 重大疾病
  if (age >= 40 && Math.random() < 0.04) {
    const cond = pick(['癌症', '心臟病', '中風', '糖尿病', '嚴重感染']);
    logEvent(age, `確診${cond}`, '需要長期治療與休養。', 'heavy');
    showHeavyModal(`${cond}的診斷是一記重擊。`, '依照這個國家的真實統計，中老年得這種病的機率不算低。治療會是漫長的過程，也會改變接下來的日子。');
  }
  if (age >= 50 && Math.random() < 0.03) {
    logEvent(age, '喪偶', `${life.partnerName || '另一半'} 走了。`, 'heavy');
    showHeavyModal('失去另一半的日子來了。', '悲傷沒有進度表。如果是你，請記得：你不是一個人，身邊有人在；想找人說話，請打給你信任的人。');
    life.partnerName = null;
    life.married = false;
  }
  // 心理健康
  if (age >= 14 && Math.random() < 0.015) {
    logEvent(age, '心理健康變差', '一段時間情緒低落，不想出門，影響了日常。', 'heavy');
    showHeavyModal('有時候腦袋會跟我們作對。',
      '在這個國家，每一年都有人經歷這樣的時刻。找人說話不是軟弱——你身邊的人比你想的更願意聽。如果在台灣或香港，可以打 1925（24小時）、生命線 1995、撒瑪利亞 2389。');
  }
  // 退休
  if (age >= 60 && life.job && Math.random() < 0.4 && !life.milestones.find(m => m.title === '退休')) {
    life.job = '退休';
    life.income = Math.round(life.income * 0.4);
    life.milestones.push({ age, title: '退休' });
    logEvent(age, '退休', '離開職場，靠積蓄和退休金過日子。', 'good');
  }
  // 純隨機生活事件
  if (Math.random() < 0.07) {
    const flavor = pick([
      ['養了一隻貓', '家裡多了一隻毛茸茸的同伴。', 'good'],
      ['養了一隻狗', '每天多了一個固定散步的理由。', 'good'],
      ['出國旅行', '第一次（或再一次）踏上陌生的國度。', 'good'],
      ['開始跑步', '養成了規律運動的習慣。', 'good'],
      ['學會做一道家鄉菜', '家裡的餐桌多了一個味道。'],
      ['讀完一本很厚的書', '好幾個晚上沒睡好，但值得。'],
      ['和朋友大吵一架', '關係變得尷尬，後來有慢慢和好。', 'heavy'],
      ['家裡的車被撞', '處理保險和維修花了好一陣子。', 'heavy'],
      ['接到一通久違的電話', '來自老朋友或家人。', 'good'],
      ['搬到另一個城市', '換了一個生活的環境，重新開始。'],
    ]);
    logEvent(age, flavor[0], flavor[1], flavor[2]);
  }
}

function dieNow(age) {
  const L = STATE.life.countryData;
  const cause = pickCauseOfDeath(age, L, STATE.life.gender);
  STATE.life.died = true;
  STATE.life.cause = cause;
  STATE.life.deathAge = age;
  STATE.life.log.push({ age, title: '生命結束', body: causeSentence(cause, age, L), kind: 'heavy' });
  endLife();
}

function causeSentence(cause, age, country) {
  const label = CAUSE_LABELS[cause] || cause;
  if (cause === 'perinatal') return `出生後短時間內，因 ${label} 離世。這是這個國家嬰兒最常見的死因之一。`;
  if (cause === 'infect') return `在 ${age} 歲時因 ${label} 過世。在缺乏完善醫療的地區，傳染病仍是兒童主要死因。`;
  if (cause === 'maternal') return `在生產過程中因 ${label} 離世。`;
  if (cause === 'suicide') return `選擇自己結束生命。沉重的痛留給留下的人。如果在低潮，請聯絡身邊的人或求助專線。`;
  if (cause === 'homicide') return `死於他人暴力。在這個國家每 10 萬人約有 ${country.homicide} 起兇殺案。`;
  if (cause === 'acc') return `死於 ${label}。`;
  return `在 ${age} 歲時因 ${label} 過世，這是這個國家最常見的死因之一。`;
}

/* === 暫停問題 === */
const QUESTIONS = {
  5: { q: '如果五歲的你能記得一件事，你會記得什麼？', help: '也許是某個人、某個味道、某個下午。不寫也可以。' },
  15: { q: '十五歲的你，最在意什麼？', help: '是誰、什麼事、什麼感覺？' },
  30: { q: '三十歲的你，現在最在乎的是什麼？', help: '跟十五歲時比起來，變了嗎？' },
  50: { q: '五十歲回頭看，你怎麼看你走過的路？', help: '有什麼留下，有什麼錯過？' },
  70: { q: '你這一生最想被人記住什麼？', help: '可以是一個畫面、一句話、一個堅持。' },
};
function pauseForQuestion(age) {
  STATE.paused = true;
  setControlsState();
  const q = QUESTIONS[age];
  $('#modalMeta').textContent = `生命走到 ${age} 歲`;
  $('#modalQ').textContent = q.q;
  $('#modalHelp').textContent = q.help;
  $('#modalInput').value = '';
  $('#modal').hidden = false;
  STATE._pendingAge = age;
}
function submitQuestion() {
  const age = STATE._pendingAge;
  const text = $('#modalInput').value.trim();
  if (text) {
    STATE.life.quotes.push({ age, text });
  }
  $('#modal').hidden = true;
  STATE.paused = false;
  setControlsState();
}
function skipQuestion() {
  $('#modal').hidden = true;
  STATE.paused = false;
  setControlsState();
}
function showHeavyModal(title, body) {
  $('#heavyTitle').textContent = title;
  $('#heavyBody').textContent = body;
  $('#heavyModal').hidden = false;
  STATE.paused = true;
  setControlsState();
}
function closeHeavyModal() {
  $('#heavyModal').hidden = true;
  STATE.paused = false;
  setControlsState();
}

/* === UI: 側欄 === */
function updateSide() {
  const L = STATE.life.countryData;
  const life = STATE.life;
  $('#sideFamily').innerHTML = `
    <div class="kv"><span>性別</span><b>${life.gender === 'M' ? '男' : '女'}</b></div>
    <div class="kv"><span>婚姻</span><b>${life.married ? `與 ${life.partnerName}` : '單身'}</b></div>
    <div class="kv"><span>孩子</span><b>${life.kidsBorn} / ${life.kids}</b></div>
    <div class="kv"><span>父母</span><b>${life.parentsAlive.filter(Boolean).length} 人在世</b></div>
  `;
  $('#sideHealth').innerHTML = `
    <div class="kv"><span>健康</span><b>${Math.round(life.health)} / 100</b></div>
    <div class="kv"><span>心理</span><b>${Math.round(life.mental)} / 100</b></div>
  `;
  $('#sideEdu').innerHTML = `
    <div class="kv"><span>最高學歷</span><b>${life.edu.label}</b></div>
    <div class="kv"><span>受教育年數</span><b>${life.edu.years} 年</b></div>
  `;
  $('#sideWork').innerHTML = `
    <div class="kv"><span>工作</span><b>${life.job || '—'}</b></div>
    <div class="kv"><span>月收入</span><b>${life.income ? fmtMoney(life.income, getCurrency(), L.pppFactor) : '—'}</b></div>
  `;
  $('#sideRel').innerHTML = `
    <div class="kv"><span>移居</span><b>${life.moves} 次</b></div>
  `;
}
function getCurrency() {
  if (STATE.settings.currency !== 'auto') return STATE.settings.currency;
  return STATE.life.countryData.currencyCode;
}

/* === 紀錄 === */
function logEvent(age, title, body, kind) {
  const row = { age, title, body, kind };
  STATE.life.log.push(row);
  renderLogRow(row, true);
}
function renderLogRow(row, prepend=false) {
  const div = document.createElement('div');
  div.className = 'log-row';
  if (row.kind) div.classList.add(row.kind);
  div.innerHTML = `
    <div class="log-title"><span class="log-age">${row.age}</span>${row.title}</div>
    <div class="log-body">${row.body}</div>
  `;
  const log = $('#lifeLog');
  if (prepend) log.insertBefore(div, log.firstChild);
  else log.appendChild(div);
  log.scrollTop = 0;
}

/* === 主迴圈 === */
async function runLoop() {
  while (STATE.running && !STATE.life.died) {
    if (STATE.paused) { await sleep(200); continue; }
    STATE.life.age += 1;
    const newYear = STATE.life.year + 1;
    STATE.life.year = newYear;
    $('#lifeAge').textContent = `${STATE.life.age} 歲`;
    $('#lifeYear').textContent = newYear;
    const L = STATE.life.countryData;
    const lifeExp = STATE.life.gender === 'F' ? L.lifeF : L.lifeM;
    $('#lifeExpect').textContent = lifeExp.toFixed(1);
    const ratio = Math.min(1, STATE.life.age / lifeExp);
    $('#lifeBarFill').style.width = `${(ratio * 100).toFixed(1)}%`;
    maybeEvent(STATE.life.age);
    updateSide();
    if (STATE.life.died) break;
    const base = STATE.life.paceMs;
    const interval = base / STATE.speed;
    await sleep(interval);
  }
  if (STATE.life.died) {
    await sleep(1200);
    endLife();
  }
}

function setControlsState() {
  $('#btnPause').textContent = STATE.paused ? '▶' : '⏸';
  $('#btnFaster').textContent = STATE.speed >= 4 ? '«' : STATE.speed >= 2 ? '»' : '»';
}

function endLife() {
  STATE.running = false;
  const life = STATE.life;
  const causeLabel = CAUSE_LABELS[life.cause] || life.cause || '—';
  $('#memorialSub').textContent = `這是 ${life.name} 的一生，從 ${life.countryData.name} 的 0 歲走到 ${life.deathAge} 歲。`;
  $('#mPlace').textContent = `${life.countryData.flag} ${life.countryData.name}`;
  $('#mYears').textContent = `${life.year} → ${life.year + life.deathAge}`;
  $('#mAge').textContent = `${life.deathAge} 歲`;
  $('#mCause').textContent = causeLabel;
  $('#mEdu').textContent = `${life.edu.label}（${life.edu.years} 年）`;
  $('#mWork').textContent = life.job || '無正式工作';
  $('#mPartner').textContent = life.partnerName || '—';
  $('#mKids').textContent = `${life.kidsBorn} 個`;
  $('#mMove').textContent = `${life.moves} 次`;
  const q = $('#mQuotes');
  q.innerHTML = '';
  for (const qq of life.quotes) {
    const d = document.createElement('div');
    d.className = 'memorial-quote';
    d.innerHTML = `<span class="q-age">${qq.age} 歲</span>${qq.text}`;
    q.appendChild(d);
  }
  if (life.quotes.length === 0) {
    q.innerHTML = '<div class="memorial-quote" style="border-color:#444">這一段人生沒有留下文字。沉默也是一段人生的一部分。</div>';
  }
  showScreen('memorial');
  for (const row of life.log.slice(-3)) {
    if (!$('#lifeLog').innerHTML.includes(row.title)) renderLogRow(row);
  }
  STATE.memorial = life;
  saveMemorial(life);
}

function saveMemorial(life) {
  try {
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    arr.unshift({ name: life.name, country: life.country, age: life.deathAge, cause: life.cause, year: life.year, ts: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr.slice(0, 30)));
  } catch (e) {}
}

function showScreen(name) {
  STATE.screen = name;
  $$('.screen').forEach(s => s.classList.remove('active'));
  if (name === 'home') $('#screenHome').classList.add('active');
  if (name === 'life') $('#screenLife').classList.add('active');
  if (name === 'memorial') $('#screenMemorial').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* === restart === */
function restartLife() {
  STATE.running = false;
  STATE.life = null;
  STATE.memorial = null;
  showScreen('home');
}
function newCountry() {
  STATE.selectedCountry = null;
  $$('.country-card').forEach(c => c.classList.remove('selected'));
  restartLife();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function copyMemorial() {
  if (!STATE.memorial) return;
  const life = STATE.memorial;
  const L = life.countryData;
  const txt = [
    `${life.name} 的一生 — ${L.flag} ${L.name}`,
    `${life.year} 出生，${life.deathAge} 歲離開。`,
    `死因：${CAUSE_LABELS[life.cause] || life.cause}`,
    `教育：${life.edu.label}`,
    `工作：${life.job || '—'}`,
    `伴侶：${life.partnerName || '—'}`,
    `孩子：${life.kidsBorn}`,
    ``,
    ...life.quotes.map(q => `${q.age} 歲：${q.text}`),
  ].join('\n');
  navigator.clipboard.writeText(txt).then(() => {
    $('#btnCopy').textContent = '已複製 ✓';
    setTimeout(() => { $('#btnCopy').textContent = '複製這一段'; }, 1500);
  }).catch(() => alert('複製失敗，請手動選取。'));
}

/* === wire === */
function wire() {
  $('#btnBorn').addEventListener('click', startLife);
  $('#btnPause').addEventListener('click', () => { STATE.paused = !STATE.paused; setControlsState(); });
  $('#btnFaster').addEventListener('click', () => {
    STATE.speed = STATE.speed >= 4 ? 1 : STATE.speed * 2;
    setControlsState();
  });
  $('#btnRestart').addEventListener('click', () => {
    if (confirm('重新開始會放棄現在這段人生，確定？')) restartLife();
  });
  $('#btnSettings').addEventListener('click', () => { $('#settingsModal').hidden = false; });
  $('#settingsClose').addEventListener('click', () => { $('#settingsModal').hidden = true; });
  $('#setMusic').addEventListener('change', e => { STATE.settings.music = e.target.checked; });
  $('#setAuto').addEventListener('change', e => { STATE.settings.auto = e.target.checked; });
  $('#setCurrency').addEventListener('change', e => { STATE.settings.currency = e.target.value; updateSide(); });
  $('#modalSubmit').addEventListener('click', submitQuestion);
  $('#modalSkip').addEventListener('click', skipQuestion);
  $('#heavyClose').addEventListener('click', closeHeavyModal);
  $('#btnAgain').addEventListener('click', () => { STATE.life = null; showScreen('home'); });
  $('#btnNewCountry').addEventListener('click', newCountry);
  $('#btnCopy').addEventListener('click', copyMemorial);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      $('#modal').hidden = true;
      $('#heavyModal').hidden = true;
      $('#settingsModal').hidden = true;
    }
  });
  wireSegs();
}

async function init() {
  const res = await fetch('data/countries.json');
  COUNTRIES = await res.json();
  COUNTRY_LIST = Object.entries(COUNTRIES).map(([code, c]) => ({ code, ...c }));
  renderCountries();
  wire();
}
init();
