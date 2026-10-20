# Retention artwork and music provenance

- life-scene.js: original authored pixel geometry and character drawing, rendered with Canvas. No competitor imagery, character sheet or screenshot is used as an asset. Room objects denote only game milestones; scenes are fictional illustrations, not demographic evidence or specific homes.
- public-assets/life-preview.png: local canvas render of that original scene, saved by tests/retention-browser.cjs. Decorative illustrative preview, not a completed player run.
- life-audio.js: original procedural four-chord ambient composition and optional quiet two-note event cue; generated locally with Web Audio oscillators/envelopes. No external audio recording, sample pack or third-party composition is imported.
- Existing guide screenshots: actual disposable local game sessions. They are product evidence, not AI images, actual users or real biographies.
- Existing brand/icon license and source attribution remain in ATTRIBUTIONS.md and LICENSE. This list does not grant rights to competitor marks or materials.


v1.7 guide captures: public-assets/guide-quick-play-{en,ja,ko,zh-TW}.png and guide-ending-{en,ja,ko,zh-TW}.png are actual 390×844 disposable local sessions, captured by tests/retention-captures.cjs. The ending uses a replay invitation and its actual resulting life. guide-controls.png shows the actual live control surface. PNG metadata records screenshot origin; no image generation prompt is invented for browser captures. Pre-existing globe/icon derivatives retain user-supplied-image attribution; adding origin metadata does not modify their artwork or establish additional rights. The static scene preview derives only from life-scene.js. The runtime downloadable PNG is built locally from the current life and original scene, not a saved visitor photo or public upload.


Round icon revision (2026-10-20): public-assets/brand.svg and icon-master.svg extend the existing authored SVG globe-and-1 identity with a circular navy field and transparent exterior. PNG sizes16/32/48/64/96/128/180/192/256/512/1024 are deterministic browser Canvas rasterizations of that vector, via scripts/render-icons.cjs. favicon.ico is a seven-frame format conversion (16 through256) of those same vector-derived pixels. No raster clipping, competitor artwork or new AI image is used. Previously supplied raster icon art is superseded for icon files; the existing social preview retains its earlier attribution.
