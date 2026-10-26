import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import { countryPhotography, lifePhotography, sampleCountryPhotography } from "../content/home-photography.mjs";
import { allHomeExperiencePhotography, reflectionPhotography, themeHeroPhotography, themeMemoryPhotography } from "../content/home-reflection-photography.mjs";

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

test("reflective, memory and themed hero photography is unique, local and source-traceable", () => {
  assert.equal(reflectionPhotography.length, 8);
  assert.deepEqual(Object.values(themeMemoryPhotography).map((items) => items.length), [3, 3, 3, 3]);
  assert.deepEqual(Object.values(themeHeroPhotography).map((items) => items.length), [3, 3, 3, 3]);
  assert.equal(new Set(allHomeExperiencePhotography.map((photo) => photo.file)).size, 32);
  assert.equal(new Set(allHomeExperiencePhotography.map((photo) => photo.source)).size, 32);
  const hashes = [];
  for (const photo of allHomeExperiencePhotography) {
    assert.match(photo.source, /^https:\/\/www\.pexels\.com\/photo\//);
    const bytes = fs.readFileSync(new URL(`public-assets/photography/${photo.file}`, root));
    assert(bytes.length > 12_000, `${photo.file} is unexpectedly small`);
    assert.equal(bytes.subarray(4, 8).toString("ascii"), "ftyp", `${photo.file} is not AVIF/ISO media`);
    hashes.push(crypto.createHash("sha256").update(bytes).digest("hex"));
    if (photo.mobileFile) {
      const mobile = fs.readFileSync(new URL(`public-assets/photography/${photo.mobileFile}`, root));
      assert(mobile.length > 12_000, `${photo.mobileFile} is unexpectedly small`);
      assert.equal(mobile.subarray(4, 8).toString("ascii"), "ftyp", `${photo.mobileFile} is not AVIF/ISO media`);
    }
  }
  assert.equal(new Set(hashes).size, hashes.length, "primary home photographs must not duplicate pixels");
});

test("countries repeated on the homepage use a different real photograph in each section", () => {
  for (const [country, samplePhoto] of Object.entries(sampleCountryPhotography)) {
    assert.notEqual(samplePhoto.file, countryPhotography[country].file, country);
    assert.notEqual(samplePhoto.source, countryPhotography[country].source, country);
  }
});

test("every localized homepage uses real-photo hero, memory, reflection and life carousels", () => {
  for (const prefix of homePrefixes) {
    const html = read(`dist/${prefix}index.html`);
    assert.equal((html.match(/data-life-slide/g) || []).length, 6, prefix || "en");
    assert.equal((html.match(/class="sample-scene" src="\/public-assets\/photography\//g) || []).length, 12, prefix || "en");
    assert.equal((html.match(/class="theme-explore"[\s\S]*?<\/section>/)?.[0].match(/\/public-assets\/photography\//g) || []).length, 6, prefix || "en");
    assert.equal((html.match(/data-reflection-slide/g) || []).length, 8, prefix || "en");
    assert.equal((html.match(/data-theme-memory-card/g) || []).length, 3, prefix || "en");
    assert(html.includes("data-theme-scenery"));
    assert(html.includes("window.HomePhotoManifest"));
    assert(!html.includes("/public-assets/keepsake/thumbnails/"));
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
  assert(script.includes("MutationObserver"));
  assert(script.includes("pointerdown"));
  const chinese = read("dist/zh-cn/index.html");
  assert(chinese.includes("真实摄影仅用于呈现人生阶段"));
  assert(chinese.includes("小时候最想成为的那个人"));
  assert(chinese.includes('aria-roledescription="carousel"'));
  const sources = read("dist/sources/index.html");
  assert(sources.includes('id="photography"'));
  const creditedPhotoCount = Object.keys(countryPhotography).length + Object.keys(sampleCountryPhotography).length + lifePhotography.length + allHomeExperiencePhotography.length;
  assert.equal((sources.match(/pexels\.com\/photo\//g) || []).length, creditedPhotoCount);
});
