from pathlib import Path
import json
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
output = root / "audit" / "home-photography" / "distinct-country-photos.png"
output.parent.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1200}, device_scale_factor=1)
    errors = []
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
    page.goto("http://127.0.0.1:4188/zh-cn/", wait_until="networkidle")
    explore = page.locator(".theme-explore img")
    samples = page.locator(".sample-life .sample-scene")
    explore_srcs = explore.evaluate_all("els => els.map(el => el.getAttribute('src'))")
    sample_srcs = samples.evaluate_all("els => els.map(el => el.getAttribute('src'))")
    sample_ready = samples.evaluate_all("els => els.map(el => ({src: el.getAttribute('src'), complete: el.complete, width: el.naturalWidth, height: el.naturalHeight}))")
    page.locator(".sample-section").scroll_into_view_if_needed()
    page.locator(".sample-section").screenshot(path=str(output))
    print(json.dumps({
        "explore": explore_srcs,
        "samples": sample_srcs,
        "sampleReady": sample_ready,
        "overlap": sorted(set(explore_srcs) & set(sample_srcs)),
        "consoleErrors": errors,
        "screenshot": str(output),
    }, ensure_ascii=False, indent=2))
    browser.close()
