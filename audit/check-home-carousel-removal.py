from pathlib import Path
from playwright.sync_api import sync_playwright


BASE = "http://127.0.0.1:4186/zh-cn/"
OUT = Path("audit/home-carousel-1.31.2")
OUT.mkdir(parents=True, exist_ok=True)


def active_life_slide(page):
    return page.evaluate("""() => {
        const slides = [...document.querySelectorAll('[data-life-slide]')];
        return slides.findIndex((slide) => slide.classList.contains('is-active'));
    }""")


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 1000})
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.route("**/*google-analytics.com/**", lambda route: route.fulfill(status=204, body=""))
    page.route("**/*googletagmanager.com/**", lambda route: route.fulfill(status=204, body=""))
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_function("document.documentElement.dataset.homePhotographyReady === 'true'")

    assert page.locator("[data-product-answers]").count() == 0
    assert page.locator(".local-collection").count() == 0
    assert page.locator("#localCollection").count() == 0

    hero_status = page.locator("[data-theme-scene-status]")
    hero_before = hero_status.inner_text()
    page.wait_for_timeout(6700)
    hero_after = hero_status.inner_text()
    assert hero_after != hero_before, (hero_before, hero_after)

    reflection = page.locator("[data-reflection-carousel]")
    reflection.scroll_into_view_if_needed()
    reflection_before = page.locator("[data-reflection-number]").inner_text()
    page.wait_for_timeout(5200)
    reflection_after = page.locator("[data-reflection-number]").inner_text()
    assert reflection_after != reflection_before, (reflection_before, reflection_after)

    page.locator("[data-reflection-toggle]").click()
    paused_at = page.locator("[data-reflection-number]").inner_text()
    page.wait_for_timeout(5200)
    assert page.locator("[data-reflection-number]").inner_text() == paused_at
    page.locator("[data-reflection-toggle]").click()

    life = page.locator("[data-life-photo-carousel]")
    life.scroll_into_view_if_needed()
    life_before = active_life_slide(page)
    page.wait_for_timeout(5200)
    life_after = active_life_slide(page)
    assert life_after != life_before, (life_before, life_after)

    assert not errors, errors
    page.screenshot(path=str(OUT / "zh-cn-desktop.png"), full_page=True)
    context.close()

    mobile = browser.new_context(viewport={"width": 390, "height": 844})
    mobile_page = mobile.new_page()
    mobile_errors = []
    mobile_page.on("pageerror", lambda error: mobile_errors.append(str(error)))
    mobile_page.goto(BASE, wait_until="networkidle")
    mobile_page.wait_for_function("document.documentElement.dataset.homePhotographyReady === 'true'")
    assert mobile_page.locator("[data-product-answers], .local-collection, #localCollection").count() == 0
    assert mobile_page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    assert not mobile_errors, mobile_errors
    mobile_page.screenshot(path=str(OUT / "zh-cn-mobile.png"), full_page=True)
    mobile.close()
    browser.close()

print({
    "removedSections": True,
    "heroAutoplay": [hero_before, hero_after],
    "reflectionAutoplay": [reflection_before, reflection_after],
    "reflectionPause": paused_at,
    "lifeAutoplay": [life_before, life_after],
    "consoleErrors": 0,
})
