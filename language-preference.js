import {
  preferredLocale,
  shouldSkipLanguagePrompt,
} from "./language-preference-core.js";
const storageKey = "1in8b-language-choice-v1";
const text = {
  en: [
    "Your browser uses English. View this page in English?",
    "Switch to English",
    "Not now",
  ],
  ja: [
    "ブラウザの言語は日本語です。日本語で表示しますか？",
    "日本語に切り替える",
    "今はしない",
  ],
  ko: [
    "브라우저 언어가 한국어입니다. 한국어로 볼까요?",
    "한국어로 전환",
    "나중에",
  ],
  "zh-TW": [
    "你的瀏覽器使用繁體中文，要切換成繁體中文嗎？",
    "切換語言",
    "暫時不要",
  ],
  "zh-CN": [
    "你的浏览器使用简体中文，要切换成简体中文吗？",
    "切换语言",
    "暂时不要",
  ],
  es: [
    "Tu navegador usa español. ¿Quieres ver esta página en español?",
    "Cambiar a español",
    "Ahora no",
  ],
  "pt-BR": [
    "Seu navegador usa português. Quer ver esta página em português?",
    "Mudar para português",
    "Agora não",
  ],
  fr: [
    "Votre navigateur est en français. Afficher cette page en français ?",
    "Passer en français",
    "Pas maintenant",
  ],
  de: [
    "Ihr Browser verwendet Deutsch. Diese Seite auf Deutsch anzeigen?",
    "Auf Deutsch wechseln",
    "Nicht jetzt",
  ],
  ru: [
    "Язык вашего браузера — русский. Переключить сайт на русский?",
    "Перейти на русский",
    "Не сейчас",
  ],
};
const stored = () => {
  try {
    return localStorage.getItem(storageKey) || "";
  } catch {
    return "";
  }
};
const remember = (value) => {
  try {
    localStorage.setItem(storageKey, value);
  } catch {}
};
const record = (action, target) =>
  window.siteEvent?.("language_prompt_" + action, { action: target });
export function installLanguagePreference() {
  if (
    shouldSkipLanguagePrompt(location.href) ||
    document.querySelector("[data-language-suggestion],#view-life.active,#view-end.active")
  )
    return;
  const current =
    document.documentElement.dataset.siteLocale ||
    document.documentElement.lang ||
    "en";
  const target = preferredLocale(
    navigator.languages?.length ? navigator.languages : [navigator.language],
    current,
  );
  if (!target || stored()) return;
  const link = document.querySelector(
    `.language-menu a[data-locale="${CSS.escape(target)}"]`,
  );
  if (!link) return;
  const c = text[target],
    bar = document.createElement("section");
  bar.className = "language-suggestion";
  bar.dataset.languageSuggestion = target;
  bar.setAttribute("aria-label", c[0]);
  bar.innerHTML = `<span aria-hidden="true">🌐</span><p>${c[0]}</p><a href="${link.getAttribute("href")}">${c[1]}</a><button type="button">${c[2]}</button>`;
  bar.querySelector("a").addEventListener("click", () => {
    remember("accepted:" + target);
    record("accept", target);
  });
  bar.querySelector("button").addEventListener("click", () => {
    remember("dismissed:" + target);
    record("dismiss", target);
    bar.remove();
  });
  (
    document.querySelector(".topbar") || document.body.firstElementChild
  )?.insertAdjacentElement("afterend", bar);
  record("view", target);
  document.addEventListener("site:task-change", () => {
    if (document.querySelector("#view-life.active,#view-end.active"))
      bar.remove();
  });
  document.addEventListener(
    "click",
    (event) => {
      const manual = event.target.closest?.(".language-menu a[data-locale]");
      if (manual) remember("manual:" + manual.dataset.locale);
    },
    { capture: true },
  );
}
