export const supportedLocales = [
  "en",
  "ja",
  "ko",
  "zh-TW",
  "zh-CN",
  "es",
  "pt-BR",
  "fr",
  "de",
  "ru",
];
export function localeFromLanguageTag(tag = "") {
  const lower = String(tag).trim().replaceAll("_", "-").toLowerCase();
  if (lower.startsWith("zh-"))
    return /(?:tw|hk|mo|hant)/.test(lower) ? "zh-TW" : "zh-CN";
  if (lower === "zh") return "zh-CN";
  if (lower.startsWith("pt")) return "pt-BR";
  const base = lower.split("-")[0];
  return (
    supportedLocales.find((locale) => locale.toLowerCase() === base) || null
  );
}
export function preferredLocale(languages = [], current = "en") {
  for (const tag of languages) {
    const locale = localeFromLanguageTag(tag);
    if (locale === current) return null;
    if (locale) return locale;
  }
  return null;
}
export function shouldSkipLanguagePrompt(url) {
  const u = url instanceof URL ? url : new URL(url, "https://1in8billion.live");
  return (
    /\/(?:keepsake\/(?:success|cancel)|replay)\//.test(u.pathname) ||
    /^(?:#(?:run|local)=)/.test(u.hash) ||
    u.searchParams.has("replay")
  );
}
