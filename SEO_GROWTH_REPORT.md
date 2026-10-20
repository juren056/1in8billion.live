# SEO growth execution — 20 October 2026

## Scope and baseline

Read the full supplied Markdown execution document and all five workbook sheets, including 75 keyword candidates, the 21 P0 page targets and P1/P2 conditions. Candidate demand is a hypothesis, not validated search volume. Latest origin/main was fetched and matched 18c26818e5e61e0d34c12b131fba5f09076a5b93. Safety branch: codex/baseline-v1.3-before-growth. Existing local historical-report edits and audit artifacts were preserved.

## Stage B: attribution repair

Revision 34285489791c9ecc02a6e02555e6fec9f12beb99 published through the existing Git → Cloudflare Worker pipeline and verified in production release.json. Analytics now preserves six safe UTM labels, with a 100-character limit per label and no duplicate keys, URL punctuation, control characters, unknown queries or fragments. Advertising click IDs were not added: this site has no paid acquisition requirement. No game seed or user record is sent. One config/pageview per document remains.

Node tests and a fresh local Chrome context verify the built config with v2ex/community/launch_oct. The first browser attempt found the preview server stopped; it was restarted and the test passed. Production GA4 backend UTM attribution is separately recorded below; a code/config test is not proof of processed source attribution.

## Stage C: P0-A

52 indexable routes: preserve all 49, add /countries/japan/, /alternatives/1in8b/, /ja/alternatives/. Upgrade English/Japanese/Traditional Chinese home messaging, the existing birth-odds tool, and three quick-play guides. The country calculator uses the shared comparison core, searches all 172 entries, switches annual-birth/population denominators and links to a selected-country start. Static data remains readable without JavaScript. Homepage and directory links lead to the new pages.

Guides use six concrete steps and actual local game screenshots. Country profile includes both normalized shares, exact covered totals, a custom SVG, a real reproducible Japan sample and source links. Alternatives are original comparisons of observed interfaces, clearly separate this independent project from the original and qualify untested checkout/account claims. Review sources: https://1in8b.life/, https://1in8b.app/en/, https://1in8b.net/how-to-play/, https://1in8billion.app/en/how-to-play/. Gamerch and neww direct retrieval failed; their unverified content was not quoted as evidence.

Fix selected-country URL presentation: the engine's chosen country had changed while an already-populated selector retained its old visible value. Explicitly synchronize that selector after setup. No probability, seeded rule, save key or persisted story changes. Visible year/Auto/theme/final-moment controls receive localized presentation labels.

## Latest analytics evidence and response

GA4 property 559735136 was read in the real signed-in Chrome session. Acquisition overview for 22 September–19 October had 0/new users and no source rows; the Today 20 October overview also had no processed source rows. Do not interpret this as zero real visitors. Realtime before this release showed 20 active users/30 minutes, 5/5 minutes, 21 English-home views, 7 Traditional-Chinese-home views, and one each for the Traditional Chinese guides index, comparison and quick-play guide. These rolling-window observations include possible operator visits and are not user/session conversion rates or organic search evidence. Source card had no available data.

Response: preserve attribution; offer clear home → guide/calculator/country/comparison → game paths; strengthen Traditional Chinese onboarding based on observed page visits; preserve existing replay sharing. Do not infer Japan/Korea demand from unavailable query data. Public sharing/OG services and additional P1 routes remain conditional. No forum posts, messages, paid services or scheduled jobs were authorized directly in the chat; prepare promotion copy/UTMs locally rather than silently posting to third-party accounts.

Evidence: audit/growth-ga4-acquisition.jpg, audit/growth-ga4-realtime-before.txt, audit/growth-ga4-realtime-before.jpg. These are private operational evidence and excluded from dist.

## Verification and release log

- Attribution: npm run verify (11 tests at that stage), node tests/utm-browser.cjs.
- P0-A: npm run verify, node tests/growth-browser.cjs, node tests/p1-browser.cjs, node tests/experience-browser.cjs, node tests/release-browser.cjs. 390×844 and 1440px, no-JS static reading, real country starts, mode/search/empty state, unchanged full seeded outcome and all 12 sample digests passed. Screenshots inspected. Tests that capture screenshots require a rebuild afterward.
- All releases retain GA4 default collection, privacy disclosure, Google signals disabled, the same domain/Worker, local saves, offline worker, Replay v1 and inherited input provenance. Sitemap omits lastmod rather than refreshing unchanged dates on every build.

Production acceptance and second-batch results are appended as they are verified. Rollback: revert the corresponding growth commits and push the verified previous tree through the same Git deployment; preserve any unrelated user changes. No new engine/data migration is required.
