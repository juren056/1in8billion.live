(() => {
  const root = document.documentElement;
  if (root.dataset.homePhotographyReady === "true") return;
  root.dataset.homePhotographyReady = "true";
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const mobileImage = matchMedia("(max-width: 760px)");
  const watchVisibility = (node, callback, threshold = .55) => {
    if (!("IntersectionObserver" in window)) return callback(true);
    new IntersectionObserver(([entry]) => callback(entry.isIntersecting && entry.intersectionRatio >= threshold), { threshold: [0, threshold, 1] }).observe(node);
  };

  document.querySelectorAll("[data-theme-memory-card]").forEach((card) => {
    const image = card.querySelector("img");
    const update = () => {
      const theme = root.dataset.appearance || "night";
      const source = card.dataset[`${theme}Src`] || card.dataset.nightSrc;
      if (image && source && image.getAttribute("src") !== source) image.src = source;
    };
    update();
    new MutationObserver(update).observe(root, { attributes: true, attributeFilter: ["data-appearance"] });
  });

  document.querySelectorAll("[data-theme-scenery]").forEach((scenery) => {
    const manifest = window.HomePhotoManifest?.hero || {};
    const layers = [...scenery.querySelectorAll(".theme-scenery-layer")];
    const images = layers.map((layer) => layer.querySelector("img"));
    const ui = scenery.parentElement?.querySelector(".theme-scene-ui");
    const toggle = ui?.querySelector("[data-theme-scene-toggle]");
    const status = ui?.querySelector("[data-theme-scene-status]");
    let index = 0, activeLayer = 0, timer = 0, visible = false, paused = false, request = 0;
    const entries = () => manifest[root.dataset.appearance || "night"] || manifest.night || [];
    const sourceFor = (entry) => mobileImage.matches ? entry?.mobileFile : entry?.file;
    const setStatus = () => { if (status) status.textContent = `${String(index + 1).padStart(2, "0")} / ${String(entries().length).padStart(2, "0")}`; };
    const stop = () => { if (timer) clearInterval(timer); timer = 0; };
    const start = () => {
      stop();
      if (!visible || paused || reduceMotion.matches || document.hidden || entries().length < 2) return;
      timer = setInterval(() => show(index + 1), 6000);
    };
    const show = (next, immediate = false) => {
      const photos = entries();
      if (!photos.length || !layers.length) return;
      index = (next + photos.length) % photos.length;
      const token = ++request;
      const targetLayer = immediate ? activeLayer : 1 - activeLayer;
      const targetImage = images[targetLayer];
      const source = sourceFor(photos[index]);
      const reveal = () => {
        if (token !== request) return;
        layers.forEach((layer, layerIndex) => layer.classList.toggle("is-active", layerIndex === targetLayer));
        activeLayer = targetLayer;
        setStatus();
        const following = photos[(index + 1) % photos.length];
        if (following && "requestIdleCallback" in window) requestIdleCallback(() => { const preload = new Image(); preload.src = sourceFor(following); }, { timeout: 1800 });
      };
      if (!targetImage || !source) return;
      if (targetImage.getAttribute("src") === source) reveal();
      else {
        targetImage.onload = reveal;
        targetImage.src = source;
        if (targetImage.complete) reveal();
      }
    };
    const reset = () => { index = 0; show(0, true); start(); };
    toggle?.addEventListener("click", () => {
      paused = !paused;
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.setAttribute("aria-label", paused ? toggle.dataset.playLabel : toggle.dataset.pauseLabel);
      toggle.querySelector("span").textContent = paused ? "▶" : "Ⅱ";
      start();
    });
    new MutationObserver(reset).observe(root, { attributes: true, attributeFilter: ["data-appearance"] });
    mobileImage.addEventListener?.("change", reset);
    document.addEventListener("visibilitychange", start);
    reduceMotion.addEventListener?.("change", start);
    watchVisibility(scenery, (state) => { visible = state; start(); }, .15);
    show(0, true);
  });

  document.querySelectorAll("[data-reflection-carousel]").forEach((carousel) => {
    const slides = [...carousel.querySelectorAll("[data-reflection-slide]")];
    const dots = [...carousel.querySelectorAll("[data-reflection-dot]")];
    const number = carousel.querySelector("[data-reflection-number]");
    const status = carousel.querySelector("[data-reflection-status]");
    const toggle = carousel.querySelector("[data-reflection-toggle]");
    let index = 0, timer = 0, visible = false, paused = false, pointerStart = null;
    const show = (next, announce = false) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => { const active = i === index; slide.classList.toggle("is-active", active); slide.setAttribute("aria-hidden", String(!active)); });
      dots.forEach((dot, i) => i === index ? dot.setAttribute("aria-current", "true") : dot.removeAttribute("aria-current"));
      if (number) number.textContent = String(index + 1).padStart(2, "0");
      if (announce && status) status.textContent = slides[index]?.querySelector(".reflection-question p")?.textContent || "";
      carousel.style.setProperty("--reflection-progress", "0");
      requestAnimationFrame(() => carousel.style.setProperty("--reflection-progress", "1"));
    };
    const stop = () => { if (timer) clearInterval(timer); timer = 0; };
    const start = () => {
      stop();
      if (!visible || paused || reduceMotion.matches || document.hidden || slides.length < 2) return;
      timer = setInterval(() => show(index + 1), 4500);
    };
    const manual = (next) => { show(next, true); start(); };
    carousel.querySelector("[data-reflection-prev]")?.addEventListener("click", () => manual(index - 1));
    carousel.querySelector("[data-reflection-next]")?.addEventListener("click", () => manual(index + 1));
    dots.forEach((dot, i) => dot.addEventListener("click", () => manual(i)));
    toggle?.addEventListener("click", () => {
      paused = !paused;
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.setAttribute("aria-label", paused ? carousel.dataset.playLabel : carousel.dataset.pauseLabel);
      toggle.querySelector("span").textContent = paused ? "▶" : "Ⅱ";
      start();
    });
    carousel.addEventListener("pointerdown", (event) => { pointerStart = event.clientX; });
    carousel.addEventListener("pointerup", (event) => {
      if (pointerStart == null) return;
      const distance = event.clientX - pointerStart;
      pointerStart = null;
      if (Math.abs(distance) > 44) manual(index + (distance < 0 ? 1 : -1));
    });
    document.addEventListener("visibilitychange", start);
    reduceMotion.addEventListener?.("change", start);
    watchVisibility(carousel, (state) => { visible = state; start(); }, .15);
    show(0);
  });

  document.querySelectorAll("[data-life-photo-carousel]").forEach((carousel) => {
    const slides = [...carousel.querySelectorAll("[data-life-slide]")];
    const dots = [...carousel.querySelectorAll("[data-life-dot]")];
    const status = carousel.querySelector(".life-photo-status");
    let index = 0, timer = 0, visible = false;
    const show = (next, announce = false) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => { const active = i === index; slide.classList.toggle("is-active", active); slide.setAttribute("aria-hidden", String(!active)); });
      dots.forEach((dot, i) => i === index ? dot.setAttribute("aria-current", "true") : dot.removeAttribute("aria-current"));
      if (announce && status) status.textContent = slides[index].querySelector("strong")?.textContent || "";
    };
    const stop = () => { if (timer) clearInterval(timer); timer = 0; };
    const start = () => { stop(); if (visible && !document.hidden && !reduceMotion.matches && slides.length > 1) timer = setInterval(() => show(index + 1), 4500); };
    carousel.querySelector("[data-life-prev]")?.addEventListener("click", () => { show(index - 1, true); start(); });
    carousel.querySelector("[data-life-next]")?.addEventListener("click", () => { show(index + 1, true); start(); });
    dots.forEach((dot, i) => dot.addEventListener("click", () => { show(i, true); start(); }));
    document.addEventListener("visibilitychange", start);
    reduceMotion.addEventListener?.("change", start);
    watchVisibility(carousel, (state) => { visible = state; start(); }, .15);
    show(0);
  });
})();
