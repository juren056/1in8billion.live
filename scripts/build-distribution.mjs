import fs from "node:fs";
import { countryName } from "./country-identity.mjs";
import { rebirthCopy } from "../rebirth-copy.js";
const countries = JSON.parse(fs.readFileSync("data/countries.json", "utf8")),
  total = countries.reduce((n, c) => n + c.births, 0),
  top = [...countries].sort((a, b) => b.births - a.births).slice(0, 8);
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
export function distributionMarkup(lang, clock) {
  const c = rebirthCopy(lang),
    base = "/" + prefixes[lang],
    share = top.reduce((n, x) => n + x.births / total, 0);
  return `<section class="birth-observatory" aria-labelledby="birthDistributionTitle">${clock}<div class="birth-board"><h2 id="birthDistributionTitle">${c.heading}</h2><div class="birth-columns"><span>${c.share}</span><span>${c.count}</span></div><ol class="birth-ranking">${top.map((row) => `<li><span class="birth-place-actions"><a href="${base}birth-odds/?country=${row.id}" data-country-profile="${row.id}">${countryName(row, lang)}</a><a class="birth-start" title="${c.start}" href="${base}?country=${row.id}" aria-label="${countryName(row, lang)} · ${c.start}">→</a></span><span class="birth-track" aria-hidden="true"><i style="width:${(100 * row.births) / top[0].births}%"></i></span><span class="birth-share">${((100 * row.births) / total).toFixed(1)}%</span><span class="birth-count" data-birth-country="${row.id}">0</span></li>`).join("")}<li class="birth-other"><span>${c.other}</span><span class="birth-track" aria-hidden="true"></span><span class="birth-share">${(100 * (1 - share)).toFixed(1)}%</span><span class="birth-count" data-birth-other>0</span></li></ol><div class="birth-board-footer"><p>${c.note}</p><a href="${base}countries/">${c.all} →</a></div></div></section>`;
}
