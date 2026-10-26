(() => {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll("[data-life-photo-carousel]").forEach((carousel) => {
    const slides = [...carousel.querySelectorAll("[data-life-slide]")];
    const dots = [...carousel.querySelectorAll("[data-life-dot]")];
    const status = carousel.querySelector(".life-photo-status");
    let index = 0;
    let timer = 0;
    let visible = false;
    let interacting = false;
    const show = (next, announce = false) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
      });
      dots.forEach((dot, i) => i === index ? dot.setAttribute("aria-current", "true") : dot.removeAttribute("aria-current"));
      if (announce && status) status.textContent = slides[index].querySelector("strong")?.textContent || "";
    };
    const stop = () => { if (timer) clearInterval(timer); timer = 0; };
    const start = () => {
      stop();
      if (!visible || interacting || document.hidden || reduceMotion.matches || slides.length < 2) return;
      timer = setInterval(() => show(index + 1), 5600);
    };
    carousel.querySelector("[data-life-prev]")?.addEventListener("click", () => { show(index - 1, true); start(); });
    carousel.querySelector("[data-life-next]")?.addEventListener("click", () => { show(index + 1, true); start(); });
    dots.forEach((dot, i) => dot.addEventListener("click", () => { show(i, true); start(); }));
    carousel.addEventListener("pointerenter", () => { interacting = true; stop(); });
    carousel.addEventListener("pointerleave", () => { interacting = false; start(); });
    carousel.addEventListener("focusin", () => { interacting = true; stop(); });
    carousel.addEventListener("focusout", (event) => {
      if (carousel.contains(event.relatedTarget)) return;
      interacting = false;
      start();
    });
    document.addEventListener("visibilitychange", start);
    reduceMotion.addEventListener?.("change", start);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; start(); }, { threshold: .25 }).observe(carousel);
    } else {
      visible = true;
      start();
    }
  });
})();
