import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { countryPhotography, lifePhotography, sampleCountryPhotography } from "../content/home-photography.mjs";

const root = new URL("../", import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), "utf8");
const homePrefixes = ["", "zh-cn/", "zh-tw/", "ja/", "ko/", "es/", "pt-br/", "fr/", "de/", "ru/"];

test("homepage photography is real-source, local and complete", () => {
  assert.equal(Object.keys(countryPhotography).length, 12);
  assert.equal(lifePhotography.length, 6);
  assert.equal(Object.keys(sampleCountryPhotography).length, 6);
  const records = [...Object.values(countryPhotography), ...Object.values(sampleCountryPhotography), ...lifePhotography];
  for (const photo of records) {
    assert.match(photo.source, /^https:\/\/www\.pexels\.com\/photo\//);
    assert(photo.photographer);
    const path = new URL(`public-assets/photography/${photo.file}`, root);
    const bytes = fs.readFileSync(path);
    assert(bytes.length > 70_000, `${photo.file} is unexpectedly small`);
    assert.equal(bytes.subarray(4, 8).toString("ascii"), "ftyp", `${photo.file} is not AVIF/ISO media`);
  }
});

test("countries repeated on the homepage use a different real photograph in each section", () => {
  for (const [country, samplePhoto] of Object.entries(sampleCountryPhotography)) {
    assert.notEqual(samplePhoto.file, countryPhotography[country].file, country);
    assert.notEqual(samplePhoto.source, countryPhotography[country].source, country);
  }
});

test("every localized homepage uses landmark photos and the six-moment carousel", () => {
  for (const prefix of homePrefixes) {
    const html = read(`dist/${prefix}index.html`);
    assert.equal((html.match(/data-life-slide/g) || []).length, 6, prefix || "en");
    assert.equal((html.match(/class="sample-scene" src="\/public-assets\/photography\//g) || []).length, 12, prefix || "en");
    assert.equal((html.match(/class="theme-explore"[\s\S]*?<\/section>/)?.[0].match(/\/public-assets\/photography\//g) || []).length, 6, prefix || "en");
    assert(html.includes('<script src="/retention-bootstrap.js" defer></script>'));
    assert(!html.match(/class="theme-explore"[\s\S]*?\/public-assets\/themes\/(?:blue|night|india|china|canada|editorial)-mobile/));
  }
});

test("carousel is accessible, motion-aware and photography is publicly credited", () => {
  const script = read("home-photography.js");
  assert(read("retention-bootstrap.js").includes("import('/home-photography.js')"));
  assert(script.includes("prefers-reduced-motion: reduce"));
  assert(script.includes("IntersectionObserver"));
  assert(script.includes("visibilitychange"));
  const chinese = read("dist/zh-cn/index.html");
  assert(chinese.includes("真实摄影仅用于呈现人生阶段"));
  assert(chinese.includes('aria-roledescription="carousel"'));
  const sources = read("dist/sources/index.html");
  assert(sources.includes('id="photography"'));
  const creditedPhotoCount = Object.keys(countryPhotography).length + Object.keys(sampleCountryPhotography).length + lifePhotography.length;
  assert.equal((sources.match(/pexels\.com\/photo\//g) || []).length, creditedPhotoCount);
});
