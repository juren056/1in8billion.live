from pathlib import Path
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("HOME_REAL_PHOTO_BASE", "http://127.0.0.1:4189/zh-cn/")
OUT = Path("audit/home-photography/browser")
OUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
    errors = []
    page.on("console", lambda msg: errors.append(f"console:{msg.type}:{msg.text}") if msg.type == "error" else None)
    page.on("pageerror", lambda error: errors.append(f"pageerror:{error}"))
    page.goto(BASE, wait_until="networkidle")
    page.locator("[data-theme-scene-image]").first.wait_for(state="visible")
    assert page.locator("[data-theme-memory-card]").count() == 3
    assert page.locator("[data-reflection-slide]").count() == 8
    assert page.locator("[data-reflection-carousel]").get_attribute("aria-label") == "值得带进一生的问题"
    assert "hero-night-" in page.locator("[data-theme-scene-image]").first.get_attribute("src")
    memory_sources = page.locator("[data-theme-memory-card] img").evaluate_all("els => els.map(el => el.getAttribute('src'))")
    assert len(set(memory_sources)) == 3
    page.screenshot(path=str(OUT / "zh-night-desktop.png"), full_page=False)

    for theme in ["blue", "journal", "editorial", "night"]:
        page.evaluate("theme => document.documentElement.dataset.appearance = theme", theme)
        page.wait_for_timeout(450)
        source = page.locator("[data-theme-scene-image]").first.get_attribute("src")
        assert f"hero-{theme}-" in source, (theme, source)
        sources = page.locator("[data-theme-memory-card] img").evaluate_all("els => els.map(el => el.getAttribute('src'))")
        assert len(set(sources)) == 3
        assert all(f"memory-{theme}-" in item for item in sources)
        page.screenshot(path=str(OUT / f"zh-{theme}-desktop.png"), full_page=False)

    reflection = page.locator("[data-reflection-carousel]")
    reflection.scroll_into_view_if_needed()
    before = reflection.locator(".reflection-slide.is-active .reflection-question p").inner_text()
    reflection.locator("[data-reflection-next]").click()
    page.wait_for_timeout(850)
    after = reflection.locator(".reflection-slide.is-active .reflection-question p").inner_text()
    assert before != after
    reflection.locator("[data-reflection-toggle]").click()
    assert reflection.locator("[data-reflection-toggle]").get_attribute("aria-pressed") == "true"
    page.screenshot(path=str(OUT / "zh-reflection-desktop.png"), full_page=False)

    mobile = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
    mobile_errors = []
    mobile.on("console", lambda msg: mobile_errors.append(f"console:{msg.type}:{msg.text}") if msg.type == "error" else None)
    mobile.on("pageerror", lambda error: mobile_errors.append(f"pageerror:{error}"))
    mobile.goto(BASE, wait_until="networkidle")
    mobile.locator("[data-theme-scene-image]").first.wait_for(state="visible")
    assert "-mobile.avif" in mobile.locator("[data-theme-scene-image]").first.get_attribute("src")
    mobile.screenshot(path=str(OUT / "zh-night-mobile.png"), full_page=False)
    mobile.locator("[data-reflection-carousel]").scroll_into_view_if_needed()
    mobile.wait_for_timeout(250)
    mobile.screenshot(path=str(OUT / "zh-reflection-mobile.png"), full_page=False)
    assert not mobile_errors, mobile_errors
    assert not errors, errors
    browser.close()

print("home real-photo experience: browser checks passed")
