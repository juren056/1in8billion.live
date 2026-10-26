import fs from "node:fs";
import { themeCopy, studyCopy } from "../theme-copy.js";
import { locales } from "../locale-runtime.js";
const labels = {
  en: [
    "Home",
    "Birth reveal",
    "Life in progress",
    "Ending",
    "Keepsake studio",
    "Compare",
    "Interactive design study using completed sample records. Your saved life is not changed.",
    "Previous event",
    "Next event",
    "Play / pause",
    "Open real experience",
  ],
  "zh-CN": [
    "首页",
    "出生揭晓",
    "人生进行",
    "结局",
    "纪念包",
    "国家对比",
    "基于实际完成样例的交互设计预览，不修改你的存档。",
    "上一个事件",
    "下一个事件",
    "播放／暂停",
    "打开真实体验",
  ],
  "zh-TW": [
    "首頁",
    "出生揭曉",
    "人生進行",
    "結局",
    "紀念包",
    "國家比較",
    "基於實際完成範例的互動設計預覽，不修改你的存檔。",
    "上一個事件",
    "下一個事件",
    "播放／暫停",
    "開啟實際體驗",
  ],
  ja: [
    "ホーム",
    "出生の公開",
    "人生の進行",
    "結末",
    "記念作品",
    "国の比較",
    "完了した例による操作プレビュー。保存した人生は変更されません。",
    "前の出来事",
    "次の出来事",
    "再生／停止",
    "実際に体験",
  ],
  ko: [
    "홈",
    "출생 공개",
    "진행 중인 삶",
    "결말",
    "기념 작품",
    "국가 비교",
    "완료된 예시를 사용한 디자인 미리보기입니다. 저장한 삶은 변경되지 않습니다.",
    "이전 사건",
    "다음 사건",
    "재생 / 정지",
    "실제 체험 열기",
  ],
  es: [
    "Inicio",
    "Nacimiento",
    "La vida",
    "Final",
    "Recuerdos",
    "Comparar",
    "Estudio interactivo con ejemplos completados. No cambia tu partida.",
    "Evento anterior",
    "Siguiente evento",
    "Reproducir / pausar",
    "Abrir experiencia",
  ],
  "pt-BR": [
    "Início",
    "Nascimento",
    "A vida",
    "Final",
    "Lembranças",
    "Comparar",
    "Prévia interativa com exemplos concluídos. Não altera sua vida salva.",
    "Evento anterior",
    "Próximo evento",
    "Reproduzir / pausar",
    "Abrir experiência",
  ],
  fr: [
    "Accueil",
    "Naissance",
    "La vie",
    "Fin",
    "Souvenirs",
    "Comparer",
    "Aperçu interactif avec des exemples terminés. Votre sauvegarde reste intacte.",
    "Événement précédent",
    "Événement suivant",
    "Lecture / pause",
    "Ouvrir l’expérience",
  ],
  de: [
    "Start",
    "Geburt",
    "Lebensverlauf",
    "Ende",
    "Erinnerungen",
    "Vergleichen",
    "Interaktive Vorschau mit abgeschlossenen Beispielen. Spielstände bleiben unverändert.",
    "Vorheriges Ereignis",
    "Nächstes Ereignis",
    "Start / Pause",
    "Erlebnis öffnen",
  ],
};
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
export function buildDesignGallery() {
  if (!studyCopy.ru) studyCopy.ru = studyCopy.en;
  const snapshots = JSON.parse(
    fs.readFileSync("dist/data/premium-samples.json", "utf8"),
  );
  fs.copyFileSync("design-preview.js", "dist/design-preview.js");
  for (const [lang, [prefix]] of Object.entries(locales)) {
    const base = "/" + prefix,
      c = themeCopy[lang] || themeCopy.en,
      l = labels[lang] || labels.en,
      source = fs.readFileSync("dist" + base + "index.html", "utf8"),
      header =
        '<header class="topbar">' +
        (source.match(/<a[^>]*class="brand"[^>]*>[\s\S]*?<\/a>/)?.[0] || "") +
        (source.match(/<nav class="site-links"[\s\S]*?<\/nav>/)?.[0] || "") +
        (source.match(
          /<details class="language-menu global-language"[\s\S]*?<\/details>/,
        )?.[0] || "") +
        (source.match(/<details id="appearanceMenu"[\s\S]*?<\/details>/)?.[0] ||
          "") +
        '<span id="appearanceStatus" class="theme-sr" role="status"></span></header>',
      samples = snapshots.filter((s) => s.lang === lang);
    const data = samples.length
      ? samples
      : snapshots.filter((s) => s.lang === "en");
    const target = "dist/__design/" + (prefix || "en/");
    fs.mkdirSync(target, { recursive: true });
    fs.writeFileSync(
      target + "index.html",
      `<!doctype html><html lang="${lang}" data-site-locale="${lang}" data-design-system="1"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><title>${c[14]} · 1in8billion.live</title><script>${fs.readFileSync("theme-init.js", "utf8")};window.ThemeLabels=${JSON.stringify({ copy: c, study: studyCopy[lang] })};</script><link rel="icon" href="/public-assets/icon-96.png"><link rel="stylesheet" href="/theme-system.css"><script type="module" src="/site-theme.js"></script><script type="module" src="/design-preview.js"></script></head><body>${header}<main class="design-gallery"><h1>${c[14]}</h1><p>${l[6]}</p><nav class="design-tabs" aria-label="${c[14]}">${l
        .slice(0, 6)
        .map(
          (label, i) =>
            `<button data-preview-view="${["home", "birth", "life", "ending", "studio", "compare"][i]}" aria-pressed="false">${label}</button>`,
        )
        .join(
          "",
        )}</nav><section class="design-live"><div class="design-controls"><label>${c[7]} <select id="previewSample">${data.map((s, i) => `<option value="${i}">${esc(s.countryName)} · ${esc(s.name)}</option>`).join("")}</select></label><div><button id="previewPrevious">${l[7]}</button><button id="previewPlay">${l[9]}</button><button id="previewNext">${l[8]}</button></div></div><section id="designCanvas" aria-live="polite"></section><a id="openActual" class="primary-link" href="${base}">${l[10]} →</a></section></main><script id="previewRecords" type="application/json">${JSON.stringify({ samples: data, base, labels: l, copy: c, study: studyCopy[lang] }).replaceAll("<", "\\u003c")}</script></body></html>`,
    );
  }
}
