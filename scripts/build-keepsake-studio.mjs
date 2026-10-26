import { commerceCopy } from "../premium-keepsake/commerce-copy.js";
import fs from "node:fs";
import { studioMarkup } from "../premium-keepsake/studio-markup.js";
import { studioCopy } from "../premium-keepsake/template-copy.js";
import { copy } from "../premium-keepsake/translations.js";
const prefixes = {
  en: "",
  ja: "ja/",
  ko: "ko/",
  "zh-TW": "zh-tw/",
  "zh-CN": "zh-cn/",
  es: "es/",
  "pt-BR": "pt-br/",
  fr: "fr/",
  de: "de/",
  ru: "ru/",
};
export function buildKeepsakeStudio() {
  for (const [lang, prefix] of Object.entries(prefixes)) {
    const file = "dist/" + prefix + "keepsake/index.html";
    let html = fs.readFileSync(file, "utf8");
    const title = html.match(/<h1>([\s\S]*?)<\/h1>/)[1];
    let studio = studioMarkup(lang, title);
    if (lang === "ru")
      for (const value of ["Япония", "США", "Индия", "Синий", "Шалфейный", "Янтарный", "/ru/"])
        studio = studio.replace("undefined", value);
    html = html.replace(
      /<section class="product-spread">[\s\S]*?<section><h2>/,
      studio + "<section><h2>",
    );
    html = html.replace(
      "</head>",
      '<link rel="stylesheet" href="/premium-keepsake/studio.css"><script type="module" src="/premium-keepsake/studio.js"></script></head>',
    );
    const native = commerceCopy(lang),
      english = commerceCopy("en");
    for (const key of ["description", "heading", "sales", "storage", "steps"])
      html = html.replaceAll(english[key], native[key]);
    const c = copy[lang] || copy.en,
      faqIds = ["purchase", "page-count", "scope", "free"];
    const faq = `<section class="keepsake-faq" id="keepsake-faq"><h2>${c.faqTitle}</h2>${c.faq.map(([question, answer], index) => `<details open data-keepsake-faq="${faqIds[index]}"><summary>${question}</summary><p>${answer}</p></details>`).join("")}<p>${c.local}</p><p>${c.refund}</p><p>${c.support}: <a href="mailto:support@1in8billion.live">support@1in8billion.live</a></p><p><a href="/sources/">${c.model}</a></p></section>`;
    html = html.replace(
      /<section><h2>[^<]*<\/h2>\s*<details\b[\s\S]*?<\/section>/,
      faq,
    );
    if (!html.includes('data-keepsake-faq="scope"'))
      throw Error("Keepsake FAQ missing " + lang);
    if (!html.includes('id="studioPNG"'))
      throw Error("Keepsake studio missing " + lang);
    fs.writeFileSync(file, html);
  }
}
