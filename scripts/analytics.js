// Only coarse parameters; never names, story text, seeds, notes or family records.
window.siteEvent = function (name, parameters = {}) {
  const safe = {};
  for (const key of [
    "play_mode",
    "mode",
    "action",
    "page_type",
    "run_type",
    "metric_name",
    "metric_rating",
  ])
    if (typeof parameters[key] === "string")
      safe[key] = parameters[key].slice(0, 32);
  const locale = document.documentElement?.dataset?.siteLocale;
  if (
    ["en", "ja", "ko", "zh-TW", "zh-CN", "es", "pt-BR", "fr", "de", "ru"].includes(
      locale,
    )
  )
    safe.site_language = locale;
  if (typeof window.SITE_RELEASE === "string")
    safe.release = window.SITE_RELEASE;
  if (name === "web_vital")
    for (const key of ["metric_value", "metric_delta"])
      if (Number.isFinite(parameters[key]) && Math.abs(parameters[key]) < 1e7)
        safe[key] = parameters[key];
  if (window.gtag) gtag("event", name, safe);
};
function analyticsStart() {
  if (!window.GA4_ID || window.gtag) return;
  window["ga-disable-" + window.GA4_ID] = false;
  window.dataLayer = [];
  window.gtag = function () {
    dataLayer.push(arguments);
  };
  gtag("js", new Date());
  gtag("config", window.GA4_ID, {
    page_location: safeAnalyticsUrl(location.href),
    send_page_view: true,
    allow_google_signals: false,
    debug_mode:
      new URLSearchParams(location.search).get("analytics_debug") === "1",
  });
  const home = /^\/(?:ja\/|ko\/|zh-tw\/|zh-cn\/|es\/|pt-br\/|fr\/|de\/|ru\/)?$/.test(
    location.pathname,
  );
  siteEvent(home ? "home_view" : "content_view", {
    language: document.documentElement.lang,
    page_type: home
      ? "game"
      : location.pathname.includes("/keepsake/")
        ? "keepsake"
        : location.pathname.includes("/compare/")
          ? "compare"
          : "content",
  });
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + window.GA4_ID;
  document.head.append(s);
}
if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", analyticsStart, { once: true });
else analyticsStart();

// Coarse internal navigation measures the content-to-play path without sending URLs.
document.addEventListener("click", (event) => {
  const link = event.target.closest?.("a[href]");
  if (!link) return;
  const target = new URL(link.href, location.origin);
  if (target.origin !== location.origin) return;
  const kind = (path) =>
    /^\/(?:ja\/|ko\/|zh-tw\/|zh-cn\/|es\/|pt-br\/|fr\/|de\/|ru\/)?$/.test(path)
      ? "game"
      : path.includes("/keepsake/")
        ? "keepsake"
        : path.includes("/compare/")
          ? "compare"
          : path.includes("/countries/")
            ? "country"
            : path.includes("/birth-odds/")
              ? "calculator"
              : path.includes("/alternatives/")
                ? "alternatives"
                : path.includes("/guides/")
                  ? "guide"
                  : "content";
  const from = kind(location.pathname),
    to = kind(target.pathname);
  if (from !== to)
    siteEvent(to === "game" ? "content_game_click" : "explore_click", {
      page_type: from,
      action: to,
      language: document.documentElement.lang,
    });
});
