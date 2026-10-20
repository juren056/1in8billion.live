# P1 delivery — 2026-10-20

## Scope and competitor observations

Country comparisons, reproducible automatic-life links and useful long-tail guides. Preserve existing URLs, local saves and user-requested default GA4 collection. No accounts, public UGC, payments or monetization experiments.

- https://1in8b.app/en/ : connected country directory and mechanism explanations → direct country-play links and clear denominators.
- https://1in8billion.app/ : Japanese setup, continuation and weight-mode explanation → localized comparison tools and practical guides.
- https://1in8billion.org/ : immediate browser game and visible controls → preserve the complete free game as the main task.
- https://in8b.com/ : compact durations, comparative weights and model limitations → exchangeable country columns, comparison links and honest source disclosure.
- https://1in8b.life/ and https://1in8b.net/ : complete life and local histories → preserve the lifecycle and improve the end view; do not copy prose or artwork.
- https://1injp.satoru.net/ : regional narrative → future localization inspiration, without importing its historical dataset.

Public HTML read on 2026-10-20. No competitor code/media copied. These are observations, not statistical-accuracy or traffic validation. Visual design preserves navy, cyan and light blue, system text and Georgia headings; numeric comparisons use real tables and responsive controls.

## Routes and data

- /compare/, /ja/compare/, /ko/compare/, /zh-tw/compare/
- /compare/japan-vs-united-states/, /compare/south-korea-vs-japan/, /compare/india-vs-united-states/
- /guides/ and four guides: quick-play/, birth-share-vs-population-share/, replay-links/, choosing-a-life-simulator/

33 canonical indexable pages total. Raw HTML, unique metadata/H1, internal links, canonical, OG and sitemap; reciprocal hreflang on corresponding comparison tools. Parameter selections and replay fragments excluded from sitemap.

Inherited observations lack verified years. Official World Bank endpoints were attempted again but inaccessible. All comparison inputs are labelled game estimates. No unsupported official country fact pages were generated. GSC has insufficient history for query-driven expansion; these pages address user tasks rather than claimed search-volume winners.

## Reproducible sharing

Existing engine retained. replay-core.js supplies seeded streams and a strict v1 parser. p1-game.js isolates birth/year randomness from rendering. Replay v1 fixes choices to Auto; manual changes invalidate eligibility. Links contain only version, seed, country, era, language and education setting, excluding names, notes, family imports and localStorage records.

Opening a link first presents an invitation. Unknown versions fail clearly. Resumed runs and legacy saves still work but cannot be shared reproducibly because their transient decision state is not fully serialized. Future rules/data changes must version the contract or preserve v1 behavior. Historical/future era settings remain fictional, not calibrated historical datasets. Manual-choice transcripts, cross-version migration and personalized server OG remain future work.

## Verification

- npm run verify passed: 33 pages, 172-country weights, metadata, links, hreflang targets, 404 noindex, actual sampler boundaries, PRNG range/repeatability and malformed replay input rejection.
- Actual engine in independent Chrome contexts at 360/1440px, with extra renders: identical name, states, full log and ending at age102.
- Additional actual-engine fixtures: KOR/Japanese/past/education age87; IND/English/future age86; USA/Korean/now age87. Each identical across fresh contexts.
- Real Quick play → natural result → clipboard replay link passed.
- Comparison mode switch, swap and 375px overflow passed; screenshot audit/p1-compare-mobile.png.
- Fixed end-view visibility so results and replay controls are accessible. GA4 remains enabled by default; no consent UI reintroduced.

## Release

Pending Git automatic release and production checks. Final results will be appended locally without a report-only production build.
